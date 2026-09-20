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

## `marquee` — scrolling trust strip

```yaml
  - type: marquee
    items:
      - text: Fémmentes fogpótlások
        icon: tooth
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

```yaml
  - type: cards
    bg: paper
    eyebrow: Vizsgálatok
    title: Alapos feltárás
    cols: 3
    style: mini
    data: examinations
    cta:
      label: Kapcsolat
      url: /kapcsolat/
      icon: arrow-right
```

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

## `stats` — dark band with animated numbers

Data-driven: `data: stats` (keys `value`, `suffix`, `label`).

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

`data: testimonials` plus optional `limit`, `footnote`, `align`.

## `faq` — accordion

`data: faq` plus optional `limit`, `actions`. Give it `id: gyik` if other pages
link to it.

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

`tooth leaf microscope scan shield heart heart-pulse sparkles balance users user
calendar phone mail pin clock check check-circle arrow-right arrow-up-right
chevron-down menu close plus minus star quote needle zap droplet dna eye flask grid
film camera award book download info hand-heart activity sun smile globe facebook
instagram youtube`

## Available data files (`aiki/data/…`)

| file | keys |
| --- | --- |
| `services.yaml` | `items` (4 pillars, each with `anchor`) |
| `examinations.yaml` | `items` (12 vizsgálat) |
| `treatments.yaml` | `items` (15 kezelés) |
| `values.yaml` | `items` (5 alapérték) |
| `stats.yaml` | `items` |
| `testimonials.yaml` | `items` |
| `faq.yaml` | `items` |
| `insurance.yaml` | `items`, `note`, `extra` |
| `doctor.yaml` | `name`, `role`, `photo`, `lead`, `letter`, `credentials` |
| `technology.yaml` | `featured`, `items` |
| `holistic.yaml` | `differentiators`, `cbct_findings`, `cbct_benefits`, `cbct_comfort`, `cbct_when` |
| `patients.yaml` | `intro`, `steps`, `we_do`, `bring`, `finance` |

## Copy rules

* Everything is written in **Hungarian**, polite/formal address („Ön”), warm and friendly.
* Use only facts that appear in `brief.txt`. Do not invent prices, dates, names or promises.
* Where demo copy is needed (e.g. testimonials), use lorem ipsum and say so in a `footnote`.
* YAML gotcha: a plain scalar containing `": "` must be quoted or written as a
  `>-` block scalar, otherwise the file will not parse.
