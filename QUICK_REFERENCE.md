# 🚀 Gyors Referencia - UNAS XML API

## Szerver Indítás

```bash
npm run server
```

⏱️ Várj 2-10 másodpercet az első szinkronizációra.

---

## Ellenőrzés

```bash
# Statisztikák
curl http://localhost:3001/api/stats

# Termékek (első 10)
curl http://localhost:3001/api/products?limit=10

# Kategóriák
curl http://localhost:3001/api/categories

# Szinkronizációs előzmények
curl http://localhost:3001/api/admin/sync/history
```

---

## Manuális Szinkronizáció

```bash
# Teljes szinkronizáció
curl -X POST http://localhost:3001/api/admin/sync

# Csak bizonyos kategóriák
curl -X POST http://localhost:3001/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Székek", "Asztalok"]}'
```

---

## Kategória Szűrés

**`.env` fájlban:**

```env
# Csak bizonyos kategóriák
ALLOWED_CATEGORIES=Bútorok,Székek,Asztalok,Kanapék

# Vagy minden kategória
ALLOWED_CATEGORIES=
```

Módosítás után indítsd újra a szervert!

---

## Termék Kezelés

```bash
# Termék letiltása az AI-ból
curl -X PATCH http://localhost:3001/api/admin/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"show_in_ai": false}'

# Prioritás beállítása
curl -X PATCH http://localhost:3001/api/admin/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"priority": 100}'

# Egyedi leírás
curl -X PATCH http://localhost:3001/api/admin/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"custom_description": "Prémium bútor"}'
```

---

## Hibaelhárítás

### Nincs termék?

1. **Nézd a logokat:**
   ```bash
   npm run server
   ```
   Keress: `"UNAS API Error Response"` vagy `"No products found"`

2. **Teszteld az API-t:**
   ```bash
   curl -X POST https://api.unas.eu/shop/getProducts \
     -H "Content-Type: application/xml" \
     -d '<?xml version="1.0" encoding="UTF-8"?>
   <Request>
       <AuthCode>98ff143933</AuthCode>
       <ShopId>81697</ShopId>
   </Request>'
   ```

3. **Ellenőrizd a hitelesítést:**
   - UNAS admin: `https://www.marketly.hu/admin`
   - API beállítások → AuthCode ellenőrzése

### HTTP 400 hiba?

- **Hibás AuthCode vagy ShopId** → Ellenőrizd a `.env` fájlt
- **Premium/VIP szükséges** → UNAS előfizetés frissítése

### Adatbázis reset

```bash
# PowerShell
Remove-Item -Path data -Recurse -Force
npm run server

# Bash
rm -rf data/
npm run server
```

---

## Fájlok

| Fájl | Leírás |
|------|--------|
| `.env` | Konfiguráció (AuthCode, ShopId) |
| `server/services/syncService.js` | XML API kommunikáció |
| `server/transformers/unasParser.js` | XML parsing logika |
| `data/products.db` | SQLite adatbázis |

---

## Dokumentációk

- **`XML_API_READY.md`** - Áttekintés és használat
- **`UNAS_XML_API.md`** - UNAS API részletek
- **`DATABASE.md`** - Adatbázis API dokumentáció
- **`QUICKSTART_DB.md`** - Gyors kezdés magyarul

---

## Gyakori Parancsok

```bash
# Teljes stack indítás (backend + frontend)
npm run dev:full

# Csak backend
npm run server

# Adatbázis teszt
npm run test:db

# Adatbázis reset
npm run db:reset
```

---

## URL-ek

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Admin panel:** http://localhost:3001/api/admin/*
- **UNAS Admin:** https://www.marketly.hu/admin

---

## Konfiguráció Gyors Ellenőrzés

```bash
# Nézd meg a .env fájlt
cat .env | grep UNAS

# Kell látni:
# UNAS_API_URL=https://api.unas.eu/shop/getProducts
# UNAS_SHOP_ID=81697
# UNAS_AUTH_CODE=98ff143933
```

---

✅ **Minden készen áll! Indítsd: `npm run server`** 🚀
