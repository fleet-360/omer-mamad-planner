// קטלוג האלמנטים, תוכנית ההצבה האוטומטית ושלבי הריצה — מתוך העיצוב.
export const CAT = [
  {t:'vent_in', num:'1', short:'V4-IN', name:'צינור אוורור כניסה 4״', code:'OM-V4-IN', color:'#2F6F4E', shape:'round', dim:'Ø110', specs:['שרוול חרושתי מגולוון בקוטר 4״','גובה מרכז 150 ס״מ מפני הריצוף','מרחק מינימלי 40 ס״מ מפינה פנימית','ממוקם בקיר חוץ, בצד הנגדי ליציאה']},
  {t:'vent_out', num:'2', short:'V4-OUT', name:'צינור אוורור יציאה 4״', code:'OM-V4-OUT', color:'#0B7285', shape:'round', dim:'Ø110', specs:['שרוול חרושתי מגולוון בקוטר 4״','גובה מרכז 200 ס״מ מפני הריצוף','מותקן באלכסון לפתח הכניסה','כולל מכסה אטימה נשלף']},
  {t:'omer', num:'3', short:'OMER', name:'התקן עומר מקורי', code:'OM-UNIT', color:'#2D94CF', shape:'rect', dim:'340/240', specs:['התקן מקורי לשילוב מזגן מפוצל בממ״ד','הספק עד 3 כ״ס ליחידה','מרחק מינימלי 15 ס״מ מהתקרה','נדרשת גישה לתחזוקה מצד הממ״ד']},
  {t:'ac8', num:'4', short:'AC-8×2', name:'2 צינורות 8״ מעל הדלת', code:'OM-AC8-D', color:'#6741D9', shape:'round', dim:'2×Ø200', specs:['נדרש במיזוג מיני מרכזי בלבד','מותקנים מעל משקוף הדלת','מרווח 10 ס״מ בין הצינורות','שרוולים חרושתיים עם מכסי הדף']},
  {t:'sprinkler', num:'5', short:'SPR', name:'מעבר ספרינקלר', code:'OM-SPR', color:'#C2255C', shape:'round', dim:'Ø32', specs:['מעבר חרושתי לצינור כיבוי','ממוקם בתקרת הממ״ד','מרחק מינימלי 30 ס״מ מקיר','נדרש רק כאשר סומן ״נדרש״ בשלב הבסיס']},
  {t:'cable', num:'6', short:'CBL', name:'מעבר כבילה חרושתי', code:'OM-CBL', color:'#E8590C', shape:'rect', dim:'120/120', specs:['מעבר חרושתי אטום לכבילת חשמל ותקשורת','גובה מרכז 220 ס״מ מפני הריצוף','מותקן בקיר הפנימי, לא בקיר חוץ','כולל אטימת ג׳ל לאחר השחלה']}
];
// Plan coordinates are the 1000×640 viewBox of public/plans/b2-floor5.jpg: plan B2, floor 5 (lot 115),
// PDF rect (450,1390)-(1950,2350) at 1:50, so 1 unit = 1.5 PDF pt ≈ 2.65 cm.
// Inner faces of the two Mamads (369×285 cm), measured on the PDF geometry.
export const MAMADS = { A:{x:794, y:158.9, w:140.5, h:110}, B:{x:47.8, y:158.9, w:142.7, h:110} };
// Omer positions are the ones Oren Skurnik marked on this plan (facing the centre of the perpendicular
// block wall); the other elements follow the catalog rules (vents in diagonal corners, AC 8" over the door).
export const AUTO_PLAN = [
  {t:'vent_in', apt:'A', x:919.5, y:158.9, step:3},{t:'vent_out', apt:'A', x:794, y:259, step:3},
  {t:'vent_in', apt:'B', x:63, y:158.9, step:3},{t:'vent_out', apt:'B', x:190.5, y:259, step:3},
  {t:'omer', apt:'A', x:794, y:226, step:4},{t:'ac8', apt:'A', x:813, y:268.9, step:4},
  {t:'omer', apt:'B', x:190.5, y:226, step:4},{t:'ac8', apt:'B', x:171, y:268.9, step:4},
  {t:'sprinkler', apt:'A', x:863, y:205, step:5},{t:'cable', apt:'A', x:888, y:268.9, step:5},
  {t:'sprinkler', apt:'B', x:120, y:205, step:5},{t:'cable', apt:'B', x:95, y:268.9, step:5}
];
export const STEPS = ['קריאת שכבות השרטוט','זיהוי גרעיני ממ״ד','מיקום צינורות אוורור 4״','התקן עומר ומעברי מיזוג 8״','ספרינקלר ומעבר כבילה','בדיקת תקן והנחיות פיקוד העורף'];
export const meta = t => CAT.find(c => c.t === t);
