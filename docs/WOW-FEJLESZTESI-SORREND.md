# Wow faktor – szekciók és funkciók fejlesztési sorrendje

Minden szekciót és funkciót **sorban** fejlesztünk (desktop + tablet + mobil), amíg el nem érjük a „wow” szintet. Az alábbi sorrend a felhasználói út és a first impression szerint van.

---

## Sorrend és wow célok

### 1. Első benyomás
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Hero** | ModernHero | Gradient orbs, CTA-k, AI badge | Egyetlen, emlékezetes üzenet; finom mozgás (parallax / reduced-motion); CTA egyértelmű | **Kész.** CTA min-h-[44px], focus-visible:ring-2 ring-primary-400; orbs + heading animate respect prefers-reduced-motion (matchMedia + motion-reduce:animate-none); aria-label, aria-hidden a dekorra; scroll indicator aria-hidden. |
| **Announcement sáv** | Navbar felső sáv | Rotating üzenetek | Rövidebb, ütős szöveg; nem túl gyors váltás; mobilön egy sor, olvasható | **Kész.** Rövidebb szövegek (50e Ft, 10% kód: ELSO10, 90.000+ termék, stb.); váltás 5500 ms; min-h-[44px] sáv, truncate szöveg, role="marquee" aria-live="polite". |
| **Flash sale banner** | FlashSaleBanner | Időzítő, CTA | Feszültség (countdown), de ne legyen agresszív; könnyen eltüntethető (1×/session) | **Kész.** Dismiss = sessionStorage (mkt_flash_dismissed_date) ma; csak aznap nem jelenik meg; CTA + dismiss min-h-[44px], focus ring, aria-label. |

---

### 2. Navigáció
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Navbar** | Navbar | Logo, kategória, keresés, wishlist, kosár, hamburger | Mindig tiszta, gyors; mega menu megbízható; tablet döntés (hamburger vs teljes menü) | 1) Tablet: lg breakpointig hamburger, utána teljes menü (opcionális) 2) Aktív tab/hash vizuálisan kiemelve 3) Sticky state: enyhe shadow, háttér |
| **Mega menu** | Navbar (mega) | Kategóriák, gyerekek, ikonok | Hover/click stabil; gyerek kategóriák számokkal; „Összes” mindig első | 1) Keyboard: Tab csapda, Esc zár 2) Lazy load kategória lista ha nagyon hosszú |
| **Mobil menü** | Navbar (drawer) | Panel jobbról, kategóriák, linkek | Zárás swipe-dal; kategóriák bővíthetők; 44px tap | 1) Swipe-to-close 2) Fókusz csapda, Esc zár |

---

### 3. Felfedezés – kategóriák és keresés
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Fő kategóriák** | MainCategoriesSection | Kártyák desktop, horizontális scroll mobil | Kártyák hover/focus; mobil swipe sima; számok naprakészek | 1) Hover scale/shadow finom 2) Lazy load kép háttér (opcionális) |
| **Kategória swipe** | CategorySwipe | Chip sor, aktív kategória | Swipe nem akad; aktív chip vizuálisan külön; 44px tap | 1) -webkit-overflow-scrolling: touch 2) Aktív chip: primary border + háttér |
| **Kereső** | SmartSearchBar | AI index, autocomplete, találat kiemelés | Azonnali érzet; üres állapot és „nincs találat” barát; mobilön full-width focus | 1) Tablet: mező méret md:w-80 lg:w-96 2) No results: javaslatok (pl. kategória linkek) 3) Keresés mező sticky vagy gyorsan elérhető |

---

### 4. Terméklista – fejléc, szűrő, grid
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Sticky fejléc** | App (products-section) | Breadcrumb, cím, kereső, szűrő, rendezés, chip-ek | Mindig olvasható; chip-ek wrap; 44px minden gombon | Kész (wrap, 44px) – csak finomhangolás ha kell |
| **Szűrők (desktop)** | AdvancedFilters | Panel: ár, készlet, kategóriák, törlés/vissza | Alkalmaz/Törlés egyértelmű; ár slider olvasható | 1) Ár slider dupla thumb (min–max) opcionális 2) Aktív szűrő szám badge mindig látszik |
| **Szűrők (mobil)** | BottomSheet + AdvancedFiltersPanel | Ugyanaz a state, sheet | Sheet drag-to-close; Alkalmaz bezár; 44px | 1) Drag handle erősebb vizuál 2) Alkalmaz gomb sticky a sheet alján |
| **Rendezés** | App (chip + dropdown) | Chip-ek + dropdown desktop | Aktív chip kiemelve; mobilön csak chip-ek vagy dropdown, ne dupla | 1) Mobilön dropdown elrejtve, csak chip-ek (már így van) – ellenőrzés |
| **Termék grid** | product-grid (CSS) + EnhancedProductCard | Reszponzív oszlopok, skeleton | Skeleton → kártya sima átmenet; üres/load more egyértelmű | 1) Load more gomb 44px, középen 2) Üres state: illusztráció + CTA |
| **Kategória oldal** | CategoryPage | Hero, breadcrumb, grid | Hero kép + overlay konzisztens; grid ugyanaz a logika mint fő lista | 1) Szűrő/rendezés chip ugyanaz a komponens/logika 2) Tablet 2–3 oszlop |

---

### 5. Termék – kártya, előnézet, modál
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Termék kártya** | EnhancedProductCard | Kép, badge, wishlist, ár, hover | Hover második kép; Kosárba/Gyorsnézet látható; 44px ikonok | 1) Hover 2. kép fade (már van?) 2) Gyorsnézet gomb desktopön hover overlay |
| **Gyors előnézet** | ProductQuickPeek | Modal, kép, ár, kosár (quickPeekProduct) | Ha használjuk: ugyanaz a minőség mint a modál; bezárás Esc, fókusz | 1) quickPeekProduct használatának ellenőrzése (jelenleg csak null?) 2) Ha nem használt: vagy eltávolítás vagy összekötés selectedProduct-tal |
| **Termék modál** | ProductModal | Képek, infó, AI tipp, Kosárba + Megveszem sticky | Sticky Kosárba mindig látható; képek galéria; 44px | Kész (sticky Kosárba) – további: 1) ImageGallery swipe mobilon 2) Paraméterek/leírás olvasható tagolás |
| **Hasonló / Complete the look** | SimilarProducts, CompleteTheLook | Modál alatt, ajánlások | Kártyák kattinthatók, nem duplikált scroll | 1) Same card component 2) Max height + scroll ha sok |
| **Sticky add to cart** | StickyAddToCart, StickyAddToCartMobile | Viewport alapján (modal), kosár/wishlist | Csak akkor jelenik meg, ha a termék „kigörgetve”; mobilön quantity + CTA | 1) StickyAddToCartMobile csak akkor ha modál látható (ugyanaz a logika?) |

---

### 6. Kosár és fizetés
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Floating cart** | FloatingCartPreview | Kosár összeg, eltávolítás, checkout link | Mindig elérhető; ajánlott termékek relevánsak; 44px | 1) Pozíció: ne takarja a tartalmat 2) Checkout gomb primary, egyértelmű |
| **Ingyenes szállítás** | FreeShippingProgress | Progress bar küszöbhöz | Látványos de nem túl nagy; „ még X Ft” üzenet | 1) Színes progress (primary) 2) Üzenet rövid |
| **One-Click Checkout** | OneClickCheckout | Demo adatok, CTA | Ha nincs valós integráció: „Folytatás a webshopban” egyértelmű; 44px | 1) CTA szöveg konzisztens 2) Adatlap csak ha kell |

---

### 7. Trust és lojalitás
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Trust badges** | TrustBadges | Ikonok, rövid szöveg | Nem túl sok; egy sor desktop, wrap mobil | 1) Max 4–5 badge 2) Egységes ikon méret |
| **Social proof** | LiveSocialProof, SocialProof | Értesítések, értékelések | Nem túl gyakori; nem takarja a CTA-t | 1) Rate limit (pl. max 1 / 30 mp) 2) Pozíció fix, nem fedi a gombokat |
| **Értékelések** | PhotoReviews (ha használt) | Fotós review | Ha nincs adat: placeholder vagy elrejtés | 1) Üres state 2) Ha van adat: grid 44px tap |
| **Loyalty** | LoyaltyProgram | Pontok, szint, jutalom | Egyértelmű „mi a következő szint”; CTA | 1) Progress bar a következő szinthez 2) CTA: „Nézd a jutalmakat” |

---

### 8. AI funkciók
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **AI showcase / bemutató** | AIShowcase, AIFeaturesShowcase | Kártyák, linkek a funkciókhoz | Minden kártya egyértelmű; kattintás → a megfelelő tab/modal nyílik | 1) Hover/focus 2) Loading state ha lazy |
| **Chat** | AIChatAssistant | Lazy, üzenetek, termék ajánlás | Első üzenet barát; „Nincs eredmény” kezelés; nem tölti le feleslegesen | 1) Üres state: példa kérdések 2) Hiba: „Próbáld később” + Újra |
| **Stílus quiz** | AIStyleQuiz | Lazy, kérdések, ajánlások | Kérdések vizuálisan tetszetősek; eredmény grid kattintható | 1) Eredmény: „Nincs ajánlás” + CTA 2) 44px válasz gombok |
| **Szobatervező** | AIRoomDesigner | Lazy, fotó feltöltés, AI ajánlás | Feltöltés progress; eredmény egyértelmű; hiba: Újra | 1) Upload state 2) No result / hiba CTA |
| **Képkereső** | VisualSearch (App) | Tab, feltöltés | Ugyanaz mint szobatervező: progress, eredmény, hiba | 1) Konzisztens UI a többi AI tabbal |

---

### 9. UX ragasztó
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Scroll progress** | ScrollProgress | Vonal tetejen | Vékony, primary szín; nem túl feltűnő | 1) 2–3px magas 2) reduced-motion: opacity 0 |
| **Back to top** | BackToTop | Gomb jobb alul | Csak akkor látszik, ha görgetve; 44px; nem takar tartalmat | 1) Megjelenés küszöb (pl. 400px) 2) Pozíció safe area |
| **Toast** | ToastProvider | Értesítések | Rövid szöveg; auto dismiss; nem halmozódik | 1) Max 1–2 egyszerre 2) Pozíció konzisztens |
| **Üres állapotok** | NoSearchResults, NoFilterResults, ErrorState | Ikon + szöveg + CTA | Mindenhol 44px CTA; üzenet egy mondat | 1) CTA gomb min-h-[44px] 2) Üzenet max 2 sor |
| **Skeleton** | ProductGridSkeleton, CategorySkeleton | Shimmer | Grid konzisztens a valódi listával | 1) Ugyanannyi oszlop 2) Shimmer nem túl gyors |

---

### 10. Marketing és popup
| Szekció | Komponens | Jelenlegi | Wow cél | Következő lépések |
|--------|------------|-----------|---------|-------------------|
| **Exit intent** | ExitIntentPopup | Kedvezmény, bezárás | Csak desktop; ne legyen bosszantó; X 44px | 1) 1×/session 2) Bezárás aria-label |
| **Newsletter** | SmartNewsletterPopup | Feliratkozás | Késleltetett megjelenés; könnyen bezárható; form 44px | 1) Dismiss 2) Success state |
| **Personalized section** | PersonalizedSection | Neked, Recently viewed, Trending | Címek egyértelműek; kártyák ugyanaz a komponens | 1) Section heading + link „Összes” ha van 2) Üres: ne jelenjen meg vagy placeholder |

---

## Használat

- **Sorra haladni:** Mindig egy szekciót válassz (pl. „1. Hero”), ha kész a wow szinten, pipáld és menj a következőre.
- **Desktop + tablet + mobil:** Minden lépésnél ellenőrizd a három nézetet (lásd [TOVABBI-FEJLESZTESEK.md](TOVABBI-FEJLESZTESEK.md)).
- **Pipálás:** A dokumentumban kész elemeket jelöld (pl. `[x]` a táblázatban vagy rövid „Kész” megjegyzés).

Ha egy szekció „wow” szinten van, a következőre léphetsz; így fokozatosan érheted el a teljes élményt.
