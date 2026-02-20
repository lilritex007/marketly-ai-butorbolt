/**
 * Backend: config/searchSynonyms.json betöltése és merge a shared beépített listájával.
 * A productService ezt használja expandSearchTerms helyett.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SYNONYMS as BUILTIN, normalize } from '../shared/searchSynonyms.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '..', 'config', 'searchSynonyms.json');

let _synonyms = { ...BUILTIN };
let _wordToRoot = null;
let _rootToExpanded = null;

function rebuildMaps() {
  _wordToRoot = new Map();
  _rootToExpanded = new Map();
  for (const [root, syns] of Object.entries(_synonyms)) {
    const rootNorm = normalize(root);
    _wordToRoot.set(rootNorm, rootNorm);
    for (const syn of syns || []) {
      _wordToRoot.set(normalize(syn), rootNorm);
    }
  }
  for (const [root, syns] of Object.entries(_synonyms)) {
    const rootNorm = normalize(root);
    const expanded = new Set([rootNorm]);
    (syns || []).forEach(s => expanded.add(normalize(s)));
    _rootToExpanded.set(rootNorm, expanded);
  }
}

if (fs.existsSync(configPath)) {
  try {
    const extra = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    for (const [k, v] of Object.entries(extra)) {
      const arr = Array.isArray(v) ? v : [];
      _synonyms[k] = _synonyms[k] ? [...new Set([..._synonyms[k], ...arr])] : arr;
    }
  } catch (e) {
    console.warn('[searchConfig] Could not load config/searchSynonyms.json:', e.message);
  }
}
rebuildMaps();

export function expandSearchTerms(terms) {
  const words = Array.isArray(terms) ? terms : String(terms || '').split(/\s+/).map(t => t.trim()).filter(Boolean);
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
