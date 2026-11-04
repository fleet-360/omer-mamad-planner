// סרגל עליון
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function TopBar({ v }) {
  return (
    <>
      <div style={sx("position:sticky;top:0;z-index:60;background:#1A1A17;color:#F4F2ED;padding:0 20px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;min-height:52px;box-shadow:0 1px 0 rgba(0,0,0,.2)")}>
        <div style={sx("display:flex;align-items:center;gap:9px;padding-left:14px;border-left:1px solid #3A3934")}>
          <div style={sx("width:18px;height:18px;border:2px solid #4C6EF5;position:relative")}>
            <div style={sx("position:absolute;inset:3px;background:#4C6EF5")} />
          </div>
          <span style={sx("font-size:13px;font-weight:500;letter-spacing:.02em")}>מערכת תכנון ממ״ד · התקן עומר</span>
        </div>
        <div style={sx("display:flex;gap:4px;flex-wrap:wrap;flex:1")}>
          {(v.navItems || []).map((it, i0) => (
            <Fragment key={i0}>
              <button onClick={it.go} style={sx(it.style)}>{tx(it.label)}</button>
            </Fragment>
          ))}
        </div>
        {v.variantSwitch ? (
          <>
            <div style={sx("display:flex;align-items:center;gap:8px;font-size:11px;color:#8C8A82")}>
              <span>{tx(v.variantLabel)}</span>
              <div style={sx("display:flex;border:1px solid #3A3934;border-radius:3px;overflow:hidden")}>
                <button onClick={v.setVarA} style={sx(v.varAStyle)}>א</button>
                <button onClick={v.setVarB} style={sx(v.varBStyle)}>ב</button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
