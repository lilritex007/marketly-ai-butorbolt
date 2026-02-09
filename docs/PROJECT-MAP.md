# Projekt térkép – Marketly AI Bútorbolt

A teljes mappa és fájlstruktúra egy helyen. Frissítve: 2025.

---

## Gyökér

| Fájl / mappa | Jelentése |
|--------------|-----------|
| **package.json** | Npm scriptek: `dev`, `server`, `dev:full`, `build`, `preview`, `lint`, `test:db`, `deploy:check`, `deploy:test`, `deploy:live`, `deploy:rollback`, `deploy:status`. Node ≥20. |
| **vite.config.js** | Vite 5, React, base `./`, proxy `/api` → 3001, version.json plugin, framer-motion → motion-shim alias, fix bundle nevek (index.js, index.css). |
| **tailwind.config.cjs** | Primary #ff8a00, secondary #006b6f, xs: 375px, section spacing. |
| **postcss.config.cjs** | PostCSS (Tailwind, autoprefixer). |
| **index.html** | SPA entry: `#root`, script `/src/main.jsx`. |
| **.env.example** | Példa env: VITE_*, UNAS_API_KEY, PORT, FRONTEND_URL, stb. |
| **.eslintrc.cjs** | ESLint React + hooks. |
| **.gitignore** | node_modules, .env*, data/, *.db; dist nincs ignore (CDN). |
| **.nixpacks.yml** / **nixpacks.toml** | Nixpacks build (Railway stb.). |
| **Procfile** | Railway start parancs. |
| **railway.json** | Railway konfig. |
| **README.md** | Projekt leírás, gyors indítás, env. |
| **git-push-changes.ps1** | PowerShell script push-hoz. |

---

## .cursor/rules

| Fájl | Tartalom |
|------|----------|
| **deploy-unas.mdc** | UNAS deploy lépések, loader, script tag, host oldal hibák (butorbolt:2591, 2520), Frontend/API megjegyzések. Glob: deployment/** , unasApi.js, App.jsx. |
| **fejlesztes-megtartando.mdc** | Megtartandó elemek (Virtual Showroom, PhotoReviews, GiftRegistry, Testimonials, termékbetöltés, kategóriák, SmartSearchBar). Tag: stable-showroom-ok. Glob: App, landing, showroom, reviews. |

---

## src/ – Frontend

### Belépés
- **main.jsx** – React root a `#root`-ba, ErrorBoundary, index.css, scroll restoration (load/pageshow → scroll top, beleértve UNAS embed scroll parentot).
- **config.js** – WEBSHOP_DOMAIN (marketly.hu), SHOP_ID, DISPLAY_BATCH, INITIAL_PAGE, TAB_HASH, HASH_TO_TAB.
- **App.jsx** – Fő alkalmazás: tabok (#shop, #visual-search, #room-planner), termékbetöltés (API), kosár, wishlist, modálok, szekciók sorrendje.

### src/components/

| Mappa | Komponensek |
|-------|--------------|
| **ai/** | AIChatAssistant, AIPricePredictor, AIRoomDesigner, AIShowcase, AIStyleQuiz – lazy betöltés (AIChatAssistant, AIRoomDesigner, AIStyleQuiz). |
| **ar/** | ARMeasure, ARProductPreview. |
| **cart/** | FloatingCartPreview, FreeShippingProgress. |
| **category/** | CategoryPage, CategorySwipe, MainCategoriesSection. |
| **checkout/** | OneClickCheckout. |
| **debug/** | AIDebugPanel. |
| **home/** | PersonalizedSection (section-world--personal). |
| **landing/** | BannerStrip, FeaturedProducts, Footer, InspirationSection, ModernHero, MostPopularSection, NewArrivalsSection, SectionHeader, ShowcaseSections (SocialProof, LiveShowcase, InteractiveCTA), TestimonialsSection, TrustStrip. |
| **layout/** | Navbar. |
| **loyalty/** | LoyaltyProgram. |
| **marketing/** | ExitIntentPopup, FlashSaleBanner, NewsletterStrip, SmartNewsletterPopup. |
| **mobile/** | BottomSheet, StickyAddToCartMobile. |
| **product/** | AdvancedFilters, AdvancedFiltersPanel, CompleteTheLook, DeliveryEstimator, EnhancedProductCard, ImageGallery, PriceAlert, PriceHistory, ProductComparison, ProductQuickPeek, ProductShare, ProductTabs, QuickActionsBar, QuickAddToCart, RecentlyViewed, SimilarProducts, SmartBundle, StickyAddToCart, StockUrgency. |
| **reviews/** | PhotoReviews. |
| **search/** | SmartSearchBar. |
| **showroom/** | VirtualShowroom. |
| **trust/** | TrustBadges. |
| **ui/** | Animations (FadeInOnScroll, Confetti, CountUp), Badge (SmartBadges), EmptyState (NoSearchResults, NoFilterResults, ErrorState), ErrorBoundary, Icons, ProductCarousel, Skeleton, Toast (ToastProvider, useToast). |
| **ux/** | BackToTop, LiveActivityStrip, LiveSocialProof, ScrollProgress. |
| **wishlist/** | GiftRegistry, WishlistDrawer. |

### src/hooks/
- **index.js** – useIsMobile, useLocalStorage, useDebounce, useIntersectionObserver; re-export: useToast, useInfiniteScroll, InfiniteScrollSentinel, useScrollAnimation, useStaggerAnimation, useParallax, useScrollProgress.
- **useToast.js**, **useInfiniteScroll.jsx**, **useScrollAnimation.js** – toast, infinite scroll, scroll animációk.

### src/services/
- **unasApi.js** – getApiBase (MARKETLY_CONFIG / VITE_API_URL), fetchUnasProducts (limit/offset), fetchCategories, fetchCategoryHierarchy, fetchSearchIndex, fetchProductStats, fetchUnasProductById, refreshUnasProducts.
- **geminiService.js** – AI (generateText, analyzeImage) – API base backend felé.
- **aiSearchService.js** – smartSearch (lokális index / szerver).
- **userPreferencesService.js** – kedvencek, megtekintések, személyre szabás, trackSectionEvent, getPersonalizedRecommendations, getSimilarProducts.

### src/utils/
- **helpers.js** – PLACEHOLDER_IMAGE, formatPrice, stb.
- **imageOptimizer.js** – getOptimizedImageProps.
- **motion-shim.jsx** – Framer Motion helyettesítő (Vite production TDZ elkerülés).

### src/index.css
- Scoped: `#mkt-butorbolt-app`. Root vars: brand colors, typography (--text-*), spacing, radius, --touch-target: 44px, --section-gap-*.
- Section: .section-padding, .section-gap, .section-shell, .section-world, .section-world--popular|new|personal|favorites, .section-frame, .section-header-hero, lux-title, lux-subtitle.
- Search, product grid, ecom-card, stb. Reszponzív section padding skála.

---

## server/ – Backend (Node, Express)

- **index.js** – Express, CORS (localhost, marketly.hu), compression, /dist, /public, /products.json, /health, /api/products (limit, offset, category, categoryMain, search, slim), /api/products/:id, /api/products/stats, /api/categories, /api/categories/main, /api/categories/hierarchy, /api/stats; admin: sync, sync/history, products, PATCH/DELETE. DB init: database/db.js.
- **database/db.js** – SQLite (better-sqlite3) init.
- **services/productService.js** – getProducts, getProductById, getCategories, getMainCategories, getCategoryHierarchy, toggleCategory, getStatistics, stb.
- **services/syncService.js** – UNAS sync (syncProductsFromUnas), getSyncHistory, getLastSyncInfo, autoSync.
- **transformers/unasParser.js** – UNAS XML/API → belső termék formátum.
- **config/excludedCategories.js**, **mainCategoryGroups.js** – kategória szűrés/csoportok.
- **scripts/export-products.js**, **list-main-categories.js** – segéd scriptek.

---

## deployment/

- **scripts/deploy-scripttag.js** – UNAS script tag beállítás (loader script), generateLoaderScript, CDN base. Env: .env.deployment (SHOP_URL, UNAS token, stb.).
- **scripts/deploy-github.js** – GitHub CDN stratégia, HTML generálás.
- **scripts/deploy.js** – Általános deploy (remote path, stb.).
- **scripts/deploy-local-cdn.js** – Lokális CDN teszt.
- **scripts/rollback.js**, **status.js** – Rollback, állapot.
- **scripts/check-ready.js** – Deploy előtti ellenőrzés (env).
- **scripts/backup.js**, **debug-content.js**, **unas-api.js** – Backup, debug, UNAS API hívások.
- **config/deployment-state.json** – Utolsó deploy állapot (strategy, cdnBase, pageSlug, stb.).
- **DEPLOY-UNAS.md** – Éles frissítés, loader, host oldal hibák javítása.
- **ABSOLVALAS-CHECKLIST.md**, **BACKEND-DB.md**, **TEENDO-LISTA.md**, **UNAS-host-oldal-javitas.md** – Checklist, DB, teendők, host javítás.

---

## docs/

| Fájl | Tartalom |
|------|----------|
| **DESIGN-OSSZEHANGOLAS.md** | Teljes dizájn összehangolás: szekció típusok, légzés, élő ellenőrzés (marketly.hu/butorbolt), deploy lépések. |
| **TERV.md** | Később megoldandó (pl. scroll termék szekcióhoz – megvalósítva). |
| **FRONTEND-PLAN.md** | Frontend terv: tech stack, képernyők, prioritások (P0–P2), feladatok témakörönként. |
| **TOVABBI-FEJLESZTESEK.md** | Breakpointok, 3 nézet, touch/akadálymentesség, konkrét további fejlesztések, design konzisztencia. |
| **WOW-FEJLESZTESI-SORREND.md** | Wow faktor szekciók fejlesztési sorrendje. |
| **FEJLESZTES-BIZTONSAGOS.md** | Biztonságos fejlesztés, ágak, stable tag. |
| **CODE-REVIEW-SENIOR.md** | Code review pontok. |
| **NAVBAR-MEGAMENU-VILAGKLASSZIS.md** | Navbar / mega menu terv. |
| **PROJECT-MAP.md** | Ez a fájl – teljes projekt térkép. |

---

## public/ és dist/

- **public/loader.js** – Élő loader: ALLOWED_PATHS (/butorbolt, /ai-butorbolt), MARKETLY_CONFIG (apiBase = Railway backend + /api, distBase = backend /dist), ensureRoot, CSS/JS betöltés DIST_BASE + /assets/index.css|index.js (cache bust).
- **public/products.json** – Statikus termék fallback (nagy fájl).
- **dist/** – Build kimenet: index.html, loader.js, products.json, version.json, assets/index.js, index.css, vendor.js, AIChatAssistant.js, AIRoomDesigner.js, AIStyleQuiz.js + map fájlok. A CDN (vagy Railway /dist) ezt szolgálja.

---

## scripts/

- **test-db.js** – DB teszt script.

---

## Összefoglaló

- **Frontend:** React 18, Vite 5, Tailwind, Lucide, motion-shim (framer-motion helyett). Mount: `#root` (main.jsx). UNAS embed: scroll restoration a szülő containerre. Konfig: config.js + window.MARKETLY_CONFIG (apiBase, distBase).
- **Backend:** Express, SQLite, UNAS sync, /api/products (paginált), categories, stats. Railway: PORT, FRONTEND_URL, UNAS_API_KEY.
- **Deploy:** Build → dist; push → CDN (jsDelivr a repóból) vagy Railway /dist; loader a public/loader.js (backend DIST_BASE vagy CDN). UNAS: butorbolt oldalra script tag (deploy-scripttag.js).
- **Élő oldal:** https://www.marketly.hu/butorbolt – a loader csak /butorbolt és /ai-butorbolt pathokon fut.

Ha új fájlt vagy mappát adsz hozzá, érdemes ezt a térképet frissíteni.
