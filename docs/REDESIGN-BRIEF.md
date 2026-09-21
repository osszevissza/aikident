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

| on the site | reality | status |
| --- | --- | --- |
| `data/stats.yaml`: "300+ elégedett páciens", "20 év / két évtizede" | **invented by us.** Not in the brief. | **removed** — file, block, CSS and the counter animation in `main.js` are gone |
| `data/testimonials.yaml`: 3 quotes, names Kovács Anna / Nagy Péter / Szabó Eszter | **lorem ipsum + invented names** | **removed from content** — the data file is an empty scaffold; the `quotes` block + CSS stay for real reviews (§ see `docs/BLOCK-SCHEMA.md`) |
| hero `proof: stars: 5` | **a fabricated rating** | **removed** — the star branch is gone from `hero.html` and `main.css` |
| hero `badge` / `float` chips ("Magyarországon az első", "20 mp") | decoration + an unverifiable boast | **removed** — markup and CSS gone |
| `marquee` strip | a scrolling brag strip | **removed** — partial, CSS and usage gone |
| the doctor's portrait (`demo1.webp`, 4 places → now 3) | **a stock photo**, captioned as Dr. Kelemen László | **still there** — waiting on real photos |
| `demo1–4.webp`, `fekvo.webp`, `allo.webp` | Unsplash / demo photos | still there |
| 8 of the 27 service descriptions | **written by us** — the brief had no text for them | still written by us; each affected grid now names them in a `footnote` |
| the map embed coordinates | estimated, not verified | still estimated |
| "fogszabályozó" in `hugo.toml` meta description | **invented** — the brief never calls him an orthodontist | **removed** |
| "Hívjon minket még ma", "egy munkanapon belül visszahívja Önt", West-station transit and wheelchair-access claims on `/kapcsolat/` | **written by us**, not in the brief | **removed / reworded** |

The 8 descriptions we wrote, which the client must approve or rewrite:
`Ételintolerancia vizsgálat`, `Fogászati anyagok allergiavizsgálata`, `Hajanalízis`,
`Sötétlátóteres mikroszkópos vérvizsgálat`, `Szájüreg mikroszkópos vizsgálata`,
`Akupunktúra`, `Homeopátia`, `PRF membrán`.

They are now listed **by name in the footnote of the two service grids** on
`/szolgaltatasok/` (and the examinations grid on the home page), so a visitor — and
the client — can see which texts are still provisional.

The client has a fill-in sheet at `_brief/HIANYLISTA.md` covering all of the above.
One item there is now slightly out of date: the §4 quote for
`Szájüreg mikroszkópos vizsgálata` was a grammatically broken sentence ("a diagnózis
pontossá válnak"), which we corrected — the quote in that document differs from the
site by a few words.

---

## 3. The new direction

> "More clean and more informative, **without the self-promotion stuff**."

### Done in the last pass

**Removed / replaced (unbacked claims):**
- `stats` block — invented numbers. The block, its data file, its CSS and the
  count-up animation are **deleted** (not merely unused): a number band invites
  invented numbers back.
- `quotes` block — fake testimonials. Removed from every page, data file emptied;
  the block itself is kept so real, consented reviews can be switched on from
  content alone.
- hero `proof: stars: 5`, hero `badge` and `float` — gone from the markup and CSS.
- `marquee` — the scrolling brag strip is gone entirely.
- Superlatives: "legmodernebb", "egyetlen", "legprecízebb", "Magyarországon az első"
  — all rewritten to state the capability, not the boast. The meta description no
  longer claims he is a "fogszabályozó".

**Added / strengthened (what a patient actually needs):**
- **How to reach us** — a new "Rendelés és időpont" section on the home page: address,
  phone, e-mail, the (unchanged) hours statement, what to bring, how payment works,
  with buttons to the booking page and to the pricing section.
- **What a treatment involves** — earlier in this pass, `/szolgaltatasok/` gained a
  "Hogyan zajlik egy kezelés nálunk?" section (`#folyamat`) and all 27 service cards
  linked to it. **Both were removed on the client's instruction:** the per-treatment
  detail is still being collected and does not yet support that structure, so cards
  that advertise "more detail" would overpromise. What remains is the honest state:
  each service opens to the description the brief actually contains (the two
  accordions below), and the practical "how it works here" questions are answered by
  the first-visit steps on `/uj-paciens/` and the pricing section.
  The removed section's five steps are in git history (the `608e3cf` commit and its
  parent) if the client's detail arrives — re-adding it is one `steps` block.
- **Long lists became dropdowns.** The 12 examinations and 15 treatments are no
  longer 27 stacked cards: they are two `faq` accordions (`#vizsgalatok`,
  `#kezelesek`), collapsed by default, each item opening to its description. At a
  390 px viewport `/szolgaltatasok/` went from 21 185 px to 14 702 px (25.1 → 17.4
  screens, −31%). The home page keeps a 6-card teaser grid, which links to the full
  examination list. The texts were not duplicated to do this: the `faq` block reads
  the same `title`/`text` fields the grid does.
- **Pricing** — `/uj-paciens/#arak` ("Árak és fizetés"): what the cost depends on,
  when the figure is discussed, payment in the practice, the invoice-for-the-insurer
  route and the health-fund list. No prices are published, and the page says so
  plainly instead of hiding the question in an FAQ.
- **Who the practice is for — and who it is not for** — `/uj-paciens/#kinek` plus a
  candid "Mikor érdemes máshol megoldást keresnie?" list (acute pain without an
  appointment, expecting the insurer to pay, wanting treatment without diagnostics,
  not wanting to take part in the decisions).
- **Practical FAQ first** — the FAQ is reordered so the shorter pages (home, services,
  contact) show booking, insurance, price and first-visit questions rather than theory.

**Readability pass (after design-forum feedback: "too small and narrow"):**
- body text 16→17px (top of the clamp 17.2→18.4px), and everything meant to be
  *read* now sits at body size instead of 15.2–15.8px; labels lifted to 14.4px,
  inputs to ≥16px (which also stops iOS Safari zooming on focus).
- the four pillars moved from `cols: 4` to `cols: 2`: a 20-word paragraph in a
  217px column was ~27 characters per line — the "narrow" half of the complaint.
  Now ~54. `grid--4` stays available for short-label grids.
- measure cap on long paragraphs 82ch → 72ch.
- cost, measured: pages ~4–6% taller on mobile, ~6–9% on desktop.
- `tools/a11y/type.js` keeps the floor from slipping back.
- the home examination teaser went from 6 cards to 3 (`limit: 3`): on a phone it
  was 2472px ≈ three screens of stacked cards. It is a teaser, not a catalogue —
  the full list is one click away and already a dropdown on `/szolgaltatasok/`.
  That block is now 1433px, and the home page 18.9 → 17.7 screens on mobile.

**Still open (needs the client):** see §7 — real photos and the rest.


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
node tools/a11y/claims.js         # removed claims must not come back; #fragments; aliases
node tools/a11y/icons.js          # unknown/empty icon glyphs; every icon still paints
```

Plus, after any layout/CSS change:

```bash
python3 -m http.server 8099 --directory public &     # or BASE_URL=... 
PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" node tools/a11y/overflow.js
                                  # horizontal overflow at 320–430px, names the culprit
PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" node tools/a11y/interaction.js
                                  # keyboard, focus, skip link, 200% zoom, reduced motion,
                                  # axe with contrast + target-size in a real browser
PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" node tools/a11y/type.js
                                  # readability floor: reading text ≥16px, line length
                                  # 40–90 chars, inputs ≥16px (iOS zoom)
```

**All of these must be clean before committing.** Current state: 0 violations / 0 failures.

Two traps this tooling exists to catch, both of which have actually happened here:
1. A CSS rule whose class name does not match the markup — styles silently do nothing.
   (`.footer …` vs `class="site-footer"` broke the whole footer.)
2. Horizontal overflow on phones. `.split__media::before` hung 24px out against an 18.4px
   gutter → 6px of horizontal pan. **Note `overflow.js` must keep `isMobile: false`** —
   Playwright's mobile emulation widens the layout viewport and hides the bug.

Two notes on the tooling itself:

- **`audit.js` cannot check contrast** (jsdom has no layout engine, so the axe rule is
  disabled there) — `contrast.js` covers the token pairs instead. For a stronger check,
  run axe in real Chromium with the rule on; the last such run was clean on all 7 pages
  (0 violations), measuring with `.js` removed from `<html>` so the scroll-reveal
  opacity transition does not produce blended false positives.
- **`RESERVED` lists** in `selectors.js` / `dead-css.py` hold the class vocabulary that
  is deliberately unused. Right now that is the `quotes` block (waiting for real,
  consented reviews) and `cta-band` / `section--wine` (the bottom band the client asked
  to drop). If a block is gone for good, delete its CSS and partial too instead of
  growing that list.

---

## 7. Open items waiting on the client

1. ~~**Opening hours.**~~ **Closed — there are none to get.** The practice is a
   one-man private practice without a fixed weekly schedule, so "Előzetes egyeztetés
   alapján" (`site.Params.hours`) is not a placeholder: it is the answer. Do not
   "fix" it by inventing hours, and do not send the client back to
   `_brief/HIANYLISTA.md` §1 for a schedule that does not exist. The FAQ answer
   "Van fix nyitvatartásuk?" explains what by-appointment means in practice, which
   is the useful part. If a schedule ever becomes real, the places to change are
   `hugo.toml` (`hours`), the contact info list in
   `layouts/partials/blocks/contact.html`, the `/kapcsolat/` page and that FAQ.
2. Photos — a stock photo is still captioned as the dentist (3 places now).
   Needs ~9 real photos.
3. The fill-in sheet `_brief/HIANYLISTA.md`: real testimonials (with written patient
   consent), approval of the 8 descriptions, pricing decision, map check. Two of its
   items are now moot or out of step: **§1 (opening hours) is dropped** — see above —
   and §4's quoted sentence for `Szájüreg mikroszkópos vizsgálata` was a grammatical
   error that the site has since corrected.
4. **`baseURL` — currently the preview, on purpose.** It is set to
   `https://aiki-dent.statichost.page/` so that the live preview is self-consistent:
   `canonical` and `og:url` resolve, and the four legacy redirects
   (`/vizsgalatok/`, `/kezelesek/`, `/elso-latogatas/`, `/cbct/`) actually land
   somewhere. Hugo's alias pages use **absolute** URLs — `relativeURLs = true` does
   not touch them (verified) — so this one setting is what controls the redirects.
   **Go-live step: set it back to `https://aikident.hu/` once DNS is moved**, or the
   published site will point every canonical and every legacy redirect at the
   statichost preview. `hugo.toml` carries the same warning next to the value.

---

## 8. Working agreements that have served well

- **Verify, don't assume.** Measure in a real browser; run the gates; prove a fix with a
  control test that *can* fail.
- Prefer an honest placeholder + a note over invented facts. Never add a number, price,
  testimonial or claim the client has not provided.
- Commit to a branch and let the human merge, unless told otherwise.
