# 🚀 UNAS AI Shop Deployment

Automatizált deployment rendszer a Marketly AI Bútorbolt UNAS webshopba való integrálásához.

## 📋 Előfeltételek

### UNAS API Jogosultságok (Engedélyezve)
- ✅ `getPage` - Oldalak lekérdezése
- ✅ `setPage` - Oldalak létrehozása, módosítása, törlése
- ✅ `getPageContent` - Tartalom lekérdezése
- ✅ `setPageContent` - Tartalom létrehozása, módosítása, törlése
- ✅ `getStorage` - Fájlok lekérdezése
- ✅ `setStorage` - Fájlok feltöltése, törlése

### Node.js Packages
```bash
npm install
```

## 🔧 Konfiguráció

Konfiguráld a `.env.deployment` fájlt:

```env
UNAS_API_KEY=your_api_key_here
UNAS_API_URL=https://api.unas.eu/shop
UNAS_SHOP_URL=https://www.marketly.hu
AI_SHOP_URL_SLUG=butorbolt
```

## 🎯 Használat

### 1. Teszt Deployment (DRY RUN)

```bash
npm run deploy:test
```

**Mit csinál?**
- ✅ Build lefut
- ✅ Fájlok felderítése
- ✅ Token lekérés teszt
- ❌ NEM ír semmit UNAS-ba

**Ellenőrizd:**
- Build sikeres?
- Fájlok megtalálhatók?
- Token működik?

---

### 2. Éles Deployment

```bash
npm run deploy:live
```

**Mit csinál?**
1. 🔨 Build React app (`npm run build`)
2. 🔐 UNAS login (Bearer token)
3. 📤 Fájlok feltöltése (setStorage)
   - `dist/assets/*.js` → `/ai-shop/assets/`
   - `dist/assets/*.css` → `/ai-shop/assets/`
4. 📄 Oldal létrehozás (setPage)
   - URL: `marketly.hu/butorbolt`
   - SEO meta tags
5. 📝 HTML tartalom injektálás (setPageContent)
   - React app betöltő HTML
   - Config injection
6. 🔗 Tartalom hozzárendelés oldalhoz
7. 💾 Deployment state mentés

**Várható kimenet:**
```
🎉 DEPLOYMENT SUCCESSFUL!
🌐 https://www.marketly.hu/butorbolt
📋 Page ID: 580692
📋 Content ID: 142860
```

**Ellenőrizd:**
- [ ] Oldal elérhető: https://www.marketly.hu/butorbolt
- [ ] React app betöltődik
- [ ] Termékek megjelennek
- [ ] AI funkciók működnek

---

### 3. Status Ellenőrzés

```bash
npm run deploy:status
```

**Mit csinál?**
- Deployment állapot megjelenítése
- Page ID, Content ID
- Feltöltött fájlok száma
- URL accessibility check

---

### 4. Rollback (Visszavonás)

```bash
npm run deploy:rollback
```

**Mit csinál?**
1. ⚠️  Megerősítés kérés
2. 🔐 UNAS login
3. 🗑️  Content törlés (setPageContent delete)
4. 🗑️  Page törlés (setPage delete)
5. 🗑️  Fájlok törlés (setStorage delete)
6. 🧹 Deployment state törlés

**Eredmény:**
- ✅ AI Shop eltávolítva UNAS-ból
- ✅ Webshop visszaállt eredeti állapotába
- ✅ Minden fájl törölve

**Force mode (megerősítés nélkül):**
```bash
node deployment/scripts/rollback.js --force
```

---

## 📁 Deployment Struktúra

```
deployment/
├── scripts/
│   ├── unas-api.js      - UNAS API wrapper (login, setPage, stb.)
│   ├── deploy.js        - Fő deployment script
│   ├── rollback.js      - Visszavonás script
│   ├── status.js        - Állapot ellenőrzés
│   └── backup.js        - Backup készítés
├── config/
│   └── deployment-state.json  - Deployment állapot (auto-generated)
├── backups/             - Backup-ok (jelenleg üres)
└── templates/           - XML templates (opcionális)
```

## 🔒 Biztonsági Funkciók

### Auto-Rollback Hiba Esetén

Ha deployment közben hiba lép fel:

```env
AUTO_ROLLBACK_ON_ERROR=true
```

→ Automatikus rollback, nincs részleges deployment

### Deployment State Tracking

Minden deployment után `deployment-state.json` létrejön:

```json
{
  "timestamp": "2026-01-26T12:34:56.789Z",
  "pageId": "580692",
  "contentId": "142860",
  "uploadedFiles": [
    "/ai-shop/assets/index.js",
    "/ai-shop/assets/index.css"
  ],
  "success": true
}
```

Ez alapján a rollback **pontosan tudja** mit kell törölni.

## 🐛 Hibaelhárítás

### "No token received from UNAS login"

**OK**: API Key hibás vagy lejárt

**Megoldás:**
1. Ellenőrizd `.env.deployment` → `UNAS_API_KEY`
2. UNAS admin → API beállítások → Kulcs aktív?

---

### "setPage failed: 400"

**OK**: XML formátum hiba vagy hiányzó kötelező mező

**Megoldás:**
1. Ellenőrizd `unas-api.js` → `createPage` funkció
2. UNAS dokumentáció szerint kötelező mezők?

---

### "setStorage failed: file too large"

**OK**: Fájl mérete túl nagy (UNAS limit)

**Megoldás:**
1. Build optimalizálás: `vite.config.js` → chunk splitting
2. Képek kompressziója
3. Lazy loading

---

### "Page accessible but blank"

**OK**: React app nem töltődik be (JS path hiba)

**Megoldás:**
1. Ellenőrizd browser console (F12)
2. Ellenőrizd CDN path: `/ai-shop/assets/...`
3. CORS beállítás? (ha külső CDN)

---

## 📊 Deployment Workflow

```
1. Lokális fejlesztés
   └─> npm run dev (test localhost)

2. Build
   └─> npm run build (create dist/)

3. Teszt Deployment
   └─> npm run deploy:test (dry-run)

4. Éles Deployment
   └─> npm run deploy:live
   
5. Ellenőrzés
   └─> https://www.marketly.hu/butorbolt
   
6. Ha OK: ✅ Kész!
   Ha HIBA: ⚠️ npm run deploy:rollback
```

## 🎯 Következő Lépések (Bővítés)

Ha később bővíteni szeretnéd:

### API Jogosultságok Hozzáadása:
```
✅ checkCustomer  - Session sharing
✅ getCustomer    - User profil
✅ setCustomer    - AI preferenciák mentés
✅ getStock       - Készlet ellenőrzés
✅ getCategory    - Kategóriák
```

### Code Changes:
1. `unas-api.js` - Új API funkciók
2. Frontend - Session sharing integráció
3. Frontend - Készlet megjelenítés
4. Backend - UNAS proxy bővítés

---

## 📞 Support

Ha bármi kérdés merül fel:
1. Ellenőrizd deployment logs
2. Futtasd: `npm run deploy:status`
3. Ha rollback kell: `npm run deploy:rollback`

**Fontos**: A deployment **NEM érinti** a lokális fejlesztési környezetet!
