# Részletes teendőlista – további lépések

Az alábbi lépéseket **sorrendben** érdemes végigcsinálni. Mindegyik konkrét, végrehajtható teendő.

---

## 1. Railway – adatbázis perzisztencia (kritikus)

A backend SQLite-ot használ (`data/products.db`). Railway-en a fájlrendszer **ephemeral**: új deploy vagy restart után a lemez törlődik, az adatbázis **elveszne**.

### Teendő

1. Nyisd meg a **Railway** projektet (ahol a backend fut).
2. **Volume csatolása** (nem külön „Add Volume” menüpont!):
   - A **projekt canvas**-on keresd meg a **backend szolgáltatás** kártyáját (az, ami a Node/Express appot futtatja).
   - **Kattints jobb gombbal a szolgáltatás kártyájára** (vagy a kártya **…** menüjére) → válaszd: **Attach Volume**.
   - Ha nem látod az „Attach Volume” opciót, próbáld a **Command Palette**-t: **Ctrl+K** (Win) / **Cmd+K** (Mac) → gépeld be: „volume” vagy „attach volume”.
3. A volume létrehozásakor:
   - **Mount path**: `/app/data` (a kód a `data/products.db`-t használja, Nixpacks az appot `/app`-ba teszi, ezért a volume path: `/app/data`).
   - Méret: pl. 1–5 GB (Hobby: max 5 GB/volume).
   - Nevezd el pl. `marketly-data` → mentés.
4. **Redeploy** a backendet (új deploy indítása), hogy a volume mount érvénybe lépjen.
5. **Ellenőrzés**: első futáskor a sync feltölti a termékeket a DB-be; a következő deploy/restart után a termékeknek meg kell maradniuk (mert a `data` mappa a volume-on van).

**Ha nem adsz hozzá volume-ot**, minden deploy/restart után üres DB-ből indul a szerver, és a syncnek újra le kell húznia az összes terméket.

### Ha a Volume létrehozása nem megy (hibaelhárítás)

A Railway néha **nem engedi** a volume létrehozását. Gyakori okok és megoldások:

1. **EU West / Metal régió – „nem enged volume-ot”**  
   Az **EU West (Amsterdam)** régió sokszor **Metal** infrastruktúra; a Metal régiókban a volume csak akkor érhető el, ha be van kapcsolva a **Metal Volumes** flag.  
   - **Megoldás (ajánlott)**: Nyisd meg: **https://railway.com/account/feature-flags** → kapcsold **BE** a **„Metal Volumes”** (vagy „Volumes on Metal”) opciót. Mentés után próbáld újra: **jobb klikk a backend szolgáltatáson** → **Attach Volume**.  
   - **Alternatíva**: Ha a flag bekapcsolása után sem működik, váltsd a szolgáltatás régióját **nem-Metal** régióra (pl. **US West**), ahol a volume rége óta támogatott, majd ott csatolj volume-t.

2. **Hol jön létre a volume?**  
   - **Nem** a főmenü „Add” → „Volume” (ilyen nincs).  
   - **Igen**: **jobb klikk a backend (compute) szolgáltatás kártyáján** → **Attach Volume**.  
   - Vagy **Ctrl+K** / **Cmd+K** → „volume” vagy „attach volume” → válaszd a backend szolgáltatást, mount path: `/app/data`.

3. **Free trial / Hobby**  
   - Free trial alatt a volume **500 MB**-ra korlátozott; Hobby: max **10 volume/projekt**, **5 GB/volume**. Ha „limit” hibát kapsz, ellenőrizd a tervet.  
   - Egyes fiókoknál a volume csak **Hobby/Pro** tervvel érhető el – ha még trial-on vagy, érdemes **Hobby**-ra váltani.

4. **„Can’t add volume” / nincs Attach Volume**  
   - Ellenőrizd: **feature flags** (Metal Volumes) be van-e kapcsolva; **régió**: próbálj US West-et, ha EU West nem enged.  
   - Ha semmi nem segít: **új projekt** létrehozása → backend ott deploy → ott **jobb klikk a service** → **Attach Volume** (néha a régi projekt korlátja miatt nem jelenik meg).

### Ha egyelőre nem tudsz volume-t létrehozni (alternatíva)

**A shop így is tud működni volume nélkül.**  
- Minden **deploy/restart** után az adatbázis üresen indul.  
- A backend indulásakor **2 másodperc múlva** elindul egy **kezdeti sync** (UNAS → DB).  
- Az első **GET /api/products** (pl. amikor a felhasználó megnyitja a shopot) is **auto-sync**-et indít (ha 60 perc óta nem volt sync).  
- Tehát néhány percen belül a termékek újra betöltődnek az UNAS-ból; a shop **üzemképes**, csak az első 1–2 percben üres vagy kevés termék lehet.

**Teendő volume nélkül:**  
- Hagyd a volume létrehozást későbbre (pl. ha bekapcsolod a Metal Volumes-t vagy váltasz régiót).  
- A többi lépést (környezeti változók, frontend build, UNAS script, apiBase, host script javítás) csináld meg; a **DB és a sync így is működik**, csak nem perzisztens deploy között.

Később, ha sikerül volume-t létrehozni és a `data` mount path-tal csatolni, a deploy/restart után is megmaradnak a termékek.

---

## 2. Railway – környezeti változók

A backendnek és a syncnek ezek kellenek (Railway project → backend service → **Variables**):

| Változó | Kötelező? | Példa / megjegyzés |
|--------|-----------|---------------------|
| `UNAS_API_KEY` | **Igen** | UNAS adminból generált API kulcs (megfelelő jogosultságokkal). |
| `PORT` | Általában automatikus | Railway tölti fel; ha nem, add meg pl. `3001`. |
| `SYNC_CRON_HOURS` | Opcionális | Pl. `24` = 24 óránként egy UNAS→DB sync (napi frissítés). |
| `FRONTEND_URL` | Opcionális | Pl. `https://www.marketly.hu` (CORS-hoz). |

**Teendő**: Ellenőrizd, hogy az **UNAS_API_KEY** be van-e állítva és helyes. A **SYNC_CRON_HOURS=24** opcionális, de ajánlott a napi automatikus frissítéshez.

---

## 3. Frontend – build és feltöltés (Git → CDN)

A shop UI a CDN-ről tölti a bundle-t (loader.js → index.js, index.css). Ha módosítottál a frontend kódban, a következő lépésekkel kerül élesre:

### Teendő

1. **Lokális build**
   ```bash
   npm run build
   ```
   Ekkor frissül: `dist/loader.js`, `dist/assets/index.js`, `dist/assets/index.css`, `dist/version.json`.

2. **Commit és push**
   ```bash
   git add -A
   git commit -m "build: frontend + API-only products, health, docs"
   git push origin main
   ```
   A CDN (jsDelivr) a repóból szolgálja a `dist/` tartalmát; néhány percen belül a pusholt verzió elérhető.

3. **Cache elkerülés** (opcionális): Ha a böngésző régi bundle-t mutatna, az UNAS oldalon a script src végére tehetsz query paramétert, pl.  
   `https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist/loader.js?v=1737800000`

---

## 4. UNAS – script src és HTML

Az UNAS shop (butorbolt) oldalán a frontend egy **script tag**-gel töltődik be.

### Teendő

1. **UNAS admin** → a butorbolt (shop) oldal szerkesztése (ahol az AI shop / Marketly widget megjelenik).
2. **Script src** ellenőrzése / beállítása:
   - A betöltő script URL-je legyen:  
     `https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist/loader.js`
   - Ha a repó neve vagy ága más (pl. más GitHub user/repo), cseréld ki a URL-t a ti repótokra.
3. **HTML**: Legyen `#root` és opcionálisan `#loading-overlay` elem (a jelenlegi sablonnak általában megvan). Ha már működik a widget, ezt nem kell változtatni.

---

## 5. UNAS – frontend konfig (apiBase)

A frontend a **backend API**-t hívja (termékek: GET /api/products). Ehhez tudnia kell a backend címét.

### Teendő

1. Az UNAS oldalon (vagy a script betöltése előtt) állítsd be a **MARKETLY_CONFIG** objektumot. A loader/alkalmazás ezt keresi:
   - **apiBase**: a Railway backend gyökércíme, **/api nélkül**, pl.  
     `https://marketly-ai-butorbolt-production.up.railway.app`  
     A kód automatikusan hozzáfűzi az `/api` részt (pl. `/api/products`).
2. Tehát például:
   ```html
   <script>
     window.MARKETLY_CONFIG = {
       apiBase: 'https://marketly-ai-butorbolt-production.up.railway.app/api',
       productBaseUrl: '/termek',
       cartUrl: '/cart',
       checkoutUrl: '/checkout',
       mode: 'unas-integrated',
       cdnBase: 'https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist'
     };
   </script>
   <script src="https://cdn.jsdelivr.net/gh/.../dist/loader.js"></script>
   ```
   Ha az `apiBase` máshol van definiálva (pl. egyedi HTML blokk), ott add meg a **Railway backend URL-jét** (ahol a `/health` és `/api/products` fut).

**Fontos**: Ha az `apiBase` hibás vagy hiányzik, a frontend nem tud termékeket kérni → üres lista vagy hiba.

---

## 6. UNAS – butorbolt oldal script hibák (2591, 2520)

A konzolban megjelenő **butorbolt:2591** és **butorbolt:2520** hibák **nem** a mi loaderünkből/frontendünkből jönnek. Az UNAS által kiszolgált **butorbolt oldal HTML-jében** lévő script hibázik (pl. téma vagy egyedi HTML).

### Teendő

1. **UNAS admin** → a butorbolt oldal forrásának / sablonjának szerkesztése (ahol a sor számok ~2520 és ~2591 vannak).
2. **Keresés**:
   - ~2520. sor: valami `addEventListener(...)` hívás, ahol a cél elem lehet **null**.
   - ~2589–2591. sor: `forEach` + `observer.observe(...)` (IntersectionObserver), ahol egy elem nem DOM Element (pl. null).
3. **Javítás** (bemásolható snippetek a **UNAS-host-oldal-javitas.md** fájlban):
   - **addEventListener**: csak akkor hívd, ha az elem létezik:
     ```js
     if (elem != null && typeof elem.addEventListener === 'function') {
       elem.addEventListener('...', ...);
     }
     ```
   - **observer.observe**: csak DOM elemre:
     ```js
     if (el && el.nodeType === 1) {
       observer.observe(el);
     }
     ```
4. Mentés, majd az oldal újratöltése és konzol ellenőrzése – ezek után a 2520 és 2591 hibáknak el kell tűnniük.

Részletesen, másolható kóddal: **UNAS-host-oldal-javitas.md**.

---

## 7. Ellenőrzés és teszt

### Backend (Railway)

1. **Health**: böngészőben vagy Postmanban:  
   `GET https://<railway-backend-url>/health`  
   Várható: `200`, body pl. `{ "status": "ok", "db": "ok", "timestamp": "..." }`.  
   Ha `503` és `db: "error"`, a DB nem elérhető (pl. volume nincs mountolva).
2. **Termékek**:  
   `GET https://<railway-backend-url>/api/products`  
   Várható: JSON `products`, `total`, `lastSync`. Az első deploy után a sync 1–2 percen belül feltölti a termékeket; addig `products` üres vagy kevés lehet.
3. **Manuális sync** (opcionális):  
   `POST https://<railway-backend-url>/api/admin/sync`  
   Ettől azonnal indul egy UNAS → DB sync.

### Frontend (éles shop oldal)

1. **Cache**: böngésző cache törlése vagy inkognító ablak.
2. **Oldal megnyitása**: a butorbolt/shop oldal (ahol a Marketly widget van).
3. **Konzol** (F12):
   - Nincs `stopPropagation is not a function`.
   - Nincs via.placeholder / ERR_NAME_NOT_RESOLVED.
   - A termékek betöltődnek (ha a backend és apiBase rendben van).
   - Ha még mindig látsz butorbolt:2520 / 2591, az UNAS host oldal scriptet kell javítani (6. pont).

### DB és sync

- **Sync history**: `GET https://<railway-backend-url>/api/admin/sync/history` (böngészőben csak akkor érdemes, ha nincs admin auth). Vagy Railway log: „Sync completed”, „products added/updated”.
- **Napi sync**: Ha beállítottad a `SYNC_CRON_HOURS=24`-et, a backend 24 óránként automatikusan futtat egy sync-et; a logban megjelenik.

---

## 8. Rövid összefoglaló – mi hol van

| Teendő | Hol / hogyan |
|--------|----------------|
| DB maradjon meg deploy után | Railway Volume, mount path: `data` (1. pont) |
| UNAS → DB frissítés | AUTO_SYNC (60 perc) + opcionális SYNC_CRON_HOURS=24 (2. pont) |
| Frontend kód élesre | npm run build → git push (3. pont) |
| Shop betölti a widgetet | UNAS: script src = loader.js URL (4. pont) |
| Termékek az API-ból | MARKETLY_CONFIG.apiBase = Railway backend URL (5. pont) |
| Konzol 2520/2591 eltűnjön | UNAS butorbolt oldal HTML/script javítása (6. pont) |
| Minden rendben? | Health + /api/products + éles oldal teszt (7. pont) |

Ha ezeket végigcsinálod, a rendszer a dokumentumoknak megfelelően működik: DB az igazságforrás, a frontend csak API-t hív, a sync frissíti az adatot, napi frissítés és manuális deploy után is konzisztens adat, hibák és összeomlás nélkül.
