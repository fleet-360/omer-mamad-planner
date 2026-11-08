# מערכת תכנון ממ״ד · התקן עומר

אתר + שרת API למערכת תכנון ממ״ד. הממשק זהה 1:1 לעיצוב המאושר (`omer-mamad-planner`), והשרת כבר מוכן לחיבור לחברת סליקה, לשליחת דוא״ל ולהעלאת שרטוטי DWG.

## הרצה

```bash
npm install
npm run dev
```

- ממשק: http://localhost:5173
- API: http://localhost:8787/api/health

בלי קובץ `.env` המערכת רצה **במצב הדגמה**: תשלום מדומה שמאושר מיד, ומיילים שמודפסים ללוג השרת במקום להישלח.

הפעלה מקומית של build: `npm run build && npm start`. השרת מגיש גם את האתר (מתוך `dist/`) וגם את ה‑API.

## העלאה ל‑Vercel

1. **Supabase**: יוצרים פרויקט (אזור Frankfurt), ומריצים פעם אחת את `supabase/schema.sql` ב‑SQL Editor (טבלאות + bucket פרטי `drawings`).
2. **Vercel**: Add New → Project → מייבאים את ה‑repo מ‑GitHub. ההגדרות מזוהות אוטומטית (`vercel.json`).
3. **Environment Variables** ב‑Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET` (מחרוזת ארוכה ואקראית), `AUTH_DEMO=false`, `APP_URL` ו‑`API_PUBLIC_URL` = כתובת האתר, ושאר המשתנים מ‑`.env.example` (דוא״ל, סליקה, מחירים).
4. **דומיין**: Project → Settings → Domains, ואז מעדכנים את `APP_URL` / `API_PUBLIC_URL` ואת כתובות ה‑webhook אצל חברת הסליקה.

האתר מוגש מה‑CDN של Vercel, וה‑API רץ כפונקציה אחת (`api/index.js` → `server/app.js`). קבצי DWG עולים ישירות מהדפדפן ל‑Supabase Storage (Vercel מגביל גוף בקשה ל‑4.5MB), והשרת בודק את חתימת ה‑DWG אחרי ההעלאה.

> בתוכנית החינמית של Supabase כל קובץ מוגבל ל‑50MB. להעלאות של עד 80MB צריך Supabase Pro.

## מבנה

```
src/
  screens/        11 מסכי העיצוב (התחברות, הרשמה, חבילות, פתיחת פרויקט, שרטוט, בדיקה, הפקה, ספרייה, חיוב, הגדרות)
  app/OmerApp.jsx הלוגיקה של הממשק (מצב, ניווט, ולידציה, הצבה אוטומטית) + חיבור ל‑API
  app/catalog.js  קטלוג האלמנטים ותוכנית ההצבה
  services/api.js כל הקריאות לשרת עוברות דרך הקובץ הזה
  styles/         גופנים (מקומיים), סגנונות גלובליים ו‑hover מהעיצוב
server/
  routes.js       auth · payments · uploads · projects · exports · billing
  services/payments/  mock · grow · cardcom
  services/email/     console · smtp · resend + תבניות מייל בעברית
  services/drawings.js העלאת DWG בלבד (סיומת + חתימת קובץ + עד 80MB), ישירות ל‑Supabase Storage
  db.js           Supabase כשמוגדר SUPABASE_URL, אחרת קובץ JSON מקומי (data/db.json)
  app.js          אפליקציית Express (משותפת ל‑index.js המקומי ול‑api/index.js של Vercel)
api/index.js      נקודת הכניסה של Vercel
supabase/schema.sql  טבלאות + bucket, מריצים פעם אחת
```

## חיבור סליקה

`PAYMENT_PROVIDER=grow` (או `cardcom`) ב‑`.env`, יחד עם פרטי המסוף. הזרימה:

1. הלקוח לוחץ "תשלום ואישור", והשרת יוצר הזמנה ופותח תהליך תשלום אצל חברת הסליקה.
2. הלקוח מועבר לדף התשלום המאובטח של חברת הסליקה. **פרטי אשראי לא עוברים בשרת שלנו.**
3. חברת הסליקה מעדכנת את `POST /api/payments/webhook/<provider>`, וההזמנה מסומנת כשולמה ונשלחת קבלה במייל.
4. הלקוח חוזר לאתר ורואה את מסך "התשלום התקבל".

> שדות כרטיס האשראי במסך ההרשמה הם חלק מהעיצוב בלבד. בחיבור אמיתי מחליפים אותם בדף/iframe של חברת הסליקה.
> יש לאמת את שמות השדות מול תיעוד ה‑API שחברת הסליקה מספקת עם פתיחת המסוף.

מחירי החבילות נקבעים ב‑`PLAN_PRICE_BASIC / PRO / OFFICE` (לפני מע״מ). כל עוד הם ריקים, המסך מציג "—" כמו בעיצוב.

## חיבור דוא״ל

`EMAIL_PROVIDER=smtp` (כל שרת SMTP, כולל Google Workspace ו‑Office 365) או `resend`. מיילים שנשלחים אוטומטית:

| אירוע | נמען |
|---|---|
| פתיחת חשבון ניסיון | הלקוח |
| תשלום התקבל (קבלה) | הלקוח + `NOTIFY_EMAIL` |
| שאלון פרויקט נשלח | הלקוח/היזם + `NOTIFY_EMAIL` |

## מה עוד לא מחובר

- **מנוע ההצבה וההפקה** (קריאת שכבות DWG, הצבה אמיתית, יצירת DWG/PDF). ה‑endpoint `POST /api/exports` קיים ומחזיר `queued`, וכאן יתחבר המנוע.
- **הרשאות משתמשים**: `AUTH_DEMO=true` מאפשר כניסה עם כל דוא״ל לצורך הדגמה. ב‑production מגדירים `AUTH_DEMO=false`.
- **מסד נתונים**: ב‑Vercel חובה Supabase (מערכת הקבצים שם זמנית). בלי `SUPABASE_URL` המערכת משתמשת בקובץ JSON מקומי, להדגמה בלבד.
