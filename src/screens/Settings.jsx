// הגדרות תקן
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Settings({ v }) {
  return (
    <>
      <div style={sx("flex:1;padding:32px 28px 60px;display:flex;justify-content:center")}>
        <div style={sx("width:100%;max-width:860px")}>
          {" "}
          <h1 style={sx("font-size:24px;font-weight:600;margin:0 0 24px")}>הגדרות תקן והעדפות ברירת מחדל</h1>
          {" "}
          <div style={sx("display:flex;flex-direction:column;gap:16px")}>
            {(v.settingGroups || []).map((g, i0) => (
              <Fragment key={i0}>
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:22px 24px")}>
                  {" "}
                  <div style={sx("font-size:14px;font-weight:600;margin-bottom:14px")}>{tx(g.label)}</div>
                  {" "}
                  {(g.rows || []).map((r, i1) => (
                    <Fragment key={i1}>
                      {" "}
                      <div style={sx("display:flex;align-items:center;gap:16px;padding:12px 0;border-top:1px solid #F4F2ED")}>
                        <div style={sx("flex:1;min-width:0")}>
                          {" "}
                          <div style={sx("font-size:13px;font-weight:500")}>{tx(r.label)}</div>
                          {" "}
                          <div style={sx("font-size:12px;color:#8C8A82")}>{tx(r.desc)}</div>
                          {" "}
                        </div>
                        {r.isInput ? (
                          <>
                            <input defaultValue={r.value} style={sx("width:96px;height:36px;padding:0 10px;border:1px solid #DEDCD5;background:#FBFAF8;font-family:'IBM Plex Mono',monospace;text-align:center;flex:none")} />
                          </>
                        ) : null}
                        {r.isToggle ? (
                          <>
                            <button onClick={r.go} style={sx(r.toggleStyle)}>
                              <span style={sx(r.knobStyle)} />
                            </button>
                          </>
                        ) : null}
                      </div>
                      {" "}
                    </Fragment>
                  ))}
                  {" "}
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
