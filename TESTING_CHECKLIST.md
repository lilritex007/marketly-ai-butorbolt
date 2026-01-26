# 🧪 Tesztelési Checklist - Új Feature-ök

## 🎯 Indítás

```bash
cd c:\Users\Kis Riti\Desktop\Marketly-AI-Butor-shop
npm run dev
```

Nyisd meg: `http://localhost:3003/`

---

## ✅ Feature Testing

### 1. Voice Search 🎤

**Helyszín:** Search bar mellett (jobb felső sarokban)

**Teszt lépések:**
1. Kattints a lila mikrofon ikonra
2. Engedélyezd a mikrofon hozzáférést (ha kéri)
3. Mondj valamit: "kanapé", "asztal", "szék"
4. Lásd a transcript-et megjelenni
5. Automatikusan keresés indul

**Várható eredmény:**
- ✅ Piros színű gomb amikor hallgat
- ✅ Pulse animáció
- ✅ Transcript popup jelenik meg
- ✅ Keresési query frissül

**Hiba esetén:**
- Böngésző nem támogatja → hibaüzenet jelenik meg
- Mikrofon hozzáférés megtagadva → figyelmeztetés

---

### 2. Product Quick Peek 🔍

**Helyszín:** Termék kártyára kattintás

**Teszt lépések:**
1. Kattints BÁRMELYIK termék kártyára
2. Modal jelenik meg (Quick Peek)
3. Lásd a termék részleteit
4. Próbáld a Kosárba gombot
5. Próbáld a Wishlist/Share gombokat
6. Zárd be X-el vagy backdrop-re kattintva

**Várható eredmény:**
- ✅ Gyors modal megnyílik
- ✅ Kép, ár, leírás látható
- ✅ Funkcionális gombok
- ✅ Smooth close animation

---

### 3. Smart Newsletter Popup 📧

**Helyszín:** Automatikusan jelenik meg

**Trigger stratégiák (3 közül 1):**
- **Option A:** Várj 30 másodpercet az oldalon
- **Option B:** Scrollozz le 70%-ig
- **Option C:** Vidd az egeret ki a böngészőből (tetején)

**Teszt lépések:**
1. Töltsd be az oldalt
2. Várj vagy scrollozz
3. Newsletter popup megjelenik
4. Adj meg email címet: `test@example.com`
5. Kattints "Feliratkozom!"
6. Lásd a success üzenetet

**Várható eredmény:**
- ✅ 10% kedvezmény ajánlat
- ✅ Email validáció működik
- ✅ Success animáció (zöld pipa)
- ✅ LocalStorage-ban eltárolódik
- ✅ Nem jelenik meg újra (7 napig)

**Reset teszteléshez:**
```javascript
// Konzolban (F12):
localStorage.removeItem('newsletter_dismissed');
localStorage.removeItem('newsletter_subscribed');
// Frissítsd az oldalt
```

---

### 4. AI Price Predictor 💰

**Helyszín:** Külön komponens (egyelőre nem auto-integrált)

**Használat:**
A komponens készen van, de a termék kártyán/detail-ben kell trigger. Kód példa:

```jsx
// Példa ProductDetailModal-ban:
<AIPricePredictor
  product={selectedProduct}
  onAlertSet={(product) => toast.success('Árfigyelés beállítva!')}
/>
```

**Teszt (ha implementálod):**
1. Kattints "Ár trend elemzése"
2. Várj az AI elemzésre (~2-3 mp)
3. Lásd a trend előrejelzést
4. Állíts be értesítést (Bell ikon)

**Várható eredmény:**
- ✅ Gemini AI elemzés (trend, ajánlás)
- ✅ Visual indicators (nyilak, színek)
- ✅ Értesítés LocalStorage-ban
- ✅ Refresh gomb működik

---

### 5. Quick Add to Cart 🛒

**Helyszín:** Külön komponens (készen áll használatra)

**Példa használat:**
```jsx
// ProductCard-ban vagy Quick Peek-ben:
<QuickAddToCart
  product={product}
  onAdd={(prod) => toast.success('Kosárba helyezve!')}
  className="w-full"
/>
```

**Teszt (ha implementálod):**
1. Kattints "Kosárba" gombra
2. Lásd a loading animációt
3. Lásd a success animációt (zöld, pipa)
4. Haptic feedback (ha támogatott)

**Várható eredmény:**
- ✅ Smooth state transitions
- ✅ Ripple effect
- ✅ 2 mp után visszaáll

---

### 6. AR Product Preview 📱

**Helyszín:** Külön modal (trigger kell hozzá)

**Browser Support:**
- ✅ iOS Safari (AR Quick Look)
- ✅ Android Chrome (WebXR)
- ❌ Desktop (fallback link)

**Teszt (mobilon):**
1. Trigger AR preview:
```jsx
<button onClick={() => {
  setArProduct(product);
  setShowARPreview(true);
}}>
  AR Előnézet
</button>
```
2. Modal megnyílik
3. Engedélyezd kamera hozzáférést
4. Lásd az AR view-t

**Desktop teszt:**
- Hibaüzenet: "AR nem elérhető ezen az eszközön"
- Fallback: "Megnyitás web AR nézetben" link

---

### 7. Infinite Scroll ♾️

**Helyszín:** Készen áll (pagination helyettesítésére)

**Aktiválás (opcionális):**
Az App.jsx-ben replace pagination-t ezzel:

```jsx
const { visibleItems, loadMore, hasMore, isLoading, sentinelRef } = 
  useInfiniteScroll(filteredAndSortedProducts, 20);

// Grid-ben:
{visibleItems.map(product => <EnhancedProductCard ... />)}

// Grid után:
<InfiniteScrollSentinel 
  sentinelRef={sentinelRef} 
  isLoading={isLoading} 
  hasMore={hasMore} 
/>
```

**Teszt:**
1. Scrollozz le a product grid végéig
2. Automatikusan betölt 20 új terméket
3. Folytatódik amíg van termék

**Várható eredmény:**
- ✅ Seamless loading
- ✅ Loading spinner
- ✅ "Minden termék betöltve" üzenet a végén

---

### 8. WebP Image Optimization 🖼️

**Helyszín:** Utils fájl (manual használat)

**Aktiválás (opcionális):**
Product kártyák image tag-jeiben:

```jsx
import { getOptimizedImageProps } from './utils/imageOptimizer';

// Image component-ben:
const imageProps = getOptimizedImageProps(product.image, product.name, {
  width: 400,
  quality: 80,
  lazy: true,
  responsive: true
});

<img {...imageProps} />
```

**Teszt:**
1. Check Network tab (F12)
2. Lásd WebP format-ot (ha browser támogatja)
3. Responsive srcset multiple sizes-zal
4. Lazy loading (csak viewport-ban töltődik)

**Várható eredmény:**
- ✅ WebP képek (Chrome, Edge, Firefox)
- ✅ Fallback JPG/PNG (régi böngészők)
- ✅ Kisebb file size (~30% reduction)

---

## 🐛 Debug Tips

### Voice Search nem működik:
```javascript
// Console check:
if ('webkitSpeechRecognition' in window) {
  console.log('✅ Speech Recognition supported');
} else {
  console.log('❌ Not supported');
}
```

### Newsletter popup nem jelenik meg:
```javascript
// Clear localStorage:
localStorage.clear();
// Reload page
```

### AR Preview error:
```javascript
// Check WebXR support:
if ('xr' in navigator) {
  navigator.xr.isSessionSupported('immersive-ar')
    .then(supported => console.log('AR supported:', supported));
}
```

---

## 📊 Success Criteria

**Minden feature működik ha:**
- ✅ Nincs console error
- ✅ Animációk smooth-ok
- ✅ Responsive (mobile/desktop)
- ✅ Accessible (keyboard navigation)
- ✅ Performance jó (nincs lag)

---

## 🎯 Priority Testing Order

1. **Voice Search** (látványos, gyors teszt)
2. **Product Quick Peek** (core UX, minden termékre működik)
3. **Newsletter Popup** (automatikus, várj 30s)
4. **AI Price Predictor** (ha implementálod trigger-rel)
5. **AR Preview** (mobilon tesztelendő)
6. **Infinite Scroll** (ha aktiválod)
7. **WebP Optimization** (technical check)

---

## ✅ Elvárt Eredmény

**0 console error** + **smooth UX** = 🎉 SUCCESS!

---

**Ready to test?** 🚀

```bash
npm run dev
```
