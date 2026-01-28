# UNAS host oldal – butorbolt:2591 és butorbolt:2520 javítás (bemásolható)

A hibák a **butorbolt** oldal HTML-jében lévő scriptből jönnek (UNAS téma vagy egyedi HTML). Az UNAS adminban szerkeszd a butorbolt oldal forrását vagy a sablont, keress rá az alábbi mintákra, és alkalmazd a javítást.

---

## 1. Mit keress az UNAS HTML/scriptben

- **~2520. sor:** `addEventListener` hívás (valószínűleg `document` vagy egy elemre, ami null lehet).
- **~2589–2591. sor:** `forEach` ciklus, benne `observer.observe(...)` vagy `IntersectionObserver` + `observe`.

---

## 2. Javítás – addEventListener (pl. butorbolt:2520)

**Előtte (hiba: null elemre hív):**
```js
elem.addEventListener('click', handler);
```

**Utána (bemásolható):**
```js
if (elem != null && typeof elem.addEventListener === 'function') {
  elem.addEventListener('click', handler);
}
```

Ha a változó neve más (pl. `el`, `node`, `target`), cseréld: `elem` → `el` / `node` / `target`.

---

## 3. Javítás – IntersectionObserver.observe (pl. butorbolt:2591)

**Előtte (hiba: nem-Elementre observe):**
```js
elements.forEach(function(el) {
  observer.observe(el);
});
```

**Utána (bemásolható):**
```js
elements.forEach(function(el) {
  if (el && el.nodeType === 1) {
    observer.observe(el);
  }
});
```

Alternatíva (böngészőkben Element = DOM elem):
```js
elements.forEach(function(el) {
  if (el instanceof Element) {
    observer.observe(el);
  }
});
```

Ha nem `forEach` van, hanem egyetlen elemre hívod az `observe`-t:
```js
if (element && element.nodeType === 1) {
  observer.observe(element);
}
```

---

## 4. Rövid ellenőrző függvény (opcionális)

Ha több helyen használod, beillesztheted a script elejére (így minden observe/addEventListener biztonságosabb):

```js
function safeObserve(observer, element) {
  if (element && element.nodeType === 1) observer.observe(element);
}
function safeAddEventListener(element, event, handler) {
  if (element != null && typeof element.addEventListener === 'function') {
    element.addEventListener(event, handler);
  }
}
```

Használat:
- `observer.observe(el)` → `safeObserve(observer, el)`
- `elem.addEventListener('click', fn)` → `safeAddEventListener(elem, 'click', fn)`

---

## 5. Lépések az UNAS adminban

1. Bejelentkezés az UNAS adminba.
2. Megnyitni a butorbolt oldal szerkesztőjét (oldal forrás / HTML / téma sablon – attól függ, hol van a script).
3. Keresés: `addEventListener` és `observe` (vagy `IntersectionObserver`).
4. A fenti minták alapján ellenőrzés hozzáadása: `element != null` / `element.nodeType === 1` (vagy `instanceof Element`).
5. Mentés és teszt az éles butorbolt oldalon (F12 → Console: ne legyen 2520, 2591-es hiba).

Részletesebb leírás: `deployment/DEPLOY-UNAS.md`.
