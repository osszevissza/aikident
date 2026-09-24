/* Font audit for the display typeface.

   Picking a heading font for this site has three traps, all of which are
   measurable, so they are measured here instead of being discovered later:

     1. missing Hungarian double acutes (ő ű Ő Ű) — half the copy is Hungarian
        ("időpont", "előzetes", "fogászati"); a font without them is unusable;
     2. a different optical size: Comfortaa's capitals are 37% taller than
        Playfair's at the same font-size, so headings wrap differently and the
        display scale has to be compensated (`--display-scale`);
     3. too few weights for a heading face (one weight means no emphasis).

   Usage:  python3 -m http.server 8099 --directory public &
           PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" node tools/a11y/fonts.js
           [--json] [--reference=<Family>]

   Drop a candidate into `static/fonts/<Family>/` (woff2 + its license file) and
   it is picked up automatically: the accompanying .css files declare the faces.
*/
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SITE = (() => {
  let d = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'hugo.toml'))) return d;
    d = path.dirname(d);
  }
  throw new Error('hugo.toml not found above ' + __dirname);
})();
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
const FONT_DIR = path.join(SITE, 'static', 'fonts');

/* ---------------------------------------------------------- read the faces */
const faces = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.css')) {
      const css = fs.readFileSync(p, 'utf8');
      for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
        const body = block[1];
        const family = (body.match(/font-family:\s*['"]?([^;'"]+)/) || [])[1];
        const weight = (body.match(/font-weight:\s*([^;]+)/) || [])[1] || '400';
        const src = (body.match(/url\(['"]?([^'")]+)['"]?\)/) || [])[1];
        const style = (body.match(/font-style:\s*([^;]+)/) || [])[1] || 'normal';
        if (!family || !src) continue;
        faces.push({
          family: family.trim(),
          weight: weight.trim(),
          style: style.trim(),
          file: path.relative(SITE, path.join(path.dirname(p), src)).replace(/^static\//, ''),
        });
      }
    }
  }
})(FONT_DIR);

if (!faces.length) {
  console.error('no @font-face declarations found under static/fonts');
  process.exit(1);
}

/* which family does the site actually use for display type right now? */
const mainCss = fs.readFileSync(path.join(SITE, 'assets', 'css', 'main.css'), 'utf8');
const displayToken = (mainCss.match(/--f-display:\s*([^;]+)/) || [])[1] || '';
const currentDisplay = (displayToken.match(/^['"]?([^'",]+)/) || [])[1] || '';

const families = [...new Set(faces.map((f) => f.family))];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 900, height: 700 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(async ({ faces, families, base }) => {
    const loaded = [];
    for (const f of faces) {
      try {
        /* f.file already starts with `fonts/` (it is relative to static/) */
        const face = new FontFace(f.family, `url(${base}/${f.file})`, { weight: f.weight, style: f.style });
        await face.load();
        document.fonts.add(face);
        loaded.push(f);
      } catch (e) {
        loaded.push({ ...f, failed: String(e && e.message || e) });
      }
    }
    await document.fonts.ready;

    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 200;
    const g = canvas.getContext('2d');
    /* The `font` shorthand only: a canvas 2D context has no font longhands, and a
       variable face is declared `font-weight: 100 900`, so `'100 900 100px "X"'`
       is invalid CSS — the assignment is silently ignored and whatever font was
       set before gets measured. Use one numeric weight (400 for a range) and keep
       the string valid; `assertMeasured()` below catches it if that ever fails. */
    const setFont = (family, weight, size) => {
      const parts = String(weight).trim().split(/\s+/);
      const w = parts.length === 1 && /^\d+$/.test(parts[0]) ? parts[0] : '400';
      g.font = w + ' ' + size + 'px "' + family + '", sans-serif';
    };
    /* a real text face at 100px lands inside these bounds; the 10px canvas default
       (what you get when the assignment failed) does not */
    const assertMeasured = (m, family) => {
      if (m.xh < 0.30 || m.xh > 0.80 || m.advance < 25 || m.advance > 90) {
        throw new Error(`measurement looks wrong for ${family} (x-height ${m.xh}, advance ${m.advance}) — is the face loading?`);
      }
      return m;
    };
    const metrics = (ch, family, weight, size) => {
      g.clearRect(0, 0, 400, 200);
      setFont(family, weight, size);
      g.fillStyle = '#000';
      g.fillText(ch, 10, 150);
      const d = g.getImageData(0, 0, 400, 200).data;
      let top = 1e9, bottom = -1, left = 1e9, right = -1;
      for (let y = 0; y < 200; y++) for (let x = 0; x < 400; x++) {
        if (d[(y * 400 + x) * 4 + 3] > 30) {
          if (y < top) top = y; if (y > bottom) bottom = y;
          if (x < left) left = x; if (x > right) right = x;
        }
      }
      return { h: bottom >= top ? bottom - top + 1 : 0, w: right >= left ? right - left + 1 : 0 };
    };

    const out = [];
    for (const family of families) {
      const own = loaded.filter((f) => f.family === family);
      const facesOk = own.filter((f) => !f.failed);
      if (!facesOk.length) {
        out.push({ family, error: own[0] && own[0].failed ? own[0].failed : 'no loadable face' });
        continue;
      }
      const weights = [...new Set(facesOk.map((f) => f.weight))].sort();
      const ref = facesOk.find((f) => f.weight === '400') || facesOk[0];
      /* glyph coverage, checked per face */
      const missing = [];
      for (const f of facesOk) {
        const tofu = metrics('\uE000', family, f.weight, 100).h;
        for (const ch of ['ő', 'ű', 'Ő', 'Ű', 'é', 'á']) {
          const m = metrics(ch, family, f.weight, 100);
          if (m.h === 0 || m.h === tofu) missing.push(`${ch}@${f.weight}`);
        }
      }
      const S = 100;
      const xh = metrics('x', family, ref.weight, S).h / S;
      const cap = metrics('H', family, ref.weight, S).h / S;
      setFont(family, ref.weight, S);
      const advance = Math.round(g.measureText('fogaszati').width / 9);
      try {
        assertMeasured({ xh, cap, advance }, family);
      } catch (e) {
        out.push({ family, error: e.message });
        continue;
      }
      out.push({ family, weights, xh, cap, advance, missing, files: facesOk.map((f) => f.file) });
    }
    return out;
  }, { faces, families, base: BASE });

  /* reference for the suggested scale: --reference=<Family>, else the installed one */
  const refArg = process.argv.find((a) => a.startsWith('--reference='));
  const reference = refArg ? refArg.split('=')[1] : currentDisplay;
  const refRow = result.find((r) => r.family === reference && r.xh);
  if (!refRow) console.log(`(reference family "${reference}" not found — scale column left blank)\n`);
  const json = process.argv.includes('--json');
  if (json) {
    console.log(JSON.stringify({ currentDisplay, families: result }, null, 2));
    await browser.close();
    return;
  }

  console.log(`current --f-display: ${currentDisplay || '(none)'}    scale reference: ${reference}`);
  console.log(`fonts found        : ${families.length} families, ${faces.length} faces\n`);
  console.log('family         weights      ő ű Ő Ű   x-height  cap-h   advance   --display-scale');
  for (const r of result) {
    if (r.error) {
      console.log(`${r.family.padEnd(14)} LOAD FAILED — ${r.error}`);
      continue;
    }
    const glyphs = r.missing.length ? `MISSING ${r.missing.join(',')}` : 'ok';
    const scale = refRow && refRow.xh ? (refRow.xh / r.xh).toFixed(2) : '—';
    console.log(
      `${r.family.padEnd(14)} ${r.weights.join(',').padEnd(12)} ${glyphs.padEnd(11)} ` +
      `${r.xh.toFixed(3).padStart(6)}    ${r.cap.toFixed(3).padStart(5)}   ${String(r.advance).padStart(5)}     ${String(scale).padStart(5)}`
    );
  }
  const broken = result.filter((r) => r.error || (r.missing && r.missing.length));
  if (broken.length) {
    console.log(`\n${broken.length} family/families need attention before use (missing Hungarian glyphs or unloadable).`);
    await browser.close();
    process.exit(1);
  }
  console.log('\nevery bundled family covers ő ű Ő Ű. Suggested --display-scale matches x-height to the reference family (optically comparable sizes).');
  await browser.close();
})();
