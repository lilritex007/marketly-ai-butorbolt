# 🚀 Fejlesztői Útmutató

## Gyors Start

```bash
# 1. Függőségek telepítése (már megtörtént)
npm install

# 2. Fejlesztői szerver indítása
npm run dev

# 3. Böngészőben nyílik meg: http://localhost:3000
```

## 📋 Fontos Teendők Telepítés Után

### 1. API Kulcs Beállítása (FONTOS!)

Az AI funkciók működéséhez Google Gemini API kulcs szükséges:

1. Szerezz be egy API kulcsot: https://makersuite.google.com/app/apikey
2. Nyisd meg: `src/App.jsx`
3. Cseréld le a kulcsot:

```javascript
const GOOGLE_API_KEY = "IDE_JÖN_A_SAJÁT_KULCSOD";
```

### 2. CSV Fájl Tesztelése

A projektben található egy `sample-products.csv` fájl 10 termékkel. Használd ezt a teszteléshez:

1. Indítsd el az alkalmazást (`npm run dev`)
2. Kattints a "CSV Betöltése" gombra a kék sávban
3. Válaszd ki a `sample-products.csv` fájlt
4. A termékek betöltődnek az alkalmazásba

## 🎨 Funkciók Tesztelése

### Főoldal
- ✅ Hero szekció animációk
- ✅ Termékek böngészése
- ✅ Keresés működése
- ✅ Kategória szűrés
- ✅ Ár szerinti rendezés

### Képkereső (AI)
- ✅ Kép feltöltés
- ✅ AI elemzés (Gemini API szükséges)
- ✅ Termék javaslatok

### Szobatervező
- ✅ Szoba háttérkép feltöltése
- ✅ Bútorok elhelyezése
- ✅ Drag & drop (alap verzió)

### Chat Asszisztens (AI)
- ✅ Fix gomb jobb alul
- ✅ Chat ablak nyitása/zárása
- ✅ Termék ajánlások (Gemini API szükséges)

### Kívánságlista
- ✅ Termékek hozzáadása/eltávolítása
- ✅ Szív ikon animáció
- ✅ Számláló a navbar-ban

## 🔧 Gyakori Problémák

### Port már használatban

Ha a 3000-es port foglalt:

```bash
# Vite config módosítása (vite.config.js):
server: {
  port: 3001,  // Másik port
  open: true
}
```

### Tailwind nem működik

```bash
# Újraindítás tiszta cache-sel
npm run dev -- --force
```

### API kulcs hibák

Ha az AI funkciók nem működnek:
- Ellenőrizd az API kulcsot
- Nézd meg a böngésző konzolt (F12)
- Ellenőrizd a Gemini API kvótádat

## 📦 Build Production-re

```bash
# Build készítése
npm run build

# Build tesztelése lokálisan
npm run preview
```

A build fájlok a `dist/` mappába kerülnek.

## 🎯 További Fejlesztési Ötletek

- [ ] Backend integráció (Express/Node.js)
- [ ] Valódi e-commerce funkciók (kosár, fizetés)
- [ ] Felhasználói autentikáció
- [ ] Termék értékelések és kommentek
- [ ] Fejlettebb szobatervező (drag & drop, méretezés)
- [ ] Progressive Web App (PWA)
- [ ] Dark mode
- [ ] Többnyelvűség (i18n)
- [ ] Termék összehasonlítás
- [ ] Email értesítések

## 🐛 Debug Tippek

### React Developer Tools

Telepítsd a böngésző bővítményt:
- Chrome: React Developer Tools
- Firefox: React DevTools

### Konzol Logging

Használd a böngésző konzolt (F12) hibák kereséséhez.

### Network Tab

Az API hívások ellenőrzéséhez nézd meg a Network tabot (F12 > Network).

## 📚 Hasznos Linkek

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Google Gemini API](https://ai.google.dev)

## 💡 Tippek

1. **Hot Reload**: A Vite automatikusan újratölti az oldalt változtatáskor
2. **CSS**: A Tailwind IntelliSense VS Code bővítmény sokat segít
3. **Komponensek**: Az App.jsx-ben minden komponens egyben van - érdemes lehet szétbontani külön fájlokba
4. **State Management**: Nagyobb alkalmazásnál fontold meg a Zustand vagy Redux használatát

---

**Happy Coding! 🚀**
