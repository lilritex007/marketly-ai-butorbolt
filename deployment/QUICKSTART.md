# ⚡ UNAS Deployment - Gyorsindító Útmutató

## 🎯 3 Lépésben a Deployment-hez

### ✅ STEP 1: Ellenőrzés

```bash
# 1.1 Deployment mappa létezik?
ls deployment

# Várt: backups  config  scripts  README.md

# 1.2 .env.deployment konfig OK?
cat .env.deployment

# Ellenőrizd: UNAS_API_KEY kitöltve?

# 1.3 Build működik?
npm run build

# Várt: dist/ mappa létrejön
```

---

### 🧪 STEP 2: Teszt Deployment (DRY RUN)

```bash
npm run deploy:test
```

**Mit csinál?**
- ✅ Build lefut
- ✅ Fájlok felderítése
- ✅ UNAS login teszt
- ❌ **NEM ír** semmit UNAS-ba

**Várt kimenet:**
```
🚀 UNAS AI SHOP DEPLOYMENT
Mode: 🧪 DRY RUN (teszt)

📦 STEP 1: Building React App
✅ Build completed

🔐 STEP 2: UNAS API Authentication
✅ Token received: AbCdEf123...

📤 STEP 3: Uploading Build Files
Found 15 files to upload
  [1/15] ✅ assets/index.js (245.3 KB)
  [2/15] ✅ assets/index.css (45.2 KB)
  ...
✅ 15 files uploaded

📄 STEP 4: Creating AI Shop Page
✅ Page created with ID: DRY_RUN_PAGE_ID

📝 STEP 5: Creating HTML Content
✅ Content created with ID: DRY_RUN_CONTENT_ID

🔗 STEP 6: Linking Content to Page
✅ Content linked to page

💾 STEP 7: Saving Deployment State
✅ State saved

🎉 DEPLOYMENT SUCCESSFUL!
```

**Ha hibát látsz:**
- Ellenőrizd `.env.deployment` → API Key
- Ellenőrizd `npm run build` működik-e
- Nézd meg a pontos hibaüzenetet

---

### 🔴 STEP 3: Éles Deployment

**⚠️ FIGYELEM: Ez VALÓBAN ír UNAS-ba!**

```bash
npm run deploy:live
```

**Mit csinál?**
1. Build
2. Login
3. **Fájlok feltöltése UNAS-ba** (setStorage)
4. **Oldal létrehozás** (setPage)
5. **HTML injektálás** (setPageContent)
6. State mentés

**Várható idő:** 2-5 perc (fájlok számától függ)

**Sikeres deployment után:**
```
🎉 DEPLOYMENT SUCCESSFUL!
🌐 https://www.marketly.hu/butorbolt
📋 Page ID: 580692
📋 Content ID: 142860
📋 Files: 15
```

---

## ✅ Deployment Utáni Ellenőrzés

### 1. Oldal Elérhető?

```bash
# Browser-ben:
https://www.marketly.hu/butorbolt
```

**Várt:**
- ✅ UNAS header megjelenik (közös design)
- ✅ AI Shop betöltődik
- ✅ Termékek látszanak
- ✅ UNAS footer megjelenik

### 2. Console Ellenőrzés

```
F12 → Console
```

**Keress:**
- ❌ Nincs 404-es hiba (JS, CSS betöltés)
- ❌ Nincs CORS error
- ✅ "MARKETLY_CONFIG" létezik
- ✅ React app initialized

### 3. Funkciók Tesztelése

- [ ] 🔍 Termék keresés működik
- [ ] 📷 Képfelismerés működik (Gemini Vision)
- [ ] 💬 Chat assistant működik
- [ ] 🎨 AI ajánlások működnek
- [ ] ➡️ Termék kattintás → UNAS termék oldal

---

## 🔄 Rollback - Ha Baj Van

### Ha valami nem működik:

```bash
npm run deploy:rollback
```

**Megerősítés:**
```
⚠️  WARNING: This will DELETE the AI Shop from UNAS!
Continue with rollback? (y/N): y
```

**Eredmény:**
```
✅ ROLLBACK SUCCESSFUL!
✅ AI Shop removed from UNAS
✅ Webshop visszaállt eredeti állapotába
```

**Minden visszaáll:**
- ✅ `/butorbolt` oldal törölve
- ✅ HTML tartalom törölve
- ✅ Fájlok törölve (`/ai-shop/`)

---

## 🎯 Gyakori Problémák

### "Token failed"
→ Ellenőrizd API Key-t (UNAS admin → API)

### "Build failed"
→ Futtasd: `npm install` majd `npm run build`

### "Page created but blank"
→ Ellenőrizd browser console → JS betöltési hiba?

### "CORS error"
→ Fájlok ugyanarról a domain-ről töltődnek be? (`marketly.hu/ai-shop/...`)

---

## 📞 Deployment Parancsok Összefoglalása

| Parancs | Mit csinál | Biztonságos? |
|---------|------------|--------------|
| `npm run deploy:test` | Teszt mód (nem ír UNAS-ba) | ✅ Igen |
| `npm run deploy:live` | Éles deployment | ⚠️ UNAS-ba ír |
| `npm run deploy:status` | Állapot lekérdezés | ✅ Igen |
| `npm run deploy:rollback` | Visszavonás | ⚠️ Töröl UNAS-ból |

---

## 🚀 Következő: Futtasd a Tesztet!

```bash
npm run deploy:test
```

Ha minden OK → 

```bash
npm run deploy:live
```

Majd ellenőrizd:

```
https://www.marketly.hu/butorbolt
```

**Készen állsz?** 🎉
