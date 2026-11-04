// חבילות
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Plans({ v }) {
  return (
    <>
      <div style={sx("flex:1;padding:40px 24px 64px;display:flex;justify-content:center")}>
        <div style={sx("width:100%;max-width:1180px")}>
          {" "}
          <div style={sx("text-align:center;max-width:620px;margin:0 auto 34px")}>
            {" "}
            <h1 style={sx("font-size:28px;font-weight:600;margin:0;letter-spacing:-.02em")}>חבילת תכנון</h1>
            {" "}
          </div>
          {" "}
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;align-items:stretch")}>
            {(v.plans || []).map((p, i0) => (
              <Fragment key={i0}>
                <div style={sx(p.style)}>
                  {" "}
                  <div>
                    {" "}
                    <div style={sx("display:flex;align-items:center;justify-content:space-between;margin-bottom:10px")}>
                      <div style={sx("font-size:15px;font-weight:600")}>{tx(p.name)}</div>
                      {p.tag ? (
                        <>
                          <div style={sx("font-size:10.5px;font-family:'IBM Plex Mono',monospace;background:#4C6EF5;color:#fff;padding:3px 7px")}>{tx(p.tag)}</div>
                        </>
                      ) : null}
                    </div>
                    {" "}
                    <div style={sx("display:flex;align-items:baseline;gap:5px;margin-bottom:4px")}>
                      <span style={sx("font-size:30px;font-weight:600;letter-spacing:-.02em")}>{tx(p.price)}</span>
                      <span style={sx("font-size:12.5px;color:#8C8A82")}>{tx(p.per)}</span>
                    </div>
                    {" "}
                    <div style={sx("font-size:12.5px;color:#6B6A63;margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid #EDEBE4")}>{tx(p.sub)}</div>
                    {" "}
                    <div style={sx("display:flex;flex-direction:column;gap:9px;font-size:13px;color:#4A4943;margin-bottom:24px")}>
                      {(p.features || []).map((f, i1) => (
                        <Fragment key={i1}>
                          <div style={sx("display:flex;gap:8px;align-items:flex-start")}>
                            <span style={sx("color:#4C6EF5;flex:none")}>·</span>
                            <span>{tx(f)}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  {" "}
                  <button onClick={p.go} style={sx(p.btnStyle)}>{tx(p.cta)}</button>
                  {" "}
                </div>
              </Fragment>
            ))}
          </div>
          {" "}
          <div style={sx("text-align:center;margin-top:26px;font-size:12.5px;color:#8C8A82")}>המחירים להמחשה בלבד וטרם הוגדרו. ניתן לשדרג או להוריד חבילה בכל עת.</div>
          {" "}
        </div>
      </div>
    </>
  );
}
