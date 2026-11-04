// התחברות
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { sx } from '../ui/dom.jsx';

export default function Login({ v }) {
  return (
    <>
      <div style={sx("flex:1;display:flex;flex-direction:column")}>
        {v.brandA ? (
          <>
            <div style={sx("flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);min-height:calc(100vh - 52px)")}>
              <div style={sx("background:#fff;display:flex;align-items:center;justify-content:center;padding:56px 40px")}>
                <div style={sx("width:100%;max-width:380px")}>
                  {" "}
                  <div style={sx("display:flex;align-items:center;gap:10px;margin-bottom:38px")}>
                    <div style={sx("width:26px;height:26px;border:2.5px solid #1A1A17;position:relative")}>
                      <div style={sx("position:absolute;inset:4px;background:#4C6EF5")} />
                    </div>
                    <div style={sx("font-size:15px;font-weight:600")}>התקן עומר · תכנון ממ״ד</div>
                  </div>
                  {" "}
                  <h1 style={sx("font-size:31px;font-weight:600;letter-spacing:-.02em;margin:0 0 8px")}>התחברות למערכת</h1>
                  {" "}
                  <p style={sx("font-size:14px;color:#6B6A63;line-height:1.6;margin:0 0 30px")}>
                    תכנון אוטומטי של פרטי ממ״ד על גבי שרטוט האדריכל, בהתאם להנחיות התקן והנחיות פיקוד העורף.
                  </p>
                  {" "}
                  <label style={sx("display:block;font-size:12px;font-weight:500;color:#4A4943;margin-bottom:6px")}>דואר אלקטרוני</label>
                  {" "}
                  <input type="email" value={v.loginEmail} onChange={v.setLoginEmail} style={sx("width:100%;height:44px;padding:0 12px;border:1px solid #DEDCD5;background:#FBFAF8;font-size:14px;margin-bottom:16px")} />
                  {" "}
                  <label style={sx("display:block;font-size:12px;font-weight:500;color:#4A4943;margin-bottom:6px")}>סיסמה</label>
                  {" "}
                  <input type="password" value={v.loginPass} onChange={v.setLoginPass} style={sx("width:100%;height:44px;padding:0 12px;border:1px solid #DEDCD5;background:#FBFAF8;font-size:14px;margin-bottom:14px")} />
                  {" "}
                  <div style={sx("display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;font-size:12.5px")}>
                    <label style={sx("display:flex;align-items:center;gap:7px;color:#4A4943;cursor:pointer")}>
                      <input type="checkbox" defaultChecked style={sx("width:15px;height:15px;accent-color:#4C6EF5")} />
                      זכור אותי
                    </label>
                    <a href="#">שכחתי סיסמה</a>
                  </div>
                  {" "}
                  <button className="hv-1" onClick={v.doLogin} style={sx("width:100%;height:46px;background:#4C6EF5;color:#fff;border:0;font-size:14.5px;font-weight:500;cursor:pointer")}>
                    כניסה
                  </button>
                  {" "}
                  <div style={sx("text-align:center;margin-top:18px;font-size:13px;color:#6B6A63")}>
                    {"אין לך חשבון? "}
                    <a href="#" onClick={v.goSignup}>הרשמה</a>
                  </div>
                  {" "}
                </div>
              </div>
              <div style={sx("background:#FBFAF8;border-right:1px solid #DEDCD5;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:44px")}>
                <svg viewBox="0 0 600 520" style={sx("position:absolute;top:-30px;left:-40px;width:118%;opacity:.5")} preserveAspectRatio="xMidYMid slice">
                  <g fill="none" stroke="#C9C6BC" strokeWidth="1.2">
                    <rect x="60" y="60" width="480" height="360" />
                    <line x1="300" y1="60" x2="300" y2="420" />
                    <line x1="60" y1="250" x2="300" y2="250" />
                    <line x1="420" y1="150" x2="540" y2="150" />
                  </g>
                  <g fill="none" stroke="#1A1A17" strokeWidth="5">
                    <rect x="90" y="90" width="150" height="130" />
                  </g>
                  <g stroke="#4C6EF5" strokeWidth="2" fill="#fff">
                    <circle cx="90" cy="120" r="7" />
                    <circle cx="90" cy="195" r="7" />
                    <circle cx="205" cy="220" r="7" />
                    <circle cx="165" cy="155" r="7" />
                  </g>
                  <g stroke="#C9C6BC" strokeWidth="1" strokeDasharray="4 4">
                    <line x1="90" y1="450" x2="240" y2="450" />
                  </g>
                  <text x="165" y="470" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="13" fill="#8C8A82">300</text>
                </svg>
                <div style={sx("position:relative;max-width:420px")}>
                  {" "}
                  <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8C8A82;letter-spacing:.08em;margin-bottom:14px")}>שרטוט אוטומטי · PDF / DWG</div>
                  {" "}
                  <div style={sx("font-size:24px;font-weight:500;line-height:1.45;letter-spacing:-.01em;margin-bottom:20px")}>
                    מהעלאת שרטוט האדריכל ועד קובץ ממ״ד מוכן להגשה — בלחיצה אחת.
                  </div>
                  {" "}
                  <div style={sx("display:flex;flex-direction:column;gap:9px;font-size:13.5px;color:#4A4943")}>
                    <div style={sx("display:flex;gap:9px;align-items:flex-start")}>
                      <span style={sx("color:#4C6EF5")}>—</span>
                      זיהוי גרעיני ממ״ד בשרטוט והצבת כל הפרטים אוטומטית
                    </div>
                    <div style={sx("display:flex;gap:9px;align-items:flex-start")}>
                      <span style={sx("color:#4C6EF5")}>—</span>
                      אוורור 4״, מעברי מיזוג 8״, ספרינקלר, מעבר כבילה
                    </div>
                    <div style={sx("display:flex;gap:9px;align-items:flex-start")}>
                      <span style={sx("color:#4C6EF5")}>—</span>
                      ייצוא DWG ו‑PDF עם טבלת פרטים ורשימת סימונים
                    </div>
                  </div>
                  {" "}
                </div>
              </div>
            </div>
          </>
        ) : null}
        {v.brandB ? (
          <>
            <div style={sx("flex:1;display:flex;align-items:center;justify-content:center;padding:60px 24px;min-height:calc(100vh - 52px);background:#F4F2ED")}>
              <div style={sx("width:100%;max-width:440px")}>
                {" "}
                <div style={sx("text-align:center;margin-bottom:26px")}>
                  {" "}
                  <div style={sx("width:44px;height:44px;border:3px solid #1A1A17;margin:0 auto 16px;position:relative")}>
                    <div style={sx("position:absolute;inset:6px;background:#4C6EF5")} />
                  </div>
                  {" "}
                  <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.14em;color:#8C8A82")}>OMER · MAMAD PLANNING</div>
                  {" "}
                </div>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:34px 32px")}>
                  {" "}
                  <h1 style={sx("font-size:22px;font-weight:600;margin:0 0 4px;text-align:center")}>התחברות</h1>
                  {" "}
                  <p style={sx("font-size:13px;color:#6B6A63;margin:0 0 26px;text-align:center")}>מערכת תכנון פרטי ממ״ד — התקן עומר המקורי</p>
                  {" "}
                  <label style={sx("display:block;font-size:12px;font-weight:500;color:#4A4943;margin-bottom:6px")}>דואר אלקטרוני</label>
                  {" "}
                  <input type="email" value={v.loginEmail} onChange={v.setLoginEmail} style={sx("width:100%;height:42px;padding:0 12px;border:1px solid #DEDCD5;background:#FBFAF8;font-size:14px;margin-bottom:14px")} />
                  {" "}
                  <label style={sx("display:block;font-size:12px;font-weight:500;color:#4A4943;margin-bottom:6px")}>סיסמה</label>
                  {" "}
                  <input type="password" value={v.loginPass} onChange={v.setLoginPass} style={sx("width:100%;height:42px;padding:0 12px;border:1px solid #DEDCD5;background:#FBFAF8;font-size:14px;margin-bottom:20px")} />
                  {" "}
                  <button className="hv-2" onClick={v.doLogin} style={sx("width:100%;height:44px;background:#1A1A17;color:#fff;border:0;font-size:14px;font-weight:500;cursor:pointer")}>
                    כניסה
                  </button>
                  {" "}
                  <div style={sx("text-align:center;margin-top:16px;font-size:13px;color:#6B6A63")}>
                    {"חדש כאן? "}
                    <a href="#" onClick={v.goSignup}>פתיחת חשבון</a>
                  </div>
                  {" "}
                </div>
                {" "}
                <div style={sx("display:flex;justify-content:center;gap:16px;margin-top:22px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#A8A69C;flex-wrap:wrap")}>
                  <span>V4-IN</span>
                  <span>V4-OUT</span>
                  <span>OMER-U</span>
                  <span>AC-8×2</span>
                  <span>SPR</span>
                  <span>CBL</span>
                </div>
                {" "}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
