/* Typography guard — the readability floor, measured in a real browser.

   This exists because a design forum's verdict on the site was "hard to read,
   sometimes the texts are too small and narrow". Both halves of that are
   measurable, so they are measured here instead of being argued about:

     - reading text (anything a patient actually reads) must be >= 16px
     - long paragraphs must not be squeezed into short lines: a line of body
       text wants roughly 45–85 characters
     - form inputs must be >= 16px, otherwise iOS Safari zooms the page on focus
     - meta and label text must stay >= 13.5px

   Usage:  python3 -m http.server 8099 --directory public &
           PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" node tools/a11y/type.js
*/
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
const PAGES = ['/', '/szolgaltatasok/', '/uj-paciens/', '/kapcsolat/', '/uj-paciens/adatlap/'];
const WIDTHS = [390, 1440];

/* reading text: the floor is 16px */
const READING = [
  ['card text', '.card p'],
  ['checklist item', '.checks li'],
  ['process step', '.step p'],
  ['accordion body', '.acc__body p'],
  ['contact detail', '.info a, .info span'],
  ['body paragraph', '.split__body > p:not(.eyebrow):not(.lead)'],
  ['footer text', '.site-footer p'],
  ['notice', '.notice p'],
];
/* labels and small print: a softer floor */
const META = [
  ['eyebrow', '.eyebrow'],
  ['top bar', '.topbar'],
  ['chip', '.pill'],
  ['breadcrumb', '.crumbs a'],
  ['form small print', '.form-note'],
  ['intake field label', '.iform__f label'],
];
const INPUTS = ['input[type="text"]', 'input[type="tel"]', 'input[type="email"]', 'textarea'];

let failures = 0;
const check = (ok, label, detail) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

/* runs in the page: must be self-contained (no outer helpers) */
const measure = (selectors) => {
  const lineStats = (el) => {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const r = document.createRange();
    r.selectNodeContents(el);
    const lines = [...r.getClientRects()].filter((x) => x.width > 2 && x.height > 2).length;
    return { chars: text.length, lines, cpl: lines ? Math.round(text.length / lines) : 0 };
  };
  const out = [];
  for (const [label, sel] of selectors) {
    const el = [...document.querySelectorAll(sel)].find((e) => (e.textContent || '').trim().length > 10);
    if (!el) continue;
    const cs = getComputedStyle(el);
    out.push({ label, size: Math.round(parseFloat(cs.fontSize) * 10) / 10, lh: Math.round(parseFloat(cs.lineHeight) * 10) / 10, stats: lineStats(el) });
  }
  return out;
};

(async () => {
  const browser = await chromium.launch();
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, isMobile: false });
    console.log(`\n== ${width}px`);
    for (const path of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: 'load' });
      await page.evaluate(() => {
        document.documentElement.classList.remove('js');
        document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
        document.querySelectorAll('details').forEach((d) => { d.open = true; });
      });
      await page.waitForTimeout(200);
      const reading = await page.evaluate(measure, READING);
      const meta = await page.evaluate(measure, META);
      const inputs = await page.evaluate((sels) => {
        const out = [];
        for (const s of sels) {
          const el = document.querySelector(s);
          if (el) out.push({ sel: s, size: Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10 });
        }
        return out;
      }, INPUTS);

      for (const r of reading) {
        check(r.size >= 16, `${path} ${r.label} ≥ 16px`, `${r.size}px`);
        /* Only judge line length on paragraphs long enough for it to matter.
           The floor is 40 rather than the classic 45 because short blocks (the
           footer blurb) deliberately cap themselves at 40ch; the failure this
           guards against is a paragraph crushed into ~27 characters. */
        if (r.stats && r.stats.chars > 150) {
          const min = width < 600 ? 25 : 40;
          check(r.stats.cpl >= min && r.stats.cpl <= 90, `${path} ${r.label} line length`, `${r.stats.cpl} chars/line (want ${min}–90)`);
        }
      }
      for (const r of meta) check(r.size >= 13.5, `${path} ${r.label} ≥ 13.5px`, `${r.size}px`);
      for (const i of inputs) check(i.size >= 16, `${path} ${i.sel} ≥ 16px (no iOS zoom)`, `${i.size}px`);
      await page.close();
    }
    await ctx.close();
  }
  console.log(failures ? `\n${failures} failure(s)` : '\nreadability floor holds');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
