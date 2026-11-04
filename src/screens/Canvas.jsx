// קנבס שרטוט + הצבה אוטומטית
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';
import { WheelDiv } from '../ui/WheelDiv.jsx';

export default function Canvas({ v }) {
  return (
    <>
      <div style={sx("flex:1;display:flex;flex-direction:column;height:calc(100vh - 52px);overflow:hidden;position:relative")}>
        <div style={sx("height:46px;flex:none;background:#fff;border-bottom:1px solid #DEDCD5;display:flex;align-items:center;gap:14px;padding:0 16px;overflow-x:auto")}>
          <div style={sx("display:flex;align-items:center;gap:9px;min-width:0")}>
            <span style={sx("font-size:13.5px;font-weight:500;white-space:nowrap")}>מגדל הדר · קומה 3</span>
            <span style={sx("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8C8A82;white-space:nowrap")}>1:50 · DWG</span>
          </div>
          <div style={sx("width:1px;height:22px;background:#EDEBE4")} />
          <div style={sx("display:flex;gap:6px;align-items:center")}>
            <button className="hv-5" onClick={v.zoomOut} style={sx("width:28px;height:28px;border:1px solid #DEDCD5;background:#fff;cursor:pointer;font-size:15px;line-height:1")}>
              −
            </button>
            <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:#4A4943;width:42px;text-align:center")}>
              {tx(v.zoomPct)}
              %
            </div>
            <button className="hv-5" onClick={v.zoomIn} style={sx("width:28px;height:28px;border:1px solid #DEDCD5;background:#fff;cursor:pointer;font-size:15px;line-height:1")}>
              +
            </button>
            <button className="hv-5" onClick={v.resetView} style={sx("height:28px;padding:0 10px;border:1px solid #DEDCD5;background:#fff;cursor:pointer;font-size:12px;white-space:nowrap;flex:none")}>
              התאם למסך
            </button>
          </div>
          <div style={sx("width:1px;height:22px;background:#EDEBE4")} />
          <div style={sx("display:flex;gap:6px")}>
            {(v.layers || []).map((l, i0) => (
              <Fragment key={i0}>
                <button onClick={l.go} style={sx(l.style)}>{tx(l.label)}</button>
              </Fragment>
            ))}
          </div>
          <div style={sx("flex:1")} />
          <button className="hv-5" onClick={v.undo} style={sx("height:28px;padding:0 11px;border:1px solid #DEDCD5;background:#fff;cursor:pointer;font-size:12px;white-space:nowrap;flex:none")}>
            בטל הצבה
          </button>
          <button className="hv-1" onClick={v.startAuto} style={sx("height:32px;padding:0 16px;background:#4C6EF5;color:#fff;border:0;cursor:pointer;font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px;white-space:nowrap;flex:none")}>
            <span style={sx("width:6px;height:6px;background:#fff;border-radius:50%")} />
            {"תכנון ממ״דים אוטומטי "}
          </button>
          <button className="hv-9" onClick={v.goReview} style={sx("height:32px;padding:0 14px;background:#1A1A17;color:#fff;border:0;cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap;flex:none")}>
            לבדיקה ואישור
          </button>
        </div>
        <div style={sx("flex:1;display:flex;min-height:0;position:relative")}>
          <WheelDiv onPointerDown={v.onCanvasDown} style={sx(v.canvasWrapStyle)} onWheelNP={v.onWheel}>
            {" "}
            <div style={sx("position:absolute;inset:0;background-image:linear-gradient(#EAE8E1 1px,transparent 1px),linear-gradient(90deg,#EAE8E1 1px,transparent 1px);background-size:24px 24px;opacity:.55")} />
            {" "}
            <div ref={v.sheetRef} style={sx(v.sheetStyle)}>
              {" "}
              <svg viewBox="0 0 1000 640" style={sx("position:absolute;inset:0;width:100%;height:100%;display:block")}>
                <rect x="0" y="0" width="1000" height="640" fill="#fff" />
                <g stroke="#1A1A17" fill="none">
                  <rect x="40" y="40" width="920" height="560" strokeWidth="7" />
                  <line x1="500" y1="40" x2="500" y2="600" strokeWidth="7" />
                  <rect x="760" y="80" width="180" height="180" strokeWidth="9" />
                  <rect x="60" y="80" width="180" height="180" strokeWidth="9" />
                </g>
                <g stroke="#4A4943" strokeWidth="3" fill="none">
                  <line x1="500" y1="340" x2="760" y2="340" />
                  <line x1="760" y1="340" x2="760" y2="600" />
                  <line x1="240" y1="340" x2="500" y2="340" />
                  <line x1="240" y1="340" x2="240" y2="600" />
                  <line x1="600" y1="440" x2="760" y2="440" />
                  <line x1="240" y1="440" x2="400" y2="440" />
                </g>
                <g stroke="#1A1A17" strokeWidth="2.5" fill="none">
                  <path d="M866 260 L866 205 A55 55 0 0 1 921 260" />
                  <path d="M79 260 L79 205 A55 55 0 0 0 134 260" />
                </g>
                <g stroke="#fff" strokeWidth="11">
                  <line x1="866" y1="260" x2="921" y2="260" />
                  <line x1="79" y1="260" x2="134" y2="260" />
                </g>
                <g stroke="#1A1A17" strokeWidth="2">
                  <line x1="866" y1="260" x2="921" y2="260" />
                  <line x1="79" y1="260" x2="134" y2="260" />
                </g>
                <g stroke="#1A1A17" strokeWidth="2" fill="#fff">
                  <rect x="934" y="140" width="12" height="70" />
                  <line x1="940" y1="140" x2="940" y2="210" />
                  <rect x="54" y="140" width="12" height="70" />
                  <line x1="60" y1="140" x2="60" y2="210" />
                </g>
                <g fontFamily="Rubik" fontSize="13" fill="#8C8A82" textAnchor="middle">
                  <text x="850" y="180" fontSize="15" fill="#4A4943" fontWeight="500">ממ״ד · דירה 3א</text>
                  <text x="850" y="200" fontSize="11">300/300</text>
                  <text x="150" y="180" fontSize="15" fill="#4A4943" fontWeight="500">ממ״ד · דירה 3ב</text>
                  <text x="150" y="200" fontSize="11">300/300</text>
                  <text x="630" y="200">סלון</text>
                  <text x="350" y="200">סלון</text>
                  <text x="630" y="500">חדר שינה</text>
                  <text x="370" y="500">חדר שינה</text>
                  <text x="860" y="440">מטבח</text>
                  <text x="140" y="440">מטבח</text>
                </g>
                <g stroke="#C9C6BC" strokeWidth="1" strokeDasharray="5 4">
                  <line x1="760" y1="630" x2="940" y2="630" />
                  <line x1="60" y1="630" x2="240" y2="630" />
                </g>
                <g fontFamily="IBM Plex Mono" fontSize="11" fill="#8C8A82" textAnchor="middle">
                  <text x="850" y="626">300</text>
                  <text x="150" y="626">300</text>
                </g>
              </svg>
              {" "}
              {(v.markers || []).map((m, i1) => (
                <Fragment key={i1}>
                  {" "}
                  <div onPointerDown={m.down} onMouseEnter={m.enter} onMouseLeave={m.leave} style={sx(m.style)}>
                    {" "}
                    <div style={sx(m.dotStyle)}>{tx(m.num)}</div>
                    {" "}
                    {m.showLabel ? (
                      <>
                        {" "}
                        <div style={sx(m.labelStyle)}>{tx(m.short)}</div>
                        {" "}
                      </>
                    ) : null}
                    {" "}
                  </div>
                  {" "}
                </Fragment>
              ))}
              {" "}
              {v.autoRunning ? (
                <>
                  {" "}
                  <div style={sx("position:absolute;inset:0;pointer-events:none")}>
                    {" "}
                    {(v.scanZones || []).map((z, i2) => (
                      <Fragment key={i2}>
                        {" "}
                        <div style={sx(z.style)} />
                        {" "}
                      </Fragment>
                    ))}
                    {" "}
                  </div>
                  {" "}
                </>
              ) : null}
              {" "}
              {(v.aptBadges || []).map((b, i3) => (
                <Fragment key={i3}>
                  {" "}
                  <div style={sx(b.style)}>
                    {" "}
                    <span style={sx(b.dotStyle)} />
                    {tx(b.text)}
                    {" "}
                  </div>
                  {" "}
                </Fragment>
              ))}
              {" "}
            </div>
            {" "}
            {v.hoverCard ? (
              <>
                {" "}
                <div onMouseEnter={v.keepHover} onMouseLeave={v.dropHover} style={sx(v.hoverCardStyle)}>
                  {" "}
                  <div style={sx("display:flex;align-items:center;gap:9px;padding:12px 14px;border-bottom:1px solid #EDEBE4")}>
                    <div style={sx(v.hv.dotStyle)}>{tx(v.hv.num)}</div>
                    <div style={sx("min-width:0")}>
                      {" "}
                      <div style={sx("font-size:13.5px;font-weight:600;line-height:1.3")}>{tx(v.hv.name)}</div>
                      {" "}
                      <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#8C8A82")}>
                        {tx(v.hv.code)}
                        {" · "}
                        {tx(v.hv.apt)}
                      </div>
                      {" "}
                    </div>
                  </div>
                  {" "}
                  <div style={sx("background:#FBFAF8;border-bottom:1px solid #EDEBE4;padding:10px")}>
                    {" "}
                    <svg viewBox="0 0 240 130" style={sx("width:100%;display:block")}>
                      <rect x="0" y="0" width="240" height="130" fill="#fff" />
                      <g stroke="#DEDCD5" strokeWidth="1">
                        <line x1="0" y1="20" x2="240" y2="20" />
                        <line x1="0" y1="110" x2="240" y2="110" />
                      </g>
                      <g stroke="#1A1A17" fill="none" strokeWidth="2">
                        <rect x="52" y="34" width="136" height="62" />
                      </g>
                      <g stroke="#C9C6BC" strokeWidth="1">
                        <line x1="52" y1="96" x2="70" y2="34" />
                        <line x1="70" y1="96" x2="88" y2="34" />
                        <line x1="88" y1="96" x2="106" y2="34" />
                        <line x1="152" y1="96" x2="170" y2="34" />
                        <line x1="170" y1="96" x2="188" y2="34" />
                      </g>
                      {v.hv.round ? (
                        <>
                          <g fill="#fff" stroke={v.hv.color} strokeWidth="2.5">
                            <circle cx="120" cy="65" r="26" />
                          </g>
                          <g fill="none" stroke={v.hv.color} strokeWidth="1.2">
                            <circle cx="120" cy="65" r="20" />
                          </g>
                        </>
                      ) : null}
                      {v.hv.rect ? (
                        <>
                          <g fill="#fff" stroke={v.hv.color} strokeWidth="2.5">
                            <rect x="94" y="42" width="52" height="46" />
                          </g>
                          <g fill="none" stroke={v.hv.color} strokeWidth="1.2">
                            <rect x="100" y="48" width="40" height="34" />
                          </g>
                        </>
                      ) : null}
                      <g stroke="#8C8A82" strokeWidth="1">
                        <line x1="52" y1="118" x2="188" y2="118" />
                        <line x1="52" y1="114" x2="52" y2="122" />
                        <line x1="188" y1="114" x2="188" y2="122" />
                      </g>
                      <text x="120" y="14" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="9" fill="#8C8A82">חתך · הגדלה 1:5</text>
                    </svg>
                    {" "}
                    <div style={sx("text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#8C8A82;margin-top:2px")}>{tx(v.hv.dim)}</div>
                    {" "}
                  </div>
                  {" "}
                  <div style={sx("padding:11px 14px;display:flex;flex-direction:column;gap:6px")}>
                    {(v.hv.specs || []).map((s, i4) => (
                      <Fragment key={i4}>
                        <div style={sx("display:flex;gap:7px;font-size:12px;color:#4A4943;line-height:1.45")}>
                          <span style={sx("color:#C9C6BC;flex:none")}>·</span>
                          <span>{tx(s)}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  {" "}
                  <div style={sx("display:flex;gap:6px;padding:10px 12px;border-top:1px solid #EDEBE4;background:#FBFAF8")}>
                    <button className="hv-2" style={sx("flex:1;height:31px;background:#1A1A17;color:#fff;border:0;font-size:12px;font-weight:500;cursor:pointer")}>
                      הורד DWG
                    </button>
                    <button className="hv-5" style={sx("height:31px;padding:0 11px;background:#fff;border:1px solid #DEDCD5;font-size:12px;cursor:pointer")}>PDF</button>
                  </div>
                  {" "}
                </div>
                {" "}
              </>
            ) : null}
            {" "}
          </WheelDiv>
          {v.paletteDocked ? (
            <>
              <div style={sx("width:282px;flex:none;background:#fff;border-right:1px solid #DEDCD5;display:flex;flex-direction:column;overflow:auto")}>
                <div style={sx("padding:16px 16px 12px;border-bottom:1px solid #EDEBE4")}>
                  {" "}
                  <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82")}>רכיבי ממ״ד</div>
                  {" "}
                </div>
                <div style={sx("padding:10px;display:flex;flex-direction:column;gap:6px")}>
                  {(v.palette || []).map((p, i5) => (
                    <Fragment key={i5}>
                      <div onPointerDown={p.down} style={sx(p.style)}>
                        {" "}
                        <div style={sx(p.dotStyle)}>{tx(p.num)}</div>
                        {" "}
                        <div style={sx("flex:1;min-width:0")}>
                          {" "}
                          <div style={sx("font-size:12.5px;font-weight:500;line-height:1.35")}>{tx(p.name)}</div>
                          {" "}
                          <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:10px;color:#8C8A82")}>{tx(p.code)}</div>
                          {" "}
                        </div>
                        {" "}
                        <div style={sx(p.countStyle)}>{tx(p.count)}</div>
                        {" "}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={sx("margin-top:auto;border-top:1px solid #EDEBE4;padding:14px 16px")}>
                  {" "}
                  <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:10px")}>מצב ההצבה</div>
                  {" "}
                  {(v.aptStatusList || []).map((a, i6) => (
                    <Fragment key={i6}>
                      {" "}
                      <div style={sx("display:flex;align-items:center;justify-content:space-between;padding:7px 0;font-size:12.5px;border-top:1px solid #F4F2ED")}>
                        <span>{tx(a.name)}</span>
                        <span style={sx(a.style)}>{tx(a.label)}</span>
                      </div>
                      {" "}
                    </Fragment>
                  ))}
                  {" "}
                </div>
              </div>
            </>
          ) : null}
          {v.paletteFloating ? (
            <>
              <div style={sx("position:absolute;top:14px;right:14px;z-index:20;background:#fff;border:1px solid #DEDCD5;box-shadow:0 8px 24px rgba(26,26,23,.1);width:66px;padding:8px;display:flex;flex-direction:column;gap:6px")}>
                {(v.palette || []).map((p, i7) => (
                  <Fragment key={i7}>
                    <div onPointerDown={p.down} onMouseEnter={p.enter} onMouseLeave={p.leave} style={sx(p.railStyle)}>
                      {" "}
                      <div style={sx(p.dotStyle)}>{tx(p.num)}</div>
                      {" "}
                      <div style={sx("font-family:'IBM Plex Mono',monospace;font-size:8.5px;color:#8C8A82;margin-top:3px")}>{tx(p.short)}</div>
                      {" "}
                      {p.tip ? (
                        <>
                          {" "}
                          <div style={sx("position:absolute;left:100%;margin-left:8px;top:50%;transform:translateY(-50%);background:#1A1A17;color:#fff;padding:5px 9px;font-size:11.5px;white-space:nowrap;z-index:30")}>
                            {tx(p.name)}
                          </div>
                          {" "}
                        </>
                      ) : null}
                      {" "}
                    </div>
                  </Fragment>
                ))}
              </div>
              <div style={sx("position:absolute;bottom:14px;right:14px;z-index:20;background:rgba(255,255,255,.96);border:1px solid #DEDCD5;padding:12px 14px;min-width:210px;box-shadow:0 8px 24px rgba(26,26,23,.08)")}>
                {" "}
                <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:9px")}>מצב ההצבה</div>
                {" "}
                {(v.aptStatusList || []).map((a, i8) => (
                  <Fragment key={i8}>
                    {" "}
                    <div style={sx("display:flex;align-items:center;justify-content:space-between;padding:6px 0;font-size:12.5px;border-top:1px solid #F4F2ED")}>
                      <span>{tx(a.name)}</span>
                      <span style={sx(a.style)}>{tx(a.label)}</span>
                    </div>
                    {" "}
                  </Fragment>
                ))}
                {" "}
              </div>
            </>
          ) : null}
          {/* הצבה אוטומטית: גרסה א — שכבת ריצה מרכזית */}
          {v.autoOverlayA ? (
            <>
              <div style={sx("position:absolute;inset:0;z-index:40;background:rgba(244,242,237,.72);backdrop-filter:blur(1.5px);display:flex;align-items:center;justify-content:center")}>
                <div style={sx("background:#fff;border:1px solid #DEDCD5;box-shadow:0 20px 50px rgba(26,26,23,.14);width:min(460px,90%);padding:26px 28px;animation:fadeUp .3s ease both")}>
                  {" "}
                  <div style={sx("display:flex;align-items:center;gap:14px;margin-bottom:20px")}>
                    <div style={sx("position:relative;width:38px;height:38px;flex:none")}>
                      {" "}
                      <div style={sx("position:absolute;inset:0;border:2px solid #EDEBE4")} />
                      {" "}
                      <div style={sx("position:absolute;inset:0;border:2px solid transparent;border-top-color:#4C6EF5;animation:spin 1s linear infinite")} />
                      {" "}
                    </div>
                    <div>
                      {" "}
                      <div style={sx("font-size:16px;font-weight:600;letter-spacing:-.01em")}>תכנון ממ״דים אוטומטי</div>
                      {" "}
                      <div style={sx("font-size:12.5px;color:#8C8A82")}>
                        {"מריץ על 2 גרעיני ממ״ד · נותרו "}
                        {tx(v.autoLeft)}
                        {" שניות"}
                      </div>
                      {" "}
                    </div>
                  </div>
                  {" "}
                  <div style={sx("height:3px;background:#EDEBE4;margin-bottom:20px")}>
                    <div style={sx(v.autoBarStyle)} />
                  </div>
                  {" "}
                  <div style={sx("display:flex;flex-direction:column;gap:9px")}>
                    {(v.autoSteps || []).map((s, i9) => (
                      <Fragment key={i9}>
                        <div style={sx("display:flex;align-items:center;gap:10px;font-size:13px")}>
                          <span style={sx(s.iconStyle)}>{tx(s.icon)}</span>
                          <span style={sx(s.textStyle)}>{tx(s.label)}</span>
                          <span style={sx("flex:1")} />
                          <span style={sx(s.metaStyle)}>{tx(s.meta)}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  {" "}
                </div>
              </div>
            </>
          ) : null}
          {/* הצבה אוטומטית: גרסה ב — יומן ריצה בצד, הקנבס גלוי */}
          {v.autoOverlayB ? (
            <>
              <div style={sx("position:absolute;top:14px;left:14px;z-index:40;width:300px;background:#1A1A17;color:#F4F2ED;box-shadow:0 16px 40px rgba(26,26,23,.24);animation:fadeUp .25s ease both")}>
                {" "}
                <div style={sx("padding:14px 16px;border-bottom:1px solid #333229;display:flex;align-items:center;gap:10px")}>
                  <div style={sx("position:relative;width:22px;height:22px;flex:none")}>
                    {" "}
                    <div style={sx("position:absolute;inset:0;border:2px solid #333229;border-radius:50%")} />
                    {" "}
                    <div style={sx("position:absolute;inset:0;border:2px solid transparent;border-top-color:#4C6EF5;border-radius:50%;animation:spin .9s linear infinite")} />
                    {" "}
                  </div>
                  <div style={sx("flex:1")}>
                    <div style={sx("font-size:13px;font-weight:500")}>הצבה אוטומטית פועלת</div>
                    <div style={sx("font-size:11px;color:#8C8A82;font-family:'IBM Plex Mono',monospace")}>
                      {tx(v.autoLeft)}
                      s · 2 גרעינים
                    </div>
                  </div>
                </div>
                {" "}
                <div style={sx("padding:10px 16px 14px;display:flex;flex-direction:column;gap:2px")}>
                  {(v.autoSteps || []).map((s, i10) => (
                    <Fragment key={i10}>
                      <div style={sx("display:flex;align-items:center;gap:9px;padding:5px 0;font-family:'IBM Plex Mono',monospace;font-size:11.5px")}>
                        <span style={sx(s.logIconStyle)}>{tx(s.icon)}</span>
                        <span style={sx(s.logTextStyle)}>{tx(s.label)}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                {" "}
                <div style={sx("height:2px;background:#333229")}>
                  <div style={sx(v.autoBarStyle)} />
                </div>
                {" "}
              </div>
            </>
          ) : null}
          {/* תוצאות ההרצה: אישור לכל דירה */}
          {v.autoResult ? (
            <>
              <div style={sx(v.resultPanelStyle)}>
                {" "}
                <div style={sx("padding:16px 18px;border-bottom:1px solid #EDEBE4;display:flex;align-items:flex-start;gap:10px")}>
                  <div style={sx("flex:1;min-width:0")}>
                    {" "}
                    <div style={sx("font-size:15px;font-weight:600;margin-bottom:3px")}>ההצבה הושלמה</div>
                    {" "}
                    <div style={sx("font-size:12.5px;color:#6B6A63")}>{tx(v.resultSummary)}</div>
                    {" "}
                  </div>
                  <button className="hv-5" onClick={v.hideResult} style={sx("height:28px;padding:0 10px;background:#fff;border:1px solid #DEDCD5;font-size:12px;cursor:pointer;flex:none")}>
                    הסתר
                  </button>
                </div>
                {" "}
                <div style={sx("padding:12px;display:flex;flex-direction:column;gap:10px")}>
                  {(v.resultApts || []).map((a, i11) => (
                    <Fragment key={i11}>
                      <div style={sx(a.cardStyle)}>
                        {" "}
                        <div style={sx("display:flex;align-items:center;gap:9px;margin-bottom:9px")}>
                          <div style={sx(a.badgeStyle)}>{tx(a.badge)}</div>
                          <div style={sx("flex:1;min-width:0")}>
                            {" "}
                            <div style={sx("font-size:13.5px;font-weight:500")}>{tx(a.name)}</div>
                            {" "}
                            <div style={sx("font-size:11.5px;color:#8C8A82;font-family:'IBM Plex Mono',monospace")}>{tx(a.meta)}</div>
                            {" "}
                          </div>
                        </div>
                        {" "}
                        <div style={sx("display:flex;flex-direction:column;gap:5px;margin-bottom:11px")}>
                          {(a.notes || []).map((n, i12) => (
                            <Fragment key={i12}>
                              <div style={sx("display:flex;gap:7px;font-size:12px;color:#4A4943;line-height:1.5")}>
                                <span style={sx(n.mark)}>{tx(n.icon)}</span>
                                <span>{tx(n.text)}</span>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                        {" "}
                        {a.pending ? (
                          <>
                            {" "}
                            <div style={sx("display:flex;gap:6px")}>
                              <button className="hv-1" onClick={a.approve} style={sx("flex:1;height:32px;background:#4C6EF5;color:#fff;border:0;font-size:12.5px;font-weight:500;cursor:pointer")}>
                                אשר דירה
                              </button>
                              <button className="hv-5" onClick={a.retry} style={sx("height:32px;padding:0 12px;background:#fff;border:1px solid #DEDCD5;font-size:12.5px;cursor:pointer")}>
                                נסה שוב
                              </button>
                              <button className="hv-10" onClick={a.reject} style={sx("height:32px;padding:0 12px;background:#fff;border:1px solid #DEDCD5;font-size:12.5px;color:#C2255C;cursor:pointer")}>
                                דחה
                              </button>
                            </div>
                            {" "}
                          </>
                        ) : null}
                        {" "}
                        {a.done ? (
                          <>
                            {" "}
                            <div style={sx(a.doneStyle)}>{tx(a.doneLabel)}</div>
                            {" "}
                          </>
                        ) : null}
                        {" "}
                      </div>
                    </Fragment>
                  ))}
                </div>
                {" "}
                <div style={sx("padding:12px 14px;border-top:1px solid #EDEBE4;background:#FBFAF8;display:flex;gap:8px")}>
                  <button className="hv-2" onClick={v.approveAll} style={sx("flex:1;height:36px;background:#1A1A17;color:#fff;border:0;font-size:13px;font-weight:500;cursor:pointer")}>
                    אשר את כל הדירות
                  </button>
                  <button className="hv-5" onClick={v.dismissResult} style={sx("height:36px;padding:0 14px;background:#fff;border:1px solid #DEDCD5;font-size:13px;cursor:pointer")}>
                    ערוך ידנית
                  </button>
                </div>
                {" "}
              </div>
            </>
          ) : null}
          {v.resultHidden ? (
            <>
              <div style={sx(v.resultChipWrapStyle)}>
                {" "}
                <button className="hv-2" onClick={v.showResult} style={sx("height:34px;padding:0 14px;background:#1A1A17;color:#fff;border:0;font-size:12.5px;font-weight:500;cursor:pointer;box-shadow:0 10px 28px rgba(26,26,23,.2);display:flex;align-items:center;gap:8px")}>
                  <span style={sx("width:7px;height:7px;border-radius:50%;background:#E8590C")} />
                  {"סיכום ההצבה ואישור דירות "}
                </button>
                {" "}
              </div>
            </>
          ) : null}
          {v.ghost ? (
            <>
              <div style={sx(v.ghostStyle)}>{tx(v.ghostNum)}</div>
            </>
          ) : null}
        </div>
        <div style={sx("height:30px;flex:none;background:#fff;border-top:1px solid #DEDCD5;display:flex;align-items:center;gap:16px;padding:0 16px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8C8A82")}>
          <span>{tx(v.statusHint)}</span>
          <span style={sx("flex:1")} />
          <span>
            {"אלמנטים: "}
            {tx(v.placedCount)}
          </span>
          <span>1 יחידה = 10 מ״מ</span>
          <span>שכבה: OMER-DETAILS</span>
        </div>
      </div>
    </>
  );
}
