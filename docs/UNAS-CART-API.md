# UNAS kosár API – Marketly widget integráció

A widget UNAS oldalon fut, így az UNAS által biztosított JavaScript API-k elérhetők.

---

## cart_add – kosárhoz adás

**Hívás:** `cart_add(productId, prefix, null, quantity)`

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| productId | string | UNAS termék ID: `VX__unas__{id}` |
| prefix | string | Kontextus prefix (pl. `marketly_`, `artlist_`, `''`) |
| 3. | null | Fix null |
| quantity | number | Mennyiség |

**Példák:**
- Termék oldal: `cart_add('VX__unas__4102641','',null,1)`
- Kategória oldal: `cart_add('VX__unas__348070','artlist_')` – mennyiség az inputból

**Widget használat:** `addToUnasCart(product, quantity)` – [src/services/unasCartService.js](../src/services/unasCartService.js)

---

## UNAS.getCart – kosár lekérdezés

**Hívás:** `UNAS.getCart(callback, { lang: 'hu' })`

**Válasz struktúra:**
- `sum` (float) – bruttó kosárérték
- `items` (array) – tételek
  - `items[n].id` (integer) – termék azonosító
  - `items[n].sku`, `items[n].name`, `items[n].unit`
  - `items[n].qty` (float)
  - `items[n].prices` – price, price_net, price_gross, price_unit…
  - `items[n].variants` – változatok (1–3)

---

## Termék ID formátum

- UNAS sablon: `VX__unas__{id}` (pl. `VX__unas__4102641`)
- API termékek: `product.id` vagy `product.unas_id` – ha nem `VX__unas__` prefixű, a service hozzáfűzi

---

## Kosár oldal sablon

`content_cart_1.html` – fontos változók: `products`, `product.url`, `product.qty`, `form_start`/`form_end`, `button_order_onclick`, `cart_disp`.
