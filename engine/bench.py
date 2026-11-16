"""Benchmark for automatic Omer placement, measured against Oren Skurnik's own marks.

Ground truth = the rectangle Oren draws on the mamad wall where the Omer goes (his arrow tip is
often elsewhere). For each one the bench finds the mamad around it, hides Oren's choice, proposes
positions on the mamad walls, and checks the best one against his.

    python bench.py <plans_dir> <out_dir>      -> out_dir/bench.md + check sheets
"""
import glob
import json
import os
import re
import sys

import fitz
import numpy as np

import engine as e

def is_mamad_label(t):
    """PDF text splits ממ"ד into 'ממ' + 'ד' and מרחב מוגן into two words."""
    t = t.strip()
    return t in ("ממ", "ממד", "מוגן") or t.startswith(("ממ\"", "ממ״"))


# ---------- ground truth ----------

def omer_boxes(page):
    """Oren's Omer rectangles: (centre, wall_is_horizontal). Too square = not an Omer box."""
    out = []
    for a in page.annots():
        if a.type[1] != "Square" or a.info.get("title") == "AutoCAD SHX Text":
            continue
        r = a.rect
        long_, short = max(r.width, r.height), min(r.width, r.height)
        if short and long_ / short >= 1.8:
            out.append((fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2), r.width > r.height))
    return out


def texts(page):
    """(rect, text) of every word: real PDF text plus Acrobat's recognised SHX text."""
    words = [(fitz.Rect(w[:4]), w[4]) for w in page.get_text("words")]
    words += [(a.rect, a.info.get("content", "")) for a in page.annots() if a.info.get("title") == "AutoCAD SHX Text"]
    return words


# ---------- the mamad around a box ----------

CM_PER_PX = 2  # raster resolution used to find walls


def _shift_max(a, r, axis):
    out = a.copy()
    for i in range(1, r + 1):
        out[tuple(slice(i, None) if ax == axis else slice(None) for ax in range(2))] |= a[tuple(slice(None, -i) if ax == axis else slice(None) for ax in range(2))]
        out[tuple(slice(None, -i) if ax == axis else slice(None) for ax in range(2))] |= a[tuple(slice(i, None) if ax == axis else slice(None) for ax in range(2))]
    return out


def _dilate(a, r):
    return _shift_max(_shift_max(a, r, 0), r, 1)


def _erode(a, r):
    return ~_dilate(~a, r)


def _long_runs(m, min_px):
    """Keep pixels lying on a horizontal or vertical run of at least min_px (walls are long; text,
    symbols and furniture blobs are short)."""
    def rows(a):
        out = np.zeros_like(a)
        for y in range(a.shape[0]):
            d = np.diff(np.r_[0, a[y].astype(np.int8), 0])
            for s_, e_ in zip(np.flatnonzero(d == 1), np.flatnonzero(d == -1)):
                if e_ - s_ >= min_px:
                    out[y, s_:e_] = True
        return out
    return rows(m) | rows(m.T).T


def wall_mask(page, k, centre, reach_cm=700):
    """Walls as a boolean raster around `centre`: filled or hatched areas survive a closing (fills the
    hatch) then an opening (drops thin lines, text, furniture outlines). Returns (mask, clip, px_per_pt)."""
    R = reach_cm * k
    clip = fitz.Rect(centre.x - R, centre.y - R, centre.x + R, centre.y + R) & page.rect
    zoom = 1 / (CM_PER_PX * k)  # px per pt
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip, colorspace=fitz.csGRAY, annots=False)
    g = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width)
    m = g < 215
    m = _erode(_dilate(m, 3), 3)  # close: 6 cm, fills hatching
    m = _dilate(_erode(m, 4), 4)  # open: 8 cm, removes lines and small text
    return _long_runs(m, int(70 / CM_PER_PX)), clip, zoom


def room_from_seed(page, k, seed):
    """Inner rectangle of the room around a point inside it (the user's click): walk from the seed to
    the first wall pixel in each direction, median of 5 parallel rays (a door gap fools only one).
    None if it is not mamad-sized."""
    m, clip, z = wall_mask(page, k, seed)
    sx, sy = int((seed.x - clip.x0) * z), int((seed.y - clip.y0) * z)
    h, w = m.shape
    if not (0 <= sx < w and 0 <= sy < h) or m[sy, sx]:
        return None
    step = int(30 / CM_PER_PX)

    def walk(dx, dy):
        hits = []
        for o in range(-2, 3):
            x, y = sx + (o * step if dy else 0), sy + (o * step if dx else 0)
            while 0 <= x < w and 0 <= y < h and not m[y, x]:
                x, y = x + dx, y + dy
            hits.append(x if dx else y)
        return float(np.median(hits))

    left, right, top, bottom = walk(-1, 0), walk(1, 0), walk(0, -1), walk(0, 1)
    r = fitz.Rect(clip.x0 + (left + 1) / z, clip.y0 + (top + 1) / z, clip.x0 + right / z, clip.y0 + bottom / z)
    W, D = r.width / k, r.height / k
    return r if 150 <= W <= 650 and 150 <= D <= 650 and 5e4 <= W * D <= 2.2e5 else None


def mamad_rect(page, k, box, words):
    """The mamad whose wall carries Oren's box. Simulates the user's click inside the mamad with the
    nearest ממ"ד label; falls back to points 1 m either side of the box. The room must touch the box."""
    b, wall_h = box
    labels = sorted((wr for wr, t in words if is_mamad_label(t)),
                    key=lambda wr: abs((wr.tl + wr.br) / 2 - b))
    seeds = [(wr.tl + wr.br) / 2 for wr in labels if abs((wr.tl + wr.br) / 2 - b) < 450 * k]
    off = fitz.Point(0, 100 * k) if wall_h else fitz.Point(100 * k, 0)
    for seed in seeds + [b + off, b - off]:
        r = room_from_seed(page, k, seed)
        if r and _dist_to_edge(r, b) <= 45 * k:
            return r, seed
    return None, None


def _dist_to_edge(r, p):
    """Distance from p to the rectangle's outline (inside or out)."""
    inside = r.contains(p)
    dx, dy = max(r.x0 - p.x, 0, p.x - r.x1), max(r.y0 - p.y, 0, p.y - r.y1)
    return min(p.x - r.x0, r.x1 - p.x, p.y - r.y0, r.y1 - p.y) if inside else float(np.hypot(dx, dy))


# ---------- run ----------

def load(plans_dir):
    """One row per Oren box: plan, page, scale, box, mamad rect."""
    rows = []
    for pi, path in enumerate(sorted(glob.glob(os.path.join(plans_dir, "*.pdf")))):
        doc = fitz.open(path)
        page = doc[0]
        page.set_rotation(0)  # annotations, drawings and words all in unrotated coordinates
        boxes = omer_boxes(page)
        if not boxes:
            continue
        raw = e.segments(page)
        segs, words = e._merge(raw), texts(page)
        for i, box in enumerate(boxes):
            k, how = e.calibrate(page, raw, near=box[0])
            rect, seed = mamad_rect(page, k, box, words)
            rows.append({"plan": os.path.basename(path), "doc": doc, "page": page, "segs": segs, "words": words,
                         "id": f"{pi:02d}.{i}",
                         "k": k, "scale": how, "box": box, "mamad": rect, "seed": seed})
    return rows


def check_sheet(rows, path, draw=None):
    """One crop per box: Oren's box (blue), detected mamad (green), extra drawing (draw(row, page))."""
    sheet = fitz.open()
    cols, cw, ch = 4, 300, 320
    pg = sheet.new_page(width=cols * cw, height=((len(rows) + cols - 1) // cols) * ch)
    for i, r in enumerate(rows):
        b, k = r["box"][0], r["k"]
        tmp = fitz.open()
        tmp.insert_pdf(r["doc"], from_page=0, to_page=0, annots=False)
        p = tmp[0]
        p.set_rotation(0)
        p.draw_circle(b, 14 * k, color=(0, 0, 1), width=3)
        if r["mamad"]:
            p.draw_rect(r["mamad"], color=(0, 0.7, 0), width=4)
            p.draw_circle(r["seed"], 8 * k, color=(0, 0.7, 0), fill=(0, 0.7, 0))
        if draw:
            draw(r, p)
        R = 320 * k
        x, y = (i % cols) * cw, (i // cols) * ch
        pg.show_pdf_page(fitz.Rect(x + 5, y + 18, x + cw - 5, y + ch - 5), tmp, 0, clip=fitz.Rect(b.x - R, b.y - R, b.x + R, b.y + R))
        pg.insert_text((x + 8, y + 13), f"{r['id']} {r['plan'][:28]}", fontsize=9, color=(0, 0, 1))
    pg.get_pixmap(dpi=100).save(path)


# ---------- candidates and scoring ----------

SERVICE = ("רחצה", "שירות", "מקלחת", "כביסה", "מבואה", "מסדרון", "פיר", "אמבט", "ארון")
WEIGHTS = {"block": 2.0, "service": 1.5, "corner": 1.0, "opening": -2.0}  # v0, hand-set
STEP_CM, MIN_CORNER_CM = 5, 15


def faces(r):
    """The four inner faces: name -> (start point, end point, outward unit vector)."""
    return {"top": (r.tl, r.tr, fitz.Point(0, -1)), "bottom": (r.bl, r.br, fitz.Point(0, 1)),
            "left": (r.tl, r.bl, fitz.Point(-1, 0)), "right": (r.tr, r.br, fitz.Point(1, 0))}


def candidates(page, k, rect, words):
    """Every STEP_CM along each inner face, at least MIN_CORNER_CM from the corners (regulation 214:
    15 cm from any element), with the features used to rank them."""
    m, clip, z = wall_mask(page, k, (rect.tl + rect.br) / 2)
    h, w = m.shape
    wall = lambda p: 0 <= int((p.y - clip.y0) * z) < h and 0 <= int((p.x - clip.x0) * z) < w and m[int((p.y - clip.y0) * z), int((p.x - clip.x0) * z)]
    out = []
    for name, (a, b, n) in faces(rect).items():
        L = abs(b - a) / k
        u = (b - a) / abs(b - a)
        band = fitz.Rect(a, b + n * 250 * k).normalize()  # the zone behind this wall, 2.5 m deep
        service = any(band.intersects(wr) and any(x in t for x in SERVICE) for wr, t in words)
        for t_cm in np.arange(MIN_CORNER_CM, L - MIN_CORNER_CM + 0.1, STEP_CM):
            p = a + u * t_cm * k
            depth = next((d for d in range(0, 120, 2) if not wall(p + n * (d + 3) * k)), 120)  # cm of wall straight out
            out.append({"face": name, "t": t_cm, "len": L, "p": p, "corner": min(t_cm, L - t_cm),
                        "opening": depth < 8, "through": depth >= 70, "service": service})
    # a perpendicular wall joining from outside = a run of 'through' positions; Oren aims at its centre
    for name in faces(rect):
        row = [c for c in out if c["face"] == name]
        i = 0
        while i < len(row):
            if not row[i]["through"]:
                i += 1
                continue
            j = i
            while j + 1 < len(row) and row[j + 1]["through"]:
                j += 1
            mid = (row[i]["t"] + row[j]["t"]) / 2
            for c in row[i:j + 1]:
                c["block"] = max(c.get("block", 0), 1 - abs(c["t"] - mid) / ((row[j]["t"] - row[i]["t"]) / 2 + 20))
            i = j + 1
    for c in out:
        c.setdefault("block", 0.0)
        c["score"] = (WEIGHTS["block"] * c["block"] + WEIGHTS["service"] * c["service"]
                      + WEIGHTS["corner"] * (15 <= c["corner"] <= 130) + WEIGHTS["opening"] * c["opening"])
    return sorted(out, key=lambda c: -c["score"])


def truth(rect, box, k):
    """Oren's choice as (face, t cm along it): the box centre projected on the nearest face."""
    b = box[0]
    best = None
    for name, (a, e_, n) in faces(rect).items():
        u = (e_ - a) / abs(e_ - a)
        t = (b - a).x * u.x + (b - a).y * u.y
        d = abs((b - a).x * n.x + (b - a).y * n.y)
        if best is None or d < best[2]:
            best = (name, t / k, d / k)
    return best


def evaluate(rows):
    res = []
    for r in rows:
        if not r["mamad"] or not r["mamad_ok"]:
            res.append({"id": r["id"], "status": "mamad non trouvé" if not r["mamad"] else "mamad faux"})
            continue
        face, t, off = truth(r["mamad"], r["box"], r["k"])
        cands = candidates(r["page"], r["k"], r["mamad"], r["words"])
        r["cands"] = cands
        hit = lambda c, tol: c["face"] == face and abs(c["t"] - t) <= tol
        rank = next((i + 1 for i, c in enumerate(cands) if hit(c, 20)), None)
        top = cands[0]
        res.append({"id": r["id"], "status": "ok", "face": face, "t": t, "top_face": top["face"], "top_t": top["t"],
                    "same_wall": top["face"] == face, "err": abs(top["t"] - t) if top["face"] == face else None,
                    "hit20": hit(top, 20), "top3": any(hit(c, 20) for c in cands[:3]), "rank": rank, "n": len(cands),
                    "why": f"mur perpendiculaire {float(top['block']):.1f}, pièce de service {'oui' if top['service'] else 'non'}, "
                           f"{float(top['corner']):.0f} cm de l'angle{', ouverture' if top['opening'] else ''}"})
    return res


def report(rows, res, path):
    ev = [x for x in res if x["status"] == "ok"]
    n = len(ev) or 1
    pct = lambda f: f"{sum(f(x) for x in ev)}/{len(ev)} ({100 * sum(f(x) for x in ev) / n:.0f} %)"
    L = ["# Banc de mesure : placement automatique de l'Omer", "",
         f"{len(res)} emplacements marqués par Oren ; Mamad retrouvé et vérifié sur {len(ev)}.", "",
         "| Mesure | Résultat |", "|---|---|",
         f"| 1er choix sur le même mur qu'Oren | {pct(lambda x: x['same_wall'])} |",
         f"| 1er choix à 20 cm près | {pct(lambda x: x['hit20'])} |",
         f"| Oren dans les 3 premiers choix (20 cm) | {pct(lambda x: x['top3'])} |",
         f"| Hasard, même mur | 25 % |", "",
         f"Poids v0 : {WEIGHTS}", "",
         "| Cas | Plan | Oren (mur, cm) | 1er choix (mur, cm) | Écart | Rang d'Oren | Pourquoi ce choix |", "|---|---|---|---|---|---|---|"]
    for r, x in zip(rows, res):
        if x["status"] != "ok":
            L.append(f"| {x['id']} | {r['plan'][:30]} | — | — | — | — | {x['status']} |")
            continue
        L.append(f"| {x['id']} | {r['plan'][:30]} | {x['face']} {x['t']:.0f} | {x['top_face']} {x['top_t']:.0f} | "
                 f"{'%.0f cm' % x['err'] if x['err'] is not None else 'autre mur'} | {x['rank']}/{x['n']} | {x['why']} |")
    open(path, "w", encoding="utf-8").write("\n".join(L) + "\n")


def draw_top3(r, p):
    for i, c in enumerate(r.get("cands", [])[:3]):
        p.draw_circle(c["p"], 10 * r["k"], color=(1, 0.5, 0), fill=(1, 0.5, 0) if i == 0 else None, width=3)


if __name__ == "__main__":
    plans, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    rows = load(plans)
    review = json.load(open(os.path.join(os.path.dirname(__file__), "bench_review.json"), encoding="utf-8"))
    for r in rows:
        r["mamad_ok"] = review.get(r["id"], False)
    res = evaluate(rows)
    check_sheet(rows, os.path.join(out, "bench.png"), draw_top3)
    report(rows, res, os.path.join(out, "bench.md"))
    ok = [x for x in res if x["status"] == "ok"]
    print(f"{len(ok)} cases measured ; same wall {sum(x['same_wall'] for x in ok)} ; 20 cm {sum(x['hit20'] for x in ok)} ; top3 {sum(x['top3'] for x in ok)}")
