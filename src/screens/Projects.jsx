// פרויקטים: the system's home after login. Not in the original design.
import { sx } from '../ui/dom.jsx';

const TH = "padding:10px 16px;font-size:11.5px;font-weight:600;color:#8C8A82;text-align:start;border-bottom:1px solid #DEDCD5;background:#FBFAF8";
const TD = "padding:14px 16px;font-size:13.5px;color:#4A4943;border-bottom:1px solid #EDEBE4;text-align:start";

export default function Projects({ v }) {
  const p = v.project;
  return (
    <div style={sx("flex:1;padding:32px 28px 60px;display:flex;justify-content:center")}>
      <div style={sx("width:100%;max-width:1120px")}>
        <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px")}>
          <div>
            <h1 style={sx("font-size:24px;font-weight:600;margin:0 0 4px")}>פרויקטים</h1>
            <div style={sx("font-size:13px;color:#6B6A63")}>פרויקט אחד · ARCH-STUDIO</div>
          </div>
          <button className="hv-1" onClick={() => v.go('wizard')} style={sx("height:40px;padding:0 18px;background:#4C6EF5;color:#fff;border:0;font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit")}>+ פרויקט חדש</button>
        </div>
        <div style={sx("background:#fff;border:1px solid #DEDCD5;overflow:hidden")}>
          <table style={sx("width:100%;border-collapse:collapse")}>
            <thead>
              <tr>
                <th style={sx(TH)}>פרויקט</th><th style={sx(TH)}>כתובת</th><th style={sx(TH)}>שרטוט</th>
                <th style={sx(TH + ";text-align:end")}>ממ״דים</th><th style={sx(TH)}>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hv-4" onClick={() => v.go('canvas')} style={sx("cursor:pointer")}>
                <td style={sx(TD + ";color:#1A1A17;font-weight:600")}>{p.name}</td>
                <td style={sx(TD)}>{p.addr}</td>
                <td style={sx(TD)}>קומה 3</td>
                <td style={sx(TD + ";text-align:end;font-variant-numeric:tabular-nums")}>{p.mamads}</td>
                <td style={sx(TD)}>
                  <span style={sx("display:inline-flex;align-items:center;gap:6px")}>
                    <span style={sx("width:7px;height:7px;border-radius:50%;background:" + p.statusColor)} />{p.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
