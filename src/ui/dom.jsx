// Small rendering helpers that keep the screens identical to the design.

const cache = new Map();

/** Parse an inline CSS string ("a:b;c:d") into a React style object (cached). */
export function sx(css) {
  if (!css) return undefined;
  if (typeof css === 'object') return css;
  let o = cache.get(css);
  if (o) return o;
  o = {};
  for (const decl of String(css).split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[key] = decl.slice(i + 1).trim();
  }
  cache.set(css, o);
  return o;
}

/** Render an interpolated value the same way the design runtime did (wrapped in a span). */
export function tx(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return null;
  if (typeof value === 'object') return value; // React element / array
  return <span className="sc-interp">{String(value)}</span>;
}
