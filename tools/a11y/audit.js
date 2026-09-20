/* Accessibility audit for the built Aiki Dent site.
   Runs axe-core inside jsdom over every generated HTML page, plus bespoke
   structural checks that jsdom/axe cannot evaluate (heading order, duplicate
   ids, link text quality). */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const findSiteRoot = () => {
  let d = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'hugo.toml'))) return d;
    d = path.dirname(d);
  }
  throw new Error('hugo.toml not found above ' + __dirname);
};

const PUB = process.argv[2] || path.join(findSiteRoot(), 'public');

function pages(root) {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) out.push(p);
    }
  })(root);
  // Hugo alias pages are bare meta-refresh redirects: no <h1>, nothing to audit
  return out
    .filter((f) => !/http-equiv=["']?refresh/i.test(fs.readFileSync(f, 'utf8')))
    .sort();
}

const AXE_OPTIONS = {
  // jsdom has no layout engine: these need real rendering
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
    'target-size': { enabled: false },
    'landmark-unique': { enabled: true },
  },
};

async function run() {
  const files = pages(PUB);
  const results = [];

  for (const file of files) {
    const rel = '/' + path.relative(PUB, file).replace(/index\.html$/, '').replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
    const { window } = dom;

    window.eval(axeSource);
    const axeResults = await window.axe.run(window.document, AXE_OPTIONS);

    // ---- bespoke checks ------------------------------------------------
    const doc = window.document;
    const custom = [];

    // duplicate ids
    const ids = {};
    doc.querySelectorAll('[id]').forEach((el) => {
      ids[el.id] = (ids[el.id] || 0) + 1;
    });
    Object.entries(ids)
      .filter(([, n]) => n > 1)
      .forEach(([id, n]) => custom.push({ id: 'duplicate-id', impact: 'serious', nodes: [`#${id} ×${n}`] }));

    // heading order
    const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    let prev = 0;
    const skips = [];
    for (const h of headings) {
      const lvl = Number(h.tagName[1]);
      if (prev && lvl > prev + 1) skips.push(`h${prev} → h${lvl}: "${h.textContent.trim().slice(0, 50)}"`);
      prev = lvl;
    }
    if (skips.length) custom.push({ id: 'heading-order', impact: 'moderate', nodes: skips });
    const h1s = doc.querySelectorAll('h1');
    if (h1s.length !== 1) custom.push({ id: 'single-h1', impact: 'moderate', nodes: [`found ${h1s.length}`] });

    // ambiguous / missing link text
    const vague = /^(részletek|tovább|ide|kattintson|link|itt|more|read more)\.?$/i;
    const badLinks = [];
    doc.querySelectorAll('a[href]').forEach((a) => {
      let name = (a.getAttribute('aria-label') || a.textContent || '').trim();
      if (!name) {
        // an image-only link is named by its image's alt text
        const img = a.querySelector('img[alt]');
        name = img ? img.getAttribute('alt').trim() : '';
      }
      if (!name) badLinks.push('no accessible name: ' + a.outerHTML.slice(0, 80));
      else if (vague.test(name)) badLinks.push(`vague name "${name}" → ${a.getAttribute('href')}`);
    });
    if (badLinks.length) custom.push({ id: 'link-name-quality', impact: 'serious', nodes: badLinks });

    // things that look interactive (button/chip styling) but are not operable.
    // Plain `.pill` / `.partner` are label chips by design; only the opt-in
    // "action" styles must correspond to a real control.
    const deadish = [];
    doc.querySelectorAll('span.pill--action, span.pill--onwine[href], button:not([type])').forEach((el) => {
      deadish.push('action styling without a control: ' + el.outerHTML.slice(0, 70));
    });
    // interactive-looking cards must actually contain a link
    doc.querySelectorAll('.card--link').forEach((card) => {
      if (!card.querySelector('a[href]')) deadish.push('card--link without a link: ' + card.textContent.trim().slice(0, 40));
    });
    // decorative "more" affordances must not be focusable
    doc.querySelectorAll('.card__more a, .card__more[tabindex]').forEach((el) => {
      deadish.push('card__more is focusable: ' + el.outerHTML.slice(0, 60));
    });
    if (deadish.length) custom.push({ id: 'dead-affordance', impact: 'minor', nodes: deadish });

    // images
    const noAlt = [...doc.querySelectorAll('img:not([alt])')].map((i) => i.getAttribute('src'));
    if (noAlt.length) custom.push({ id: 'img-alt', impact: 'critical', nodes: noAlt });

    // iframes need a title
    const noTitle = [...doc.querySelectorAll('iframe:not([title])')].map((i) => i.getAttribute('src'));
    if (noTitle.length) custom.push({ id: 'iframe-title', impact: 'serious', nodes: noTitle });

    // form controls need labels
    const unlabelled = [];
    doc.querySelectorAll('input, select, textarea').forEach((el) => {
      if (el.type === 'hidden') return;
      const id = el.id;
      const hasLabel = id && doc.querySelector(`label[for="${id}"]`);
      const wrapped = el.closest('label');
      const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      if (!hasLabel && !wrapped && !aria) unlabelled.push(el.outerHTML.slice(0, 80));
    });
    if (unlabelled.length) custom.push({ id: 'form-label', impact: 'critical', nodes: unlabelled });

    results.push({ rel, axeResults, custom });
    window.close();
  }

  // ---- report ----------------------------------------------------------
  let violations = 0;
  let customs = 0;
  for (const r of results) {
    const v = r.axeResults.violations;
    if (v.length || r.custom.length) {
      console.log('\n=== ' + r.rel + ' ===');
    }
    for (const viol of v) {
      violations++;
      console.log(`  [AXE ${viol.impact}] ${viol.id}: ${viol.help}`);
      viol.nodes.slice(0, 5).forEach((n) => console.log('      ' + n.target.join(' ') + (n.failureSummary ? ' — ' + n.failureSummary.split('\n').slice(0, 2).join(' ') : '')));
    }
    for (const c of r.custom) {
      customs++;
      console.log(`  [CHK ${c.impact}] ${c.id}`);
      c.nodes.slice(0, 8).forEach((n) => console.log('      ' + n));
    }
  }
  console.log(`\npages audited: ${results.length}`);
  console.log(`axe violation groups: ${violations}`);
  console.log(`custom findings: ${customs}`);
  if (!violations && !customs) console.log('No automated findings.');
}

run().catch((e) => {
  console.error('audit failed:', e);
  process.exit(1);
});
