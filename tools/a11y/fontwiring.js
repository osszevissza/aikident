/* Font wiring gate.

   A font can be "wired up" in three places and all three have to agree:
     1. a token names the family   (--f-display / --f-sans / --f-accent)
     2. an @font-face declares it  (main.css, or a static/fonts/<Family>/ sheet)
     3. the built page can reach that sheet (a <link>, or main.css itself)

   When (3) is missing the page does not fail loudly: it silently renders the
   fallback (Georgia for the display face), so every screenshot, line-count and
   page-height measurement you take is measuring the wrong typeface. That is
   exactly what happened while evaluating Fraunces, so it is a gate now.

   Usage:  node tools/a11y/fontwiring.js
   Exit 1 on any broken link in the chain.
*/
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
const ROOT = findSiteRoot();
const problems = [];
const notes = [];

const read = (p) => fs.readFileSync(p, 'utf8');
const firstFamily = (value) =>
  value.split(',')[0].trim().replace(/^['"]|['"]$/g, '');

/* ---- 1. tokens ---------------------------------------------------------- */
const mainCssPath = path.join(ROOT, 'assets/css/main.css');
const mainCss = read(mainCssPath);
const tokens = {};
for (const name of ['--f-display', '--f-sans', '--f-accent']) {
  const m = mainCss.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  if (!m) { problems.push(`${name} is not declared in assets/css/main.css`); continue; }
  tokens[name] = { raw: m[1].trim(), family: firstFamily(m[1]) };
}

/* ---- 2. @font-face declarations ---------------------------------------- */
// family -> { sources: [{public, file}], where: [sheet paths] }
// Font sheets reference their files relatively ('Fraunces-Variable.woff2') when
// they sit next to them, and absolutely ('/fonts/…') from main.css — both have
// to resolve to a file in static/.
const faces = new Map();
const resolveSource = (src, sheetRel) => {
  if (/^https?:|^data:/.test(src)) return null;
  const publicPath = src.startsWith('/')
    ? src
    : `/fonts/${sheetRel.replace(/^\/fonts\//, '').replace(/\/[^/]+$/, '')}/${src}`;
  return { public: publicPath, file: path.join(ROOT, 'static', publicPath.replace(/^\//, '')) };
};
const collectFaces = (css, where) => {
  const re = /@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const body = m[1];
    const fam = body.match(/font-family\s*:\s*([^;]+);/);
    if (!fam) continue;
    const key = firstFamily(fam[1]).toLowerCase();
    const src = [...body.matchAll(/url\(([^)]+)\)/g)]
      .map((s) => resolveSource(s[1].trim().replace(/^['"]|['"]$/g, ''), where))
      .filter(Boolean);
    const prev = faces.get(key) || { sources: [], where: [] };
    prev.sources.push(...src);
    prev.where.push(where);
    faces.set(key, prev);
  }
};
collectFaces(mainCss, 'assets/css/main.css');
const fontSheets = [];   // { rel, file }
for (const dir of fs.readdirSync(path.join(ROOT, 'static/fonts'))) {
  const d = path.join(ROOT, 'static/fonts', dir);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.css')) continue;
    const rel = `/fonts/${dir}/${f}`;
    collectFaces(read(path.join(d, f)), rel);
    fontSheets.push({ rel, file: path.join(d, f) });
  }
}

/* ---- 3. what the built pages can actually reach ------------------------ */
const pages = ['public/index.html', 'public/szolgaltatasok/index.html']
  .map((p) => path.join(ROOT, p)).filter(fs.existsSync);
if (!pages.length) {
  console.error('fontwiring: no built pages found — run `hugo` first.');
  process.exit(2);
}
const linked = new Set();
const preloaded = new Set();
for (const p of pages) {
  const html = read(p);
  for (const m of html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/g)) {
    const href = m[0].match(/href=["']([^"']+)["']/);
    if (href) linked.add(href[1]);
  }
  for (const m of html.matchAll(/<link[^>]*rel=["']preload["'][^>]*>/g)) {
    const href = m[0].match(/href=["']([^"']+)["']/);
    if (href && /\.(woff2?|ttf|otf)["']?$/.test(href[1])) preloaded.add(href[1]);
  }
}
const reachableSheets = new Set([mainCssPath.replace(ROOT, '')]);
for (const s of fontSheets) if (linked.has(s.rel)) reachableSheets.add(s.rel);

/* ---- checks ------------------------------------------------------------ */
const used = new Set();
for (const [name, t] of Object.entries(tokens)) {
  const key = t.family.toLowerCase();
  used.add(key);
  const face = faces.get(key);
  const label = `${name} → '${t.family}'`;
  if (!face) {
    problems.push(`${label}: no @font-face declares this family (page renders the next fallback)`);
    continue;
  }
  const reach = face.where.filter((w) => reachableSheets.has(w));
  if (!reach.length) {
    problems.push(
      `${label}: declared in ${face.where.join(', ')}, but no built page links that sheet ` +
      `→ the fallback renders silently. Add a <link rel="stylesheet"> in layouts/baseof.html.`);
    continue;
  }
  const sizes = [];
  for (const src of face.sources) {
    if (!fs.existsSync(src.file)) {
      problems.push(`${label}: source ${src.public} does not exist in static/`);
      continue;
    }
    sizes.push(`${path.basename(src.file)} ${(fs.statSync(src.file).size / 1024).toFixed(0)} KB`);
  }
  notes.push(`OK  ${label.padEnd(34)} via ${reach[0]}  [${sizes.join(', ') || 'no local source'}]`);
}

// A stale preload costs a wasted request and logs a console warning; it also
// usually means the face was swapped without updating the hint.
for (const href of preloaded) {
  const local = path.join(ROOT, 'static', href.replace(/^\//, ''));
  if (!fs.existsSync(local)) { problems.push(`preload points at a missing file: ${href}`); continue; }
  const declared = [...faces.values()].some((f) => f.sources.some((s) => s.public === href));
  if (!declared) problems.push(`preload of ${href} — no @font-face uses that file`);
}

// Informational: sheets we ship but never use, and faces no token names.
for (const s of fontSheets) {
  if (!reachableSheets.has(s.rel)) continue;
  const families = [];
  for (const [k, v] of faces) if (v.where.includes(s.rel)) families.push(k);
  const unused = families.filter((f) => !used.has(f));
  if (unused.length && families.length === unused.length) {
    notes.push(`note  ${s.rel} is linked but no token uses ${unused.join(', ')}`);
  }
}

console.log(notes.join('\n'));
if (problems.length) {
  console.error('\nFONT WIRING PROBLEMS (' + problems.length + '):');
  for (const p of problems) console.error('  ✗ ' + p);
  process.exit(1);
}
console.log('\nfont wiring intact — every family named by a token is reachable and shipped');
