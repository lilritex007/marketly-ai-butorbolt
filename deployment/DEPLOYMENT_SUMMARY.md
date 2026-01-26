# 📦 UNAS Deployment Rendszer - Összefoglaló

## ✅ Ami Elkészült

### 📁 Deployment Struktúra
```
deployment/
├── scripts/
│   ├── unas-api.js         ✅ UNAS API wrapper (login, setPage, setStorage)
│   ├── deploy.js           ✅ Fő deployment script
│   ├── rollback.js         ✅ Visszavonás script
│   ├── status.js           ✅ Állapot ellenőrzés
│   ├── backup.js           ✅ Backup készítés
│   └── check-ready.js      ✅ Pre-deployment ellenőrzés
├── config/
│   ├── .gitkeep            ✅ Git tracking
│   └── deployment-state.json (auto-generated)
├── backups/                ✅ Backup-ok tárolása
├── templates/              ✅ XML templates (későbbre)
├── README.md               ✅ Teljes dokumentáció
└── QUICKSTART.md           ✅ Gyorsindító útmutató
```

### ⚙️ Package.json Scriptek
```json
"deploy:check": "Pre-deployment ellenőrzés",
"deploy:test": "Teszt deployment (dry-run)",
"deploy:live": "Éles deployment",
"deploy:rollback": "Visszavonás",
"deploy:status": "Deployment állapot"
```

### 🔧 Environment Konfiguráció
- ✅ `.env.deployment` - UNAS API config
- ✅ Biztonságos API key tárolás
- ✅ Testreszabható beállítások

---

## 🎯 Használat (3 Egyszerű Lépés)

### STEP 1: Ellenőrzés
```bash
npm run deploy:check
```

**Ellenőrzi:**
- ✅ .env.deployment konfig
- ✅ API key érvényes
- ✅ Dependencies telepítve
- ✅ Build elkészült

**Várt:** `✅ READY FOR DEPLOYMENT!`

---

### STEP 2: Teszt (Biztonságos)
```bash
npm run deploy:test
```

**Mit csinál:**
- ✅ Build + Token teszt
- ❌ NEM ír UNAS-ba

**Várt:** `🎉 DEPLOYMENT SUCCESSFUL! (DRY RUN)`

---

### STEP 3: Éles Deployment
```bash
npm run deploy:live
```

**Mit csinál:**
1. Build React app
2. UNAS login (Bearer token)
3. Fájlok feltöltése (`/ai-shop/assets/`)
4. Oldal létrehozás (`marketly.hu/butorbolt`)
5. HTML injection (React app betöltő)
6. State mentés

**Várt:** 
```
🎉 DEPLOYMENT SUCCESSFUL!
🌐 https://www.marketly.hu/butorbolt
```

---

## 🔄 Rollback (Ha Baj Van)

```bash
npm run deploy:rollback
```

**Megerősítés kér:**
```
⚠️  WARNING: This will DELETE the AI Shop from UNAS!
Continue? (y/N): y
```

**Törli:**
- ✅ `/butorbolt` oldal
- ✅ HTML tartalom
- ✅ Összes feltöltött fájl

**Eredmény:** Webshop visszaáll eredeti állapotába

---

## 📊 Állapot Ellenőrzés

```bash
npm run deploy:status
```

**Mutatja:**
- Deployment státusz
- Page & Content ID-k
- Feltöltött fájlok száma
- URL accessibility

---

## 🎨 Deployment Architektúra

```
┌─────────────────────────────────────────┐
│  LOCAL (fejlesztés)                     │
│  ├─ src/ (React app)                    │
│  ├─ npm run build                       │
│  └─ dist/ (build output)                │
│      ↓                                   │
│  DEPLOYMENT SCRIPT                      │
│  ├─ deploy.js                           │
│  ├─ UNAS login → Bearer token           │
│  └─ API calls:                          │
│      ↓                                   │
├─────────────────────────────────────────┤
│  UNAS API (https://api.unas.eu/shop)   │
│  ├─ setStorage (upload files)           │
│  ├─ setPage (create page)               │
│  └─ setPageContent (inject HTML)        │
│      ↓                                   │
├─────────────────────────────────────────┤
│  UNAS WEBSHOP (www.marketly.hu)        │
│  ├─ /ai-shop/assets/index.js           │
│  ├─ /ai-shop/assets/index.css          │
│  └─ /butorbolt                          │
│      ├─ Page (metadata, SEO)            │
│      ├─ Content (HTML)                  │
│      │   └─ <div id="ai-shop-root">     │
│      │   └─ <script src="/ai-shop/..."> │
│      └─ RESULT: React app működik! ✅   │
└─────────────────────────────────────────┘
```

---

## 🔒 Biztonsági Funkciók

### 1. Dry-Run Mode
- Teszt mód (nem ír UNAS-ba)
- Biztonságos próba

### 2. Auto-Rollback
```env
AUTO_ROLLBACK_ON_ERROR=true
```
- Hiba esetén automatikus visszavonás

### 3. Deployment State Tracking
- `deployment-state.json` - minden deployment részlet
- Rollback pontosan tudja mit kell törölni

### 4. Confirmation Prompt
- Rollback előtt megerősítés kér
- `--force` flag bypaszolja

---

## 🚀 Következő Lépések

### 1. Első Deployment

```bash
# Ellenőrzés
npm run deploy:check

# Ha OK:
npm run deploy:test

# Ha teszt OK:
npm run deploy:live
```

### 2. Teszt

```
https://www.marketly.hu/butorbolt
```

**Ellenőrizd:**
- [ ] Oldal betölt
- [ ] React app működik
- [ ] Termékek megjelennek
- [ ] AI keresés működik
- [ ] UNAS header/footer látszik

### 3. Ha Hiba Van

```bash
# Browser console (F12)
# Nézd meg mi a hiba

# Rollback
npm run deploy:rollback

# Javítsd a problémát

# Újra deployment
npm run deploy:live
```

---

## 📋 Támogatott UNAS API-k (Minimal)

- ✅ `getPage` - Oldalak lekérés
- ✅ `setPage` - Oldalak módosítás
- ✅ `getPageContent` - Tartalom lekérés
- ✅ `setPageContent` - Tartalom módosítás
- ✅ `getStorage` - Fájlok lekérés
- ✅ `setStorage` - Fájlok feltöltés
- ❌ `getProduct`, `getProductDB` - Termékek (már működik külön)

---

## 🎯 Bővítési Lehetőségek (Később)

Ha engedélyezed további API-kat:

### Session Sharing
```
✅ checkCustomer → AI látja be van-e jelentkezve
✅ getCustomer   → User profil
✅ setCustomer   → AI preferenciák mentés
```

### Készlet & Kategóriák
```
✅ getStock      → "Csak 3 db raktáron!"
✅ getCategory   → Dinamikus navigáció
```

### Express Checkout
```
✅ setOrder      → 1-kattintásos rendelés
```

---

## 📞 Parancsok Összefoglalása

| Parancs | Leírás | Biztonságos? |
|---------|--------|--------------|
| `npm run deploy:check` | Előfeltételek ellenőrzése | ✅ Igen |
| `npm run deploy:test` | Teszt deployment (dry-run) | ✅ Igen |
| `npm run deploy:live` | **Éles deployment** | ⚠️ UNAS-ba ír |
| `npm run deploy:status` | Deployment állapot | ✅ Igen |
| `npm run deploy:rollback` | **Visszavonás** | ⚠️ Töröl |

---

## ✅ Deployment Sikeres Ha...

1. ✅ `npm run deploy:live` → "DEPLOYMENT SUCCESSFUL!"
2. ✅ https://www.marketly.hu/butorbolt elérhető
3. ✅ React app betöltődik (nincs blank oldal)
4. ✅ Termékek megjelennek
5. ✅ Browser console nincs 404/500 hiba
6. ✅ AI funkciók működnek

---

**Mindent elkészítettem! Készen állsz a deploymentre?** 🚀

**Következő parancs:**
```bash
npm run deploy:check
```
