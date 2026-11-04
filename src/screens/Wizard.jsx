// פתיחת פרויקט
// Generated from the approved design (omer-mamad-planner) and kept 1:1 with it.
// Values and handlers come from `v` (see src/app/OmerApp.jsx -> renderVals).
import { Fragment } from 'react';
import { sx, tx } from '../ui/dom.jsx';

export default function Wizard({ v }) {
  return (
    <>
      <div style={sx("flex:1;display:grid;grid-template-columns:264px minmax(0,1fr);min-height:calc(100vh - 52px)")}>
        <div style={sx("background:#fff;border-left:1px solid #DEDCD5;padding:26px 20px")}>
          {" "}
          <div style={sx("font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:16px")}>פתיחת פרויקט</div>
          {" "}
          <div style={sx("display:flex;border:1px solid #DEDCD5;margin-bottom:22px")}>
            <button onClick={v.setFull} style={sx(v.fullStyle)}>מלא</button>
            <button onClick={v.setQuick} style={sx(v.quickStyle)}>מקוצר · ניסיון</button>
          </div>
          {" "}
          <div style={sx("display:flex;flex-direction:column;gap:2px")}>
            {(v.wizSteps || []).map((w, i0) => (
              <Fragment key={i0}>
                <button onClick={w.go} style={sx(w.style)}>
                  {" "}
                  <span style={sx(w.numStyle)}>{tx(w.num)}</span>
                  {" "}
                  <span style={sx("text-align:right;line-height:1.35")}>{tx(w.label)}</span>
                  {" "}
                </button>
              </Fragment>
            ))}
          </div>
          {" "}
        </div>
        <div style={sx("padding:28px 34px 60px;overflow:auto")}>
          {" "}
          <div style={sx("max-width:820px")}>
            {" "}
            <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px")}>
              <div style={sx("font-size:11.5px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82")}>
                {"שלב "}
                {tx(v.wizNum)}
                {" מתוך "}
                {tx(v.wizTotal)}
              </div>
              <div style={sx("font-size:11.5px;color:#8C8A82")}>{tx(v.draftLabel)}</div>
            </div>
            {" "}
            <div style={sx("height:4px;background:#EDEBE4;margin-bottom:22px")}>
              <div style={sx(v.progressStyle)} />
            </div>
            {" "}
            <h1 style={sx("font-size:24px;font-weight:600;margin:0 0 18px;letter-spacing:-.015em")}>{tx(v.wizTitle)}</h1>
            {" "}
            {v.wzProj ? (
              <>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:26px;margin-bottom:16px")}>
                  {" "}
                  <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:18px")}>הפרויקט</div>
                  {" "}
                  <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px 20px")}>
                    {(v.fProj || []).map((x, i1) => (
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
                </div>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:26px")}>
                  {" "}
                  <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:18px")}>יזם</div>
                  {" "}
                  <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px 20px")}>
                    {(v.fDev || []).map((x, i2) => (
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
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.wzExec ? (
              <>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:26px")}>
                  {" "}
                  <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px")}>
                    <div style={sx("font-size:13px;font-weight:500")}>קבלן ביצוע</div>
                    <div style={sx("display:flex;gap:6px")}>
                      {(v.qExec || []).map((o, i3) => (
                        <Fragment key={i3}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  {" "}
                  {v.hasExec ? (
                    <>
                      {" "}
                      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px 20px;margin-top:20px")}>
                        {(v.fExec || []).map((x, i4) => (
                          <Fragment key={i4}>
                            <div style={sx("min-width:0")}>
                              <label style={sx("display:block;font-size:12px;font-weight:500;margin-bottom:6px")}>{tx(x.label)}</label>
                              <input value={x.value} onChange={x.set} onBlur={x.blur} type={x.type} placeholder={x.ph} style={sx(x.style)} />
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      {" "}
                      <div style={sx("border-top:1px solid #EDEBE4;margin-top:22px;padding-top:18px")}>
                        {" "}
                        <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin-bottom:14px")}>אנשי קשר</div>
                        {" "}
                        <div style={sx("display:flex;flex-direction:column;gap:14px")}>
                          {(v.execContacts || []).map((c, i5) => (
                            <Fragment key={i5}>
                              <div style={sx("display:flex;gap:12px;align-items:flex-start")}>
                                <div style={sx("width:24px;height:40px;margin-top:21px;flex:none;display:flex;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#8C8A82")}>
                                  {tx(c.num)}
                                </div>
                                <div style={sx("flex:1;min-width:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px 16px")}>
                                  {(c.fields || []).map((x, i6) => (
                                    <Fragment key={i6}>
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
                                {c.canRemove ? (
                                  <>
                                    <button className="hv-6" onClick={c.remove} style={sx("width:34px;height:40px;margin-top:21px;flex:none;background:#fff;border:1px solid #DEDCD5;cursor:pointer;font-size:15px;color:#6B6A63")}>
                                      ×
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </Fragment>
                          ))}
                        </div>
                        {" "}
                        <button className="hv-7" onClick={v.addContact} style={sx("margin-top:14px;height:34px;padding:0 14px;background:#fff;border:1px dashed #C9C6BC;font-size:12.5px;cursor:pointer;color:#26398F")}>
                          + הוסף איש קשר
                        </button>
                        {" "}
                      </div>
                      {" "}
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.wzSup ? (
              <>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:26px")}>
                  {" "}
                  <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px")}>
                    <div style={sx("font-size:13px;font-weight:500")}>חברת פיקוח</div>
                    <div style={sx("display:flex;gap:6px")}>
                      {(v.qSup || []).map((o, i7) => (
                        <Fragment key={i7}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  {" "}
                  {v.hasSup ? (
                    <>
                      {" "}
                      <div style={sx("font-size:12px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#8C8A82;margin:22px 0 14px;border-top:1px solid #EDEBE4;padding-top:18px")}>
                        איש קשר
                      </div>
                      {" "}
                      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px 20px")}>
                        {(v.fSup || []).map((x, i8) => (
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
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.wzChar ? (
              <>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:26px;display:flex;flex-direction:column;gap:24px")}>
                  <div>
                    {" "}
                    <div style={sx("font-size:13px;font-weight:500;margin-bottom:10px")}>סוג הפרויקט</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.qPtype || []).map((o, i9) => (
                        <Fragment key={i9}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px 20px")}>
                    {(v.fCharNums || []).map((x, i10) => (
                      <Fragment key={i10}>
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
                  <div style={sx("border-top:1px solid #EDEBE4;padding-top:22px")}>
                    {" "}
                    <div style={sx("font-size:13px;font-weight:500;margin-bottom:10px")}>סוג מרחב מוגן</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.qSpace || []).map((o, i11) => (
                        <Fragment key={i11}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  <div>
                    {" "}
                    <div style={sx("font-size:13px;font-weight:500;margin-bottom:10px")}>תוספת ממ״ד למבנה קיים</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.qAddon || []).map((o, i12) => (
                        <Fragment key={i12}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  <div>
                    {" "}
                    <div style={sx("font-size:13px;font-weight:500;margin-bottom:10px")}>תוכניות מיגון מאושרות</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.qApproved || []).map((o, i13) => (
                        <Fragment key={i13}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                    {v.approvedYes ? (
                      <>
                        {" "}
                        {v.approvedNoFile ? (
                          <>
                            {" "}
                            <div className="hv-8" onClick={v.pickApproved} style={sx("margin-top:14px;border:1.5px dashed #C9C6BC;background:#FBFAF8;padding:22px;text-align:center;cursor:pointer;font-size:13px")}>
                              העלאת תוכנית מיגון מאושרת · PDF או DWG
                            </div>
                            {" "}
                          </>
                        ) : null}
                        {" "}
                        {v.approvedFile ? (
                          <>
                            {" "}
                            <div style={sx("margin-top:14px;border:1px solid #DEDCD5;display:flex;align-items:center;gap:14px;padding:12px 14px")}>
                              <div style={sx("width:30px;height:38px;border:1px solid #1A1A17;flex:none;display:flex;align-items:flex-end;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:9px;padding-bottom:4px")}>
                                PDF
                              </div>
                              <div style={sx("flex:1;min-width:0;font-size:13px;font-weight:500")}>תוכנית-מיגון-מאושרת.pdf</div>
                              <button className="hv-5" onClick={v.removeApproved} style={sx("height:28px;padding:0 10px;background:#fff;border:1px solid #DEDCD5;font-size:12px;cursor:pointer")}>
                                הסר
                              </button>
                            </div>
                            {" "}
                          </>
                        ) : null}
                        {" "}
                      </>
                    ) : null}
                    {" "}
                  </div>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.wzHvac ? (
              <>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:26px;display:flex;flex-direction:column;gap:24px")}>
                  <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px 20px")}>
                    {(v.fHvacNums || []).map((x, i14) => (
                      <Fragment key={i14}>
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
                  <div style={sx("border-top:1px solid #EDEBE4;padding-top:22px")}>
                    {" "}
                    <div style={sx("font-size:13px;font-weight:500;margin-bottom:10px")}>קומה טכנית</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.qTech || []).map((o, i15) => (
                        <Fragment key={i15}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                    {v.techYes ? (
                      <>
                        {" "}
                        <div style={sx("display:flex;gap:28px;flex-wrap:wrap;margin-top:16px")}>
                          <div>
                            {" "}
                            <div style={sx("font-size:12px;font-weight:500;margin-bottom:8px")}>מיקום</div>
                            {" "}
                            <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                              {(v.qTechLoc || []).map((o, i16) => (
                                <Fragment key={i16}>
                                  <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                                </Fragment>
                              ))}
                            </div>
                            {" "}
                          </div>
                          <div>
                            {" "}
                            <div style={sx("font-size:12px;font-weight:500;margin-bottom:8px")}>מצב</div>
                            {" "}
                            <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                              {(v.qTechOpen || []).map((o, i17) => (
                                <Fragment key={i17}>
                                  <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                                </Fragment>
                              ))}
                            </div>
                            {" "}
                          </div>
                        </div>
                        {" "}
                        {v.techOther ? (
                          <>
                            {" "}
                            <div style={sx("max-width:320px;margin-top:14px")}>
                              {" "}
                              {(v.fTechOther || []).map((x, i18) => (
                                <Fragment key={i18}>
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
                      </>
                    ) : null}
                    {" "}
                  </div>
                  <div style={sx("border-top:1px solid #EDEBE4;padding-top:22px")}>
                    {" "}
                    <div style={sx("font-size:13px;font-weight:500;margin-bottom:10px")}>שיטת מיזוג</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.qHvac || []).map((o, i19) => (
                        <Fragment key={i19}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  <div>
                    {" "}
                    <div style={sx("font-size:13px;font-weight:500;margin-bottom:10px")}>מפוצל לכל החדרים</div>
                    {" "}
                    <div style={sx("display:flex;gap:8px;flex-wrap:wrap")}>
                      {(v.qSplit || []).map((o, i20) => (
                        <Fragment key={i20}>
                          <button onClick={o.go} style={sx(o.style)}>{tx(o.label)}</button>
                        </Fragment>
                      ))}
                    </div>
                    {" "}
                  </div>
                  <div style={sx("max-width:520px")}>
                    {" "}
                    {(v.fFeed || []).map((x, i21) => (
                      <Fragment key={i21}>
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
                  {v.isVrf ? (
                    <>
                      <div style={sx("border-top:1px solid #EDEBE4;padding-top:22px")}>
                        {" "}
                        <div style={sx("font-size:13px;font-weight:500;margin-bottom:12px")}>יחידת VRF חיצונית</div>
                        {" "}
                        <div style={sx("display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap")}>
                          <div style={sx("flex:1;min-width:220px;max-width:420px")}>
                            {" "}
                            {(v.fVrf || []).map((x, i22) => (
                              <Fragment key={i22}>
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
                          <div onClick={v.toggleStar} style={sx("display:flex;align-items:center;gap:9px;height:40px;cursor:pointer;font-size:13px")}>
                            <span style={sx(v.starBox)}>{tx(v.starMark)}</span>
                            {"סימון בכוכבית (★) בתוכנית "}
                          </div>
                        </div>
                        {" "}
                      </div>
                    </>
                  ) : null}
                  <div style={sx("border-top:1px solid #EDEBE4;padding-top:18px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px")}>
                    <span style={sx("font-weight:500")}>מעברי קיר / רצפה</span>
                    <span style={sx("color:#6B6A63")}>
                      {"לפי התקן של התקן עומר · "}
                      <span style={sx("font-family:'IBM Plex Mono',monospace")}>ת״י 4442 חלק 5</span>
                    </span>
                  </div>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.wzSummary ? (
              <>
                {" "}
                <div style={sx("display:flex;flex-direction:column;gap:12px")}>
                  {(v.sumSecs || []).map((s, i23) => (
                    <Fragment key={i23}>
                      <div style={sx("background:#fff;border:1px solid #DEDCD5")}>
                        {" "}
                        <div style={sx("display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #EDEBE4")}>
                          <div style={sx("font-size:13.5px;font-weight:600")}>{tx(s.title)}</div>
                          <button className="hv-5" onClick={s.edit} style={sx("height:28px;padding:0 12px;background:#fff;border:1px solid #DEDCD5;font-size:12px;cursor:pointer")}>
                            עריכה
                          </button>
                        </div>
                        {" "}
                        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0 24px;padding:6px 18px 10px")}>
                          {(s.rows || []).map((r, i24) => (
                            <Fragment key={i24}>
                              <div style={sx("display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid #F4F2ED;font-size:12.5px")}>
                                <span style={sx("color:#8C8A82")}>{tx(r.label)}</span>
                                <span style={sx("text-align:left")}>{tx(r.value)}</span>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                        {" "}
                      </div>
                    </Fragment>
                  ))}
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.wzSent ? (
              <>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:40px 26px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px")}>
                  <div style={sx("width:44px;height:44px;border-radius:50%;background:#2F6F4E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px")}>
                    ✓
                  </div>
                  <div style={sx("font-size:19px;font-weight:600")}>השאלון נשלח</div>
                  <div style={sx("font-size:13px;color:#6B6A63")}>הפרויקט נפתח והשרטוט מוכן להצבה</div>
                  <button className="hv-1" onClick={v.goCanvas} style={sx("margin-top:10px;height:42px;padding:0 26px;background:#4C6EF5;color:#fff;border:0;font-size:13.5px;font-weight:500;cursor:pointer")}>
                    פתח את השרטוט
                  </button>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.wzUpload ? (
              <>
                {" "}
                <div style={sx("background:#fff;border:1px solid #DEDCD5;padding:26px")}>
                  {" "}
                  <input ref={v.fileInputRef} type="file" accept=".dwg" hidden onChange={v.onDrawingInput} />
                  <div className="hv-8" onClick={v.pickFile} onDragOver={v.onDrawingDragOver} onDrop={v.onDrawingDrop} style={sx("border:1.5px dashed #C9C6BC;background:#FBFAF8;padding:46px 24px;text-align:center;cursor:pointer")}>
                    {" "}
                    <div style={sx("width:40px;height:40px;border:2px solid #4C6EF5;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:19px;color:#4C6EF5")}>
                      ↑
                    </div>
                    {" "}
                    <div style={sx("font-size:15px;font-weight:500;margin-bottom:6px")}>גרור לכאן שרטוט אדריכלי או בחר קובץ</div>
                    {" "}
                    <div style={sx("font-size:12.5px;color:#8C8A82")}>DWG בלבד · קנה מידה 1:100 או 1:50 · עד 80MB</div>
                    {" "}
                  </div>
                  {v.hasUploadError ? <div style={sx("font-size:11.5px;color:#C2255C;margin-top:8px")}>{tx(v.uploadError)}</div> : null}
                  {" "}
                  {v.fileReady ? (
                    <>
                      {" "}
                      <div style={sx("margin-top:18px;border:1px solid #DEDCD5;display:flex;align-items:center;gap:14px;padding:14px 16px")}>
                        <div style={sx("width:34px;height:42px;border:1px solid #1A1A17;flex:none;display:flex;align-items:flex-end;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:9px;padding-bottom:4px")}>
                          DWG
                        </div>
                        <div style={sx("flex:1;min-width:0")}>
                          {" "}
                          <div style={sx("font-size:13.5px;font-weight:500")}>{tx(v.uploadName)}</div>
                          {" "}
                          <div style={sx("font-size:11.5px;color:#8C8A82;font-family:'IBM Plex Mono',monospace")}>{tx(v.uploadMeta)}</div>
                          {" "}
                        </div>
                        <div style={sx(v.uploadStatusStyle)}>{tx(v.uploadStatus)}</div>
                      </div>
                      {" "}
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.showWizNav ? (
              <>
                {" "}
                <div style={sx("display:flex;justify-content:space-between;align-items:center;margin-top:24px")}>
                  <button className="hv-5" onClick={v.wizPrev} style={sx("height:42px;padding:0 20px;background:#fff;border:1px solid #DEDCD5;font-size:13.5px;cursor:pointer")}>
                    חזרה
                  </button>
                  <button className="hv-1" onClick={v.wizNext} style={sx("height:42px;padding:0 26px;background:#4C6EF5;color:#fff;border:0;font-size:13.5px;font-weight:500;cursor:pointer")}>
                    {tx(v.wizNextLabel)}
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
