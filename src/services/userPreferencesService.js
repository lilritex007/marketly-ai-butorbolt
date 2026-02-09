/**
 * User Preferences Service
 * Központi szolgáltatás a felhasználói viselkedés és preferenciák követésére
 * localStorage-ban tárolja az adatokat
 */

const STORAGE_KEYS = {
  VIEWED_PRODUCTS: 'mkt_viewed_products',
  LIKED_PRODUCTS: 'mkt_liked_products',
  DISLIKED_PRODUCTS: 'mkt_disliked_products',
  SEARCH_HISTORY: 'mkt_search_history',
  STYLE_DNA: 'mkt_style_dna',
  AI_FEEDBACK: 'mkt_ai_feedback',
  CHAT_CONTEXT: 'mkt_chat_context',
  USER_PREFERENCES: 'mkt_user_preferences',
  RECO_TWEAKS: 'mkt_reco_tweaks',
  RECO_WEIGHTS: 'mkt_reco_weights',
  AB_TESTS: 'mkt_ab_tests',
  BACK_IN_STOCK: 'mkt_back_in_stock',
  SECTION_EVENTS: 'mkt_section_events',
};

const MAX_ITEMS = {
  VIEWED: 50,
  LIKED: 100,
  SEARCHES: 20,
  FEEDBACK: 100,
};

const MAX_BACK_IN_STOCK = 100;

const DEFAULT_RECO_TWEAKS = {
  avoidStyles: [],
  avoidRooms: [],
};

const DEFAULT_RECO_WEIGHTS = {
  likeBoost: 20,
  viewPenalty: 8,
  dislikePenalty: 50,
  categoryBoost: 20,
  styleBoost: 12,
  roomBoost: 10,
  stockBoost: 6,
  priceFit: 8,
};

const getJSONSafe = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// ==================== VIEWED PRODUCTS ====================

/**
 * Termék megtekintésének rögzítése
 */
export function trackProductView(product) {
  if (!product?.id) return;
  
  const viewed = getViewedProducts();
  
  // Eltávolítjuk ha már volt, és az elejére tesszük
  const filtered = viewed.filter(p => p.id !== product.id);
  
  const productData = {
    id: product.id,
    name: product.name,
    price: product.salePrice || product.price,
    category: product.category,
    image: product.images?.[0] || product.image,
    viewedAt: Date.now(),
  };
  
  const updated = [productData, ...filtered].slice(0, MAX_ITEMS.VIEWED);
  
  try {
    localStorage.setItem(STORAGE_KEYS.VIEWED_PRODUCTS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save viewed products:', e);
  }
  
  // Preferenciák frissítése a kategória alapján
  updateCategoryPreference(product.category);
}

/**
 * Megtekintett termékek lekérdezése
 */
export function getViewedProducts(limit = 20) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VIEWED_PRODUCTS);
    const parsed = data ? JSON.parse(data) : [];
    return limit ? parsed.slice(0, limit) : parsed;
  } catch (e) {
    return [];
  }
}

/**
 * Legutóbbi megtekintett termék ID-k
 */
export function getRecentlyViewedIds(limit = 10) {
  return getViewedProducts(limit).map(p => p.id);
}

// ==================== LIKED/DISLIKED PRODUCTS ====================

/**
 * Termék kedvelése
 */
export function likeProduct(productId) {
  if (!productId) return;
  
  const liked = getLikedProducts();
  if (!liked.includes(productId)) {
    const updated = [productId, ...liked].slice(0, MAX_ITEMS.LIKED);
    localStorage.setItem(STORAGE_KEYS.LIKED_PRODUCTS, JSON.stringify(updated));
  }
  
  // Eltávolítás a disliked-ből
  const disliked = getDislikedProducts();
  if (disliked.includes(productId)) {
    localStorage.setItem(
      STORAGE_KEYS.DISLIKED_PRODUCTS, 
      JSON.stringify(disliked.filter(id => id !== productId))
    );
  }
}

/**
 * Termék elutasítása
 */
export function dislikeProduct(productId) {
  if (!productId) return;
  
  const disliked = getDislikedProducts();
  if (!disliked.includes(productId)) {
    const updated = [productId, ...disliked].slice(0, MAX_ITEMS.LIKED);
    localStorage.setItem(STORAGE_KEYS.DISLIKED_PRODUCTS, JSON.stringify(updated));
  }
  
  // Eltávolítás a liked-ből
  const liked = getLikedProducts();
  if (liked.includes(productId)) {
    localStorage.setItem(
      STORAGE_KEYS.LIKED_PRODUCTS, 
      JSON.stringify(liked.filter(id => id !== productId))
    );
  }
}

export function getLikedProducts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LIKED_PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function getDislikedProducts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DISLIKED_PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function isProductLiked(productId) {
  return getLikedProducts().includes(productId);
}

// ==================== BACK IN STOCK REQUESTS ====================

export function requestBackInStock(product) {
  if (!product?.id) return;
  const list = getBackInStockRequests();
  const filtered = list.filter((p) => p.id !== product.id);
  const next = [
    {
      id: product.id,
      name: product.name,
      image: product.images?.[0] || product.image,
      requestedAt: Date.now()
    },
    ...filtered
  ].slice(0, MAX_BACK_IN_STOCK);
  try {
    localStorage.setItem(STORAGE_KEYS.BACK_IN_STOCK, JSON.stringify(next));
  } catch (e) {
    console.warn('Failed to save back-in-stock request:', e);
  }
}

export function getBackInStockRequests(limit = 50) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACK_IN_STOCK);
    const list = raw ? JSON.parse(raw) : [];
    return limit ? list.slice(0, limit) : list;
  } catch {
    return [];
  }
}

// ==================== SECTION EVENTS (CTR) ====================

export function trackSectionEvent(sectionId, type = 'impression', productId = null) {
  if (!sectionId) return;
  const data = getJSONSafe(STORAGE_KEYS.SECTION_EVENTS, {});
  const entry = data[sectionId] || { impressions: 0, clicks: 0, lastEventAt: 0, products: {} };
  if (type === 'click') entry.clicks += 1;
  else entry.impressions += 1;
  entry.lastEventAt = Date.now();
  if (productId) {
    entry.products[productId] = (entry.products[productId] || 0) + 1;
  }
  data[sectionId] = entry;
  try {
    localStorage.setItem(STORAGE_KEYS.SECTION_EVENTS, JSON.stringify(data));
  } catch {}
}

export function getSectionStats(sectionId) {
  const data = getJSONSafe(STORAGE_KEYS.SECTION_EVENTS, {});
  return data[sectionId] || { impressions: 0, clicks: 0, lastEventAt: 0, products: {} };
}

// ==================== SEARCH HISTORY ====================

/**
 * Keresés rögzítése
 */
export function trackSearch(query) {
  if (!query || query.length < 2) return;
  
  const searches = getSearchHistory();
  const filtered = searches.filter(s => s.query.toLowerCase() !== query.toLowerCase());
  
  const updated = [
    { query, timestamp: Date.now() },
    ...filtered
  ].slice(0, MAX_ITEMS.SEARCHES);
  
  localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
}

export function getSearchHistory(limit = 10) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    const parsed = data ? JSON.parse(data) : [];
    return limit ? parsed.slice(0, limit) : parsed;
  } catch (e) {
    return [];
  }
}

// ==================== STYLE DNA (Quiz Results) ====================

/**
 * Style DNA mentése a quiz eredményéből
 */
export function saveStyleDNA(quizAnswers, styleDNAText) {
  const data = {
    answers: quizAnswers,
    styleDNA: styleDNAText,
    savedAt: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEYS.STYLE_DNA, JSON.stringify(data));
}

export function getStyleDNA() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STYLE_DNA);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// ==================== AI FEEDBACK ====================

/**
 * AI válasz visszajelzésének rögzítése
 */
export function trackAIFeedback(messageId, isPositive, context = {}) {
  const feedback = getAIFeedback();
  
  const updated = [
    {
      messageId,
      isPositive,
      context,
      timestamp: Date.now(),
    },
    ...feedback
  ].slice(0, MAX_ITEMS.FEEDBACK);
  
  localStorage.setItem(STORAGE_KEYS.AI_FEEDBACK, JSON.stringify(updated));
}

export function getAIFeedback() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AI_FEEDBACK);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * AI feedback statisztikák
 */
export function getAIFeedbackStats() {
  const feedback = getAIFeedback();
  const positive = feedback.filter(f => f.isPositive).length;
  const negative = feedback.filter(f => !f.isPositive).length;
  
  return {
    total: feedback.length,
    positive,
    negative,
    satisfactionRate: feedback.length > 0 ? (positive / feedback.length * 100).toFixed(1) : 0,
  };
}

// ==================== CHAT CONTEXT ====================

/**
 * Chat kontextus mentése (előző beszélgetések összefoglalója)
 */
export function saveChatContext(summary) {
  const context = {
    summary,
    savedAt: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEYS.CHAT_CONTEXT, JSON.stringify(context));
}

export function getChatContext() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_CONTEXT);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// ==================== USER PREFERENCES ====================

/**
 * Kategória preferencia frissítése
 */
function updateCategoryPreference(category) {
  if (!category) return;
  
  const prefs = getUserPreferences();
  const categories = prefs.categoryInterests || {};
  
  categories[category] = (categories[category] || 0) + 1;
  
  prefs.categoryInterests = categories;
  prefs.lastUpdated = Date.now();
  
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
}

export function getUserPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : { categoryInterests: {} };
  } catch (e) {
    return { categoryInterests: {} };
  }
}

export function getRecommendationTweaks() {
  const data = getJSONSafe(STORAGE_KEYS.RECO_TWEAKS, DEFAULT_RECO_TWEAKS);
  return { ...DEFAULT_RECO_TWEAKS, ...data };
}

export function setRecommendationTweaks(next) {
  const current = getRecommendationTweaks();
  const merged = { ...current, ...next };
  localStorage.setItem(STORAGE_KEYS.RECO_TWEAKS, JSON.stringify(merged));
  return merged;
}

export function resetRecommendationTweaks() {
  localStorage.setItem(STORAGE_KEYS.RECO_TWEAKS, JSON.stringify(DEFAULT_RECO_TWEAKS));
  return DEFAULT_RECO_TWEAKS;
}

export function getRecommendationWeights() {
  const data = getJSONSafe(STORAGE_KEYS.RECO_WEIGHTS, DEFAULT_RECO_WEIGHTS);
  return { ...DEFAULT_RECO_WEIGHTS, ...data };
}

export function setRecommendationWeights(next) {
  const current = getRecommendationWeights();
  const merged = { ...current, ...next };
  localStorage.setItem(STORAGE_KEYS.RECO_WEIGHTS, JSON.stringify(merged));
  return merged;
}

export function getABVariant(testId) {
  const tests = getJSONSafe(STORAGE_KEYS.AB_TESTS, {});
  if (tests[testId]?.variant) return tests[testId].variant;
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  tests[testId] = { variant, impressions: 0, clicks: 0 };
  localStorage.setItem(STORAGE_KEYS.AB_TESTS, JSON.stringify(tests));
  return variant;
}

export function trackABEvent(testId, type = 'impression') {
  const tests = getJSONSafe(STORAGE_KEYS.AB_TESTS, {});
  if (!tests[testId]) {
    tests[testId] = { variant: getABVariant(testId), impressions: 0, clicks: 0 };
  }
  if (type === 'click') tests[testId].clicks += 1;
  else tests[testId].impressions += 1;
  localStorage.setItem(STORAGE_KEYS.AB_TESTS, JSON.stringify(tests));
  return tests[testId];
}

/**
 * Top kategóriák a felhasználói érdeklődés alapján
 */
export function getTopCategories(limit = 5) {
  const prefs = getUserPreferences();
  const categories = prefs.categoryInterests || {};
  
  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

// ==================== PERSONALIZED CONTEXT FOR AI ====================

/**
 * Személyre szabott kontextus generálása az AI számára
 */
export function getPersonalizedContext() {
  const viewedProducts = getViewedProducts(5);
  const likedProducts = getLikedProducts();
  const topCategories = getTopCategories(3);
  const styleDNA = getStyleDNA();
  const searchHistory = getSearchHistory(5);
  
  let context = '';
  
  if (styleDNA?.styleDNA) {
    context += `A felhasználó stílus profilja: ${styleDNA.styleDNA}\n`;
  }
  
  if (topCategories.length > 0) {
    context += `Kedvelt kategóriák: ${topCategories.join(', ')}\n`;
  }
  
  if (viewedProducts.length > 0) {
    context += `Nemrég nézett termékek: ${viewedProducts.map(p => p.name).join(', ')}\n`;
  }
  
  if (searchHistory.length > 0) {
    context += `Korábbi keresések: ${searchHistory.map(s => s.query).join(', ')}\n`;
  }
  
  if (likedProducts.length > 0) {
    context += `Kedvelt termékek száma: ${likedProducts.length}\n`;
  }
  
  return context || 'Új felhasználó, nincs előzmény.';
}

/**
 * Személyre szabott termék ajánlások
 * Figyelembe veszi: megtekintett, kedvelt, kategória preferenciák
 */
export function getPersonalizedRecommendations(allProducts, limit = 12) {
  if (!allProducts || allProducts.length === 0) return [];
  
  const viewedIds = getRecentlyViewedIds();
  const likedIds = getLikedProducts();
  const dislikedIds = getDislikedProducts();
  const topCategories = getTopCategories(5);
  const styleDNA = getStyleDNA();
  const tweaks = getRecommendationTweaks();
  const weights = getRecommendationWeights();
  const viewedProducts = getViewedProducts(20);
  const avgPriceBase = viewedProducts.length > 0 ? viewedProducts : [];
  const avgPrice = avgPriceBase.length > 0
    ? avgPriceBase.reduce((sum, p) => sum + (p.price || 0), 0) / avgPriceBase.length
    : null;
  
  // Pontozzuk a termékeket
  const scored = allProducts.map(product => {
    let score = 0;
    const price = product.salePrice || product.price || 0;
    
    // Ne ajánljunk olyat, amit már nézett vagy nem kedvelt
    if (viewedIds.includes(product.id)) score -= weights.viewPenalty;
    if (dislikedIds.includes(product.id)) score -= weights.dislikePenalty;
    if (likedIds.includes(product.id)) score += weights.likeBoost;
    
    // Kategória preferencia
    const productCategory = product.category || '';
    topCategories.forEach((cat, index) => {
      if (productCategory.toLowerCase().includes(cat.toLowerCase())) {
        score += (5 - index) * weights.categoryBoost * 0.2;
      }
    });
    
    // Style DNA alapú pontozás
    if (styleDNA?.answers) {
      const { space, colors, budget, priority, room } = styleDNA.answers;
      const productText = `${product.name} ${product.category} ${product.description || ''}`.toLowerCase();
      
      // Stílus
      const styleKeywords = {
        modern: ['modern', 'minimalista', 'letisztult'],
        scandinavian: ['skandináv', 'natúr', 'világos', 'fehér'],
        industrial: ['indusztriális', 'loft', 'fém', 'ipari'],
        vintage: ['vintage', 'retro', 'antik'],
        bohemian: ['bohém', 'színes', 'mintás'],
      };
      
      if (space && styleKeywords[space]) {
        styleKeywords[space].forEach(kw => {
          if (productText.includes(kw)) score += weights.styleBoost;
        });
        if (tweaks.avoidStyles?.includes(space)) score -= weights.styleBoost * 2;
      }
      
    // Budget
      if (budget === 'budget' && price < 100000) score += weights.priceFit;
      if (budget === 'mid' && price >= 100000 && price <= 300000) score += weights.priceFit;
      if (budget === 'premium' && price > 300000) score += weights.priceFit;
      
      // Szoba típus
      const roomKeywords = {
        living: ['kanapé', 'fotel', 'dohányzó', 'tv', 'nappali'],
        bedroom: ['ágy', 'matrac', 'éjjeli', 'hálószoba'],
        dining: ['étkező', 'asztal', 'szék'],
        office: ['íróasztal', 'iroda', 'forgószék'],
      };
      
      if (room && roomKeywords[room]) {
        roomKeywords[room].forEach(kw => {
          if (productText.includes(kw)) score += weights.roomBoost;
        });
        if (tweaks.avoidRooms?.includes(room)) score -= weights.roomBoost * 2;
      }
    }

    if (avgPrice && price > 0) {
      const diff = Math.abs(price - avgPrice) / avgPrice;
      score += Math.max(0, (1 - Math.min(diff, 1))) * weights.priceFit;
    }

    const stockQty = product.stock_qty ?? product.stockQty;
    if (typeof stockQty === 'number') {
      score += Math.min(20, stockQty) * (weights.stockBoost / 20);
      if (stockQty === 0) score -= weights.stockBoost;
    }
    
    // Kis random faktor a változatosságért
    score += Math.random() * 5;
    
    return { product, score };
  });
  
  // Top termékek visszaadása
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.product);
}

/**
 * Hasonló termékek keresése
 */
export function getSimilarProducts(product, allProducts, limit = 8) {
  if (!product || !allProducts) return [];
  
  const dislikedIds = getDislikedProducts();
  
  const productName = (product.name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const productPrice = product.salePrice || product.price || 0;
  
  // Kulcsszavak kinyerése a névből
  const keywords = productName
    .split(/[\s,\-\/]+/)
    .filter(w => w.length > 3)
    .slice(0, 5);
  
  const scored = allProducts
    .filter(p => p.id !== product.id && !dislikedIds.includes(p.id))
    .map(p => {
      let score = 0;
      const pName = (p.name || '').toLowerCase();
      const pCategory = (p.category || '').toLowerCase();
      const pPrice = p.salePrice || p.price || 0;
      
      // Ugyanaz a kategória
      if (pCategory && productCategory && pCategory.includes(productCategory.split(' > ')[0])) {
        score += 30;
      }
      
      // Hasonló ár (±30%)
      if (pPrice > 0 && productPrice > 0) {
        const priceDiff = Math.abs(pPrice - productPrice) / productPrice;
        if (priceDiff < 0.3) score += 20;
        else if (priceDiff < 0.5) score += 10;
      }
      
      // Kulcsszó egyezés
      keywords.forEach(kw => {
        if (pName.includes(kw)) score += 5;
      });
      
      return { product: p, score };
    });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.product);
}

// ==================== CLEAR DATA ====================

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export default {
  trackProductView,
  getViewedProducts,
  getRecentlyViewedIds,
  likeProduct,
  dislikeProduct,
  getLikedProducts,
  getDislikedProducts,
  isProductLiked,
  trackSearch,
  getSearchHistory,
  saveStyleDNA,
  getStyleDNA,
  trackAIFeedback,
  getAIFeedback,
  getAIFeedbackStats,
  saveChatContext,
  getChatContext,
  getUserPreferences,
  getTopCategories,
  getPersonalizedContext,
  getPersonalizedRecommendations,
  getSimilarProducts,
  requestBackInStock,
  getBackInStockRequests,
  trackSectionEvent,
  getSectionStats,
  clearAllData,
};
