/* Typeface consistency across breakpoints.

   A design-forum reviewer noticed that the mobile menu — which is a different
   component (`.drawer__nav`) than the desktop navigation (`.nav__link`) — had
   silently been given the *display* (serif) face while the desktop menu uses the
   body sans. Nothing in the suite could see it: `type.js` checks readability,
   `fonts.js` measures the font files, `contrast.js` measures colour pairs, and all
   of them were happy. The site had two type systems for one navigation.

   So: sizes may legitimately change between breakpoints (the type is fluid, and
   the display face is compensated by `--display-scale`), families may not. Each
   role below is read at desktop and phone width; a family mismatch fails.

   Usage:  node tools/a11y/families.js        (needs a server on :8099)
           BASE_URL=http://localhost:1313 node tools/a11y/families.js
*/
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
const PAGES = ['/rolunk/', '/szolgaltatasok/', '/kapcsolat/'];

// name -> [desktop selector, phone selector (defaults to the same)]
const ROLES = [
  ['primary navigation', '.nav__link', '.drawer__nav a'],
  ['menu contact lines', '.topbar a', '.drawer__contact a'],
  ['section heading', '.sec-head h2'],
  ['card title', '.card h3'],
  ['accordion label', '.acc summary'],
  ['lead paragraph', '.sec-head p:not(.eyebrow)'],
  ['body paragraph', '.prose p, .acc__body p'],
  ['button', '.btn'],
  ['contact tile', '.info b'],
  ['footer link', '.site-footer a'],
  ['eyebrow label', '.eyebrow'],
];

const read = async (page, selector) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const cs = getComputedStyle(el);
  return { family: cs.fontFamily.split(',')[0].replace(/['"]/g, ''), size: Math.round(parseFloat(cs.fontSize) * 10) / 10 };
}, selector);

(async () => {
  const browser = await chromium.launch();
  const problems = [];
  const rows = [];
  for (const rel of PAGES) {
    for (const [name, deskSel, phoneSel] of ROLES) {
      const out = {};
      for (const [where, width, sel, openDrawer] of [['desktop', 1280, deskSel, false], ['phone', 390, phoneSel || deskSel, true]]) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, isMobile: false });
        const page = await ctx.newPage();
        await page.goto(BASE + rel, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        if (openDrawer) { await page.click('.burger').catch(() => {}); await page.waitForTimeout(400); }
        out[where] = await read(page, sel);
        await ctx.close();
      }
      if (!out.desktop || !out.phone) continue;
      rows.push({ page: rel, name, desk: out.desktop, phone: out.phone });
      if (out.desktop.family !== out.phone.family) {
        problems.push(
          `${rel} — ${name}: desktop "${out.desktop.family}" ${out.desktop.size}px vs phone ` +
          `"${out.phone.family}" ${out.phone.size}px. Same role, two type systems.`);
      }
    }
  }
  console.log('  page                 role                 desktop              phone');
  for (const r of rows) {
    const sizeNote = r.desk.size === r.phone.size ? '' : `  (size ${r.desk.size} → ${r.phone.size}px, fine)`;
    console.log(`  ${r.page.padEnd(20)} ${r.name.padEnd(20)} ${(r.desk.family + ' ' + r.desk.size + 'px').padEnd(20)} ${r.phone.family} ${r.phone.size}px${sizeNote}`);
  }
  await browser.close();
  if (problems.length) {
    console.error('\nFAMILY MISMATCHES (' + problems.length + '):');
    for (const p of problems) console.error('  ✗ ' + p);
    process.exit(1);
  }
  console.log('\nevery role keeps one typeface across breakpoints');
})();
