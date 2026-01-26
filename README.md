# 🛋️ Marketly.AI - Okos Bútor Webshop

AI-alapú bútor e-commerce platform vizuális kereső és szobatervező funkciókkal, UNAS API integrációval.

## ✨ Főbb Funkciók

- 🏠 **Termék böngészés**: Modern, interaktív termékgalléria
- 🔄 **UNAS API integráció**: Valós idejű áruk és készletek szinkronizálása
- 📸 **AI Vizuális Kereső**: Tölts fel képet és az AI megtalálja a hasonló termékeket
- 🎨 **Szobatervező**: Tervezd meg álmaid lakását a bútorjainkkal
- 💬 **AI Chat Asszisztens**: Okos chatbot a vásárlás segítésére (Google Gemini API)
- ❤️ **Kívánságlista**: Mentsd el kedvenc termékeidet
- 🔍 **Keresés és szűrés**: Kategória, ár és szöveges keresés
- 📊 **CSV Import**: Termékek tömeges betöltése CSV fájlból

## 🚀 Gyors indítás

### Előfeltételek

- Node.js 18+ és npm/yarn telepítve
- UNAS API hozzáférés (URL, username, password)
- Google Gemini API kulcs (AI funkciókhoz - opcionális)

### Telepítés

1. **Telepítsd a függőségeket:**

```bash
npm install
```

2. **Környezeti változók beállítása:**

Másold le a `.env.example` fájlt `.env` néven és töltsd ki:

```bash
cp .env.example .env
```

Szerkeszd a `.env` fájlt:

```env
# UNAS API konfiguráció (KÖTELEZŐ!)
UNAS_API_URL=https://www.marketly.hu/api/product-feed
UNAS_USERNAME=your_username
UNAS_PASSWORD=your_password

# Backend konfiguráció
PORT=3001
CACHE_TTL=300000
FRONTEND_URL=http://localhost:3000

# Frontend konfiguráció
VITE_API_URL=http://localhost:3001

# Google Gemini API (opcionális AI funkciókhoz)
VITE_GOOGLE_API_KEY=your_api_key_here
```

3. **Indítsd el az alkalmazást:**

**Frontend + Backend együtt (AJÁNLOTT):**
```bash
npm run dev:full
```

**Vagy külön terminálokban:**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

4. **Nyisd meg a böngészőben:**

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## 📦 Elérhető Scriptek

```bash
npm run dev:full # Frontend + Backend együtt (ajánlott)
npm run dev      # Csak frontend (Vite dev server)
npm run server   # Csak backend (Express API server)
npm run build    # Produkciós build
npm run preview  # Build előnézete
npm run lint     # Kód ellenőrzés
```

## 🏗️ Projekt Struktúra

```
marketly-ai-butor-shop/
├── server/
│   ├── index.js                 # Express backend + UNAS proxy
│   └── transformers/
│       └── unasParser.js        # UNAS feed parser (XML/JSON/CSV)
├── src/
│   ├── services/
│   │   └── unasApi.js          # Frontend API service
│   ├── App.jsx                 # Fő React komponens
│   ├── main.jsx                # React belépési pont
│   └── index.css               # Tailwind + custom CSS
├── public/                     # Statikus fájlok
├── .env.example                # Környezeti változók sablon
├── UNAS_INTEGRATION.md         # UNAS API dokumentáció
├── TESTING.md                  # Tesztelési útmutató
└── package.json                # Függőségek és scriptek
```

## 🔄 UNAS API Integráció

### Működés

1. **Backend Proxy**: Express szerver (port 3001) kezel minden UNAS API kommunikációt
2. **Authentikáció**: Basic Auth a UNAS API felé (username/password)
3. **Cache**: 5 perces in-memory cache a gyors betöltéshez
4. **Auto-frissítés**: Automatikus termékfrissítés 5 percenként
5. **Manuális frissítés**: "UNAS Frissítés" gomb az azonnali frissítéshez

### Támogatott Formátumok

A backend automatikusan felismeri és kezeli:
- **JSON**: Modern REST API formátum
- **XML**: Hagyományos feed formátum
- **CSV**: Táblázatos export formátum

### Backend API Endpointok

- `GET /health` - Health check
- `GET /api/unas/products` - Termékek lekérdezése (cache-elt)
- `GET /api/unas/products?refresh=true` - Friss adatok (cache bypass)
- `GET /api/cache/info` - Cache információk
- `POST /api/cache/clear` - Cache törlése

Részletes dokumentáció: [UNAS_INTEGRATION.md](UNAS_INTEGRATION.md)

## 📝 CSV Import Formátum

Az alkalmazás támogatja termékek betöltését CSV fájlból. Elvárt oszlopok:

- **Termék Név** - A termék neve
- **Bruttó Ár** - Ár forintban
- **Kategória** - Termékkategória
- **Kép link** - Fő termékfotó URL
- **Termék link** - Link a webshopban
- **Tulajdonságok** - Leírás
- **Raktárkészlet** - Készlet állapot
- **Kép kapcsolat** - További képek (opcionális)
- **Paraméter:** kezdetű oszlopok - Termék paraméterek

## 🛠️ Technológiák

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool és dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Ikonok
- **Google Gemini API** - AI funkciók

### Backend
- **Express.js** - REST API server
- **Node-fetch** - HTTP kérések
- **xml2js** - XML parsing
- **CORS** - Cross-origin támogatás
- **dotenv** - Környezeti változók

## 🎨 Testreszabás

### Színséma módosítása

A `tailwind.config.cjs` fájlban:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#4f46e5',  // indigo-600
    }
  }
}
```

### Cache TTL módosítása

A `.env` fájlban:

```env
CACHE_TTL=600000  # 10 perc (milliszekundumban)
```

## 🔒 Biztonság

⚠️ **FONTOS Biztonsági Megjegyzések:**

1. **SOHA ne commitolj .env fájlt** - Tartalmazza a hitelesítési adatokat
2. **Backend proxy használat kötelező** - Hitelesítési adatok védelme
3. **HTTPS használat production-ben** - Titkosított kommunikáció
4. **Környezeti változók tárolása** - Biztonságos tárolás (pl. Vercel Environment Variables)

## 🧪 Tesztelés

Részletes tesztelési útmutató: [TESTING.md](TESTING.md)

**Gyors teszt:**

```bash
# Backend health check
curl http://localhost:3001/health

# UNAS termékek
curl http://localhost:3001/api/unas/products

# Cache info
curl http://localhost:3001/api/cache/info
```

## 🚀 Deployment

### Backend Hosting Opciók

- **Vercel** (Serverless Functions) - Ajánlott
- **Railway** (Node.js hosting)
- **Heroku** (Classic hosting)
- **DigitalOcean App Platform**
- **Render**

### Frontend Hosting

- **Vercel** - Automatikus build és deploy
- **Netlify** - JAMstack hosting
- **GitHub Pages** - Statikus hosting
- **Cloudflare Pages** - Edge hosting

### Environment Variables Production-ben

Állítsd be a hosting platformon:

```
UNAS_API_URL=https://your-domain.hu/api/feed
UNAS_USERNAME=production_user
UNAS_PASSWORD=production_password
PORT=3001
CACHE_TTL=300000
FRONTEND_URL=https://your-frontend.com
VITE_API_URL=https://your-backend.com
```

## 📚 Dokumentáció

- [README.md](README.md) - Ez a fájl (áttekintés)
- [UNAS_INTEGRATION.md](UNAS_INTEGRATION.md) - UNAS API integráció részletesen
- [TESTING.md](TESTING.md) - Tesztelési útmutató
- [DEVELOPMENT.md](DEVELOPMENT.md) - Fejlesztői útmutató
- [SETUP-COMPLETE.md](SETUP-COMPLETE.md) - Projekt setup összefoglaló

## 🐛 Hibaelhárítás

### Backend nem indul

```bash
# Ellenőrizd a .env fájlt
cat .env

# Telepítsd újra a függőségeket
npm install

# Indítsd el debug módban
DEBUG=* npm run server
```

### CORS hiba

```bash
# Ellenőrizd, hogy a backend fut-e
curl http://localhost:3001/health

# Nézd meg a FRONTEND_URL értéket
grep FRONTEND_URL .env
```

### UNAS API hiba

```bash
# Teszteld az API-t közvetlenül
curl -u username:password https://www.marketly.hu/api/product-feed

# Nézd meg a backend logokat
npm run server
```

## 📞 Támogatás

Ha problémád van:

1. Nézd meg a [TESTING.md](TESTING.md) fájlt
2. Ellenőrizd a [UNAS_INTEGRATION.md](UNAS_INTEGRATION.md) dokumentációt
3. Nézd meg a backend logokat
4. Ellenőrizd a böngésző konzolt (F12)

## 📄 Licenc

MIT License - Használd szabadon!

## 🤝 Hozzájárulás

Pull request-ek várjuk szeretettel!

## 🎯 Következő Fejlesztési Lehetőségek

- [ ] Webhook támogatás UNAS-ból
- [ ] Redis cache backend helyett in-memory
- [ ] GraphQL API
- [ ] Real-time WebSocket frissítések
- [ ] Admin dashboard
- [ ] Analitika és monitoring
- [ ] Unit és E2E tesztek
- [ ] Docker containerizáció
- [ ] Kubernetes deployment

---

**Készítve ❤️ -val - Marketly.AI Team**
**Verzió:** 1.0.0 (UNAS Integration)
**Utolsó frissítés:** 2026-01-25
