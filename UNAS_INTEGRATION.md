# UNAS API Integration - Dokumentáció

## Áttekintés

A Marketly.AI alkalmazás sikeresen integrálva lett a UNAS product feed API-val. Az integráció lehetővé teszi a termékadatok (árak, készletek, képek) valós idejű szinkronizálását automatikus és manuális frissítéssel.

## Architektúra

```
┌─────────────┐      HTTP/API      ┌──────────────┐     Auth + HTTP    ┌──────────┐
│   React     │ ─────────────────> │   Express    │ ─────────────────> │   UNAS   │
│  Frontend   │ <───────────────── │   Backend    │ <───────────────── │   API    │
│ (Port 3000) │     JSON Response  │ (Port 3001)  │    XML/JSON/CSV    │          │
└─────────────┘                    └──────────────┘                    └──────────┘
                                          │
                                          │ Cache
                                          ▼
                                    ┌──────────────┐
                                    │  In-Memory   │
                                    │    Cache     │
                                    │  (5 min TTL) │
                                    └──────────────┘
```

## Telepítés és Beállítás

### 1. Függőségek Telepítése

```bash
npm install
```

Ez telepíti az összes szükséges csomagot, beleértve:
- `express` - Backend szerver
- `cors` - CORS kezelés
- `dotenv` - Környezeti változók
- `node-fetch` - HTTP kérések
- `xml2js` - XML parsing
- `concurrently` - Frontend + Backend egyidejű futtatás

### 2. Környezeti Változók Beállítása

Másold le a `.env.example` fájlt `.env` néven:

```bash
cp .env.example .env
```

Töltsd ki a következő értékeket:

```env
# UNAS API konfiguráció (KÖTELEZŐ!)
UNAS_API_URL=https://www.marketly.hu/api/product-feed
UNAS_USERNAME=your_actual_username
UNAS_PASSWORD=your_actual_password

# Backend konfiguráció
PORT=3001
CACHE_TTL=300000
FRONTEND_URL=http://localhost:3000

# Frontend konfiguráció
VITE_API_URL=http://localhost:3001
```

### 3. Alkalmazás Indítása

**Frontend és Backend együtt (AJÁNLOTT):**
```bash
npm run dev:full
```

**Vagy külön-külön:**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Használat

### Automatikus Betöltés

Az alkalmazás indításakor automatikusan betöltődnek a UNAS termékek:
- Első betöltés az oldal megnyitásakor
- Automatikus frissítés 5 percenként
- Cache-elve az ismételt lekérdezések optimalizálására

### Manuális Frissítés

A felső sávban található **"UNAS Frissítés"** gomb:
- Kattintásra azonnal lekérdezi a legfrissebb adatokat
- Bypass-olja a cache-t
- Mutatja a betöltés állapotát (animált ikon)

### CSV Fallback

A **"CSV"** gomb továbbra is elérhető:
- CSV fájlból való termékbetöltéshez
- Tesztelési célokra
- Offline működéshez

## API Endpointok

### Backend Endpointok

#### GET /api/unas/products
Termékek lekérdezése (cache-elt)

**Query paraméterek:**
- `refresh=true` - Cache megkerülése, friss adat lekérdezése

**Válasz:**
```json
{
  "products": [...],
  "cached": false,
  "lastUpdated": "2026-01-25T12:00:00Z",
  "count": 150
}
```

#### GET /api/cache/info
Cache információk lekérdezése

**Válasz:**
```json
{
  "hasData": true,
  "productCount": 150,
  "timestamp": "2026-01-25T12:00:00Z",
  "age": 120,
  "ttl": 300
}
```

#### POST /api/cache/clear
Cache törlése

#### GET /health
Health check endpoint

## Támogatott Formátumok

A UNAS feed parser automatikusan felismeri és kezeli:

### 1. JSON
```json
{
  "products": [
    {
      "id": "123",
      "name": "Termék név",
      "price": 10000,
      ...
    }
  ]
}
```

### 2. XML
```xml
<?xml version="1.0"?>
<products>
  <product>
    <id>123</id>
    <name>Termék név</name>
    <price>10000</price>
  </product>
</products>
```

### 3. CSV
```csv
Termék Név;Bruttó Ár;Kategória;Kép link
"Kanapé";189900;"Bútor";https://...
```

## Mező Mapping

A parser automatikusan felismeri a következő mezőneveket:

| Frontend Mező | UNAS Lehetséges Mezők |
|--------------|----------------------|
| id | id, sku, product_id, item_id |
| name | name, title, product_name |
| price | price, g_price, brutto_price |
| category | category, product_type |
| images | image_link, images, img |
| description | description, g_description |
| link | link, url, product_url |
| inStock | availability, in_stock, stock |

## Hibaelhárítás

### Backend nem indul

**Probléma:** `Error: UNAS_API_URL not configured`

**Megoldás:** Ellenőrizd a `.env` fájlt, hogy tartalmazza-e az `UNAS_API_URL` értéket.

### CORS hiba

**Probléma:** `Access to fetch blocked by CORS policy`

**Megoldás:** 
1. Ellenőrizd, hogy a backend fut-e (`http://localhost:3001/health`)
2. Nézd meg a `FRONTEND_URL` beállítást a backend `.env` fájlban

### Authentikációs hiba

**Probléma:** `401 Unauthorized`

**Megoldás:** Ellenőrizd az `UNAS_USERNAME` és `UNAS_PASSWORD` értékeket a `.env` fájlban.

### Parsing hiba

**Probléma:** `Failed to parse UNAS data`

**Megoldás:**
1. Ellenőrizd a UNAS feed formátumát (XML/JSON/CSV)
2. Nézd meg a backend konzol logokat részletekért
3. Teszteld az endpointot közvetlenül: `curl http://localhost:3001/api/unas/products`

### Timeout hiba

**Probléma:** Lassú válaszidő vagy timeout

**Megoldás:**
1. Növeld a timeout értéket a `server/index.js` fájlban
2. Ellenőrizd a UNAS API elérhetőségét
3. Nézd meg a cache működését: `http://localhost:3001/api/cache/info`

## Tesztelés

### Backend Endpoint Tesztelés

```bash
# Health check
curl http://localhost:3001/health

# Termékek lekérdezése
curl http://localhost:3001/api/unas/products

# Friss adatok (cache bypass)
curl http://localhost:3001/api/unas/products?refresh=true

# Cache info
curl http://localhost:3001/api/cache/info
```

### Frontend Tesztelés

1. Nyisd meg: `http://localhost:3000`
2. Ellenőrizd a konzolt (F12) az API hívásokért
3. Kattints a "UNAS Frissítés" gombra
4. Nézd meg a "Frissítve: X perce" üzenetet

## Production Deployment

### Backend Hosting

Ajánlott platformok:
- **Vercel** (Serverless Functions)
- **Railway** (Node.js hosting)
- **Heroku** (Classic hosting)
- **DigitalOcean App Platform**

### Environment Variables

Production környezetben állítsd be:
```
UNAS_API_URL=https://your-production-domain.hu/api/feed
UNAS_USERNAME=production_user
UNAS_PASSWORD=production_password
PORT=3001
CACHE_TTL=300000
FRONTEND_URL=https://your-frontend-domain.com
```

### HTTPS

Production környezetben **mindig** HTTPS-t használj!

## Teljesítmény Optimalizálás

### Cache Beállítások

Állítsd be a `CACHE_TTL` értéket igény szerint:
- 300000 (5 perc) - gyakori változások
- 600000 (10 perc) - közepes frissítési igény
- 1800000 (30 perc) - ritkán változó adatok

### Rate Limiting

Éles környezetben fontold meg rate limiting hozzáadását:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60000, // 1 perc
  max: 10 // max 10 kérés percenként
});

app.use('/api/', limiter);
```

## Fejlesztői Megjegyzések

### Kód Struktúra

```
server/
├── index.js                 # Express szerver + cache
└── transformers/
    └── unasParser.js        # Feed parsing + transformation

src/
├── services/
│   └── unasApi.js          # Frontend API service
└── App.jsx                 # React app + UNAS integration
```

### További Fejlesztési Lehetőségek

1. **Webhook Support:** UNAS push notification helyett pull
2. **Database Cache:** Redis/MongoDB cache perzisztens tároláshoz
3. **GraphQL API:** Rugalmasabb lekérdezésekhez
4. **Real-time Updates:** WebSocket kapcsolat valós idejű frissítéshez
5. **Analytics:** Termék megtekintések és konverziók követése
6. **A/B Testing:** Különböző UI variánsok tesztelése

## Támogatás

Ha problémád van az integrációval:

1. Ellenőrizd a backend logokat: `npm run server`
2. Nézd meg a frontend konzolt: F12 > Console
3. Teszteld a backend endpointokat curl-lel
4. Olvasd el a hibaelhárítási szekciót

## Changelog

**v1.0.0 - 2026-01-25**
- Initial UNAS API integration
- Backend proxy with authentication
- Multi-format parser (XML/JSON/CSV)
- In-memory caching
- Auto-refresh every 5 minutes
- Manual refresh button
- Error handling and fallbacks

---

**Készítette:** Marketly.AI Development Team
**Utolsó frissítés:** 2026-01-25
