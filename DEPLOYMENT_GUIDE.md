# 🚀 AI Bútorbolt - Telepítési Útmutató

## ✅ **ÖSSZEFOGLALÓ:**

Az AI Bútorbolt **2 fájlt** igényel az UNAS szerveren:

1. **`api.php`** - Backend API proxy (PHP)
2. **UNAS Script Tag** - Frontend loader (JavaScript CDN)

---

## 📦 **1. LÉPÉS: API.PHP FELTÖLTÉSE (FTP)**

### **Fájl helye:**

```
public/api.php
```

### **Hová töltsd fel:**

Az UNAS webshop **gyökér könyvtárába**, ahol az `index.php` is van:

```
/domains/marketly.hu/public_html/api.php
```

Vagy:

```
/www/api.php
```

### **FTP Beállítások:**

- **Host:** FTP szerver címe (Rackhost-tól kapott)
- **Port:** 21 vagy 22 (SFTP)
- **Username:** FTP felhasználónév
- **Password:** FTP jelszó

### **FTP Kliens:**

- **FileZilla** (ajánlott): https://filezilla-project.org/
- **WinSCP**: https://winscp.net/

### **Lépések FileZilla-ban:**

1. Csatlakozz az FTP szerverre
2. Navigálj a `/public_html/` vagy `/www/` mappába
3. Drag & drop az `api.php` fájlt
4. **CHMOD 644** (File → Permissions)

---

## 🔧 **2. LÉPÉS: UNAS SCRIPT TAG FRISSÍTÉSE**

### **UNAS Admin Panel:**

**Beállítások → Scriptek → AI Shop Loader**

| Mező | ÚJ Érték |
|------|----------|
| **Script URL** | `https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@0c28d5f/dist/loader.js` |

**→ MENTÉS**

---

## 🧪 **3. LÉPÉS: TESZTELÉS**

### **A) API Teszt:**

**URL:** `https://www.marketly.hu/api.php?action=health`

**Várható válasz:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-25T12:00:00+00:00"
}
```

### **B) Termékek Teszt:**

**URL:** `https://www.marketly.hu/api.php?action=products&limit=5`

**Várható válasz:**
```json
{
  "products": [
    {
      "id": "123",
      "sku": "BUTOR-001",
      "name": "Modern Kanapé",
      "price": 89990,
      "currency": "HUF",
      ...
    }
  ],
  "total": 5,
  "count": 5
}
```

### **C) Frontend Teszt:**

**URL:** `https://www.marketly.hu/butorbolt`

**F12 Console várható kimenet:**
```
✅ AI Shop Loader starting...
✅ MARKETLY_CONFIG initialized
✅ CSS loaded successfully
✅ React bundle loaded successfully
🔍 Fetching products from: https://www.marketly.hu/api.php?action=products
✅ Products loaded!
```

---

## 🎯 **MŰKÖDÉS:**

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ AJAX
       ▼
┌─────────────────┐
│   api.php       │  ◄─── FTP feltöltve (UNAS szerver)
│  (PHP Proxy)    │
└──────┬──────────┘
       │ XML Request
       ▼
┌─────────────────┐
│   UNAS API      │
│ api.unas.eu     │
└─────────────────┘
```

---

## ⚙️ **API KONFIGURÁCIÓ:**

Az `api.php` fájl tartalmazza a következő beállításokat:

```php
define('UNAS_API_KEY', '9a6522bfbcd56045cda463a90d7476d932338f52');
define('UNAS_API_URL', 'https://api.unas.eu/shop');
```

**Ha az API kulcs megváltozott:**
1. Szerkeszd az `api.php` fájlt
2. Frissítsd az `UNAS_API_KEY` értékét
3. Töltsd fel újra FTP-n

---

## 📊 **API ENDPOINTS:**

| Endpoint | Leírás | Paraméterek |
|----------|--------|-------------|
| `?action=health` | API health check | - |
| `?action=products` | Termékek lekérése | `limit`, `offset`, `category`, `search` |

---

## 🔍 **HIBAELHÁRÍTÁS:**

### **404 Not Found - api.php**

**Probléma:** Az `api.php` nem érhető el.

**Megoldás:**
- Ellenőrizd hogy az `api.php` a helyes mappában van
- CHMOD 644 engedélyek
- `.htaccess` nem blokkolja-e

### **CORS Error**

**Probléma:** `Access-Control-Allow-Origin` hiba.

**Megoldás:** Az `api.php` már tartalmazza a CORS header-eket:
```php
header('Access-Control-Allow-Origin: https://www.marketly.hu');
```

### **UNAS Login Failed**

**Probléma:** `UNAS Login failed: 401`

**Megoldás:**
- Ellenőrizd az `UNAS_API_KEY`-t
- UNAS Admin → Beállítások → API → API kulcs aktív?

---

## 📝 **JEGYZET:**

- ✅ **Nincs Node.js** szükséges (csak PHP az UNAS-on)
- ✅ **Nincs adatbázis** szükséges (direkt UNAS API hívás)
- ✅ **Biztonságos** (API kulcs szerver oldalon)
- ✅ **Gyors deployment** (1 fájl FTP-n)

---

## 🎉 **SIKERES DEPLOYMENT UTÁN:**

1. ✅ `api.php` elérhető: `https://www.marketly.hu/api.php`
2. ✅ UNAS Script Tag frissítve
3. ✅ Frontend működik: `https://www.marketly.hu/butorbolt`
4. ✅ Termékek betöltődnek az UNAS-ból!

---

**Kérdés esetén nézd meg a console log-okat (F12)!** 📊
