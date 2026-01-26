# UNAS XML API Integráció

## 📡 API Konfiguráció

Az UNAS API egy **XML-alapú POST API**, amely a következő címen érhető el:

```
https://api.unas.eu/shop/
```

### Követelmények
- **Előfizetés:** PREMIUM vagy VIP csomag szükséges
- **Protokoll:** HTTPS (TLS 1.2 vagy TLS 1.3)
- **Metódus:** POST
- **Formátum:** XML (kérés és válasz)
- **Sikeres hívás:** HTTP 200
- **Hiba esetén:** HTTP 400 + `<Error>` node

---

## 🔐 Hitelesítés

Minden API hívás a következő XML struktúrát használja:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Request>
    <AuthCode>your_auth_code_here</AuthCode>
    <ShopId>your_shop_id_here</ShopId>
</Request>
```

### Szükséges adatok:
- **ShopId** - A webshop azonosítója (pl. `81697`)
- **AuthCode** - Hitelesítési kód az UNAS admin felületről

---

## 📦 Termékek Lekérése

### Endpoint
```
POST https://api.unas.eu/shop/getProducts
```

### Kérés példa

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Request>
    <AuthCode>98ff143933</AuthCode>
    <ShopId>81697</ShopId>
    <!-- Opcionális szűrők -->
    <CategoryId>123</CategoryId>
    <Limit>100</Limit>
    <Offset>0</Offset>
</Request>
```

### Válasz példa

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Products>
        <Product>
            <Id>12345</Id>
            <Name>Modern design szék</Name>
            <Price>25990</Price>
            <BruttoPrice>25990</BruttoPrice>
            <Category>Székek</Category>
            <CategoryId>10</CategoryId>
            <CategoryPath>Bútorok > Székek</CategoryPath>
            <Image>https://www.marketly.hu/images/product_12345.jpg</Image>
            <Images>
                <Image>https://www.marketly.hu/images/product_12345_1.jpg</Image>
                <Image>https://www.marketly.hu/images/product_12345_2.jpg</Image>
            </Images>
            <Description><![CDATA[Kényelmes, modern design szék...]]></Description>
            <ShortDescription>Modern design szék</ShortDescription>
            <Stock>15</Stock>
            <InStock>1</InStock>
            <Sku>SZEK-001</Sku>
            <Link>https://www.marketly.hu/modern-design-szek</Link>
            <Parameters>
                <Parameter>
                    <Name>Anyag</Name>
                    <Value>Fa, textil</Value>
                </Parameter>
                <Parameter>
                    <Name>Szín</Name>
                    <Value>Fehér</Value>
                </Parameter>
                <Parameter>
                    <Name>Szélesség</Name>
                    <Value>45 cm</Value>
                </Parameter>
            </Parameters>
        </Product>
        <!-- További termékek... -->
    </Products>
</Response>
```

### Hiba válasz

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Error>Invalid authentication credentials</Error>
```

---

## 🛠️ Implementáció

### 1. Környezeti Változók (.env)

```env
# UNAS API Configuration
UNAS_API_URL=https://api.unas.eu/shop/getProducts
UNAS_SHOP_ID=81697
UNAS_AUTH_CODE=98ff143933
UNAS_API_KEY=9a6522bfbcd56045cda463a90d7476d932338f52
```

### 2. API Hívás (Node.js)

```javascript
import fetch from 'node-fetch';

const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<Request>
    <AuthCode>${process.env.UNAS_AUTH_CODE}</AuthCode>
    <ShopId>${process.env.UNAS_SHOP_ID}</ShopId>
</Request>`;

const response = await fetch('https://api.unas.eu/shop/getProducts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/xml; charset=UTF-8',
    'Accept': 'application/xml'
  },
  body: xmlBody
});

if (!response.ok) {
  throw new Error(`UNAS API error: ${response.status}`);
}

const xmlData = await response.text();
// Parse XML with xml2js...
```

### 3. XML Parsing

```javascript
import xml2js from 'xml2js';

const parser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: false,
  mergeAttrs: true
});

const result = await parser.parseStringPromise(xmlData);

// Check for errors
if (result.Error) {
  throw new Error(`UNAS API Error: ${result.Error}`);
}

// Extract products
const products = result.Response?.Products?.Product || [];
```

---

## 📋 Gyakori UNAS API Funkciók

| Funkció | Endpoint | Leírás |
|---------|----------|--------|
| **getProducts** | `/shop/getProducts` | Termékek lekérése |
| **getProduct** | `/shop/getProduct` | Egy termék részletei |
| **setProduct** | `/shop/setProduct` | Termék létrehozása/módosítása |
| **deleteProduct** | `/shop/deleteProduct` | Termék törlése |
| **getCategories** | `/shop/getCategories` | Kategóriák lekérése |
| **getStock** | `/shop/getStock` | Raktárkészlet lekérése |
| **setStock** | `/shop/setStock` | Raktárkészlet módosítása |
| **getOrders** | `/shop/getOrders` | Rendelések lekérése |

---

## 🧪 API Teszt (curl)

```bash
# Termékek lekérése
curl -X POST https://api.unas.eu/shop/getProducts \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<Request>
    <AuthCode>98ff143933</AuthCode>
    <ShopId>81697</ShopId>
</Request>'
```

---

## ⚠️ Gyakori Hibák

### 1. HTTP 400 - Invalid Authentication

**Probléma:** Hibás AuthCode vagy ShopId

**Megoldás:**
- Ellenőrizd az UNAS admin felületen az AuthCode-ot
- Győződj meg róla, hogy a ShopId helyes

### 2. HTTP 400 - Premium/VIP Required

**Probléma:** Az előfizetésed nem tartalmazza az API hozzáférést

**Megoldás:**
- Frissítsd az UNAS előfizetésedet PREMIUM vagy VIP csomagra

### 3. Üres `<Products>` lista

**Probléma:** Nincs termék vagy a szűrő túl szigorú

**Megoldás:**
- Ellenőrizd, hogy vannak-e termékek az adminon
- Távolítsd el a szűrőket (CategoryId, stb.)

### 4. XML Parsing Error

**Probléma:** Nem várt XML struktúra

**Megoldás:**
- Nézd meg a nyers XML választ
- Ellenőrizd a `<Response>` és `<Products>` node-okat

---

## 📚 További Dokumentáció

- **UNAS API Dokumentáció:** `https://help.unas.hu/api`
- **UNAS Support:** support@unas.hu
- **Admin felület:** `https://www.marketly.hu/admin`

---

## 🚀 Használat a Projektben

A projekt már konfigurálva van az UNAS XML API használatára:

```bash
# 1. Állítsd be a .env fájlt
UNAS_API_URL=https://api.unas.eu/shop/getProducts
UNAS_SHOP_ID=81697
UNAS_AUTH_CODE=98ff143933

# 2. Indítsd a szervert
npm run server

# 3. A szinkronizáció automatikus
```

A `server/services/syncService.js` fájl kezeli az XML API kommunikációt és a termékek feldolgozását.

---

## ✅ Checklist

- [x] UNAS API URL beállítva: `https://api.unas.eu/shop/getProducts`
- [x] ShopId és AuthCode konfigurálva
- [x] XML POST kérés implementálva
- [x] XML válasz parsing (xml2js)
- [x] Hibakezelés (<Error> node)
- [x] Termékek adatbázisba mentése
- [x] Kategória szűrés támogatása

---

**Sikeres integrációt!** 🎉
