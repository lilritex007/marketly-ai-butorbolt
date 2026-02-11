# Fedezd fel a stílusokat – Fejlesztési javaslatok

A szekció jelenleg statikus, 4 kártyás grid. Alább UX, UI, dizájn és funkcionalitási javaslatok.

---

## UX javaslatok

1. **Stílus kvíz integráció** – Ha van AI Style Quiz, adj hozzá „Ismerd meg a stílusod” CTA-t a szekció fejlécéhez. A kvíz eredménye megjeleníthető volna a kollekciók felett (pl. „A te stílusod: Skandináv”).

2. **Személyre szabás** – A böngészési előzmények alapján emeld ki, melyik kollekció a leginkább illik a felhasználóhoz. Pl. „Neked ajánljuk” badge.

3. **Scroll-triggered animáció** – A kártyák fokozatos fade-in / slide-up animációval jelenjenek meg (pl. viewportba kerüléskor). Erősen javítja az „érkezés” érzetet.

4. **Előnézet preview** – Hover/focus esetén mutass 2–3 termék thumbnaile-t a kollekcióból (ha van API), így a felhasználó jobban el tudja képzelni, mi vár rá.

5. **Gyors navigáció** – A szekció aljára adj „Ugrás a termékekhez” linket, ha a felhasználó nem kattint egyik kártyára sem.

---

## UI javaslatok

1. **Mobil swipe** – Mobilon horiz scroll/carousel a kártyákkal (snap), jobb érintésélmény.

2. **Aktív állapot** – Válassz ki egy „kiemelt” kollekciót (pl. szezonális), és jelöld „Ajánlott” badge-del vagy enyhe glow-dal.

3. **Hover effektek** – Erősebb hover (scale, shadow), kisebb bounce a kártyákon. A „Böngészés” szöveg alá emberi, látható nyíl (ArrowRight) animáció.

4. **Betöltés állapot** – Ha a kategóriaváltás API-hívást indít, mutass skeleton/loading a kártyákon vagy a termékeknél.

5. **Accessibility** – `aria-label` finomhangolás, billentyűzet navigáció (taborder), focus-visible ring konzisztens megjelenése.

---

## Dizájn javaslatok

1. **Dinamikus képek** – A gradient helyett vagy mellett valós kollekciós fotókat használj (ha van CDN/UNAS kép). Gradient overlay maradjon, de a háttér legyen kép.

2. **Mobil magasság** – A fix `h-[240px]` helyett `aspect-[4/3]` vagy `aspect-video`, így mobilon is jól skálázódik.

3. **Fejléc stílusa** – A „Gondosan válogatott kollekciók” alá egy vékony accent vonal (gradient), ami illeszkedik a hero szekcióhoz.

4. **Színséma** – A COLLECTIONS gradientjei legyenek jobban összehangolva (pl. mindegyik primary/secondary tónusok). Most a `rose`, `slate`, `indigo` meglehetősen vegyes.

5. **Légzés** – Növeld a szekció `py-20` paddingjét nagyobb képernyőn (`lg:py-24`), és a grid `gap-5` helyett `gap-6` vagy `gap-8` nagyobb képernyőn.

---

## Feature javaslatok

1. **API-alapú kollekciók** – A COLLECTIONS ne legyen fix array, hanem API vagy CMS-ből jöjjön (pl. UNAS kategória/csoport). Így könnyen bővíthető és kezelhető.

2. **Termékszám** – Minden kollekción jelenjen meg a termékszám (pl. „42 termék”), hogy a felhasználó tisztábban tudjon dönteni.

3. **Szűrő + kollekció** – A kattintás ne csak kategóriát váltson, hanem pl. „sale=true” vagy „style=skandinav” paramétert is állítson be a terméklistán.

4. **A/B teszt** – Több címsor (pl. „Fedezd fel a stílusokat”, „Stílusok kategóriánként”) és tracking, hogy melyik nagyobb konverziót eredményez.

5. **Share / mentés** – „Mentsd el ezt a kollekciót” gomb, ami wishlist-szerű gyűjteménybe menti a kollekciót (ha van ilyen funkció).

---

## Prioritási javaslat

| Prioritas | Javaslat | Megjegyzés |
|-----------|----------|------------|
| Magas | Stílus kvíz CTA a fejlécben | Gyors win, erősíti az AI narratívát |
| Magas | Mobil carousel | UX ugrás mobilon |
| Közepes | Dinamikus képek | Dizájn szintű fejlesztés |
| Közepes | API-alapú kollekciók | Bővíthetőség |
| Alacsony | Termékszám megjelenítés | Kisebb, de hasznos UX javítás |
