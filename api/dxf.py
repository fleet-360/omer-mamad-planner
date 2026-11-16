"""POST /api/dxf: the placed elements drawn as DXF on top of the real plan, in centimetres.

Body: {"project": "...", "elements": [{"code", "short", "color", "shape", "dim", "x", "y"}]}
x/y are the app's 1000x640 plan viewBox (see src/app/catalog.js). The background is plan B2 floor 5,
converted once from the architect's PDF by engine/pdf2dwg.py (clip 450,1390,1950,2350, no marks):
    python engine/pdf2dwg.py <B2.pdf> <out> --clip 450,1390,1950,2350 --no-marks --dxf-only
Runs as a Vercel Python function; `python api/dxf.py < body.json > out.dxf` does the same locally.
"""
import gzip, io, json, math, re, sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

import ezdxf
from ezdxf import colors

BASE = Path(__file__).parent / "_data" / "b2-floor5.dxf.gz"
K = 0.567  # PDF pt per real cm on this sheet (1:50, auto-read from its dimension texts)
MAX_BODY, MAX_ELEMENTS = 200_000, 500


def to_cm(x, y):
    """App viewBox -> PDF pt (1 unit = 1.5 pt from (450,1390)) -> CAD cm, y up."""
    return (450 + x * 1.5) / K, -(1390 + y * 1.5) / K


def _num(v, lo, hi):
    v = float(v)
    if not (math.isfinite(v) and lo <= v <= hi):
        raise ValueError("coordinate out of range")
    return v


def _sizes(dim):
    """Element size in cm from the catalog's dim (mm): 'Ø110', '2×Ø200', '340/240'."""
    n = [int(v) / 10 for v in re.findall(r"\d+", dim or "")]
    count = int(n.pop(0) * 10) if dim and "×" in dim and len(n) > 1 else 1
    return count, (n or [10])


def build(body):
    elements = body.get("elements")
    if not isinstance(elements, list) or len(elements) > MAX_ELEMENTS:
        raise ValueError("elements must be a list of at most %d items" % MAX_ELEMENTS)
    with gzip.open(BASE, "rt", encoding="utf-8") as fh:
        doc = ezdxf.read(fh)
    msp = doc.modelspace()
    for e in elements:
        code = re.sub(r"[^A-Z0-9-]", "", str(e.get("code", "")).upper())[:24] or "OM-EL"
        layer = "OMER-" + re.sub(r"^OM-", "", code)
        color = str(e.get("color", ""))
        rgb = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5)) if re.fullmatch(r"#[0-9A-Fa-f]{6}", color) else (229, 34, 55)
        if layer not in doc.layers:
            doc.layers.add(layer).rgb = rgb
        cx, cy = to_cm(_num(e.get("x"), -50, 1050), _num(e.get("y"), -50, 690))
        count, size = _sizes(str(e.get("dim", "")))
        attr = {"layer": layer}
        if e.get("shape") == "rect":
            w, h = size[0], size[-1]
            msp.add_lwpolyline([(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy + h / 2), (cx - w / 2, cy + h / 2)], close=True, dxfattribs=attr)
        else:
            r, gap = size[0] / 2, 10
            for i in range(count):  # e.g. 2 x 8" pipes side by side, 10 cm apart
                msp.add_circle((cx + (i - (count - 1) / 2) * (2 * r + gap), cy), r, dxfattribs=attr)
        msp.add_line((cx - 15, cy), (cx + 15, cy), dxfattribs=attr)  # centre mark
        msp.add_line((cx, cy - 15), (cx, cy + 15), dxfattribs=attr)
        msp.add_text(code, height=8, dxfattribs=attr).set_placement((cx + 18, cy + 6))
    out = io.StringIO()
    doc.write(out)
    return out.getvalue().encode("utf-8")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            n = int(self.headers.get("content-length") or 0)
            if not 0 < n <= MAX_BODY:
                raise ValueError("body too large or empty")
            dxf = gzip.compress(build(json.loads(self.rfile.read(n))), 6)  # ~0.7 MB instead of ~5 MB
            self.send_response(200)
            self.send_header("Content-Type", "application/dxf")
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Disposition", 'attachment; filename="OMER-PLAN.dxf"')
            self.send_header("Content-Length", str(len(dxf)))
            self.end_headers()
            self.wfile.write(dxf)
        except (ValueError, TypeError, KeyError, json.JSONDecodeError) as ex:
            msg = json.dumps({"error": str(ex)}).encode()
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(msg)


if __name__ == "__main__":
    sys.stdout.buffer.write(build(json.loads(sys.stdin.buffer.read())))  # bytes: Windows stdin is not UTF-8
