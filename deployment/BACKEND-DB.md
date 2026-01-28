# Backend és DB – egyetlen igazságforrás

## Mit várunk el

- **Frontend** frissül, ha módosítást hajtunk rajta végre (build → CDN / script src).
- **Backend** valós időben alátámasztja a működést: termékek az **adatbázisból** jönnek.
- **Termékek**: az adatbázisban maradnak fixen; ár, készlet stb. a DB-ben történő változás (sync után) szerint módosul.
- **Napi frissítések** + esetleges manuális deploy után is konzisztens adat, **hiba és összeomlás nélkül**.

---

## Architektura (rövid)

```
UNAS API (ár, készlet, termékek)
       ↓ sync (POST /api/admin/sync vagy auto/scheduled)
   [Backend]
       ↓ SQLite (data/products.db)
   DB = egyetlen igazságforrás
       ↓ GET /api/products, /api/products/:id
   Frontend (HTML inject + script src) → csak API-t hív, nincs static JSON
```

- **HTML inject + script src**: az UNAS shop oldalába injektált kód + egy script tag betölti a frontendet.
- **Frontend**: mindig a **backend API**-t hívja termékekre (`fetchUnasProducts` → GET `/api/products`). Nincs CDN static JSON első.
- **Backend**: minden terméklekérés a **DB**-ből történik; a sync (UNAS → DB) frissíti az árat, készletet stb.

---

## DB működés és frissítés (100%-os cél)

### 1. Adatbázis

- **Jelenleg**: SQLite, fájl `data/products.db` (a projekt gyökeréhez képest).
- **Séma**: `server/database/db.js` – `products`, `categories`, `sync_history` táblák.
- **Olvasás**: `productService.getProducts`, `getProductById` – soha nem dobnak, hiba esetén `[]` / `null`.
- **Írás**: csak a sync (UNAS → DB) és az admin (PATCH product, category toggle).

### 2. Sync (UNAS → DB)

- **Manuális**: `POST /api/admin/sync` (body opcionális: `{ "categories": ["Kategória1"] }`).
- **Auto**: `GET /api/products` hívásakor a backend ellenőrzi: ha 60 perc óta nem volt sikeres sync, elindul egy (nem blokkolja a választ).
- **Indítás**: szerver indulásakor 2 mp után egy kezdeti auto-sync.
- **Időzített (opcionális)**: környezeti változó `SYNC_CRON_HOURS=24` → 24 óránként egy sync (pl. napi frissítés).

Sync hiba **nem dönti le** a szervert: minden sync try/catch-ben fut, a GET /api/products válasza a meglévő DB tartalomból jön.

### 3. Health check

- `GET /health`: válasz `{ status: 'ok', db: 'ok', timestamp }`.
- Ha a DB olvasás hibára fut: HTTP 503, `{ status: 'degraded', db: 'error', message }`.
- Railway / külső monitoring: ezt a végpontot érdemes pingelni.

### 4. Hibák és összeomlás elkerülése

- **productService**: getProducts/getProductById hibában `[]` / `null`, nem throw.
- **syncService**: sync lock (egyszerre csak egy sync), hiba esetén sync_history-ba „failed”, szerver tovább fut.
- **Route-ok**: minden API handler try/catch; 500-nál JSON error, nem process.exit.
- **Frontend**: `fetchUnasProducts` soha nem throwol; hiba esetén `{ products: [], error: '...' }`, UI üres/üzenet.

---

## Railway: DB perzisztencia

A Railway **ephemeral filesystem**: új deploy/restart után a lemez tartalma törlődhet. Az SQLite fájl (`data/products.db`) ezért **nem marad meg**, hacsak nem perzisztens kötetet használsz.

### Opció A: Railway Volume (ajánlott SQLite-tal)

1. Railway projektben: **Volume** létrehozása, mount path pl. `data` (vagy ahova a kód írja a DB-t).
2. A `data` könyvtár a volume-ra legyen mountolva, hogy `data/products.db` a volume-on legyen.
3. Környezeti változóval opcionálisan felül lehet írni a DB útvonalat (ha a kód később támogatja), egyelőre a kód `data/products.db`-t használ – a volume mount pontjanak ennek meg kell felelnie.

### Opció B: Külső PostgreSQL

Ha Railway Postgres (vagy más Postgres) adatbázist használsz: a jelenlegi kód **SQLite**-ra épül (`better-sqlite3`). PostgreSQL-re váltáshez a backend adatbázis réteget át kell írni (pl. `pg` + ugyanaz a séma), ez külön feladat.

---

## Összefoglaló

| Feladat | Hol / hogyan |
|--------|---------------|
| Termékek forrása | DB (SQLite) – egyetlen igazságforrás |
| Frontend terméklekérés | Csak API: GET /api/products (nincs static JSON első) |
| DB frissítés | Sync: UNAS → backend → DB (manuális POST /api/admin/sync, auto 60 perc, opcionális SYNC_CRON_HOURS) |
| Napi frissítés | SYNC_CRON_HOURS=24 vagy külső cron: GET/POST hívás a sync triggerre |
| Health | GET /health – DB ellenőrzéssel, 503 ha DB nem elérhető |
| Hibamentes működés | Sync/DB hiba nem dönti le a szervert; frontend hiba esetén üres lista + error |

Ha a DB és a sync 100%-os (volume vagy Postgres + megbízható sync), a frontend mindig a backendől kapja a friss adatot, ár/készlet a sync után automatikusan módosul.
