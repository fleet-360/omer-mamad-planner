// הפקת קובץ
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Export({ v }) {
  return (
    <>
      <div style={sx("flex:1;padding:32px 28px 60px;display:flex;justify-content:center")}>
        <div style={sx("width:100%;max-width:1120px")}>
          {" "}
          <h1 style={sx("font-size:24px;font-weight:600;margin:0 0 4px")}>הפקת הקובץ</h1>
          {" "}
          <p style={sx("font-size:13.5px;color:#6B6A63;margin:0 0 24px")}>גרסה 04 · מגדל הדר, קומה 3 · אושרו 2 דירות</p>
          {" "}
          <div style={sx("display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px;align-items:start")}>
            <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:16px")}>
              {" "}
              <div style={sx("border:1px solid #DEDCD5;background:#fff;padding:14px;display:flex;flex-direction:column;gap:10px")}>
                <div style={sx("border:1.5px solid #1A1A17;padding:10px")}>
                  {" "}
                  <svg viewBox="0 0 1000 560" style={sx("width:100%;display:block")}>
                    <g stroke="#1A1A17" fill="none">
                      <rect x="30" y="30" width="700" height="480" strokeWidth="6" />
                      <line x1="380" y1="30" x2="380" y2="510" strokeWidth="6" />
                      <rect x="580" y="60" width="130" height="130" strokeWidth="8" />
                      <rect x="50" y="60" width="130" height="130" strokeWidth="8" />
                    </g>
                    <g stroke="#4A4943" strokeWidth="2.5" fill="none">
                      <line x1="380" y1="280" x2="580" y2="280" />
                      <line x1="580" y1="280" x2="580" y2="510" />
                      <line x1="180" y1="280" x2="380" y2="280" />
                      <line x1="180" y1="280" x2="180" y2="510" />
                    </g>
                    {(v.sheetDots || []).map((d, i0) => (
                      <Fragment key={i0}>
                        <circle cx={d.cx} cy={d.cy} r="11" fill={d.color} />
                      </Fragment>
                    ))}
                    <g stroke="#1A1A17" fill="none" strokeWidth="1.5">
                      <rect x="756" y="30" width="214" height="480" />
                      <line x1="756" y1="70" x2="970" y2="70" />
                      <line x1="756" y1="300" x2="970" y2="300" />
                      <line x1="756" y1="430" x2="970" y2="430" />
                    </g>
                    <g fontFamily="Rubik" fill="#1A1A17">
                      <text x="960" y="56" textAnchor="end" fontSize="16" fontWeight="600">פרטי ממ״ד · התקן עומר</text>
                      <text x="960" y="94" textAnchor="end" fontSize="12" fill="#6B6A63">רשימת סימונים</text>
                    </g>
                    <g fontFamily="IBM Plex Mono" fontSize="13" fill="#1A1A17">
                      <circle cx="948" cy="124" r="9" fill="#2F6F4E" />
                      <text x="930" y="129" textAnchor="end">V4-IN</text>
                      <circle cx="948" cy="154" r="9" fill="#0B7285" />
                      <text x="930" y="159" textAnchor="end">V4-OUT</text>
                      <circle cx="948" cy="184" r="9" fill="#4C6EF5" />
                      <text x="930" y="189" textAnchor="end">OMER</text>
                      <circle cx="948" cy="214" r="9" fill="#6741D9" />
                      <text x="930" y="219" textAnchor="end">AC-8×2</text>
                      <circle cx="948" cy="244" r="9" fill="#C2255C" />
                      <text x="930" y="249" textAnchor="end">SPR</text>
                      <circle cx="948" cy="274" r="9" fill="#E8590C" />
                      <text x="930" y="279" textAnchor="end">CBL</text>
                    </g>
                    <g fontFamily="IBM Plex Mono" fontSize="13" fill="#6B6A63">
                      <text x="960" y="326" textAnchor="end">PROJECT HADAR-B / FLOOR 03</text>
                      <text x="960" y="350" textAnchor="end">SCALE 1:50</text>
                      <text x="960" y="374" textAnchor="end">REV 04</text>
                      <text x="960" y="398" textAnchor="end">DATE 09.09.2026</text>
                      <text x="960" y="422" textAnchor="end">LAYER OMER-DETAILS</text>
                      <text x="960" y="462" textAnchor="end" fontSize="14">ARCH-STUDIO LTD.</text>
                      <text x="960" y="486" textAnchor="end" fontSize="14">OMER ORIGINAL STANDARD</text>
                    </g>
                  </svg>
                  {" "}
                </div>
              </div>
              {" "}
            </div>
            <div style={sx("display:flex;flex-direction:column;gap:16px")}>
              <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:18px")}>
                {" "}
                <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:14px")}>פורמט הפלט</div>
                {" "}
                {(v.formats || []).map((f, i1) => (
                  <Fragment key={i1}>
                    {" "}
                    <label style={sx(f.style)}>
                      {" "}
                      <input type="checkbox" checked={f.checked} style={sx("width:15px;height:15px;accent-color:#4C6EF5;flex:none")} />
                      {" "}
                      <div style={sx("flex:1;min-width:0")}>
                        {" "}
                        <div style={sx("font-size:13px;font-weight:500")}>{tx(f.name)}</div>
                        {" "}
                        <div style={sx("font-size:11.5px;color:#8C8A82")}>{tx(f.desc)}</div>
                        {" "}
                      </div>
                      {" "}
                      <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#A8A69C")}>{tx(f.size)}</div>
                      {" "}
                    </label>
                    {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
              <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:18px")}>
                {" "}
                <button className="hv-1" onClick={v.doExport} style={sx("width:100%;height:44px;background:#4C6EF5;color:#fff;border:0;font-size:14px;font-weight:500;cursor:pointer")}>
                  {tx(v.exportLabel)}
                </button>
                {" "}
                {v.exportDone ? (
                  <>
                    {" "}
                    <div style={sx("margin-top:14px;border:1px solid #EDEBE4;background:#FBFAF8;padding:12px 14px;animation:fadeUp .3s ease both")}>
                      {" "}
                      <div style={sx("font-size:12.5px;font-weight:500;color:#2F6F4E;margin-bottom:5px")}>הקובץ הופק ונשמר בגרסה 05</div>
                      {" "}
                      <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#6B6A63;line-height:1.7")}>
                        HADAR-B-F03-OMER-R05.dwg
                        <br />
                        HADAR-B-F03-OMER-R05.pdf
                      </div>
                      {" "}
                    </div>
                    {" "}
                  </>
                ) : null}
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
