# 📘 UNAS Manuális Setup - AI Bútorbolt

## ✅ FRISSÍTETT VERZIÓ (jsDelivr CDN)

---

## 1️⃣ HTML CONTENT (Tartalmi elem)

**MÁSOLD BE A tinyMCE SZERKESZTŐBE (Forrás módban):**

```html
<!-- AI Shop Root Container -->
<div id="root" class="min-h-screen"></div>

<!-- CSS betöltése (jsDelivr CDN - CORS kompatibilis) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist/assets/index-Cxl7vB80.css">

<!-- Loading animáció -->
<div id="loading-overlay" style="position:fixed;inset:0;background:white;z-index:9999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">
  <div style="text-align:center;">
    <div style="width:50px;height:50px;border:4px solid #e0e7ff;border-top-color:#4f46e5;border-radius:50%;margin:0 auto 20px;animation:spin 1s linear infinite;"></div>
    <h2 style="color:#4f46e5;font-size:24px;margin:0;">AI Bútorbolt betöltése...</h2>
  </div>
</div>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
#root {
  min-height: 100vh;
}
</style>
```

---

## 2️⃣ SCRIPT TAG BEÁLLÍTÁSOK (UNAS Script Manager)

| Mező | Érték |
|------|-------|
| **Név** | `AI Shop Loader` |
| **Típus** | `head` |
| **Betöltés** | `defer` ✅ |
| **Script URL** | `https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist/loader.js` |
| **Scope** | Csak `/butorbolt` oldalon |

---

## 🧪 TESZTELÉS

**URL:** `https://www.marketly.hu/butorbolt`

**F12 Console várható kimenet:**
```
✅ "AI Shop Loader starting..."
✅ "MARKETLY_CONFIG initialized"
✅ "#root element found"
✅ "React bundle loaded successfully!"
```

---

## ⚠️ FONTOS

- ✅ **jsDelivr CDN használata kötelező** (GitHub raw URL-ek nem működnek CORB miatt)
- ✅ **@main** a branch név (automatikusan frissül minden push után)
- ✅ **Nincs script tag a HTML-ben** (tinyMCE miatt)
- ✅ **Cache:** jsDelivr cache 12 óra, force refresh: `?v=timestamp`

---

## 🔄 FRISSÍTÉS

Ha frissíted a kódot (git push után), **cache-t törölni kell:**

1. **Módszer 1:** Várj 12 órát (jsDelivr cache TTL)
2. **Módszer 2:** Force refresh: `https://cdn.jsdelivr.net/gh/USER/REPO@main/file.js?v=TIMESTAMP`
3. **Módszer 3:** Purge cache: https://www.jsdelivr.com/tools/purge

---

## 📊 CDN STATUS

jsDelivr status: https://www.jsdelivr.com/
