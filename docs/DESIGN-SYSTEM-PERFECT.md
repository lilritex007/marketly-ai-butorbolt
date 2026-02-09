# Tökéletes Design System – Marketly AI Bútorbolt

A minden idők legszebb, legátláthatóbb webshopja. Egyszerű, letisztult, prémium.

---

## Filozófia

**Egy szabály:** Kevesebb, de tökéletes.

- **Tisztaság:** Nincs vizuális zaj. Minden elemnek világos szerepe van.
- **Légzés:** Bőséges whitespace. A szekciók "lélegeznek".
- **Hierarchia:** 3 szint: elsődleges (hová nézz), másodlagos (kontextus), harmadlagos (metaadat).
- **Konzisztencia:** Egy gombstílus, egy kártyastílus, egy ritmus – mindenhol.
- **Sebesség:** Azonnali visszajelzés, sima átmenetek, nincs késleltetés érzet.
- **Bizalom:** Professzionális, nem "túldizájnolt". Egyszerű = prémium.

---

## 1. Alapok (Foundation)

### 1.1 Színpaletta

**Egyszerűsített paletta – csak ami kell:**

```
Primary (CTA, aktív állapot): #FF8A00 (narancs)
  - Használat: gombok, linkek, aktív tab, fókusz
  - Hover: #EA7600 (sötétebb narancs)

Secondary (akcent, supporting): #006B6F (teal)
  - Használat: secondary CTA, badge, supporting ikon
  - Hover: #005A5D

Neutral (tartalom, háttér):
  - Gray 900: #111827 (címek, fontos szöveg)
  - Gray 700: #374151 (body text)
  - Gray 500: #6B7280 (secondary text)
  - Gray 300: #D1D5DB (border, divider)
  - Gray 100: #F3F4F6 (háttér, kártya)
  - Gray 50: #F9FAFB (section háttér)
  - White: #FFFFFF (főháttér)

Feedback (állapot jelzés):
  - Success: #10B981 (zöld)
  - Warning: #F59E0B (sárga)
  - Error: #EF4444 (piros)
  - Info: #3B82F6 (kék)
```

**Szabály:** Egy szekcióban max 2-3 szín (neutral + 1 akcent).

### 1.2 Tipográfia

**Egy fontcsalád, világos hierarchia:**

```
Font: Inter (system fallback: -apple-system, sans-serif)

Hero (főcím):
  - Desktop: 4rem (64px), bold (700), tracking -0.02em, leading 1.1
  - Mobile: 2.5rem (40px)

H1 (section címek):
  - Desktop: 2.5rem (40px), bold (700), tracking -0.01em
  - Mobile: 1.75rem (28px)

H2 (subsection címek):
  - Desktop: 1.5rem (24px), semibold (600)
  - Mobile: 1.25rem (20px)

Body Large (intro text):
  - 1.125rem (18px), regular (400), leading 1.6

Body (normál szöveg):
  - 1rem (16px), regular (400), leading 1.5

Body Small (metadata):
  - 0.875rem (14px), regular (400), leading 1.5

Caption (label, badge):
  - 0.75rem (12px), medium (500), uppercase, tracking 0.05em
```

**Szabály:** Egy szekcióban max 3 méret (pl. H1 + Body + Caption).

### 1.3 Spacing (Ritmus)

**8px alapegység, exponenciális skála:**

```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
4xl: 96px  (6rem)
```

**Section padding (függőleges tér):**
```
Mobile:  py-12 (3rem / 48px)
Desktop: py-20 (5rem / 80px)
```

**Container (horizontális tér):**
```
Mobile:  px-4  (1rem / 16px)
Desktop: px-16 (4rem / 64px)
Max-width: 1400px (ne legyen túl széles)
```

**Section gap (szekciók között):**
```
Default: 4rem (64px) - használd ritkán, a section padding elég
Large:   6rem (96px) - nagy blokkok után (pl. hero után)
```

### 1.4 Border & Shadow

**Minimalista, finom:**

```
Border radius:
  - sm: 8px   (input, kis badge)
  - md: 12px  (button, chip)
  - lg: 16px  (card)
  - xl: 24px  (modal, section frame)

Border:
  - Default: 1px solid #E5E7EB (gray-200)
  - Hover:   1px solid #FF8A00 (primary)

Shadow (elevation):
  - sm:  0 1px 2px rgba(0,0,0,0.04)
  - md:  0 4px 12px rgba(0,0,0,0.06)
  - lg:  0 8px 24px rgba(0,0,0,0.08)
  - xl:  0 12px 40px rgba(0,0,0,0.10)
```

**Szabály:** Kártyán 1 shadow, hover +1 szint (sm→md, md→lg).

### 1.5 Transitions & Animations

**Gyors, sima, nem tolakodó:**

```
Default: 200ms ease-out (gomb, link, hover)
Slow:    300ms ease-out (modal, drawer nyitás/zárás)

Easing:
  - ease-out: legtöbb interakció
  - ease-in-out: modal, drawer

Motion:
  - Hover: scale(1.02), translateY(-2px) – finom
  - Active: scale(0.98) – feedback
  - Fade in: opacity 0→1 + translateY(8px)→0
```

**Szabály:** Minden animáció `prefers-reduced-motion: reduce` esetén ki.

---

## 2. Komponensek

### 2.1 Gombok

**Primary CTA (fő művelet):**
```
Méret: px-8 py-4 (desktop), px-6 py-3 (mobile)
Min-height: 48px (touch target)
Font: 1rem (16px), semibold (600)
Color: bg-primary-500, text-white
Radius: rounded-xl (12px)
Shadow: md, hover: lg
Hover: bg-primary-600, translateY(-2px)
Active: scale(0.98)
```

**Secondary (alternatív művelet):**
```
Ugyanaz, de:
Color: bg-white, text-gray-900, border-2 border-gray-200
Hover: border-primary-300, shadow-md
```

**Text/Link (kiegészítő művelet):**
```
Font: 1rem, medium (500)
Color: text-primary-600, underline on hover
Icon: ArrowRight 16px
```

**Szabály:** Egy képernyőn max 1 primary CTA (világos prioritás).

### 2.2 Kártyák

**Product Card (termék kártya):**
```
Layout: kép (4:3 aspect ratio) + tartalom (16px padding)
Border: 1px gray-200
Radius: rounded-lg (16px)
Shadow: sm, hover: md + translateY(-2px)
Hover: border-primary-200
Image: object-cover, lazy load, placeholder
Price: 1.25rem bold, primary-600
Title: 1rem, gray-900, 2 line clamp
```

**Feature Card (funkció kártya):**
```
Layout: ikon (48x48 rounded-xl) + cím + leírás
Padding: p-6
Border: 1px gray-100
Radius: rounded-xl (24px)
Background: white or gray-50
Hover: border-primary-100, shadow-lg
```

**Section Frame (kiemelt szekció):**
```
Background: white/90 backdrop-blur
Border: 1px gray-100
Radius: rounded-2xl (32px)
Shadow: lg
Padding: p-8 (desktop), p-5 (mobile)
```

**Szabály:** Egy kártyán 1 árnyék, 1 border.

### 2.3 Input & Form

**Text Input:**
```
Padding: px-4 py-3
Border: 1px gray-300
Radius: rounded-lg (12px)
Font: 1rem, gray-900
Placeholder: gray-400
Focus: border-primary-500, ring-2 ring-primary-200
```

**Dropdown:**
```
Trigger: ugyanaz mint input
Menu: shadow-xl, rounded-lg, max-h-60, scroll
Item: px-4 py-2, hover: bg-gray-50
```

**Checkbox/Radio:**
```
Size: 20x20px (touch target 44x44)
Border: 2px gray-300
Checked: bg-primary-500, white checkmark
```

**Szabály:** Minden input 44px min-height (touch).

### 2.4 Badge & Chip

**Badge (label, státusz):**
```
Padding: px-2.5 py-1
Font: 0.75rem, medium (500), uppercase
Radius: rounded-full
Colors:
  - Primary: bg-primary-50, text-primary-700
  - Success: bg-green-50, text-green-700
  - Warning: bg-amber-50, text-amber-700
```

**Chip (removable filter):**
```
Padding: px-3 py-1.5, gap-2
Font: 0.875rem, medium
Radius: rounded-full
Border: 1px gray-200
Hover: border-primary-300
X button: 16x16 icon, hover: bg-gray-100
```

### 2.5 Modal & Drawer

**Modal (desktop):**
```
Backdrop: bg-black/40, backdrop-blur-sm
Container: max-w-2xl, rounded-2xl, shadow-2xl
Padding: p-8
Close: top-4 right-4, 44x44px touch target
Animation: fade + scale(0.95)→scale(1)
```

**Drawer (mobile):**
```
Position: right/bottom
Width: full or 90%
Radius: top rounded-2xl
Handle: 32x4px pill, center, gray-300
Swipe-to-close: threshold 40%
```

**Szabály:** Escape zár, fókusz csapda (Tab kezelés).

---

## 3. Szekciók (Patterns)

### 3.1 Hero

**Layout:**
```
Min-height: 80vh (ne legyen teljes screen, hagyj levegőt)
Background: soft gradient (primary-50 → white) + subtle mesh
Content: center aligned, max-w-4xl
Badge: inline pill, "AI-powered" + icon
Headline: 1 sor impact ("Találd meg..."), 1 sor gradient akcent ("AI segítséggel")
Subhead: 1 mondat, max-w-2xl
CTA: 2 gomb (primary + secondary), horizontal on desktop
Stats: 4 card, 2x2 grid on mobile, 1x4 on desktop
```

**Spacing:**
```
Badge → Headline: mb-8
Headline → Subhead: mb-10
Subhead → CTA: mb-12
CTA → Stats: mt-16
```

### 3.2 Strip (Trust, Newsletter, stb.)

**Layout:**
```
1 sor, center aligned, flex wrap
Padding: py-4 (vékony!)
Background: white, border-y gray-100
Icons: 40x40 rounded-xl, in colored bg
Text: 0.875rem, medium
```

**Szabály:** Strip = vékony, gyors átnézés. Ne legyen túl nagy.

### 3.3 Feature Block (NewArrivals, AI showcase, stb.)

**Layout:**
```
Section wrapper: py-20
Container: max-w-1400px, px-16
Header: cím + leírás, center or left aligned
Cards grid: 3 col desktop, 1 col mobile, gap-6
Each card: feature card style (lásd 2.2)
```

**Section world overlay (opcionális):**
```
Radial gradient overlay (primary/secondary/rose), opacity 0.08
Section frame (white backdrop-blur kártya) a tartalomnak
```

### 3.4 Product Grid

**Layout:**
```
Sticky header: breadcrumb + count + search + filters
Grid: 4 col desktop, 2 col tablet, 1 col mobile
Gap: gap-5 (20px)
Infinite scroll OR "Load more" button
```

**Empty state:**
```
Icon: 64x64, gray-300
Text: "Nincs találat" + CTA
```

### 3.5 CTA Block

**Layout:**
```
Background: gradient (primary → secondary), py-20
Content: center aligned, max-w-3xl
Badge: "Kezdd el ma!" pill
Headline: 2 sor, white + yellow accent
Subhead: 1 mondat, white/90
CTA: 2 gomb (white bg + white/20 bg)
```

---

## 4. Színek használata szekcióként

| Szekció | Háttér | Akcent | Border |
|---------|--------|--------|--------|
| Hero | gray-50 gradient | primary (CTA), secondary (badge) | - |
| TrustStrip | white | primary, emerald, amber (icons) | gray-100 |
| AI Features | white | primary (cards), secondary (icons) | gray-100 |
| Inspiration | gray-50 → white gradient | card gradients (primary, secondary, rose) | gray-100 |
| SocialProof | white | primary (counter), badge colors | gray-100 |
| Features | white | primary, emerald, secondary (icons) | gray-100 |
| Product Grid | white | primary (CTA, active) | gray-200 |
| CTA Block | primary → secondary gradient | white (CTA) | - |

**Szabály:** Fehér és gray-50 váltakozik (levegő, ritmus). Gradient csak hero és CTA-ban.

---

## 5. Reszponzivitás

**Breakpointok:**
```
sm:  640px  (nagy mobil)
md:  768px  (tablet)
lg:  1024px (laptop)
xl:  1280px (desktop)
2xl: 1536px (nagy desktop)
```

**Stratégia:**
1. **Mobile first:** Alap design 375px-re, aztán skálázás felfelé.
2. **Touch target:** Min 44x44px minden kattintható elemen.
3. **Typography:** Kisebb mobilon (1rem → 0.875rem ha kell), nagyobb desktopn.
4. **Grid:** 1 col mobile, 2 col tablet, 3-4 col desktop.
5. **Padding:** Kisebb mobilon (px-4, py-12), nagyobb desktopn (px-16, py-20).

---

## 6. Mikro-interakciók (Delight)

**Subtilis, nem tolakodó:**

1. **Hover feedback:** Button/card hover: lift 2px + shadow +1 level.
2. **Click feedback:** Active scale(0.98) + haptic (mobile).
3. **Loading state:** Skeleton (shimmer, gray-200) vagy spinner (primary-500).
4. **Success feedback:** Toast (green, 3s), checkmark animáció, confetti (opcionális, nagy művelet után).
5. **Error feedback:** Toast (red, 5s), shake animáció, focus az inputra.
6. **Progress:** Linear bar (primary, top-0, 2px) scrollhoz, circular spinner (16px, primary) betöltéshez.

**Szabály:** 1 feedback / művelet. Ne halmozd (toast + modal + konfetti = túl sok).

---

## 7. Akadálymentesség

1. **Fókusz:** Minden interaktív elem: `focus-visible:ring-2 ring-primary-400 ring-offset-2`.
2. **Aria:** `aria-label` ikon gombokon, `aria-labelledby` szekciókon, `aria-live` dinamikus tartalomhoz.
3. **Kontraszt:** WCAG AA (4.5:1 normál szöveg, 3:1 nagy szöveg).
4. **Keyboard:** Tab sorrend logikus, Escape zár modalt, Enter/Space aktivál gombot.
5. **Screen reader:** Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`), skip linkek.

---

## 8. Implementációs prioritás

**Fázis 1 (Most) – Alapok:**
1. Hero redesign (kész ✓)
2. TrustStrip redesign (kész ✓)
3. Button system egységesítés
4. Card system egységesítés
5. Section spacing

**Fázis 2 – Komponensek:**
1. Navbar (desktop + mobile)
2. Product Card
3. Modal & Drawer
4. Form inputs
5. Badge & Chip

**Fázis 3 – Oldalak:**
1. Főoldal (shop tab) – folyamatban
2. Category Page
3. Visual Search tab
4. Room Planner tab
5. Product Modal

**Fázis 4 – Polish:**
1. Mikro-interakciók
2. Loading states
3. Empty states
4. Error states
5. Toast & feedback

---

## 9. Ellenőrzőlista (minden új feature-nél)

- [ ] Követi a színpalettát (primary/secondary/neutral)?
- [ ] Tipográfia: max 3 méret a szekcióban?
- [ ] Spacing: 8px többszöröse?
- [ ] Border & shadow: 1 árnyék, 1 border?
- [ ] Touch target: 44x44px minimum?
- [ ] Hover state: van visszajelzés?
- [ ] Focus state: ring-2 primary?
- [ ] Mobile + desktop: működik mindkettőn?
- [ ] Reduced motion: animáció kikapcsolható?
- [ ] Aria label: van ahol kell?

---

## 10. Inspiráció (referencia)

**Világ legjobb e-commerce oldalai (tanulj tőlük):**
- **Apple:** Tiszta, bőséges whitespace, erős tipográfia, finom animációk.
- **Stripe:** Egyszerű, világos hierarchia, kék akcent, konzisztens.
- **Linear:** Premium feel, finom shadow, gyors transitions.
- **Vercel:** Minimális, fekete-fehér, grid-based, egyértelmű CTA.

**Ne csináld:**
- Túl sok szín egy helyen (max 2-3).
- Túl sok animáció (zavaró, lassú érzet).
- Túl kicsi szöveg mobilon (<14px).
- Túl szoros padding (fülledt, zsúfolt).
- Inkonzisztens gombok (minden gomb más).

---

Ez a **tökéletes design system**. Minden döntés mögött egy elv: **Egyszerű = Prémium**.
