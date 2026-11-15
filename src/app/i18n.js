// UI languages: Hebrew (source, RTL), English and French (LTR).
// The screens stay in Hebrew, 1:1 with the design. When EN/FR is active, every Hebrew text node
// and placeholder/title in the page is translated through translations.tsv (he \t en \t fr).
// ponytail: DOM-level translation, keyed on the Hebrew text. A new Hebrew string needs a new row in
// translations.tsv (missing ones simply stay in Hebrew). Switch to per-string t() calls if the
// screens stop being generated from the design.
import tsv from './translations.tsv?raw';

export const LANGS = ['he', 'en', 'fr'];
const COL = { en: 1, fr: 2 };

const dict = new Map();
for (const line of tsv.split(/\r?\n/)) {
  const cols = line.split('\t');
  if (cols.length === 3) dict.set(cols[0], cols);
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const HEB = '\\u05D0-\\u05EA';
// Longest keys first; a key only matches as a whole Hebrew word run, so "ב" never eats the start of "בניין".
const keysRe = new RegExp(
  `(?<![${HEB}])(?:${[...dict.keys()].sort((a, b) => b.length - a.length).map(esc).join('|')})(?![${HEB}])`,
  'g'
);

let lang = 'he';
try {
  const q = new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang');
  if (LANGS.includes(q)) lang = q;
} catch { /* storage blocked: stay in Hebrew */ }

const subs = new Set();
export const getLang = () => lang;
export const subscribe = (f) => (subs.add(f), () => subs.delete(f));
export function setLang(l) {
  lang = l;
  try { localStorage.setItem('lang', l); } catch { /* not persisted, fine */ }
  syncDocument();
  translateTree(document.body);
  subs.forEach((f) => f());
}

/** Translate a Hebrew string into the active language (identity in Hebrew). */
export function t(s) {
  if (lang === 'he' || !s || !/[א-ת]/.test(s)) return s;
  return s.replace(keysRe, (m) => dict.get(m)[COL[lang]]);
}

// Each translated node/attribute remembers its Hebrew source and what we wrote, so React updates
// (which write Hebrew again) are re-translated, and switching back to Hebrew restores the original.
const textSrc = new WeakMap();
const attrSrc = new WeakMap();
const ATTRS = ['placeholder', 'title', 'aria-label'];
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA']);

function sourceOf(prev, current) {
  return prev && prev.out === current ? prev.he : current;
}
function translateText(node) {
  if (SKIP.has(node.parentNode?.nodeName)) return;
  const he = sourceOf(textSrc.get(node), node.nodeValue);
  const out = t(he);
  textSrc.set(node, { he, out });
  if (node.nodeValue !== out) node.nodeValue = out;
}
function translateAttr(el, name) {
  const v = el.getAttribute(name);
  if (v === null) return;
  let m = attrSrc.get(el);
  if (!m) attrSrc.set(el, (m = {}));
  const he = sourceOf(m[name], v);
  const out = t(he);
  m[name] = { he, out };
  if (v !== out) el.setAttribute(name, out);
}
function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) return translateText(root);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let n = root; n; n = walker.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) translateText(n);
    else for (const a of ATTRS) translateAttr(n, a);
  }
}

const heTitle = document.title;
function syncDocument() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  document.title = t(heTitle);
}

/** Start translating the page. Call once, before the first render. */
export function startI18n() {
  syncDocument();
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') translateText(r.target);
      else if (r.type === 'attributes') translateAttr(r.target, r.attributeName);
      else r.addedNodes.forEach(translateTree);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
