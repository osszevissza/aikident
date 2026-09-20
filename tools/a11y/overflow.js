/* Mobile horizontal-overflow probe.

   Loads every page at several phone widths in a real browser and reports any
   document that is wider than the viewport — then bisects the DOM to find which
   element (or its ::before/::after) is responsible, by hiding elements one at a
   time and watching scrollWidth.

   Usage:  node tools/a11y/overflow.js            (needs a server on :8099)
           BASE_URL=http://localhost:1313 node tools/a11y/overflow.js
*/
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const findSiteRoot = () => {
  let d = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'hugo.toml'))) return d;
    d = path.dirname(d);
  }
  throw new Error('hugo.toml not found above ' + __dirname);
};

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
const WIDTHS = [320, 360, 375, 390, 414, 430];
const PAGES = ['/', '/rolunk/', '/szolgaltatasok/', '/technologia/',
               '/uj-paciens/', '/uj-paciens/adatlap/', '/kapcsolat/'];

const describe = (el) => {
  let s = el.tagName.toLowerCase();
  if (el.id) s += '#' + el.id;
  const cls = typeof el.className === 'string' ? el.className.trim() : '';
  if (cls) s += '.' + cls.split(/\s+/).join('.');
  return s;
};

/* Measure the RAW overflow: temporarily lift the `overflow-x` guard, otherwise
   the clip hides the cause and every page looks innocent. */
const measure = () => {
  document.documentElement.style.setProperty('overflow-x', 'visible', 'important');
  document.body.style.setProperty('overflow-x', 'visible', 'important');
  const de = document.scrollingElement;
  return de.scrollWidth - window.innerWidth;
};

const stickingOut = () => {
  const vw = window.innerWidth;
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > vw + 0.5 || r.left < -0.5) {
      out.push({ sel: describe(el), left: Math.round(r.left), right: Math.round(r.right) });
    }
  }
  return out.slice(0, 8);
};

const bisect = () => {
  const de = document.scrollingElement;
  const baseline = de.scrollWidth;
  const hits = [];
  for (const el of document.querySelectorAll('body *')) {
    const prev = el.style.display;
    el.style.display = 'none';
    const w = de.scrollWidth;
    el.style.display = prev;
    if (w < baseline) hits.push({ sel: describe(el), widthWithout: w });
  }
  return hits.slice(0, 8);
};

(async () => {
  const browser = await chromium.launch();
  let failures = 0;
  let firstDetail = null;

  for (const width of WIDTHS) {
    /* isMobile MUST stay false: with isMobile:true Chromium widens the layout
       viewport to fit overflowing content instead of reporting it, which hides
       exactly the bug this tool exists to find. */
    const ctx = await browser.newContext({
      viewport: { width, height: 780 },
      deviceScaleFactor: 2, isMobile: false, hasTouch: true,
    });
    const page = await ctx.newPage();
    for (const route of PAGES) {
      await page.goto(BASE + route, { waitUntil: 'load' });
      await page.waitForTimeout(80);
      const overflow = await page.evaluate(measure);
      if (overflow > 0) {
        failures++;
        console.log(`   ${String(width).padStart(4)}px  ${route.padEnd(24)} overflows by ${overflow}px`);
        if (!firstDetail) {
          firstDetail = {
            width, route,
            sticking: await page.evaluate(stickingOut),
            culprits: await page.evaluate(bisect),
          };
        }
      }
    }
    await ctx.close();
  }

  if (!failures) {
    console.log('   no horizontal overflow at any tested width');
  } else {
    console.log(`\n   ${failures} failing width/page combination(s)`);
    console.log(`\n   --- first failure: ${firstDetail.width}px on ${firstDetail.route} ---`);
    console.log('   elements whose box sticks out of the viewport:');
    for (const s of firstDetail.sticking) {
      console.log(`      ${s.sel}  (left ${s.left}, right ${s.right})`);
    }
    console.log('   elements whose removal fixes it (this includes pseudo-elements):');
    for (const c of firstDetail.culprits) {
      console.log(`      ${c.sel}   -> scrollWidth ${c.widthWithout}`);
    }
  }

  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
