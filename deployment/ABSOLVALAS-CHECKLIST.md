# Hibák abszolválása – checklist

Rövid checklist, hogy a konzol hibák meglegyenek javítva és tovább lehessen lépni.

---

## Kód (már megvan)

- [x] **onQuickView / stopPropagation** – `App.jsx`: `onQuickView={handleProductView}`; `EnhancedProductCard`: minden kattintásnál `e.stopPropagation()` + `onQuickView(product)`.
- [x] **via.placeholder** – Mindenhol `PLACEHOLDER_IMAGE` (data URL) a `utils/helpers.js`-ből; nincs külső kép URL.
- [x] **Loader** – `public/loader.js` → version.json + `assets/index.js` / `index.css`; build után `dist/loader.js`.

---

## Teendők (egy alkalommal)

### 1. Build + push (friss bundle és loader)

```bash
npm run build
git add -A
git commit -m "fix: placeholder, stopPropagation, deploy checklist"
git push origin main
```

Ezután a CDN (jsDelivr) kiszolgálja a friss `dist/loader.js`, `dist/assets/index.js`, `dist/version.json` fájlokat.

### 2. UNAS – script src

Az UNAS butorbolt oldalán a betöltő script legyen:

```
https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist/loader.js
```

Opcionális: `?v=1234567890` (timestamp) a cache elkerüléséhez.  
Részletek: **DEPLOY-UNAS.md**.

### 3. UNAS – butorbolt oldal script hibák (2591, 2520)

A **butorbolt** oldal HTML-jében lévő script (UNAS téma / egyedi HTML) okozza a hibákat. Javítás az UNAS adminban, a butorbolt oldal forrásában:

- **addEventListener** – csak akkor hívd, ha az elem nem null: `if (elem != null && typeof elem.addEventListener === 'function') { ... }`
- **IntersectionObserver.observe** – csak Elementre: `if (el && el.nodeType === 1) observer.observe(el);`

Bemásolható snippet: **UNAS-host-oldal-javitas.md**.

### 4. Cache + ellenőrzés

- Böngésző: cache törlése vagy inkognító ablak.
- Éles oldal: loader log „Loading React bundle (version.json)” stb.; nincs „3 products”, nincs CORS products.json, nincs `stopPropagation` hiba, nincs via.placeholder hiba.
- butorbolt:2591 / 2520 csak az UNAS host oldal javításával tűnik el.

---

## Összefoglaló

| Hiba | Hol javítva |
|------|----------------|
| `stopPropagation is not a function` | Kód: App.jsx + EnhancedProductCard.jsx |
| via.placeholder / ERR_NAME_NOT_RESOLVED | Kód: PLACEHOLDER_IMAGE mindenhol |
| Régi bundle, „3 products”, CORS | Build + push + UNAS script src = loader.js |
| butorbolt:2591, butorbolt:2520 | UNAS admin: butorbolt oldal HTML/script (UNAS-host-oldal-javitas.md) |

Ha ezek megvannak, a hibák abszolválhatók és tovább lehet lépni más fejlesztésekre.
