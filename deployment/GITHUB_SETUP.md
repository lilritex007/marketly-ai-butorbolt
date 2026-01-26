# 🔐 GitHub Setup Útmutató

## 🎯 Cél

GitHub CDN-t használunk a deployment-hez, így **nem kell UNAS setStorage API**! 

Build fájlok GitHub-ról töltődnek be → Egyszerűbb, megbízhatóbb! ✅

---

## ⚡ Gyors Start (3 lépés)

### **1. GitHub Repo Létrehozása**

**Opció A: Web UI (Egyszerű)**

1. Menj: https://github.com/new
2. Repository name: `marketly-ai-butorbolt`
3. **Public** (hogy CDN működjön!)
4. ❌ NE add hozzá README/gitignore/license (már van)
5. Create repository

**Opció B: GitHub CLI**

```bash
gh repo create marketly-ai-butorbolt --public --source=. --remote=origin --push
```

---

### **2. GitHub Authentication**

**Választhatsz 3 közül:**

#### **🥇 Opció 1: GitHub Desktop (AJÁNLOTT)**

Legjobb ha nem vagy git guru:

1. Telepítsd: https://desktop.github.com/
2. Login GitHub accounttal
3. File → Add Local Repository
4. Browse → Válaszd ki: `C:\Users\Kis Riti\Desktop\Marketly-AI-Butor-shop`
5. Publish repository
6. **KÉSZ!** ✅

#### **🥈 Opció 2: Personal Access Token**

Ha szeretsz terminálozni:

1. GitHub.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Note: "Marketly AI Deployment"
5. Expiration: 90 days (vagy No expiration)
6. Scopes: ✅ **repo** (teljes jogosultság)
7. Generate token
8. **MÁSOLD LE A TOKEN-T!** (csak egyszer látod)

```bash
# Terminálban:
git push -u origin main

# GitHub kéri:
Username: kisriti
Password: [ILLESZD IDE A TOKEN-T]
```

**Token tárolás (opcionális):**
```bash
git config --global credential.helper store
# Következő push után megjegyzi
```

#### **🥉 Opció 3: SSH Key**

Ha már van SSH key-ed:

```bash
# Repo URL átállítás SSH-ra
git remote set-url origin git@github.com:kisriti/marketly-ai-butorbolt.git

# Push
git push -u origin main
```

---

### **3. Push a Kódot**

**Ha GitHub Desktop:**
- Nyomd meg a "Push origin" gombot ✅

**Ha Terminal:**
```bash
git push -u origin main
```

**Várható kimenet:**
```
Enumerating objects: 120, done.
Counting objects: 100% (120/120), done.
Delta compression using up to 8 threads
Compressing objects: 100% (115/115), done.
Writing objects: 100% (120/120), 1.5 MiB | 500 KiB/s, done.
Total 120 (delta 45), reused 0 (delta 0)
To https://github.com/kisriti/marketly-ai-butorbolt.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**✅ KÉSZ!**

---

## 🔍 Ellenőrzés

### **GitHub.com-on:**

1. Menj: https://github.com/kisriti/marketly-ai-butorbolt
2. Fájlok láthatók? ✅
3. `dist/` mappa létezik? ✅
4. `dist/assets/index-*.js` látható? ✅

### **CDN URL teszt:**

Nyisd meg böngészőben:
```
https://raw.githubusercontent.com/kisriti/marketly-ai-butorbolt/main/dist/assets/index-CjZ2iZL6.js
```

Ha JavaScript kódot látsz → **MŰKÖDIK!** ✅

---

## 🚀 Deployment Most Már Megy!

```bash
# Teszt (nem ír UNAS-ba)
npm run deploy:test

# Éles (létrehozza a UNAS oldalt)
npm run deploy:live
```

**Eredmény:**
```
🎉 DEPLOYMENT SUCCESSFUL!
🌐 https://www.marketly.hu/butorbolt
📦 CDN: https://raw.githubusercontent.com/kisriti/marketly-ai-butorbolt/main/dist
```

---

## ❓ Hibaelhárítás

### **"fatal: unable to access ... SEC_E_NO_CREDENTIALS"**

→ Nincs beállítva GitHub auth. Válaszd **Opció 1 (GitHub Desktop)** vagy **Opció 2 (Token)**

---

### **"Repository not found"**

→ Repo még nem létezik GitHub-on. Csináld meg: https://github.com/new

---

### **"Permission denied (publickey)"**

→ SSH key nincs beállítva. Használd **Opció 2 (Token)** helyette!

---

### **CDN URL 404-et ad**

→ Push nem ment végig. Ellenőrizd GitHub.com-on hogy látszanak-e a fájlok!

---

## 🔄 Későbbi Update-ek

Ha módosítasz a kódon és újra deploy:

```bash
# Build
npm run build

# Commit
git add dist/
git commit -m "Update AI Shop"

# Push
git push

# Deploy
npm run deploy:live
```

**VAGY** használd az automatikus deployment-et:

```bash
npm run deploy:live
# Automatikusan: build + commit + push + UNAS update
```

---

## ✅ Checklist

- [ ] GitHub repo létrehozva (`marketly-ai-butorbolt`)
- [ ] Repo **Public** (CDN miatt)
- [ ] Authentication beállítva (GitHub Desktop / Token / SSH)
- [ ] Initial commit push-olva
- [ ] `dist/` mappa GitHub-on látható
- [ ] CDN URL teszt sikeres

**Ha minden ✅ → Futtasd:** `npm run deploy:live`

---

**Készen állsz?** 🚀

Ha GitHub Desktop-ot használsz, akkor **most Push origin**!

Ha token-t, akkor: `git push -u origin main`

**Utána:** `npm run deploy:test` 🎉
