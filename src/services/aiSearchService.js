/**
 * AI Search Service - EGYSZERŰ ÉS MŰKÖDŐ KERESŐ
 * 200.000 termék - MINDENT MEGTALÁL
 */

import { generateText } from './geminiService';
import { 
  getViewedProducts, 
  getSearchHistory, 
  getTopCategories, 
  getStyleDNA,
  getLikedProducts 
} from './userPreferencesService';

// ==================== SEGÉDFÜGGVÉNYEK ====================

// Ékezet eltávolítás - FONTOS a magyar kereséshez
const removeAccents = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ő/gi, 'o')
    .replace(/ű/gi, 'u')
    .replace(/ö/gi, 'o')
    .replace(/ü/gi, 'u')
    .replace(/ó/gi, 'o')
    .replace(/ú/gi, 'u')
    .replace(/á/gi, 'a')
    .replace(/é/gi, 'e')
    .replace(/í/gi, 'i')
    .trim();
};

// Szinonimák - bővített lista
const SYNONYMS = {
  'kanape': ['szófa', 'sofa', 'couch', 'kanapé', 'ülőgarnitúra', 'rekamié'],
  'fotel': ['karosszék', 'armchair', 'pihenőfotel', 'relax', 'füles'],
  'asztal': ['table', 'asztalka'],
  'szek': ['szék', 'chair', 'ülőke'],
  'agy': ['ágy', 'bed', 'franciaágy', 'heverő'],
  'szekreny': ['szekrény', 'gardrób', 'cabinet', 'ruhásszekrény'],
  'polc': ['shelf', 'könyvespolc', 'falipolc'],
  'komod': ['komód', 'fiókos', 'drawer'],
};

// Szinonimák kibővítése
const expandQuery = (query) => {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set(words);
  
  words.forEach(word => {
    const wordNoAccent = removeAccents(word);
    expanded.add(wordNoAccent);
    
    // Szinonimák hozzáadása
    Object.entries(SYNONYMS).forEach(([key, syns]) => {
      if (wordNoAccent.includes(key) || key.includes(wordNoAccent)) {
        syns.forEach(s => expanded.add(removeAccents(s)));
      }
      syns.forEach(syn => {
        if (removeAccents(syn).includes(wordNoAccent) || wordNoAccent.includes(removeAccents(syn))) {
          expanded.add(key);
          syns.forEach(s => expanded.add(removeAccents(s)));
        }
      });
    });
  });
  
  return Array.from(expanded).filter(w => w.length >= 2);
};

// ==================== FŐ KERESÉS ====================

/**
 * EGYSZERŰ ÉS HATÉKONY KERESÉS
 * - Végigmegy MINDEN terméken
 * - Pontos és részleges egyezések
 * - Szinonimák támogatása
 */
export const smartSearch = (products, query, options = {}) => {
  const { limit = 50 } = options;
  
  console.log(`🔍 Searching in ${products?.length || 0} products for: "${query}"`);
  
  if (!query || !query.trim() || !products || products.length === 0) {
    console.log('❌ No query or no products');
    return { results: [], intent: null, suggestions: [], totalMatches: 0 };
  }
  
  const startTime = performance.now();
  const queryLower = query.toLowerCase().trim();
  const queryNoAccent = removeAccents(queryLower);
  const queryWords = expandQuery(queryLower);
  
  console.log(`📝 Query words (expanded): ${queryWords.join(', ')}`);
  
  // Pontozás minden termékre
  const scored = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const name = (product.name || '').toLowerCase();
    const nameNoAccent = removeAccents(name);
    const category = removeAccents((product.category || '').toLowerCase());
    const searchText = `${nameNoAccent} ${category}`;
    
    let score = 0;
    
    // 1. PONTOS EGYEZÉS a teljes query-re (LEGJOBB)
    if (nameNoAccent.includes(queryNoAccent)) {
      score += 1000;
      if (nameNoAccent.startsWith(queryNoAccent)) {
        score += 500; // Prefix match extra
      }
    }
    
    // 2. Minden keresőszóra ellenőrzés
    let matchedWords = 0;
    for (const word of queryWords) {
      if (word.length < 2) continue;
      
      if (searchText.includes(word)) {
        matchedWords++;
        // Név egyezés jobb mint kategória
        if (nameNoAccent.includes(word)) {
          score += 100;
        } else {
          score += 30;
        }
      }
    }
    
    // Bónusz ha több szó egyezik
    if (matchedWords > 1) {
      score += matchedWords * 50;
    }
    
    // Csak pozitív score-okat tartjuk meg
    if (score > 0) {
      scored.push({ product, score, matchedWords });
    }
  }
  
  // Rendezés pontszám szerint
  scored.sort((a, b) => b.score - a.score);
  
  const results = scored.slice(0, limit).map(s => s.product);
  const searchTime = performance.now() - startTime;
  
  console.log(`✅ Found ${scored.length} matches in ${searchTime.toFixed(0)}ms`);
  if (results.length > 0) {
    console.log(`   Top result: "${results[0].name}" (score: ${scored[0].score})`);
  }
  
  return {
    results,
    intent: parseSearchIntent(query),
    suggestions: [],
    totalMatches: scored.length,
    searchTime,
  };
};

/**
 * AUTOCOMPLETE - gyors javaslatok gépelés közben
 */
export const getAutocompleteSuggestions = (products, query, limit = 10) => {
  if (!query || query.length < 2 || !products || products.length === 0) {
    return [];
  }
  
  const queryNoAccent = removeAccents(query.toLowerCase());
  const suggestions = [];
  const seen = new Set();
  
  // Egyszerű keresés - első X egyező termék
  for (const product of products) {
    if (suggestions.length >= limit * 3) break;
    
    const name = product.name || '';
    const nameNoAccent = removeAccents(name.toLowerCase());
    
    if (nameNoAccent.includes(queryNoAccent) && !seen.has(name)) {
      seen.add(name);
      const isPrefix = nameNoAccent.startsWith(queryNoAccent);
      suggestions.push({
        text: name,
        type: 'product',
        product: product,
        score: isPrefix ? 100 : 50,
      });
    }
  }
  
  // Rendezés és limitálás
  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, limit);
};

/**
 * Keresési szándék felismerése
 */
export const parseSearchIntent = (query) => {
  const intent = {
    originalQuery: query,
    productTypes: [],
    styles: [],
    colors: [],
    priceRange: null,
    keywords: query.toLowerCase().split(/\s+/).filter(w => w.length > 2),
  };
  
  const q = query.toLowerCase();
  
  // Termék típusok
  const types = ['kanapé', 'fotel', 'asztal', 'szék', 'ágy', 'szekrény', 'polc', 'komód'];
  types.forEach(t => {
    if (q.includes(t) || q.includes(removeAccents(t))) {
      intent.productTypes.push(t);
    }
  });
  
  // Színek
  const colors = ['fehér', 'fekete', 'szürke', 'barna', 'kék', 'zöld', 'piros', 'bézs'];
  colors.forEach(c => {
    if (q.includes(c) || q.includes(removeAccents(c))) {
      intent.colors.push(c);
    }
  });
  
  // Stílusok
  const styles = ['modern', 'skandináv', 'klasszikus', 'rusztikus', 'minimalista'];
  styles.forEach(s => {
    if (q.includes(s) || q.includes(removeAccents(s))) {
      intent.styles.push(s);
    }
  });
  
  // Ár
  const priceMatch = q.match(/(\d+)\s*(ezer|e|k)/i);
  if (priceMatch) {
    const value = parseInt(priceMatch[1]) * 1000;
    if (q.includes('alatt') || q.includes('ig')) {
      intent.priceRange = { min: 0, max: value };
    } else if (q.includes('felett') || q.includes('fölött')) {
      intent.priceRange = { min: value, max: Infinity };
    }
  }
  
  return intent;
};

/**
 * Proaktív javaslatok
 */
export const getProactiveSuggestions = (products) => {
  const suggestions = [];
  
  // Korábbi keresések
  const history = getSearchHistory(2);
  if (history.length > 0) {
    suggestions.push({
      type: 'recent',
      icon: '🕐',
      text: history[0].query,
      query: history[0].query,
    });
  }
  
  // Népszerű keresések
  const popular = [
    { icon: '🛋️', text: 'kanapé', query: 'kanapé' },
    { icon: '💺', text: 'fotel', query: 'fotel' },
    { icon: '🪑', text: 'szék', query: 'szék' },
    { icon: '🛏️', text: 'ágy', query: 'ágy' },
  ];
  
  popular.forEach(p => {
    if (suggestions.length < 5) {
      suggestions.push({ type: 'popular', ...p });
    }
  });
  
  return suggestions;
};

// Export default
export default {
  smartSearch,
  getAutocompleteSuggestions,
  parseSearchIntent,
  getProactiveSuggestions,
};
