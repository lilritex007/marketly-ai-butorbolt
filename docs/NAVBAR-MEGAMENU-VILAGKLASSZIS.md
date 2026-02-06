# Navbar és mobilmenü – világklasszis UX/UI irányok

Mitől lesznek a világ legjobb navbari és mobilmenüi (pl. Apple, Stripe, Linear, Notion, Vercel, Airbnb), és mit lehet még kihozni a Marketly navbarjából és mobilmenüjéből.

---

## 1. Egyértelmű információépítészet és célok

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **Egy kattintás = egy cél** | Minden gomb/link egyértelműen egy cselekvéshez vezet; nincs „bizonytalan” elem. | Nav: max 5–7 fő elem; a többi mega menübe / „Több” alá. |
| **Prioritás látható** | A legfontosabb (pl. Termékek, Keresés) vizuálisan és sorrendben előrébb. | Aktív tab + első elem erősebb (méret, szín, esetleg ikon). |
| **Konzisztens elnevezések** | A felhasználó mindig ugyanazt a szót látja ugyanahhoz a helyhez. | Egy helyen „Kategóriák”, egy helyen ne legyen „Böngészés” ugyanarra. |

---

## 2. Delight és mikrointerakciók

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **Finom animációk** | Nyitás/zárás, hover, fókusz nem „ugrik”, hanem vezet. | Mega menu: 150–200 ms fade + slide; mobilmenü: spring (kissé rugalmas) bezárás. |
| **Hover/active visszajelzés** | Minden kattintható érződik kattinthatónak. | Scale 1.02, enyhe shadow növekedés, vagy alul vonal (underline) megjelenése. |
| **Sikerküldés** | A cselekvés „megtörtént” érzése. | Kategória kattintás: rövid pipa vagy „Betöltés…” → azonnali tartalomváltás. |
| **Élő, de nem zavaró elemek** | A nav nem statikus fal. | Enyhe gradient shift, vagy egyetlen finom „pulse” a Keresés ikonon, ha üres a mező. |

---

## 3. Akadálymentesség és befogadás

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **Billentyűzet 100%-os** | Tab, Enter, Escape, nyilak mindenhol működnek. | Mega menu: Tab a kategóriák között, Escape zárja; mobilmenü: fókuszcsapda + bezárás Escape-re. |
| **Screen reader barát** | A felolvasó értelmes mondatokat mond. | `aria-label`, `aria-expanded`, `aria-current`, szekciócímek (`role="region"` + `aria-label`). |
| **Kontraszt és méret** | Olvasható és kattintható mindenki számára. | Minimum 44×44 px érintési cél; szöveg/kontraszt WCAG AA (4.5:1). |
| **Reduced motion** | Nem mindenki bírja a sok mozgást. | `prefers-reduced-motion: reduce` → animációk lerövidítése vagy kikapcsolása. |

---

## 4. Gyorsaság és „azonnali” érzet

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **Azonnali megnyitás** | A menü ne várjon adatra a megjelenéshez. | Kategóriák: cache/local state, első megjelenés azonnal; friss adat háttérben. |
| **Optimistic UI** | Kattintás azonnal „változtat”. | Kategória kattintás → azonnal váltás a shopra + görgetés; háttérben szűrés. |
| **Nincs felesleges lépés** | Egy kattintással a célhoz. | Mega menüből kategória = egy kattintás a terméklistára (már így van). |

---

## 5. Személyre szabás és kontextus

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **„Népszerű neked”** | A nav/menü reflektálja a viselkedést. | Mobilmenü: „Gyakran nézett kategóriák” (pl. utolsó 3) a teljes lista mellett vagy helyett. |
| **Elhelyezkedés (breadcrumb)** | „Hol vagyok?” mindig világos. | Desktop: a mega menu fejlécében pl. „Termékek > Kategóriák”; mobilon egy sor: „Shop > [aktuális kategória]”. |
| **Időzített/kontextuális üzenet** | Nem generikus, hanem releváns. | Pl. „Ma még 2 óra ingyenes szállítás” az announcement sávban; vagy ünnepi üzenet. |

---

## 6. Vizuális hierarchia és polish

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **Levegő és ritmus** | Nem zsúfolt, de minden megtalálható. | Konzisztens padding (pl. 4/6/8 skála); szekciók között egyértelmű elválasztás. |
| **Tipográfia** | Címek vs. mellék szöveg egyértelmű. | Nav: egy betűcsalád, 2–3 méret (pl. label kisebb, fő elem nagyobb); font-weight különbség. |
| **Szín és kontraszt** | CTA és „másodlagos” külön látszik. | Egy primary CTA (pl. Keresés vagy Termékek) kiemelten; többi secondary (de még mindig kattintható). |
| **Árnyék és mélység** | A menük „a tartalom fölött” érzete. | Mega menu: enyhe shadow; mobilmenü: a panel „kilóg” a háttérből (már közelíted). |

---

## 7. Mobilmenü specifikus – „a világ legjobbjai”

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **Ujjbarát zónák** | Minden fontos gomb az érintés zónában. | Fő CTA-k alul vagy jobb szélen; elkerülni a képernyő tetejét egyedül kritikus elemeknek. |
| **Swipe és gesztusok** | A menü természetes módon záródik. | Swipe jobbra bezár (már van); opcionális: swipe balra a menü szélén = vissza. |
| **Rövid, skennelhető blokkok** | Nem hosszú lista, hanem szekciók. | Max 5–7 elem per szekció; szekciócímek (Kategóriák, Navigáció, Fiók, Stb.). |
| **Progressive disclosure** | Kevesebb látszik először, több kattintásra. | „Több kategória” / accordion; Utoljára nézett összecsukható. |
| **Safe area és notch** | Semmi ne vágódjon le. | Padding bottom/top `env(safe-area-inset-*)` (már közelíted). |

---

## 8. Trust és megnyugtatás

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------| Konkrét ötlet |
| **Kiszámíthatóság** | Ugyanaz a művelet ugyanott van. | Keresés, Kedvencek, Kategóriák mindig ugyanazon a helyen (desktop és mobil). |
| **Visszavonás** | „Ha rosszra kattintottam.” | Mega menu: kattintás kívülre / Escape azonnal zár (már van); mobilmenü: overlay zár. |
| **Egyértelmű állapot** | Látszik, mi aktív, mi nyitott. | Aktív tab kiemelve; mega menu nyitott = a „Kategóriák” gomb vizuálisan aktív (már közelíted). |

---

## 9. Mérhetőség és A/B

| Irány | Miért számít | Konkrét ötlet |
|-------|--------------|----------------|
| **Kattintás és konverzió** | Mi vezet terméknézethez, kosárhoz. | Event: nav_kategoria_click, nav_kereses_click, mobil_menu_bezaras; funnel: nav → kategória → termék. |
| **Scroll és idő** | Mennyi ideig van nyitva a mega menu. | Ha < 1 s → talán rossz a felirat vagy a hely; ha > 5 s → jó a tartalom. |
| **A/B tesztek** | Szöveg, sorrend, méret. | Pl. „Kategóriák” vs „Böngészés”; Keresés balra vs jobbra; mobilmenü szélesség 85% vs 90%. |

---

## 10. Rövid prioritási lista – „mit érdemes következőnek”

1. **Billentyűzet + reduced motion** – mega menu és mobilmenü (accessibility, befogadás).
2. **Mobilmenü szekciók + progressive disclosure** – pl. „Több kategória” accordion, rövidebb első képernyő.
3. **Delight** – egy közös, rövid (150–200 ms) animációs token (spring vagy ease-out) minden nyitás/zárásra.
4. **Kontextus** – „Gyakran nézett kategóriák” a mobilmenüben (utolsó 3 kategória).
5. **Breadcrumb / helyzet** – desktop mega menu fejlécében: „Termékek > Kategóriák”; mobilon egy sor helyzetjelzés.

Ha ezeket fokozatosan beépíted, a navbar és a mobilmenü világklasszis UX/UI felé közelít: gyors, egyértelmű, akadálymentes, és emberközpontú.
