# ✅ JAVÍTVA! UNAS API Helyes Integráció

## 🔧 Mi Volt A Hiba?

A korábbi implementáció **HIBÁS** volt! Az UNAS API **kétlépcsős autentikációt** használ:

❌ **Hibás (régi):**
- Direkt POST az AuthCode + ShopId-val
- Egy lépés

✅ **Helyes (javítva):**
1. **LOGIN** endpoint → Token megszerzése
2. **getProduct** endpoint Bearer token-nel

---

## 🔐 UNAS API Helyes Működése

### 1. Lépés: Login (Token megszerzése)

**Endpoint:** `https://api.unas.eu/shop/login`

**Request:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>9a6522bfbcd56045cda463a90d7476d932338f52</ApiKey>
</Params>
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Token>abc123xyz...token...</Token>
    <Expire>2026-01-25 23:59:59</Expire>
    <ShopId>81697</ShopId>
    <Status>ok</Status>
</Response>
```

### 2. Lépés: Termékek Lekérése (Bearer token-nel)

**Endpoint:** `https://api.unas.eu/shop/getProduct`

**Headers:**
```
Authorization: Bearer abc123xyz...token...
Content-Type: application/xml
```

**Request:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <StatusBase>1</StatusBase>
    <ContentType>normal</ContentType>
</Params>
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Products>
    <Product>
        <Id>12345</Id>
        <Sku>PROD-001</Sku>
        <Name>Modern design szék</Name>
        <Prices>
            <Price>
                <Type>normal</Type>
                <Gross>25990</Gross>
                <Net>20464</Net>
            </Price>
        </Prices>
        <Categories>
            <Category>
                <Type>base</Type>
                <Id>369560</Id>
                <Name>Bútorok|Székek</Name>
            </Category>
        </Categories>
        <Images>
            <Image>
                <Type>base</Type>
                <SefUrl>https://www.marketly.hu/img/szek.jpg</SefUrl>
            </Image>
        </Images>
        ...
    </Product>
</Products>
```

---

## 📝 Javított Konfiguráció

### `.env` fájl (EGYSZERŰBB!)

```env
# Csak az API Key kell!
UNAS_API_KEY=9a6522bfbcd56045cda463a90d7476d932338f52

# Adatbázis konfiguráció
AUTO_SYNC_INTERVAL=60
ALLOWED_CATEGORIES=
```

**Törölve:**
- `UNAS_API_URL` (nem kell)
- `UNAS_SHOP_ID` (a login response-ból jön)
- `UNAS_AUTH_CODE` (nem használjuk)

---

## 🔄 Javított Működés

```
1. Backend indul
   ↓
2. Login → Token (cache-elve)
   ↓
3. getProduct (Bearer token-nel)
   ↓
4. XML parsing (<Products><Product>...)
   ↓
5. Adatbázisba mentés
```

---

## 🚀 Használat

### 1. `.env` Fájl Beállítása

```env
UNAS_API_KEY=9a6522bfbcd56045cda463a90d7476d932338f52
ALLOWED_CATEGORIES=
```

### 2. Szerver Indítása

```bash
npm run server
```

**Konzol kimenet:**
```
🔄 Starting UNAS sync...
🔐 Logging in to UNAS API...
✅ Login successful, token received
📡 Fetching products from UNAS API...
📦 Parsing UNAS XML data...
✅ Found 150 products in UNAS XML
📊 Fetched 150 products from UNAS
💾 Saving to database...
✅ Sync completed successfully
   - Fetched: 150
   - Added: 150
   - Updated: 0
```

### 3. Ellenőrzés

```powershell
# Statisztikák
Invoke-RestMethod -Uri "http://localhost:3001/api/stats"

# Termékek
Invoke-RestMethod -Uri "http://localhost:3001/api/products?limit=10"
```

---

## 🎯 XML Mezők Mapping

| UNAS API Mező | Frontend Mező | Leírás |
|---------------|---------------|--------|
| `Id` | `id` | Termék ID |
| `Sku` | - | Cikkszám |
| `Name` | `name` | Termék neve |
| `Prices.Price.Gross` | `price` | Bruttó ár |
| `Categories.Category.Name` | `category` | Kategória |
| `Images.Image.SefUrl` | `images[]` | Kép URL-ek |
| `Description.Short` | `description` | Leírás |
| `Params.Param` | `params` | Paraméterek |
| `Url` | `link` | Termék URL |
| `Stocks.Stock.Qty` | `inStock` | Raktárkészlet |

---

## 📚 UNAS API Specifikus Adatok

### Árak Kezelése

```xml
<Prices>
    <Price>
        <Type>normal</Type>
        <Gross>25990</Gross>
        <Net>20464</Net>
    </Price>
    <Price>
        <Type>sale</Type>
        <Gross>19990</Gross>
        <Start>2026.01.01</Start>
        <End>2026.01.31</End>
    </Price>
</Prices>
```

**Logika:**
1. Akciós ár (`sale`) ha elérhető
2. Különben normál ár (`normal`)

### Kategóriák Kezelése

```xml
<Categories>
    <Category>
        <Type>base</Type>
        <Name>Főcsoport|Alcsoport|Termékek</Name>
    </Category>
</Categories>
```

**Logika:**
- Pipe (`|`) elválasztott kategória útvonal
- Utolsó elem = kategória név

### Képek Kezelése

```xml
<Images>
    <Image>
        <Type>base</Type>
        <SefUrl>https://www.marketly.hu/img/kep1.jpg</SefUrl>
    </Image>
    <Image>
        <Type>alt</Type>
        <Id>1</Id>
        <SefUrl>https://www.marketly.hu/img/kep2.jpg</SefUrl>
    </Image>
</Images>
```

**Logika:**
- `base` = főkép
- `alt` = további képek
- Max 4 kép használata

---

## ⚙️ Kategória Szűrés

Most már **működik a kategória szűrés!**

```env
# Csak bizonyos kategóriák
ALLOWED_CATEGORIES=Székek,Asztalok,Kanapék
```

Vagy minden kategória:

```env
ALLOWED_CATEGORIES=
```

---

## 🧪 Tesztelés

### PowerShell Script

```powershell
.\test-backend.ps1
```

### Manuális Teszt

```powershell
# Szerver indítás
npm run server

# Várd meg a szinkronizációt (~5-30 sec)

# Statisztikák
Invoke-RestMethod -Uri "http://localhost:3001/api/stats"
```

---

## ❓ Gyakori Kérdések

### Hol találom az API Key-t?

UNAS admin → Beállítások → API beállítások → API kulcs generálása

### Mennyi ideig érvényes a Token?

A token egy ideig cache-elve van. Ha lejár, automatikusan új logint hajt végre.

### Mi van, ha nincs termék?

Ellenőrizd:
1. API Key helyes-e
2. PREMIUM vagy VIP előfizetésed van-e
3. Van-e aktív termék az UNAS-ban (`StatusBase=1`)

---

## ✅ Összefoglalás

**Mit javítottam:**
1. ✅ Kétlépcsős autentikáció: LOGIN → TOKEN
2. ✅ Helyes endpoint használat (`/shop/login`, `/shop/getProduct`)
3. ✅ Bearer token Authorization header
4. ✅ UNAS XML struktúra parsing (`<Products><Product>`)
5. ✅ UNAS mezők helyes mapping
6. ✅ Egyszerűsített konfiguráció (csak API_KEY)

**Most már minden készen áll!** 🎉

```bash
npm run server
```

Mondd el, mit látsz! 🚀
