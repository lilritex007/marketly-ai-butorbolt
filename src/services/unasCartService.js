/**
 * UNAS Cart Service – kosárhoz adás és kosár lekérdezés
 * A widget UNAS oldalon fut, így window.cart_add és UNAS.getCart elérhető.
 *
 * cart_add(productId, prefix, null, quantity) – termék oldalon 4 paraméter
 * A cart_add a mennyiség inputot keresi: id="db_{prefix}{productId}" vagy id="db_{productId}"
 * UNAS.getCart(callback, { lang: 'hu' }) – kosár tartalom
 */

const CART_ADD_PREFIX = '';

/**
 * UNAS termék ID formátum: VX__unas__{id}
 * Preferálja: unas_id, unas_ref, id, sku. Kiszűri az érvénytelen ID-kat (pl. unas-prod-*).
 */
function toUnasProductId(product) {
  const id = product?.unas_id ?? product?.unas_ref ?? product?.id ?? product?.sku;
  if (!id) return null;
  const str = String(id).trim();
  // Érvénytelen ID-k (pl. CSV parser unas-prod-1): ne adjunk VX__unas__ prefixet
  if (str.startsWith('unas-prod-') || str === '') return null;
  if (str.startsWith('VX__unas__')) return str;
  return `VX__unas__${str}`;
}

/**
 * cart_add és a hozzá tartozó window – lehet iframe-ben, parent vagy top window-ban.
 * Fontos: az inputot UGYANABBA a documentba kell tenni, ahol a cart_add fut (pl. parent),
 * mert a cart_add document.getElementById()-ot használ a saját documentján.
 */
function getCartAddContext() {
  if (typeof window === 'undefined') return null;
  const wins = [window, window.parent, window.top].filter(Boolean);
  for (const w of wins) {
    try {
      if (typeof w.cart_add === 'function') return { cartAdd: w.cart_add, win: w };
    } catch (_) { /* cross-origin */ }
  }
  return null;
}

function getCartAdd() {
  const ctx = getCartAddContext();
  return ctx ? ctx.cartAdd : null;
}

/**
 * UNAS form keresése – kosár/termék form, ahova az input kerülhet
 */
function findUnasForm(doc) {
  if (!doc) return null;
  const selectors = [
    'form[action*="cart"]',
    'form[id*="cart"]',
    'form[name*="cart"]',
    'form[action*="kosar"]',
    'form#product_form',
    'form.product-form'
  ];
  for (const sel of selectors) {
    try {
      const form = doc.querySelector(sel);
      if (form) return form;
    } catch (_) { /* invalid selector */ }
  }
  return null;
}

/**
 * Mennyiség input létrehozása – a cart_add UGYANABBAN a documentban keresi!
 * Ha iframe-ben futunk, a cart_add a parent/top-ban van → az inputot is oda kell tenni.
 */
function ensureQtyInput(unasId, qty, targetDoc) {
  if (!targetDoc) return null;
  const inputId = `db_${unasId}`;
  let input = targetDoc.getElementById(inputId);
  if (!input) {
    input = targetDoc.createElement('input');
    input.type = 'number';
    input.name = 'db';
    input.id = inputId;
    input.value = String(qty);
    input.setAttribute('data-min', '1');
    input.setAttribute('data-max', '999999');
    input.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    const form = findUnasForm(targetDoc);
    (form || targetDoc.body).appendChild(input);
  } else {
    input.value = String(qty);
  }
  return input;
}

/**
 * Kosárhoz adás az UNAS kosárba (ha window.cart_add elérhető).
 * @param {object} product - termék objektum (id, unas_id)
 * @param {number} quantity - mennyiség
 * @returns {boolean} - true ha sikeres, false ha nem elérhető vagy hiba
 */
export function addToUnasCart(product, quantity = 1) {
  if (typeof window === 'undefined') return false;
  const ctx = getCartAddContext();
  if (!ctx || typeof ctx.cartAdd !== 'function') return false;

  const unasId = toUnasProductId(product);
  if (!unasId) return false;

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));

  try {
    // Mennyiség input – a cart_add UGYANABBAN a documentban keresi (pl. parent/top)
    let targetDoc;
    try {
      targetDoc = ctx.win.document;
    } catch (_) {
      targetDoc = typeof document !== 'undefined' ? document : null;
    }
    if (!targetDoc) return false;
    ensureQtyInput(unasId, qty, targetDoc);
    // 4 paraméter: productId, prefix ('' = termék oldal), null, quantity
    ctx.cartAdd(unasId, CART_ADD_PREFIX, null, qty);
    if (window.__MARKETLY_DEBUG) {
      console.log('[unasCartService] cart_add called:', { unasId, qty }, `→ cart_add('${unasId}','',null,${qty})`);
    }
    return true;
  } catch (err) {
    if (window.__MARKETLY_DEBUG || process.env.NODE_ENV === 'development') {
      console.warn('[unasCartService] cart_add error:', err);
    }
    return false;
  }
}

/**
 * Ellenőrzi, hogy az UNAS kosár API elérhető-e.
 */
export function isUnasCartAvailable() {
  return typeof getCartAdd() === 'function';
}

/**
 * Kosár tartalom lekérdezése (UNAS.getCart).
 * @param {function} callback - (result) => void, result: { sum, items }
 * @param {object} opts - { lang: 'hu' }
 */
export function getUnasCart(callback, opts = {}) {
  if (typeof window === 'undefined') return;
  const UNAS = window.UNAS;
  if (!UNAS || typeof UNAS.getCart !== 'function') {
    if (callback) callback({ sum: 0, items: [] });
    return;
  }
  try {
    UNAS.getCart(callback, { lang: opts.lang || 'hu' });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[unasCartService] getCart error:', err);
    }
    if (callback) callback({ sum: 0, items: [] });
  }
}
