/**
 * Közös szinonim lista - kliens (aiSearchService) és backend (productService) számára.
 * Szerkeszthető: config/searchSynonyms.json (backend) - bővíti/felülírja a beépített listát.
 */

export function normalize(str) {
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

/** Teljes szinonim map - root → [szinonimák] */
export const SYNONYMS = {
  // === ÜLŐBÚTOROK ===
  'kanapé': ['szófa', 'sofa', 'couch', 'kanape', 'kanapá', 'kanap', 'ülőgarnitúra', 'garnitúra', 'sarokkanapé', 'sarok kanapé', 'heverő', 'rekamié', 'pamlag', 'pamlág', 'kanapék', 'ülőbútor'],
  'fotel': ['karosszék', 'armchair', 'pihenőfotel', 'relax fotel', 'relaxfotel', 'füles fotel', 'fülesfotel', 'zsákfotel', 'babzsák', 'fotelek', 'fotell'],
  'puff': ['ülőke', 'zsámoly', 'lábtartó', 'ottoman', 'puffok', 'lábtartó'],
  
  // === ASZTALOK ===
  'asztal': ['table', 'asztalka', 'asztalok'],
  'dohányzóasztal': ['kávéasztal', 'coffee table', 'nappali asztal', 'kisasztal', 'lerakóasztal', 'dohanyzoasztal', 'dohányzó asztal'],
  'étkezőasztal': ['ebédlőasztal', 'dining table', 'konyhaasztal', 'étkezőasztal', 'etkezoasztal', 'ebédlő asztal'],
  'íróasztal': ['munkaasztal', 'desk', 'számítógépasztal', 'pc asztal', 'gamer asztal', 'irodaasztal', 'iroasztal', 'iroasztal', 'munka asztal'],
  'éjjeliszekrény': ['éjjeli szekrény', 'nightstand', 'éjjeli', 'ejjeliszekreny', 'éjjeli asztal'],
  
  // === SZÉKEK ===
  'szék': ['chair', 'székek', 'szekek', 'szek', 'székk', 'szekék'],
  'étkezőszék': ['konyhai szék', 'dining chair', 'vendégszék', 'etkezoszek', 'ebédlő szék'],
  'irodai szék': ['forgószék', 'irodai', 'gamer szék', 'gaming szék', 'office chair', 'iroda szék'],
  'bárszék': ['pultszék', 'bar stool', 'magas szék', 'barszek', 'bár szék'],
  
  // === TÁROLÓK ===
  'szekrény': ['cabinet', 'gardrób', 'gardróbszekrény', 'ruhásszekrény', 'szekreny', 'szekrények', 'gardrob', 'gardrób'],
  'komód': ['fiókos szekrény', 'drawer', 'komod', 'komódok', 'fiokos szekreny'],
  'polc': ['shelf', 'polcok', 'könyvespolc', 'falipolc', 'polc'],
  'vitrin': ['üvegszekrény', 'tálaló', 'display cabinet', 'tálaloszékrény'],
  'tv szekrény': ['tv állvány', 'média szekrény', 'lowboard', 'tv bútor', 'tv allvány', 'tvlada', 'tv láda'],
  'gardrób': ['szekrény', 'gardróbszekrény', 'ruhásszekrény', 'ruhásszekrény', 'gardrob'],
  
  // === HÁLÓSZOBA ===
  'ágy': ['bed', 'franciaágy', 'boxspring', 'ágykeret', 'agy', 'ágynemű', 'agyak'],
  'matrac': ['mattress', 'habmatrac', 'rugós matrac', 'táskarugós', 'matracok'],
  
  // === STÍLUSOK ===
  'modern': ['kortárs', 'contemporary', 'minimalista', 'dizájn', 'design', 'modrn', 'mdoern'],
  'skandináv': ['nordic', 'scandi', 'északi', 'skandinav', 'skandináv', 'skandinv'],
  'rusztikus': ['vidéki', 'country', 'provence', 'natúr', 'rusztikus', 'rusztikus'],
  'indusztriális': ['industrial', 'loft', 'ipari', 'indusztrialis'],
  'klasszikus': ['hagyományos', 'elegáns', 'antik', 'tradicionális'],
  'retro': ['vintage', 'mid-century', 'retró'],
  'minimalista': ['minimalizm', 'egyszerű', 'tiszta vonalak'],
  
  // === SZÍNEK ===
  'fehér': ['white', 'feher', 'hófehér', 'krémfehér', 'feher', 'fehérek'],
  'fekete': ['black', 'sötét', 'antracit', 'fektee'],
  'szürke': ['gray', 'grey', 'szurke', 'grafit', 'szurke'],
  'barna': ['brown', 'dió', 'tölgy', 'bükk', 'csokoládé', 'mogyoró', 'barnna'],
  'bézs': ['beige', 'krém', 'homok', 'cappuccino', 'bezs', 'beéz'],
  'kék': ['blue', 'navy', 'tengerkék', 'türkiz', 'kek', 'kekk'],
  'zöld': ['green', 'olíva', 'smaragd', 'zold', 'zold'],
  'piros': ['red', 'bordó', 'vörös', 'burgundy'],
  'sárga': ['yellow', 'mustár', 'arany', 'sarga'],
  'rózsaszín': ['pink', 'rozsaszin', 'púder'],
  
  // === ANYAGOK ===
  'fa': ['wood', 'wooden', 'tömörfa', 'MDF', 'faa', 'fából'],
  'fém': ['metal', 'acél', 'vas', 'króm', 'fem', 'fémből'],
  'bőr': ['leather', 'valódi bőr', 'műbőr', 'bor', 'bor'],
  'szövet': ['fabric', 'textil', 'kárpit', 'szovet'],
  'bársony': ['velvet', 'velúr', 'barsony', 'barsony'],
  'üveg': ['glass', 'edzett üveg', 'uveg'],
  
  // === SZOBÁK ===
  'nappali': ['living room', 'szalon', 'nappali', 'nappaliba'],
  'hálószoba': ['bedroom', 'háló', 'haloszoba', 'haloszoba', 'hálószobába'],
  'konyha': ['kitchen', 'konyhaba'],
  'iroda': ['office', 'dolgozószoba', 'home office', 'irodába'],
  'gyerekszoba': ['kids room', 'gyerek', 'ifjúsági', 'gyerekszobába', 'baba szoba'],
  'előszoba': ['hall', 'folyosó', 'eloszoba', 'eloszobába'],
  
  // === FUNKCIÓK ===
  'kinyitható': ['ágyazható', 'átalakítható', 'vendégágy', 'kinyithato'],
  'tárolós': ['ágyneműtartós', 'fiókos', 'tarolos'],
  'állítható': ['dönthető', 'emelhető', 'allithato'],
  
  // === ÁR ===
  'olcsó': ['akciós', 'akció', 'kedvezményes', 'leárazott', 'olcso', 'olcsobb'],
  'prémium': ['luxus', 'drága', 'exkluzív', 'designer'],
  
  // === SZÁLLÍTÁS / EXTRA ===
  'gyors': ['expressz', 'gyorsan', 'azonnal'],
  'szállítás': ['szallitas', 'szállítással', 'delivery'],
};

/** Szó → root map a gyors lookup-hoz (normalizált kulcsokkal) */
const _wordToRoot = new Map();
for (const [root, syns] of Object.entries(SYNONYMS)) {
  const rootNorm = normalize(root);
  _wordToRoot.set(rootNorm, rootNorm);
  for (const syn of syns) {
    _wordToRoot.set(normalize(syn), rootNorm);
  }
}

export function getWordRoot(word) {
  return _wordToRoot.get(normalize(word)) || normalize(word);
}

/** Intent kategóriák (normalizált) - productService és parseSearchIntent számára */
export const TYPE_ROOTS = ['kanape', 'fotel', 'asztal', 'szek', 'agy', 'szekreny', 'polc', 'komod', 'gardrob', 'sarokkanape', 'tvszekreny', 'ejjeliszekreny'];
export const COLOR_ROOTS = ['feher', 'fekete', 'szurke', 'barna', 'bezs', 'kek', 'zold', 'piros', 'sarga'];
export const STYLE_ROOTS = ['modern', 'skandinav', 'rusztikus', 'indusztrialis', 'klasszikus', 'retro', 'minimalista'];
export const MATERIAL_ROOTS = ['fa', 'fem', 'bor', 'szovet', 'barsony', 'uveg'];

/** Root (normalizált) → szinonimák (normalizált) - expandWithSynonyms-hoz */
const _rootToExpanded = new Map();
for (const [root, syns] of Object.entries(SYNONYMS)) {
  const rootNorm = normalize(root);
  const expanded = new Set([rootNorm]);
  (syns || []).forEach(s => expanded.add(normalize(s)));
  _rootToExpanded.set(rootNorm, expanded);
}

/** Kliens: szavak bővítése szinonimákkal */
export function expandWithSynonyms(words) {
  const expanded = new Set(words.map(w => normalize(w)));
  for (const word of words) {
    const norm = normalize(word);
    const root = _wordToRoot.get(norm);
    if (root && _rootToExpanded.has(root)) {
      _rootToExpanded.get(root).forEach(w => expanded.add(w));
    }
  }
  return Array.from(expanded);
}

/** Backend: keresési kifejezés bővítése szinonimákkal - OR feltételekhez */
export function expandSearchTerms(terms) {
  const words = Array.isArray(terms) ? terms : String(terms || '').split(/\s+/).map(t => t.trim()).filter(Boolean);
  return expandWithSynonyms(words);
}
