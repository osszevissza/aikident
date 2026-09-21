# Aiki Dent Fogászat — weboldal

> **Új munkamenetben először ezt olvasd el:** [`docs/REDESIGN-BRIEF.md`](docs/REDESIGN-BRIEF.md)
> — a projekt kontextusa, mi nem valódi a demón, és a következő lépések.

Hugo alapú, egyoldalas felépítésű többoldalas weboldal az Aiki Dent Fogászat
(biológiai és holisztikus fogászat, Dr. Kelemen László) számára.

- **Márkaszínek:** `#811331` (burgundy) és `#7eecc3` (mint)
- **Tipográfia:** Playfair Display (címek) · General Sans (szöveg) · Comfortaa (kiemelések)
- **Nyelv:** magyar (`hu-HU`)

## Fejlesztés

```bash
cd aiki
hugo server            # http://localhost:1313
hugo --minify          # éles build a public/ könyvtárba
```

Hugo **extended 0.150+** szükséges (`hugo version`).

## Felépítés

```
aiki/
├── hugo.toml                 # alapbeállítások, főmenü, elérhetőségek
├── assets/
│   ├── css/main.css          # a teljes design system (egy fájl)
│   └── js/main.js            # sticky header, mobil menü, scroll animációk
├── content/
│   ├── _index.md             # Főoldal
│   ├── rolunk/_index.md
│   ├── szolgaltatasok/_index.md
│   ├── technologia/_index.md
│   ├── uj-paciens/_index.md
│   └── kapcsolat/_index.md
├── data/                     # ismétlődő tartalom (szolgáltatások, GYIK, vélemények…)
├── layouts/
│   ├── baseof.html
│   ├── home.html / page.html / 404.html
│   └── partials/
│       ├── blocks/           # a szekciótípusok (hero, cards, split, faq…)
│       └── icon.html         # inline SVG ikonkészlet
└── static/
    ├── fonts/                # General Sans, Playfair, Comfortaa, SpartanMB
    └── img/                  # logó (SVG), favicon, demó fotók
```

## Tartalom szerkesztése

Minden oldal a `content/` alatti Markdown fájlok **YAML front matterében** leírt
`blocks:` listából épül fel. A blokktípusok és az összes elfogadott kulcs
dokumentációja: [`docs/BLOCK-SCHEMA.md`](docs/BLOCK-SCHEMA.md).

Példa:

```yaml
blocks:
  - type: cards
    bg: paper
    eyebrow: Vizsgálatok
    title: Alapos feltárás
    cols: 3
    data: examinations   # a data/examinations.yaml items listájából
    limit: 6
```

Új szekciótípus hozzáadása: készíts egy
`layouts/partials/blocks/<típus>.html` fájlt, majd használd a `type: <típus>`
értéket a tartalomban.

## Logó és favicon

A logó a `brief/Aiki_Dent_logo_h.pdf` fájlból generálódik, a márkaszínre
átszínezve:

```bash
python3 .build/make_logo.py
```

Ez létrehozza a `static/img/logo.svg`, `logo-white.svg`, `logo-mark.svg`,
`favicon-*.png`, `apple-touch-icon.png` és `static/favicon.ico` fájlokat.

## Akadálymentesség (WCAG 2.1 AA)

Az oldal a WCAG 2.1 AA szintre készült. Ami ezt biztosítja:

- **Kontraszt.** Minden szöveg/táfelület párosítást külön ellenőrző script vizsgál
  (68 párosítás, mind megfelel). Az interaktív vezérlők azonosító keretei
  (bemeneti mező, ghost gomb, jelölőnégyzet) elérik a 3:1 nem-szöveg
  kontrasztot — ezért van külön `--line-ui` token a díszítő `--line` mellett.
  A fókuszjelző a `--focus-ring` (wine, 10:1 világos háttéren), a sötét
  wine-felületeken automatikusan `--focus-ring-on-dark`-ra (mint, 7:1) vált.
- **Szemantika.** A fejléc `header`, a tájékoztató sáv `aside[aria-label]`,
  a tartalom `main`, a lábléc `footer`. Minden oldalon pontosan egy `h1`, és a
  címsorok szintje nem ugrik át.
- **Űrlapok.** Minden mezőhöz tartozik `<label>`; a jelölőnégyzet-csoportok
  `fieldset[aria-labelledby]` + `role="group"` alatt vannak; a beküldési
  visszajelzés `role="status" aria-live="polite"`.
- **Fókusz.** „Ugrás a tartalomra” link, látható fókuszgyűrű mindenhol,
  a mobil menüben fókuszcsapda és `Esc` zárás.
- **Mozi.** `prefers-reduced-motion` esetén minden animáció kikapcsol; a
  scroll-reveal csak akkor rejt el tartalmat, ha a JS ténylegesen fut
  (`html.js` osztály).

### Kattinthatóság — mit szabad és mit nem

Fontos szabály a karbantartásnál: **csak az nézhet ki kattinthatónak, ami az is.**

- `.card` önmagában **statikus** információs kártya: nincs hover-emelés, nincs
  kurzorváltás. A `cards` blokk csak akkor adja hozzá a `card--link` osztályt,
  ha a kártyához tényleg tartozik cél (`url`, vagy `linkTo` + `anchor`).
- Kattintható kártyánál a teljes kártya a link felülete (stretched link), a
  címsorban lévő `<a class="card__link">` adja az akadálymentes nevet, a
  „Részletek →” felirat pedig `aria-hidden` díszítés (`pointer-events: none`),
  így nem lesz duplikált link.
- `.pill` alapból **címke**, nem gomb — halvány tónusú háttér, keret nélkül.
  Ha egy chip valódi link, kell rá a `pill--action` osztály.
- A `.quote`, `.info` és `.partner` elemek szándékosan hover-effekt nélküliek.
- A galéria linkjei `cursor: zoom-in`-t és lebegő nagyító ikont kapnak, mert
  új lapon nyitják a képet.

### A lábléc

A lábléc szándékosan **minimál**: két oszlop, semmi több.

| oszlop | tartalom |
| --- | --- |
| 1. brand | logó + egy bekezdés |
| 2. Kapcsolat | cím, telefon, e-mail, nyitvatartás (2 link) |

Alatta egyetlen sor: a copyright. **Nincs** Menü és Szolgáltatások linkoszlop,
és **nincs** vízszintes link­sor a copyright mellett — ezeket kérésre
eltávolítottuk, mert a fejléc főmenüje és az oldalak saját CTA-i már lefedik
ugyanezt. Ha vissza kellene hozni őket, a `layouts/partials/footer.html`
`site-footer__grid` blokkjába kerül egy-egy újabb `<div>`, a
`site-footer__bottom`-ba pedig egy `<ul>`; a CSS
`grid-template-columns` értékét is vedd feljebb a jelenlegi kétoszloposról.

A lábléc emellett **teljesen átlátszatlan és egységes**: egyetlen tömör
`--wine-night` szín, díszítő réteg nélkül. Korábban volt egy `::before`
pszeudo-elem, amely egy halvány mentazöld radial-gradient foltot rajzolt a
lábléc tetejére — ez áttetszőnek és „szakadozottnak" látszott a tömör sötét
háttéren, ezért eltávolítottuk. A szövegszínek is tömör (előre komponált)
értékek, nem `rgba()`-k:

| elem | szín |
| --- | --- |
| alap szöveg | `#c9babd` |
| brand bekezdés | `#beabb0` |
| linkek | `#d5c9cc`, aláhúzás `#957581` |
| copyright sor | `#a99097`, elválasztó `#562630` |

Ha a láblécet módosítod, futtasd a `contrast.js`-t: mind a 8 lábléc-párosítás
szerepel benne.

### Vissza a tetejére gomb

Minden oldalon jobb alsó sarokban megjelenő, lebegő gomb
(`layouts/partials/to-top.html`, `.to-top` CSS, `assets/js/main.js`).

- **Csak akkor látszik**, ha már 480 px-t görgetett az oldal. A rejtett állapot
  `visibility: hidden` — nem `opacity` —, így a gomb rejtve **nem fókuszálható**,
  a billentyűzettel közlekedő soha nem akad bele.
- **Gyors, de nem ugrik:** saját `requestAnimationFrame` animáció, easeOutCubic
  görbével. Hosszú oldalon is max. ~620 ms (rövid távon ~320 ms). Azért saját
  animáció, mert a `html { scroll-behavior: smooth }` miatt a böngésző natív
  smooth görgetése kiszámíthatatlanul lassú lehet — ezért az animáció idejére
  kikapcsoljuk a CSS szabályt.
- **Fókuszkezelés:** a gomb a tetején elrejtőzik, ezért a görgetés végén a fókusz
  a `<main id="main" tabindex="-1">` elemre kerül — így a billentyűzetes
  felhasználó nem marad fókusz nélkül. A `main:focus { outline: none }` szabály
  megakadályozza a fókuszvillanást.
- **`prefers-reduced-motion`** esetén nincs animáció, azonnal a tetejére ugrik.
- A fókuszgyűrű a wine korongon **belülre** kerül (`outline-offset: -6px`), így
  minden háttéren jól látható marad — a gomb ugyanis a lábléc fölött is lebeg.

Ha módosítod, futtasd a `contrast.js`-t: a gomb 3 párosítása is szerepel benne.

### Az ellenőrzések futtatása

```bash
cd aiki && hugo                          # build a public/ könyvtárba
cd ..
node tools/a11y/audit.js                # axe-core + saját strukturális vizsgálatok
node tools/a11y/contrast.js             # WCAG kontraszt-párosítások
node tools/a11y/selectors.js            # melyik CSS szabály nem illeszkedik semmire
python3 tools/a11y/dead-css.py          # melyik osztálynév nem létezik a DOM-ban
```

- `audit.js` — minden generált oldalt végigfut: axe-core szabályok,
  címsor-sorrend, duplikált `id`, linknevek, űrlap-címkék, landmark-lefedettség.
- `contrast.js` — a `main.css` tokenjeiből számolja a kontrasztarányokat, ezért
  **ha új színt vezetsz be, vedd fel a `PAIRS` listába**.
- `selectors.js` / `dead-css.py` — **ezek fogták meg a lábléc hibáját**: a
  `<footer>` elem `site-footer` osztályú volt, a CSS viszont `.footer …`
  szelektorokat használt, így a lábléc összes szabálya csendben elveszett.
  Ha új blokkot vagy osztályt vezetsz be, futtasd le ezeket — a build ilyen
  hibát nem jelez.

(Első futtatás előtt: `cd .build/a11y && npm install axe-core jsdom`.)

### Lekerekítés

A teljes felület **egyetlen 6 px-es sarokrádiuszt** használ: `--radius: 6px`.
A korábbi lépcsőzetes skála (`--r-xl` 40 px, `--r-lg` 28 px, `--r-md` 20 px,
`--r-sm` 13 px) és a `--pill` (999 px) megmaradt **általános alias-ként**, így
egy-egy felület később önállóan eltéríthető anélkül, hogy a szabályokat
át kellene írni:

```css
--radius: 6px;
--r-xl: var(--radius);
--r-lg: var(--radius);
--r-md: var(--radius);
--r-sm: var(--radius);
--pill: var(--radius);
```

Ez érinti a gombokat (a primary gomb eddig teljesen lekerekített „pirula" volt),
a fotókat (hero, split, galéria, térkép, avatarok) és a kártyákat (card, quote,
letter, accordion, form, info, notice) — összesen 44 deklaráció.

**Szándékosan nem 6 px, mert nem sarok:**

- `.prose ul li::before` — 7 px-es felsorolás-pötty, `50%`
- `.hero__blob` — puha gradiens folt a hero fotó mögött, `50%`
- `.field input`, `.iform__f input` — `0`, mert csak aláhúzásuk van
- `.card__link::after` — `inherit`, hogy pontosan a kártyát fedje

## Élesítés előtt cserélendő

- **Demó fotók:** `static/img/demo1–4.webp`, `fekvo.webp` — valódi rendelői
  fotókra cserélendők (és az `alt` szövegek pontosításra).
- **Páciensvélemények:** `data/testimonials.yaml` jelenleg lorem ipsum.
- **Új páciens adatlap:** a `/uj-paciens/adatlap/` oldal egy nyomtatható,
  böngészőben kitölthető űrlap (nem PDF). Ha valódi PDF letöltést szeretnél,
  tedd a fájlt a `static/files/` könyvtárba, és onnan linkeld.
- **Kapcsolat űrlap:** a `layouts/partials/blocks/contact.html` és az
  `intakeForm.html` űrlapjai bemutatók (nincs backend). Éles üzemhez kösd be a
  választott szolgáltatást (Formspree, Netlify Forms, saját endpoint), és a
  `data-demo-form` / `data-intake-form` attribútumokat cseréld le.
- **Közösségi linkek:** a láblécben **nincsenek** közösségi ikonok (kérésre
  törölve). Ha később kellenek, a `layouts/partials/footer.html`
  `site-footer__brand` blokkjába vedd fel őket, és az ikonokat is írd vissza a
  `layouts/partials/icon.html` fájlba.
- **Záró CTA sáv:** a lábléc feletti sötét wine színű doboz **minden oldalról**
  el van távolítva (kérésre). A `cta` blokktípus megmaradt
  (`layouts/partials/blocks/cta.html` + `.cta-band` CSS), így ha valamelyik
  oldalra vissza szeretnéd tenni, elég egy `- type: cta` blokk a tartalomba.
  Ha végleg nem kell, töröld a partialt és a `.cta-band` szabályokat.
- **Térkép:** az OpenStreetMap beágyazás koordinátái közelítőek — cseréld a
  rendelő pontos helyére, vagy Google Maps beágyazásra.
- **`baseURL`:** a `hugo.toml`-ban jelenleg `https://aikident.hu/`.
