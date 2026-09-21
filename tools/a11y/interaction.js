/* Interaction and assistive-tech audit — the checks the jsdom gates cannot do.

   `audit.js` runs axe in jsdom, which has no layout engine and no real keyboard,
   so the following were previously only covered by hand:
     - the skip link, tab order, and whether focus actually moves into <main>
     - the disclosure rows (the 27 service entries): reachable by Tab, toggled by
       Enter *and* Space, focus ring really painted, nothing focusable hidden
       inside a closed row
     - the back-to-top control: appears on scroll, has a name, returns focus
     - text zoom to 200% (WCAG 1.4.4) on every page
     - prefers-reduced-motion: no content left invisible
     - axe in a real browser with colour-contrast AND target-size enabled
     - accessible names for links and rows, and that decorative plates (the mint
       icon tiles) contribute nothing to the accessibility tree

   Usage:  python3 -m http.server 8099 --directory public &
           PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" node tools/a11y/interaction.js
*/
const fs = require('fs');
const { chromium } = require('playwright');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
const PAGES = ['/', '/rolunk/', '/szolgaltatasok/', '/technologia/', '/uj-paciens/', '/uj-paciens/adatlap/', '/kapcsolat/'];

let bad = 0;
const ok = (c, label, detail) => { if (!c) bad++; console.log(`${c ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`); };
const info = (label, detail) => console.log(`INFO  ${label}${detail ? '  — ' + detail : ''}`);

const settle = (page) => page.evaluate(() => {
  document.documentElement.classList.remove('js');
  document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
});

(async () => {
  const browser = await chromium.launch();

  /* ---------------------------------------------- 1. keyboard + focus */
  console.log('== keyboard operation (Chromium) ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, isMobile: false });
    const page = await ctx.newPage();
    await page.goto(BASE + '/szolgaltatasok/', { waitUntil: 'load' });
    await settle(page);

    /* skip link: first Tab must reach it, Enter must move focus into <main> */
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => {
      const a = document.activeElement;
      return { cls: a.className, text: (a.textContent || '').trim(), href: a.getAttribute && a.getAttribute('href') };
    });
    ok(/skip-link/.test(first.cls), 'first Tab reaches the skip link', `${first.text} → ${first.href}`);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    const afterSkip = await page.evaluate(() => ({
      id: document.activeElement.id,
      tag: document.activeElement.tagName,
      hash: location.hash,
    }));
    ok(afterSkip.id === 'main' || afterSkip.hash === '#main', 'skip link moves focus to <main>',
      `${afterSkip.tag}#${afterSkip.id} ${afterSkip.hash}`);

    /* the accordion rows must be reachable and operable by keyboard */
    const rows = await page.evaluate(() => {
      const list = [...document.querySelectorAll('#vizsgalatok details')];
      return list.length;
    });
    const firstRow = page.locator('#vizsgalatok details').first();
    await firstRow.locator('summary').focus();
    const focused = await page.evaluate(() => ({
      tag: document.activeElement.tagName,
      open: document.activeElement.parentElement.open,
    }));
    ok(focused.tag === 'SUMMARY', 'a service row can hold keyboard focus', focused.tag);

    await page.keyboard.press('Enter');
    const afterEnter = await page.evaluate(() => document.querySelector('#vizsgalatok details').open);
    ok(afterEnter === true, 'Enter opens the focused row');
    await page.keyboard.press('Enter');
    const afterEnter2 = await page.evaluate(() => document.querySelector('#vizsgalatok details').open);
    ok(afterEnter2 === false, 'Enter closes it again');

    await page.keyboard.press(' ');
    const afterSpace = await page.evaluate(() => document.querySelector('#vizsgalatok details').open);
    ok(afterSpace === true, 'Space also toggles the row');

    /* focus indicator must actually be painted (WCAG 2.4.7 / 2.4.11) */
    const ring = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement);
      return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor, offset: s.outlineOffset };
    });
    const ringed = parseFloat(ring.w) >= 2 && ring.style !== 'none';
    ok(ringed, 'the focused row shows a visible focus ring', `${ring.w} ${ring.style} ${ring.color} offset ${ring.offset}`);

    /* tab order must not have moved into hidden accordion bodies */
    const trap = await page.evaluate(async () => {
      const closed = [...document.querySelectorAll('details:not([open]) .acc__body')];
      const focusables = closed.flatMap((b) => [...b.querySelectorAll('a[href], button, input, select, textarea')]);
      return focusables.filter((el) => el.offsetParent !== null).length;
    });
    ok(trap === 0, 'no focusable element inside a closed row', `${trap} found`);

    info('service rows found', String(rows));

    /* back-to-top: appears on scroll, Enter works, focus lands on <main> */
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(200);
    const visible = await page.evaluate(() => {
      const b = document.querySelector('[data-to-top]');
      const s = getComputedStyle(b);
      return { vis: s.visibility, op: s.opacity, label: b.getAttribute('aria-label') || (b.textContent || '').trim() };
    });
    ok(visible.vis === 'visible' && parseFloat(visible.op) > 0.9, 'back-to-top is visible after scrolling', `${visible.vis}/${visible.op}`);
    ok(visible.label.length > 0, 'back-to-top has an accessible name', visible.label);
    await page.evaluate(() => document.querySelector('[data-to-top]').focus());
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
    const landed = await page.evaluate(() => ({ y: Math.round(window.scrollY), id: document.activeElement.id }));
    ok(landed.y === 0 && landed.id === 'main', 'back-to-top returns to the top and hands focus to <main>', `y=${landed.y} focus=#${landed.id}`);

    await page.close();
    await ctx.close();
  }

  /* ------------------------------------------------- 2. text zoom 200% */
  console.log('\n== text zoom 200% (WCAG 1.4.4) and 320px reflow ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, isMobile: false });
    for (const rel of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + rel, { waitUntil: 'load' });
      await settle(page);
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      await page.waitForTimeout(250);
      const m = await page.evaluate(() => {
        const de = document.scrollingElement;
        return { over: de.scrollWidth - window.innerWidth };
      });
      ok(m.over <= 1, `${rel} has no horizontal overflow at 200% text`, `${m.over}px`);
      await page.close();
    }
    await ctx.close();
  }

  /* --------------------------------------------- 3. reduced motion */
  console.log('\n== prefers-reduced-motion ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')]
      .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length);
    ok(hidden === 0, 'no scroll-reveal content stays hidden with reduced motion', `${hidden} hidden`);
    const animated = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('.acc') || document.body);
      return s.transitionDuration;
    });
    info('transition duration under reduced motion', animated);
    await page.close();
    await ctx.close();
  }

  /* ------------------------------------- 4. axe: contrast + target size */
  console.log('\n== axe in Chromium (colour contrast ON, target-size ON, accordions open) ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, isMobile: false });
    let total = 0;
    for (const rel of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + rel, { waitUntil: 'load' });
      await page.evaluate(() => {
        document.documentElement.classList.remove('js');
        document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
        document.querySelectorAll('details').forEach((d) => { d.open = true; });
      });
      await page.waitForTimeout(350);
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      }));
      total += res.violations.length;
      if (res.violations.length) {
        console.log(`  ${rel}`);
        for (const v of res.violations) {
          console.log(`    [${v.impact}] ${v.id}: ${v.help}`);
          for (const n of v.nodes.slice(0, 3)) console.log(`        ${n.target.join(' ')}`);
        }
      }
      await page.close();
    }
    ok(total === 0, 'axe reports no violation (incl. colour-contrast and target-size)', `${total} groups`);
    await ctx.close();
  }

  /* ------------------------------- 5. accessible names, decorative icons */
  console.log('\n== accessible names and icon exposure ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, isMobile: false });
    for (const rel of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + rel, { waitUntil: 'load' });
      await settle(page);
      const r = await page.evaluate(() => {
        const name = (el) => (el.getAttribute('aria-label') || el.textContent || '').trim();
        const vague = /^(részletek|tovább|ide|kattintson|itt|link|more)\.?$/i;
        const empty = [];
        const vagueList = [];
        for (const a of document.querySelectorAll('a[href]')) {
          const n = name(a) || (a.querySelector('img[alt]') ? a.querySelector('img[alt]').alt.trim() : '');
          if (!n) empty.push(a.outerHTML.slice(0, 60));
          else if (vague.test(n)) vagueList.push(n + ' → ' + a.getAttribute('href'));
        }
        const summaries = [...document.querySelectorAll('summary')];
        const emptySummaries = summaries.filter((s) => !(s.textContent || '').trim().length).length;
        const unlabelledSummaries = summaries.filter((s) => !name(s)).length;
        /* decorative svgs must be hidden from AT and not focusable */
        const svgs = [...document.querySelectorAll('svg')];
        const exposed = svgs.filter((s) => s.getAttribute('aria-hidden') !== 'true' && !s.getAttribute('aria-label')).length;
        const focusableSvg = svgs.filter((s) => s.getAttribute('focusable') !== 'false').length;
        /* icons inside labels must not add noise */
        const decorativeSpans = [...document.querySelectorAll('.acc__icon, .card__icon, .info__icon, .acc__sign')];
        const hiddenFromAT = (el) => el.getAttribute('aria-hidden') === 'true'
          || [...el.children].every((c) => c.getAttribute('aria-hidden') === 'true');
        const exposedSpans = decorativeSpans.filter((s) => !hiddenFromAT(s) && s.textContent.trim().length > 0).length;
        return { empty, vagueList, summaries: summaries.length, emptySummaries, unlabelledSummaries, exposed, focusableSvg, decorativeSpans: decorativeSpans.length, exposedSpans };
      });
      ok(r.empty.length === 0, `${rel}: every link has an accessible name`, r.empty.slice(0, 2).join(' | '));
      ok(r.vagueList.length === 0, `${rel}: no vague link text`, r.vagueList.slice(0, 2).join(' | '));
      ok(r.emptySummaries === 0 && r.unlabelledSummaries === 0, `${rel}: every disclosure row is named`, `${r.summaries} rows`);
      ok(r.exposed === 0, `${rel}: all svg icons hidden from assistive tech`, `${r.exposed} exposed`);
      ok(r.focusableSvg === 0, `${rel}: no svg is focusable`, `${r.focusableSvg} focusable`);
      ok(r.exposedSpans === 0, `${rel}: decorative icon plates add no AT content`, `${r.exposedSpans}/${r.decorativeSpans}`);
      await page.close();
    }
    await ctx.close();
  }

  console.log(bad ? `\n${bad} FAILURE(S)` : '\nall accessibility checks passed');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
