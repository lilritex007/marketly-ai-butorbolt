# 🚂 Railway.app Deployment - Lépésről Lépésre

## ✅ **ELŐNYÖK:**

- ✅ **NINCS TIMEOUT LIMIT** (akár órákig is futhat!)
- ✅ **Node.js támogatás** (már van backend kódunk!)
- ✅ **Ingyenes tier** ($5 kredit/hó, elég lesz)
- ✅ **GitHub auto-deploy**
- ✅ **Gyors setup** (5 perc)

---

## 📋 **1. LÉPÉS: RAILWAY FIÓK**

### **A) Regisztráció:**

**URL:** https://railway.app/signup

1. **"Continue with GitHub"** ✅
2. Jelentkezz be a GitHub fiókodba
3. Engedélyezd a Railway hozzáférést

---

## 📦 **2. LÉPÉS: NEW PROJECT**

### **A) Dashboard:**

**URL:** https://railway.app/new

1. **"Deploy from GitHub repo"**
2. Keresd meg: **`lilritex007/marketly-ai-butorbolt`**
3. Kattints **"Deploy Now"**

---

## ⚙️ **3. LÉPÉS: SERVICE CONFIGURATION**

### **A) Service Settings:**

**Railway Dashboard → Service → Settings**

| Beállítás | Érték |
|-----------|-------|
| **Root Directory** | `.` (leave as is) |
| **Start Command** | `node server/index.js` ✅ |
| **Watch Paths** | `server/**` |

---

## 🔑 **4. LÉPÉS: ENVIRONMENT VARIABLES**

### **A) Variables Tab:**

**Railway Dashboard → Service → Variables**

**Add hozzá:**

| Key | Value |
|-----|-------|
| `UNAS_API_KEY` | `9a6522bfbcd56045cda463a90d7476d932338f52` |
| `FRONTEND_URL` | `https://www.marketly.hu` |
| `PORT` | *(Railway automatikusan beállítja)* |
| `AUTO_SYNC_INTERVAL` | `0` (manual sync) |

**→ Save**

---

## 🚀 **5. LÉPÉS: DEPLOY!**

**Railway automatikusan build-eli és deploy-olja!** 🚀

**Várj 2-3 percet...**

---

## ✅ **6. LÉPÉS: URL MÁSOLÁSA**

A deploy után kapsz egy URL-t:

```
https://marketly-ai-butorbolt-production.up.railway.app
```

**Ez lesz az API alap URL!**

---

## 🧪 **7. LÉPÉS: TESZTELÉS**

### **A) Health Check:**

```
https://[RAILWAY-URL]/health
```

**Várható válasz:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-25T..."
}
```

### **B) SYNC Futtatása (170k termék!):**

```
https://[RAILWAY-URL]/api/admin/sync
```

**POST request** (böngészőben vagy Postman-ben)

**Várható válasz (5-10 perc múlva!):**
```json
{
  "success": true,
  "fetched": 170000,
  "added": 170000,
  "updated": 0,
  "message": "Sync completed successfully"
}
```

**NINCS TIMEOUT!** Akár 30 percig is futhat! ✅

---

## 🔧 **8. LÉPÉS: FRONTEND CONFIG FRISSÍTÉS**

Frissítenem kell a frontend config-ot az új Railway URL-lel!

**Írd meg nekem a Railway URL-t amit kaptál, és frissítem!**

Például:
```
https://marketly-ai-butorbolt-production.up.railway.app
```

---

## 🔄 **AUTO-DEPLOY:**

**Minden `git push` után automatikusan frissül!** 🎉

```bash
git add .
git commit -m "Update API"
git push origin main
# → Railway automatikusan deploy-ol!
```

---

## 📊 **RAILWAY DASHBOARD:**

**Monitor:** https://railway.app/dashboard

- ✅ Deployment history
- ✅ Logs (real-time!)
- ✅ Metrics (CPU, Memory)
- ✅ Environment variables

---

## 🎯 **KÖVETKEZŐ LÉPÉS:**

**DEPLOY-OLD A RAILWAY-RE ÉS ÍRD MEG A KAPOTT URL-T!** 🚀

Példa:
```
https://marketly-ai-butorbolt-production.up.railway.app
```
