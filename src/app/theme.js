// Visual themes. "deck" is the approved design (Omer deck); the others recolor it.
// Every inline style goes through sx() (src/ui/dom.jsx), which passes it through recolor(); the global and
// hover stylesheets are re-injected recolored. The element colors (vents, sprinkler, cable…) are semantic
// and stay the same in every theme; the Omer element uses the Omer logo blue (#2D94CF), outside the palette.
// ponytail: palette swap on the design's hex values; SVG fill/stroke attributes in the screens keep the
// deck colors. Move to CSS variables if the themes start to differ in more than color.
import globalCss from '../styles/global.css?raw';
import hoverCss from '../styles/hover.css?raw';

// Design palette, in this order: accent, accent hover, accent dark, accent tint, accent tint 2, accent border,
// accent muted, ink (8 steps, darkest first), paper (7 steps, lightest first), then the two rgb() triplets.
const KEYS = ['#4C6EF5', '#3552C9', '#26398F', '#F7F8FF', '#F2F4FF', '#C9D0F7', '#6B7BC9',
  '#1A1A17', '#333229', '#3A3934', '#4A4943', '#55544D', '#6B6A63', '#8C8A82', '#A8A69C',
  '#FBFAF8', '#F4F2ED', '#EDEBE4', '#EAE8E1', '#DEDCD5', '#D7D5CC', '#C9C6BC',
  '76,110,245', '244,242,237'];

const palettes = {
  // Studio: teal on green-grey paper, dark teal band (after the Neve Gan "Sales Spec Check" page). Also reshapes, see reshape().
  studio: ['#0E6B66', '#0B5551', '#08403D', '#EEF7F5', '#DCEFEC', '#A9D6D0', '#4E8F89',
    '#13262B', '#1E3036', '#2A3D44', '#34474E', '#44565D', '#5B6A71', '#80939A', '#A3B1B5',
    '#FBFCFB', '#F4F6F4', '#E8EEEB', '#E3E9E6', '#D4DCD8', '#CBD5D1', '#B9C6C1',
    '14,107,102', '244,246,244'],
  // Omer brand blue (logo #2D94CF, darkened for white text), cool blue-grey neutrals.
  omer: ['#1C75B0', '#155C8C', '#0E3F61', '#EEF6FB', '#E6F1F9', '#BFDDF0', '#5C8FB3',
    '#0F2A3D', '#1E3547', '#24405A', '#33495A', '#465B6B', '#5B6F7E', '#7F93A2', '#A3B3BF',
    '#F8FAFC', '#F2F6F9', '#E5ECF2', '#E1E9EF', '#D3DDE6', '#CCD7E0', '#BCCAD5',
    '28,117,176', '242,246,249'],
  // Oranim Migun: olive green of the logo (#A4BC5E, darkened for white text), tree-trunk brown ink, cream paper.
  oranim: ['#567F25', '#44661C', '#2F4713', '#F3F7EA', '#EDF3E1', '#CFDDB3', '#7E9A55',
    '#33271D', '#3D3025', '#4A3B2E', '#4F4236', '#5E5145', '#74675A', '#968A7D', '#B0A699',
    '#FCFBF7', '#F6F4EC', '#EEEADF', '#ECE7DA', '#E0DACB', '#D9D2C2', '#CCC4B1',
    '86,127,37', '246,244,236'],
  // Technical drawing: black on white, accent = the red Oren uses for his markups.
  atelier: ['#C92A2A', '#A51F1F', '#6E1414', '#FFF4F4', '#FDECEC', '#F2C4C4', '#C46A6A',
    '#111111', '#2A2A2A', '#3A3A3A', '#444444', '#555555', '#666666', '#8A8A8A', '#A8A8A8',
    '#FAFAFA', '#F2F2F2', '#EBEBEB', '#E6E6E6', '#DADADA', '#D0D0D0', '#C4C4C4',
    '201,42,42', '242,242,242'],
};
export const THEMES = ['studio', 'deck', 'omer', 'oranim', 'atelier'];
const maps = Object.fromEntries(Object.entries(palettes).map(([k, p]) => [k, Object.fromEntries(KEYS.map((key, i) => [key, p[i]]))]));
const colorRe = /#[0-9A-Fa-f]{6}\b|\b(?:76,110,245|244,242,237)\b/g;

// Studio only: the design is all square corners; round boxes and controls, turn the 3px switches into pills,
// lift white cards with a soft shadow. Decided on the (already recolored) inline CSS string.
const boxRe = /(?:^|;)\s*border:\s*[\d.]+px\s+(?:solid|dashed)/;
function reshape(css) {
  // Assistant runs smaller and narrower than Rubik at the same px: +10% keeps the same text width.
  css = css.replace(/font-size:\s*([\d.]+)px/g, (_, n) => 'font-size:' + Math.round(n * 1.1 * 2) / 2 + 'px');
  if (/border-radius:\s*3px/.test(css)) return css.replace(/border-radius:\s*3px/, 'border-radius:999px');
  if (/border-radius/.test(css)) return css;
  if (boxRe.test(css)) {
    const card = /background:\s*#fff(?:fff)?\b/i.test(css) && !/box-shadow/.test(css);
    return css + ';border-radius:10px' + (card ? ';box-shadow:0 1px 2px rgba(19,38,43,.05),0 6px 20px rgba(19,38,43,.05)' : '');
  }
  if (/cursor:\s*pointer/.test(css) && /(?:^|;)\s*(?:background|border):/.test(css)) return css + ';border-radius:8px';
  return css;
}
const STUDIO_CSS = `body{font-family:'Assistant','Rubik',system-ui,sans-serif}h1,h2,h3{font-family:'Rubik',sans-serif}`;

/** Elements on the dark top band: Studio uses the mint accent there (dark text on mint). */
export function onDark(css) {
  return theme === 'studio' && css ? css.replace(/background:#4C6EF5;color:#fff/i, 'background:#6FE3D6;color:#08231F') : css;
}

let theme = 'studio';
try {
  const q = new URLSearchParams(location.search).get('theme') || localStorage.getItem('theme');
  if (THEMES.includes(q)) theme = q;
} catch { /* storage blocked: default theme */ }

const subs = new Set();
export const getTheme = () => theme;
export const subscribe = (f) => (subs.add(f), () => subs.delete(f));

/** Swap the design palette for the active theme's (identity on the deck theme). */
export function recolor(css) {
  const m = maps[theme];
  if (!m || !css) return css;
  const out = css.replace(colorRe, (c) => m[c.toUpperCase()] || c);
  return theme === 'studio' && !css.includes('{') ? reshape(out) : out;
}

function injectSheets() {
  let el = document.getElementById('omer-theme');
  if (!el) { el = document.createElement('style'); el.id = 'omer-theme'; document.head.appendChild(el); }
  el.textContent = theme === 'deck' ? '' : recolor(globalCss + '\n' + hoverCss) + (theme === 'studio' ? STUDIO_CSS : '');
}

export function setTheme(t) {
  theme = t;
  try { localStorage.setItem('theme', t); } catch { /* not persisted, fine */ }
  injectSheets();
  subs.forEach((f) => f());
}

injectSheets();
