// System shell: sidebar navigation, header with breadcrumbs, and the presenter's demo dock.
// Not part of the original design (which had one top bar listing every screen like slides).
// Colors use the design palette so every theme recolors them.
import { Fragment, useState } from 'react';
import { sx } from '../ui/dom.jsx';
import { LANGS, getLang, setLang } from '../app/i18n.js';
import { THEMES, getTheme, setTheme, onDark } from '../app/theme.js';

const GROUPS = [
  ['עבודה', [['projects', 'פרויקטים'], ['canvas', 'שרטוט'], ['review', 'בדיקה ואישור'], ['export', 'הפקת קובץ']]],
  ['קטלוג', [['library', 'ספריית אלמנטים']]],
  ['חשבון', [['billing', 'חיוב'], ['settings', 'הגדרות תקן']]],
];
const LABEL = Object.fromEntries(GROUPS.flatMap(([, items]) => items));
const IN_PROJECT = ['canvas', 'review', 'export'];
export const PREAUTH = ['login', 'signup', 'plans'];

const ITEM = "display:flex;align-items:center;width:100%;min-height:38px;padding:0 12px;border:0;font-size:13.5px;cursor:pointer;font-family:inherit;text-align:start;";
const ITEM_ON = ITEM + "background:#4C6EF5;color:#fff;font-weight:500";
const ITEM_OFF = ITEM + "background:transparent;color:#A8A69C";

export function Sidebar({ v }) {
  const active = v.screen === 'wizard' ? 'projects' : v.screen;
  return (
    <aside style={sx("width:232px;flex:none;position:sticky;top:0;height:100vh;background:#1A1A17;color:#F4F2ED;display:flex;flex-direction:column;padding:18px 12px")}>
      <div style={sx("display:flex;align-items:center;gap:10px;padding:0 6px 18px;border-bottom:1px solid #3A3934")}>
        <div style={sx("width:22px;height:22px;border:2px solid #4C6EF5;position:relative;flex:none")}>
          <div style={sx("position:absolute;inset:4px;background:#4C6EF5")} />
        </div>
        <div style={sx("min-width:0")}>
          <div style={sx("font-size:14.5px;font-weight:600;line-height:1.2")}>התקן עומר</div>
          <div style={sx("font-size:11.5px;color:#8C8A82")}>תכנון ממ״ד</div>
        </div>
      </div>
      <nav style={sx("flex:1;overflow:auto;padding-top:8px")}>
        {GROUPS.map(([group, items]) => (
          <Fragment key={group}>
            <div style={sx("font-size:11px;font-weight:600;color:#6B6A63;padding:16px 12px 6px;letter-spacing:.04em")}>{group}</div>
            {items.map(([k, label]) => (
              <button key={k} onClick={() => v.go(k)} style={sx(onDark(k === active ? ITEM_ON : ITEM_OFF))} className={k === active ? '' : 'hv-9'}>{label}</button>
            ))}
          </Fragment>
        ))}
      </nav>
      <div style={sx("display:flex;align-items:center;gap:10px;padding:14px 6px 0;border-top:1px solid #3A3934")}>
        <div style={sx("width:32px;height:32px;border-radius:50%;background:#3A3934;color:#F4F2ED;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex:none")}>יכ</div>
        <div style={sx("flex:1;min-width:0")}>
          <div style={sx("font-size:13px;font-weight:500")}>ישראל כהן</div>
          <div style={sx("font-size:11.5px;color:#8C8A82")}>אדריכל</div>
        </div>
        <button onClick={() => v.go('login')} className="hv-9" style={sx("height:30px;padding:0 9px;border:1px solid #3A3934;background:transparent;color:#A8A69C;font-size:11.5px;cursor:pointer;font-family:inherit")}>התנתקות</button>
      </div>
    </aside>
  );
}

export function Header({ v }) {
  const s = v.screen;
  const crumbs = s === 'wizard' ? ['פרויקטים', 'פרויקט חדש']
    : IN_PROJECT.includes(s) ? ['פרויקטים', v.project.name, LABEL[s]]
    : [LABEL[s] || ''];
  return (
    <header style={sx("height:52px;flex:none;display:flex;align-items:center;gap:16px;padding:0 24px;background:#fff;border-bottom:1px solid #DEDCD5")}>
      <div style={sx("flex:1;min-width:0;display:flex;align-items:center;gap:8px;font-size:13.5px;white-space:nowrap;overflow:hidden")}>
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i ? <span style={sx("color:#C9C6BC")}>/</span> : null}
            {i < crumbs.length - 1
              ? <button onClick={() => v.go(i === 0 ? 'projects' : 'canvas')} style={sx("border:0;background:none;padding:0;color:#6B6A63;font-size:13.5px;cursor:pointer;font-family:inherit")}>{c}</button>
              : <span style={sx("color:#1A1A17;font-weight:600;overflow:hidden;text-overflow:ellipsis")}>{c}</span>}
          </Fragment>
        ))}
      </div>
      {IN_PROJECT.includes(s) ? (
        <span style={sx("display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#4A4943")}>
          <span style={sx("width:7px;height:7px;border-radius:50%;background:" + v.project.statusColor)} />{v.project.status}
        </span>
      ) : null}
    </header>
  );
}

const PILL = (on) => "padding:5px 10px;border:0;cursor:pointer;font-size:12px;font-family:inherit;" + (on ? "background:#4C6EF5;color:#fff" : "background:transparent;color:#4A4943");
const LANG_LABEL = { he: 'עב', en: 'EN', fr: 'FR' };
const THEME_LABEL = { studio: 'Studio', deck: 'Deck', omer: 'Omer', oranim: 'Oranim', atelier: 'Atelier' };

/** Presenter tools, kept out of the system UI: language, visual style, design variants, pre-login screens. */
export function DemoDock({ v }) {
  const [open, setOpen] = useState(false);
  const row = "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid #EDEBE4";
  const seg = "display:flex;border:1px solid #DEDCD5;border-radius:3px;overflow:hidden";
  return (
    <div style={sx("position:fixed;bottom:16px;inset-inline-end:16px;z-index:90;display:flex;flex-direction:column;align-items:flex-end;gap:8px")}>
      {open ? (
        <div style={sx("width:280px;background:#fff;border:1px solid #DEDCD5;box-shadow:0 12px 32px rgba(26,26,23,.14);padding:12px 14px;font-size:12.5px;color:#4A4943")}>
          <div style={sx("font-size:13px;font-weight:600;color:#1A1A17;padding-bottom:8px")}>כלי הדגמה</div>
          <div style={sx(row)}>
            <span>שפה</span>
            <div style={sx(seg)}>{LANGS.map((l) => <button key={l} onClick={() => setLang(l)} style={sx(PILL(l === getLang()))}>{LANG_LABEL[l]}</button>)}</div>
          </div>
          <div style={sx(row)}>
            <span>סגנון</span>
            <select value={getTheme()} onChange={(e) => setTheme(e.target.value)} style={sx("height:30px;padding:0 6px;border:1px solid #DEDCD5;border-radius:3px;background:#fff;font-size:12px")}>
              {THEMES.map((t) => <option key={t} value={t}>{THEME_LABEL[t]}</option>)}
            </select>
          </div>
          {v.variantSwitch ? (
            <div style={sx(row)}>
              <span>{v.variantLabel}</span>
              <div style={sx(seg)}>
                <button onClick={v.setVarA} style={sx(PILL(v.varAStyle.includes('#4C6EF5')))}>א</button>
                <button onClick={v.setVarB} style={sx(PILL(v.varBStyle.includes('#4C6EF5')))}>ב</button>
              </div>
            </div>
          ) : null}
          <div style={sx(row + ";flex-wrap:wrap")}>
            <span>מסכים לפני כניסה</span>
            <div style={sx("display:flex;gap:6px")}>
              {PREAUTH.map((k) => <button key={k} onClick={() => v.go(k)} style={sx("border:0;background:none;padding:0;color:#4C6EF5;font-size:12px;cursor:pointer;font-family:inherit")}>{k === 'login' ? 'התחברות' : k === 'signup' ? 'הרשמה' : 'חבילות'}</button>)}
            </div>
          </div>
        </div>
      ) : null}
      <button onClick={() => setOpen(!open)} style={sx("height:32px;padding:0 14px;border:1px solid #DEDCD5;background:#fff;color:#4A4943;font-size:12px;cursor:pointer;box-shadow:0 4px 14px rgba(26,26,23,.1);font-family:inherit")}>הדגמה</button>
    </div>
  );
}
