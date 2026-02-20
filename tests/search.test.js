/**
 * Unit tesztek - aiSearchService (parseSearchIntent, expandWithSynonyms, getDidYouMean, getBroadenSuggestions)
 * Futtatás: node tests/search.test.js
 */
import { parseSearchIntent, getDidYouMeanSuggestion, getBroadenSuggestions, smartSearch } from '../src/services/aiSearchService.js';
import { expandWithSynonyms, expandSearchTerms } from '../shared/searchSynonyms.js';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'Assertion failed');
};

console.log('🧪 Search unit tests...\n');

// parseSearchIntent - ár
const intent1 = parseSearchIntent('kanapé 100e alatt');
assert(intent1.priceRange?.max === 100000, 'parseSearchIntent: 100e alatt → max 100000');
assert(intent1.productTypes?.includes('kanape'), 'parseSearchIntent: kanapé → productTypes');

const intent2 = parseSearchIntent('bézs fotel 80ezer felett');
assert(intent2.priceRange?.min === 80000, 'parseSearchIntent: 80ezer felett → min 80000');
assert(intent2.colors?.includes('bezs'), 'parseSearchIntent: bézs → colors');
assert(intent2.productTypes?.includes('fotel'), 'parseSearchIntent: fotel → productTypes');

const intent3 = parseSearchIntent('modern szekrény');
assert(intent3.styles?.includes('modern'), 'parseSearchIntent: modern → styles');
assert(intent3.productTypes?.length >= 1 || intent3.styles?.length >= 1, 'parseSearchIntent: szekrény vagy modern felismerve');

// expandWithSynonyms
const exp1 = expandWithSynonyms(['kanape']);
assert(exp1.includes('kanape'), 'expandWithSynonyms: kanape included');
assert(exp1.includes('szofa') || exp1.includes('sofa'), 'expandWithSynonyms: kanapé → szófa/sofa');

const exp2 = expandWithSynonyms(['bezs']);
assert(exp2.includes('bezs'), 'expandWithSynonyms: bezs included');
assert(exp2.includes('beige') || exp2.includes('krem'), 'expandWithSynonyms: bézs → beige/krém');

// expandSearchTerms (backend)
const terms1 = expandSearchTerms(['kanapé']);
assert(Array.isArray(terms1), 'expandSearchTerms: returns array');
assert(terms1.length >= 1, 'expandSearchTerms: has terms');

// getDidYouMeanSuggestion
const dym1 = getDidYouMeanSuggestion('kanapa');
assert(dym1 === 'kanape' || dym1 === 'kanapé' || dym1?.includes('kanap'), 'getDidYouMeanSuggestion: kanapa → kanapé');

const dym2 = getDidYouMeanSuggestion('szekreny');
assert(dym2 === null || dym2?.includes('szek'), 'getDidYouMeanSuggestion: szekreny (exact) → null or similar');

// getBroadenSuggestions
const broad1 = getBroadenSuggestions('kanape bezs', 3);
assert(Array.isArray(broad1), 'getBroadenSuggestions: returns array');
assert(broad1.length <= 3, 'getBroadenSuggestions: max 3');

const broad2 = getBroadenSuggestions('kanape', 10);
assert(broad2.length === 0, 'getBroadenSuggestions: 10 results → empty');

// smartSearch - basic
const products = [
  { id: '1', name: 'Modern kanapé bézs', category: 'Nappali > Kanapék', price: 150000 },
  { id: '2', name: 'Skandináv fotel', category: 'Nappali > Fotelok', price: 80000 },
  { id: '3', name: 'Irodai szék', category: 'Iroda > Székek', price: 45000 }
];
const res = smartSearch(products, 'kanapé');
assert(res.results?.length >= 1, 'smartSearch: finds kanapé');
assert(res.results[0]?.name?.toLowerCase().includes('kanap'), 'smartSearch: top result contains kanapé');

const res0 = smartSearch(products, 'xyznonexistent123');
assert(res0.results?.length === 0, 'smartSearch: no match → 0 results');
assert(res0.didYouMean === null || typeof res0.didYouMean === 'string', 'smartSearch: didYouMean when 0');

console.log('✅ All tests passed!\n');
