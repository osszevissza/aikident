# Aiki Dent — content block schema

Every page is a Markdown file in `aiki/content/<slug>/_index.md` whose YAML front
matter contains a `blocks:` list. Each block is rendered by
`aiki/layouts/partials/blocks/<type>.html`. **Never create or edit layouts**; only
author content that uses the block types documented below.

```yaml
---
title: Rólunk
description: Egy mondat, ami a <meta name="description"> és az OG leírás lesz.
blocks:
  - type: pageHero
    ...
---
```

Common optional keys accepted by **every** section block:
`id` (HTML anchor), `bg` (`paper` | `cream` | `frost` | `wine`), `tight: true`,
`eyebrow`, `title`, `lead`, `align: center`.

Colour rhythm: alternate `paper` (white) and `cream` (warm off-white); use `frost`
(spa-green gradient) sparingly and `wine` (deep burgundy, white text) at most once
or twice per page. Never put two identical `bg` values back to back.

---

## `pageHero` — top of every inner page

| key | notes |
| --- | --- |
| `eyebrow` | short uppercase label |
| `title` | defaults to the page title |
| `crumb` | last breadcrumb label (defaults to page title) |
| `lead` | 1–2 sentences |
| `actions` | list of `{label, url, icon, style}`; `style` may be `btn` or `btn--ghost` |
| `pills` | list of `{text, icon}` rendered as small chips |

```yaml
  - type: pageHero
    eyebrow: Rólunk
    title: Biológiai fogászat Budapesten
    lead: >-
      A holisztikus és biológiai fogászat képezi a rendelőnk alapját.
    actions:
      - label: Időpontfoglalás
        url: /kapcsolat/
        icon: calendar
      - label: Szolgáltatásaink
        url: /szolgaltatasok/
        icon: arrow-right
        style: btn--ghost
    pills:
      - text: Higanymentes fogászat
        icon: shield
      - text: BPA-mentes tömések
        icon: droplet
```

## `cards` — icon card grid

| key | notes |
| --- | --- |
| `cols` | 2, 3 or 4 |
| `style` | `mini` (compact), `wine` (dark card), `tint` (mint card) |
| `data` + `key` | pull items from a data file, e.g. `data: examinations` (key defaults to `items`) |
| `items` | inline list of `{title, text, icon, anchor, url, linkLabel}` |
| `limit` | show only the first N items |
| `numbered` | `true` to show 01/02/03 labels |
| `cta` | `{label, url, icon, style}` button under the grid |
| `footnote` | small grey paragraph under the grid |
| `linkTo` | makes **every** card a link to this URL — see the rule below |
| `linkLabel` | the visible affordance text on such a card, default `Részletek` |

**House rule: one destination means one link.** If all the cards in a grid lead to
the same place, do **not** use `linkTo` — put a single `cta` button under the grid
instead. The home page once carried ten per-card "Részletek" affordances that all
went to the same two URLs; it read as noise, so they were replaced by one button
per grid. Use `linkTo` only when each card genuinely has its own destination
(an item `url`, or `linkTo` + the item's `anchor`).

A card with no destination stays a **static information card**: no hover lift, no
pointer cursor, no affordance text. That is deliberate — see the README's
"Kattinthatóság" section.

```yaml
  - type: cards
    bg: paper
    eyebrow: Vizsgálatok
    title: Alapos feltárás
    cols: 3
    style: mini
    data: examinations
    limit: 6
    cta:                                  # the one link for the whole grid
      label: Összes vizsgálat
      url: /szolgaltatasok/#vizsgalatok
      icon: arrow-right
    footnote: >-
      Az alábbi leírások még a rendelő szakorvosi jóváhagyására várnak: …
```

**Keep grids short.** A card grid is only pleasant while it stays small: 3–6 cards.
The 12 examinations and 15 treatments are therefore *not* grids on
`/szolgaltatasok/` — they are `faq` dropdowns (see below). At 390px a 27-card grid
made that page 31% longer than the accordion version.

## `split` — image beside text (the workhorse)

| key | notes |
| --- | --- |
| `image`, `imageAlt` | image path under `/img/…` |
| `flip: true` | put the image on the left |
| `tall: true` | portrait-ish image ratio |
| `body` | list of paragraph strings |
| `checks` | list of `{icon, title, text}` (bold title + text) |
| `bullets` | list of plain strings (or `{text, icon}`) |
| `actions` | list of `{label, url, icon, style}` |

```yaml
  - type: split
    bg: cream
    flip: true
    image: /img/demo3.webp
    imageAlt: Kezelés az Aiki Dent Fogászatban
    eyebrow: Holisztikus fogászat
    title: A száj a szervezet kapuja
    lead: Rövid vezető mondat.
    body:
      - Első bekezdés.
      - Második bekezdés.
    bullets:
      - Egy fontos pont
      - Másik fontos pont
```

## `checklist` — two-column (or beside an image) tick list

Same keys as `split` plus
`data` + `key` (e.g. `data: holistic`, `key: differentiators`), `limit`,
`twoCol: true` (two columns when there is no image).
Items may be plain strings, or `{label, text, icon}`.

## `letter` — testimonial / welcome card beside text

```yaml
  - type: letter
    bg: paper
    eyebrow: Köszöntő
    title: Az egész embert támogató ellátás
    lead: Rövid vezető mondat.
    body:
      - Bekezdés a jobb oldali oszlopban.
    quote: A kiemelt mondat a kártya tetején.
    paragraphs:
      - A kártya törzsszövege.
    sign:
      photo: /img/demo1.webp
      name: Dr. Kelemen László
      role: fogorvos, alapító és tulajdonos
```

## `steps` — numbered process

```yaml
  - type: steps
    bg: cream
    align: center
    eyebrow: Új páciensek
    title: Így zajlik az első látogatás
    data: patients      # optional
    key: steps
    items:              # or inline
      - title: Első lépés
        text: Rövid magyarázat.
    actions:
      - label: Adatlap letöltése
        url: /uj-paciens/
        icon: download
```

## `quotes` — patient testimonials

> **Used by no page right now.** The three demo quotes were lorem ipsum with
> invented names and were removed from the content; `data/testimonials.yaml` is an
> empty scaffold. The block, the data file and the `.quote*` CSS are kept on
> purpose, so showing real reviews is a content-only change — **but only with the
> patient's written consent** (`_brief/HIANYLISTA.md` §2). Add back a
> `- type: quotes` block with `data: testimonials`.

`data: testimonials` plus optional `limit`, `footnote`, `align`.

## `faq` — accordion (dropdown list)

Despite the name this is a **generic disclosure list**, and it is the right block
for any long list on a phone. Each entry is a native `<details>` row.

| key | notes |
| --- | --- |
| `data` + `key` | a data file; `key` defaults to `items` |
| `items` | inline list instead of a data file |
| entry shape | `{q, a}` (FAQ) **or** `{title, text, icon}` (services, examinations) — both work |
| `limit` | show only the first N entries |
| `openFirst` | default `true`; set `false` to keep every row closed |
| `actions` | `{label, url, icon, style}` buttons under the list |
| `footnote` | small grey paragraph under the list |

An entry with an `icon` shows it in a small mint plate before the label, the way
the card grid did; entries without one (all the FAQ lists) simply have no plate.

Give it `id: gyik` if other pages link to it.

> The two service sections on `/szolgaltatasok/` are this block with
> `data: examinations` / `data: treatments`, `openFirst: false` and a footnote that
> names the descriptions still waiting for the dentist's approval. There is no
> second copy of those texts: the block reads the same `title`/`text` fields the
> card grid would.

```yaml
  - type: faq
    id: vizsgalatok
    bg: cream
    eyebrow: Vizsgálatok
    title: Nem találgatunk — alaposan felmérjük a helyzetet
    lead: Rövid vezető mondat.
    data: examinations
    openFirst: false
    actions:
      - label: Eszközparkunk
        url: /technologia/
        icon: arrow-right
    footnote: >-
      Az alábbi leírások még a rendelő szakorvosi jóváhagyására várnak: …
```

## `partners` — health-fund wall

`data: insurance` (renders `items`, `note` and `extra` from the data file).

## `gallery`

```yaml
  - type: gallery
    bg: paper
    wide: true
    eyebrow: Rendelőnk
    title: Pillantson be hozzánk
    images:
      - src: /img/demo2.webp
        alt: Leírás
```

## `contact` — form + practice details + map

```yaml
  - type: contact
    bg: cream
    eyebrow: Kapcsolat
    title: Hívjon még ma, vagy írjon nekünk
    lead: Rövid vezető mondat.
    formTitle: Küldjön üzenetet
    formLead: Kérjük, adja meg adatait.
    showMap: true
```

## `cta` — closing call-to-action band

> **Not used on any page right now.** The client asked for the dark wine box at the
> bottom of the pages to be removed, so the block was deleted from every
> `content/**/_index.md`. The partial (`layouts/partials/blocks/cta.html`) and its
> CSS (`.cta-band…`) are kept on purpose: adding the block back to a page is a
> content-only change. Delete the partial and the `.cta-band` rules if the design
> is meant to lose it for good.

```yaml
  - type: cta
    eyebrow: Foglaljon időpontot
    title: Tegyen egy lépést egy egészségesebb mosoly felé
    lead: Rövid záró gondolat.
    actions:
      - label: Időpontfoglalás
        url: /kapcsolat/
        icon: calendar
        style: btn--mint
        large: true
```

## `prose` — the Markdown body of the page

Optional `title` / `eyebrow` / `lead`. Use this only when a page really needs free
prose; prefer structured blocks.

---

## Available icons

The set lives in `layouts/partials/icon.html` (46 glyphs, 24×24, `currentColor`).
The list below is generated from that file — if you add a glyph, add its name here
and run `node tools/a11y/icons.js`.

```
tooth leaf microscope scan shield heart heart-pulse sparkles balance users
user calendar phone mail pin clock check check-circle arrow-right arrow-up
arrow-up-right chevron-down menu close plus minus star quote needle zap
droplet dna eye flask grid film camera award book download info hand-heart
activity sun smile globe
```

An unknown name does **not** break the build: the partial quietly falls back to
`sparkles`. That is exactly why `tools/a11y/icons.js` fails when a name used in
content or in a partial is not in the set — the fallback hides typos otherwise.
Currently defined but unused: `user plus minus camera book sun globe`
(`star` and `quote` are used only by the `quotes` block, which no page uses).
`facebook`, `instagram` and `youtube` used to be listed here; they were removed
with the social icons and no longer exist in the set.

The mint plate behind an icon (`.card__icon`, `.acc__icon`) is `--mint-soft` with
a `--wine` glyph; that pairing is in `tools/a11y/contrast.js`.

## Available data files (`aiki/data/…`)

| file | keys | used by |
| --- | --- | --- |
| `services.yaml` | `items` (4 pillars, each with `anchor`) | főoldal, Szolgáltatások |
| `examinations.yaml` | `items` (12 vizsgálat) | főoldal (`limit`), Szolgáltatások |
| `treatments.yaml` | `items` (15 kezelés) | Szolgáltatások |
| `values.yaml` | `items` (5 alapérték) | Rólunk |
| `testimonials.yaml` | `items` — **szándékosan üres** | *nincs használatban* |
| `faq.yaml` | `items` | főoldal, Szolgáltatások, Új páciensek, Kapcsolat |
| `insurance.yaml` | `items`, `note`, `extra` | Új páciensek |
| `holistic.yaml` | `differentiators`, `cbct_findings`, `cbct_benefits`, `cbct_comfort`, `cbct_when` | főoldal, Szolgáltatások, Technológia |
| `patients.yaml` | `steps`, `we_do`, `fits` (used) · `intro`, `bring`, `notfits`, `finance` (unused) | Új páciensek, főoldal |
| `doctor.yaml` | `name`, `role`, `photo`, `lead`, `letter`, `credentials` | *nincs használatban* (a Rólunk oldal a saját front matterében írja le) |
| `technology.yaml` | `featured`, `items` | Technológia (`items`; a `featured` nincs használatban) |

`data/stats.yaml` **megszűnt**: a benne lévő számok („300+ elégedett páciens”,
„20 év”) kitaláltak voltak, a megbízó anyagában nem szerepeltek.

## Copy rules

* Everything is written in **Hungarian**, polite/formal address („Ön”), warm and friendly.
* **Inform, don't sell.** Use only facts that appear in `brief.txt` (the client's own
  documents) or in the practice's own `data/`. Do not invent numbers, prices, dates,
  names, opening hours, response times, qualifications or promises.
* **No superlatives and no self-praise.** „legmodernebb”, „legprecízebb”,
  „Magyarországon az első”, „egyedülálló”, „világszínvonalú” — state the capability
  instead: what the device or the method makes possible.
* No invented social proof: no star ratings, no „X+ elégedett páciens”, no
  testimonials without written consent, no trust marquee.
* Where a text is still provisional (written by us, not yet approved by the dentist),
  say so in the block's `footnote` and list the affected items **by name** — the two
  service grids on `/szolgaltatasok/` do exactly this.
* YAML gotcha: a plain scalar containing `": "` must be quoted or written as a
  `>-` block scalar, otherwise the file will not parse.

