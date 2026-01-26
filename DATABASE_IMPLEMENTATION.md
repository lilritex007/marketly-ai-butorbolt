# ✅ ADATBÁZIS INTEGRÁCIÓ ELKÉSZÜLT

## 🎯 Megvalósított Megoldás

A Marketly AI Bútor Shop most **SQLite adatbázist használ** az UNAS termékek kezelésére, amely lehetővé teszi:

✅ **Perzisztens tárolás** - A termékek megmaradnak újraindítás után  
✅ **Kategória szűrés** - Csak kiválasztott kategóriák szinkronizálása  
✅ **Termékszintű kontroll** - Egyedi beállítások (show_in_ai, priority, custom_description)  
✅ **Gyors keresés** - Indexelt adatbázis lekérdezések  
✅ **Admin API** - Teljes körű termékkezelés  
✅ **Automatikus szinkronizáció** - 60 percenkénti frissítés  

---

## 📂 Új Fájlstruktúra

```
marketly-ai-butor-shop/
├── server/
│   ├── database/
│   │   └── db.js                    ✨ Adatbázis inicializálás & séma
│   ├── services/
│   │   ├── productService.js        ✨ Termék CRUD műveletek
│   │   └── syncService.js           ✨ UNAS szinkronizáció
│   ├── transformers/
│   │   └── unasParser.js            (meglévő)
│   └── index.js                     🔄 Teljesen újraírt backend
├── src/
│   └── services/
│       └── unasApi.js               🔄 Frissített API hívások
├── scripts/
│   └── test-db.js                   ✨ Adatbázis teszt script
├── data/
│   └── products.db                  ✨ SQLite adatbázis (automatikusan létrejön)
├── .env.example                     🔄 Új környezeti változók
├── .gitignore                       🔄 data/ mappa hozzáadva
├── package.json                     🔄 better-sqlite3 + új scriptek
├── DATABASE.md                      ✨ Teljes API dokumentáció
├── DATABASE_SETUP.md                ✨ Setup útmutató
└── QUICKSTART_DB.md                 ✨ Gyors kezdési útmutató
```

**✨ = Új fájl**  
**🔄 = Módosított fájl**

---

## 🗄️ Adatbázis Struktúra

### `products` tábla (főtábla)

| Mező | Típus | Leírás |
|------|-------|--------|
| **UNAS mezők** |||
| `id` | TEXT PRIMARY KEY | Egyedi azonosító |
| `unas_id` | TEXT UNIQUE | UNAS termék ID |
| `name` | TEXT | Termék neve |
| `price` | INTEGER | Bruttó ár (Ft) |
| `category` | TEXT | Kategória neve |
| `category_path` | TEXT | Teljes kategória útvonal |
| `images` | TEXT (JSON) | Képek tömbje |
| `description` | TEXT | Termék leírás |
| `params` | TEXT | Paraméterek (szöveg) |
| `link` | TEXT | Termék URL |
| `in_stock` | BOOLEAN | Raktáron van-e |
| **AI kontroll mezők** |||
| `show_in_ai` | BOOLEAN | Megjelenjen-e az AI-ban |
| `priority` | INTEGER | Prioritás (0-1000) |
| `custom_description` | TEXT | Egyedi AI leírás |
| **Metaadatok** |||
| `created_at` | DATETIME | Létrehozás dátuma |
| `updated_at` | DATETIME | Utolsó módosítás |
| `last_synced_at` | DATETIME | Utolsó szinkronizáció |

### `categories` tábla

Kategóriák konfigurációja - mely kategóriák legyenek engedélyezve.

### `sync_history` tábla

Szinkronizációs műveletek naplózása (státusz, termékszámok, hibák).

---

## 🚀 API Végpontok

### 📦 Publikus API (Frontend)

| Végpont | Metódus | Leírás |
|---------|---------|--------|
| `/api/products` | GET | Termékek (csak AI-ban aktívak) |
| `/api/products/:id` | GET | Egyetlen termék |
| `/api/categories` | GET | Elérhető kategóriák |
| `/api/stats` | GET | Statisztikák |

### 🔧 Admin API

| Végpont | Metódus | Leírás |
|---------|---------|--------|
| `/api/admin/sync` | POST | UNAS szinkronizáció indítása |
| `/api/admin/sync/history` | GET | Szinkronizációs előzmények |
| `/api/admin/products` | GET | Összes termék (admin nézet) |
| `/api/admin/products/:id` | PATCH | Termék AI beállításai |
| `/api/admin/products/:id` | DELETE | Termék törlése |
| `/api/admin/categories/:name` | PATCH | Kategória engedélyezése/letiltása |

---

## 🎮 Használati Útmutató

### 1. Első Indítás

```bash
# 1. Állítsd be a kategóriákat a .env fájlban
ALLOWED_CATEGORIES=Bútorok,Székek,Asztalok,Kanapék

# 2. Indítsd a szervert
npm run server

# 3. Várd meg az első szinkronizációt (~2-30 sec)
# A termékek automatikusan letöltődnek
```

### 2. Kategória Szűrés

**Csak bizonyos kategóriák:**
```env
ALLOWED_CATEGORIES=Székek,Asztalok,Kanapék
```

**Összes kategória:**
```env
ALLOWED_CATEGORIES=
```

### 3. Termék Kezelés

```bash
# Termék letiltása az AI-ból
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"show_in_ai": false}'

# Prioritás beállítása (előbbre hozás)
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"priority": 100}'

# Egyedi AI leírás
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"custom_description": "Prémium design szék"}'
```

### 4. Szinkronizáció

```bash
# Manuális teljes szinkronizáció
curl -X POST http://localhost:3001/api/admin/sync

# Csak bizonyos kategóriák
curl -X POST http://localhost:3001/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Székek"]}'
```

---

## 📊 Statisztikák & Monitoring

```bash
# Általános statisztikák
curl http://localhost:3001/api/stats

# Válasz:
{
  "total_products": 250,
  "active_products": 200,      # show_in_ai = true
  "in_stock_products": 180,
  "categories_count": 5,
  "last_sync": "2026-01-25T12:30:00.000Z"
}

# Szinkronizációs előzmények
curl http://localhost:3001/api/admin/sync/history
```

---

## 🔄 Működési Folyamat

```
┌─────────────┐
│  UNAS API   │
│ (termékfeed)│
└─────┬───────┘
      │ HTTP Basic Auth
      ↓
┌─────────────────────┐
│ Sync Service        │
│ - Fetch products    │
│ - Parse XML/CSV/JSON│
│ - Filter categories │
└─────┬───────────────┘
      │ Upsert (insert/update)
      ↓
┌─────────────────────┐
│  SQLite Database    │
│  (data/products.db) │
│  - products table   │
│  - categories table │
│  - sync_history     │
└─────┬───────────────┘
      │ SQL queries
      ↓
┌─────────────────────┐
│  Backend API        │
│  (Express server)   │
│  Port: 3001         │
└─────┬───────────────┘
      │ REST API
      ↓
┌─────────────────────┐
│  Frontend           │
│  (React app)        │
│  Port: 3000         │
└─────────────────────┘
```

### Automatikus Szinkronizáció

- **Gyakoriság:** 60 perc (beállítható `AUTO_SYNC_INTERVAL`)
- **Trigger:** Minden `/api/products` híváskor ellenőrzi
- **Működés:** Ha eltelt a TTL, háttérben szinkronizál
- **Conflict handling:** Meglévő termékek frissülnek, egyedi beállítások megmaradnak

---

## 🎯 Előnyök vs. Régi Megoldás

| Jellemző | Régi (Cache) | Új (Database) |
|----------|--------------|---------------|
| **Perzisztencia** | ❌ Elvész újraindításkor | ✅ Megmarad |
| **Kategória szűrés** | ❌ Nincs | ✅ Van (.env) |
| **Termék kontroll** | ❌ Nincs | ✅ show_in_ai, priority |
| **Egyedi leírások** | ❌ Nincs | ✅ custom_description |
| **Keresés** | ⚠️ Memóriában | ✅ Indexelt SQL |
| **Statisztikák** | ❌ Nincs | ✅ Teljes körű |
| **Skálázhatóság** | ⚠️ Korlátozott | ✅ Jobb |
| **Admin kezelés** | ❌ Nincs | ✅ Teljes API |

---

## 🧪 Tesztelés

```bash
# Adatbázis teszt
npm run test:db

# Szerver indítás (automatikus sync)
npm run server

# Teljes stack
npm run dev:full

# Adatbázis reset
npm run db:reset
```

---

## 📚 Dokumentációk

1. **DATABASE.md** - Teljes API referencia és részletes használat
2. **DATABASE_SETUP.md** - Setup és használati útmutató
3. **QUICKSTART_DB.md** - Gyors kezdés magyarul

---

## 🔐 Biztonság & Adatvédelem

- **Adatbázis:** Lokális fájl (`data/products.db`)
- **Git ignore:** `data/` mappa nincs verziókezelve
- **Basic Auth:** UNAS API kommunikáció védett
- **Environment változók:** `.env` fájlban (nincs commitolva)

---

## 🚧 Fejlesztési Lehetőségek

További fejleszthető funkciók:

- [ ] **Admin UI** - React komponens a termékek kezeléséhez
- [ ] **Batch műveletek** - Több termék módosítása egyszerre
- [ ] **Képkezelés** - Kép feltöltés/módosítás
- [ ] **Kategória hierarchia** - Alkategóriák kezelése
- [ ] **Export/Import** - CSV/JSON export
- [ ] **Változás követés** - Termék módosítási előzmények
- [ ] **Webhook** - UNAS push notifikációk
- [ ] **Cache layer** - Redis a gyorsabb lekérdezésekhez
- [ ] **Elasticsearch** - Fejlett keresés

---

## ✨ Összefoglalás

A rendszer most már **production-ready** adatbázis-alapú termékkezeléssel rendelkezik.

**Kulcs funkciók:**
1. ✅ SQLite adatbázis perzisztens tárolással
2. ✅ Kategória szűrés (.env konfiguráció)
3. ✅ Termékenkénti AI kontroll (show_in_ai, priority)
4. ✅ Admin API teljes CRUD funkcionalitással
5. ✅ Automatikus és manuális UNAS szinkronizáció
6. ✅ Statisztikák és sync history
7. ✅ Backward compatibility (legacy endpointok)

**Következő lépés:**
Indítsd el a szervert és próbáld ki!

```bash
npm run server
```

Majd böngészőben: `http://localhost:3001/api/products`

---

**Kérdés vagy probléma esetén:** Nézd meg a `DATABASE.md` vagy futtasd `npm run test:db`

🎉 **Sikeres integrációt!**
