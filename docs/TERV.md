# Terv – Marketly AI Bútorbolt

Rövid terv és később megoldandó feladatok. Frissítve: 2025.

---

## Később megoldandó

### 1. Görgetés termék szekcióhoz (scroll to #products-section)

**Probléma:** Kattintás után (kategória, főoldal, menü, stb.) a tartalom nem görget megbízhatóan a termék szekcióhoz.

- **Standalone (normál oldal):** window scroll – első kattintásra sem mindig működik.
- **UNAS embed:** A tartalom `article#page_content_*` (pl. `page_content_3359761`) belül van; a görgetés valószínűleg egy külső wrapperen (article szülője vagy magasabb) történik, nem a window-on.
- **Második kattintás:** Korábban a második kattintásra már nem görgetett; 1px nudge + smooth segített window esetén, embedben továbbra is instabil.

**Eddig kipróbáltak:**

- `getScrollParent(el)` – első scrollolható szülő; csak akkor használjuk, ha a container a mi appot tartalmazza (wrapsApp), ne a mi appunk belsejében lévő elem.
- UNAS page_content: article, article.parent, article.parent.parent jelöltek; overflow shorthand; embed fallback `scrollIntoView`.
- Window fallback: 1px nudge + `window.scrollTo` smooth.

**Megvalósított megoldás (2025):**

- `scrollToProductsSection` (App.jsx): (1) Megkeresi a scroll parentot `getScrollParent(el)`-pel. (2) Ha van scroll parent: azt görgeti `scrollTop + (elRect.top - parentRect.top) - offset`. (3) Ha nincs (standalone): window 1px nudge + smooth `window.scrollTo`. (4) Fallback: 400 ms után ha a szekció még mindig nincs a viewportban (`rect.top > 150`), meghívjuk `el.scrollIntoView({ behavior: 'smooth', block: 'start' })` – ez UNAS embedben gyakran a tényleges scroll containert mozgatja.
- Dupla `requestAnimationFrame` a DOM frissülés után (tab váltás után) előtt.
- Ha továbbra is instabil: UNAS oldalon DevTools-sal megmérni, melyik elemnek van `overflow-y: auto`/`scroll`, és ha ismert a selector, célzottan azt görgetni.

---

## Egyéb (később bővíthető)

- További prioritások, tech debt, vagy feature ötletek ide kerülhetnek.
