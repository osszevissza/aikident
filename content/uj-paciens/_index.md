---
aliases: ["/elso-latogatas/"]
title: Új páciensek
description: >-
  Minden, amit az első látogatás előtt tudnia érdemes — új páciens adatlap,
  az első vizit menete, pénzügyi információk, egészségpénztári partnereink és
  gyakori kérdések az Aiki Dent Fogászatban.
blocks:
  # ------------------------------------------------------------ pageHero ---
  - type: pageHero
    eyebrow: Új páciensek
    title: Minden, amit az első látogatás előtt tudnia érdemes
    lead: >-
      Gondozási filozófiánk minden tevékenységünket áthatja. Az Ön általános jóléte és
      egészsége a legfontosabb számunkra.
    actions:
      - label: Új páciens adatlap
        url: /uj-paciens/#adatlap
        icon: download
      - label: Időpontfoglalás
        url: /kapcsolat/
        icon: calendar
        style: btn--ghost
    pills:
      - text: Nyugodt tempójú első vizit
        icon: heart
      - text: Személyre szabott kezelési terv
        icon: sparkles
      - text: Számla a biztosítónak
        icon: shield
      - text: Időt szánunk a kérdéseire
        icon: users

  # ------------------------------------------------------------ adatlap ---
  - type: split
    id: adatlap
    bg: paper
    image: /img/demo1.webp
    imageAlt: Új páciens adatlap kitöltése az első vizit előtt
    eyebrow: Első lépés
    title: Új páciens adatlap
    lead: Kérjük, az első vizit előtt töltse ki adatlapunkat.
    body:
      - >-
        Töltse le a számítógépére és töltse ki otthon, nyugodt körülmények között —
        majd az első vizit alkalmával hozza magával.
      - >-
        A nyomtatható adatlapot kitöltheti a következő oldalon, közvetlenül a
        böngészőjében — nyomtatás után pedig hozza magával az első vizitre.
    bullets:
      - Új páciens adatlap (kitöltve)
      - Korábbi röntgen- és leletanyagok
      - A jelenleg szedett gyógyszerek listája
      - Ismert allergiák, érzékenységek
    actions:
      - label: Adatlap kitöltése
        url: /uj-paciens/adatlap/
        icon: download
        style: btn--mint

  # -------------------------------------------------------------- steps ---
  - type: steps
    bg: cream
    align: center
    eyebrow: Így zajlik
    title: Az első látogatás menete
    lead: >-
      Első látogatásakor időt szánunk arra, hogy megismerjük Önt — és Ön is minket —,
      valamint megbeszéljük fogászati igényeit.
    data: patients
    key: steps

  # ------------------------------------------------------------- we_do ---
  - type: checklist
    bg: paper
    twoCol: true
    eyebrow: Amit elvégzünk
    title: Az Aiki Dent Fogászat a következőket végzi el
    lead: >-
      Az első látogatás alkalmával ezekkel a lépésekkel térképezzük fel az Ön
      szájegészségét, hogy valóban személyre szabott tervet készíthessünk.
    data: patients
    key: we_do

  # -------------------------------------------------------- látogatás ---
  - type: split
    bg: cream
    flip: true
    image: /img/demo3.webp
    imageAlt: Rendelői látogatás az Aiki Dent Fogászatban
    eyebrow: Rendelői látogatások
    title: Az Ön általános jóléte a legfontosabb
    lead: >-
      Tudatában vagyunk annak, hogy minden páciens egyedi, és célunk az, hogy segítsünk
      Önnek megőrizni fogait funkcionálisan, kényelmesen és esztétikailag egy életen
      át.
    body:
      - >-
        Első látogatásakor időt szánunk arra, hogy megismerjük Önt — és Ön is minket —,
        valamint megbeszéljük fogászati igényeit. Nincs sietség: szeretnénk, ha
        magabiztosan és nyugodtan érezné magát nálunk.

  # ---------------------------------------------------------- pénzügy ---
  - type: split
    bg: paper
    image: /img/demo4.webp
    imageAlt: Konzultáció a kezelési tervről és a költségekről
    eyebrow: Pénzügyek
    title: Aiki Dent Fogászat pénzügyi információk
    lead: >-
      A kezelési tervet és a költségeket mindig átláthatóan, közösen beszéljük át —
      hogy Ön a legjobb döntést hozhassa meg.
    body:
      - >-
        A kezelés költsége az Ön egyéni igényeitől és a kezelési tervtől függően
        változhat.
      - >-
        A rendelőnkben tett látogatása során megbeszéljük Önnel a kezelés költségét,
        valamint az elérhető fizetési lehetőségeket, hogy Ön a legjobb döntést
        hozhassa meg.
      - >-
        Fogászati biztosítást nem fogadunk el fizetési módként.
    checks:
      - icon: hand-heart
        title: 'Közvetlen fizetés a rendelőben'
        text: >-
          A díjakat a szolgáltatások igénybevételekor közvetlenül a rendelőnkben
          fizeti meg.
      - icon: book
        title: 'Számla a biztosítónak'
        text: >-
          Számlát állítunk ki a fogászati biztosítóknak, így a visszatérítést
          közvetlenül a saját biztosítójától kaphatja. A visszatérítés mértéke a
          konkrét biztosítási csomagtól függ.

  # --------------------------------------------------------- partnerek ---
  - type: partners
    bg: cream
    data: insurance
    eyebrow: Egészségpénztárak
    title: Szerződött partnereink
    lead: >-
      Amennyiben a felsoroltak között nem szerepel az Ön biztosítója, keressen
      bizalommal minket — felvesszük a kapcsolatot az adott egészségpénztárral.

  # --------------------------------------------------------------- faq ---
  - type: faq
    id: gyik
    bg: paper
    eyebrow: Gyakori kérdések
    title: Gyakori kérdések új pácienseinktől
    lead: >-
      Összegyűjtöttük azokat a kérdéseket, amelyeket leggyakrabban kapunk az első
      látogatás előtt.
    data: faq

  # ------------------------------------------------------------ kérdés ---
  - type: split
    bg: cream
    flip: true
    image: /img/demo2.webp
    imageAlt: Beszélgetés a fogorvossal a kezelési lehetőségekről
    eyebrow: Kérdése van?
    title: Beszéljük meg együtt
    lead: >-
      Ha bármi bizonytalan, ne tartsa magában — örömmel válaszolunk.
    body:
      - >-
        Hívjon minket, írjon e-mailt, vagy foglaljon időpontot egy kötelezettség
        nélküli beszélgetésre. Megmutatjuk, hol tart most a szájegészsége, és milyen
        lehetőségei vannak.
    actions:
      - label: Időpontfoglalás
        url: /kapcsolat/
        icon: calendar
        style: btn--mint
      - label: Kapcsolat
        url: /kapcsolat/
        icon: arrow-right
        style: btn--ghost
---
