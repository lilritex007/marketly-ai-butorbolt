# 🚀 Vercel Deployment - Lépésről Lépésre

## ✅ **ELŐNYÖK:**

- ✅ **100% INGYENES** örökre
- ✅ **GitHub Auto-Deploy** (minden push → frissül)
- ✅ **SSL automatikus**
- ✅ **Globális CDN**
- ✅ **Zero-config**

---

## 📋 **1. LÉPÉS: VERCEL FIÓK**

### **A) Regisztráció:**

**URL:** https://vercel.com/signup

1. Kattints **"Continue with GitHub"** ✅
2. Jelentkezz be a GitHub fiókodba
3. Engedélyezd a Vercel hozzáférést

---

## 📦 **2. LÉPÉS: PROJECT IMPORT**

### **A) New Project:**

1. **Dashboard:** https://vercel.com/new
2. **"Import Git Repository"**
3. Keresd meg: **`lilritex007/marketly-ai-butorbolt`**
4. Kattints **"Import"**

### **B) Configure Project:**

| Beállítás | Érték |
|-----------|-------|
| **Framework Preset** | Other |
| **Root Directory** | `.` (leave as is) |
| **Build Command** | Leave empty |
| **Output Directory** | Leave empty |

---

## 🔑 **3. LÉPÉS: ENVIRONMENT VARIABLES**

### **A) Kattints "Environment Variables"**

### **B) Adj hozzá:**

| Key | Value |
|-----|-------|
| `UNAS_API_KEY` | `9a6522bfbcd56045cda463a90d7476d932338f52` |

**→ Add**

---

## 🎯 **4. LÉPÉS: DEPLOY!**

**Kattints "Deploy"** → Vercel build-eli és deploy-olja! 🚀

**Várj 1-2 percet...**

---

## ✅ **5. LÉPÉS: API URL MÁSOLÁSA**

A deploy után kapsz egy URL-t:

```
https://marketly-ai-butorbolt.vercel.app
```

**Ez lesz az API alap URL!**

---

## 🧪 **6. LÉPÉS: TESZTELÉS**

### **Health Check:**

```
https://marketly-ai-butorbolt.vercel.app/api/health
```

**Várható válasz:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-25T12:00:00.000Z",
  "service": "Marketly AI Shop API",
  "version": "1.0.0"
}
```

### **Products API:**

```
https://marketly-ai-butorbolt.vercel.app/api/products?limit=5
```

**Várható válasz:**
```json
{
  "products": [
    {
      "id": "123",
      "sku": "BUTOR-001",
      "name": "Modern Kanapé",
      "price": 89990,
      ...
    }
  ],
  "total": 5,
  "count": 5
}
```

---

## 🔧 **7. LÉPÉS: FRONTEND CONFIG FRISSÍTÉS**

Frissítenem kell a frontend config-ot az új Vercel URL-lel!

**Írd meg nekem a Vercel URL-t amit kaptál, és frissítem!**

Például:
```
https://marketly-ai-butorbolt.vercel.app
```

---

## 🔄 **AUTO-DEPLOY:**

**Minden `git push` után automatikusan frissül!** 🎉

```bash
git add .
git commit -m "Update API"
git push origin main
# → Vercel automatikusan deploy-ol!
```

---

## 📊 **VERCEL DASHBOARD:**

**Monitor:** https://vercel.com/dashboard

- ✅ Deployment history
- ✅ Analytics
- ✅ Logs
- ✅ Environment variables

---

## 🎯 **KÖVETKEZŐ LÉPÉS:**

**ÍRD MEG A VERCEL URL-T ÉS FRISSÍTEM A FRONTEND-ET!** 🚀

Példa:
```
https://marketly-ai-butorbolt.vercel.app
```
