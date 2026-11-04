// ספריית אלמנטים
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Library({ v }) {
  return (
    <>
      <div style={sx("flex:1;padding:32px 28px 60px;display:flex;justify-content:center")}>
        <div style={sx("width:100%;max-width:1120px")}>
          {" "}
          <h1 style={sx("font-size:24px;font-weight:600;margin:0 0 24px")}>ספריית אלמנטים · קטלוג עומר</h1>
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
                          <circle cx="120" cy="59" r="25" fill="#fff" stroke={c.color} strokeWidth="2.5" />
                          <circle cx="120" cy="59" r="19" fill="none" stroke={c.color} strokeWidth="1.2" />
                        </>
                      ) : null}
                      {c.rect ? (
                        <>
                          <rect x="94" y="36" width="52" height="46" fill="#fff" stroke={c.color} strokeWidth="2.5" />
                          <rect x="100" y="42" width="40" height="34" fill="none" stroke={c.color} strokeWidth="1.2" />
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
                    <button className="hv-2" style={sx("flex:1;height:33px;background:#1A1A17;color:#fff;border:0;font-size:12.5px;font-weight:500;cursor:pointer")}>
                      הורד DWG
                    </button>
                    <button className="hv-5" style={sx("height:33px;padding:0 12px;background:#fff;border:1px solid #DEDCD5;font-size:12.5px;cursor:pointer")}>PDF</button>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          {" "}
        </div>
      </div>
    </>
  );
}
