import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, TrendingUp, Clock, X, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { useDebounce } from '../../hooks';
import { generateText } from '../../services/geminiService';
import { trackSearch, getSearchHistory } from '../../services/userPreferencesService';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E';

/**
 * SmartSearch - AI-vezérelt természetes nyelvű keresés
 * Megérti a komplex kereséseket: "modern kanapé 200 ezer alatt"
 */
export const SmartSearch = ({ products, onSearch, onSelectProduct, onShowRecommendations }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = getSearchHistory(5);
    return saved.map(s => s.query);
  });
  
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Termék statisztikák
  const productStats = useMemo(() => {
    if (!products?.length) return null;
    const categories = new Set(products.map(p => (p.category || '').split(' > ')[0]).filter(Boolean));
    return {
      total: products.length,
      categories: Array.from(categories).slice(0, 10)
    };
  }, [products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Alap keresés + AI keresés
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setAiSuggestions([]);
      setAiInsight('');
      return;
    }

    // Alapkeresés (instant)
    const basicMatches = searchProducts(debouncedQuery);
    setSuggestions(basicMatches.slice(0, 4));

    // AI keresés komplexebb lekérdezésekhez
    if (debouncedQuery.length > 5 && (
      debouncedQuery.includes(' ') || 
      /\d/.test(debouncedQuery) ||
      debouncedQuery.includes('alatt') ||
      debouncedQuery.includes('felett')
    )) {
      performAISearch(debouncedQuery);
    }
  }, [debouncedQuery, products]);

  // Alap keresés termékekre
  const searchProducts = (searchQuery) => {
    if (!products?.length) return [];
    
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    if (terms.length === 0) return [];

    // Ár szűrés kinyerése
    let maxPrice = null;
    let minPrice = null;
    
    const priceMatch = searchQuery.match(/(\d+)\s*(ezer|k|ft|forint)?.*?(alatt|felett|fölött)/i);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1]);
      const multiplier = priceMatch[2]?.toLowerCase() === 'ezer' || priceMatch[2]?.toLowerCase() === 'k' ? 1000 : 1;
      const direction = priceMatch[3].toLowerCase();
      
      if (direction === 'alatt') {
        maxPrice = amount * multiplier;
      } else {
        minPrice = amount * multiplier;
      }
    }

    const scored = products.map(p => {
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const price = p.salePrice || p.price || 0;
      
      let score = 0;
      
      // Ár szűrés
      if (maxPrice && price > maxPrice) return { product: p, score: -100 };
      if (minPrice && price < minPrice) return { product: p, score: -100 };
      
      // Kulcsszó egyezés
      terms.forEach(term => {
        if (term === 'alatt' || term === 'felett' || term === 'fölött' || /^\d+$/.test(term)) return;
        if (name.includes(term)) score += 15;
        if (category.includes(term)) score += 10;
      });
      
      return { product: p, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(s => s.product);
  };

  // AI-alapú keresés komplex lekérdezésekhez
  const performAISearch = async (searchQuery) => {
    setIsAISearching(true);
    setAiInsight('');

    try {
      // Előszűrt termékek az AI-nak
      const basicResults = searchProducts(searchQuery);
      
      const prompt = `Bútor keresés elemzése. A felhasználó ezt keresi: "${searchQuery}"

FELADAT:
1. Értelmezd a keresést (stílus, ár, típus, szín stb.)
2. Adj egy rövid, hasznos tippet (1 mondat, magyarul)

Válaszolj CSAK így, semmi mással:
TIPP: [a tipped ide]`;

      const result = await generateText(prompt, { temperature: 0.5, maxTokens: 80 });

      if (result.success && result.text) {
        const tippMatch = result.text.match(/TIPP:\s*(.+)/i);
        if (tippMatch) {
          setAiInsight(tippMatch[1].trim());
        }
      }

      // Ha alapkeresés kevés találatot hozott, próbáljunk szinonimákkal
      if (basicResults.length < 4) {
        const expandedResults = expandSearch(searchQuery);
        setAiSuggestions(expandedResults.filter(p => !basicResults.some(b => b.id === p.id)).slice(0, 4));
      }

    } catch (error) {
      console.warn('AI search error:', error);
    } finally {
      setIsAISearching(false);
    }
  };

  // Kibővített keresés szinonimákkal
  const expandSearch = (searchQuery) => {
    const synonyms = {
      'kanapé': ['ülőgarnitúra', 'sofa', 'szófa', 'heverő'],
      'ülőgarnitúra': ['kanapé', 'sofa', 'sarokülő'],
      'asztal': ['étkezőasztal', 'dohányzóasztal', 'íróasztal'],
      'szék': ['étkező szék', 'forgószék', 'fotel'],
      'fotel': ['karosszék', 'pihenőfotel', 'relax'],
      'ágy': ['franciaágy', 'hálószoba', 'boxspring'],
      'szekrény': ['gardrób', 'ruhásszekrény', 'komód'],
      'modern': ['minimalista', 'kortárs', 'letisztult'],
      'skandináv': ['nordic', 'natúr', 'világos'],
      'olcsó': ['akciós', 'kedvezményes', 'alacsony árú'],
    };

    const queryLower = searchQuery.toLowerCase();
    const expandedTerms = [queryLower];

    Object.entries(synonyms).forEach(([key, values]) => {
      if (queryLower.includes(key)) {
        expandedTerms.push(...values);
      }
    });

    // Keresés a kibővített kifejezésekkel
    const results = [];
    expandedTerms.forEach(term => {
      const matches = products.filter(p => {
        const text = `${p.name || ''} ${p.category || ''}`.toLowerCase();
        return text.includes(term);
      });
      results.push(...matches);
    });

    // Deduplikálás
    const uniqueResults = [...new Map(results.map(p => [p.id, p])).values()];
    return uniqueResults.slice(0, 8);
  };

  const handleSearch = (searchTerm) => {
    const term = searchTerm || query;
    if (term.trim()) {
      // Mentés a history-ba
      trackSearch(term);
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      
      onSearch(term);
      setIsOpen(false);
    }
  };

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    setIsOpen(false);
    setQuery('');
  };

  // AI ajánlások megjelenítése a shopban
  const handleShowAIResults = () => {
    const allResults = [...suggestions, ...aiSuggestions];
    if (allResults.length > 0 && onShowRecommendations) {
      onShowRecommendations(allResults, `Keresés: "${query}"`);
    }
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setAiSuggestions([]);
    setAiInsight('');
    inputRef.current?.focus();
  };

  const formatPrice = (price) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 lg:left-5 xl:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Keresés... (pl: modern kanapé 200 ezer alatt)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full h-12 sm:h-12 lg:h-14 xl:h-16 2xl:h-[72px] pl-11 sm:pl-12 lg:pl-14 xl:pl-16 pr-11 sm:pr-12 lg:pr-14 xl:pr-16 text-base sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl border-2 border-gray-200 rounded-xl lg:rounded-2xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 font-medium"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 sm:right-3 lg:right-4 xl:right-5 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Törlés"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-100 max-h-[70vh] overflow-y-auto z-50 animate-fade-in">
          
          {/* AI Insight */}
          {aiInsight && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{aiInsight}</p>
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Korábbi keresések
                </span>
                <button
                  onClick={() => { setRecentSearches([]); localStorage.removeItem('recent_searches'); }}
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Törlés
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuery(search); handleSearch(search); }}
                    className="w-full text-left px-3 py-2.5 min-h-[44px] hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="text-sm sm:text-[15px] text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Loading */}
          {isAISearching && (
            <div className="p-4 flex items-center justify-center gap-2 text-indigo-600 border-b border-gray-100">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI elemzi a keresést...</span>
            </div>
          )}

          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 px-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Találatok ({suggestions.length})
              </div>
              <div className="space-y-1">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-left px-2 sm:px-3 py-2.5 min-h-[44px] hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-3 group"
                  >
                    <img
                      src={product.images?.[0] || product.image || PLACEHOLDER_IMAGE}
                      alt=""
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-lg bg-gray-50 shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-[15px] font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{product.category}</p>
                    </div>
                    <span className="text-sm sm:text-[15px] font-bold text-gray-900 whitespace-nowrap shrink-0">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Extended Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="p-3 sm:p-4 bg-gradient-to-b from-purple-50/50 to-white border-t border-purple-100">
              <div className="text-xs sm:text-sm font-semibold text-purple-600 mb-2 px-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI javaslatok
              </div>
              <div className="space-y-1">
                {aiSuggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-left px-2 sm:px-3 py-2.5 min-h-[44px] hover:bg-purple-50 rounded-xl transition-colors flex items-center gap-3 group"
                  >
                    <img
                      src={product.images?.[0] || product.image || PLACEHOLDER_IMAGE}
                      alt=""
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-lg bg-gray-50 shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-[15px] font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{product.category}</p>
                    </div>
                    <span className="text-sm sm:text-[15px] font-bold text-gray-900 whitespace-nowrap shrink-0">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Show All Results Button */}
          {(suggestions.length > 0 || aiSuggestions.length > 0) && onShowRecommendations && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={handleShowAIResults}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Összes találat megtekintése ({suggestions.length + aiSuggestions.length})
              </button>
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && aiSuggestions.length === 0 && !isAISearching && (
            <div className="p-8 text-center text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm sm:text-base">Nincs találat: <strong className="text-gray-600">{query}</strong></p>
              <p className="text-xs mt-2">Próbálj másik kulcsszót, pl. "kanapé" vagy "asztal"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
