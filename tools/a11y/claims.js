/* Claims guard for the built Aiki Dent site.

   This project once shipped invented statistics ("300+ elégedett páciens", "20 év"),
   lorem-ipsum testimonials, a fabricated 5-star rating, a scrolling brag strip,
   superlatives and a made-up qualification in the meta description. All of it was
   removed. This script exists so it cannot come back unnoticed: it fails the build
   check if any of those strings reappear in `public/`.

   It also verifies the two things that break silently when content is reshuffled:
     - every same-page `#fragment` link resolves to a real id
     - the four legacy URL aliases are still generated and still point somewhere sane

   Usage:  hugo --quiet && node tools/a11y/claims.js

   If a pattern here is ever *deliberately* reintroduced with real data behind it
   (the client supplies a genuine patient count, a consented review, real opening
   hours), delete that line from PATTERNS and say why in the commit message.
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
const ALIASES = { '/vizsgalatok/': '/szolgaltatasok/', '/kezelesek/': '/szolgaltatasok/', '/elso-latogatas/': '/uj-paciens/', '/cbct/': '/technologia/' };

const PATTERNS = [
  ['invented patient count', /300\s*\+|elégedett páciens/i],
  ['invented practice age', /két évtizede|20 év/i],
  ['lorem ipsum filler', /lorem ipsum/i],
  ['invented testimonial names', /Kovács Anna|Nagy Péter|Szabó Eszter/],
  ['star-rating markup', /csillagos értékelés|hero__stars|quote__stars/i],
  ['trust marquee', /marquee/i],
  ['animated statistics band', /stat__n|stat__l|data-count/i],
  ['superlative: "Magyarországon az első"', /Magyarországon az első/i],
  ['superlative: "legmodernebb"', /legmodernebb/i],
  ['superlative: "legprecízebb"', /legprecízebb/i],
  ['superlative: "egyedülálló technikai"', /egyedülálló technikai/i],
  ['fabricated "fogszabályozó" qualification', /fogszabályozó/i],
  ['pressure copy: "Hívjon minket még ma"', /Hívjon minket még ma/i],
  ['unbacked callback promise', /egy munkanapon belül visszahívja/i],
  ['unverified transit claim', /Nyugati pályaudvar/i],
];

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(PUB);

const read = (f) => fs.readFileSync(f, 'utf8');
const isAlias = (html) => /http-equiv=["']?refresh/i.test(html);
const pages = files.filter((f) => !isAlias(read(f)));
let failures = 0;

const check = (ok, label, detail) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

console.log('== claims that must not reappear ==');
const all = pages.map(read).join('\n');
for (const [label, re] of PATTERNS) {
  const hit = all.match(re);
  check(!hit, label, hit ? `found "${hit[0]}"` : '');
}

console.log('\n== internal links and #fragments resolve ==');
/* The service grids point at `#folyamat`, the home "Rendelés" section points at
   `/uj-paciens/#arak`, the Rólunk page at `/uj-paciens/#kinek`… an anchor typo in
   any of those is a silent dead link, so resolve every internal fragment against
   the target page's real ids. */
const docs = new Map(); // "/uj-paciens/" -> { dom, ids:Set }
for (const f of pages) {
  const rel = '/' + path.relative(PUB, f).replace(/index\.html$/, '');
  const dom = new JSDOM(read(f)).window.document;
  docs.set(rel, { dom, ids: new Set([...dom.querySelectorAll('[id]')].map((e) => e.id)) });
}
const toRel = (href, here) => {
  if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href)) return href ? here : here;
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '') return here;
  return clean.endsWith('/') ? clean : clean + '/';
};
let linkFailures = 0;
for (const [here, { dom }] of docs) {
  const missing = new Set();
  for (const a of dom.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (/^(https?:|mailto:|tel:)/i.test(href)) continue;
    const [pathPart, frag] = href.split('#');
    const there = toRel(pathPart, here);
    if (pathPart && !docs.has(there) && !fs.existsSync(path.join(PUB, pathPart))) {
      missing.add(`${href} (page does not exist)`);
      continue;
    }
    if (frag && docs.has(there) && !docs.get(there).ids.has(frag)) {
      missing.add(`${href} (no #${frag} on ${there})`);
    }
  }
  linkFailures += missing.size;
  check(missing.size === 0, `links on ${here}`, [...missing].slice(0, 4).join(', '));
}

console.log('\n== repeated sentences inside one section ==');
/* A sentence that appears twice within the same section is always an accident —
   it has happened here three times: a whole closing block that restated the
   first-visit steps, another that duplicated them again, and the partner section
   printing its closing line in both the block's `lead` and the data file's
   `extra`. Compare whole sentences (>= 8 words) section by section. */
/* textContent glues adjacent elements together ("…EgészségpénztárAmennyiben…"),
   which hides a sentence sitting right after a list — so join text nodes with
   explicit separators instead. */
const sectionText = (node) => {
  let out = '';
  for (const child of node.childNodes) {
    if (child.nodeType === 3) out += child.nodeValue;
    else if (child.nodeType === 1) out += ' ' + sectionText(child) + ' ';
  }
  return out;
};

const SHINGLE = 8;
for (const file of pages) {
  const rel = '/' + path.relative(PUB, file).replace(/index\.html$/, '');
  const dom = new JSDOM(read(file)).window.document;
  const dupes = new Map();
  for (const section of dom.querySelectorAll('main > section')) {
    /* Word shingles rather than sentences: a repeated passage is often glued to
       whatever precedes it (the partner list ends, then the closing line starts),
       so punctuation-based splitting misses exactly the cases we care about. */
    const words = sectionText(section).replace(/\s+/g, ' ').trim().toLowerCase().split(' ');
    const seen = new Set();
    for (let i = 0; i + SHINGLE <= words.length; i++) {
      const shingle = words.slice(i, i + SHINGLE).join(' ');
      if (seen.has(shingle)) dupes.set(shingle, (dupes.get(shingle) || 1) + 1);
      seen.add(shingle);
    }
  }
  const worst = [...dupes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([s, n]) => `×${n} "${s.slice(0, 60)}…"`);
  check(dupes.size === 0, `no repeated passage within a section on ${rel}`, worst.join(' | '));
}

console.log('\n== legacy URL aliases ==');
for (const [from, to] of Object.entries(ALIASES)) {
  const file = path.join(PUB, from.replace(/^\/|\/$/g, ''), 'index.html');
  if (!fs.existsSync(file)) {
    check(false, `${from} alias exists`);
    continue;
  }
  const html = read(file);
  const ok = isAlias(html) && html.includes(to);
  check(ok, `${from} still redirects`, `→ ${to}`);
}

console.log(failures ? `\n${failures} failure(s)` : '\nno findings');
process.exit(failures ? 1 : 0);
