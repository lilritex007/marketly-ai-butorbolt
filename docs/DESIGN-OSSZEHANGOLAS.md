# Teljes dizájn összehangolás – Marketly AI Bútorbolt

**Cél:** A minden idők legszebb és legátláthatóbb webshopja. A szekciók **erőteljesen elkülönülnek** egymástól (egyértelmű identitás, légzés), de **egy egységes egészt** alkotnak (közös nyelv, ritmus, brand).

Frissítve: 2025.

---

## 1. Alapelvek

### 1.1 Egységes egész
- **Egy színpaletta:** primary (narancs), secondary (teal), semleges szürkék – minden szekció ebből merít.
- **Egy tipográfia skála:** `--text-tiny` … `--text-display` (index.css); mobilön minimum 14px body.
- **Egy ritmus:** section padding skála (`section-padding` / `py-*`), max-width `max-w-[2000px]`, horizontális padding `px-4 sm:px-6 lg:px-10 xl:px-16`.
- **Egy komponensnyelv:** gombok (primary CTA vs. secondary), kártyák, fejléc stílus konzisztens minden nézetben.

### 1.2 Erőteljes szekció-identitás
- **Légzés:** Szekciók között **érzékelhető tér** – nagyobb padding (py-10 … py-20), esetleg elválasztó vonal vagy enyhe háttérváltás.
- **Egyértelmű határ:** Minden szekciónak legyen világos „eleje” és „vége” – háttérszín, keret, vagy section-frame (fehér doboz).
- **Szekciótípusok:** Hero | Strip (vékony, egy sor) | Feature block (section-world + section-frame) | Content (terméklista, grid) | CTA (gradient, full-width). Egy szekció = egy típus.
- **Akcentusz színek:** Szekciónként 1–2 akcent (pl. Újdonságok → primary/indigo, Kedvencek → rose, Népszerű → amber) – a `section-world--*` és `section-header-hero--*` osztályokkal.

---

## 2. Szekció típusok és szabályok

| Típus | Példa | Háttér / elválasztás | Belső tartalom |
|--------|--------|----------------------|----------------|
| **Hero** | ModernHero | Gradient (primary–secondary), full viewport height opció | Középre igazított, nagy cím, CTA gombok |
| **Strip** | TrustStrip, BannerStrip, NewsletterStrip | Egyszerű (fehér vagy egy szín), border-top/bottom | Egy sor, kis padding (py-3–py-6), max-width + px-* |
| **Feature block** | NewArrivals, MostPopular, LiveShowcase, Personalized | `section-shell` + `section-world section-world--{név}` (radial gradient overlay) | Belső `section-frame` (fehér, kerek sarkú doboz, árnyék) |
| **Content** | Terméklista (#products-section), CategoryPage | Semleges (fehér / gray-50), `section-padding` | Sticky fejléc + grid, nincs frame |
| **Inspiration / grid** | InspirationSection | Enyhe gradient (from-gray-50 to-white), border-t | Középen cím, alatta kártya grid |
| **CTA** | InteractiveCTA | Erős gradient (primary → secondary → pink), full-width | Középre igazított szöveg + gombok |

### 2.1 Légzés (section gap)
- Strip után: normál flow (nincs extra gap).
- Feature block előtt/után: **nagyobb légzés** – `py-10 sm:py-12 lg:py-16` a section-en, vagy wrapper `section-gap` (lásd index.css).
- Content (terméklista) előtt: elég padding, hogy a fejléc ne tapadjon a fenti szekcióhoz.

### 2.2 Elválasztás szekciók között
- **1. lehetőség:** Csak tér (nagyobb padding) – tiszta, levegős.
- **2. lehetőség:** Enyhe vonal – `border-t border-gray-100` vagy `border-t-2 border-gray-100` (pl. TrustStrip).
- **3. lehetőség:** Háttérváltás – pl. fehér → gray-50 → fehér (alternáló `bg-white` / `bg-gray-50`).
- **Ne:** túl sok egyidejű vonal + árnyék + háttérváltás – egy szekció határán legyen max. 1–2 elválasztó elem.

---

## 3. Konzisztens elemek (mindig ugyanúgy)

- **Container:** `w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16`.
- **Section padding skála:** `section-padding` (responsive) vagy Tailwind `py-8 sm:py-10 lg:py-14 xl:py-16` (feature blockokhoz).
- **Címek:** `SectionHeader` komponens, vagy közös osztályok: `section-title`, `lux-title`, `section-subtitle`, `lux-subtitle`.
- **Primary CTA gomb:** `bg-gradient-to-r from-primary-500 to-secondary-700` (vagy solid primary), `rounded-xl`, `min-h-[44px]`, hover: árnyék/translate.
- **Secondary gomb:** `bg-white border-2 border-gray-200`, hover: `border-primary-300`.
- **Touch:** Kattintható elemek min. 44×44 px; ikon-only gomboknál `aria-label`.

---

## 4. Színek és akcentok szekciónként

- **Globális:** primary (#ff8a00), secondary (#006b6f) – mindenhol ugyanaz.
- **Szekció-specifikus overlay (section-world--*):** csak enyhe, átlátszó gradient (pl. amber/indigo/rose) – ne domináljon, csak „hangulat”.
- **Strip-ek:** Semleges (fehér, gray-100 border) vagy egyetlen brand szín (pl. primary-50 háttér).

---

## 5. Ellenőrzőlista új vagy átdolgozott szekcióhoz

- [ ] Egyértelműen egy típus (Hero / Strip / Feature block / Content / CTA)?
- [ ] Container: `max-w-[2000px]` + `px-4 sm:px-6 lg:px-10 xl:px-16`?
- [ ] Felső/alsó légzés megfelelő (strip kicsi, feature block nagy)?
- [ ] Elválasztás az előző/kovetkező szekciótól: tér / vonal / háttérváltás – max. 1–2 eszköz?
- [ ] Címek és gombok a közös stílusnak megfelelnek?
- [ ] Mobil + tablet + desktop: olvasható, 44px touch target a gombokon?

---

## 6. Élő ellenőrzés (nem localhost)

A dizájnt **élőben** nézzük: **https://www.marketly.hu/butorbolt**

### Frissítés élesre
1. **Build:** `npm run build` → frissül `dist/assets/index.js`, `index.css`, `version.json`.
2. **Push:** `git add -A` → `git commit -m "..."` → `git push origin main`.
3. A CDN (jsDelivr) a repóból szolgálja a dist-et; a loader a `version.json` alapján tölti az új CSS/JS-t.
4. **Ellenőrzés:** Nyisd meg https://www.marketly.hu/butorbolt (ha kell, hard refresh: Ctrl+Shift+R vagy ?v=timestamp a loader script src-ben az UNAS adminban).

Részletek: **deployment/DEPLOY-UNAS.md**.

---

## 7. Kapcsolódó dokumentumok

- **TOVABBI-FEJLESZTESEK.md** – breakpointok, 3 nézet, design konzisztencia (4.3).
- **FRONTEND-PLAN.md** – prioritások, képernyők.
- **deployment/DEPLOY-UNAS.md** – build, push, script src.
- **index.css** – `--section-gap-*`, `.section-shell`, `.section-world`, `.section-frame`, `.section-padding`.

Ha új szekciót vagy teljes redesignot csinálsz, ezt a docot érdemes frissíteni (pl. új típus, új akcent szín).
