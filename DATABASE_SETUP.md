# 🎉 Adatbázis Integráció Elkészült!

## Mi változott?

A rendszer most már **SQLite adatbázist** használ az UNAS termékek tárolására a korábbi memória cache helyett.

### ✅ Elkészült funkciók

1. **SQLite adatbázis** - `data/products.db` fájlban
2. **Perzisztens tárolás** - Termékek megmaradnak újraindítás után
3. **Kategória szűrés** - Csak kiválasztott kategóriák szinkronizálása
4. **Termékkezelés API** - Admin endpointok termékek ki/bekapcsolásához
5. **Szinkronizációs szolgáltatás** - Automatikus és manuális UNAS sync
6. **Statisztikák és előzmények** - Sync history, termékszámok

## 🚀 Gyors Indítás

### 1. Környezeti változók beállítása

Nyisd meg a `.env` fájlt és add meg, mely **kategóriákat** szeretnéd szinkronizálni:

```env
# Példa: csak bizonyos kategóriák
ALLOWED_CATEGORIES=Bútorok,Székek,Asztalok,Kanapék

# Vagy hagyd üresen az ÖSSZES kategóriához
ALLOWED_CATEGORIES=
```

### 2. Szerver indítása

```bash
npm run server
```

Első indításkor:
- ✅ Létrejön az adatbázis (`data/products.db`)
- ✅ 2 másodperc után automatikus szinkronizáció indul
- ✅ Termékek letöltődnek az UNAS API-ból

### 3. Teljes fejlesztői környezet

```bash
npm run dev:full
```

Ez egyszerre indítja:
- Backend szervert (port 3001)
- Frontend fejlesztői szervert (port 3000)

## 📡 API Végpontok

### Frontend számára (publikus)

```bash
# Termékek lekérése (csak AI-ban engedélyezett termékek)
GET http://localhost:3001/api/products

# Szűréssel
GET http://localhost:3001/api/products?category=Székek&search=modern&limit=20

# Egyetlen termék
GET http://localhost:3001/api/products/:id

# Kategóriák listája
GET http://localhost:3001/api/categories

# Statisztikák
GET http://localhost:3001/api/stats
```

### Admin API (kezelés)

```bash
# Manuális szinkronizáció UNAS-ból
POST http://localhost:3001/api/admin/sync

# Szinkronizációs előzmények
GET http://localhost:3001/api/admin/sync/history

# Összes termék (beleértve letiltottakat)
GET http://localhost:3001/api/admin/products

# Termék beállításainak módosítása
PATCH http://localhost:3001/api/admin/products/:id
Body: {"show_in_ai": false, "priority": 10}

# Termék törlése
DELETE http://localhost:3001/api/admin/products/:id

# Kategória ki/bekapcsolása
PATCH http://localhost:3001/api/admin/categories/:name
Body: {"enabled": false}
```

## 🎯 Használati Példák

### Termék letiltása az AI-ból

```bash
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-123 \
  -H "Content-Type: application/json" \
  -d '{"show_in_ai": false}'
```

### Csak "Székek" kategória szinkronizálása

```bash
curl -X POST http://localhost:3001/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Székek"]}'
```

### Termék prioritás növelése (előrébb jelenik meg)

```bash
curl -X PATCH http://localhost:3001/api/admin/products/unas-prod-456 \
  -H "Content-Type: application/json" \
  -d '{"priority": 100}'
```

## 🔧 Hasznos Parancsok

```bash
# Adatbázis teszt (ellenőrzés)
npm run test:db

# Adatbázis teljes reset
npm run db:reset
# (Windows) rm -rf data/
# (PowerShell) Remove-Item -Path data -Recurse -Force

# Szerver indítás debug móddal
DEBUG=* npm run server
```

## 📊 Adatbázis Struktúra

### `products` tábla

A termékek táblája tartalmazza:
- **UNAS mezők**: `name`, `price`, `category`, `images`, `description`, stb.
- **AI kontroll mezők**: 
  - `show_in_ai` - Megjelenjen-e az AI-ban (true/false)
  - `priority` - Prioritás (magasabb szám = előbb jelenik meg)
  - `custom_description` - Egyedi leírás az AI számára

### `categories` tábla

Kategóriák konfigurációja - mely kategóriák legyenek aktívak.

### `sync_history` tábla

Szinkronizációs műveletek naplója.

## 🎨 Frontend Változások

A frontend API hívások automatikusan frissültek:

```javascript
// Régi
const { products } = await fetchUnasProducts();

// Új (ugyanúgy működik + plusz lehetőségek)
const { products } = await fetchUnasProducts({ 
  category: 'Székek',
  search: 'modern',
  limit: 50 
});
```

## 🔄 Hogyan működik a szinkronizáció?

1. **Automatikus** - 60 percenként (konfigurálható `AUTO_SYNC_INTERVAL`)
2. **Manuális** - `POST /api/admin/sync` endpoint hívása
3. **Első indításkor** - 2 másodperc késleltetéssel

A szinkronizáció során:
- ✅ Letölti az UNAS termékeket
- ✅ Szűri a kiválasztott kategóriákra
- ✅ Hozzáadja az újakat
- ✅ Frissíti a meglévőket
- ✅ Megőrzi az egyedi beállításokat (`show_in_ai`, `priority`, `custom_description`)

## 🛡️ Adatvédelem

Az adatbázis lokálisan van a `data/` mappában, amely nincs git verziókezelés alatt (`.gitignore`-ban szerepel).

## 📚 Részletes Dokumentáció

Lásd: **`DATABASE.md`** - Teljes API referencia és példák

## ❓ Gyakori Kérdések

### Hogyan kezdjem használni most?

1. Állítsd be a kategóriákat a `.env` fájlban
2. Indítsd el: `npm run server`
3. Várd meg az első szinkronizációt (~10-30 mp)
4. Ellenőrizd: `curl http://localhost:3001/api/stats`

### Mi történik a régi termékekkel?

Az adatbázis üres induláskor. Az első szinkronizáció tölti fel.

### Hogyan törölhetek termékeket?

- **Soft delete**: `PATCH /api/admin/products/:id` + `{"show_in_ai": false}`
- **Hard delete**: `DELETE /api/admin/products/:id`

### Hogyan változtathatok kategóriát?

Módosítsd a `.env` fájlban az `ALLOWED_CATEGORIES` értéket, majd:

```bash
curl -X POST http://localhost:3001/api/admin/sync
```

### Backend nélkül is működik a frontend?

Nem, a frontend most már az adatbázis-alapú backend API-t használja.

## 🎊 Következő Lépések

Tovább fejleszthető:
- [ ] Admin webes felület (React komponens)
- [ ] Batch műveletek (több termék egyszerre)
- [ ] Képfeltöltés/módosítás
- [ ] Kategória szerkesztő UI
- [ ] Export/import funkció

---

**Kérdés vagy probléma?** Ellenőrizd a konzol logokat vagy futtasd: `npm run test:db`
