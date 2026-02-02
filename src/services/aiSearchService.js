/**
 * AI Search Service - VILÁGSZÍNVONALÚ BÚTOR KERESŐ MOTOR
 * 
 * A legjobb bútor kereső - 160.000+ termék, azonnali találatok
 * 
 * FUNKCIÓK:
 * - Villámgyors keresés szó-index alapján
 * - Pontos márka/terméknév felismerés
 * - Magyar nyelvi szinonimák és ékezet kezelés
 * - Fuzzy matching elgépelésekhez
 * - Természetes nyelvű keresés (NLP)
 * - Ár és szűrő felismerés
 * - Személyre szabott találatok
 * - "Erre gondoltál?" javaslatok
 */

import { generateText } from './geminiService';
import { 
  getViewedProducts, 
  getSearchHistory, 
  getTopCategories, 
  getStyleDNA,
  getLikedProducts 
} from './userPreferencesService';

// ==================== KERESÉSI INDEX (GYORS LOOKUP) ====================
let searchIndex = null;
let indexedProductCount = 0;

/**
 * Szó-alapú index építése a gyors kereséshez
 * Minden szóhoz tároljuk mely termékek tartalmazzák
 */
const buildSearchIndex = (products) => {
  if (searchIndex && indexedProductCount === products.length) {
    return searchIndex; // Már van index, nem kell újraépíteni
  }
  
  console.log('🔍 Building search index for', products.length, 'products...');
  const startTime = performance.now();
  
  const index = {
    byWord: new Map(),        // szó -> [productIndex, ...]
    byPrefix: new Map(),      // prefix (3 char) -> [productIndex, ...]
    products: products,       // referencia
  };
  
  products.forEach((product, idx) => {
    const name = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const text = `${name} ${category}`;
    
    // Szavak kinyerése
    const words = text.split(/[\s\-_,\.\/\(\)]+/).filter(w => w.length >= 2);
    
    words.forEach(word => {
      const wordNoAccent = removeAccents(word);
      
      // Teljes szó index
      if (!index.byWord.has(wordNoAccent)) {
        index.byWord.set(wordNoAccent, []);
      }
      index.byWord.get(wordNoAccent).push(idx);
      
      // Prefix index (első 3 karakter) - gyors fuzzy kereséshez
      if (wordNoAccent.length >= 3) {
        const prefix = wordNoAccent.slice(0, 3);
        if (!index.byPrefix.has(prefix)) {
          index.byPrefix.set(prefix, new Set());
        }
        index.byPrefix.get(prefix).add(idx);
      }
    });
  });
  
  searchIndex = index;
  indexedProductCount = products.length;
  
  console.log(`✅ Search index built in ${(performance.now() - startTime).toFixed(0)}ms`);
  console.log(`   - ${index.byWord.size} unique words`);
  console.log(`   - ${index.byPrefix.size} prefixes`);
  
  return index;
};

// ==================== MAGYAR NYELVI TUDÁSBÁZIS ====================

// Átfogó szinonima térkép - MINDEN bútorral kapcsolatos kifejezés
const SYNONYM_DATABASE = {
  // Ülőbútorok
  'kanapé': ['szófa', 'ülőgarnitúra', 'couch', 'sofa', 'kanape', 'rekamié', 'heverő'],
  'fotel': ['karosszék', 'szék', 'pihenőfotel', 'relax fotel', 'füles fotel', 'armchair'],
  'ülőgarnitúra': ['kanapé szett', 'sarokülő', 'sarokkanapé', 'U-kanapé', 'garnitúra'],
  'puff': ['ülőke', 'zsámoly', 'lábtartó', 'ottoman', 'pouffe'],
  
  // Asztalok
  'asztal': ['tábla', 'table'],
  'dohányzóasztal': ['kávéasztal', 'coffee table', 'nappali asztal', 'kisasztal'],
  'étkezőasztal': ['ebédlőasztal', 'dining table', 'étkező asztal', 'konyhaasztal'],
  'íróasztal': ['munkaasztal', 'desk', 'dolgozó asztal', 'számítógépasztal', 'iroda asztal'],
  'éjjeliszekrény': ['éjjeli asztal', 'nightstand', 'ágy melletti'],
  
  // Székek
  'szék': ['ülőalkalmatosság', 'chair', 'szekek'],
  'étkezőszék': ['konyhai szék', 'dining chair', 'étkező szék'],
  'irodai szék': ['forgószék', 'gamer szék', 'office chair', 'dolgozó szék'],
  'bárszék': ['pultszék', 'bar stool', 'magas szék'],
  
  // Tárolás
  'szekrény': ['gardróbszekrény', 'ruhásszekrény', 'cabinet', 'szekreny', 'szekrenyek'],
  'komód': ['fiókos szekrény', 'drawer', 'komod', 'tárolószekrény'],
  'polc': ['könyvespolc', 'falipolc', 'shelf', 'polcrendszer', 'stellázs'],
  'vitrin': ['üvegszekrény', 'tálaló', 'display cabinet'],
  'tv szekrény': ['tv állvány', 'médiaállvány', 'tv bútor', 'szórakoztatóközpont'],
  
  // Hálószoba
  'ágy': ['franciaágy', 'bed', 'agy', 'heverő', 'agyak'],
  'matrac': ['habmatrac', 'rugós matrac', 'mattress', 'fekvőalkalmatosság'],
  'ágyneműtartó': ['ágy alatti tároló', 'storage bed'],
  
  // Stílusok
  'modern': ['kortárs', 'minimalista', 'letisztult', 'contemporary', 'dizájn'],
  'skandináv': ['nordic', 'északi', 'skandinav', 'scandi', 'finn'],
  'rusztikus': ['vidéki', 'country', 'provence', 'farmhouse', 'natural'],
  'indusztriális': ['industrial', 'loft', 'ipari', 'gyári'],
  'klasszikus': ['tradicionális', 'hagyományos', 'elegáns', 'antik'],
  'bohém': ['boho', 'színes', 'eklektikus'],
  'luxus': ['prémium', 'exkluzív', 'high-end', 'designer'],
  
  // Színek
  'fehér': ['feher', 'white', 'hófehér', 'krém'],
  'fekete': ['dark', 'sötét', 'black', 'antracit'],
  'szürke': ['gray', 'grey', 'szurke', 'graphite', 'grafit'],
  'barna': ['fa szín', 'dió', 'tölgy', 'brown', 'bézs', 'mogyoró'],
  'bézs': ['krém', 'homok', 'beige', 'natúr'],
  'kék': ['blue', 'kek', 'navy', 'tengerkék', 'égkék'],
  'zöld': ['green', 'zold', 'olíva', 'mohazöld', 'smaragd'],
  'piros': ['red', 'bordó', 'vörös'],
  'sárga': ['yellow', 'mustár', 'arany'],
  
  // Anyagok
  'fa': ['tömörfa', 'furnér', 'wooden', 'fából'],
  'fém': ['acél', 'vas', 'metal', 'króm', 'réz'],
  'bőr': ['valódi bőr', 'műbőr', 'leather', 'textilbőr'],
  'szövet': ['textil', 'fabric', 'huzat', 'kárpit'],
  'üveg': ['glass', 'tükör', 'edzett üveg'],
  
  // Szobák
  'nappali': ['living room', 'lakószoba', 'társalgó'],
  'hálószoba': ['bedroom', 'háló', 'haloszoba', 'alvó'],
  'konyha': ['kitchen', 'étkező', 'ebédlő'],
  'iroda': ['dolgozószoba', 'office', 'munkaszoba', 'home office'],
  'gyerekszoba': ['kids room', 'gyerek', 'baba', 'ifjúsági'],
  'fürdőszoba': ['bathroom', 'fürdő', 'mosdó'],
  'előszoba': ['hall', 'belépő', 'közlekedő'],
  'erkély': ['terasz', 'balkon', 'kert', 'outdoor'],
  
  // Ár kategóriák
  'olcsó': ['akciós', 'kedvezményes', 'akció', 'budget', 'gazdaságos', 'alacsony árú'],
  'drága': ['prémium', 'luxus', 'minőségi', 'high-end'],
  
  // Méretek
  'kicsi': ['kisméretű', 'kompakt', 'mini', 'small'],
  'nagy': ['nagyméretű', 'tágas', 'large', 'big', 'extra'],
  '2 személyes': ['kétszemélyes', 'dupla', 'páros'],
  '3 személyes': ['háromszemélyes', 'családi'],
  'sarok': ['L-alakú', 'sarokkanapé', 'corner'],
};

// Ár kulcsszavak és tartományok
const PRICE_KEYWORDS = {
  'olcsó': { min: 0, max: 50000, label: 'olcsó (0-50.000 Ft)' },
  'budget': { min: 0, max: 50000, label: 'budget (0-50.000 Ft)' },
  'akciós': { min: 0, max: 80000, label: 'akciós termékek' },
  'megfizethető': { min: 30000, max: 100000, label: 'megfizethető (30-100.000 Ft)' },
  'közepes': { min: 50000, max: 150000, label: 'közepes árú (50-150.000 Ft)' },
  'közép': { min: 50000, max: 150000, label: 'közép kategória' },
  'minőségi': { min: 100000, max: 300000, label: 'minőségi (100-300.000 Ft)' },
  'prémium': { min: 200000, max: 500000, label: 'prémium (200-500.000 Ft)' },
  'luxus': { min: 400000, max: Infinity, label: 'luxus (400.000 Ft+)' },
  'drága': { min: 300000, max: Infinity, label: 'drága (300.000 Ft+)' },
};

// Ékezet eltávolítás
const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ő/g, 'o').replace(/Ő/g, 'O')
    .replace(/ű/g, 'u').replace(/Ű/g, 'U')
    .toLowerCase()
    .trim();
};

// Levenshtein távolság fuzzy matching-hez
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }
  return dp[m][n];
};

// Fuzzy match - elfogadja a kis elgépeléseket
const fuzzyMatch = (query, target, threshold = 0.3) => {
  const q = removeAccents(query);
  const t = removeAccents(target);
  
  // Pontos egyezés
  if (t.includes(q) || q.includes(t)) return 1;
  
  // Szavankénti egyezés
  const qWords = q.split(/\s+/);
  const tWords = t.split(/\s+/);
  
  let matches = 0;
  for (const qw of qWords) {
    if (qw.length < 3) continue;
    for (const tw of tWords) {
      if (tw.length < 3) continue;
      
      // Részleges egyezés (szó eleje)
      if (tw.startsWith(qw.slice(0, 3)) || qw.startsWith(tw.slice(0, 3))) {
        matches += 0.8;
        continue;
      }
      
      // Levenshtein fuzzy
      const maxLen = Math.max(qw.length, tw.length);
      const distance = levenshteinDistance(qw, tw);
      const similarity = 1 - (distance / maxLen);
      
      if (similarity >= (1 - threshold)) {
        matches += similarity;
      }
    }
  }
  
  return matches / Math.max(qWords.length, 1);
};

// Összes szinonima lekérése egy szóhoz
const getAllSynonyms = (word) => {
  const lower = word.toLowerCase();
  const noAccent = removeAccents(word);
  const result = new Set([lower, noAccent]);
  
  for (const [key, values] of Object.entries(SYNONYM_DATABASE)) {
    const keyNoAccent = removeAccents(key);
    
    // Ha a kulcs egyezik
    if (keyNoAccent === noAccent || lower === key || keyNoAccent.includes(noAccent) || noAccent.includes(keyNoAccent)) {
      result.add(key);
      values.forEach(v => result.add(v.toLowerCase()));
    }
    
    // Ha bármelyik érték egyezik
    for (const val of values) {
      const valNoAccent = removeAccents(val);
      if (valNoAccent === noAccent || val.toLowerCase() === lower || valNoAccent.includes(noAccent) || noAccent.includes(valNoAccent)) {
        result.add(key);
        values.forEach(v => result.add(v.toLowerCase()));
        break;
      }
    }
  }
  
  return Array.from(result);
};

// ==================== KERESÉSI SZÁNDÉK FELISMERÉS ====================

/**
 * Felismeri a keresési szándékot és paramétereket a query-ből
 */
export const parseSearchIntent = (query) => {
  const intent = {
    originalQuery: query,
    productTypes: [],      // pl. ['kanapé', 'fotel']
    styles: [],            // pl. ['modern', 'skandináv']
    colors: [],            // pl. ['fehér', 'szürke']
    materials: [],         // pl. ['fa', 'bőr']
    rooms: [],             // pl. ['nappali', 'hálószoba']
    priceRange: null,      // { min, max }
    sizes: [],             // pl. ['nagy', '3 személyes']
    features: [],          // egyéb jellemzők
    isOnSale: false,       // akciót keres
    keywords: [],          // tisztított kulcsszavak
  };
  
  const words = query.toLowerCase().split(/[\s,\-]+/).filter(w => w.length > 1);
  const fullQueryNoAccent = removeAccents(query);
  
  // Termék típusok felismerése
  const productTypes = ['kanapé', 'fotel', 'asztal', 'szék', 'szekrény', 'polc', 'ágy', 'matrac', 'komód', 
    'dohányzóasztal', 'étkezőasztal', 'íróasztal', 'éjjeliszekrény', 'puff', 'vitrin', 'tv szekrény',
    'ülőgarnitúra', 'sarokkanapé', 'bárszék', 'könyvespolc'];
  
  for (const type of productTypes) {
    const syns = getAllSynonyms(type);
    if (syns.some(s => fullQueryNoAccent.includes(removeAccents(s)))) {
      intent.productTypes.push(type);
    }
  }
  
  // Stílusok felismerése
  const styles = ['modern', 'skandináv', 'rusztikus', 'indusztriális', 'klasszikus', 'bohém', 'luxus', 'minimalista', 'vintage', 'retro'];
  for (const style of styles) {
    const syns = getAllSynonyms(style);
    if (syns.some(s => fullQueryNoAccent.includes(removeAccents(s)))) {
      intent.styles.push(style);
    }
  }
  
  // Színek felismerése
  const colors = ['fehér', 'fekete', 'szürke', 'barna', 'bézs', 'kék', 'zöld', 'piros', 'sárga', 'natúr'];
  for (const color of colors) {
    const syns = getAllSynonyms(color);
    if (syns.some(s => fullQueryNoAccent.includes(removeAccents(s)))) {
      intent.colors.push(color);
    }
  }
  
  // Anyagok felismerése
  const materials = ['fa', 'fém', 'bőr', 'szövet', 'üveg', 'műanyag', 'rattan'];
  for (const mat of materials) {
    const syns = getAllSynonyms(mat);
    if (syns.some(s => fullQueryNoAccent.includes(removeAccents(s)))) {
      intent.materials.push(mat);
    }
  }
  
  // Szobák felismerése
  const rooms = ['nappali', 'hálószoba', 'konyha', 'iroda', 'gyerekszoba', 'fürdőszoba', 'előszoba', 'erkély'];
  for (const room of rooms) {
    const syns = getAllSynonyms(room);
    if (syns.some(s => fullQueryNoAccent.includes(removeAccents(s)))) {
      intent.rooms.push(room);
    }
  }
  
  // Méret felismerése
  const sizes = ['kicsi', 'nagy', '2 személyes', '3 személyes', 'sarok', 'kompakt'];
  for (const size of sizes) {
    if (fullQueryNoAccent.includes(removeAccents(size))) {
      intent.sizes.push(size);
    }
  }
  
  // Ár tartomány felismerése (szövegből)
  for (const [keyword, range] of Object.entries(PRICE_KEYWORDS)) {
    if (fullQueryNoAccent.includes(removeAccents(keyword))) {
      intent.priceRange = range;
      if (keyword === 'akciós' || keyword === 'akció') {
        intent.isOnSale = true;
      }
      break;
    }
  }
  
  // Konkrét ár felismerése (pl. "100 ezer alatt", "50000 és 100000 között")
  const pricePatterns = [
    /(\d+)\s*(ezer|e|k)\s*(ft|forint)?\s*(alatt|ig)/i,
    /(\d+)\s*(ezer|e|k)\s*(ft|forint)?\s*(felett|fölött|tól)/i,
    /(\d+)\s*-\s*(\d+)\s*(ezer|e|k)/i,
    /(\d{4,})\s*(ft|forint)?\s*(alatt|ig)/i,
    /(\d{4,})\s*(ft|forint)?\s*(felett|fölött|tól)/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = query.match(pattern);
    if (match) {
      let value = parseInt(match[1]);
      const multiplier = match[2]?.toLowerCase();
      if (multiplier === 'ezer' || multiplier === 'e' || multiplier === 'k') {
        value *= 1000;
      }
      
      if (query.includes('alatt') || query.includes('ig')) {
        intent.priceRange = { min: 0, max: value };
      } else if (query.includes('felett') || query.includes('fölött') || query.includes('tól')) {
        intent.priceRange = { min: value, max: Infinity };
      } else if (match[2] && !isNaN(parseInt(match[2]))) {
        // range: 50-100 ezer
        intent.priceRange = { min: value, max: parseInt(match[2]) * 1000 };
      }
      break;
    }
  }
  
  // Tisztított kulcsszavak
  intent.keywords = words.filter(w => w.length > 2);
  
  return intent;
};

// ==================== TERMÉK PONTOZÁS ====================

/**
 * Termék relevancia pontszám számítása
 * FULL DATA: név + kategória + leírás + paraméterek!
 */
const calculateRelevanceScore = (product, intent, userContext = {}, queryNoAccent = '') => {
  let score = 0;
  const bonuses = [];
  
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const description = (product.description || product.leiras || '').toLowerCase();
  const params = (product.params || '').toLowerCase(); // Paraméterek: anyag, szín, méret, stb.
  
  // FULL TEXT: mindent keresünk!
  const fullText = `${name} ${category} ${description} ${params}`;
  const fullTextNoAccent = removeAccents(fullText);
  
  // Külön változók a súlyozáshoz
  const nameNoAccent = removeAccents(name);
  const categoryNoAccent = removeAccents(category);
  const descNoAccent = removeAccents(description);
  const paramsNoAccent = removeAccents(params);
  
  const price = product.salePrice || product.price || 0;
  const originalPrice = product.originalPrice || product.price || price;
  const isDiscounted = originalPrice > price;
  
  // 1. TERMÉK TÍPUS EGYEZÉS (nagyon fontos) - max 100 pont
  for (const type of intent.productTypes) {
    const syns = getAllSynonyms(type);
    for (const syn of syns) {
      const synNoAccent = removeAccents(syn);
      if (name.includes(synNoAccent) || removeAccents(name).includes(synNoAccent)) {
        score += 100;
        bonuses.push(`Termék típus: ${type}`);
        break;
      }
      if (category.includes(synNoAccent) || removeAccents(category).includes(synNoAccent)) {
        score += 60;
        bonuses.push(`Kategória: ${type}`);
        break;
      }
    }
  }
  
  // 2. STÍLUS EGYEZÉS - max 50 pont
  for (const style of intent.styles) {
    const syns = getAllSynonyms(style);
    if (syns.some(s => fullTextNoAccent.includes(removeAccents(s)))) {
      score += 50;
      bonuses.push(`Stílus: ${style}`);
    }
  }
  
  // 3. SZÍN EGYEZÉS - max 40 pont
  for (const color of intent.colors) {
    const syns = getAllSynonyms(color);
    if (syns.some(s => fullTextNoAccent.includes(removeAccents(s)))) {
      score += 40;
      bonuses.push(`Szín: ${color}`);
    }
  }
  
  // 4. ANYAG EGYEZÉS - max 35 pont
  for (const mat of intent.materials) {
    const syns = getAllSynonyms(mat);
    if (syns.some(s => fullTextNoAccent.includes(removeAccents(s)))) {
      score += 35;
      bonuses.push(`Anyag: ${mat}`);
    }
  }
  
  // 5. SZOBA EGYEZÉS - max 30 pont
  for (const room of intent.rooms) {
    const syns = getAllSynonyms(room);
    if (syns.some(s => fullTextNoAccent.includes(removeAccents(s)))) {
      score += 30;
      bonuses.push(`Szoba: ${room}`);
    }
  }
  
  // 6. MÉRET EGYEZÉS - max 25 pont
  for (const size of intent.sizes) {
    if (fullTextNoAccent.includes(removeAccents(size))) {
      score += 25;
      bonuses.push(`Méret: ${size}`);
    }
  }
  
  // 7. ÁR TARTOMÁNY EGYEZÉS - max 50 pont
  if (intent.priceRange) {
    const { min, max } = intent.priceRange;
    if (price >= min && price <= max) {
      score += 50;
      bonuses.push('Árban illeszkedik');
    } else if (price >= min * 0.8 && price <= max * 1.2) {
      score += 20; // Közel van az árkategóriához
    }
  }
  
  // 8. AKCIÓ - max 40 pont
  if (intent.isOnSale && isDiscounted) {
    const discountPercent = Math.round((1 - price / originalPrice) * 100);
    score += 40 + Math.min(discountPercent / 2, 20); // Nagyobb kedvezmény = több pont
    bonuses.push(`${discountPercent}% kedvezmény`);
  }
  
  // 9. KULCSSZÓ EGYEZÉS - TELJES KERESÉS (név, kategória, leírás, paraméterek)
  for (const keyword of intent.keywords) {
    const syns = getAllSynonyms(keyword);
    let matched = false;
    let keywordScore = 0;
    
    for (const syn of syns) {
      const synNoAccent = removeAccents(syn);
      
      // Név egyezés - legmagasabb súly
      if (nameNoAccent.includes(synNoAccent)) {
        keywordScore = Math.max(keywordScore, 35);
        matched = true;
      }
      // Kategória egyezés
      if (categoryNoAccent.includes(synNoAccent)) {
        keywordScore = Math.max(keywordScore, 20);
        matched = true;
      }
      // Paraméterek egyezés (anyag, szín, méret) - FONTOS!
      if (paramsNoAccent.includes(synNoAccent)) {
        keywordScore = Math.max(keywordScore, 25);
        matched = true;
      }
      // Leírás egyezés
      if (descNoAccent.includes(synNoAccent)) {
        keywordScore = Math.max(keywordScore, 12);
        matched = true;
      }
    }
    
    score += keywordScore;
    
    // Fuzzy matching ha nincs pontos egyezés
    if (!matched && keyword.length >= 4) {
      const fuzzyScore = fuzzyMatch(keyword, name);
      if (fuzzyScore > 0.6) {
        score += fuzzyScore * 25;
      }
      // Fuzzy a paraméterekben is
      const fuzzyParamsScore = fuzzyMatch(keyword, params);
      if (fuzzyParamsScore > 0.6) {
        score += fuzzyParamsScore * 15;
      }
    }
  }
  
  // 10. SZEMÉLYRE SZABOTT BÓNUSZOK
  if (userContext.topCategories) {
    for (const cat of userContext.topCategories) {
      if (category.includes(removeAccents(cat).toLowerCase())) {
        score += 15;
        bonuses.push('Kedvelt kategória');
        break;
      }
    }
  }
  
  if (userContext.styleDNA) {
    // Ha a stílus DNA egyezik
    const styleText = userContext.styleDNA.toLowerCase();
    if (fullTextNoAccent.includes(removeAccents(styleText).slice(0, 20))) {
      score += 10;
    }
  }
  
  // 11. NÉPSZERŰSÉGI BÓNUSZ (ha van rating)
  if (product.rating && product.rating >= 4) {
    score += (product.rating - 3) * 5;
  }
  
  return { score, bonuses };
};

// ==================== FŐ KERESÉSI FUNKCIÓK ====================

/**
 * VILÁGSZÍNVONALÚ INTELLIGENS KERESÉS
 * - Index-alapú gyors keresés
 * - Pontos egyezések prioritása
 * - Fuzzy matching elgépelésekhez
 * - Szinonimák és NLP
 */
export const smartSearch = (products, query, options = {}) => {
  const { limit = 20, includeDebugInfo = false } = options;
  
  if (!query || !query.trim() || !products || products.length === 0) {
    return { results: [], intent: null, suggestions: [], totalMatches: 0, didYouMean: null };
  }
  
  const startTime = performance.now();
  
  // 1. Index építése (cache-elve)
  const index = buildSearchIndex(products);
  
  // 2. Szándék felismerés
  const intent = parseSearchIntent(query.trim());
  
  // 3. Felhasználói kontextus
  const userContext = {
    topCategories: getTopCategories(3),
    styleDNA: getStyleDNA()?.styleDNA,
  };
  
  // 4. Keresőszavak előkészítése
  const queryLower = query.toLowerCase().trim();
  const queryNoAccent = removeAccents(queryLower);
  const queryWords = queryLower.split(/[\s\-_,\.]+/).filter(w => w.length >= 2);
  
  // 5. INDEX-ALAPÚ GYORS KERESÉS
  const candidateIndices = new Set();
  const exactMatchIndices = new Set();
  
  // 5a. PONTOS QUERY EGYEZÉS (legmagasabb prioritás)
  // Ha a teljes keresőkifejezés benne van a terméknevekben
  for (let i = 0; i < products.length; i++) {
    const nameNoAccent = removeAccents((products[i].name || '').toLowerCase());
    if (nameNoAccent.includes(queryNoAccent)) {
      exactMatchIndices.add(i);
    }
  }
  
  // 5b. SZÓ-ALAPÚ KERESÉS AZ INDEXBŐL
  queryWords.forEach(word => {
    const wordNoAccent = removeAccents(word);
    
    // Pontos szó egyezés
    if (index.byWord.has(wordNoAccent)) {
      index.byWord.get(wordNoAccent).forEach(idx => candidateIndices.add(idx));
    }
    
    // Szinonimák keresése
    const syns = getAllSynonyms(word);
    syns.forEach(syn => {
      const synNoAccent = removeAccents(syn);
      if (index.byWord.has(synNoAccent)) {
        index.byWord.get(synNoAccent).forEach(idx => candidateIndices.add(idx));
      }
    });
    
    // Prefix-alapú fuzzy keresés (ha nincs pontos találat)
    if (candidateIndices.size < 100 && wordNoAccent.length >= 3) {
      const prefix = wordNoAccent.slice(0, 3);
      if (index.byPrefix.has(prefix)) {
        index.byPrefix.get(prefix).forEach(idx => candidateIndices.add(idx));
      }
    }
  });
  
  // 6. JELÖLTEK ÖSSZEGYŰJTÉSE - pontos egyezések ELŐRE
  const allCandidates = [
    ...Array.from(exactMatchIndices),
    ...Array.from(candidateIndices).filter(i => !exactMatchIndices.has(i))
  ];
  
  // Max 3000 jelölt pontozásra
  const toScore = allCandidates.slice(0, 3000).map(i => products[i]);
  
  // 7. PONTOZÁS
  const scoredProducts = toScore.map(product => {
    const { score, bonuses } = calculateRelevanceScore(product, intent, userContext, queryNoAccent);
    
    // EXTRA BÓNUSZ pontos query egyezésért
    const nameNoAccent = removeAccents((product.name || '').toLowerCase());
    let finalScore = score;
    if (nameNoAccent.includes(queryNoAccent)) {
      finalScore += 200; // Nagy bónusz pontos egyezésért
    }
    
    return { product, score: finalScore, bonuses };
  });
  
  // 8. RENDEZÉS ÉS SZŰRÉS
  const filteredResults = scoredProducts
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
  
  const results = filteredResults
    .slice(0, limit)
    .map(s => includeDebugInfo ? s : s.product);
  
  // 9. "ERRE GONDOLTÁL?" JAVASLATOK
  let didYouMean = null;
  const suggestions = [];
  
  if (results.length < 3) {
    // Próbálj alternatív kereséseket találni
    didYouMean = generateDidYouMean(query, products, index);
    
    if (intent.priceRange) {
      suggestions.push({
        type: 'expand_price',
        text: 'Próbáld szélesebb ártartománnyal',
        action: query.replace(/\d+\s*(ezer|e|k)?(\s*(ft|forint))?\s*(alatt|ig|felett|fölött|tól)/gi, '').trim(),
      });
    }
    if (intent.colors.length > 0) {
      suggestions.push({
        type: 'remove_color',
        text: `Próbáld ${intent.colors[0]} szín nélkül`,
        action: query.replace(new RegExp(intent.colors.join('|'), 'gi'), '').trim(),
      });
    }
    if (intent.productTypes.length > 0) {
      const alternatives = {
        'kanapé': ['fotel', 'ülőgarnitúra', 'sarokkanapé'],
        'asztal': ['dohányzóasztal', 'íróasztal', 'étkezőasztal'],
        'szék': ['fotel', 'puff', 'bárszék'],
        'fotel': ['kanapé', 'puff', 'relax fotel'],
      };
      for (const type of intent.productTypes) {
        if (alternatives[type]) {
          suggestions.push({
            type: 'alternative',
            text: `Hasonló: ${alternatives[type].join(', ')}`,
            action: alternatives[type][0],
          });
        }
      }
    }
  }
  
  const searchTime = performance.now() - startTime;
  if (includeDebugInfo) {
    console.log(`🔍 Search completed in ${searchTime.toFixed(0)}ms - ${filteredResults.length} matches`);
  }
  
  return {
    results,
    intent,
    suggestions,
    didYouMean,
    totalMatches: filteredResults.length,
    searchTime,
  };
};

/**
 * "Erre gondoltál?" javaslat generálása
 */
const generateDidYouMean = (query, products, index) => {
  const queryNoAccent = removeAccents(query.toLowerCase());
  const words = queryNoAccent.split(/\s+/).filter(w => w.length >= 3);
  
  if (words.length === 0) return null;
  
  // Próbálj hasonló szavakat találni az indexben
  const suggestions = [];
  
  for (const word of words) {
    // Fuzzy keresés az indexben
    for (const [indexedWord] of index.byWord.entries()) {
      if (indexedWord.length >= 3 && Math.abs(indexedWord.length - word.length) <= 2) {
        const distance = levenshteinDistance(word, indexedWord);
        const similarity = 1 - (distance / Math.max(word.length, indexedWord.length));
        
        if (similarity >= 0.6 && similarity < 1 && word !== indexedWord) {
          suggestions.push({
            original: word,
            suggestion: indexedWord,
            similarity,
            count: index.byWord.get(indexedWord).length,
          });
        }
      }
    }
  }
  
  // Legjobb javaslat
  if (suggestions.length > 0) {
    suggestions.sort((a, b) => (b.similarity * b.count) - (a.similarity * a.count));
    const best = suggestions[0];
    const newQuery = query.toLowerCase().replace(best.original, best.suggestion);
    return {
      query: newQuery,
      reason: `"${best.original}" → "${best.suggestion}"`,
    };
  }
  
  return null;
};

/**
 * VILLÁMGYORS AUTOCOMPLETE - Index alapú
 */
export const getAutocompleteSuggestions = (products, partialQuery, limit = 10) => {
  if (!partialQuery || partialQuery.length < 2 || !products || products.length === 0) {
    return [];
  }
  
  const query = partialQuery.toLowerCase().trim();
  const queryNoAccent = removeAccents(query);
  const suggestions = new Map();
  
  // Index használata a gyors kereséshez
  const index = buildSearchIndex(products);
  
  // 1. INDEX-ALAPÚ KERESÉS - sokkal gyorsabb!
  const candidateIndices = new Set();
  
  // Prefix alapú keresés
  if (queryNoAccent.length >= 3) {
    const prefix = queryNoAccent.slice(0, 3);
    if (index.byPrefix.has(prefix)) {
      index.byPrefix.get(prefix).forEach(idx => candidateIndices.add(idx));
    }
  }
  
  // Szó alapú keresés
  const queryWords = queryNoAccent.split(/\s+/).filter(w => w.length >= 2);
  queryWords.forEach(word => {
    if (index.byWord.has(word)) {
      index.byWord.get(word).forEach(idx => candidateIndices.add(idx));
    }
    // Szinonimák is
    const syns = getAllSynonyms(word);
    syns.forEach(syn => {
      const synNoAccent = removeAccents(syn);
      if (index.byWord.has(synNoAccent)) {
        index.byWord.get(synNoAccent).forEach(idx => candidateIndices.add(idx));
      }
    });
  });
  
  // 2. JELÖLTEK PONTOZÁSA
  const scoredMatches = [];
  
  for (const idx of candidateIndices) {
    const product = products[idx];
    const name = product.name || '';
    const nameLower = name.toLowerCase();
    const nameNoAccent = removeAccents(nameLower);
    
    let score = 0;
    
    // Pontos query egyezés a névben
    if (nameNoAccent.includes(queryNoAccent)) {
      if (nameNoAccent.startsWith(queryNoAccent)) {
        score = 100; // Prefix match = legjobb
      } else {
        score = 70; // Contains match
      }
    } else {
      // Szó egyezések
      const words = nameNoAccent.split(/\s+/);
      for (const word of queryWords) {
        if (words.some(w => w.startsWith(word))) {
          score += 30;
        } else if (words.some(w => w.includes(word))) {
          score += 15;
        }
      }
    }
    
    if (score > 0) {
      scoredMatches.push({ name, product, score });
    }
    
    // Early exit ha elég
    if (scoredMatches.length >= 100) break;
  }
  
  // Rendezés és deduplikálás
  scoredMatches.sort((a, b) => b.score - a.score);
  
  for (const match of scoredMatches.slice(0, 30)) {
    if (!suggestions.has(match.name)) {
      suggestions.set(match.name, {
        text: match.name,
        type: 'product',
        product: match.product,
        score: match.score,
      });
    }
  }
  
  // 3. KATEGÓRIA JAVASLATOK
  const seenCategories = new Set();
  for (const idx of Array.from(candidateIndices).slice(0, 200)) {
    const cat = products[idx]?.category;
    if (cat && !seenCategories.has(cat)) {
      seenCategories.add(cat);
      const catNoAccent = removeAccents(cat.toLowerCase());
      if (catNoAccent.includes(queryNoAccent)) {
        const mainCat = cat.split(' > ')[0];
        if (!suggestions.has(mainCat) && mainCat.length > 2) {
          suggestions.set(mainCat, {
            text: mainCat,
            type: 'category',
            score: 40,
          });
        }
      }
    }
  }
  
  // 4. SZINONIMA JAVASLATOK
  const intent = parseSearchIntent(partialQuery);
  if (intent.productTypes.length > 0) {
    intent.productTypes.forEach(type => {
      const syns = getAllSynonyms(type).slice(0, 3);
      syns.forEach(syn => {
        if (syn !== query && syn.length > 2 && !suggestions.has(syn)) {
          suggestions.set(syn, {
            text: syn,
            type: 'synonym',
            score: 25,
          });
        }
      });
    });
  }
  
  // 5. NÉPSZERŰ KOMBINÁCIÓK (ha kevés találat)
  if (suggestions.size < 5) {
    const popularCombos = [
      'modern kanapé', 'skandináv bútor', 'fehér szekrény', 'fa asztal',
      'bőr fotel', 'akciós termékek', 'nappali bútor', 'hálószoba bútor',
      'relax fotel', 'étkezőasztal', 'sarokkanapé', 'tv szekrény',
    ];
    for (const combo of popularCombos) {
      if (removeAccents(combo).includes(queryNoAccent) && !suggestions.has(combo)) {
        suggestions.set(combo, {
          text: combo,
          type: 'popular',
          score: 35,
        });
      }
    }
  }
  
  // Rendezés és visszaadás
  return Array.from(suggestions.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * AI-alapú keresés - természetes nyelvű kérdésekre
 */
export const aiSearch = async (products, naturalQuery) => {
  if (!products || products.length === 0) {
    return { results: [], aiResponse: 'Nincs elérhető termék az adatbázisban.' };
  }
  
  // Termékkatalógus összefoglaló az AI-nak
  const categories = [...new Set(products.map(p => p.category?.split(' > ')[0]).filter(Boolean))];
  const priceRange = {
    min: Math.min(...products.map(p => p.salePrice || p.price || 0).filter(p => p > 0)),
    max: Math.max(...products.map(p => p.salePrice || p.price || 0)),
  };
  
  const prompt = `Te egy profi bútorszakértő vagy. A feladatod, hogy segíts a vásárlónak megtalálni a tökéletes bútort.

KATALÓGUS ADATOK:
- Összes termék: ${products.length} db
- Kategóriák: ${categories.join(', ')}
- Árkategória: ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()} Ft

VÁSÁRLÓ KÉRDÉSE: "${naturalQuery}"

FELADAT: Elemezd a kérdést és adj vissza egy JSON objektumot a következő mezőkkel:
{
  "searchTerms": ["keresési kifejezés 1", "keresési kifejezés 2"],
  "filters": {
    "priceMin": null vagy szám,
    "priceMax": null vagy szám,
    "style": null vagy "modern/skandináv/klasszikus/stb",
    "color": null vagy szín,
    "room": null vagy "nappali/hálószoba/stb"
  },
  "shortAnswer": "Rövid, barátságos válasz a vásárlónak (max 2 mondat)",
  "recommendation": "Mit ajánlanál és miért (1 mondat)"
}

FONTOS: Csak a JSON objektumot add vissza, semmi mást!`;

  try {
    const response = await generateText(prompt, { temperature: 0.3 });
    
    if (!response.success) {
      // Fallback: használj lokális keresést
      return smartSearch(products, naturalQuery, { limit: 12 });
    }
    
    // Parse AI response
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const aiResult = JSON.parse(jsonMatch[0]);
      
      // Keresés az AI által javasolt kifejezésekkel
      let results = [];
      for (const term of aiResult.searchTerms || [naturalQuery]) {
        const { results: termResults } = smartSearch(products, term, { limit: 8 });
        results = [...results, ...termResults];
      }
      
      // Szűrés az AI filterek alapján
      if (aiResult.filters) {
        const { priceMin, priceMax, style, color, room } = aiResult.filters;
        
        results = results.filter(p => {
          const price = p.salePrice || p.price || 0;
          const fullText = `${p.name} ${p.category} ${p.description || ''}`.toLowerCase();
          
          if (priceMin && price < priceMin) return false;
          if (priceMax && price > priceMax) return false;
          if (style && !fullText.includes(style.toLowerCase())) return false;
          if (color && !fullText.includes(color.toLowerCase())) return false;
          if (room && !fullText.includes(room.toLowerCase())) return false;
          
          return true;
        });
      }
      
      // Deduplikálás
      const seen = new Set();
      results = results.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      }).slice(0, 12);
      
      return {
        results,
        aiResponse: aiResult.shortAnswer || 'Íme a találatok:',
        recommendation: aiResult.recommendation,
        searchTerms: aiResult.searchTerms,
      };
    }
  } catch (error) {
    console.error('[AI Search] Error:', error);
  }
  
  // Fallback
  return smartSearch(products, naturalQuery, { limit: 12 });
};

/**
 * Proaktív javaslatok generálása
 */
export const getProactiveSuggestions = (products, userContext = {}) => {
  const suggestions = [];
  
  // 1. Korábbi keresések alapján
  const searchHistory = getSearchHistory(3);
  if (searchHistory.length > 0) {
    const lastSearch = searchHistory[0].query;
    suggestions.push({
      type: 'recent',
      icon: '🕐',
      text: `Folytasd: "${lastSearch}"`,
      query: lastSearch,
    });
  }
  
  // 2. Megtekintett termékek alapján
  const viewed = getViewedProducts(3);
  if (viewed.length > 0) {
    const cat = viewed[0].category?.split(' > ')[0];
    if (cat) {
      suggestions.push({
        type: 'based_on_viewed',
        icon: '👁️',
        text: `Több ${cat} ajánlat`,
        query: cat,
      });
    }
  }
  
  // 3. Stílus DNA alapján
  const styleDNA = getStyleDNA();
  if (styleDNA?.answers?.space) {
    const styleNames = {
      modern: 'modern', scandinavian: 'skandináv', industrial: 'indusztriális',
      vintage: 'vintage', bohemian: 'bohém',
    };
    const style = styleNames[styleDNA.answers.space] || 'modern';
    suggestions.push({
      type: 'style',
      icon: '✨',
      text: `${style.charAt(0).toUpperCase() + style.slice(1)} stílusú bútorok`,
      query: `${style} bútor`,
    });
  }
  
  // 4. Akciós termékek
  const onSaleCount = products.filter(p => (p.originalPrice || p.price) > (p.salePrice || p.price)).length;
  if (onSaleCount > 5) {
    suggestions.push({
      type: 'sale',
      icon: '🏷️',
      text: `${onSaleCount} akciós termék`,
      query: 'akciós',
    });
  }
  
  // 5. Szezonális/trendi
  const month = new Date().getMonth();
  if (month >= 3 && month <= 5) {
    suggestions.push({ type: 'seasonal', icon: '🌸', text: 'Tavaszi megújulás', query: 'modern nappali' });
  } else if (month >= 9 && month <= 11) {
    suggestions.push({ type: 'seasonal', icon: '🍂', text: 'Őszi kényelem', query: 'meleg kanapé' });
  } else if (month === 11 || month === 0) {
    suggestions.push({ type: 'seasonal', icon: '🎄', text: 'Ünnepi hangulatban', query: 'étkező' });
  }
  
  return suggestions.slice(0, 5);
};

export default {
  smartSearch,
  getAutocompleteSuggestions,
  aiSearch,
  getProactiveSuggestions,
  parseSearchIntent,
  getAllSynonyms,
  SYNONYM_DATABASE,
  PRICE_KEYWORDS,
};
