"""Self-check on a synthetic 1:50 plan: a 300x300 cm mamad, dimension texts, and an Oren-style mark
80 cm from the top corner on the left wall. Run: python test_engine.py"""
import fitz

import engine as e

K = e.K_1_50


def synthetic_plan():
    doc = fitz.open()
    page = doc.new_page(width=600, height=600)
    x0, y0, side, wall = 100, 150, 300 * K, 25 * K
    for r in (fitz.Rect(x0, y0, x0 + side, y0 + side), fitz.Rect(x0 - wall, y0 - wall, x0 + side + wall, y0 + side + wall)):
        for a, b in ((r.tl, r.tr), (r.tr, r.br), (r.br, r.bl), (r.bl, r.tl)):
            page.draw_line(a, b)
    for i in range(10):  # chained-free dimension lines with their value written above
        y = 30 + i * 10
        page.draw_line((x0, y), (x0 + side, y), width=0.3)
        page.insert_text((x0 + side / 2 - 6, y - 2), "300", fontsize=6)
    cy = y0 + 80 * K  # Omer centre: 80 cm below the top inner corner, on the left wall
    pipe = page.add_line_annot((x0 - 40 * K, cy), (x0 + 40 * K, cy))
    arrow = page.add_line_annot((x0 + 20 * K, cy + 60), (x0 + 20 * K, cy))
    for a in (pipe, arrow):
        a.set_colors(stroke=e.RED)
        a.update()
    arrow.set_line_ends(fitz.PDF_ANNOT_LE_NONE, fitz.PDF_ANNOT_LE_CLOSED_ARROW)
    arrow.update()
    page.add_freetext_annot(fitz.Rect(300, 400, 500, 480), 'למקם מרכז צינור עומר כ- 80 ס"מ מפינת קיר ניצב\rH= מינוס 38 ס"מ')
    return doc, page, (x0, cy)


def test_parse_note():
    r = e.parse_note('למקם מרכז צינור עומר כ- 1.10 מטר מפינת קיר חלון\r\rH = - 38 CM מרכז עומר מתחתית תקרה')
    assert (r["mode"], r["dist_cm"], r["ref"], r["h_cm"]) == ("distance", 110, "קיר חלון", -38), r
    r = e.parse_note('יש למקם מרכז צינור עומר מול מרכז קיר בלוק ניצב\r\rH = מינוס 38 ס"מ\r\rהולכת ניקוז אל חדר שירות')
    assert (r["mode"], r["h_cm"], r["route"]) == ("center", -38, ["הולכת ניקוז אל חדר שירות"]), r
    r = e.parse_note('למקם מרכז צינור עומר כ- 1.30 מפינת קיר ניצב\r\rH= 2.45')
    assert (r["dist_cm"], r["h_cm"], r["h_floor_cm"]) == (130, None, 245), r
    r = e.parse_note('למקם מרכז עומר כ- 15 ס"מ מפינת קיר ניצב.\rגובה מרכז צינור עומר כ- 38 ס"מ מתקרה')
    assert (r["dist_cm"], r["h_cm"]) == (15, -38), r


def test_pipeline():
    doc, page, (wx, cy) = synthetic_plan()
    raw = e.segments(page)
    k, how = e.calibrate(page, raw)
    assert abs(k - K) < 0.002 and how.startswith("auto"), (k, how)
    marks, n_notes = e.oren_marks(page)
    assert n_notes == 1 and len(marks) == 1 and marks[0]["pipe"], marks
    rule = e.parse_note(marks[0]["note"])
    frame = e.wall_frame(marks[0], k)
    assert frame[0] is False  # horizontal pipe => vertical wall
    pt, measured, err = e.place(e._merge(raw), k, frame, rule)
    assert err < 2 and abs(pt.x - wx) < 1 and abs(pt.y - cy) < 2 * k, (pt, measured, err)
    e.annotate(page, pt, pt + (0, 60), frame[0], e.note_text(rule), k, fitz.Point(300, 300))
    assert sum(a.info["title"] == e.AUTHOR for a in page.annots()) == 3


if __name__ == "__main__":
    test_parse_note()
    test_pipeline()
    print("ok")


def test_visual_hebrew():
    from pdf2dwg import visual
    assert visual("H = מינוס 38 ס\"מ") == "מ\"ס 38 סונימ = H"
    assert visual("(2.52) תקרה") == "הרקת (2.52)"
    assert visual("PLAN 1:50") == "PLAN 1:50"
