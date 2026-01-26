# ⚡ GYORS JAVÍTÁS

## 🔴 Probléma:
- 3× duplikált "AI Bútorbolt" fül a marketly.hu-n
- Üres oldal (fájlok nincsenek GitHub-on)
- GitHub Desktop nem működik

## ✅ Megoldás (3 lépés):

### 1️⃣ GitHub Token (2 perc)

**A. Repo létrehozás:**
1. https://github.com/new
2. Name: `marketly-ai-butorbolt`
3. **Public** ✅
4. Create repository

**B. Token generálás:**
1. https://github.com/settings/tokens/new
2. Note: "Marketly"
3. Expiration: 90 days
4. Scope: **repo** ✅
5. Generate token
6. **MÁSOLD LE!** (pl. `ghp_xxxxxxxxxxxx`)

---

### 2️⃣ PowerShell Push (1 perc)

```powershell
cd "C:\Users\Kis Riti\Desktop\Marketly-AI-Butor-shop"

git push -u origin main
```

**Kérdezni fogja:**
```
Username for 'https://github.com': kisriti
Password for 'https://kisriti@github.com': [ILLESZD IDE A TOKEN-T]
```

**Várható kimenet:**
```
Enumerating objects: 120, done.
Writing objects: 100% (120/120), 1.5 MiB
To https://github.com/kisriti/marketly-ai-butorbolt.git
 * [new branch]      main -> main
✅ KÉSZ!
```

---

### 3️⃣ Újra Deploy (1 perc)

```powershell
npm run deploy:live
```

**Várható kimenet:**
```
🎉 DEPLOYMENT SUCCESSFUL!
🌐 https://www.marketly.hu/butorbolt
```

**Ellenőrzés:**
https://www.marketly.hu/butorbolt

✅ AI Shop működik!

---

## 🧹 Duplikált oldalak tisztítása (opcionális)

Ha maradt 3× "AI Bútorbolt" a menüben:

1. UNAS Admin → Oldalak
2. Töröld a felesleges "AI Bútorbolt" oldalakat
3. Hagyd csak az egyiket!

---

## ❓ Gyakori Hibák

### "fatal: unable to access ... SEC_E_NO_CREDENTIALS"
→ Token-t rosszul illesztetted be. Próbáld újra!

### "Repository not found"
→ Repo még nem létezik GitHub-on. Lépés 1A!

### "Permission denied"
→ Token scope hibás. Ellenőrizd: **repo** jogosultság ✅

---

## 📞 Ha elakadtál:

1. Token generálva? ✅
2. Repo létezik? https://github.com/kisriti/marketly-ai-butorbolt
3. Push sikeres? (látsz fájlokat GitHub-on?)
4. Deploy lefutott? (marketly.hu/butorbolt)

**Ha bármelyik ❌ → Mondd meg melyiknél vagy!**
