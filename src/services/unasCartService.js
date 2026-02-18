/**
 * UNAS Cart Service – kosárhoz adás (cart_add)
 * A widget UNAS oldalon fut, a termékek a fő UNAS kosárba kerülnek.
 *
 * cart_add(productId, prefix, null, quantity) – termék oldalon 4 paraméter
 * A cart_add a mennyiség inputot keresi: id="db_{prefix}{productId}" vagy id="db_{productId}"
 */

const CART_ADD_PREFIX = '';

/** Kinyeri a VX-XXXXX formátumú SKU-t linkből vagy képek URL-jéből (UNAS variant ref) */
function extractVxSku(product) {
  const link = (product?.link || product?.url || '').trim();
  const m1 = link.match(/(VX-\d+)/i);
  if (m1) return m1[1];
  const imgs = product?.images || (product?.image ? [product.image] : []);
  const firstImg = Array.isArray(imgs) ? imgs[0] : imgs;
  const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url || firstImg?.src || '';
  const m2 = String(imgUrl).match(/(VX-\d+)/i);
  if (m2) return m2[1];
  return null;
}

/**
 * UNAS termék ID formátum: VX__unas__{id}
 * Az UNAS add_to_favourites: cikk.replace(/-/g,'__unas__') → pl. VX-274769 → VX__unas__274769
 * Preferálja: unas_ref (VX-xxx), sku, link/képből kinyert VX-xxx, unas_id, id.
 */
function toUnasProductId(product) {
  if (!product) return null;
  // 1) unas_ref / sku – gyakran VX-274769 formátum
  let raw = product?.unas_ref ?? product?.sku ?? extractVxSku(product);
  if (raw) {
    const s = String(raw).trim();
    if (s && !s.startsWith('unas-prod-')) {
      if (s.includes('-')) return s.replace(/-/g, '__unas__');
      if (s.startsWith('VX__unas__')) return s;
      return `VX__unas__${s}`;
    }
  }
  // 2) unas_id / id – numerikus
  const id = product?.unas_id ?? product?.id;
  if (!id) return null;
  const str = String(id).trim();
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
 * Létrehozunk db_{unasId} és db_{numericId} inputot is – UNAS különböző sablonokban eltérő formátumot vár.
 */
function ensureQtyInput(unasId, qty, targetDoc) {
  if (!targetDoc) return null;
  const numericId = unasId.replace(/^VX__unas__/, '');
  const ids = [`db_${unasId}`];
  if (numericId && numericId !== unasId) ids.push(`db_${numericId}`);
  let input = null;
  for (const inputId of ids) {
    input = targetDoc.getElementById(inputId);
    if (input) break;
  }
  if (!input) {
    input = targetDoc.createElement('input');
    input.type = 'number';
    input.name = 'db';
    input.id = ids[0];
    input.value = String(qty);
    input.setAttribute('data-min', '1');
    input.setAttribute('data-max', '999999');
    input.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    const form = findUnasForm(targetDoc);
    (form || targetDoc.body).appendChild(input);
    // Fallback: numeric id input (ha UNAS ezt keresi)
    if (ids.length > 1) {
      const input2 = targetDoc.createElement('input');
      input2.type = 'number';
      input2.name = 'db';
      input2.id = ids[1];
      input2.value = String(qty);
      input2.setAttribute('data-min', '1');
      input2.setAttribute('data-max', '999999');
      input2.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
      (form || targetDoc.body).appendChild(input2);
    }
  } else {
    for (const id of ids) {
      const el = targetDoc.getElementById(id);
      if (el) el.value = String(qty);
    }
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
