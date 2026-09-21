/* WCAG 2.1 contrast audit for the Aiki Dent design tokens.
   Colours are resolved out of assets/css/main.css, so this stays honest when
   the palette changes. Translucent values are composited over their backdrop
   before the ratio is calculated. */
const fs = require('fs');
const path = require('path');

const findSiteRoot = () => {
  let d = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'hugo.toml'))) return d;
    d = path.dirname(d);
  }
  throw new Error('hugo.toml not found above ' + __dirname);
};

const CSS = fs.readFileSync(
  path.join(findSiteRoot(), 'assets/css/main.css'),
  'utf8'
);

/* ---------------------------------------------------------- token table */
const root = CSS.slice(CSS.indexOf(':root'), CSS.indexOf('}', CSS.indexOf(':root')));
const tokens = {};
for (const m of root.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  tokens[m[1]] = m[2].trim();
}

function parseColor(input, depth = 0) {
  let v = String(input).trim();
  const varMatch = v.match(/^var\((--[a-z0-9-]+)\)$/);
  if (varMatch) {
    if (depth > 6) throw new Error('var loop ' + input);
    return parseColor(tokens[varMatch[1]], depth + 1);
  }
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) {
    const [r, g, b] = m[1].split('').map((c) => parseInt(c + c, 16));
    return { r, g, b, a: 1 };
  }
  m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(',').map((x) => parseFloat(x.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  throw new Error('cannot parse colour: ' + input);
}

const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});
const lum = ({ r, g, b }) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/* ------------------------------------------------------------- pairings
   kind: 'text' (4.5:1) | 'ui' (3:1, non-text)                            */
const PAIRS = [
  // ---- light surfaces
  ['body text on cream', 'var(--ink-2)', 'var(--cream)', 'text'],
  ['body text on white', 'var(--ink-2)', 'var(--paper)', 'text'],
  ['body text on frost band', 'var(--ink-2)', 'var(--mint-tint)', 'text'],
  ['muted text on cream', 'var(--ink-3)', 'var(--cream)', 'text'],
  ['muted text on white', 'var(--ink-3)', 'var(--paper)', 'text'],
  ['muted text on cream-2', 'var(--ink-3)', 'var(--cream-2)', 'text'],
  ['muted text on frost band', 'var(--ink-3)', 'var(--mint-tint)', 'text'],
  ['ink-2 on mint-soft', 'var(--ink-2)', 'var(--mint-soft)', 'text'],
  ['icon glyph on mint plate', 'var(--wine)', 'var(--mint-soft)', 'ui'],

  // ---- headings / links
  ['heading on cream', 'var(--wine-deep)', 'var(--cream)', 'text'],
  ['heading on white', 'var(--wine-deep)', 'var(--paper)', 'text'],
  ['heading on frost band', 'var(--wine-deep)', 'var(--mint-tint)', 'text'],
  ['link on cream', 'var(--wine)', 'var(--cream)', 'text'],
  ['link on white', 'var(--wine)', 'var(--paper)', 'text'],
  ['link hover on white', 'var(--wine-soft)', 'var(--paper)', 'text'],
  ['eyebrow on frost band', 'var(--wine)', 'var(--mint-tint)', 'text'],
  ['highlight text on mint marker', 'var(--wine-deep)', 'var(--mint)', 'text'],

  // ---- buttons
  ['primary button', '#ffffff', 'var(--wine)', 'text'],
  ['primary button hover', 'var(--wine-night)', 'var(--mint)', 'text'],
  ['mint button', 'var(--wine-night)', 'var(--mint)', 'text'],
  ['light button', 'var(--wine)', 'var(--paper)', 'text'],
  ['ghost button text on cream', 'var(--wine)', 'var(--cream)', 'text'],
  ['ghost button border', 'var(--line-ui)', 'var(--cream)', 'ui'],

  // ---- opaque chrome
  ['topbar text', 'rgba(255,255,255,0.78)', 'var(--wine-night)', 'text'],
  ['topbar mint icon', 'var(--mint)', 'var(--wine-night)', 'ui'],
  ['nav link', 'var(--ink-2)', 'var(--cream)', 'text'],
  ['nav link hover', 'var(--wine)', 'var(--wine-tint)', 'text'],

  // ---- dark wine surfaces
  ['wine band body on wine', 'rgba(255,255,255,0.86)', 'var(--wine)', 'text'],
  ['wine band body on wine-deep', 'rgba(255,255,255,0.86)', 'var(--wine-deep)', 'text'],
  ['stat number on wine', 'var(--mint)', 'var(--wine)', 'text'],
  ['stat label on wine', 'rgba(255,255,255,0.78)', 'var(--wine)', 'text'],
  ['stat label on wine-deep', 'rgba(255,255,255,0.78)', 'var(--wine-deep)', 'text'],
  ['tick list on wine', 'rgba(255,255,255,0.85)', 'var(--wine)', 'text'],
  ['step text on wine', 'rgba(255,255,255,0.75)', 'var(--wine)', 'text'],
  ['step number on wine', 'var(--mint)', 'var(--wine)', 'text'],
  ['eyebrow mint on wine', 'var(--mint)', 'var(--wine)', 'text'],
  ['wine card body', 'rgba(255,255,255,0.82)', 'var(--wine)', 'text'],
  ['wine card body deep', 'rgba(255,255,255,0.82)', 'var(--wine-deep)', 'text'],
  ['wine card paragraph', 'rgba(255,255,255,0.78)', 'var(--wine)', 'text'],

  // ---- marquee
  ['marquee text', 'rgba(255,255,255,0.9)', 'var(--wine-deep)', 'text'],

  // ---- CTA band
  ['cta body', 'rgba(255,255,255,0.86)', 'var(--wine)', 'text'],
  ['cta paragraph', 'rgba(255,255,255,0.8)', 'var(--wine)', 'text'],
  ['cta phone', '#ffffff', 'var(--wine)', 'text'],

  // ---- footer (now fully opaque, no glow layer)
  ['footer base text', '#c9babd', 'var(--wine-night)', 'text'],
  ['footer brand paragraph', '#beabb0', 'var(--wine-night)', 'text'],
  ['footer link', '#d5c9cc', 'var(--wine-night)', 'text'],
  ['footer link underline', '#957581', 'var(--wine-night)', 'ui'],
  ['footer bottom text', '#a99097', 'var(--wine-night)', 'text'],
  ['footer bottom rule (decorative)', '#562630', 'var(--wine-night)', 'decorative'],
  ['footer heading', '#ffffff', 'var(--wine-night)', 'text'],
  ['footer mint link', 'var(--mint)', 'var(--wine-night)', 'text'],

  // ---- forms
  ['field label on white', 'var(--wine)', 'var(--paper)', 'text'],
  ['field input text', 'var(--ink)', 'var(--cream)', 'text'],
  ['field border', 'var(--line-ui)', 'var(--cream)', 'ui'],
  ['placeholder text', 'var(--ink-3)', 'var(--cream)', 'text'],
  ['field focus border', 'var(--wine)', 'var(--paper)', 'ui'],
  ['form note', 'var(--ink-3)', 'var(--paper)', 'text'],
  ['checkbox border', 'var(--wine)', 'var(--paper)', 'ui'],
  ['checkbox checked fill', 'var(--wine)', 'var(--paper)', 'ui'],
  ['checkbox check mark', '#ffffff', 'var(--wine)', 'ui'],

  // ---- chips
  ['label chip text', 'var(--wine-deep)', 'var(--wine-tint)', 'text'],
  ['action chip text', 'var(--wine)', 'var(--paper)', 'text'],
  ['partner chip text', 'var(--ink-2)', 'var(--paper)', 'text'],

  // ---- scroll-to-top control
  ['scroll-to-top icon', '#ffffff', 'var(--wine)', 'ui'],
  ['scroll-to-top hover', '#ffffff', 'var(--wine-soft)', 'ui'],
  ['scroll-to-top focus ring (inset)', 'var(--mint)', 'var(--wine)', 'ui'],

  // ---- focus indicators
  ['focus ring on white', 'var(--focus-ring)', 'var(--paper)', 'ui'],
  ['focus ring on cream', 'var(--focus-ring)', 'var(--cream)', 'ui'],
  ['focus ring on frost band', 'var(--focus-ring)', 'var(--mint-tint)', 'ui'],
  ['focus ring on wine (dark)', 'var(--focus-ring-on-dark)', 'var(--wine)', 'ui'],
  ['focus ring on wine-night (dark)', 'var(--focus-ring-on-dark)', 'var(--wine-night)', 'ui'],
  ['focus ring on wine-deep (dark)', 'var(--focus-ring-on-dark)', 'var(--wine-deep)', 'ui'],
];

/* --------------------------------------------------------------- report */
let fails = 0;
const hex = (c) =>
  '#' + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');

console.log('WCAG 2.1 contrast audit\n');
for (const [label, fgRaw, bgRaw, kind] of PAIRS) {
  let fg = parseColor(fgRaw);
  const bg = parseColor(bgRaw);
  if (fg.a < 1) fg = over(fg, bg);
  const r = ratio(fg, bg);
  const need = kind === 'text' ? 4.5 : kind === 'decorative' ? 0 : 3;
  const ok = r >= need;
  if (!ok) fails++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(6)}  (need ${need})  ${label.padEnd(38)} ${hex(fg)} on ${hex(bg)}`
  );
}
console.log(`\n${fails} failing pairing(s) of ${PAIRS.length}`);
