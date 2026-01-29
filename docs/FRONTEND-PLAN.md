# Frontend fejlesztési terv – Marketly AI Bútorbolt

A Railway Git auth hibája miatt a frontend fejlesztés lokálisan és build/CDN-kel folytatható. Ez a dokumentum a frontend prioritásait, feladatait és fázisait rögzíti.

---

## 1. Jelenlegi állapot

### Tech stack
- **React 18** + **Vite 5** + **Tailwind CSS**
- **Lucide React** (ikonok), **Framer Motion** (animációk)
- **Gemini API** (AI chat, képfelismerés, stílus quiz, szobatervező)
- **unasApi.js** – backend API hívások (termékek, health)

### Fő képernyők / flow
| Tab / szekció | Komponensek | Megjegyzés |
|---------------|-------------|------------|
| **Főoldal (shop)** | ModernHero, AIFeaturesShowcase, CategorySwipe, AdvancedFilters, termék grid, infinite scroll, RecentlyViewed, Testimonials, InteractiveCTA | A fő böngészési felület |
| **Képkereső** | VisualSearch (App-ben), SmartSearch | AI képfelismerés |
| **Szobatervező** | RoomPlanner (App-ben), AIRoomDesigner | Fotó + bútor elhelyezés |
| **Globális** | Navbar, Toast, AI Onboarding, LiveSocialProof, BackToTop, AIChatAssistant, ProductQuickPeek, ProductComparison, AIStyleQuiz, AIRoomDesigner, SmartNewsletterPopup | Modálok, chat, értesítések |

### Amit már megoldottunk (rövid)
- Infinite scroll (displayedProducts + loadMoreSentinel)
- Szűrő visszaállítás (AdvancedFilters: clear → restore)
- Gyors előnézet modal középre + scroll mobilon
- LiveSocialProof: egy értesítés / termék nézet
- AdvancedFilters: nagy lista kezelés (cap, sampling) – stack overflow elkerülés
- Placeholder képek: PLACEHOLDER_IMAGE, nincs via.placeholder
- Termék kártya: stopPropagation, kosár/összehasonlítás/wishlist

---

## 2. Célok és korlátozások

- **Cél:** Gyors, reszponzív, professzionális AI bútorbolt UX; valós adat (API); jól karbantartható kód.
- **Nem kell:** Dark mode, képernyő alján lévő fix menüsor (bottom nav bar).
- **Környezet:** UNAS-be beágyazva (iframe vagy script injektálás), CDN-ről töltődik a bundle; backend külön (Railway).

---

## 3. Prioritások

### P0 – Kritikus (stabilitás, alap UX)
- [ ] **API/állapot:** Ha az API hibázik vagy üres válasz, ne omoljon össze az oldal; egyértelmű üzenet (pl. EmptyState + „Próbáld később”).
- [ ] **Készlet megjelenés:** A backend `inStock` / `in_stock` értékének konzisztens megjelenítése kártyán, QuickPeek-ben, szűrőben.
- [ ] **Képek:** Hibás URL esetén mindenhol PLACEHOLDER_IMAGE; lazy load opcionális a listában (nagy listánál).
- [ ] **Kulcsok és figyelmeztetések:** Minden listában stabil, egyedi `key` (pl. `product.id`); React figyelmeztetések (pl. `jsx` attr) eltüntetése.

### P1 – Fontos (UX, AI, teljesítmény)
- [ ] **Keresés és szűrés:** SmartSearch / szöveges keresés gyors és látható (pl. sticky search bar); szűrő panel mobilon is jól használható (pl. drawer).
- [ ] **Kategóriák:** CategorySwipe mobilon swipe; kategória váltáskor scroll a termékekhez és „Összes” egyértelmű.
- [ ] **AI funkciók:** Chat, Style Quiz, Room Designer – loading és hibaüzenetek; „Nincs eredmény” kezelés.
- [ ] **Betöltés:** Első képernyő gyors (skeleton, majd infinite scroll); „Több termék betöltése” jelzés egyértelmű.
- [ ] **Gyors előnézet:** QuickPeek-ben kosárhoz adás, wishlist, megosztás működik; link a webshopba mindig látható.

### P2 – Kellemes (polish, karbantarthatóság)
- [ ] **Reszponzivitás:** Minden breakpointon (kis mobil → nagy desktop) olvasható és kattintható.
- [ ] **Akadálymentesség:** Fókusz kezelés modáloknál, aria-label a fontos gombokon.
- [ ] **SEO / meta:** Ha később külön oldalként szolgáljuk, title/description kezelés.
- [ ] **Kód:** App.jsx szétbontása (pl. ProductModal, ChatWidget, VisualSearch, RoomPlanner külön fájlokba); közös konstansok (pl. WEBSHOP_DOMAIN) egy helyen.

---

## 4. Feladatok témakörönként

### 4.1 Terméklista és szűrés
| Feladat | Prioritás | Röviden |
|---------|-----------|---------|
| Üres/hiba állapot kezelése | P0 | API hiba vagy 0 termék → EmptyState + CTA (pl. „Frissítés” vagy „Összes kategória”). |
| Készlet badge konzisztencia | P0 | Egy helyen `inStock ?? product.in_stock`; ugyanaz a logika kártyán, QuickPeek, ProductModal. |
| Szűrő panel mobilon | P1 | AdvancedFilters: mobilon full-screen drawer vagy bottom sheet, ne legyen levágható. |
| Rendezés láthatóság | P1 | Rendezés (ár, név) legyen egyértelmű (dropdown vagy chip-ek). |
| Kategória „Összes” | P1 | CategorySwipe-ban és a fülön is legyen „Összes”; szinkron a categoryFilter állapottal. |

### 4.2 Keresés
| Feladat | Prioritás | Röviden |
|---------|-----------|---------|
| Kereső mező sticky | P1 | Scrollozáskor a kereső (és opcionálisan kategória sor) maradjon felül vagy gyorsan elérhető. |
| Keresés debounce | P1 | Szöveges keresés debounce (pl. 300 ms) hogy ne minden karakterre szűrjön. |
| VoiceSearch integráció | P2 | Ha van VoiceSearch komponens, legyen egy helyen (pl. kereső mellett) elérhető. |
| Keresés üres eredmény | P1 | „Nincs ilyen termék” üzenet + javaslat (pl. kategória váltás, szűrő törlése). |

### 4.3 AI funkciók
| Feladat | Prioritás | Röviden |
|---------|-----------|---------|
| AIChatAssistant hiba/üres | P1 | Hálózati hiba vagy üres válasz → rövid üzenet, ne fehér képernyő. |
| AIStyleQuiz eredmény | P1 | Ajánlott termékek megjelenítése (grid/link); „Nincs ajánlás” kezelés. |
| AIRoomDesigner eredmény | P1 | Feltöltés + AI válasz után termékek vagy üzenet; hiba esetén újrapróbálás lehetőség. |
| Visual search (képfeltöltés) | P1 | Feltöltés, loading, eredmény lista; nincs eredmény üzenet. |
| AI árképzés (AIPricePredictor) | P2 | Ha használjuk: loading és értelmezhető kimenet. |

### 4.4 Termék kártya és modálok
| Feladat | Prioritás | Röviden |
|---------|-----------|---------|
| EnhancedProductCard készlet | P0 | Raktáron / Készlethiány badge a backend mező alapján. |
| QuickPeek wishlist/share | P1 | Wishlist gomb kötve a globális wishlist-hez; Share: pl. Web Share API vagy link másolás. |
| ProductModal vs QuickPeek | P2 | Döntés: egy „részletes nézet” (modal) elég, vagy külön QuickPeek + nagy modal; duplikáció elkerülése. |
| Összehasonlítás (ProductComparison) | P2 | Max 3–4 termék, táblázat/jelölők egyértelműek; üres állapot szöveg. |

### 4.5 Landing és navigáció
| Feladat | Prioritás | Röviden |
|---------|-----------|---------|
| ModernHero CTA | P1 | „Kollekció megtekintése” görget a termékekhez; „Próbáld ki az AI-t” a megfelelő tabra/funkcióra. |
| AIFeaturesShowcase | P1 | Kattintás: Képkereső / Asszisztens / Tervező megnyitása vagy scroll. |
| Navbar mobilon | P1 | Hamburger vagy összecsukható menü; főoldal, Képkereső, Szobatervező elérhető. |
| BackToTop / ScrollProgress | P2 | Már van; csak ellenőrizni, hogy nem takar ki fontos elemet. |

### 4.6 Marketing és egyéb
| Feladat | Prioritás | Röviden |
|---------|-----------|---------|
| SmartNewsletterPopup | P2 | Egyszer megjelenik, bezárás után ne ismétlődjön (pl. localStorage). |
| RecentlyViewed | P1 | Legyen limit (pl. 10); üres állapot ne üssön hibát. |
| SimilarProducts | P2 | Ha nincs hasonló termék, ne jelenjen meg üres blokk. |

### 4.7 Technikai és karbantarthatóság
| Feladat | Prioritás | Röviden |
|---------|-----------|---------|
| App.jsx bontás | P2 | ProductModal, ChatWidget, VisualSearch, RoomPlanner → külön fájlok (pl. `src/views/` vagy `src/components/app/`). |
| Konstansok | P2 | WEBSHOP_DOMAIN, SHOP_ID, GOOGLE_API_KEY, INITIAL_PAGE_SIZE stb. → pl. `src/config.js` vagy env. |
| React figyelmeztetések | P0 | pl. `jsx` boolean attr eltávolítása (ha valahol van); key probs ellenőrzés. |
| Lazy load képek | P2 | Terméklistában `loading="lazy"` vagy Intersection Observer; placeholder amíg tölt. |

---

## 5. Javasolt fázisok

### Fázis 1 – Stabilitás (P0)
- API hiba és üres lista kezelése (EmptyState + üzenet).
- Készlet megjelenés egy helyen (`inStock ?? in_stock`), minden komponensben.
- React key és egyéb figyelmeztetések javítása.
- **Becslés:** 1–2 nap.

### Fázis 2 – Keresés és szűrés (P1)
- Sticky kereső / kategória (vagy jól látható fix hely).
- Szűrő panel mobilon (drawer).
- Keresés debounce + üres eredmény szöveg.
- Rendezés UI.
- **Becslés:** 1–2 nap.

### Fázis 3 – AI és modálok (P1)
- Chat, Style Quiz, Room Designer, Visual Search: loading + hiba + üres eredmény.
- QuickPeek: wishlist és share működik.
- RecentlyViewed limit és üres állapot.
- **Becslés:** 1–2 nap.

### Fázis 4 – Reszponzivitás és polish (P1–P2)
- Navbar mobil menü.
- Breakpoint teszt és javítások.
- Opcionális: képek lazy load, akadálymentesség.
- **Becslés:** ~1 nap.

### Fázis 5 – Kód struktúra (P2)
- App.jsx szétbontása; konstansok kiszervezése.
- **Becslés:** ~1 nap.

---

## 6. Lokális fejlesztés (Railway nélkül)

- **Frontend:** `npm run dev` → Vite dev server; a termékadatokhoz szükséges egy futó backend (pl. `npm run server` más terminálban, vagy mock).
- **Mock adat (opcionális):** Ha nincs backend, `unasApi.js`-ben lehet egy fallback: pl. üres tömb vagy kis statikus JSON, hogy a UI mindig legyen tesztelhető.
- **Build:** `npm run build` → `dist/`; a `dist/` feltölthető CDN-re vagy más statikus hostingra; az UNAS script továbbra is a CDN URL-t használja.

---

## 7. Rövid összefoglaló

| Fázis | Fókusz | P0/P1/P2 |
|-------|--------|----------|
| 1 | Stabilitás, készlet, hibakezelés, React figyelmeztetések | P0 |
| 2 | Keresés, szűrés, kategóriák, rendezés | P1 |
| 3 | AI funkciók hibakezelés, QuickPeek wishlist/share, RecentlyViewed | P1 |
| 4 | Mobil, reszponzivitás, polish | P1–P2 |
| 5 | App bontás, konstansok | P2 |

A tervet érdemes fázisonként végigvinni; minden fázis után egy rövid manuális teszt (főoldal, keresés, szűrés, egy AI funkció, mobil nézet) megéri. Ha a Railway Git auth később helyreáll, a változások pusholhatók és a meglévő deploy flow (build → CDN / Railway) továbbra is használható.
