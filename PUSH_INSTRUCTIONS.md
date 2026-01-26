# 📤 GitHub Push Útmutató

## Már elkészült:
✅ Git repo inicializálva
✅ Remote beállítva (kisriti/marketly-ai-butorbolt)
✅ 2 commit kész (87a6a1e, 418dc26)

## Most következik:

### 1. GitHub Repo létrehozás (ha még nincs)
https://github.com/new
- Name: `marketly-ai-butorbolt`
- Public ✅
- NE add hozzá README stb.

### 2. Token generálás
https://github.com/settings/tokens/new
- Note: "Marketly Deploy"
- Expiration: 90 days
- Scope: **repo** ✅
- Generate token
- **MÁSOLD LE!**

### 3. Push parancs (PowerShell-ben)

```powershell
cd "C:\Users\Kis Riti\Desktop\Marketly-AI-Butor-shop"

git push -u origin main
```

**Kérdezni fogja:**
```
Username: kisriti
Password: [ILLESZD IDE A TOKEN-T]
```

### 4. Ha kéri credentials tárolást
```powershell
git config --global credential.helper store
```
Ezután egyszer beírod a token-t és megjegyzi.

### 5. Ellenőrzés
https://github.com/kisriti/marketly-ai-butorbolt

Látszanak a fájlok? ✅
`dist/` mappa létezik? ✅

### 6. CDN Teszt
https://raw.githubusercontent.com/kisriti/marketly-ai-butorbolt/main/dist/assets/index-CjZ2iZL6.js

Ha JavaScript kódot látsz → Működik! ✅

### 7. Újra Deploy
```powershell
npm run deploy:live
```

### 8. Ellenőrzés
https://www.marketly.hu/butorbolt

✅ AI Shop működik!
