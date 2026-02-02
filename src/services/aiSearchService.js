/**
 * ============================================================================
 * MARKETLY AI SEARCH ENGINE - VILÁGSZÍNVONALÚ BÚTOR KERESŐ
 * ============================================================================
 * 
 * 200.000+ termék keresése milliszekundumok alatt
 * Magyar nyelv teljes támogatása
 * Intelligens találatok, tökéletes relevancia
 * 
 * @version 2.0.0
 * @author Marketly AI Team
 */

import { generateText } from './geminiService';
import { 
  getViewedProducts, 
  getSearchHistory, 
  getTopCategories, 
  getStyleDNA,
  getLikedProducts 
} from './userPreferencesService';

// ============================================================================
// MAGYAR NYELVI TUDÁSBÁZIS - TELJES SZINONIMA ADATBÁZIS
// ============================================================================

const SYNONYM_DATABASE = {
  // ==================== ÜLŐBÚTOROK ====================
  'kanapé': [
    'szófa', 'sofa', 'couch', 'kanape', 'kinyitható kanapé', 'ágyazható kanapé',
    'ülőgarnitúra', 'garnitúra', 'rekamié', 'heverő', 'pamlag', 'díván',
    'kétszemélyes kanapé', 'háromszemélyes kanapé', 'sarokkanapé', 'sarokülő',
    'U-kanapé', 'L-kanapé', 'moduláris kanapé', 'chesterfield', 'click-clack'
  ],
  'fotel': [
    'karosszék', 'armchair', 'pihenőfotel', 'relax fotel', 'relaxfotel',
    'füles fotel', 'fülesfotel', 'olvasófotel', 'TV fotel', 'gamer fotel',
    'forgófotel', 'hintafotel', 'zsákfotel', 'babzsák', 'puff fotel',
    'club fotel', 'wing chair', 'bergere', 'chaise longue', 'récamier'
  ],
  'puff': [
    'ülőke', 'zsámoly', 'lábtartó', 'ottoman', 'pouffe', 'puffok',
    'ülőpárna', 'padlópárna', 'babzsák', 'kockapuff', 'hengerpuff'
  ],
  
  // ==================== ASZTALOK ====================
  'asztal': ['table', 'asztalka', 'asztalok'],
  'dohányzóasztal': [
    'kávéasztal', 'coffee table', 'nappali asztal', 'kisasztal', 'szalonasztal',
    'журнальный', 'lerakóasztal', 'tárolós dohányzóasztal', 'kerek dohányzóasztal'
  ],
  'étkezőasztal': [
    'ebédlőasztal', 'dining table', 'étkező asztal', 'konyhaasztal',
    'tárgyalóasztal', 'family asztal', 'bővíthető asztal', 'kihúzható asztal'
  ],
  'íróasztal': [
    'munkaasztal', 'desk', 'dolgozó asztal', 'számítógépasztal', 'pc asztal',
    'gamer asztal', 'home office asztal', 'irodaasztal', 'tanulóasztal'
  ],
  'éjjeliszekrény': [
    'éjjeli asztal', 'nightstand', 'ágy melletti', 'éjjeliszekrények',
    'hálószoba kisasztal', 'ágyasztal'
  ],
  'konzolasztal': ['előszoba asztal', 'fali asztal', 'console table'],
  
  // ==================== SZÉKEK ====================
  'szék': ['chair', 'szekek', 'székek', 'ülőalkalmatosság'],
  'étkezőszék': [
    'konyhai szék', 'dining chair', 'étkező szék', 'ebédlőszék',
    'vendégszék', 'rakásolható szék'
  ],
  'irodai szék': [
    'forgószék', 'gamer szék', 'gaming szék', 'office chair', 'dolgozó szék',
    'ergonomikus szék', 'vezetői szék', 'főnöki szék', 'operátorszék'
  ],
  'bárszék': ['pultszék', 'bar stool', 'magas szék', 'bárszékek', 'pultszékek'],
  
  // ==================== TÁROLÓBÚTOROK ====================
  'szekrény': [
    'cabinet', 'szekreny', 'szekrenyek', 'gardróbszekrény', 'gardrób',
    'ruhásszekrény', 'akasztós szekrény', 'tolóajtós szekrény', 'előszobaszekrény'
  ],
  'komód': [
    'fiókos szekrény', 'drawer', 'komod', 'tárolószekrény', 'fiókos',
    'sideboard', 'chest', 'komódok'
  ],
  'polc': [
    'shelf', 'polcrendszer', 'stellázs', 'könyvespolc', 'falipolc',
    'sarokpolc', 'nyitott polc', 'tárolópolc', 'polcok'
  ],
  'vitrin': [
    'üvegszekrény', 'tálaló', 'display cabinet', 'vitrinek', 'üveges szekrény',
    'kiállító szekrény', 'gyűjtő vitrin'
  ],
  'tv szekrény': [
    'tv állvány', 'médiaállvány', 'tv bútor', 'szórakoztatóközpont',
    'tv asztal', 'média szekrény', 'hifi szekrény', 'lowboard'
  ],
  'cipősszekrény': ['cipőtartó', 'cipőtároló', 'előszoba szekrény'],
  
  // ==================== HÁLÓSZOBA ====================
  'ágy': [
    'bed', 'agy', 'agyak', 'franciaágy', 'heverő', 'boxspring',
    'táskarugós ágy', 'ágyneműtartós ágy', 'kárpitozott ágy', 'ágykeret',
    'egyszemélyes ágy', 'kétszemélyes ágy', 'emeletes ágy', 'galériaágy'
  ],
  'matrac': [
    'mattress', 'habmatrac', 'rugós matrac', 'táskarugós matrac',
    'latex matrac', 'memóriahabos matrac', 'fedőmatrac', 'matracok'
  ],
  'ágyneműtartó': ['ágy alatti tároló', 'storage bed', 'fiókos ágy'],
  
  // ==================== STÍLUSOK ====================
  'modern': ['kortárs', 'contemporary', 'minimalista', 'letisztult', 'dizájn', 'design'],
  'skandináv': ['nordic', 'északi', 'skandinav', 'scandi', 'finn', 'dán', 'svéd', 'hygge'],
  'rusztikus': ['vidéki', 'country', 'provence', 'farmhouse', 'natural', 'natúr', 'paraszti'],
  'indusztriális': ['industrial', 'loft', 'ipari', 'gyári', 'vintage ipari'],
  'klasszikus': ['tradicionális', 'hagyományos', 'elegáns', 'antik', 'barokk', 'empire'],
  'bohém': ['boho', 'bohemian', 'színes', 'eklektikus', 'hippie', 'etno'],
  'luxus': ['prémium', 'exkluzív', 'high-end', 'designer', 'luxury'],
  'retro': ['vintage', '60-as évek', '70-es évek', 'mid-century', 'régi'],
  'art deco': ['art déco', 'artdeco', 'geometrikus'],
  'japán': ['japandi', 'zen', 'minimalista japán', 'wabi-sabi'],
  
  // ==================== SZÍNEK ====================
  'fehér': ['feher', 'white', 'hófehér', 'krémfehér', 'törtfehér', 'ivory', 'elefántcsont'],
  'fekete': ['black', 'sötét', 'ében', 'antracit', 'koromfekete'],
  'szürke': ['gray', 'grey', 'szurke', 'grafit', 'graphite', 'acélszürke', 'betonfekete'],
  'barna': ['brown', 'dió', 'tölgy', 'bükk', 'cseresznye', 'mogyoró', 'gesztenye', 'kávé', 'csokoládé'],
  'bézs': ['beige', 'krém', 'homok', 'cappuccino', 'teve', 'natúr', 'drapp'],
  'kék': ['blue', 'kek', 'navy', 'tengerkék', 'égkék', 'türkiz', 'petrol', 'kobaltkék'],
  'zöld': ['green', 'zold', 'olíva', 'mohazöld', 'smaragd', 'menta', 'erdőzöld', 'khaki'],
  'piros': ['red', 'bordó', 'vörös', 'burgundy', 'meggypiros', 'téglaszín', 'korall'],
  'sárga': ['yellow', 'mustár', 'arany', 'okker', 'citrom', 'méz'],
  'rózsaszín': ['pink', 'rózsaszin', 'lazac', 'púder', 'magenta', 'fukszia'],
  'lila': ['purple', 'violet', 'levendula', 'padlizsán', 'orgona'],
  'narancssárga': ['orange', 'narancs', 'terrakotta', 'réz'],
  
  // ==================== ANYAGOK ====================
  'fa': ['tömörfa', 'furnér', 'wooden', 'wood', 'fából', 'faanyag', 'rétegelt lemez', 'MDF', 'forgácslap'],
  'fém': ['acél', 'vas', 'metal', 'króm', 'réz', 'arany', 'ezüst', 'bronz', 'alumínium'],
  'bőr': ['valódi bőr', 'műbőr', 'leather', 'textilbőr', 'öko bőr', 'vegán bőr'],
  'szövet': ['textil', 'fabric', 'huzat', 'kárpit', 'vászon', 'pamut', 'len', 'poliészter'],
  'bársony': ['velvet', 'velúr', 'plüss'],
  'üveg': ['glass', 'tükör', 'edzett üveg', 'savmart üveg', 'üveglappal'],
  'márvány': ['marble', 'márvány hatású', 'műmárvány'],
  'rattan': ['fonott', 'vessző', 'bambusz', 'természetes fonott'],
  'műanyag': ['plastic', 'akril', 'plexi'],
  
  // ==================== SZOBÁK ====================
  'nappali': ['living room', 'lakószoba', 'társalgó', 'szalon', 'nappali bútor'],
  'hálószoba': ['bedroom', 'háló', 'haloszoba', 'alvó', 'hálószoba bútor'],
  'konyha': ['kitchen', 'konyhabútor', 'éléskamra'],
  'étkező': ['dining room', 'ebédlő', 'étkezőhelyiség'],
  'iroda': ['dolgozószoba', 'office', 'munkaszoba', 'home office', 'irodabútor'],
  'gyerekszoba': ['kids room', 'gyerek', 'baba', 'ifjúsági', 'tini szoba'],
  'fürdőszoba': ['bathroom', 'fürdő', 'mosdó', 'fürdőszoba bútor'],
  'előszoba': ['hall', 'belépő', 'közlekedő', 'folyosó', 'előszoba bútor'],
  'erkély': ['terasz', 'balkon', 'kert', 'outdoor', 'kerti bútor', 'kültéri'],
  'vendégszoba': ['guest room', 'vendég szoba'],
  
  // ==================== MÉRETEK ====================
  'kicsi': ['kisméretű', 'kompakt', 'mini', 'small', 'kis', 'keskeny'],
  'nagy': ['nagyméretű', 'tágas', 'large', 'big', 'extra', 'óriás', 'széles'],
  '2 személyes': ['kétszemélyes', 'dupla', 'páros', '2személyes', '2-személyes'],
  '3 személyes': ['háromszemélyes', 'családi', '3személyes', '3-személyes'],
  'sarok': ['L-alakú', 'sarokkanapé', 'corner', 'sarokülő', 'L alakú'],
  
  // ==================== ÁR KATEGÓRIÁK ====================
  'olcsó': ['akciós', 'kedvezményes', 'akció', 'budget', 'gazdaságos', 'alacsony árú', 'leárazott'],
  'drága': ['prémium', 'luxus', 'minőségi', 'high-end', 'exkluzív', 'designer'],
  
  // ==================== FUNKCIÓK ====================
  'ágyazható': ['kinyitható', 'átalakítható', 'vendégágy funkcióval', 'ággyá alakítható'],
  'tárolós': ['ágyneműtartós', 'fiókos', 'tárolóval', 'polcos'],
  'állítható': ['dönthető', 'emelhető', 'magasságállítható', 'háttámla állítható'],
  
  // ==================== MÁRKÁK / NÉPSZERŰ KIFEJEZÉSEK ====================
  'relax': ['relaxációs', 'pihenő', 'kényelmes', 'masszázs', 'masszírozó'],
  'masszázs': ['masszázs fotel', 'masszírozó', 'masszázsfunkció', 'masszírozós'],
};

// Ár tartományok szövegből
const PRICE_KEYWORDS = {
  'olcsó': { min: 0, max: 50000 },
  'budget': { min: 0, max: 50000 },
  'akciós': { min: 0, max: 100000 },
  'akció': { min: 0, max: 100000 },
  'megfizethető': { min: 30000, max: 100000 },
  'közepes': { min: 50000, max: 200000 },
  'közép': { min: 50000, max: 200000 },
  'minőségi': { min: 100000, max: 400000 },
  'prémium': { min: 200000, max: 800000 },
  'luxus': { min: 400000, max: Infinity },
  'drága': { min: 300000, max: Infinity },
};

// ============================================================================
// SZÖVEG FELDOLGOZÁS
// ============================================================================

/**
 * Ékezetek és speciális karakterek eltávolítása
 * Nagyon fontos a magyar kereséshez!
 */
const removeAccents = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ő/g, 'o').replace(/ű/g, 'u')
    .replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ó/g, 'o').replace(/ú/g, 'u')
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/Ő/g, 'o').replace(/Ű/g, 'u')
    .replace(/Ö/g, 'o').replace(/Ü/g, 'u')
    .replace(/Ó/g, 'o').replace(/Ú/g, 'u')
    .replace(/Á/g, 'a').replace(/É/g, 'e').replace(/Í/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Levenshtein távolság - elgépelések felismeréséhez
 */
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

/**
 * Fuzzy egyezés - tolerálja az elgépeléseket
 */
const fuzzyMatch = (query, target, threshold = 0.75) => {
  const q = removeAccents(query);
  const t = removeAccents(target);
  
  if (t.includes(q) || q.includes(t)) return 1.0;
  
  const maxLen = Math.max(q.length, t.length);
  if (maxLen === 0) return 0;
  
  const distance = levenshteinDistance(q, t);
  return 1 - (distance / maxLen);
};

/**
 * Összes szinonima lekérése egy szóhoz
 */
const getAllSynonyms = (word) => {
  const result = new Set([word, removeAccents(word)]);
  const wordNoAccent = removeAccents(word);
  
  for (const [key, values] of Object.entries(SYNONYM_DATABASE)) {
    const keyNoAccent = removeAccents(key);
    
    // Ha a kulcs egyezik
    if (keyNoAccent === wordNoAccent || keyNoAccent.includes(wordNoAccent) || wordNoAccent.includes(keyNoAccent)) {
      result.add(key);
      result.add(keyNoAccent);
      values.forEach(v => {
        result.add(v.toLowerCase());
        result.add(removeAccents(v));
      });
    }
    
    // Ha bármelyik érték egyezik
    for (const val of values) {
      const valNoAccent = removeAccents(val);
      if (valNoAccent === wordNoAccent || valNoAccent.includes(wordNoAccent) || wordNoAccent.includes(valNoAccent)) {
        result.add(key);
        result.add(keyNoAccent);
        values.forEach(v => {
          result.add(v.toLowerCase());
          result.add(removeAccents(v));
        });
        break;
      }
    }
  }
  
  return Array.from(result);
};

/**
 * Keresőkifejezés kibővítése szinonimákkal
 */
const expandSearchTerms = (query) => {
  const words = query.toLowerCase().split(/[\s,\-\.\/]+/).filter(w => w.length >= 2);
  const expanded = new Set();
  
  words.forEach(word => {
    expanded.add(word);
    expanded.add(removeAccents(word));
    
    // Szinonimák hozzáadása
    const synonyms = getAllSynonyms(word);
    synonyms.forEach(s => {
      if (s.length >= 2) {
        expanded.add(s);
      }
    });
  });
  
  return Array.from(expanded);
};

// ============================================================================
// KERESÉSI SZÁNDÉK FELISMERÉS (NLP)
// ============================================================================

/**
 * Természetes nyelvű keresés elemzése
 */
export const parseSearchIntent = (query) => {
  const intent = {
    originalQuery: query,
    productTypes: [],
    styles: [],
    colors: [],
    materials: [],
    rooms: [],
    sizes: [],
    priceRange: null,
    isOnSale: false,
    features: [],
    keywords: [],
  };
  
  const queryLower = query.toLowerCase();
  const queryNoAccent = removeAccents(queryLower);
  
  // Termék típusok
  const productTypes = [
    'kanapé', 'fotel', 'asztal', 'szék', 'ágy', 'szekrény', 'polc', 'komód',
    'dohányzóasztal', 'étkezőasztal', 'íróasztal', 'éjjeliszekrény', 'puff',
    'vitrin', 'tv szekrény', 'bárszék', 'matrac', 'ülőgarnitúra', 'sarokkanapé'
  ];
  for (const type of productTypes) {
    const syns = getAllSynonyms(type);
    if (syns.some(s => queryNoAccent.includes(removeAccents(s)))) {
      intent.productTypes.push(type);
    }
  }
  
  // Stílusok
  const styles = ['modern', 'skandináv', 'rusztikus', 'indusztriális', 'klasszikus', 'bohém', 'luxus', 'retro', 'vintage'];
  for (const style of styles) {
    const syns = getAllSynonyms(style);
    if (syns.some(s => queryNoAccent.includes(removeAccents(s)))) {
      intent.styles.push(style);
    }
  }
  
  // Színek
  const colors = ['fehér', 'fekete', 'szürke', 'barna', 'bézs', 'kék', 'zöld', 'piros', 'sárga', 'rózsaszín', 'lila'];
  for (const color of colors) {
    const syns = getAllSynonyms(color);
    if (syns.some(s => queryNoAccent.includes(removeAccents(s)))) {
      intent.colors.push(color);
    }
  }
  
  // Anyagok
  const materials = ['fa', 'fém', 'bőr', 'szövet', 'bársony', 'üveg', 'márvány', 'rattan'];
  for (const mat of materials) {
    const syns = getAllSynonyms(mat);
    if (syns.some(s => queryNoAccent.includes(removeAccents(s)))) {
      intent.materials.push(mat);
    }
  }
  
  // Szobák
  const rooms = ['nappali', 'hálószoba', 'konyha', 'étkező', 'iroda', 'gyerekszoba', 'fürdőszoba', 'előszoba', 'erkély'];
  for (const room of rooms) {
    const syns = getAllSynonyms(room);
    if (syns.some(s => queryNoAccent.includes(removeAccents(s)))) {
      intent.rooms.push(room);
    }
  }
  
  // Méretek
  const sizes = ['kicsi', 'nagy', '2 személyes', '3 személyes', 'sarok', 'kompakt'];
  for (const size of sizes) {
    if (queryNoAccent.includes(removeAccents(size))) {
      intent.sizes.push(size);
    }
  }
  
  // Ár tartomány (szövegből)
  for (const [keyword, range] of Object.entries(PRICE_KEYWORDS)) {
    if (queryNoAccent.includes(removeAccents(keyword))) {
      intent.priceRange = range;
      if (keyword === 'akciós' || keyword === 'akció') {
        intent.isOnSale = true;
      }
      break;
    }
  }
  
  // Konkrét ár felismerése
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
      } else if (match[2] && /^\d+$/.test(match[2])) {
        intent.priceRange = { min: value, max: parseInt(match[2]) * 1000 };
      }
      break;
    }
  }
  
  // Kulcsszavak
  intent.keywords = query.toLowerCase().split(/[\s,\-\.\/]+/).filter(w => w.length >= 2);
  
  return intent;
};

// ============================================================================
// FŐ KERESÉSI ALGORITMUS
// ============================================================================

/**
 * FŐ KERESÉSI FUNKCIÓ
 * - Végigmegy MINDEN terméken
 * - Intelligens pontozás
 * - Szinonimák és fuzzy matching
 * - Szűrők támogatása
 */
export const smartSearch = (products, query, options = {}) => {
  const { limit = 100, includeDebugInfo = false } = options;
  
  console.log(`🔍 SEARCH: "${query}" in ${products?.length || 0} products`);
  
  if (!query || !query.trim()) {
    return { results: [], intent: null, suggestions: [], totalMatches: 0 };
  }
  
  if (!products || products.length === 0) {
    console.error('❌ NO PRODUCTS TO SEARCH!');
    return { results: [], intent: null, suggestions: [], totalMatches: 0 };
  }
  
  const startTime = performance.now();
  
  // 1. Query előkészítése
  const queryLower = query.toLowerCase().trim();
  const queryNoAccent = removeAccents(queryLower);
  const searchTerms = expandSearchTerms(queryLower);
  
  // 2. Szándék felismerés
  const intent = parseSearchIntent(query);
  
  console.log(`📝 Search terms: ${searchTerms.slice(0, 10).join(', ')}${searchTerms.length > 10 ? '...' : ''}`);
  console.log(`🎯 Intent: types=${intent.productTypes.join(',')}, colors=${intent.colors.join(',')}, styles=${intent.styles.join(',')}`);
  
  // 3. MINDEN TERMÉK PONTOZÁSA
  const scoredProducts = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const name = (product.name || '').toLowerCase();
    const nameNoAccent = removeAccents(name);
    const category = (product.category || '').toLowerCase();
    const categoryNoAccent = removeAccents(category);
    const description = removeAccents((product.description || '').toLowerCase());
    const params = removeAccents((product.params || '').toLowerCase());
    
    let score = 0;
    const matchReasons = [];
    
    // === PONTOS EGYEZÉSEK (LEGMAGASABB PRIORITÁS) ===
    
    // Teljes query egyezés a névben
    if (nameNoAccent.includes(queryNoAccent)) {
      if (nameNoAccent === queryNoAccent) {
        score += 10000; // TÖKÉLETES egyezés
        matchReasons.push('EXACT_NAME');
      } else if (nameNoAccent.startsWith(queryNoAccent)) {
        score += 5000; // Prefix egyezés
        matchReasons.push('PREFIX_NAME');
      } else {
        score += 3000; // Tartalmazza
        matchReasons.push('CONTAINS_NAME');
      }
    }
    
    // Query egyezés kategóriában
    if (categoryNoAccent.includes(queryNoAccent)) {
      score += 500;
      matchReasons.push('CATEGORY_MATCH');
    }
    
    // === SZÓ EGYEZÉSEK ===
    
    let wordMatches = 0;
    for (const term of searchTerms) {
      if (term.length < 2) continue;
      
      // Név egyezés
      if (nameNoAccent.includes(term)) {
        score += 200;
        wordMatches++;
        if (!matchReasons.includes('WORD_IN_NAME')) matchReasons.push('WORD_IN_NAME');
      }
      // Kategória egyezés
      else if (categoryNoAccent.includes(term)) {
        score += 100;
        wordMatches++;
        if (!matchReasons.includes('WORD_IN_CATEGORY')) matchReasons.push('WORD_IN_CATEGORY');
      }
      // Leírás egyezés
      else if (description.includes(term)) {
        score += 50;
        if (!matchReasons.includes('WORD_IN_DESC')) matchReasons.push('WORD_IN_DESC');
      }
      // Paraméterek egyezés
      else if (params.includes(term)) {
        score += 75;
        if (!matchReasons.includes('WORD_IN_PARAMS')) matchReasons.push('WORD_IN_PARAMS');
      }
    }
    
    // Bónusz több szó egyezésért
    if (wordMatches >= 2) {
      score += wordMatches * 100;
    }
    
    // === FUZZY MATCHING (elgépelések) ===
    
    if (score < 100 && queryNoAccent.length >= 4) {
      // Próbáljunk fuzzy matchet a névre
      const nameWords = nameNoAccent.split(/\s+/);
      for (const nameWord of nameWords) {
        if (nameWord.length >= 4) {
          const similarity = fuzzyMatch(queryNoAccent, nameWord);
          if (similarity >= 0.75) {
            score += Math.round(similarity * 500);
            matchReasons.push('FUZZY_MATCH');
            break;
          }
        }
      }
    }
    
    // === INTENT-ALAPÚ SZŰRÉS ===
    
    // Ár szűrés
    if (intent.priceRange) {
      const price = product.salePrice || product.price || 0;
      if (price >= intent.priceRange.min && price <= intent.priceRange.max) {
        score += 300;
        matchReasons.push('PRICE_MATCH');
      } else if (score > 0) {
        // Ha más miatt egyezik de az ár nem, csökkentjük a score-t
        score = Math.round(score * 0.5);
      }
    }
    
    // Akciós szűrés
    if (intent.isOnSale) {
      const isDiscounted = (product.originalPrice || product.price) > (product.salePrice || product.price);
      if (isDiscounted) {
        score += 200;
        matchReasons.push('ON_SALE');
      }
    }
    
    // Csak pozitív score-ok kellenek
    if (score > 0) {
      scoredProducts.push({
        product,
        score,
        matchReasons,
      });
    }
  }
  
  // 4. RENDEZÉS
  scoredProducts.sort((a, b) => b.score - a.score);
  
  // 5. EREDMÉNYEK
  const results = scoredProducts.slice(0, limit).map(s => s.product);
  const searchTime = performance.now() - startTime;
  
  console.log(`✅ Found ${scoredProducts.length} matches in ${searchTime.toFixed(0)}ms`);
  if (scoredProducts.length > 0) {
    const top = scoredProducts[0];
    console.log(`   #1: "${top.product.name}" (score: ${top.score}, reasons: ${top.matchReasons.join(', ')})`);
  }
  
  // 6. JAVASLATOK (ha kevés találat)
  const suggestions = [];
  if (scoredProducts.length < 5) {
    if (intent.priceRange) {
      suggestions.push({
        type: 'expand_price',
        text: 'Próbáld szélesebb ártartománnyal',
        action: query.replace(/\d+\s*(ezer|e|k)?(\s*(ft|forint))?\s*(alatt|ig|felett|fölött|tól)/gi, '').trim() || query,
      });
    }
    if (intent.colors.length > 0) {
      suggestions.push({
        type: 'remove_color',
        text: `Próbáld ${intent.colors[0]} nélkül`,
        action: query.replace(new RegExp(intent.colors[0], 'gi'), '').trim() || query,
      });
    }
  }
  
  return {
    results,
    intent,
    suggestions,
    totalMatches: scoredProducts.length,
    searchTime,
    debugInfo: includeDebugInfo ? scoredProducts.slice(0, 10) : undefined,
  };
};

// ============================================================================
// AUTOCOMPLETE
// ============================================================================

/**
 * Gyors autocomplete javaslatok
 */
export const getAutocompleteSuggestions = (products, query, limit = 12) => {
  if (!query || query.length < 2 || !products || products.length === 0) {
    return [];
  }
  
  const queryNoAccent = removeAccents(query.toLowerCase());
  const suggestions = new Map();
  
  // Termékek keresése
  for (const product of products) {
    if (suggestions.size >= limit * 5) break;
    
    const name = product.name || '';
    const nameNoAccent = removeAccents(name.toLowerCase());
    
    if (nameNoAccent.includes(queryNoAccent)) {
      const isPrefix = nameNoAccent.startsWith(queryNoAccent);
      const score = isPrefix ? 100 : 50;
      
      if (!suggestions.has(name) || suggestions.get(name).score < score) {
        suggestions.set(name, {
          text: name,
          type: 'product',
          product: product,
          score,
        });
      }
    }
  }
  
  // Kategória javaslatok
  const seenCategories = new Set();
  for (const product of products) {
    const cat = product.category;
    if (cat && !seenCategories.has(cat)) {
      seenCategories.add(cat);
      const catNoAccent = removeAccents(cat.toLowerCase());
      if (catNoAccent.includes(queryNoAccent)) {
        const mainCat = cat.split(' > ')[0];
        if (!suggestions.has(mainCat)) {
          suggestions.set(mainCat, {
            text: mainCat,
            type: 'category',
            score: 30,
          });
        }
      }
    }
  }
  
  // Szinonima javaslatok
  const synonyms = getAllSynonyms(query);
  for (const syn of synonyms.slice(0, 5)) {
    if (syn !== query && syn.length >= 3 && !suggestions.has(syn)) {
      suggestions.set(syn, {
        text: syn,
        type: 'synonym',
        score: 20,
      });
    }
  }
  
  // Rendezés és visszaadás
  return Array.from(suggestions.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// ============================================================================
// PROAKTÍV JAVASLATOK
// ============================================================================

/**
 * Személyre szabott keresési javaslatok
 */
export const getProactiveSuggestions = (products, userContext = {}) => {
  const suggestions = [];
  
  // Korábbi keresések
  const history = getSearchHistory(3);
  if (history.length > 0) {
    suggestions.push({
      type: 'recent',
      icon: '🕐',
      text: history[0].query,
      query: history[0].query,
    });
  }
  
  // Megtekintett termékek alapján
  const viewed = getViewedProducts(3);
  if (viewed.length > 0) {
    const cat = viewed[0].category?.split(' > ')[0];
    if (cat) {
      suggestions.push({
        type: 'based_on_viewed',
        icon: '👁️',
        text: `Több ${cat}`,
        query: cat,
      });
    }
  }
  
  // Stílus DNA alapján
  const styleDNA = getStyleDNA();
  if (styleDNA?.answers?.style) {
    suggestions.push({
      type: 'style',
      icon: '✨',
      text: `${styleDNA.answers.style} bútorok`,
      query: `${styleDNA.answers.style} bútor`,
    });
  }
  
  // Akciós termékek (ha vannak)
  if (products && products.length > 0) {
    const onSale = products.filter(p => 
      p.originalPrice && p.salePrice && p.originalPrice > p.salePrice
    ).length;
    if (onSale > 10) {
      suggestions.push({
        type: 'sale',
        icon: '🏷️',
        text: `${onSale} akciós termék`,
        query: 'akciós',
      });
    }
  }
  
  // Népszerű keresések
  const popular = [
    { icon: '🛋️', text: 'kanapé', query: 'kanapé' },
    { icon: '💺', text: 'fotel', query: 'fotel' },
    { icon: '🪑', text: 'szék', query: 'szék' },
    { icon: '🛏️', text: 'ágy', query: 'ágy' },
  ];
  
  for (const p of popular) {
    if (suggestions.length < 6 && !suggestions.some(s => s.query === p.query)) {
      suggestions.push({ type: 'popular', ...p });
    }
  }
  
  return suggestions.slice(0, 6);
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  smartSearch,
  getAutocompleteSuggestions,
  parseSearchIntent,
  getProactiveSuggestions,
  getAllSynonyms,
  SYNONYM_DATABASE,
  PRICE_KEYWORDS,
};
