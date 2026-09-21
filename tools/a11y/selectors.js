/* Selector-level check: every rule in main.css is evaluated against the real
   generated DOM. A rule that matches nothing anywhere is either dead code or —
   the bug we are hunting — a selector that can never apply. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require(path.resolve(__dirname, 'node_modules/jsdom'));

const findSiteRoot = () => {
  let d = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'hugo.toml'))) return d;
    d = path.dirname(d);
  }
  throw new Error('hugo.toml not found above ' + __dirname);
};

const SITE = findSiteRoot();
const PUBLIC = path.join(SITE, 'public');

let css = fs.readFileSync(path.join(SITE, 'assets/css/main.css'), 'utf8');
css = css.replace(/\/\*[\s\S]*?\*\//g, ' ');

const docs = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) docs.push(new JSDOM(fs.readFileSync(p, 'utf8')).window.document);
  }
})(PUBLIC);

// collect selectors, skipping at-rules whose inner blocks are not selectors
const selectors = new Map();
let depth = 0;
let buf = '';
let atRule = false;
for (let i = 0; i < css.length; i++) {
  const ch = css[i];
  if (ch === '{') {
    depth++;
    const head = buf.trim();
    buf = '';
    if (head.startsWith('@')) { atRule = true; continue; }
    atRule = false;
    addSelectors(head);
    continue;
  }
  if (ch === '}') { depth--; buf = ''; atRule = false; continue; }
  if (ch === ';' && depth === 0) { buf = ''; continue; }
  buf += ch;
}

function addSelectors(head) {
  for (let sel of head.split(',')) {
    sel = sel.trim();
    if (!sel) continue;
    selectors.set(sel, (selectors.get(sel) || 0));
  }
}

function normalise(sel) {
  return sel
    .replace(/::[a-z-]+(\([^)]*\))?/g, '')           // pseudo-elements
    .replace(/:(focus-visible|focus-within|focus|hover|active|checked|placeholder-shown|disabled|first-child|last-child)\b/g, '')
    .replace(/^\s*[>+~]\s*/, '')
    .trim();
}

const dead = [];
const jsToggled = /is-stuck|is-open|is-locked|is-in|is-visible|\.js\b/;
for (const sel of selectors.keys()) {
  if (jsToggled.test(sel)) continue;
  const probe = normalise(sel);
  if (!probe) continue;
  let hits = 0;
  for (const d of docs) {
    try { hits += d.querySelectorAll(probe).length; } catch { hits = -1; break; }
  }
  if (hits === 0) dead.push(sel);
}

// vocabulary kept for future content — reported separately from real mistakes
// `quote`/`quotes`: the testimonial block is used by no page until real, consented
// reviews exist (the lorem-ipsum ones were removed). The block and its CSS stay so
// switching it back on is a content-only change — same deal as `cta-band`.
// `card--link`/`card__link`/`card__more`: the clickable-card mechanism. No page
// uses it right now — every grid with a shared destination got a single `cta`
// button instead (see the README's "Egy cél = egy hivatkozás" rule) — but it is
// the right tool as soon as cards have individual destinations again.
const RESERVED = /^(\.(cta-band|quote|prose|link-arrow|ticks|stack|shadow|round-img|visually-hidden|mt-0|bg-|grid--2|grid--4|card--link|card__link|card__more|card--wine|card--tint|card--num|card__num|btn--light|pill--onwine|split__media--(plain|tall)|sec-head--row|iform__grid--3|eyebrow--onwine|section--tight|section--wine)|from$|to$)/;
// bare element selectors (h4, hr, strong, video) are base/reset styles: they
// are allowed to be broader than today's content
const isBareElement = (s) => !/[.#]/.test(s);
const real = dead.filter((s) => !RESERVED.test(s) && !isBareElement(s));
const reserved = dead.filter((s) => RESERVED.test(s) || isBareElement(s));

console.log(`selectors evaluated : ${selectors.size}`);
console.log(`UNMATCHED, worth a look : ${real.length}\n`);
for (const s of real.sort()) console.log('  ' + s);
console.log(`\nreserved vocabulary (expected, ${reserved.length})`);
console.log('  ' + reserved.sort().join('\n  '));
