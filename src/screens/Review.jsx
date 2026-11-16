// בדיקה ואישור
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Review({ v }) {
  return (
    <>
      <div style={sx("flex:1;padding:32px 28px 60px;display:flex;justify-content:center")}>
        <div style={sx("width:100%;max-width:1120px")}>
          {" "}
          <div style={sx("display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px")}>
            <div>
              {" "}
              <h1 style={sx("font-size:24px;font-weight:600;margin:0 0 4px")}>בדיקה ואישור לפני הפקה</h1>
              {" "}
              <p style={sx("font-size:13.5px;color:#6B6A63;margin:0")}>מגדל הדר · קומה 3 · 2 גרעיני ממ״ד</p>
              {" "}
            </div>
            <div style={sx("display:flex;gap:8px")}>
              <button className="hv-5" onClick={v.goCanvas} style={sx("height:38px;padding:0 16px;background:#fff;border:1px solid #DEDCD5;font-size:13px;cursor:pointer")}>
                חזרה לשרטוט
              </button>
              <button className="hv-1" onClick={v.goExport} style={sx("height:38px;padding:0 20px;background:#4C6EF5;color:#fff;border:0;font-size:13px;font-weight:500;cursor:pointer")}>
                אשר והפק קובץ
              </button>
            </div>
          </div>
          {" "}
          <div style={sx("display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:16px;align-items:start")}>
            <div style={sx("background:#fff;border:1px solid #DEDCD5")}>
              {" "}
              <div style={sx("padding:14px 18px;border-bottom:1px solid #EDEBE4;display:flex;gap:14px;align-items:center;flex-wrap:wrap")}>
                <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82")}>בדיקות</div>
                <div style={sx("display:flex;gap:12px;font-size:12px")}>
                  <span style={sx("display:flex;align-items:center;gap:6px")}>
                    <span style={sx("width:8px;height:8px;background:#2F6F4E")} />
                    11 עברו
                  </span>
                  <span style={sx("display:flex;align-items:center;gap:6px")}>
                    <span style={sx("width:8px;height:8px;background:#E8590C")} />
                    2 אזהרות
                  </span>
                  <span style={sx("display:flex;align-items:center;gap:6px")}>
                    <span style={sx("width:8px;height:8px;background:#C2255C")} />
                    1 חוסמת
                  </span>
                </div>
              </div>
              {" "}
              {(v.checks || []).map((c, i0) => (
                <Fragment key={i0}>
                  {" "}
                  <div style={sx("display:flex;gap:12px;padding:13px 18px;border-bottom:1px solid #F4F2ED;align-items:flex-start")}>
                    <span style={sx(c.mark)}>{tx(c.icon)}</span>
                    <div style={sx("flex:1;min-width:0")}>
                      {" "}
                      <div style={sx("font-size:13px;font-weight:500;margin-bottom:2px")}>{tx(c.title)}</div>
                      {" "}
                      <div style={sx("font-size:12px;color:#6B6A63;line-height:1.55")}>{tx(c.desc)}</div>
                      {" "}
                    </div>
                    <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#A8A69C;flex:none")}>{tx(c.apt)}</div>
                  </div>
                  {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            <div style={sx("display:flex;flex-direction:column;gap:16px")}>
              <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:14px")}>
                {" "}
                <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:10px")}>תצוגה מקדימה</div>
                {" "}
                <div style={sx("border:1px solid #EDEBE4;background:#fff;padding:8px")}>
                  {" "}
                  <svg viewBox="0 0 1000 640" style={sx("width:100%;display:block")}>
                    <image href="/plans/b2-floor5.jpg" x="0" y="0" width="1000" height="640" preserveAspectRatio="none" />
                    {(v.previewDots || []).map((d, i1) => (
                      <Fragment key={i1}>
                        <circle cx={d.cx} cy={d.cy} r="15" fill={d.color} />
                      </Fragment>
                    ))}
                  </svg>
                  {" "}
                </div>
                {" "}
              </div>
              <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:16px 18px")}>
                {" "}
                <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:12px")}>רשימת סימונים</div>
                {" "}
                {(v.legend || []).map((l, i2) => (
                  <Fragment key={i2}>
                    {" "}
                    <div style={sx("display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid #F4F2ED")}>
                      <div style={sx(l.dotStyle)}>{tx(l.num)}</div>
                      <div style={sx("flex:1;font-size:12.5px")}>{tx(l.name)}</div>
                      <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8C8A82")}>
                        ×
                        {tx(l.count)}
                      </div>
                    </div>
                    {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
            </div>
          </div>
          {" "}
        </div>
      </div>
    </>
  );
}
