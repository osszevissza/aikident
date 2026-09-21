/* Icon audit for the Aiki Dent site.

   An icon can fail silently in three ways, and the build reports none of them:
     1. the name used in content/data (or a partial) is not in the icon set in
        layouts/partials/icon.html — the partial then quietly substitutes
        `sparkles`, so the page shows a plausible-looking but *wrong* glyph;
     2. a glyph defined in that set draws no geometry at all;
     3. an icon used in content never reaches the generated page, or reaches it
        as an empty <svg>.

   Usage:
     hugo --quiet && node tools/a11y/icons.js
     BASE_URL=http://127.0.0.1:8099 node tools/a11y/icons.js   # also measures painted pixels
*/
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
const PUB = path.join(SITE, 'public');
const ICON_PARTIAL = path.join(SITE, 'layouts', 'partials', 'icon.html');

let failures = 0;
const check = (ok, label, detail) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

/* ------------------------------------------------------- 1. the icon set */
const iconSrc = fs.readFileSync(ICON_PARTIAL, 'utf8');
const set = new Map();
for (const m of iconSrc.matchAll(/^\s*"([a-z0-9-]+)"\s*`([\s\S]*?)`\s*$/gm)) set.set(m[1], m[2]);
console.log(`icon set: ${set.size} glyphs defined in layouts/partials/icon.html`);

const numbers = (s) => (s.match(/-?\d*\.?\d+/g) || []).length;
/* A path draws if it has a moveto and then either another command letter or
   enough coordinates for an implicit lineto ("m8.4 12.2 2.5 2.5 4.7-5.1").
   A horizontal/vertical-only path ("M5.4 12h13.2") has just three numbers. */
const pathDraws = (d) => {
  if (!/[Mm]/.test(d)) return false;
  const rest = d.replace(/^[Mm][^A-Za-z]*/, '');
  return /[A-Za-z]/.test(rest) || numbers(d) >= 4;
};
const glyphDraws = (body) => {
  if (/<circle\b[^>]*\br="\s*[\d.]+/.test(body)) return true;
  if (/<rect\b[^>]*\bwidth="\s*[\d.]+/.test(body)) return true;
  if (/<line\b/.test(body) && numbers(body) >= 4) return true;
  const paths = [...body.matchAll(/<path\b[^>]*\bd="([^"]*)"/g)].map((m) => m[1]);
  return paths.length > 0 && paths.every((d) => pathDraws(d));
};

console.log('\n== glyph definitions ==');
check([...set].every(([, body]) => glyphDraws(body)), 'every defined glyph has drawing geometry',
  [...set].filter(([, b]) => !glyphDraws(b)).map(([n]) => n).join(', '));

/* --------------------------------------------- 2. referenced icon names */
const referenced = new Map();  // name -> Set(files), everything
const fromContent = new Map(); // name -> Set(files), content/ + data/ only
const note = (map, name, file) => {
  if (!map.has(name)) map.set(name, new Set());
  map.get(name).add(path.relative(SITE, file));
};
const scan = (dir, test, map, patterns) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scan(p, test, map, patterns);
    else if (test(e.name)) {
      const txt = fs.readFileSync(p, 'utf8');
      for (const re of patterns) for (const m of txt.matchAll(re)) note(map, m[1], p);
    }
  }
};
const CONTENT_PATTERNS = [/^\s*icon:\s*([A-Za-z0-9_-]+)\s*$/gm];
const LAYOUT_PATTERNS = [/partial\s+"icon"\s+"([a-z0-9-]+)"/g, /partial\s+"icon"\s+\.icon/g];
scan(path.join(SITE, 'content'), (n) => n.endsWith('.md'), fromContent, CONTENT_PATTERNS);
scan(path.join(SITE, 'data'), (n) => n.endsWith('.yaml'), fromContent, CONTENT_PATTERNS);
for (const [n, f] of fromContent) for (const file of f) note(referenced, n, path.join(SITE, file));
scan(path.join(SITE, 'layouts'), (n) => n.endsWith('.html'), referenced, LAYOUT_PATTERNS);

console.log('\n== referenced names ==');
const unknown = [...referenced].filter(([n]) => !set.has(n) && n !== '.icon');
check(unknown.length === 0, 'every referenced icon name exists in the set',
  unknown.map(([n, f]) => `${n} (${[...f].join(', ')})`).join('; '));
console.log(`  ${referenced.size} names referenced · defined but unused: ${[...set.keys()].filter((n) => !referenced.has(n)).join(', ') || '(none)'}`);

/* ------------------------------------------- 3. what the pages carry */
console.log('\n== generated pages ==');
const pages = [];
(function collect(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) collect(p);
    else if (e.name.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8');
      if (!/http-equiv=["']?refresh/i.test(html)) pages.push({ rel: '/' + path.relative(PUB, p), html });
    }
  }
})(PUB);

/* jsdom re-serialises void SVG elements with explicit closing tags and Hugo's
   minifier drops the self-closing slash, so normalise both before comparing a
   rendered glyph with its definition in icon.html */
const norm = (s) => s
  .replace(/\s*\/>/g, '>')
  .replace(/<\/(path|circle|rect|line|polyline|polygon)>/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const rendered = new Set();
const empties = [];
for (const { rel, html } of pages) {
  const dom = new JSDOM(html).window.document;
  for (const svg of dom.querySelectorAll('svg')) {
    const inner = svg.innerHTML.trim();
    if (!inner) empties.push(`${rel} ${svg.parentElement ? svg.parentElement.className : ''}`);
    rendered.add(norm(inner));
  }
}
check(empties.length === 0, 'no rendered <svg> is empty', empties.slice(0, 4).join(' | '));

const notRendered = [...fromContent]
  .filter(([n]) => !rendered.has(norm(set.get(n) || '\u0000')))
  .map(([n, f]) => `${n} (${[...f].join(', ')})`);
check(notRendered.length === 0, 'every icon used in content reaches a page',
  notRendered.slice(0, 5).join(' | '));
console.log(`  ${rendered.size} distinct glyphs rendered across ${pages.length} pages`);

/* --------------------------------------- 4. optional: painted pixels */
const BASE = process.env.BASE_URL;
if (!BASE) {
  console.log('\n(painted-pixel check skipped — set BASE_URL=http://127.0.0.1:8099 to include it)');
  console.log(failures ? `\n${failures} failure(s)` : '\nno findings');
  process.exit(failures ? 1 : 0);
}

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, isMobile: false });
  console.log('\n== painted pixels ==');
  const blank = [];
  let total = 0;
  for (const { rel } of pages) {
    const page = await ctx.newPage();
    await page.goto(BASE + rel.replace(/index\.html$/, ''), { waitUntil: 'load' });
    await page.evaluate(() => {
      /* measure at rest: the scroll reveal otherwise starts at opacity 0 */
      document.documentElement.classList.remove('js');
      document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
    });
    const res = await page.evaluate(async () => {
      const out = [];
      for (const svg of document.querySelectorAll('svg')) {
        const xml = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        await new Promise((r) => { img.onload = r; img.onerror = r; img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml))); });
        const c = document.createElement('canvas');
        c.width = c.height = 48;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0, 48, 48);
        const d = x.getImageData(0, 0, 48, 48).data;
        let ink = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 20) ink++;
        out.push({ ink, label: svg.parentElement ? (svg.parentElement.className || svg.parentElement.tagName) : '?' });
      }
      return out;
    });
    for (const r of res) { total++; if (r.ink === 0) blank.push(`${rel} ${r.label}`); }
    await page.close();
  }
  check(blank.length === 0, `every icon paints something (${total} icons)`, blank.slice(0, 5).join(' | '));
  await browser.close();
  console.log(failures ? `\n${failures} failure(s)` : '\nno findings');
  process.exit(failures ? 1 : 0);
})();
