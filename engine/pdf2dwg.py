"""PDF plan -> DWG, in real units (cm), with Oren's marks on their own OMER-* layers.

    python pdf2dwg.py plan.pdf out_dir [--oda "C:/Program Files/ODA/ODAFileConverter 26.9.0/ODAFileConverter.exe"]

The architect's PDF is flat (no layers), so the drawing lands on PLAN / PLAN-FILL / PLAN-TEXT.
Writes <name>.dxf with ezdxf, then converts it to DWG (AutoCAD 2018) with ODA File Converter.
"""
import argparse, math, re, shutil, subprocess, sys, tempfile, textwrap
from pathlib import Path

import ezdxf
import fitz
from ezdxf import colors

from engine import calibrate, segments

ODA = "C:/Program Files/ODA/ODAFileConverter 26.9.0/ODAFileConverter.exe"
# Oren's colours (PDF stroke) -> layer. Red is the Omer itself; the rest are the other passages.
SIGN_LAYERS = {
    "OMER-UNIT": (0.898, 0.133, 0.216), "OMER-AXIS": (0.898, 0.133, 0.216), "OMER-ARROW": (0.898, 0.133, 0.216),
    "OMER-NOTE": (0.898, 0.133, 0.216), "OMER-VENT4": (0.75, 0.22, 0.77), "OMER-CABLE": (0.02, 0.54, 0.11),
}


_LTR = re.compile(r"[A-Za-z0-9.,:/%=+\-]+")


def visual(text):
    """AutoCAD draws text left to right with no bidi, so Hebrew is stored in visual order (the usual
    convention in Israeli DWGs, see autocadAgent/drawingText.ts): reverse each line, keep Latin/number runs.
    ponytail: not full Unicode bidi; mixed-direction edge cases may read oddly."""
    if not re.search("[֐-׿]", text):
        return text
    flip = str.maketrans("()[]", ")(][")
    return "\n".join(_LTR.sub(lambda m: m.group()[::-1], line[::-1]).translate(flip) for line in text.split("\n"))


def _rgb(c):
    return colors.rgb2int(tuple(round(v * 255) for v in c[:3])) if c else None


def _layer_for(a):
    """Which OMER-* layer an Oren annotation goes on (see the library's 'Oren signs')."""
    t, c = a.type[1], a.colors.get("stroke") or (0, 0, 0)
    r, g, b = c[:3]
    if t == "FreeText":
        return "OMER-NOTE"
    if t == "Square":
        return "OMER-UNIT"
    if g > 0.45 and r < 0.2:
        return "OMER-CABLE"
    if b > 0.7:
        return "OMER-VENT4"
    return "OMER-ARROW" if a.line_ends and any(a.line_ends) else "OMER-AXIS"


def to_dxf(pdf, page_no=0, clip=None, marks=True):
    """The plan as an ezdxf document in cm. `clip` (PDF pt) keeps only that part of the sheet;
    marks=False leaves Oren's annotations out (a clean background for new placements)."""
    page = fitz.open(pdf)[page_no]
    clip = fitz.Rect(clip) if clip else page.rect
    k, how = calibrate(page, segments(page))  # PDF pt per real cm
    P = lambda p: (p[0] / k, -p[1] / k)  # PDF y points down, CAD y points up

    doc = ezdxf.new("R2018", setup=True)
    doc.header["$INSUNITS"] = 5  # centimetres
    doc.styles.get("Standard").dxf.font = "arial.ttf"  # the default txt.shx has no Hebrew glyphs
    msp = doc.modelspace()
    # Oren's marks are sometimes also flattened into the page: drop that copy (the OMER-* layers have it).
    # A flattened mark = drawn inside an annotation's box, in that annotation's colour (notes: anything inside).
    oren = [a for a in page.annots() if a.info.get("title") != "AutoCAD SHX Text"]
    notes = [a.rect for a in oren if a.type[1] == "FreeText"]
    flat = [(a.rect + (-3, -3, 3, 3), [c for c in (a.colors.get("stroke"), a.colors.get("fill")) if c]) for a in oren if a.type[1] != "FreeText"]

    def in_note(r, d=None):
        if any(n.contains(r) for n in notes):
            return True
        mine = [c for c in ((d or {}).get("color"), (d or {}).get("fill")) if c]
        return any(box.contains(r) and any(max(abs(x - y) for x, y in zip(m, c)) < 0.02 for m in mine for c in cols)
                   for box, cols in flat)
    for name, c in [("PLAN", None), ("PLAN-FILL", None), ("PLAN-TEXT", None), *(SIGN_LAYERS.items() if marks else [])]:
        lay = doc.layers.add(name, color=7)
        if c:
            lay.rgb = tuple(round(v * 255) for v in c)

    # vector drawing: every path becomes polylines (curves flattened), fills become solid hatches
    for d in page.get_drawings():
        if not d["rect"].intersects(clip) or in_note(d["rect"], d):  # junk off the sheet / flattened marks
            continue
        loops, cur = [], []
        for it in d["items"]:
            if it[0] == "l":
                pts = [it[1], it[2]]
            elif it[0] == "c":
                pts = [it[1] * (1 - t) ** 3 + it[2] * 3 * t * (1 - t) ** 2 + it[3] * 3 * t * t * (1 - t) + it[4] * t ** 3
                       for t in (i / 8 for i in range(9))]
            elif it[0] == "re":
                r = it[1]
                pts = [r.tl, r.tr, r.br, r.bl, r.tl]
            elif it[0] == "qu":
                q = it[1]
                pts = [q.ul, q.ur, q.lr, q.ll, q.ul]
            else:
                continue
            if cur and abs(cur[-1] - pts[0]) < 0.01 and it[0] in "lc":
                cur += pts[1:]
            else:
                if cur:
                    loops.append(cur)
                cur = list(pts)
        if cur:
            loops.append(cur)
        attr = {"layer": "PLAN"}
        if d.get("color") is not None and any(d["color"]):
            attr["true_color"] = _rgb(d["color"])
        if d.get("width"):
            attr["const_width"] = 0  # keep hairlines; PDF widths are plot widths, not geometry
        if d.get("fill") is not None and d["type"] in ("f", "fs"):
            h = msp.add_hatch(dxfattribs={"layer": "PLAN-FILL", "true_color": _rgb(d["fill"])})
            for lp in loops:
                if len(lp) > 2:
                    h.paths.add_polyline_path([P(p) for p in lp], is_closed=True)
        if d["type"] in ("s", "fs"):
            for lp in loops:
                msp.add_lwpolyline([P(p) for p in lp], dxfattribs=attr)

    # real text (plans exported with TrueType fonts; SHX plans have none)
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            for s in ln["spans"]:
                if s["text"].strip() and clip.intersects(s["bbox"]) and not any(n.intersects(s["bbox"]) for n in notes):
                    dx, dy = ln["dir"]
                    msp.add_text(visual(s["text"]), height=s["size"] * 0.75 / k, rotation=math.degrees(math.atan2(-dy, dx)),
                                 dxfattribs={"layer": "PLAN-TEXT"}).set_placement(P(s["origin"]))

    # Oren's annotations (skip Acrobat's "AutoCAD SHX Text" recognition comments)
    n_marks = 0
    for a in page.annots() if marks else []:
        if a.info.get("title") == "AutoCAD SHX Text":
            continue
        layer, n_marks = _layer_for(a), n_marks + 1
        attr = {"layer": layer, "true_color": _rgb(a.colors.get("stroke"))}
        if a.type[1] == "FreeText":  # Hebrew, right-aligned from the box's top-right corner
            r, attr["true_color"] = a.rect, _rgb(SIGN_LAYERS[layer])
            # visual-order lines cannot be wrapped by AutoCAD (it would cut the wrong end), so wrap here first
            per_line = max(8, int((r.width - 6) / (9 * 0.55)))
            lines = [w for para in a.info.get("content", "").replace("\r", "\n").split("\n")
                     for w in (textwrap.wrap(para, per_line) or [""])]
            msp.add_mtext("\\P".join(visual(l) for l in lines),
                          dxfattribs={**attr, "char_height": 9 / k, "width": 0,
                                      "insert": P(r.tr + (-3, 3)), "attachment_point": 3})
            msp.add_lwpolyline([P(p) for p in (r.tl, r.tr, r.br, r.bl)], close=True, dxfattribs=attr)
        elif a.type[1] == "Square":
            r = a.rect
            box = [P(p) for p in (r.tl, r.tr, r.br, r.bl)]
            fill = a.colors.get("fill")
            if fill:
                h = msp.add_hatch(dxfattribs={"layer": layer, "true_color": _rgb(fill)})
                h.paths.add_polyline_path(box, is_closed=True)
                h.transparency = 1 - (a.opacity if a.opacity and a.opacity > 0 else 1)
            msp.add_lwpolyline(box, close=True, dxfattribs=attr)
        elif a.type[1] == "Line" and a.vertices:
            p, q = fitz.Point(a.vertices[0]), fitz.Point(a.vertices[-1])
            msp.add_line(P(p), P(q), dxfattribs=attr)
            if a.line_ends and any(a.line_ends):  # closed arrowhead at the marked end
                tip, tail = (q, p) if a.line_ends[1] else (p, q)
                u = (tip - tail) / abs(tip - tail) * 14
                n = fitz.Point(-u.y, u.x) * 0.35
                msp.add_solid([P(tip), P(tip - u + n), P(tip - u - n)], dxfattribs=attr)

    return doc, {"pt_per_cm": float(k), "scale": how, "oren_marks": n_marks}


def convert(pdf, out_dir, oda=ODA, page_no=0, clip=None, marks=True, dxf_only=False):
    doc, info = to_dxf(pdf, page_no, clip, marks)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = Path(pdf).stem
    dxf_path = out_dir / f"{stem}.dxf"
    doc.saveas(dxf_path)
    if dxf_only:
        return {"dxf": dxf_path, **info}

    # ODA converts a whole folder, so stage the DXF alone
    with tempfile.TemporaryDirectory() as src, tempfile.TemporaryDirectory() as dst:
        shutil.copy(dxf_path, Path(src) / "plan.dxf")
        subprocess.run([oda, src, dst, "ACAD2018", "DWG", "0", "1", "*.DXF"], check=True, capture_output=True)
        made = Path(dst) / "plan.dwg"
        if not made.exists():
            sys.exit("ODA did not produce a DWG")
        dwg_path = out_dir / f"{stem}.dwg"
        shutil.copy(made, dwg_path)
    return {"dwg": dwg_path, "dxf": dxf_path, **info}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("out_dir")
    ap.add_argument("--oda", default=ODA)
    ap.add_argument("--clip", help="x0,y0,x1,y1 in PDF points")
    ap.add_argument("--no-marks", action="store_true", help="leave Oren's annotations out")
    ap.add_argument("--dxf-only", action="store_true")
    a = ap.parse_args()
    clip = [float(v) for v in a.clip.split(",")] if a.clip else None
    print(convert(a.pdf, a.out_dir, a.oda, clip=clip, marks=not a.no_marks, dxf_only=a.dxf_only))
