# Aiki Dent — redesign brief (handover)

Read this first. It carries the context that is not in the git history.

---

## 1. The project

Hugo website for **Aiki Dent Fogászat** — a biological / holistic dental practice in
Budapest (XIII. kerület, Hegedűs Gyula utca 29/b). The dentist and owner is
**Dr. Kelemen László**.

- **Status:** live demo, **not the final site.** It exists to show the client what the
  redesign looks like. The real content is still being collected.
- **Live preview:** https://aiki-dent.statichost.page/ (deployed from `main` via statichost)
- **Client's original brief** (briefs, logo PDF, and a fill-in sheet):
  `~/Projektek/Laci/_brief/` — **outside the repo on purpose**, because the repo is public.
  `_brief/brief.txt` is the extracted text of both `.docx` files and is the source of
  truth for the client's own copy.

---

## 2. ⚠️ What is NOT real on the site

**This is the most important section.** Every item below is demo filler that either we
invented or that came from the client's own "about us" text. Treat none of it as fact.

| on the site | reality |
| --- | --- |
| `data/stats.yaml`: "300+ elégedett páciens", "20 év / két évtizede" | **invented by us.** Not in the brief. |
| `data/testimonials.yaml`: 3 quotes, names Kovács Anna / Nagy Péter / Szabó Eszter | **lorem ipsum + invented names** |
| hero `proof: stars: 5` | **a fabricated rating** |
| the doctor's portrait (`demo1.webp`, 4 places) | **a stock photo**, captioned as Dr. Kelemen László |
| `demo1–4.webp`, `fekvo.webp`, `allo.webp` | Unsplash / demo photos |
| 8 of the 27 service descriptions | **written by us** — the brief had no text for them |
| the map embed coordinates | estimated, not verified |

The 8 descriptions we wrote, which the client must approve or rewrite:
`Ételintolerancia vizsgálat`, `Fogászati anyagok allergiavizsgálata`, `Hajanalízis`,
`Sötétlátóteres mikroszkópos vérvizsgálat`, `Szájüreg mikroszkópos vizsgálata`,
`Akupunktúra`, `Homeopátia`, `PRF membrán`.

The client has a fill-in sheet at `_brief/HIANYLISTA.md` covering all of the above.

---

## 3. The new direction

> "More clean and more informative, **without the self-promotion stuff**."

Concretely:

**Remove / replace (unbacked claims):**
- `stats` block — invented numbers. Delete or replace with **facts** (e.g. the 20-second
  CBCT scan *is* real; it is in the brief).
- `quotes` block — fake testimonials. Hide until real, consented reviews exist.
- hero `proof: stars: 5` — fabricated rating.
- `marquee` — a scrolling brag strip.
- hero `badge` / `float` chips — decoration, not information.
- Superlatives: "legmodernebb", "egyetlen", "legprecízebb", "Magyarországon az első"
  repeated 4×. State the capability, not the boast.

**Add / strengthen (what a patient actually needs):**
- real **opening hours** (currently "Előzetes egyeztetés alapján", which answers nothing)
- **what a treatment actually involves** — the 27 service cards are one line each with
  no depth and nowhere to click on `/szolgaltatasok/`
- **pricing approach** — currently only buried as FAQ #6 on another page
- who the practice is **for** and who it is **not** for
- the first-visit process, in plain steps
- insurance / health-fund handling (this part is already good — keep it)

**Tone:** inform, don't sell. Prefer specifics over adjectives.

---

## 4. Architecture

- **Block system.** Every page is a Markdown file in `content/<slug>/_index.md` whose YAML
  front matter has a `blocks:` list. Each block type is a partial in
  `layouts/partials/blocks/<type>.html`, dispatched by `partials/render-blocks.html`.
  **Full schema: `docs/BLOCK-SCHEMA.md`.**
- **Repeatable content lives in `data/*.yaml`** (services, examinations, treatments, faq,
  insurance, values, …). Edit there, not in the templates.
- One stylesheet: `assets/css/main.css`. One script: `assets/js/main.js`.
- Logo is generated from `brief/Aiki_Dent_logo_h.pdf` by `tools/make-logo.py`
  (output is byte-identical to what is committed — verify with `git status`).

---

## 5. Decisions already made by the client — do NOT undo

These were explicitly requested. Re-adding them will be seen as a regression:

- the dark wine **CTA band at the bottom of every page** was removed (the `cta` block type
  still exists but is used by no page)
- the **footer is minimal**: two columns (brand + Kapcsolat), one copyright line.
  No menu columns, no service columns, no horizontal link row.
- **no social media icons** anywhere
- **all corner radii are 6px** (`--radius`; the named `--r-*` steps are aliases)
- a floating **"Vissza a tetejére"** button exists and is expected
- the **URL aliases** `/vizsgalatok/`, `/kezelesek/`, `/elso-latogatas/`, `/cbct/` must keep
  redirecting to the new pages (they are live and may be linked)

---

## 6. Quality gates — run these after every change

```bash
hugo --quiet                      # any error fails the build
cd tools/a11y && npm install      # first time only

node tools/a11y/audit.js          # axe-core + heading order, ids, link names, labels
node tools/a11y/contrast.js       # 71 WCAG contrast pairings — add new colours to PAIRS
node tools/a11y/selectors.js      # CSS selectors matching nothing (= typo'd class names)
python3 tools/a11y/dead-css.py    # same idea, class level
```

Plus, after any layout/CSS change:

```bash
python3 -m http.server 8099 --directory public &     # or BASE_URL=... 
node tools/a11y/overflow.js       # horizontal overflow at 320–430px, names the culprit
```

**All of these must be clean before committing.** Current state: 0 violations / 0 failures.

Two traps this tooling exists to catch, both of which have actually happened here:
1. A CSS rule whose class name does not match the markup — styles silently do nothing.
   (`.footer …` vs `class="site-footer"` broke the whole footer.)
2. Horizontal overflow on phones. `.split__media::before` hung 24px out against an 18.4px
   gutter → 6px of horizontal pan. **Note `overflow.js` must keep `isMobile: false`** —
   Playwright's mobile emulation widens the layout viewport and hides the bug.

---

## 7. Open items waiting on the client

1. Photos — a stock photo is currently captioned as the dentist. Needs ~9 real photos.
2. The fill-in sheet `_brief/HIANYLISTA.md`: opening hours, real testimonials (with written
   patient consent), approval of the 8 descriptions, pricing decision, map check.
3. `baseURL` is `https://aikident.hu/`, but that domain's HTTPS certificate does not match
   and it is not serving this build. `canonical` and `og:url` therefore point at a dead
   domain. If the site should look correct on the statichost preview, set
   `baseURL = 'https://aiki-dent.statichost.page/'` until DNS is moved.

---

## 8. Working agreements that have served well

- **Verify, don't assume.** Measure in a real browser; run the gates; prove a fix with a
  control test that *can* fail.
- Prefer an honest placeholder + a note over invented facts. Never add a number, price,
  testimonial or claim the client has not provided.
- Commit to a branch and let the human merge, unless told otherwise.
