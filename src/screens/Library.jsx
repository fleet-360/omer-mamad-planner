// ספריית אלמנטים
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment, useState } from 'react';
import { recolor } from '../app/theme.js';
import { sx, tx } from '../ui/dom.jsx';
import { OREN_SIGNS } from '../app/catalog.js';

// Oren's signs drawn on a wall corner in plan view, in his own colors (not themed).
function SignSketch({ k, colors }) {
  const c = colors[0], head = (x, y, d) => <polyline points={`${x - 10 * d},${y - 7} ${x},${y} ${x - 10 * d},${y + 7}`} fill="none" stroke={c} strokeWidth="2.5" />;
  return (
    <svg viewBox="0 0 240 120" style={sx("width:100%;display:block")}>
      <rect x="0" y="0" width="240" height="120" fill="#fff" />
      <path d="M20 40H220V62H42V112H20Z" fill="#E9E7E1" stroke="#1A1A17" strokeWidth="1.5" />
      {k === 'unit' ? <><rect x="104" y="54" width="48" height="14" fill={colors[1]} fillOpacity=".56" stroke={c} strokeWidth="2" /><line x1="128" y1="28" x2="128" y2="96" stroke={c} strokeWidth="2" /></> : null}
      {['axis', 'vent', 'cable'].includes(k) ? <line x1="128" y1="26" x2="128" y2="98" stroke={c} strokeWidth="3" /> : null}
      {k === 'cable' ? <text x="136" y="100" fill={c} fontSize="12" style={{ direction: 'ltr' }}>H=2.25</text> : null}
      {k === 'arrow' ? <><line x1="128" y1="26" x2="128" y2="98" stroke={c} strokeWidth="1.5" strokeOpacity=".5" /><line x1="196" y1="88" x2="133" y2="88" stroke={c} strokeWidth="2.5" />{head(133, 88, -1)}</> : null}
      {k === 'note' ? <><rect x="76" y="70" width="140" height="42" fill="#fff" stroke={c} strokeWidth="1.5" /><text x="88" y="87" fill={c} fontSize="11" style={{ direction: 'ltr' }}>1.10 m · H = -38</text><line x1="88" y1="99" x2="196" y2="99" stroke={c} strokeOpacity=".45" strokeWidth="3" /></> : null}
      {k === 'same' ? <><rect x="152" y="72" width="60" height="36" fill="none" stroke="#8C8A82" strokeDasharray="4 3" /><line x1="66" y1="90" x2="144" y2="90" stroke={c} strokeWidth="3" />{head(144, 90, 1)}</> : null}
    </svg>
  );
}

// Added outside the design: the downloads explanation, the "add element" button, card and form.
const SWATCHES = ['#2D94CF', '#2F6F4E', '#0B7285', '#6741D9', '#C2255C', '#E8590C', '#495057', '#B08900'];
const EMPTY = { name: '', code: '', dim: '', shape: 'round', color: SWATCHES[0], specs: '' };
const LABEL = "display:block;font-size:12px;font-weight:500;color:#4A4943;margin-bottom:6px";
const INPUT = "width:100%;height:40px;padding:0 11px;border:1px solid #DEDCD5;background:#FBFAF8;font-size:13px";
const PRIMARY = "height:40px;padding:0 18px;background:#4C6EF5;color:#fff;border:0;font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap";

export default function Library({ v }) {
  const [form, setForm] = useState(null);
  const [soon, setSoon] = useState(null);
  const field = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  const add = () => {
    v.addElement({ ...form, name: form.name.trim(), specs: form.specs.split('\n').map((s) => s.trim()).filter(Boolean) });
    setForm(null);
  };
  return (
    <>
      <div style={sx("flex:1;padding:32px 28px 60px;display:flex;justify-content:center")}>
        <div style={sx("width:100%;max-width:1120px")}>
          {" "}
          <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 18px")}>
            <h1 style={sx("font-size:24px;font-weight:600;margin:0")}>ספריית אלמנטים · קטלוג עומר</h1>
            <button className="hv-1" onClick={() => setForm(EMPTY)} style={sx(PRIMARY)}>+ הוספת אלמנט</button>
          </div>
          <div style={sx("display:flex;gap:12px;align-items:flex-start;background:#F7F8FF;border:1px solid #C9D0F7;padding:14px 16px;margin-bottom:20px;font-size:13px;color:#4A4943;line-height:1.55")}>
            <div style={sx("width:22px;height:22px;border-radius:50%;background:#4C6EF5;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex:none")}>i</div>
            <div>
              <div style={sx("font-weight:600;color:#1A1A17;margin-bottom:2px")}>קבצים להורדה</div>
              כל אלמנט זמין כבלוק DWG להכנסה לשרטוט האדריכל ב‑AutoCAD, וכדף מוצר PDF עם הממדים וכללי ההצבה. בהדגמה הזו הקבצים עדיין לא מחוברים.
            </div>
          </div>
          {form ? (
            <div style={sx("background:#fff;border:1.5px solid #4C6EF5;padding:20px;margin-bottom:20px")}>
              <div style={sx("font-size:16px;font-weight:600;margin-bottom:16px")}>אלמנט חדש</div>
              <div style={sx("display:grid;grid-template-columns:2fr 1fr 1fr;gap:14px;margin-bottom:14px")}>
                <label><span style={sx(LABEL)}>שם האלמנט</span><input {...field('name')} placeholder="לדוגמה: התקן עומר SA-3" style={sx(INPUT)} /></label>
                <label><span style={sx(LABEL)}>קוד</span><input {...field('code')} placeholder="OM-SA3" style={sx(INPUT + ";direction:ltr")} /></label>
                <label><span style={sx(LABEL)}>מידות</span><input {...field('dim')} placeholder="Ø70" style={sx(INPUT + ";direction:ltr")} /></label>
              </div>
              <div style={sx("display:flex;gap:28px;flex-wrap:wrap;margin-bottom:14px")}>
                <div>
                  <span style={sx(LABEL)}>צורה</span>
                  <div style={sx("display:flex;gap:6px")}>
                    {[['round', 'עגול'], ['rect', 'מלבני']].map(([k, l]) => (
                      <button key={k} onClick={() => setForm({ ...form, shape: k })} style={sx("height:34px;padding:0 14px;font-size:12.5px;cursor:pointer;border:1px solid " + (form.shape === k ? '#4C6EF5;background:#F2F4FF;color:#26398F' : '#DEDCD5;background:#fff;color:#4A4943'))}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={sx(LABEL)}>צבע</span>
                  <div style={sx("display:flex;gap:8px;height:34px;align-items:center")}>
                    {SWATCHES.map((c) => (
                      <button key={c} onClick={() => setForm({ ...form, color: c })} aria-label={c}
                        style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: 0, boxShadow: form.color === c ? '0 0 0 2px #fff,0 0 0 4px ' + c : 'none' }} />
                    ))}
                  </div>
                </div>
              </div>
              <label><span style={sx(LABEL)}>כללי הצבה</span>
                <textarea {...field('specs')} rows={3} placeholder="שורה לכל כלל" style={sx("width:100%;padding:9px 11px;border:1px solid #DEDCD5;background:#FBFAF8;font-size:13px;resize:vertical;font-family:inherit")} />
              </label>
              <div style={sx("display:flex;gap:8px;margin-top:16px")}>
                <button className="hv-1" onClick={add} disabled={!form.name.trim()} style={sx(PRIMARY + (form.name.trim() ? '' : ';opacity:.45;cursor:not-allowed'))}>הוסף לקטלוג</button>
                <button className="hv-5" onClick={() => setForm(null)} style={sx("height:40px;padding:0 16px;background:#fff;border:1px solid #DEDCD5;font-size:13px;cursor:pointer")}>ביטול</button>
              </div>
            </div>
          ) : null}
          {" "}
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px")}>
            {(v.catalog || []).map((c, i0) => (
              <Fragment key={i0}>
                <div style={sx("background:#fff;border:1px solid #DEDCD5;display:flex;flex-direction:column")}>
                  <div style={sx("display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #EDEBE4")}>
                    <div style={sx(c.dotStyle)}>{tx(c.num)}</div>
                    <div style={sx("flex:1;min-width:0")}>
                      {" "}
                      <div style={sx("font-size:13.5px;font-weight:600;line-height:1.3")}>{tx(c.name)}</div>
                      {" "}
                      <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#8C8A82")}>{tx(c.code)}</div>
                      {" "}
                    </div>
                  </div>
                  <div style={sx("background:#FBFAF8;padding:14px;border-bottom:1px solid #EDEBE4")}>
                    {" "}
                    <svg viewBox="0 0 240 120" style={sx("width:100%;display:block")}>
                      <rect x="0" y="0" width="240" height="120" fill="#fff" />
                      <g stroke="#1A1A17" fill="none" strokeWidth="2">
                        <rect x="52" y="28" width="136" height="62" />
                      </g>
                      <g stroke="#C9C6BC" strokeWidth="1">
                        <line x1="52" y1="90" x2="70" y2="28" />
                        <line x1="70" y1="90" x2="88" y2="28" />
                        <line x1="152" y1="90" x2="170" y2="28" />
                        <line x1="170" y1="90" x2="188" y2="28" />
                      </g>
                      {c.round ? (
                        <>
                          <circle cx="120" cy="59" r="25" fill="#fff" stroke={recolor(c.color)} strokeWidth="2.5" />
                          <circle cx="120" cy="59" r="19" fill="none" stroke={recolor(c.color)} strokeWidth="1.2" />
                        </>
                      ) : null}
                      {c.rect ? (
                        <>
                          <rect x="94" y="36" width="52" height="46" fill="#fff" stroke={recolor(c.color)} strokeWidth="2.5" />
                          <rect x="100" y="42" width="40" height="34" fill="none" stroke={recolor(c.color)} strokeWidth="1.2" />
                        </>
                      ) : null}
                      <g stroke="#8C8A82" strokeWidth="1">
                        <line x1="52" y1="106" x2="188" y2="106" />
                        <line x1="52" y1="102" x2="52" y2="110" />
                        <line x1="188" y1="102" x2="188" y2="110" />
                      </g>
                    </svg>
                    {" "}
                    <div style={sx("text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#8C8A82;margin-top:4px")}>{tx(c.dim)}</div>
                    {" "}
                  </div>
                  <div style={sx("padding:13px 16px;display:flex;flex-direction:column;gap:6px;flex:1")}>
                    {(c.specs || []).map((s, i1) => (
                      <Fragment key={i1}>
                        <div style={sx("display:flex;gap:7px;font-size:12px;color:#4A4943;line-height:1.5")}>
                          <span style={sx("color:#C9C6BC;flex:none")}>·</span>
                          <span>{tx(s)}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div style={sx("display:flex;gap:6px;padding:12px 14px;border-top:1px solid #EDEBE4;background:#FBFAF8")}>
                    <button className="hv-2" onClick={() => setSoon(i0)} title="בלוק AutoCAD להכנסה לשרטוט" style={sx("flex:1;height:33px;background:#1A1A17;color:#fff;border:0;font-size:12.5px;font-weight:500;cursor:pointer")}>
                      הורד DWG
                    </button>
                    <button className="hv-5" onClick={() => setSoon(i0)} title="דף מוצר: ממדים וכללי הצבה" style={sx("height:33px;padding:0 12px;background:#fff;border:1px solid #DEDCD5;font-size:12.5px;cursor:pointer")}>PDF</button>
                  </div>
                  {soon === i0 ? <div style={sx("padding:0 14px 12px;background:#FBFAF8;font-size:11.5px;color:#6B6A63")}>הקובץ יהיה זמין בגרסה הבאה.</div> : null}
                </div>
              </Fragment>
            ))}
            <button className="hv-8" onClick={() => setForm(EMPTY)} style={sx("min-height:280px;border:2px dashed #C9D0F7;background:#F7F8FF;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;cursor:pointer;color:#26398F;font-family:inherit")}>
              <span style={sx("width:52px;height:52px;border-radius:50%;background:#4C6EF5;color:#fff;font-size:30px;line-height:52px;font-weight:300")}>+</span>
              <span style={sx("font-size:15px;font-weight:600")}>הוספת אלמנט לקטלוג</span>
              <span style={sx("font-size:12.5px;color:#6B7BC9;max-width:240px;text-align:center;line-height:1.5")}>מוצר נוסף או מעבר מאושר אחר. יופיע מיד בסרגל השרטוט.</span>
            </button>
          </div>
          <div style={sx("margin:40px 0 16px")}>
            <h2 style={sx("font-size:18px;font-weight:600;margin:0 0 4px")}>סימני הסימון של אורן</h2>
            <div style={sx("font-size:13px;color:#6B6A63;line-height:1.55;max-width:720px")}>המקרא שאורן סקורניק משתמש בו כשהוא מסמן תוכניות. נקרא מהסימונים ב‑10 מתוך 12 התוכניות שאורנים שלחו.</div>
          </div>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px")}>
            {OREN_SIGNS.map((g) => (
              <div key={g.k} style={sx("background:#fff;border:1px solid #DEDCD5;display:flex;flex-direction:column")}>
                <div style={sx("display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #EDEBE4")}>
                  <div style={sx("display:flex;gap:4px;flex:none")}>{g.colors.map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />)}</div>
                  <div style={sx("flex:1;min-width:0;font-size:13.5px;font-weight:600;line-height:1.3")}>{g.name}</div>
                  <div style={sx("font-size:11.5px;color:#8C8A82;white-space:nowrap")}>תוכניות <span style={sx("font-variant-numeric:tabular-nums;color:#4A4943;font-weight:600")}>{g.plans}</span></div>
                </div>
                <div style={sx("background:#FBFAF8;padding:14px;border-bottom:1px solid #EDEBE4")}><SignSketch k={g.k} colors={g.colors} /></div>
                <div style={sx("padding:13px 16px;display:flex;flex-direction:column;gap:6px;flex:1;font-size:12px;color:#4A4943;line-height:1.5")}>
                  <div style={sx("color:#1A1A17;font-weight:500")}>{g.draw}</div>
                  {(g.specs || []).map((s) => <div key={s} style={sx("display:flex;gap:7px")}><span style={sx("color:#C9C6BC;flex:none")}>·</span><span>{s}</span></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
