# 📋 Gyors Útmutató - Adatbázis Használat

## 1️⃣ Első Lépések

### Kategóriák beállítása

Nyisd meg a `.env` fájlodat és állítsd be a kategóriákat:

```env
# Csak ezeket a kategóriákat szinkronizálja:
ALLOWED_CATEGORIES=Bútorok,Székek,Asztalok,Kanapék,Szekrények

# VAGY hagyd üresen, hogy MINDEN kategória jöjjön:
ALLOWED_CATEGORIES=
```

### Szerver indítása

```bash
npm run server
```

Várj ~2-3 másodpercet, amíg az első szinkronizáció lefut.

### Termékek ellenőrzése

Nyisd meg böngészőben vagy curl-al:

```
http://localhost:3001/api/products
```

## 2️⃣ Gyakori Műveletek

### ✅ Termékek lekérése

```bash
# Összes termék
curl http://localhost:3001/api/products

# Csak "Székek" kategória
curl http://localhost:3001/api/products?category=Székek

# Keresés
curl "http://localhost:3001/api/products?search=modern"

# Lapozás
curl "http://localhost:3001/api/products?limit=50&offset=0"
```

### 🔄 Szinkronizáció UNAS-ból

```bash
# Teljes szinkronizáció (az engedélyezett kategóriákból)
curl -X POST http://localhost:3001/api/admin/sync

# Csak adott kategóriák szinkronizálása
curl -X POST http://localhost:3001/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Székek", "Asztalok"]}'
```

### 📊 Statisztikák megtekintése

```bash
curl http://localhost:3001/api/stats
```

Válasz:
```json
{
  "total_products": 250,
  "active_products": 200,
  "in_stock_products": 180,
  "categories_count": 5,
  "last_sync": "2026-01-25T12:30:00.000Z"
}
```

### 🔧 Termék módosítása

```bash
# Termék letiltása az AI-ból
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"show_in_ai": false}'

# Prioritás beállítása (magasabb = előrébb kerül)
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"priority": 100}'

# Egyedi leírás hozzáadása az AI számára
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"custom_description": "Prémium skandináv design szék"}'
```

### 🗑️ Termék törlése

```bash
curl -X DELETE http://localhost:3001/api/admin/products/unas-prod-123
```

### 📂 Kategória kezelés

```bash
# Kategória letiltása
curl -X PATCH http://localhost:3001/api/admin/categories/Székek \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Majd újraszinkronizálás
curl -X POST http://localhost:3001/api/admin/sync
```

## 3️⃣ Termék Tulajdonságok

### Milyen mezők vannak?

Minden terméknek van:

**UNAS-ból jövő adatok:**
- `id` - Egyedi azonosító
- `name` - Termék neve
- `price` - Bruttó ár (Ft-ban, egész szám)
- `category` - Kategória neve
- `images` - Képek tömbje (URL-ek)
- `description` - Leírás
- `params` - Paraméterek (pl. "Anyag: fa, Szín: fehér")
- `link` - Termék linkje
- `in_stock` - Raktáron van-e (true/false)

**Egyedi beállítások:**
- `show_in_ai` - Megjelenjen-e az AI-ban (true/false)
- `priority` - Prioritás (0-1000, alapértelmezett: 0)
- `custom_description` - Egyedi leírás az AI számára

**Metaadatok:**
- `created_at` - Létrehozás ideje
- `updated_at` - Utolsó módosítás
- `last_synced_at` - Utolsó szinkronizáció

## 4️⃣ Munkafolyamat Példák

### Új termékfeed beállítása kategóriákkal

1. **Állítsd be a kategóriákat** a `.env` fájlban:
   ```env
   ALLOWED_CATEGORIES=Székek,Asztalok,Kanapék
   ```

2. **Indítsd el a szervert:**
   ```bash
   npm run server
   ```

3. **Ellenőrizd a szinkronizációt:**
   ```bash
   curl http://localhost:3001/api/admin/sync/history
   ```

4. **Nézd meg a termékeket:**
   ```bash
   curl http://localhost:3001/api/products
   ```

### Termékek "kurálása" (válogatás)

1. **Nézd meg az összes terméket:**
   ```bash
   curl http://localhost:3001/api/admin/products
   ```

2. **Tiltsd le a nem kívánatos termékeket:**
   ```bash
   curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-999 \
     -H "Content-Type: application/json" \
     -d '{"show_in_ai": false}'
   ```

3. **Prioritizáld a fontos termékeket:**
   ```bash
   curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-111 \
     -H "Content-Type: application/json" \
     -d '{"priority": 100}'
   ```

4. **Ellenőrizd az aktív termékeket:**
   ```bash
   curl http://localhost:3001/api/products
   ```

### Kategória váltás

1. **Módosítsd a `.env` fájlt:**
   ```env
   ALLOWED_CATEGORIES=Fotelek,Relax_székek
   ```

2. **Indítsd újra a szervert** (vagy használd a `.env` reload-ot)

3. **Szinkronizálj:**
   ```bash
   curl -X POST http://localhost:3001/api/admin/sync
   ```

## 5️⃣ Hasznos Tippek

### 🔍 Termék ID megkeresése

Ha tudod a termék nevét:

```bash
curl "http://localhost:3001/api/admin/products?search=modern+szék" | grep -A5 '"name"'
```

### 📈 Kategóriák listázása

```bash
curl http://localhost:3001/api/categories
```

### 🧹 Adatbázis reset (minden törlése)

**Windows PowerShell:**
```powershell
Remove-Item -Path data -Recurse -Force
npm run server
```

**Linux/Mac:**
```bash
rm -rf data/
npm run server
```

### 📝 Szinkronizációs előzmények

```bash
# Utolsó 20 szinkronizáció
curl http://localhost:3001/api/admin/sync/history?limit=20
```

## 6️⃣ Hibaelhárítás

### "No products returned"

**Probléma:** Nem jönnek termékek.

**Megoldás:**
1. Ellenőrizd a `.env` fájlban az `ALLOWED_CATEGORIES` értéket
2. Futtass manuális szinkronizációt: `curl -X POST http://localhost:3001/api/admin/sync`
3. Nézd meg az admin API-t: `curl http://localhost:3001/api/admin/products`

### "Database is locked"

**Probléma:** Adatbázis zárolva.

**Megoldás:**
1. Zárd be a szervert (Ctrl+C)
2. Indítsd újra: `npm run server`

### Lassú működés

**Probléma:** Sok termék esetén lassú a lekérdezés.

**Megoldás:**
- Használj lapozást: `?limit=50&offset=0`
- Szűrj kategóriára: `?category=Székek`
- Csak aktív termékek: alapértelmezett a frontend API-n

## 7️⃣ API Összefoglaló

| Végpont | Metódus | Leírás |
|---------|---------|--------|
| `/api/products` | GET | Termékek (csak AI-ban aktívak) |
| `/api/products/:id` | GET | Egyetlen termék |
| `/api/categories` | GET | Kategóriák listája |
| `/api/stats` | GET | Statisztikák |
| `/api/admin/sync` | POST | Szinkronizáció UNAS-ból |
| `/api/admin/sync/history` | GET | Szinkronizációs előzmények |
| `/api/admin/products` | GET | Összes termék (admin) |
| `/api/admin/products/:id` | PATCH | Termék módosítása |
| `/api/admin/products/:id` | DELETE | Termék törlése |
| `/api/admin/categories/:name` | PATCH | Kategória ki/bekapcsolása |

---

**További részletek:** Lásd `DATABASE.md` és `DATABASE_SETUP.md`
