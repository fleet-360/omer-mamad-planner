// חיוב וחשבוניות
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Billing({ v }) {
  return (
    <>
      <div style={sx("flex:1;padding:32px 28px 60px;display:flex;justify-content:center")}>
        <div style={sx("width:100%;max-width:1000px")}>
          {" "}
          <h1 style={sx("font-size:24px;font-weight:600;margin:0 0 24px")}>חיוב וחשבוניות</h1>
          {" "}
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-bottom:16px")}>
            <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:18px")}>
              {" "}
              <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:10px")}>החבילה הנוכחית</div>
              {" "}
              <div style={sx("font-size:19px;font-weight:600;margin-bottom:4px")}>מקצועי</div>
              {" "}
              <div style={sx("font-size:12.5px;color:#6B6A63;margin-bottom:14px")}>חידוש ב‑01.10.2026</div>
              {" "}
              <button className="hv-5" onClick={v.goPlans} style={sx("height:34px;padding:0 14px;background:#fff;border:1px solid #DEDCD5;font-size:12.5px;cursor:pointer")}>
                שינוי חבילה
              </button>
              {" "}
            </div>
            <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:18px")}>
              {" "}
              <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:10px")}>ניצול שרטוטים</div>
              {" "}
              <div style={sx("display:flex;align-items:baseline;gap:5px;margin-bottom:10px")}>
                <span style={sx("font-size:26px;font-weight:600")}>18</span>
                <span style={sx("font-size:13px;color:#8C8A82")}>/ 40 בחודש</span>
              </div>
              {" "}
              <div style={sx("height:5px;background:#EDEBE4")}>
                <div style={sx("width:45%;height:100%;background:#4C6EF5")} />
              </div>
              {" "}
            </div>
            <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:18px")}>
              {" "}
              <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:10px")}>אמצעי תשלום</div>
              {" "}
              <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:14px;margin-bottom:4px")}>•••• 4417</div>
              {" "}
              <div style={sx("font-size:12.5px;color:#6B6A63;margin-bottom:14px")}>תוקף 08/29</div>
              {" "}
              <button className="hv-5" style={sx("height:34px;padding:0 14px;background:#fff;border:1px solid #DEDCD5;font-size:12.5px;cursor:pointer")}>עדכון כרטיס</button>
              {" "}
            </div>
          </div>
          {" "}
          <div style={sx("background:#fff;border:1px solid #DEDCD5")}>
            {" "}
            <div style={sx("display:grid;grid-template-columns:110px minmax(0,1fr) 110px 90px 90px;gap:12px;padding:11px 18px;border-bottom:1px solid #DEDCD5;font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.06em;color:#8C8A82")}>
              <div>חשבונית</div>
              <div>תיאור</div>
              <div>סכום</div>
              <div>מצב</div>
              <div />
            </div>
            {" "}
            {(v.invoices || []).map((v, i0) => (
              <Fragment key={i0}>
                {" "}
                <div style={sx("display:grid;grid-template-columns:110px minmax(0,1fr) 110px 90px 90px;gap:12px;padding:13px 18px;border-bottom:1px solid #F4F2ED;align-items:center")}>
                  <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:12.5px")}>{tx(v.id)}</div>
                  <div style={sx("font-size:13px")}>{tx(v.desc)}</div>
                  <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:12.5px")}>{tx(v.sum)}</div>
                  <div style={sx(v.stateStyle)}>{tx(v.state)}</div>
                  <div style={sx("text-align:left")}>
                    <a href="#" style={sx("font-size:12px")}>PDF</a>
                  </div>
                </div>
                {" "}
              </Fragment>
            ))}
            {" "}
          </div>
          {" "}
        </div>
      </div>
    </>
  );
}
