# További fejlesztések – desktop, tablet, mobil egyszerre

Minden új vagy módosított funkciót **egyszerre** kell gondolni és tesztelni **desktop**, **tablet** és **mobil** nézetben. Ez a dokumentum a szabályt és a konkrét következő lépéseket rögzíti.

---

## 1. Breakpoint stratégia (egy helyen)

| Nézet    | Szélesség        | Tailwind      | Megjegyzés |
|----------|------------------|---------------|------------|
| Mobil    | &lt; 768px       | (alap), `sm:`, `md:` (hide) | Touch-first, egy oszlop / swipe, bottom sheet |
| Tablet   | 768px – 1023px   | `md:`, `lg:` (hide) | Átmenet: lehet még hamburger VAGY teljes nav; 2–3 oszlop |
| Desktop  | ≥ 1024px         | `lg:`, `xl:`, `2xl:` | Teljes nav, mega menu, több oszlop, hover |

- **xs: 375px** (tailwind.config) – kis mobil; használat: pl. `xs:` ha külön kezelni kell.
- Új komponensnél mindig adj **legalább mobil + desktop** variánst; tabletnél döntés: mobil-szerű vagy desktop-szerű (pl. nav: `md:hidden` hamburger → tablet is hamburger).

---

## 2. Szabály: minden fejlesztésnél 3 nézet

- **Mobil:** Böngésző DevTools, 375px és 414px; touch target min. 44px; nincs hover, csak tap.
- **Tablet:** 768px és 1024px; ellenőrizni: menü (hamburger vs. teljes), táblázatok, szűrők, termék grid (2–3 oszlop).
- **Desktop:** 1280px, 1536px; hover állapotok, mega menu, több oszlop.

Ha valami csak „desktopra” vagy csak „mobilra” készül, **konzultációnként** dönteni: kell-e tablet/mobil/desktop variáns is, vagy szándékosan csak egy nézet.

---

## 3. Touch és akadálymentesség

- Kattintható elemek: **min. 44×44 px** (index.css: `--touch-target: 44px`); használj `min-h-[44px]` / `min-w-[44px]` a gombokon.
- Fókusz látható: `focus:ring-2 focus:ring-primary-100 focus:border-primary-500` (vagy hasonló).
- Ikon-only gombok: `aria-label` kötelező (pl. „Szűrők”, „Kosár”, „Kedvencek”).

---

## 4. Konkrét további fejlesztések (prioritás szerint)

### 4.1 Minden nézetre kiterjedően

- **Navbar tablet:** 768–1024 px között a menü jelenleg hamburger (`md:hidden` a hamburger). Ha a tabletön is teljes menüt szeretnél: új breakpoint (pl. `lg:hidden` hamburger) vagy „tablet” nav variáns.
- **Termék lista fejléc (sticky):** Kész. Rendezés + szűrő chip sor wrap (`gap-y-3`), mobilön 44px touch target a chip X gombokon, rendezés sor `w-full sm:w-auto` hogy mobilön új sorba kerüljön.
- **ProductModal:** Kész. Sticky „Kosárba” + „Megveszem a webshopban” sáv a modál alján, 44px min magasság, mobilön egymás alatt (`flex-col`), 375px felett egymás mellett (`xs:flex-row`); Kosárba disabled ha nincs készlet.
- **Kereső (SmartSearchBar):** Tabletön a kereső mező és a dropdown méretének illeszkedése (pl. `md:w-80 lg:w-96`).
- **CategoryPage:** Kategória hero és termék grid tabletön (md/lg) 2–3 oszlop; szűrő/rendezés ugyanaz a chip/dropdown logika mint a fő listán.

### 4.2 Üres és hiba állapotok

- **NoSearchResults / NoFilterResults:** Mobil és tabletön is jól olvasható, CTA gomb 44px magas.
- **API hiba (EmptyState + Újrapróbálás):** Központosítás, padding, gomb méret minden nézetben.

### 4.3 Design konzisztencia

- Tipográfia: index.css `--text-*` és Tailwind override; **mobilön ne legyen túl kicsi** (pl. min. 14px body).
- Szekciók padding: `section-padding` és `px-4 sm:px-6 lg:px-10 xl:px-16` minden új szekciónál.
- Gombok: primary CTA egy stílus (pl. `bg-primary-500 hover:bg-primary-600`), másodlagos (border) egy stílus; minden nézetben ugyanaz.

### 4.4 Teljesítmény és UX

- **Lazy load képek:** Termék kártyán már van; listán viewport közelében (pl. rootMargin) töltődjön.
- **Swipe (CategorySwipe, mobil kategóriák):** Touch swipe ne akadjon; `-webkit-overflow-scrolling: touch`, overflow-x.
- **Bottom sheet (szűrő, wishlist):** Csak mobilon/tableton (`md:hidden`); desktopön dropdown/panel.

---

## 5. Ellenőrzőlista új funkcióhoz

- [ ] Mobil (375px, 414px): látható, kattintható, nincs overflow?
- [ ] Tablet (768px, 1024px): menü és lista/szűrő értelmes?
- [ ] Desktop (1280px+): hover és fókusz megfelelő?
- [ ] Touch target ≥ 44px; ikon gomboknál aria-label?
- [ ] Üres/hiba állapot minden nézetben?

---

Ha új fejlesztést csinálsz, ezt a docot érdemes frissíteni (pl. „4.1 Navbar tablet – kész” vagy új pont hozzáadása).
