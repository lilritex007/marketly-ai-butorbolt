/**
 * UNAS Cart Service – kosárhoz adás és kosár lekérdezés
 * A widget UNAS oldalon fut, így window.cart_add és UNAS.getCart elérhető.
 *
 * cart_add(productId, prefix, null, quantity) – termék oldalon 4 paraméter
 * UNAS.getCart(callback, { lang: 'hu' }) – kosár tartalom
 */

const CART_ADD_PREFIX = 'marketly_';

/**
 * UNAS termék ID formátum: VX__unas__{id}
 * Ha a product.id már ebben a formátumban van, nem duplikáljuk.
 */
function toUnasProductId(product) {
  const id = product?.unas_id ?? product?.id;
  if (!id) return null;
  const str = String(id);
  if (str.startsWith('VX__unas__')) return str;
  return `VX__unas__${id}`;
}

/**
 * Kosárhoz adás az UNAS kosárba (ha window.cart_add elérhető).
 * @param {object} product - termék objektum (id, unas_id)
 * @param {number} quantity - mennyiség
 * @returns {boolean} - true ha sikeres, false ha nem elérhető vagy hiba
 */
export function addToUnasCart(product, quantity = 1) {
  if (typeof window === 'undefined') return false;
  const cartAdd = window.cart_add;
  if (typeof cartAdd !== 'function') return false;

  const unasId = toUnasProductId(product);
  if (!unasId) return false;

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));

  try {
    // 4 paraméter: productId, prefix, null, quantity (termék oldal formátum)
    cartAdd(unasId, CART_ADD_PREFIX, null, qty);
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[unasCartService] cart_add error:', err);
    }
    return false;
  }
}

/**
 * Ellenőrzi, hogy az UNAS kosár API elérhető-e.
 */
export function isUnasCartAvailable() {
  if (typeof window === 'undefined') return false;
  return typeof window.cart_add === 'function';
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
