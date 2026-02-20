/**
 * ============================================================================
 * MARKETLY AI SEARCH ENGINE v5.0 - PROFESSIONAL INSTANT SEARCH
 * ============================================================================
 *
 * - NON-BLOCKING: Chunked async indexing
 * - PRECISE: Intent-based scoring + filtering
 * - FUZZY: Typo tolerance (Levenshtein)
 * - FAST: Prefix map O(1) lookup, no O(n) loop
 * - CACHED: LRU cache
 */

import { SYNONYMS, expandWithSynonyms } from '../../shared/searchSynonyms.js';

const DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

// ============================================================================
// TEXT NORMALIZATION (local - shared uses its own)
// ============================================================================

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ő/g, 'o').replace(/ű/g, 'u')
    .replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ó/g, 'o').replace(/ú/g, 'u')
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getWords(str) {
  return normalize(str).split(' ').filter(w => w.length >= 2);
}

// WORD_TO_ROOT for parseSearchIntent (local copy for speed)
const WORD_TO_ROOT = new Map();
for (const [root, syns] of Object.entries(SYNONYMS)) {
  const rootNorm = normalize(root);
  WORD_TO_ROOT.set(rootNorm, rootNorm);
  for (const syn of syns || []) {
    WORD_TO_ROOT.set(normalize(syn), rootNorm);
  }
}

// Levenshtein distance - typo tolerance
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

/** Find words in vocabulary within edit distance - only same first letter + similar length for speed */
function findFuzzyMatches(word, vocabulary, maxDist = 2) {
  const results = [];
  const dist = word.length <= 4 ? 1 : Math.min(2, Math.floor(word.length / 4) + 1);
  const first = word[0];
  const lenMin = word.length - 2;
  const lenMax = word.length + 2;
  for (const v of vocabulary) {
    if (v === word) continue;
    if (v[0] !== first || v.length < lenMin || v.length > lenMax) continue;
    const d = levenshtein(word, v);
    if (d <= dist && d <= maxDist) results.push(v);
  }
  return results;
}

// ============================================================================
// ENGINE STATE
// ============================================================================

let INDEX = {
  ready: false,
  building: false,
  products: [],
  normalized: [],
  wordToProducts: new Map(),
  prefixToWords: new Map(), // prefix (3+ chars) -> Set<word> - O(1) prefix lookup
  cache: new Map(),
  stats: { products: 0, words: 0, buildTime: 0 }
};

function devLog(...args) {
  if (DEV) console.log(...args);
}

// ============================================================================
// INDEX BUILDING - with prefix map
// ============================================================================

function buildPrefixMap() {
  INDEX.prefixToWords = new Map();
  for (const word of INDEX.wordToProducts.keys()) {
    if (word.length < 3) continue;
    for (let len = 3; len <= word.length; len++) {
      const prefix = word.substring(0, len);
      if (!INDEX.prefixToWords.has(prefix)) {
        INDEX.prefixToWords.set(prefix, new Set());
      }
      INDEX.prefixToWords.get(prefix).add(word);
    }
  }
}

export async function buildSearchIndex(products) {
  if (!products || products.length === 0) {
    if (DEV) console.warn('⚠️ No products to index');
    return false;
  }

  if (INDEX.building) {
    devLog('⏳ Index already building...');
    return false;
  }

  if (INDEX.ready && INDEX.products === products && INDEX.stats.products === products.length) {
    devLog('✅ Index already up to date');
    return true;
  }

  INDEX.building = true;
  INDEX.ready = false;
  devLog(`🧠 Starting to learn ${products.length.toLocaleString()} products...`);

  const startTime = performance.now();

  INDEX.products = products;
  INDEX.normalized = new Array(products.length);
  INDEX.wordToProducts = new Map();
  INDEX.cache = new Map();

  const includeDesc = products.length <= 50000;
  const CHUNK_SIZE = 5000;
  let processed = 0;

  const processChunk = () => {
    return new Promise(resolve => {
      const end = Math.min(processed + CHUNK_SIZE, products.length);

      for (let i = processed; i < end; i++) {
        const p = products[i];
        const nameNorm = normalize(p.name || '');
        const catNorm = normalize(p.category || '');
        const descNorm = includeDesc ? normalize((p.description || '').substring(0, 200)) : '';

        const allWords = new Set([
          ...getWords(nameNorm),
          ...getWords(catNorm),
          ...(includeDesc ? getWords(descNorm) : [])
        ]);
        const expanded = expandWithSynonyms(Array.from(allWords));

        INDEX.normalized[i] = { nameNorm, catNorm, price: p.salePrice || p.price || 0 };

        for (const word of expanded) {
          if (!INDEX.wordToProducts.has(word)) {
            INDEX.wordToProducts.set(word, new Set());
          }
          INDEX.wordToProducts.get(word).add(i);
        }
      }

      processed = end;
      setTimeout(resolve, 0);
    });
  };

  while (processed < products.length) {
    await processChunk();
    const pct = Math.round((processed / products.length) * 100);
    if (pct % 20 === 0 && pct > 0) devLog(`   📊 ${pct}% indexed...`);
  }

  buildPrefixMap();

  const elapsed = performance.now() - startTime;
  INDEX.ready = true;
  INDEX.building = false;
  INDEX.stats = {
    products: products.length,
    words: INDEX.wordToProducts.size,
    buildTime: elapsed
  };

  devLog(`✅ LEARNED ${products.length.toLocaleString()} products in ${elapsed.toFixed(0)}ms`);
  devLog(`   📚 ${INDEX.wordToProducts.size.toLocaleString()} words, ${INDEX.prefixToWords.size} prefixes`);

  return true;
}

export function isIndexReady() {
  return INDEX.ready;
}

export function getIndexStats() {
  return {
    isIndexed: INDEX.ready,
    building: INDEX.building,
    productCount: INDEX.stats.products,
    wordCount: INDEX.stats.words,
    buildTime: INDEX.stats.buildTime
  };
}

// ============================================================================
// MAIN SEARCH - with intent filtering, prefix map, typo tolerance
// ============================================================================

export function smartSearch(products, query, options = {}) {
  const { limit = 100, applyIntent = true } = options;

  if (!query || !query.trim()) {
    return { results: [], totalMatches: 0, searchTime: 0 };
  }

  if ((!products || products.length === 0) && !INDEX.ready) {
    if (DEV) console.warn('⚠️ smartSearch: No products and no index');
    return { results: [], totalMatches: 0, searchTime: 0 };
  }

  const queryNorm = normalize(query.trim());
  const intent = applyIntent ? parseSearchIntent(query) : null;

  const cacheKey = `${queryNorm}:${limit}:${intent?.priceRange ? JSON.stringify(intent.priceRange) : ''}`;
  if (INDEX.cache.has(cacheKey)) {
    const cached = INDEX.cache.get(cacheKey);
    return { ...cached, fromCache: true };
  }

  const startTime = performance.now();

  if (!INDEX.ready && !INDEX.building && products?.length > 0) {
    buildSearchIndexSync(products);
  }

  if (!INDEX.ready) {
    return directSearch(products, queryNorm, limit, intent);
  }

  const queryWords = getWords(queryNorm);
  const expandedQuery = expandWithSynonyms(queryWords);

  const candidateScores = new Map();
  const vocabArray = Array.from(INDEX.wordToProducts.keys());

  for (const word of expandedQuery) {
    let matched = false;

    // Exact match
    const exact = INDEX.wordToProducts.get(word);
    if (exact) {
      matched = true;
      for (const idx of exact) {
        candidateScores.set(idx, (candidateScores.get(idx) || 0) + 10);
      }
    }

    // Prefix match via O(1) lookup (no O(n) loop)
    if (word.length >= 3 && INDEX.prefixToWords?.has(word)) {
      const prefixWords = INDEX.prefixToWords.get(word);
      for (const indexedWord of prefixWords) {
        if (indexedWord === word) continue;
        const idxSet = INDEX.wordToProducts.get(indexedWord);
        if (idxSet) {
          matched = true;
          for (const idx of idxSet) {
            candidateScores.set(idx, (candidateScores.get(idx) || 0) + 5);
          }
        }
      }
    }

    // Typo tolerance - ha nincs exact/prefix, próbálj fuzzy-t
    if (!matched && word.length >= 3) {
      const fuzzy = findFuzzyMatches(word, vocabArray, 2);
      for (const fw of fuzzy.slice(0, 5)) {
        const idxSet = INDEX.wordToProducts.get(fw);
        if (idxSet) {
          for (const idx of idxSet) {
            candidateScores.set(idx, (candidateScores.get(idx) || 0) + 3);
          }
        }
      }
    }
  }

  const scored = [];

  for (const [idx, baseScore] of candidateScores) {
    const norm = INDEX.normalized[idx];
    const product = INDEX.products[idx];
    if (!norm || !product) continue;

    // Intent: ár szűrés
    if (applyIntent && intent?.priceRange) {
      const price = Number(norm.price) || 0;
      if (intent.priceRange.max != null && price > intent.priceRange.max) continue;
      if (intent.priceRange.min != null && price < intent.priceRange.min) continue;
    }

    let score = baseScore;

    if (norm.nameNorm.includes(queryNorm)) {
      score += 1000;
      if (norm.nameNorm === queryNorm) score += 2000;
      else if (norm.nameNorm.startsWith(queryNorm)) score += 500;
    }

    let nameWordMatches = 0;
    for (const w of queryWords) {
      if (norm.nameNorm.includes(w)) {
        nameWordMatches++;
        score += 50;
      }
    }
    if (nameWordMatches === queryWords.length && queryWords.length > 1) score += 300;

    if (norm.catNorm.includes(queryNorm)) score += 100;
    for (const w of queryWords) {
      if (norm.catNorm.includes(w)) score += 30;
    }

    scored.push({ idx, score, product });
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, limit).map(s => s.product);
  const searchTime = performance.now() - startTime;

  devLog(`✅ Found ${scored.length} matches in ${searchTime.toFixed(1)}ms`);

  const result = { results, totalMatches: scored.length, searchTime };
  if (scored.length > 0) {
    INDEX.cache.set(cacheKey, result);
    if (INDEX.cache.size > 500) {
      const firstKey = INDEX.cache.keys().next().value;
      INDEX.cache.delete(firstKey);
    }
  }

  return result;
}

function buildSearchIndexSync(products) {
  if (INDEX.building) return;

  INDEX.products = products;
  INDEX.normalized = [];
  INDEX.wordToProducts = new Map();
  INDEX.cache = new Map();

  const includeDesc = products.length <= 50000;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const nameNorm = normalize(p.name || '');
    const catNorm = normalize(p.category || '');
    const descNorm = includeDesc ? normalize((p.description || '').substring(0, 200)) : '';

    const allWords = new Set([
      ...getWords(nameNorm),
      ...getWords(catNorm),
      ...(includeDesc ? getWords(descNorm) : [])
    ]);
    const expanded = expandWithSynonyms(Array.from(allWords));

    INDEX.normalized[i] = { nameNorm, catNorm, price: p.salePrice || p.price || 0 };

    for (const word of expanded) {
      if (!INDEX.wordToProducts.has(word)) {
        INDEX.wordToProducts.set(word, new Set());
      }
      INDEX.wordToProducts.get(word).add(i);
    }
  }

  buildPrefixMap();
  INDEX.ready = true;
  INDEX.stats = { products: products.length, words: INDEX.wordToProducts.size, buildTime: 0 };
  if (DEV) devLog(`✅ Sync index built: ${products.length} products`);
}

function directSearch(products, queryNorm, limit, intent) {
  if (!products || products.length === 0) {
    return { results: [], totalMatches: 0, searchTime: 0 };
  }

  const startTime = performance.now();
  const queryWords = getWords(queryNorm);
  const expandedQuery = expandWithSynonyms(queryWords);
  const scored = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const nameNorm = normalize(p.name || '');
    const catNorm = normalize(p.category || '');
    const price = Number(p.salePrice ?? p.price ?? 0) || 0;

    if (intent?.priceRange) {
      if (intent.priceRange.max != null && price > intent.priceRange.max) continue;
      if (intent.priceRange.min != null && price < intent.priceRange.min) continue;
    }

    let score = 0;
    if (nameNorm.includes(queryNorm)) {
      score += 1000;
      if (nameNorm.startsWith(queryNorm)) score += 500;
    }

    for (const word of expandedQuery) {
      if (nameNorm.includes(word)) score += 50;
      if (catNorm.includes(word)) score += 20;
    }

    if (score > 0) scored.push({ product: p, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, limit).map(s => s.product);
  return { results, totalMatches: scored.length, searchTime: performance.now() - startTime };
}

// ============================================================================
// AUTOCOMPLETE - index-based, early exit, prefix map
// ============================================================================

export function getAutocompleteSuggestions(products, query, limit = 10) {
  if (!query || query.length < 2) return [];

  const queryNorm = normalize(query);
  const suggestions = [];
  const seen = new Set();

  if (INDEX.ready && INDEX.products.length > 0) {
    // Use prefix map for fast product name lookup
    const prefixMatches = INDEX.prefixToWords?.get(queryNorm);
    const exactWord = INDEX.wordToProducts.get(queryNorm);
    const wordsToCheck = new Set(prefixMatches || []);
    if (exactWord) wordsToCheck.add(queryNorm);

    for (const word of wordsToCheck) {
      const idxSet = INDEX.wordToProducts.get(word);
      if (!idxSet) continue;
      for (const idx of idxSet) {
        if (suggestions.length >= limit * 3) break;
        const product = INDEX.products[idx];
        const name = product?.name;
        if (!name || seen.has(name)) continue;
        seen.add(name);
        const nameNorm = INDEX.normalized[idx]?.nameNorm || '';
        const score = nameNorm.startsWith(queryNorm) ? 200 : 100;
        suggestions.push({ text: name, type: 'product', product, score });
      }
      if (suggestions.length >= limit * 3) break;
    }

    // Fallback: contains in name (via normalized)
    if (suggestions.length < limit) {
      for (let i = 0; i < INDEX.products.length; i++) {
        if (suggestions.length >= limit * 3) break;
        const nameNorm = INDEX.normalized[i]?.nameNorm || '';
        if (!nameNorm.includes(queryNorm) || nameNorm.startsWith(queryNorm)) continue;
        const product = INDEX.products[i];
        const name = product?.name;
        if (!name || seen.has(name)) continue;
        seen.add(name);
        suggestions.push({ text: name, type: 'product', product, score: 80 });
      }
    }
  } else {
    const prods = products || [];
    const maxScan = Math.min(prods.length, 50000);
    for (let i = 0; i < maxScan; i++) {
      if (suggestions.length >= limit * 3) break;
      const product = prods[i];
      const nameNorm = normalize(product?.name || '');
      if (!nameNorm) continue;
      if (nameNorm.startsWith(queryNorm)) {
        if (!seen.has(product.name)) {
          seen.add(product.name);
          suggestions.push({ text: product.name, type: 'product', product, score: 200 });
        }
      } else if (nameNorm.includes(queryNorm)) {
        if (!seen.has(product.name)) {
          seen.add(product.name);
          suggestions.push({ text: product.name, type: 'product', product, score: 100 });
        }
      }
    }
  }

  for (const [root, syns] of Object.entries(SYNONYMS)) {
    if (suggestions.length >= limit) break;
    if (normalize(root).includes(queryNorm) && !seen.has(root)) {
      seen.add(root);
      suggestions.push({ text: root, type: 'keyword', score: 50 });
    }
  }

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, limit);
}

// ============================================================================
// INTENT PARSING - expanded price, types, styles
// ============================================================================

export function parseSearchIntent(query) {
  const queryNorm = normalize(query);
  const intent = {
    originalQuery: query,
    productTypes: [],
    colors: [],
    styles: [],
    materials: [],
    priceRange: null,
    keywords: getWords(query)
  };

  const typeRoots = ['kanape', 'fotel', 'asztal', 'szek', 'agy', 'szekreny', 'polc', 'komod', 'gardrob', 'sarokkanape', 'tvszekreny', 'ejjeliszekreny'];
  const colorRoots = ['feher', 'fekete', 'szurke', 'barna', 'bezs', 'kek', 'zold', 'piros', 'sarga'];
  const styleRoots = ['modern', 'skandinav', 'rusztikus', 'indusztrialis', 'klasszikus', 'retro', 'minimalista'];
  const materialRoots = ['fa', 'fem', 'bor', 'szovet', 'barsony', 'uveg'];

  for (const word of getWords(queryNorm)) {
    const root = WORD_TO_ROOT.get(word) || word;
    if (typeRoots.includes(root)) intent.productTypes.push(root);
    if (colorRoots.includes(root)) intent.colors.push(root);
    if (styleRoots.includes(root)) intent.styles.push(root);
    if (materialRoots.includes(root)) intent.materials.push(root);
  }

  const toNum = (v, mult) => {
    const n = parseInt(v || '0', 10);
    if (mult && /ezer|e|k|ez/i.test(String(mult))) return n * 1000;
    return n;
  };

  if (/felett/i.test(query)) {
    const m = query.match(/(\d+)\s*(ezer|e|k|ez)?\s*(?:ft|forint)?\s*felett/i);
    if (m) intent.priceRange = { min: toNum(m[1], m[2]), max: Infinity };
  } else if (/[-–—]/.test(query)) {
    const m = query.match(/(\d+)\s*(ezer|e|k|ez)?\s*[-–—]\s*(\d+)\s*(ezer|e|k|ez)?/i);
    if (m) intent.priceRange = { min: toNum(m[1], m[2]), max: toNum(m[3], m[4] || m[2]) };
  } else if (/alatt|ig|között/i.test(query) || /\d+\s*(e|ezer|k|ez)/i.test(query)) {
    const m = query.match(/(\d+)\s*(ezer|e|k|ez)?(?:\s*(?:ft|forint))?\s*(?:alatt|ig)?/i)
      || query.match(/(\d+)\s*(ezer|e|k|ez)?\s/);
    if (m) intent.priceRange = { min: 0, max: toNum(m[1], m[2]) };
  }

  if (queryNorm.includes('olcso') || queryNorm.includes('akcio')) {
    intent.priceRange = intent.priceRange || { min: 0, max: 100000 };
  }

  return intent;
}

// ============================================================================
// PROACTIVE SUGGESTIONS
// ============================================================================

export function getProactiveSuggestions() {
  return [
    { icon: '🛋️', text: 'kanapé', query: 'kanapé' },
    { icon: '💺', text: 'fotel', query: 'fotel' },
    { icon: '🪑', text: 'szék', query: 'szék' },
    { icon: '🛏️', text: 'ágy', query: 'ágy' },
    { icon: '🗄️', text: 'szekrény', query: 'szekrény' },
    { icon: '🏷️', text: 'akciós', query: 'akciós' },
  ];
}

export default {
  buildSearchIndex,
  isIndexReady,
  getIndexStats,
  smartSearch,
  getAutocompleteSuggestions,
  parseSearchIntent,
  getProactiveSuggestions
};
