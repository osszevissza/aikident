---
aliases: ["/vizsgalatok/", "/kezelesek/"]
title: Szolgáltatások
description: >-
  Biológiai kezelések és szolgáltatások az Aiki Dent Fogászatban: négy ellátási
  pillér, tizenkét vizsgálat és tizenöt kezelés — higany-, BPA- és fluoridmentes
  anyagokkal, 3D-s CBCT diagnosztikával, az egész embert támogatva.
blocks:
  # ---------------------------------------------------------------- hero ---
  - type: pageHero
    eyebrow: Szolgáltatások
    title: Biológiai kezelések és szolgáltatások
    lead: >-
      Minden tevékenységünk a küldetésünkön alapul: olyan empatikus, biológiai alapú
      fogászati ellátást nyújtani, amely az embert egészében támogatja.
    actions:
      - label: Időpontfoglalás
        url: /kapcsolat/
        icon: calendar
      - label: Árak és fizetés
        url: /uj-paciens/#arak
        icon: info
        style: btn--ghost
    pills:
      - text: Higanymentes fogászat
        icon: shield
      - text: BPA-mentes tömések
        icon: droplet
      - text: Fémmentes fogpótlások
        icon: tooth
      - text: Zeiss Extaro 300 mikroszkóp
        icon: microscope

  # ------------------------------------------------------------- pillars ---
  - type: cards
    bg: paper
    align: center
    eyebrow: Négy pillér
    title: A fogászati ellátás négy szintje
    lead: >-
      Általános, biológiai, holisztikus és integrált fogászat — egy rendelőben,
      egymásra épülve, ahol a szájegészség az egész szervezet része.
    cols: 4
    data: services
    cta:
      label: Kapcsolat
      url: /kapcsolat/
      icon: arrow-right

  # --------------------------------------------------------- examinations ---
  # Lenyitható lista (ugyanaz a minta, mint a GYIK-nál): mobilon 12 kártya
  # egymás alatt túl hosszú volt. A szövegek a data/examinations.yaml-ból jönnek.
  - type: faq
    id: vizsgalatok
    bg: cream
    eyebrow: Vizsgálatok
    title: Nem találgatunk — alaposan felmérjük a helyzetet
    lead: >-
      A teljes testre kiterjedő egészség iránti elkötelezettségünk azt jelenti, hogy a
      kezelés megkezdése előtt a lehető legteljesebb és legpontosabb információkra van
      szükségünk. A tételekre kattintva olvashatja a leírásokat.
    data: examinations
    openFirst: false
    actions:
      - label: Eszközparkunk
        url: /technologia/
        icon: arrow-right
    footnote: >-
      Az alábbi leírások még a rendelő szakorvosi jóváhagyására várnak:
      Ételintolerancia vizsgálat, Fogászati anyagok allergiavizsgálata, Hajanalízis,
      Sötétlátóteres mikroszkópos vérvizsgálat, Szájüreg mikroszkópos vizsgálata.

  # --------------------------------------------------------------- cbct ---
  - type: split
    id: cbct
    bg: paper
    image: /img/demo3.webp
    imageAlt: 3D-s CBCT képalkotás az Aiki Dent Fogászatban
    eyebrow: Kiemelt vizsgálat
    title: 3D-s CBCT képalkotás
    lead: >-
      Fejlett képalkotási technológia a biztonságosabb, teljes testre kiterjedő
      fogászati ellátásért.
    body:
      - >-
        Az Aiki-Dent Fogászatnál hisszük, hogy a tisztán látható képek jobb ellátást
        tesznek lehetővé. 3D-s fogászati kúpos sugárnyalábos képalkotási technológiánk
        segítségével többet láthatunk, mint a hagyományos röntgenfelvételekkel — ez
        segít nekünk a rejtett problémák felismerésében, a kezelések pontosabb
        megtervezésében, valamint az Ön általános egészségének magabiztos védelmében.
      - >-
        A kúpos sugárnyalábos számítógépes tomográfia (CBCT) egy 3D-képalkotási
        eljárás, amely egyetlen gyors és kényelmes vizsgálat során részletes képet ad a
        fogakról, az állkapocsról, a melléküregekről, a légutakról, az idegekről és a
        csontszerkezetről. A sík, kétdimenziós röntgenfelvételekkel ellentétben a CBCT
        teljes képet ad arról, mi zajlik a felszín alatt.
      - >-
        Mivel alacsony sugárterhelésű, rendkívül fókuszált kúpos sugártechnológiát
        alkalmazunk, a szükséges képalkotási részletességet minimális sugárterhelés
        mellett kapjuk meg — összhangban a kíméletes, minimálisan invazív kezelés iránti
        elkötelezettségünkkel. A felvételeket azonnal áttekintjük Önnel, így Ön
        magabiztosnak és jól tájékozottnak érezheti magát.
    bullets:
      - >-
        Rejtett fertőzések – tályogok, csontfertőzések vagy gyökérkezelés alatt
        kialakuló krónikus gyulladások
      - >-
        Gyökérkezelési hibák – kihagyott gyökércsatornák, törések vagy fennmaradó
        fertőzések, amelyek a hagyományos röntgenfelvételeken nem láthatók
      - >-
        Fogászati kavitációk – az állcsont elhalása vagy nekrózisa által érintett
        területek, amelyeket a szokásos röntgenfelvételeken gyakran nem vesznek észre
      - >-
        Sinusproblémák – sinusgyulladások vagy -fertőzések, amelyek hozzájárulhatnak
        fogászati vagy arcbeli tünetek kialakulásához
      - >-
        Idegpályák – segítenek elkerülni az idegkárosodást foghúzás vagy egyéb
        beavatkozások során
    actions:
      - label: Technológiánk
        url: /technologia/
        icon: arrow-right

  # ----------------------------------------------------------- holistic ---
  - type: split
    bg: cream
    flip: true
    image: /img/demo1.webp
    imageAlt: Holisztikus fogászati konzultáció az Aiki Dent Fogászatban
    eyebrow: Holisztikus fogászat
    title: A száj a szervezet kapuja
    lead: >-
      Szájegészsége szorosan összefügg a teljes jólétével — a testtel, a lélekkel és a
      szellemmel egyaránt.
    body:
      - >-
        A holisztikus fogászat — amelyet néha biológiai vagy integratív fogászatnak is
        neveznek — a szájüregi egészség és a teljes test egészségi állapota közötti
        összefüggésekre összpontosít. Figyelembe veszi, hogy a fogászati anyagok, a
        kezelések, sőt a szájüregi fertőzések is milyen hatással lehetnek a szervezet
        egészére.
      - >-
        Ahelyett, hogy „egységes” megközelítést alkalmaznánk, gondosan személyre
        szabjuk a kezeléseket, nem mérgező, biokompatibilis anyagokat és minimálisan
        invazív technikákat használva, amelyek összhangban állnak a szervezet természetes
        gyógyulási képességeivel. Ez egy olyan fogászat, amely a szájüregnél tovább
        tekint — mert az Ön egészsége többet érdemel.
      - >-
        A kutatások folyamatosan bizonyítják a szájápolás és olyan betegségek közötti
        összefüggéseket, mint a szívbetegségek, a cukorbetegség, az autoimmun
        rendellenességek, sőt a kognitív egészség is. A szájban található mérgező
        anyagok, a krónikus gyulladások vagy a rejtett fertőzések idővel észrevétlenül
        ronthatják az általános egészségi állapotot.
    checks:
      - icon: leaf
        title: Az egész embert támogató ellátás
        text: >-
          Minden páciensünket egyedi személyiségként kezeljük, és tudjuk, hogy az igazi
          gyógyulás túlmutat a tüneteken — az egyensúlyhiány alapvető okait kezeli.

  # ----------------------------------------------------- differentiators ---
  - type: checklist
    bg: paper
    image: /img/demo2.webp
    imageAlt: Páciens konzultáció az Aiki Dent Fogászatban
    eyebrow: Miben vagyunk mások?
    title: Miben különbözik holisztikus megközelítésünk
    lead: >-
      Nem csupán fogakat kezelünk — segítünk az embereknek abban, hogy egészségesebb,
      teljesebb életet éljenek. Az integritás, az együttérzés, a kíváncsiság, a
      felelősségvállalás és az együttműködés alapértékeink vezérlik a munkánkat.
    data: holistic
    key: differentiators

  # ---------------------------------------------------------- treatments ---
  # Ugyanaz a lenyitható lista, mint a vizsgálatoknál: 15 kártya mobilon
  # áttekinthetetlen volt.
  - type: faq
    id: kezelesek
    bg: cream
    eyebrow: Kezelések
    title: Biológiai kezelések a gyakorlatban
    lead: >-
      Hiszünk abban, hogy a szájápolás szorosan összefügg az általános egészségi
      állapottal — átgondolt, integrált fogászati kezelésünk segít Önnek magabiztosságot
      és egész életen át tartó vitalitást nyerni. A tételekre kattintva olvashatja a
      leírásokat.
    data: treatments
    openFirst: false
    footnote: >-
      Az alábbi leírások még a rendelő szakorvosi jóváhagyására várnak: Akupunktúra,
      Homeopátia, PRF membrán.

  # ------------------------------------------------------------- folyamat ---
  # A „Hogyan zajlik egy kezelés nálunk?” szakasz (id: folyamat) itt volt, és a
  # kártyák ide mutattak. A megbízó kérésére eltávolítottuk: a kezelésenkénti
  # részletek még gyűjtés alatt vannak, és addig nem elég tartalmas ez a
  # szerkezet. A szöveg a git történetben megvan (a 608e3cf commit előtti
  # állapot), és a docs/REDESIGN-BRIEF.md §3 is leírja, hogyan állítható vissza.

  # ----------------------------------------------------------------- faq ---
  - type: faq
    bg: paper
    eyebrow: Gyakori kérdések
    title: Amit a legtöbben kérdeznek
    lead: >-
      A leggyakoribb gyakorlati kérdések a kezelésekről, az anyagokról és a
      fizetésről.
    data: faq
    limit: 5
    actions:
      - label: Árak és fizetés
        url: /uj-paciens/#arak
        icon: info
---
