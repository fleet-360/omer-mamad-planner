// הרשמה
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Signup({ v }) {
  return (
    <>
      <div style={sx("flex:1;display:flex;justify-content:center;padding:38px 24px 60px")}>
        <div style={sx("width:100%;max-width:940px")}>
          {" "}
          <h1 style={sx("font-size:26px;font-weight:600;margin:0 0 22px")}>פתיחת חשבון</h1>
          {" "}
          <div style={sx("display:flex;gap:0;margin-bottom:26px;background:#fff;border:1px solid #DEDCD5")}>
            {(v.signupSteps || []).map((s, i0) => (
              <Fragment key={i0}>
                <div style={sx(s.style)}>
                  {" "}
                  <div style={sx(s.numStyle)}>{tx(s.num)}</div>
                  {" "}
                  <div>
                    <div style={sx("font-size:13px;font-weight:500")}>{tx(s.label)}</div>
                    <div style={sx("font-size:11.5px;color:#8C8A82")}>{tx(s.hint)}</div>
                  </div>
                  {" "}
                </div>
              </Fragment>
            ))}
          </div>
          {" "}
          <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:30px 30px 26px")}>
            {" "}
            {v.su1 ? (
              <>
                {" "}
                <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:18px")}>פרטי המשתמש</div>
                {" "}
                <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px 20px")}>
                  {(v.fSuUser || []).map((x, i1) => (
                    <Fragment key={i1}>
                      <div style={sx("min-width:0")}>
                        <label style={sx("display:block;font-size:12px;font-weight:500;margin-bottom:6px")}>{tx(x.label)}</label>
                        <input value={x.value} onChange={x.set} onBlur={x.blur} type={x.type} placeholder={x.ph} style={sx(x.style)} />
                        {x.hasErr ? (
                          <>
                            <div style={sx("font-size:11.5px;color:#C2255C;margin-top:5px")}>{tx(x.err)}</div>
                          </>
                        ) : null}
                      </div>
                    </Fragment>
                  ))}
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.su2 ? (
              <>
                {" "}
                <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:18px")}>פרטי המשרד</div>
                {" "}
                <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px 20px;margin-bottom:24px")}>
                  {(v.fSuOffice || []).map((x, i2) => (
                    <Fragment key={i2}>
                      <div style={sx("min-width:0")}>
                        <label style={sx("display:block;font-size:12px;font-weight:500;margin-bottom:6px")}>{tx(x.label)}</label>
                        <input value={x.value} onChange={x.set} onBlur={x.blur} type={x.type} placeholder={x.ph} style={sx(x.style)} />
                        {x.hasErr ? (
                          <>
                            <div style={sx("font-size:11.5px;color:#C2255C;margin-top:5px")}>{tx(x.err)}</div>
                          </>
                        ) : null}
                      </div>
                    </Fragment>
                  ))}
                </div>
                {" "}
                <div style={sx("display:flex;flex-direction:column;gap:20px;margin-bottom:24px;border-top:1px solid #EDEBE4;padding-top:20px")}>
                  <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82")}>פעילות</div>
                  <div style={sx("max-width:520px")}>
                    {" "}
                    <div style={sx("font-size:12px;font-weight:500;margin-bottom:8px")}>סוג הבנייה</div>
                    {" "}
                    <div style={sx("position:relative")}>
                      {" "}
                      <div onClick={v.toggleClass} style={sx(v.classFieldStyle)}>
                        {" "}
                        <div style={sx("flex:1;display:flex;gap:6px;flex-wrap:wrap;align-items:center;min-width:0")}>
                          {(v.classTags || []).map((t, i3) => (
                            <Fragment key={i3}>
                              <span style={sx("display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 6px 0 9px;background:#F2F4FF;border:1px solid #C9D0F7;color:#26398F;font-size:12px")}>
                                {tx(t.label)}
                                <span className="hv-3" onClick={t.remove} style={sx("width:16px;height:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:#6B7BC9")}>
                                  ×
                                </span>
                              </span>
                            </Fragment>
                          ))}
                          {v.classEmpty ? (
                            <>
                              <span style={sx("font-size:13px;color:#A8A69C")}>בחירה מרובה</span>
                            </>
                          ) : null}
                        </div>
                        {" "}
                        <span style={sx("font-size:10px;color:#8C8A82;flex:none")}>▾</span>
                        {" "}
                      </div>
                      {" "}
                      {v.classOpen ? (
                        <>
                          {" "}
                          <div style={sx("position:absolute;top:calc(100% + 4px);right:0;left:0;z-index:20;background:#fff;border:1px solid #DEDCD5;box-shadow:0 12px 30px rgba(26,26,23,.12);padding:6px 0")}>
                            {" "}
                            {(v.classOpts || []).map((o, i4) => (
                              <Fragment key={i4}>
                                {" "}
                                <div className="hv-4" onClick={o.go} style={sx("display:flex;align-items:center;gap:10px;padding:9px 14px;font-size:13px;cursor:pointer")}>
                                  <span style={sx(o.boxStyle)}>{tx(o.mark)}</span>
                                  {tx(o.label)}
                                  {" "}
                                </div>
                                {" "}
                              </Fragment>
                            ))}
                            {" "}
                          </div>
                          {" "}
                        </>
                      ) : null}
                      {" "}
                    </div>
                    {" "}
                  </div>
                  <div>
                    {" "}
                    <div style={sx("font-size:12px;font-weight:500;margin-bottom:8px")}>סוג פרויקט</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.ptypeOpts || []).map((o, i5) => (
                        <Fragment key={i5}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  <div>
                    {" "}
                    <div style={sx("font-size:12px;font-weight:500;margin-bottom:8px")}>תחום עיסוק</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.fieldOpts || []).map((o, i6) => (
                        <Fragment key={i6}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                    {v.fieldOther ? (
                      <>
                        {" "}
                        <div style={sx("max-width:320px;margin-top:12px")}>
                          {" "}
                          {(v.fSuOther || []).map((x, i7) => (
                            <Fragment key={i7}>
                              {" "}
                              <div style={sx("min-width:0")}>
                                <label style={sx("display:block;font-size:12px;font-weight:500;margin-bottom:6px")}>{tx(x.label)}</label>
                                <input value={x.value} onChange={x.set} onBlur={x.blur} type={x.type} placeholder={x.ph} style={sx(x.style)} />
                              </div>
                              {" "}
                            </Fragment>
                          ))}
                          {" "}
                        </div>
                        {" "}
                      </>
                    ) : null}
                    {" "}
                  </div>
                </div>
                {" "}
                <div style={sx("border-top:1px solid #EDEBE4;padding-top:20px")}>
                  {" "}
                  <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:16px")}>איש קשר מטפל</div>
                  {" "}
                  <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px 20px")}>
                    {(v.fSuContact || []).map((x, i8) => (
                      <Fragment key={i8}>
                        <div style={sx("min-width:0")}>
                          <label style={sx("display:block;font-size:12px;font-weight:500;margin-bottom:6px")}>{tx(x.label)}</label>
                          <input value={x.value} onChange={x.set} onBlur={x.blur} type={x.type} placeholder={x.ph} style={sx(x.style)} />
                          {x.hasErr ? (
                            <>
                              <div style={sx("font-size:11.5px;color:#C2255C;margin-top:5px")}>{tx(x.err)}</div>
                            </>
                          ) : null}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  {" "}
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.su3 ? (
              <>
                {" "}
                <div style={sx("display:grid;grid-template-columns:minmax(0,1fr) minmax(0,300px);gap:24px;align-items:start")}>
                  <div>
                    {" "}
                    <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:16px")}>פרטי תשלום</div>
                    {" "}
                    {v.isTrial ? (
                      <>
                        {" "}
                        <div style={sx("border:1px solid #EDEBE4;background:#FBFAF8;padding:18px;font-size:13px;color:#4A4943")}>חבילת הניסיון אינה דורשת פרטי תשלום.</div>
                        {" "}
                      </>
                    ) : null}
                    {" "}
                    {v.notTrial ? (
                      <>
                        {" "}
                        <div style={sx("border:1px solid #DEDCD5")}>
                          {" "}
                          <div style={sx("display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#FBFAF8;border-bottom:1px solid #EDEBE4")}>
                            <span style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;color:#6B6A63;white-space:nowrap")}>SSL · secure.grow.co.il</span>
                            <span style={sx("font-size:12px;font-weight:600;letter-spacing:.02em")}>grow</span>
                          </div>
                          {" "}
                          <div style={sx("padding:18px 16px;display:flex;flex-direction:column;gap:14px")}>
                            <div style={sx("display:flex;gap:8px")}>
                              {(v.payMethods || []).map((p, i9) => (
                                <Fragment key={i9}>
                                  <button onClick={p.go} style={sx(p.style)}>{tx(p.label)}</button>
                                </Fragment>
                              ))}
                            </div>
                            {v.payCard ? (
                              <>
                                <div style={sx("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px")}>
                                  {(v.fCard || []).map((x, i10) => (
                                    <Fragment key={i10}>
                                      <div style={sx(x.wrap)}>
                                        <label style={sx("display:block;font-size:12px;font-weight:500;margin-bottom:6px")}>{tx(x.label)}</label>
                                        <input value={x.value} onChange={x.set} onBlur={x.blur} type={x.type} placeholder={x.ph} style={sx(x.style)} />
                                      </div>
                                    </Fragment>
                                  ))}
                                </div>
                              </>
                            ) : null}
                            {v.payBit ? (
                              <>
                                <div>
                                  <label style={sx("display:block;font-size:12px;font-weight:500;margin-bottom:6px")}>מספר טלפון לבקשת התשלום</label>
                                  <input placeholder="050-0000000" style={sx("width:100%;height:40px;padding:0 11px;border:1px solid #DEDCD5;background:#FBFAF8;direction:ltr;text-align:right")} />
                                </div>
                              </>
                            ) : null}
                            {v.payWallet ? (
                              <>
                                <button style={sx("height:44px;background:#1A1A17;color:#fff;border:0;font-size:14px;font-weight:500;cursor:pointer")}>
                                  Apple Pay / Google Pay
                                </button>
                              </>
                            ) : null}
                          </div>
                          {" "}
                        </div>
                        {" "}
                      </>
                    ) : null}
                    {" "}
                  </div>
                  <div style={sx("background:#FBFAF8;border:1px solid #EDEBE4;padding:18px")}>
                    {" "}
                    <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:12px")}>סיכום הזמנה</div>
                    {" "}
                    <div style={sx("display:flex;flex-direction:column;gap:6px;margin-bottom:16px")}>
                      {(v.planOpts || []).map((p, i11) => (
                        <Fragment key={i11}>
                          <div onClick={p.go} style={sx(p.rowStyle)}>
                            {" "}
                            <span style={sx(p.radioStyle)} />
                            {" "}
                            <div style={sx("flex:1;min-width:0")}>
                              <div style={sx("font-size:13px;font-weight:500")}>{tx(p.name)}</div>
                              <div style={sx("font-size:11.5px;color:#8C8A82")}>{tx(p.sub)}</div>
                            </div>
                            {" "}
                            <span style={sx("font-size:12.5px;font-family:'IBM Plex Mono',monospace")}>{tx(p.price)}</span>
                            {" "}
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                    <div style={sx("display:flex;flex-direction:column;gap:8px;border-top:1px solid #EDEBE4;padding-top:12px;font-size:12.5px;color:#6B6A63")}>
                      <div style={sx("display:flex;justify-content:space-between")}>
                        <span>מחיר חודשי</span>
                        <span style={sx("font-family:'IBM Plex Mono',monospace")}>{tx(v.coPrice)}</span>
                      </div>
                      <div style={sx("display:flex;justify-content:space-between")}>
                        <span>מע״מ</span>
                        <span style={sx("font-family:'IBM Plex Mono',monospace")}>{tx(v.coVat)}</span>
                      </div>
                      <div style={sx("display:flex;justify-content:space-between;color:#1A1A17;font-size:14px;font-weight:600;padding-top:6px")}>
                        <span>סה״כ לתשלום</span>
                        <span>{tx(v.coTotal)}</span>
                      </div>
                    </div>
                    {" "}
                  </div>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.suPaid ? (
              <>
                {" "}
                <div style={sx("padding:18px 0 6px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px")}>
                  <div style={sx("width:44px;height:44px;border-radius:50%;background:#2F6F4E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px")}>
                    ✓
                  </div>
                  <div style={sx("font-size:19px;font-weight:600;white-space:nowrap")}>{tx(v.paidTitle)}</div>
                  <div style={sx("font-size:13px;color:#6B6A63;white-space:nowrap")}>{tx(v.paidSub)}</div>
                  <div style={sx("display:grid;grid-template-columns:auto auto;gap:6px 24px;margin:12px 0 8px;font-size:12.5px;text-align:right;white-space:nowrap")}>
                    <span style={sx("color:#8C8A82")}>מספר הזמנה</span>
                    <span style={sx("font-family:'IBM Plex Mono',monospace")}>{tx(v.orderId)}</span>
                    <span style={sx("color:#8C8A82")}>חבילה</span>
                    <span>{tx(v.coName)}</span>
                    <span style={sx("color:#8C8A82")}>סכום</span>
                    <span>{tx(v.coTotal)}</span>
                  </div>
                  <button className="hv-1" onClick={v.goWizard} style={sx("height:42px;padding:0 26px;background:#4C6EF5;color:#fff;border:0;font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap")}>
                    לפתיחת פרויקט
                  </button>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.hasPayError ? <div style={sx("font-size:12.5px;color:#C2255C;margin-top:18px")}>{tx(v.payError)}</div> : null}
            {v.showSuNav ? (
              <>
                {" "}
                <div style={sx("display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:20px;border-top:1px solid #EDEBE4")}>
                  <button className="hv-5" onClick={v.suPrev} style={sx("height:40px;padding:0 18px;background:#fff;border:1px solid #DEDCD5;font-size:13.5px;cursor:pointer")}>
                    חזרה
                  </button>
                  <button className="hv-1" onClick={v.suNext} style={sx("height:40px;padding:0 24px;background:#4C6EF5;color:#fff;border:0;font-size:13.5px;font-weight:500;cursor:pointer")}>
                    {tx(v.suNextLabel)}
                  </button>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
          </div>
          {" "}
        </div>
      </div>
    </>
  );
}
