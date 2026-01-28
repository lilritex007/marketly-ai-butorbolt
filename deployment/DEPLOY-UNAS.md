# UNAS éles frissítés – új bundle és host hibák

## Beállítás: HTML + script src (loader.js a CDN-ről)

Az UNAS oldalon ez a HTML és script src van megadva:

- **HTML:** `#root` + `#loading-overlay` (a jelenlegi tartalom megfelelő, nem kell módosítani).
- **Script src:** `https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist/loader.js?v=...`

A **loader.js** a repóban a `public/loader.js` fájl; a build (`npm run build`) másolja a `dist/loader.js`-be. A loader a **version.json** alapján tölti be az **index.js** és **index.css** fájlokat (fix nevek, nincs hash). Ha frissíted a repót (build + push), a CDN kiszolgálja az új loader.js-t és az új index.js/index.css-t; a `?v=...` a script src-ben opcionális (cache-busting).

---

## 1. Új bundle élesre („3 products” + CORS megoldása)

1. **Build lokálisan**
   ```bash
   npm run build
   ```
   Ekkor frissül: `dist/assets/index.js`, `dist/assets/index.css`, `dist/version.json`, és a `public/loader.js` → `dist/loader.js`.

2. **Feltöltés gitre**
   ```bash
   git add -A
   git commit -m "build: loader + index.js, CORS fix"
   git push origin main
   ```
   A CDN (jsDelivr) a repóból szolgálja a `dist/` tartalmát (köztük a friss loader.js és index.js).

3. **UNAS oldal**
   A script src maradhat: `https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist/loader.js`  
   (opcionálisan `?v=buildTime` vagy aktuális szám, ha a böngésző cache-t szeretnéd kerülni a loader.js-re).  
   A loader ezután a version.json alapján tölti be az **index.js** és **index.css** fájlokat; a „3 products” és a products.json CORS hiba a friss kóddal megszűnik.

---

## 2. butorbolt:2591 és butorbolt:2520 (host oldal)

Ezek a hibák **nem** a mi loaderünkből vagy React alkalmazásunkból jönnek. A **butorbolt** oldal HTML-jében (UNAS téma vagy egyedi HTML/script) van egy script, ami:

- **2591:** `IntersectionObserver.observe()`-t hív valamilyen elemre, ami nem `Element` (pl. `null` vagy nem DOM elem).
- **2520:** `addEventListener`-t hív egy `null` elemre.

**Javítás az UNAS oldalon (HTML / téma szerkesztő):**

1. Nyisd meg az UNAS adminban a butorbolt oldal forrását (vagy a sablont, ahol ez a script van).
2. Keresd meg a hibás sort (~2520 és ~2589–2591). Valami ilyesmi lehet:
   - `something.addEventListener(...)` ahol `something` lehet null.
   - Egy `forEach` ciklus, ami minden elemre meghívja az `observer.observe(...)`-t.
3. Adj hozzá ellenőrzést:
   - **addEventListener:** csak akkor hívd, ha az elem létezik:
     ```js
     if (element != null && typeof element.addEventListener === 'function') {
       element.addEventListener('...', ...);
     }
     ```
   - **observe:** csak akkor hívd, ha az elem DOM elem:
     ```js
     if (element && element.nodeType === 1) {
       observer.observe(element);
     }
     ```
     vagy: `if (element instanceof Element) { observer.observe(element); }`

Ezt a scriptet mi nem tudjuk módosítani a repóból, mert az UNAS által kiszolgált HTML része.
