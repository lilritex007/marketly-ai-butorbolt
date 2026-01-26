# Adatbázis Integráció - Használati Útmutató

## Áttekintés

Az alkalmazás most **SQLite adatbázist** használ a termékek tárolására az UNAS API memória cache helyett. Ez lehetővé teszi:

✅ **Perzisztens tárolás** - A termékek adatbázisban maradnak  
✅ **Kategória szűrés** - Csak kiválasztott kategóriák szinkronizálása  
✅ **Termékszintű kontroll** - Egyedi beállítások termékenkénti  
✅ **Gyorsabb lekérdezések** - Indexelt adatbázis keresés  
✅ **Admin kezelőfelület API** - Termékek kezelése programozottan

## Új Architektúra

```
UNAS API
    ↓
Szinkronizáció (kategória szűréssel)
    ↓
SQLite Adatbázis (data/products.db)
    ↓
Backend API
    ↓
Frontend
```

## Első Indítás

### 1. Telepítés

A `better-sqlite3` csomag már telepítve van. Ha még nem lenne:

```bash
npm install
```

### 2. Környezeti Változók

A `.env` fájlban add meg a kategóriákat, amelyeket szinkronizálni szeretnél:

```env
# Kategória szűrés (vesszővel elválasztva)
ALLOWED_CATEGORIES=Bútorok,Székek,Asztalok,Kanapék

# Ha üres vagy nincs megadva, az ÖSSZES kategória szinkronizálódik
ALLOWED_CATEGORIES=

# Automatikus szinkronizáció időköze (percben)
AUTO_SYNC_INTERVAL=60
```

### 3. Szerver Indítása

```bash
npm run server
```

Az első indításkor:
- Automatikusan létrejön a `data/products.db` adatbázis
- 2 másodperc múlva elindul az első szinkronizáció
- A termékek letöltődnek és mentésre kerülnek

## API Végpontok

### 📦 Publikus API (Frontend számára)

#### `GET /api/products`

Termékek lekérése (csak AI-ban engedélyezett termékek)

**Query paraméterek:**
- `category` - Kategória szűrés
- `search` - Keresés név/leírás/paraméterek alapján
- `limit` - Max találatok (alapértelmezett: 100)
- `offset` - Lapozás offset

**Példa:**
```
GET /api/products?category=Székek&limit=20
```

**Válasz:**
```json
{
  "products": [...],
  "total": 150,
  "count": 20,
  "lastSync": "2026-01-25T10:30:00Z"
}
```

#### `GET /api/products/:id`

Egyetlen termék lekérése ID alapján

#### `GET /api/categories`

Elérhető kategóriák listája

#### `GET /api/stats`

Statisztikák (összes termék, aktív termékek, stb.)

---

### 🔧 Admin API (Kezelés)

#### `POST /api/admin/sync`

Manuális szinkronizáció indítása az UNAS API-ból

**Body (opcionális):**
```json
{
  "categories": ["Székek", "Asztalok"]
}
```

**Válasz:**
```json
{
  "success": true,
  "fetched": 250,
  "added": 30,
  "updated": 220,
  "syncId": 5
}
```

#### `GET /api/admin/sync/history`

Szinkronizációs előzmények megtekintése

**Query:** `limit=10` (alapértelmezett: 10)

#### `GET /api/admin/products`

Összes termék lekérése (beleértve a letiltottakat is)

**Query paraméterek:**
- `category`
- `search`
- `showInAI=true/false` - Szűrés AI engedély alapján
- `limit`
- `offset`

#### `PATCH /api/admin/products/:id`

Termék AI beállításainak módosítása

**Body:**
```json
{
  "show_in_ai": true,
  "priority": 10,
  "custom_description": "Egyedi leírás az AI számára"
}
```

**Mezők:**
- `show_in_ai` (boolean) - Megjelenjen-e az AI-ban
- `priority` (integer) - Prioritás (magasabb = előbb jelenik meg)
- `custom_description` (string) - Egyedi leírás az AI kontextushoz

#### `DELETE /api/admin/products/:id`

Termék törlése az adatbázisból

#### `PATCH /api/admin/categories/:name`

Kategória engedélyezése/letiltása

**Body:**
```json
{
  "enabled": false
}
```

---

## Adatbázis Struktúra

### `products` tábla

| Mező | Típus | Leírás |
|------|-------|--------|
| `id` | TEXT | Elsődleges kulcs |
| `unas_id` | TEXT | UNAS termék ID |
| `name` | TEXT | Termék neve |
| `price` | INTEGER | Bruttó ár |
| `category` | TEXT | Kategória neve |
| `category_path` | TEXT | Teljes kategória útvonal |
| `images` | TEXT | JSON tömb a képekkel |
| `description` | TEXT | Leírás |
| `params` | TEXT | Paraméterek szövegesen |
| `link` | TEXT | Termék link |
| `in_stock` | BOOLEAN | Raktáron van-e |
| **`show_in_ai`** | BOOLEAN | **Megjelenjen-e az AI-ban** |
| **`priority`** | INTEGER | **Prioritás (sorrend)** |
| **`custom_description`** | TEXT | **Egyedi AI leírás** |
| `created_at` | DATETIME | Létrehozás ideje |
| `updated_at` | DATETIME | Utolsó módosítás |
| `last_synced_at` | DATETIME | Utolsó szinkronizáció |

### `categories` tábla

Kategóriák konfigurációja (mely kategóriák szinkronizáljanak)

### `sync_history` tábla

Szinkronizációs műveletek naplózása

---

## Használati Példák

### 1. Első Szinkronizáció Kategóriákkal

```bash
# .env fájlban
ALLOWED_CATEGORIES=Székek,Asztalok,Kanapék

# Szerver indítás
npm run server

# Vagy manuális szinkronizáció
curl -X POST http://localhost:3001/api/admin/sync
```

### 2. Termék Letiltása az AI-ból

```bash
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"show_in_ai": false}'
```

### 3. Termék Prioritás Növelése

```bash
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-456 \
  -H "Content-Type: application/json" \
  -d '{"priority": 100}'
```

### 4. Kategória Letiltása

```bash
curl -X PATCH http://localhost:3001/api/admin/categories/Székek \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Majd újraszinkronizálás
curl -X POST http://localhost:3001/api/admin/sync
```

### 5. Egyedi Leírás Hozzáadása

```bash
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-789 \
  -H "Content-Type: application/json" \
  -d '{"custom_description": "Ez egy prémium design szék skandináv stílusban"}'
```

---

## Előnyök vs. Régi Megoldás

| Funkció | Régi (Cache) | Új (Adatbázis) |
|---------|--------------|----------------|
| **Perzisztencia** | ❌ Újraindítás = adat vész | ✅ Megmarad |
| **Kategória szűrés** | ❌ Nincs | ✅ Van |
| **Termék kontroll** | ❌ Nincs | ✅ Termékenkénti beállítás |
| **Keresés** | ⚠️ Memóriában | ✅ Indexelt |
| **Módosíthatóság** | ❌ Csak UNAS-ból | ✅ Egyedi beállítások |
| **Statisztikák** | ❌ Nincs | ✅ Teljes |

---

## Javasolt Munkafolyamat

### Kezdeti Beállítás

1. **Kategóriák kiválasztása** a `.env` fájlban
2. **Első szinkronizáció** indítása
3. **Termékek áttekintése** az admin API-n keresztül
4. **Felesleges termékek letiltása** (`show_in_ai = false`)

### Rendszeres Működés

- **Automatikus szinkronizáció** 60 percenként (beállítható)
- **Manuális frissítés** szükség esetén (`POST /api/admin/sync`)
- **Új termékek** automatikusan `show_in_ai = true` állapottal jönnek
- **Frontend** csak az engedélyezett termékeket látja

---

## Migráció Ellenőrzése

### Tesztelés

```bash
# 1. Szerver indítása
npm run server

# 2. Termékek lekérése
curl http://localhost:3001/api/products

# 3. Statisztikák megtekintése
curl http://localhost:3001/api/stats

# 4. Szinkronizációs előzmények
curl http://localhost:3001/api/admin/sync/history
```

### Adatbázis Elérése

Az SQLite adatbázis közvetlenül is elérhető:

```bash
# Telepítsd az sqlite3 CLI-t, majd:
sqlite3 data/products.db

# SQL lekérdezések
SELECT COUNT(*) FROM products;
SELECT category, COUNT(*) FROM products GROUP BY category;
SELECT * FROM products WHERE show_in_ai = 0;
```

---

## Hibaelhárítás

### "Database is locked"

SQLite WAL módban van, ami csökkenti a lock problémákat. Ha mégis előfordul:
- Zárd be az összes kapcsolatot
- Indítsd újra a szervert

### "No products returned"

- Ellenőrizd a `.env` fájl `ALLOWED_CATEGORIES` beállítását
- Futtass manuális szinkronizációt: `POST /api/admin/sync`
- Nézd meg az admin API-t: `GET /api/admin/products`

### Teljes Reset

```bash
# Adatbázis törlése és újrakezdés
rm -rf data/
npm run server
# Új adatbázis jön létre és szinkronizálódik
```

---

## Következő Lépések

1. ✅ **Adatbázis működik** - Termékek perzisztens tárolása
2. ✅ **Kategória szűrés** - Csak kiválasztott kategóriák
3. ✅ **Admin API** - Termékek kezelése
4. 🔜 **Admin UI** - Webes felület (következő fejlesztés)
5. 🔜 **Batch műveletek** - Több termék egyszerre

---

Bármilyen kérdés esetén ellenőrizd a konzol logokat vagy nézd meg a `sync_history` táblát!
