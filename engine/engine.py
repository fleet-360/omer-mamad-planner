"""OREN prototype engine.

Reads Oren Skurnik's Omer markups (PDF annotations) on mamad plans, re-derives each
placement from the drawing geometry (scale, wall face, reference corner, distance),
re-draws it in the same annotation style, and reports how well geometry and notes agree.

Oren's markup grammar (seen on all samples):
  - a plain red line = the Omer pipe crossing the mamad wall (so the wall is perpendicular to it)
  - a red arrow pointing at that line = "here", the Omer centre
  - a FreeText note = the rule: distance from a reference corner (or "facing the centre of the
    perpendicular block wall"), height H below the ceiling, gas/drain routing

usage: python engine.py <plans_dir> <out_dir>
"""
import glob
import os
import re
import sys
from collections import Counter

import fitz
import numpy as np

K_1_50 = 72 / 2.54 / 50  # pt per real cm on a true-size 1:50 plot
RED = (0.898, 0.133, 0.216)
TOL_CM = 10  # ponytail: fixed match tolerance; make it scale/precision aware if plans get noisier
AUTHOR = "OREN engine"


# ---------- reading the drawing ----------

def segments(page):
    """Axis-aligned segments of the vector drawing as rows [x0, y0, x1, y1] (x0<=x1, y0<=y1)."""
    out = []
    for d in page.get_drawings():
        for it in d["items"]:
            if it[0] == "l":
                pairs = [(it[1], it[2])]
            elif it[0] == "re":
                r = it[1]
                pairs = [(r.tl, r.tr), (r.tr, r.br), (r.br, r.bl), (r.bl, r.tl)]
            else:
                continue
            for a, b in pairs:
                if abs(a.x - b.x) < 0.3 or abs(a.y - b.y) < 0.3:
                    out.append((min(a.x, b.x), min(a.y, b.y), max(a.x, b.x), max(a.y, b.y)))
    return np.array(out) if out else np.zeros((0, 4))


def _merge(segs, gap=1.5):
    """Join collinear pieces: some exports break every wall line into tiny fragments."""
    rows = []
    for horizontal in (True, False):
        m = (segs[:, 3] - segs[:, 1] < 0.3) if horizontal else (segs[:, 2] - segs[:, 0] < 0.3)
        s = segs[m]
        line, lo, hi = (s[:, 1], s[:, 0], s[:, 2]) if horizontal else (s[:, 0], s[:, 1], s[:, 3])
        line = np.round(line, 1)
        order = np.lexsort((lo, line))
        runs, cur = [], None
        for c, a, b in zip(line[order], lo[order], hi[order]):
            if cur and c == cur[0] and a <= cur[2] + gap:
                cur[2] = max(cur[2], b)
            else:
                cur = [c, a, b]
                runs.append(cur)
        rows += [(a, c, b, c) if horizontal else (c, a, c, b) for c, a, b in runs]
    return np.array(rows) if rows else np.zeros((0, 4))


def calibrate(page, segs, near=None, radius=900):
    """pt per real cm, voted from dimension texts: a number sits just above a horizontal line
    whose length is number*k. Votes are taken near `near` first (sheets can mix 1:50 and 1:100).
    `segs` must be the raw (unmerged) segments: chained dimensions are collinear."""
    hz = segs[(segs[:, 3] - segs[:, 1]) < 0.3]
    votes = []
    for x0, y0, x1, y1, w, *_ in page.get_text("words"):
        if not re.fullmatch(r"\d{2,4}", w) or not 20 <= int(w) <= 2000:
            continue
        cx, cy, h = (x0 + x1) / 2, (y0 + y1) / 2, y1 - y0
        if near is not None and abs(cx - near.x) + abs(cy - near.y) > radius:
            continue
        below = hz[:, 1] - cy
        m = (np.abs((hz[:, 0] + hz[:, 2]) / 2 - cx) < h) & (below > 0) & (below < 2.5 * h) & (hz[:, 2] - hz[:, 0] > h)
        if m.any():
            s = hz[m][np.argmin(hz[m, 1])]
            votes.append(round((s[2] - s[0]) / int(w), 3))
    if votes:
        k, n = Counter(votes).most_common(1)[0]
        if n >= 8:
            return k, f"auto ({n} cotes)"
    if near is not None:
        return calibrate(page, segs)
    # ponytail: text-less plans (AutoCAD SHX fonts) fall back to a true-size 1:50 plot;
    # the MVP replaces this with a 2-click calibration on a known dimension
    return K_1_50, "supposée 1:50"


def wall_faces(segs, k, horizontal, a, lo, hi, slack_cm=20):
    """Constant coordinate of wall-face lines (>=30 cm) of the given orientation that lie in
    [lo, hi] across the wall and reach position `a` along it (hand-placed marks: +-slack_cm)."""
    s = slack_cm * k
    if horizontal:
        m = ((segs[:, 3] - segs[:, 1]) < 0.3) & (segs[:, 2] - segs[:, 0] > 30 * k) \
            & (segs[:, 0] <= a + s) & (segs[:, 2] >= a - s) & (segs[:, 1] >= lo) & (segs[:, 1] <= hi)
        return np.unique(np.round(segs[m, 1], 1))
    m = ((segs[:, 2] - segs[:, 0]) < 0.3) & (segs[:, 3] - segs[:, 1] > 30 * k) \
        & (segs[:, 1] <= a + s) & (segs[:, 3] >= a - s) & (segs[:, 0] >= lo) & (segs[:, 0] <= hi)
    return np.unique(np.round(segs[m, 0], 1))


def face_runs(segs, c, horizontal):
    """Pieces [lo, hi] of the face line at coordinate c (segments already merged), sorted.
    A run ends at a room corner, a door/window jamb, or where a perpendicular wall joins."""
    if horizontal:
        m = ((segs[:, 3] - segs[:, 1]) < 0.3) & (np.abs(segs[:, 1] - c) < 0.15)
        runs = segs[m][:, [0, 2]]
    else:
        m = ((segs[:, 2] - segs[:, 0]) < 0.3) & (np.abs(segs[:, 0] - c) < 0.15)
        runs = segs[m][:, [1, 3]]
    return runs[np.argsort(runs[:, 0])]


# ---------- Oren's notes ----------

def parse_note(text):
    """Structured rule from an Omer note: distance from a reference corner (mode 'distance'),
    or facing the centre of a perpendicular block wall (mode 'center'), height, routing."""
    t = text.replace("\r", "\n")
    r = {"mode": None, "dist_cm": None, "ref": None, "h_cm": None, "h_floor_cm": None,
         "route": [ln.strip() for ln in t.split("\n") if "הולכת" in ln or "צנרת" in ln]}
    m = re.search(r'כ-\s*(\d+(?:\.\d+)?)\s*(?:מטר\S*|ס"מ)?\s*מפינת\s+([^\n.]+)', t)
    if m:
        v = float(m.group(1))
        r["mode"], r["dist_cm"] = "distance", round(v * 100) if v < 10 else round(v)
        r["ref"] = m.group(2).split("H")[0].strip()
    else:
        m = re.search(r"((?:מול\s+)?[מנ]רכז קיר[^\n]*|מול[^\n]*|בהצבה[^\n]*)", t)
        r["ref"] = m.group(1).strip() if m else None
        if r["ref"] and "קיר" in r["ref"]:
            r["mode"] = "center"
    m = (re.search(r'(?:H|=)\s*=?\s*(?:-|מינוס)\s*-?\s*(\d+)', t)
         or re.search(r'מינוס\s*(\d+)\s*ס"מ', t)
         or re.search(r'כ-\s*(\d+)\s*ס"מ\s*מתקרה', t))
    if m:
        r["h_cm"] = -int(m.group(1))
    m = re.search(r"H\s*=\s*(\d\.\d+)", t)
    if m and r["h_cm"] is None:
        r["h_floor_cm"] = round(float(m.group(1)) * 100)
    return r


def note_text(rule):
    """Hebrew execution note generated from a rule (Oren's wording)."""
    lines = []
    d = rule["dist_cm"]
    if d is not None:
        dist = f"{d / 100:.2f} מטר" if d >= 100 else f'{d} ס"מ'
        lines.append(f"למקם מרכז צינור עומר כ- {dist} מפינת {rule['ref']}")
    elif rule["mode"] == "center":
        lines.append("למקם מרכז צינור עומר מול מרכז קיר בלוק ניצב")
    elif rule["ref"]:
        lines.append(f"למקם מרכז צינור עומר {rule['ref']}")
    if rule["h_cm"] is not None:
        lines.append(f'H = מינוס {-rule["h_cm"]} ס"מ מתחתית תקרה למרכז עומר')
    elif rule["h_floor_cm"] is not None:
        lines.append(f"H = {rule['h_floor_cm'] / 100:.2f}")
    lines += rule["route"]  # ponytail: routing copied verbatim; MVP turns it into a pick-list
    return lines


# ---------- Oren's markup ----------

def _dist(p, r):
    return float(np.hypot(max(r.x0 - p.x, 0, p.x - r.x1), max(r.y0 - p.y, 0, p.y - r.y1)))


def _is_red(c):
    return bool(c) and c[0] > 0.8 and c[1] < 0.3 and c[2] < 0.3


def oren_marks(page):
    """Omer marks: a red arrow whose tip is the Omer centre, the red pipe line it points at (if
    any), and the nearest Omer note (notes are not always connected to their arrow). Other colours
    are other devices (purple = 4" air release, green = cable / 'same as')."""
    notes, arrows, pipes = [], [], []
    for a in page.annots():
        t, c, v = a.type[1], a.colors.get("stroke"), a.vertices
        if t == "FreeText" and "עומר" in (a.info["content"] or ""):
            notes.append((a.rect, a.info["content"]))
        elif t == "Line" and v and _is_red(c):
            p, q = fitz.Point(v[0]), fitz.Point(v[-1])
            if a.line_ends == (0, 0):
                pipes.append((p, q))
            else:
                arrows.append((q, p) if a.line_ends[1] else (p, q))  # (tip, tail)
    marks = []
    for tip, tail in arrows:
        if not notes:
            break
        rect, txt = min(notes, key=lambda n: min(_dist(tip, n[0]), _dist(tail, n[0])))
        pipe = min(pipes, key=lambda s: _dist(tip, fitz.Rect(s[0], s[1]).normalize()), default=None)
        if pipe and _dist(tip, fitz.Rect(pipe[0], pipe[1]).normalize()) > 12:
            pipe = None
        marks.append({"tip": tip, "tail": tail, "note": txt, "note_rect": rect, "pipe": pipe, "len": abs(tail - tip)})
    # a long leader from a note and a short arrow on the wall can point at the same Omer: keep the short one
    marks.sort(key=lambda m: m["len"])
    kept = []
    for m in marks:
        if not any(m["note"] == k["note"] and abs(m["tip"] - k["tip"]) < 60 for k in kept):
            kept.append(m)
    return kept, len(notes)


def wall_frame(m, k, reach_cm=30):
    """(wall_is_horizontal, a, lo, hi): position `a` along the wall where Oren put the Omer, and
    the band [lo, hi] across the wall in which to look for its faces."""
    if m["pipe"]:
        p, q = m["pipe"]
        pipe_h = abs(q.x - p.x) >= abs(q.y - p.y)
        if pipe_h:  # horizontal pipe crosses a vertical wall
            return False, (p.y + q.y) / 2, min(p.x, q.x), max(p.x, q.x)
        return True, (p.x + q.x) / 2, min(p.y, q.y), max(p.y, q.y)
    d, t, r = m["tail"] - m["tip"], m["tip"], reach_cm * k
    if abs(d.y) >= abs(d.x):  # no pipe line: a mostly vertical arrow lands on a horizontal face
        return True, t.x, t.y - r, t.y + r
    return False, t.y, t.x - r, t.x + r


# ---------- placement ----------

def place(segs, k, frame, rule):
    """Where the rule puts the Omer centre on the wall, choosing the face/reference that best
    explains Oren's mark. Returns (point, measured_cm, error_cm) or None.
    measured = distance tip->reference (distance mode) or tip->wall centre (center mode)."""
    horizontal, a, lo, hi = frame
    best = None
    for c in wall_faces(segs, k, horizontal, a, lo, hi):
        runs = face_runs(segs, c, horizontal)
        if rule["mode"] == "distance":  # references = ends of the face line (corners, jambs)
            refs = [e for e in runs.ravel() if abs(e - a) < 400 * k]
            cands = [(ref + np.sign(a - ref) * rule["dist_cm"] * k, abs(a - ref) / k) for ref in refs]
            cands = [(pos, meas, abs(meas - rule["dist_cm"])) for pos, meas in cands]
        else:  # a 7-25 cm break in the face line = a perpendicular block wall joining it
            mids = [(runs[i, 1] + runs[i + 1, 0]) / 2 for i in range(len(runs) - 1)
                    if 7 * k <= runs[i + 1, 0] - runs[i, 1] <= 25 * k]
            cands = [(mid, abs(a - mid) / k, abs(a - mid) / k) for mid in mids]
        for pos, meas, err in cands:
            if best is None or err < best[2]:
                best = (fitz.Point(pos, c) if horizontal else fitz.Point(c, pos), meas, err)
    return best


def chance(segs, k, frame, rule):
    """Share of arbitrary rules that would also 'match' this mark (10-200 cm, or the mark shifted
    +-150 cm for centre rules). High = the geometry match proves nothing for this mark."""
    if rule["mode"] == "distance":
        trials = [place(segs, k, frame, dict(rule, dist_cm=d)) for d in range(10, 201, 5)]
    else:
        h, a, lo, hi = frame
        trials = [place(segs, k, (h, a + o * k, lo, hi), rule) for o in range(-150, 151, 10)]
    return sum(t is not None and t[2] <= TOL_CM for t in trials) / len(trials)


def annotate(page, pt, tail, wall_horizontal, lines, k, where):
    """Oren's style: red pipe line across the wall, red arrow onto the Omer centre, boxed note at `where`
    (top-left of the note; in the MVP the user drags it, here it reuses Oren's spot)."""
    half = 50 * k
    a, b = (pt - (0, half), pt + (0, half)) if wall_horizontal else (pt - (half, 0), pt + (half, 0))
    for annot in (page.add_line_annot(a, b), page.add_line_annot(tail, pt)):
        annot.set_colors(stroke=RED)
        annot.set_border(width=2)
        annot.set_info(title=AUTHOR)
        annot.update()
    annot.set_line_ends(fitz.PDF_ANNOT_LE_NONE, fitz.PDF_ANNOT_LE_CLOSED_ARROW)
    annot.update()
    box = fitz.Rect(where.x, where.y, where.x + 180, where.y + 26 * len(lines) + 10)
    html = "".join(f'<p dir="rtl" style="font-family:Arial;color:#e52237;font-size:8pt;margin:0 0 3pt 0">{ln}</p>'
                   for ln in lines)
    note = page.add_freetext_annot(box, html, richtext=True, fill_color=(1, 1, 1), border_width=1)
    note.set_info(title=AUTHOR)
    note.update()


# ---------- batch over the sample plans ----------

def run(plans_dir, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    rows, compare, n_notes = [], fitz.open(), 0
    for path in sorted(glob.glob(os.path.join(plans_dir, "*.pdf"))):
        name = os.path.basename(path)
        src = fitz.open(path)
        ours = fitz.open(path)
        for pno in range(len(src)):
            page, out = src[pno], ours[pno]
            marks, n = oren_marks(page)
            n_notes += n
            if not marks:
                continue
            raw = segments(page)
            segs = _merge(raw)  # walls need joined lines, dimension voting needs the raw pieces
            for an in list(out.annots()):  # clean copy: drop Oren's markup, keep the architect's drawing
                if an.info.get("title") == "oren skurnik" or an.type[1] in ("FreeText", "Line"):
                    out.delete_annot(an)
            for i, m in enumerate(marks):
                rule = parse_note(m["note"])
                k, how = calibrate(page, raw, near=m["tip"])
                frame = wall_frame(m, k)
                row = {"plan": name, "page": pno + 1, "mark": i + 1, "rule": rule, "scale": how,
                       "pipe": bool(m["pipe"]), "status": "", "measured": None, "err": None, "chance": None}
                res = place(segs, k, frame, rule) if rule["mode"] else None
                if not rule["mode"]:
                    row["status"] = "règle non géométrique"
                elif res is None:
                    row["status"] = "mur non trouvé"
                else:
                    pt, row["measured"], row["err"] = res
                    row["status"] = "OK" if row["err"] <= TOL_CM else "écart"
                    row["chance"] = chance(segs, k, frame, rule)
                    annotate(out, pt, pt + (m["tail"] - m["tip"]), frame[0], note_text(rule), k, m["note_rect"].tl)
                rows.append(row)
                _compare_page(compare, src, ours, pno, m["tip"], k, row)
        ours.save(os.path.join(out_dir, "OREN_" + name))
    compare.save(os.path.join(out_dir, "comparaison.pdf"))
    _report(rows, n_notes, os.path.join(out_dir, "rapport.md"))
    return rows


def _compare_page(compare, src, ours, pno, tip, k, row):
    """One page per mark: Oren's markup (left) vs the engine's (right), same clip."""
    r = 220 * k
    clip = fitz.Rect(tip.x - r, tip.y - r, tip.x + r, tip.y + r) & src[pno].rect
    pg = compare.new_page(width=842, height=460)
    for i, doc in enumerate((src, ours)):
        tmp = fitz.open()
        tmp.insert_pdf(doc, from_page=pno, to_page=pno)
        tmp.bake()  # annotations -> page content so show_pdf_page carries them
        pg.show_pdf_page(fitz.Rect(10 + i * 416, 40, 416 + i * 416, 450), tmp, 0, clip=clip)
    ru = row["rule"]
    cap = (f"{row['plan']} p{row['page']} #{row['mark']}  |  regle: {ru['mode']} {ru['dist_cm'] or ''} H={ru['h_cm']}  |  "
           f"echelle: {row['scale']}  |  mesure: {row['measured'] and round(row['measured'])} cm  |  {row['status']}")
    pg.insert_text((10, 18), "Oren (gauche)  vs  moteur OREN (droite)", fontsize=10)
    pg.insert_htmlbox(fitz.Rect(10, 22, 832, 40), f'<p style="font-family:Arial;font-size:7pt">{cap}</p>')


def _report(rows, n_notes, path):
    geo = [r for r in rows if r["rule"]["mode"]]
    ok = sum(r["status"] == "OK" for r in rows)
    lines = ["# OREN, prototype du moteur : rapport", "",
             f"{n_notes} notes Omer, {len(rows)} flèches Omer lues ; {len(geo)} avec une règle géométrique "
             f"(distance à un coin, ou face au centre d'un mur) ; {ok} retrouvées sur le plan à ±{TOL_CM} cm.", "",
             "« Mesuré » = distance de la pointe d'Oren au coin de référence (règle distance), "
             "ou écart entre sa pointe et l'axe du mur perpendiculaire (règle centre).", "",
             "« Hasard » = part de règles quelconques qui « tomberaient juste » aussi sur cette marque. "
             f"Moyenne : {np.mean([r['chance'] for r in rows if r['chance'] is not None]) * 100:.0f} %. "
             "Tant qu'il est élevé, le coin de référence ne peut pas être choisi automatiquement : "
             "l'utilisateur le désigne d'un clic (le moteur fait le reste).", "",
             "| Plan | Marque | Règle (note d'Oren) | H | Échelle | Tuyau tracé | Mesuré | Écart | Statut | Hasard |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    for r in rows:
        ru = r["rule"]
        if ru["mode"] == "distance":
            regle = f"{ru['dist_cm']} cm de « {ru['ref']} »"
        elif ru["mode"] == "center":
            regle = "face au centre du mur en blocs perpendiculaire"
        else:
            regle = f"« {ru['ref'] or 'distance à définir par l’architecte'} »"
        h = ru["h_cm"] if ru["h_cm"] is not None else (f"{ru['h_floor_cm']} du sol" if ru["h_floor_cm"] else "?")
        mes = f"{r['measured']:.0f} cm" if r["measured"] is not None else "—"
        err = f"{r['err']:.0f} cm" if r["err"] is not None else "—"
        hasard = f"{r['chance'] * 100:.0f} %" if r["chance"] is not None else "—"
        lines.append(f"| {r['plan'][:40]} | p{r['page']} #{r['mark']} | {regle} | {h} | {r['scale']} | "
                     f"{'oui' if r['pipe'] else 'non'} | {mes} | {err} | {r['status']} | {hasard} |")
    open(path, "w", encoding="utf-8").write("\n".join(lines) + "\n")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    rows = run(sys.argv[1], sys.argv[2])
    print(sum(r["status"] == "OK" for r in rows), "/", len(rows), "marques retrouvées")
