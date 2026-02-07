# Senior Code Review – Marketly AI Bútorbolt

**Átnézés dátuma:** 2025  
**Scope:** Teljes shop (frontend + konfig, szolgáltatások, komponensek)

---

## 1. Összefoglaló

A projekt egy React (Vite) alapú, UNAS-be ágyazott AI bútor webshop. Az adatok statikus JSON + backend API hibridből jönnek, az AI hívások proxy-n keresztül mennek (API kulcs szerveren). A kód alapvetően működőképes és biztonságos, de van **architektúra**, **karbantarthatóság** és **robusztusság** terén javítandó.

| Terület           | Értékelés | Megjegyzés |
|-------------------|-----------|------------|
| Architektúra      | ⚠️ Gyenge | App.jsx ~1900 sor, sok felelősség egy helyen |
| Biztonság         | ✅ Jó     | Nincs dangerouslySetInnerHTML/eval, API proxy |
| Teljesítmény      | ✅ Közepes| Lazy load AI, static JSON cache, de nincs virtualizálás |
| Hibakezelés      | ⚠️ Gyenge | Nincs Error Boundary, sok try/catch hiányzik |
| Konzisztencia     | ✅ Közepes| Duplikált helper (formatPrice), dead code (Hero) |
| Tesztelhetőség    | ⚠️ Gyenge | Nincs unit/integration test, nagy függőségek |

---

## 2. Kritikus pontok

### 2.1 App.jsx – monolít, szét kell bontani

- **~1900 sor** egy fájlban: state, CSV parser, segédfüggvények (fixUrl, formatPrice, parseCSV), és 4+ inline komponens (FileLoaderBar, Hero, Features, ProductModal).
- **Kockázat:** Merge konfliktusok, nehéz onboarding, nehéz tesztelni.
- **Javaslat:**
  - CSV és termék-normalizálás → `src/utils/csvParser.js` és `src/utils/productUtils.js`.
  - `formatPrice`, `fixUrl`, `generateAltImages` → már létező `utils/helpers.js` / `utils/imageOptimizer.js` vagy dedikált `productUtils.js`.
  - Inline komponensek kiszervezése: `FileLoaderBar`, `Hero` (legacy), `Features`, `ProductModal` → `components/` alá (pl. `product/ProductModal.jsx`).
  - Fő state (products, wishlist, cart, selectedProduct, activeTab) → Context vagy kisállapot (pl. `useShopState`) hogy a gyerek komponensek ne 15+ propot kapjanak.

### 2.2 Nincs Error Boundary

- Ha bármelyik komponens **throw**-ol (pl. null reference, váratlan adat), az egész React fa leeshet.
- **Javaslat:** Legalább egy root `ErrorBoundary` a `main.jsx`-ben, fallback UI + log (pl. Sentry később).

### 2.3 Dead code

- **Hero** (sor 296): régi `Hero` komponens definiálva, de a JSX-ben csak **ModernHero** szerepel. A régi Hero és a hozzá tartozó kód törölhető.

### 2.4 Duplikáció

- **formatPrice:** definiálva az App.jsx-ben (sor 104) és a `utils/helpers.js`-ben. Egy helyen legyen (pl. helpers), és import mindenhol.
- **NewsletterStrip:** e-mail validáció inline regex; a `helpers.isValidEmail` már létezik – érdemes azt használni a konzisztencia miatt.

### 2.5 Hook függőség (useIntersectionObserver)

- `src/hooks/index.js`: az `useIntersectionObserver` az `options` objektumot használja dependency-ként. Minden render új objektum → observer folyamatosan újraregisztrálódik.
- **Javaslat:** `options`-t ref-ben tárolni, vagy dependency-ből kivenni (pl. üres tömb), vagy `useMemo(options)` a hívó oldalon.

### 2.6 Konzol üzenetek

- Sok `console.log` / `console.warn` maradt (pl. unasApi, aiSearchService, App.jsx keresés). Production buildben érdemes ezeket szűrni (pl. env-alapú logger), hogy ne legyen zaj és információfúvás.

### 2.7 Scroll logika (scrollToProductsSection)

- Van egy `window.scrollTo({ top: Math.max(0, scrollY - 1), behavior: 'auto' })` majd rAF-ban smooth scroll. A „scrollY - 1” célja nem egyértelmű (layout trigger?); ha nincs szükség rá, érdemes egyszerűsíteni, hogy ne legyen „mágikus” szám.

---

## 3. Biztonság

- **XSS:** Nincs `dangerouslySetInnerHTML` / `innerHTML` / `eval` – jó.
- **API kulcs:** Gemini/AI a backend proxy-n megy, a frontend nem tartalmaz kulcsot – jó.
- **.env.example:** VITE_GOOGLE_API_KEY szerepel – győződj meg róla, hogy a valódi kulcs soha ne kerüljön a frontend bundle-be (csak backend .env).

---

## 4. Teljesítmény

- **Pozitív:** Lazy load (AIChatAssistant, AIRoomDesigner, AIStyleQuiz), statikus products.json cache, manual „Load more” (nincs túlzott re-render).
- **Hiány:** Nagy terméklistánál (pl. 10k+ elem) nincs listavirtualizálás (react-window van a package.json-ban, de nem látszik használatban a fő gridnél) – hosszú listáknál lehet FLIP/memory javítani virtualizálással.
- **filteredAndSortedProducts:** useMemo jól van használva; a dependency lista hosszú de helyes.

---

## 5. Akadálymentesség és UX

- BackToTop, Hero scroll gomb, NewsletterStrip – van focus-visible és 44px tap target, jó.
- FadeInOnScroll és Hero – a `prefers-reduced-motion` figyelembevétele rendben.
- ProductModal: z-index 9999, overlay – érdemes ellenőrizni, hogy billentyűzetből (Esc) és fókuszfogó (focus trap) megfelelően működik-e.

---

## 6. Javasolt lépések (prioritás)

1. **Rövid táv (1–2 nap)**  
   - Root **ErrorBoundary** a main.jsx-ben.  
   - **Dead code** eltávolítása: régi Hero komponens.  
   - **formatPrice** és **fixUrl** központosítása (helpers/productUtils), App.jsx-ből törlés.  
   - **useIntersectionObserver** dependency javítás (ref vagy stabil options).

2. **Közép táv (1 hét)**  
   - **App.jsx szétbontása:** CSV/parse → utils, ProductModal/FileLoaderBar/Features → components, state → context vagy custom hook.  
   - **Logger:** env-alapú (pl. `import.meta.env.DEV`) – productionben ne legyen console.log.

3. **Hosszú táv**  
   - Unit tesztek a kritikus utilokra (parseCSV, smartSearch, formatPrice).  
   - Terméklista virtualizálás (react-window) nagy listánál.  
   - E2E (pl. Playwright) a fő flow-ra: betöltés, keresés, kosár, modal.

---

## 7. Fájl- és mappaszerkezet

- A `components/` logikus (landing, product, ai, cart, stb.).  
- A `services/` és `utils/` elkülönítés világos.  
- Az egyetlen nagy „bűnöző” az App.jsx – annak feldarabolása nagyot dob a karbantarthatóságon.

---

**Összegzés:** A shop funkcionalitása és biztonsága rendben van; a legnagyobb nyereség a **App.jsx modularizálásában**, egy **Error Boundary** bevezetésében és a **dead/duplikált kód** folyamatos takarításában van. Ezekkel senior szintű, karbantartható codebase felé lehet lépni.
