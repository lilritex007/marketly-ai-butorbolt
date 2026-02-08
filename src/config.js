/**
 * Marketly AI Bútorbolt – központi konfiguráció
 * Egy helyen: domain, shop id, batch méret, tab hash mapping.
 */

export const WEBSHOP_DOMAIN = 'https://www.marketly.hu';
export const SHOP_ID = '81697';

/** Kezdeti és "load more" batch méret a termék listánál */
export const DISPLAY_BATCH = 36;
/** Első lap mérete (API) – gyors first paint, alacsony memória */
export const INITIAL_PAGE = 36;

/** Tab értékek és hash (#shop, #visual-search, #room-planner) */
export const TAB_HASH = {
  shop: 'shop',
  'visual-search': 'visual-search',
  'room-planner': 'room-planner'
};

export const HASH_TO_TAB = {
  '': 'shop',
  'shop': 'shop',
  'visual-search': 'visual-search',
  'room-planner': 'room-planner'
};
