---
title: Főoldal
description: >-
  Biológiai és holisztikus fogászat Budapesten. Dr. Kelemen László rendelője a XIII.
  kerületben: higany-, BPA- és fluoridmentes anyagok, mikroszkópos diagnosztika és az
  egész embert támogató ellátás.
blocks:
  # ---------------------------------------------------------------- hero ---
  - type: hero
    eyebrow: Aiki Dent Fogászat · Budapest XIII.
    title: A high-tech és a többezeréves kínai orvosi diagnosztika
    accent: találkozása
    lead: >-
      Eszközparkunk az új felfogású, preventív — megelőző — szemléletű fogorvosi
      terápiás stratégiát segíti. Biológiai, holisztikus és integrált fogászat
      Dr. Kelemen László rendelőjében.
    image: /img/fekvo.webp
    imageAlt: Aiki Dent Fogászat — biológiai és holisztikus fogászat Budapesten
    actions:
      - label: Időpontfoglalás
        url: /kapcsolat/
        icon: calendar
        large: true
      - label: Szolgáltatásaink
        url: /szolgaltatasok/
        icon: arrow-right
        style: btn--ghost
    # Korábban itt egy kitalált 5 csillagos értékelés, egy „Magyarországon az első”
    # jelvény és egy 20 mp-es számláló volt. Mind a három eltávolítva: a proof csak
    # azt mondja el, milyen anyagokkal dolgozunk.
    proof:
      bold: Biológiai és holisztikus szemlélet.
      text: Higany-, BPA- és fluoridmentes anyagok, minimálisan invazív kezelések.

  # ----------------------------------------------------------- pillars ---
  - type: cards
    bg: paper
    align: center
    eyebrow: Amit kínálunk
    title: Biológiai kezelések és szolgáltatások
    lead: >-
      Minden tevékenységünk a küldetésünkön alapul: olyan empatikus, biológiai alapú
      fogászati ellátást nyújtani, amely az embert egészében támogatja.
    # Négy oszlop ~217 px-es kártyákat adott (≈27 karakter soronként) — olvashatatlanul
    # keskeny. Két oszlopban ~65 karakter fér el egy sorban.
    cols: 2
    data: services
    # Nincs `linkTo`: minden kártya ugyanoda vinne, ezért egyetlen hivatkozás van
    # alattuk (`cta`). A négy pillér saját horgonya (`/szolgaltatasok/#…`) ettől
    # függetlenül működik, mert a kártyák `id`-t kapnak a Szolgáltatások oldalon.
    cta:
      label: Összes szolgáltatás
      url: /szolgaltatasok/
      icon: arrow-right

  # ------------------------------------------------------------- doctor ---
  - type: split
    bg: cream
    image: /img/demo1.webp
    imageAlt: Dr. Kelemen László, a rendelő alapítója
    eyebrow: Ismerkedjen meg fogorvosunkkal
    title: Dr. Kelemen László
    lead: >-
      Fogorvos, a rendelő alapítója és tulajdonosa.
    body:
      - >-
        A Semmelweis Egyetem Fogorvostudományi Karán szerzett diplomát, majd a
        magyarországi biológiai fogászat vezető szakértőitől tanult, többek között
        Dr. Csiszár Róberttől.
      - >-
        Az integrált orvoslás szemléletének és módszereinek tanulmányozásával
        foglalkozik, és folyamatosan képzi magát — hogy pácienseinek a lehető
        legszélesebb rálátást nyújthassa.
    checks:
      - icon: users
        title: Szakmai tagságok
        text: Az amerikai IAOMT és az új MOK tagja.
      - icon: needle
        title: Hagyományos kínai orvosi diploma
        text: A Dr. Eőry Ajándok vezette budapesti Kínai Klinikán.
      - icon: hand-heart
        title: Természetgyógyászat és akupunktúra
        text: Akupunktúrás szakvizsga a HIETE-n, lézerterapeuta képzettség.
      - icon: zap
        title: Fülakupunktőri szakképzettség
        text: Kiegészítő módszerek a fájdalommentesebb kezelésért.
    actions:
      - label: Rólunk bövebben
        url: /rolunk/
        icon: arrow-right

  # ------------------------------------------------------- examinations ---
  - type: cards
    bg: paper
    eyebrow: Vizsgálatok
    title: Alapos feltárás — nem találgatás
    lead: >-
      A teljes testre kiterjedő egészség iránti elkötelezettségünk azt jelenti, hogy a
      kezelés megkezdése előtt a lehető legteljesebb és legpontosabb információkra van
      szükségünk.
    cols: 3
    style: mini
    data: examinations
    # Három kártya: ez ízelítő, nem katalógus. Hat kártya mobilon három képernyőnyi
    # görgetés volt; a teljes, kereshető lista a Szolgáltatások oldalon van, egy
    # kattintásra (`cta` alatta) — és ott már lenyitható sorokban.
    limit: 3
    cta:
      label: Összes vizsgálat
      url: /szolgaltatasok/#vizsgalatok
      icon: arrow-right
    footnote: >-
      Az Ételintolerancia vizsgálat leírása még a rendelő szakorvosi jóváhagyására
      vár — a teljes lista a Szolgáltatások oldalon olvasható.

  # ---------------------------------------------------------- holistic ---
  - type: split
    bg: cream
    flip: true
    image: /img/demo3.webp
    imageAlt: Holisztikus fogászati kezelés az Aiki Dent Fogászatban
    eyebrow: Holisztikus fogászat
    title: Ahol a teljes testi egészség a mosolyával kezdődik
    lead: >-
      Szájegészsége szorosan összefügg a teljes jólétével — a testtel, a lélekkel és a
      szellemmel egyaránt.
    body:
      - >-
        A holisztikus fogászat — amelyet néha biológiai vagy integratív fogászatnak is
        neveznek — a szájüregi egészség és a teljes test egészségi állapota közötti
        összefüggésekre összpontosít.
      - >-
        Ahelyett, hogy „egységes” megközelítést alkalmaznánk, gondosan személyre
        szabjuk a kezeléseket: nem mérgező, biokompatibilis anyagokat és minimálisan
        invazív technikákat használunk, amelyek összhangban állnak a szervezet
        természetes gyógyulási képességeivel.
    checks:
      - icon: leaf
        title: A száj a szervezet kapuja
        text: >-
          A kutatások folyamatosan bizonyítják a szájápolás és a szívbetegségek, a
          cukorbetegség, az autoimmun rendellenességek, sőt a kognitív egészség
          összefüggéseit.

  # ------------------------------------------------------ differentiators ---
  - type: checklist
    bg: paper
    image: /img/demo2.webp
    imageAlt: Páciens konzultáció az Aiki Dent Fogászatban
    eyebrow: Miben vagyunk mások?
    title: Miben különbözik holisztikus megközelítésünk
    lead: >-
      Nem csupán fogakat kezelünk — segítünk az embereknek abban, hogy egészségesebb,
      teljesebb életet éljenek.
    data: holistic
    key: differentiators
    actions:
      - label: Gyakori kérdések
        url: /uj-paciens/#gyik
        icon: info

  # --------------------------------------------------------- technology ---
  - type: split
    bg: frost
    flip: true
    image: /img/demo4.webp
    imageAlt: Zeiss Extaro 300 mikroszkóp az Aiki Dent Fogászatban
    eyebrow: Technológia
    title: Zeiss Extaro 300 mikroszkóp
    lead: >-
      A mikroszkópos látás minden kezelésünk alapja: nagyobb nagyítás, kiváló
      mélységélesség — és ennek köszönhetően kisebb beavatkozás.
    body:
      - >-
        A nagyításnak és a kiváló mélységélességnek köszönhetően olyan részletek is
        láthatóvá válnak, amelyek szabad szemmel rejtve maradnak. Ez teszi lehetővé a
        minimális foganyag-veszteséggel járó, pontos kezeléseket.
      - >-
        Az alábbi beavatkozások során használjuk:
    bullets:
      - Mikroszkópos fogorvosi állapotfelmérés, kamerás felvétel és elemzés
      - Fogkőeltávolítás, tömés, gyökérkezelés
      - Sebészeti beavatkozás
      - Megelőzésre koncentrálunk, minimális foganyag-veszteséggel dolgozunk
      - A régen készült gyökértömések mikroszkóppal jó eséllyel eltávolíthatóak
    actions:
      - label: Eszközparkunk
        url: /technologia/
        icon: arrow-right

  # ------------------------------------------------------------- steps ---
  - type: steps
    bg: cream
    align: center
    eyebrow: Új páciensek
    title: Így zajlik az első látogatás
    lead: >-
      Első látogatásakor időt szánunk arra, hogy megismerjük Önt — és Ön is minket.
    data: patients
    key: steps
    actions:
      - label: Új páciens adatlap
        url: /uj-paciens/
        icon: download

  # ---------------------------------------------------------- rendelés ---
  # A korábbi, kitalált számokat mutató sáv helyén. Minden adat ellenőrizhető:
  # cím, telefon, e-mail a briefből; a nyitvatartás a rendelő saját gyakorlata.
  - type: checklist
    bg: paper
    twoCol: true
    eyebrow: Rendelés és időpont
    title: Hogyan jut el hozzánk?
    lead: >-
      Rendelőnk a XIII. kerületben, előzetes egyeztetés alapján működik. Az első
      látogatás előtt ezeket érdemes tudni.
    items:
      - icon: pin
        label: Cím
        text: 1136 Budapest, Hegedűs Gyula utca 29/b.
      - icon: phone
        label: Telefon
        text: '+36 30 193 2714 — ezen a számon tud időpontot egyeztetni.'
      - icon: mail
        label: E-mail
        text: info@aikident.hu
      - icon: clock
        label: Nyitvatartás
        text: >-
          Előzetes egyeztetés alapján: minden látogatást előre egyeztetünk, így Önre
          annyi idő jut, amennyire a vizsgálathoz szükség van.
      - icon: download
        label: Az első vizit előtt
        text: >-
          Töltse ki az új páciens adatlapot, és hozza magával a korábbi leleteit.
      - icon: hand-heart
        label: Ár és fizetés
        text: >-
          A kezelés költségét a kezelési terv ismeretében beszéljük át. Fogászati
          biztosítást fizetési módként nem fogadunk el.
    actions:
      - label: Időpontfoglalás
        url: /kapcsolat/
        icon: calendar
      - label: Árak és fizetés
        url: /uj-paciens/#arak
        icon: info
        style: btn--ghost

  # ----------------------------------------------------------- gallery ---
  - type: gallery
    bg: cream
    wide: true
    eyebrow: Rendelőnk
    title: Pillantson be hozzánk
    lead: >-
      Nyugodt, barátságos környezet a Hegedűs Gyula utcában — ahol a technológia és a
      gondoskodás találkozik.
    images:
      - src: /img/fekvo.webp
        alt: Az Aiki Dent Fogászat rendelője
      - src: /img/demo1.webp
        alt: Fogorvosi konzultáció
      - src: /img/demo2.webp
        alt: Páciens ellátás közben
      - src: /img/demo3.webp
        alt: Fogászati kezelés
      - src: /img/demo4.webp
        alt: A rendelő technológiai eszközparkja
      - src: /img/fekvo.webp
        alt: Váró és fogadótér

  # --------------------------------------------------------------- faq ---
  - type: faq
    bg: paper
    eyebrow: Gyakori kérdések
    title: Mielőtt eljön hozzánk
    lead: >-
      A leggyakoribb gyakorlati kérdések: időpont, fizetés, ár és az első vizit.
    data: faq
    limit: 5
    actions:
      - label: Összes kérdés
        url: /uj-paciens/#gyik
        icon: arrow-right
---
