import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, X, Clock, TrendingUp, ArrowRight, Sparkles, Package, 
  Filter, ChevronRight, Lightbulb, Tag, Eye, Zap, Star, Wand2,
  ShoppingBag, ArrowUpRight, Percent, History, Mic, Camera
} from 'lucide-react';
import { 
  smartSearch, 
  getAutocompleteSuggestions, 
  getProactiveSuggestions,
  parseSearchIntent,
  buildSearchIndex,
  isIndexReady,
  getIndexStats
} from '../../services/aiSearchService';
import { trackSearch, getSearchHistory, getViewedProducts } from '../../services/userPreferencesService';

/**
 * SmartSearchBar - Világszínvonalú AI-alapú bútorkereső
 * 
 * Funkciók:
 * - Valós idejű intelligens autocomplete
 * - Természetes nyelvű keresés
 * - Szinonimák és magyar nyelvi sajátosságok
 * - Fuzzy matching (elgépelés toleráns)
 * - Kontextus-tudatos javaslatok
 * - Proaktív ajánlások
 * - Keresési szándék felismerés
 * - Termék előnézet a találatokban
 */
const SmartSearchBar = ({ 
  products = [], 
  categories = [],
  onSearch, 
  onProductClick,
  placeholder = "Mit keresel? pl. 'modern kanapé 200 ezer alatt'" 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1); // Keyboard navigation
  const [indexStatus, setIndexStatus] = useState({ ready: false, building: false, count: 0 });
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const resultsRef = useRef(null);
  const indexedCountRef = useRef(0); // Track if we need to rebuild

  // 🧠 BUILD SEARCH INDEX when products are loaded
  useEffect(() => {
    // Only rebuild if product count changed significantly
    if (products.length > 0 && products.length !== indexedCountRef.current) {
      console.log(`📊 Products changed: ${indexedCountRef.current} → ${products.length}, rebuilding index...`);
      setIndexStatus({ ready: false, building: true, count: 0 });
      
      // Use requestIdleCallback or setTimeout to not block UI
      const buildIndex = () => {
        const startTime = performance.now();
        const success = buildSearchIndex(products);
        const elapsed = performance.now() - startTime;
        
        if (success) {
          const stats = getIndexStats();
          console.log(`✅ INDEX READY: ${stats.productCount.toLocaleString()} products, ${stats.wordCount.toLocaleString()} words in ${elapsed.toFixed(0)}ms`);
          indexedCountRef.current = products.length;
          setIndexStatus({ 
            ready: true, 
            building: false, 
            count: stats.productCount,
            words: stats.wordCount,
            buildTime: elapsed
          });
        } else {
          console.error('❌ Index build failed');
          setIndexStatus({ ready: false, building: false, count: 0 });
        }
      };

      // Build in next tick to let UI update
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(buildIndex, { timeout: 5000 });
      } else {
        setTimeout(buildIndex, 100);
      }
    }
  }, [products.length]);

  // Debounce query - csak 300ms után kezdjen keresni
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Autocomplete javaslatok - TELJES katalógusból keres
  const autocompleteSuggestions = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2 || !products.length) return [];
    // TELJES katalógus használata - a getAutocompleteSuggestions már optimalizált
    return getAutocompleteSuggestions(products, debouncedQuery, 8);
  }, [debouncedQuery, products]);

  // Keresési eredmények - CSAK ha debounced query változik
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) return { results: [], intent: null, totalMatches: 0 };
    return smartSearch(products, debouncedQuery, { limit: 8, includeDebugInfo: false });
  }, [debouncedQuery, products]);

  // Felismert keresési szándék
  const searchIntent = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 3) return null;
    return parseSearchIntent(debouncedQuery);
  }, [debouncedQuery]);

  // Proaktív javaslatok - egyszer számítva, nem minden renderben
  const proactiveSuggestions = useMemo(() => {
    // Nem használjuk a products-ot itt, mert lassú lenne
    return getProactiveSuggestions([]);
  }, []);

  // Keresési előzmények - egyszer beolvasva
  const recentSearches = useMemo(() => {
    const history = getSearchHistory(4);
    return history.map(h => h.query).filter(q => q && q.length > 0);
  }, []);

  // Nemrég nézett termékek - egyszer beolvasva
  const recentlyViewed = useMemo(() => {
    return getViewedProducts(3);
  }, []);

  // Trendi keresések - statikus + személyre szabott
  const trendingSearches = useMemo(() => {
    const viewed = getViewedProducts(3);
    const viewedCategories = viewed.map(p => p.category?.split(' > ')[0]).filter(Boolean);
    
    const defaults = [
      { text: 'modern kanapé', icon: '🛋️' },
      { text: 'skandináv stílus', icon: '🌲' },
      { text: 'akciós bútorok', icon: '🏷️' },
      { text: 'kompakt bútor', icon: '📦' },
    ];
    
    const personalized = viewedCategories.map(c => ({
      text: `${c} ajánlatok`,
      icon: '⭐',
    }));
    
    const combined = [...personalized, ...defaults];
    return combined.filter((v, i, a) => a.findIndex(t => t.text === v.text) === i).slice(0, 4);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // === CALLBACK DEFINÍCIÓK (useEffect ELŐTT kell lenniük!) ===
  
  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (query.trim()) {
      trackSearch(query);
      onSearch?.(query);
      setIsOpen(false);
    }
  }, [query, onSearch]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
  }, []);

  const handleProductClickFn = useCallback((product) => {
    onProductClick?.(product);
    setQuery('');
    setIsOpen(false);
  }, [onProductClick]);

  const handleSuggestionClick = useCallback((suggestion) => {
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.query;
    setQuery(text);
    trackSearch(text);
    onSearch?.(text);
    setIsOpen(false);
  }, [onSearch]);

  const handleAutocompleteClickFn = useCallback((item) => {
    if (item.type === 'product' && item.product) {
      handleProductClickFn(item.product);
    } else {
      handleSuggestionClick(item.text);
    }
  }, [handleProductClickFn, handleSuggestionClick]);

  const clearQuery = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  // Alias for backwards compatibility
  const handleProductClick = handleProductClickFn;
  const handleAutocompleteClick = handleAutocompleteClickFn;

  // === NAVIGÁLHATÓ ELEMEK ===
  
  // Összes navigálható elem (autocomplete + search results)
  const allNavigableItems = useMemo(() => {
    const items = [];
    
    // Autocomplete javaslatok
    if (debouncedQuery.length >= 2 && autocompleteSuggestions.length > 0) {
      autocompleteSuggestions.forEach((sug, idx) => {
        items.push({ type: 'autocomplete', item: sug, index: idx });
      });
    }
    
    // Keresési eredmények
    if (debouncedQuery.length >= 2 && searchResults.results?.length > 0) {
      searchResults.results.slice(0, 6).forEach((product, idx) => {
        items.push({ type: 'result', item: product, index: idx });
      });
    }
    
    return items;
  }, [debouncedQuery, autocompleteSuggestions, searchResults.results]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      const totalItems = allNavigableItems.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const next = prev < totalItems - 1 ? prev + 1 : 0;
            return next;
          });
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const next = prev > 0 ? prev - 1 : totalItems - 1;
            return next;
          });
          break;
          
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < totalItems) {
            e.preventDefault();
            const selected = allNavigableItems[selectedIndex];
            if (selected.type === 'autocomplete') {
              handleAutocompleteClickFn(selected.item);
            } else if (selected.type === 'result') {
              handleProductClickFn(selected.item);
            }
          }
          break;
          
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
          
        case 'Tab':
          if (totalItems > 0) {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % totalItems);
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allNavigableItems, selectedIndex, handleAutocompleteClickFn, handleProductClickFn]);

  // Render intent tags
  const renderIntentTags = () => {
    if (!searchIntent) return null;
    
    const tags = [];
    
    if (searchIntent.productTypes.length > 0) {
      tags.push({ label: searchIntent.productTypes[0], color: 'primary', icon: ShoppingBag });
    }
    if (searchIntent.styles.length > 0) {
      tags.push({ label: searchIntent.styles[0], color: 'purple', icon: Sparkles });
    }
    if (searchIntent.colors.length > 0) {
      tags.push({ label: searchIntent.colors[0], color: 'blue', icon: Tag });
    }
    if (searchIntent.priceRange) {
      const priceLabel = searchIntent.priceRange.max === Infinity 
        ? `${(searchIntent.priceRange.min / 1000).toFixed(0)}k+ Ft`
        : `${(searchIntent.priceRange.min / 1000).toFixed(0)}-${(searchIntent.priceRange.max / 1000).toFixed(0)}k Ft`;
      tags.push({ label: priceLabel, color: 'green', icon: Tag });
    }
    if (searchIntent.isOnSale) {
      tags.push({ label: 'Akciós', color: 'red', icon: Percent });
    }
    
    if (tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <span className="text-xs text-gray-500 mr-1 flex items-center gap-1">
          <Wand2 className="w-3 h-3" />
          Felismert:
        </span>
        {tags.map((tag, i) => (
          <span 
            key={i}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
              ${tag.color === 'primary' ? 'bg-primary-100 text-primary-700' : ''}
              ${tag.color === 'purple' ? 'bg-purple-100 text-purple-700' : ''}
              ${tag.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
              ${tag.color === 'green' ? 'bg-green-100 text-green-700' : ''}
              ${tag.color === 'red' ? 'bg-red-100 text-red-700' : ''}
            `}
          >
            <tag.icon className="w-3 h-3" />
            {tag.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          flex items-center gap-2 bg-white rounded-2xl border-2 transition-all duration-200
          ${isOpen 
            ? 'border-primary-400 shadow-xl shadow-primary-100/50 ring-4 ring-primary-50' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
        `}>
          <div className="flex items-center pl-4">
            {indexStatus.building ? (
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" title="Index építése..." />
            ) : query.length >= 2 && query !== debouncedQuery ? (
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className={`w-5 h-5 transition-colors ${isOpen ? 'text-primary-500' : 'text-gray-400'}`} />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 py-3.5 sm:py-4 bg-transparent text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 mr-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Keresés</span>
          </button>
        </div>
      </form>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] max-h-[75vh] overflow-y-auto">
          
          {/* Intent Tags - ha van felismert szándék */}
          {debouncedQuery.length >= 3 && renderIntentTags()}

          {/* Autocomplete javaslatok - gépelés közben */}
          {debouncedQuery.length >= 2 && autocompleteSuggestions.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Javaslatok
                </p>
                {autocompleteSuggestions.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                  <button
                    key={idx}
                    onClick={() => handleAutocompleteClick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group
                      ${isSelected 
                        ? 'bg-primary-100 ring-2 ring-primary-400 ring-inset' 
                        : 'hover:bg-primary-50'
                      }`}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      ${item.type === 'product' ? 'bg-primary-100' : ''}
                      ${item.type === 'category' ? 'bg-secondary-100' : ''}
                      ${item.type === 'keyword' ? 'bg-gray-100' : ''}
                      ${item.type === 'synonym' ? 'bg-purple-100' : ''}
                      ${item.type === 'popular' ? 'bg-amber-100' : ''}
                    `}>
                      {item.type === 'product' && item.product?.image ? (
                        <img src={item.product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <>
                          {item.type === 'product' && <Package className="w-4 h-4 text-primary-600" />}
                          {item.type === 'category' && <Filter className="w-4 h-4 text-secondary-600" />}
                          {item.type === 'keyword' && <Search className="w-4 h-4 text-gray-500" />}
                          {item.type === 'synonym' && <Sparkles className="w-4 h-4 text-purple-600" />}
                          {item.type === 'popular' && <TrendingUp className="w-4 h-4 text-amber-600" />}
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-800 font-medium">{item.text}</span>
                      {item.type === 'product' && item.product && (
                        <p className="text-xs text-primary-600 font-semibold">
                          {item.product.price?.toLocaleString()} Ft
                        </p>
                      )}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Keresési találatok - termékek */}
          {debouncedQuery.length >= 2 && searchResults.results && searchResults.results.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary-500" />
                  <span>{searchResults.totalMatches.toLocaleString()} találat</span>
                  {searchResults.searchTime && (
                    <span className="text-gray-400 font-normal">({searchResults.searchTime.toFixed(0)}ms)</span>
                  )}
                </p>
                {searchResults.totalMatches > 6 && (
                  <button 
                    onClick={handleSubmit}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    Mind megtekintése
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5" ref={resultsRef}>
                {searchResults.results.slice(0, 6).map((product, idx) => {
                  // Calculate actual index for keyboard navigation (after autocomplete items)
                  const actualIndex = autocompleteSuggestions.length + idx;
                  const isSelected = selectedIndex === actualIndex;
                  return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group
                      ${isSelected 
                        ? 'bg-gradient-to-r from-primary-100 to-primary-50 border-primary-300 ring-2 ring-primary-400 ring-inset shadow-md' 
                        : 'border-transparent hover:bg-gradient-to-r hover:from-primary-50 hover:to-white hover:border-primary-100'
                      }`}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shrink-0 ring-1 ring-gray-200 group-hover:ring-primary-300 transition-all shadow-sm group-hover:shadow-md">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-7 h-7 text-gray-300" />
                          </div>
                        )}
                      </div>
                      {/* Pozíció badge */}
                      {idx < 3 && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {product.category?.split(' > ').slice(-1)[0] || product.category}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base font-bold text-primary-600">
                          {(product.salePrice || product.price)?.toLocaleString()} Ft
                        </span>
                        {product.originalPrice && product.originalPrice > (product.salePrice || product.price) && (
                          <>
                            <span className="text-xs text-gray-400 line-through">
                              {product.originalPrice.toLocaleString()} Ft
                            </span>
                            <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                              -{Math.round((1 - (product.salePrice || product.price) / product.originalPrice) * 100)}%
                            </span>
                          </>
                        )}
                        {product.inStock === false && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Elfogyott
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ChevronRight className={`w-5 h-5 transition-all shrink-0 ${isSelected ? 'text-primary-500 translate-x-1' : 'text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1'}`} />
                      <Eye className={`w-4 h-4 transition-colors ${isSelected ? 'text-primary-400' : 'text-gray-300 group-hover:text-primary-400'}`} />
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* "Erre gondoltál?" javaslat */}
          {debouncedQuery.length >= 2 && searchResults.didYouMean && (
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <button
                onClick={() => handleSuggestionClick(searchResults.didYouMean.query)}
                className="flex items-center gap-2 text-sm group"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-gray-600">Erre gondoltál?</span>
                <span className="font-semibold text-amber-700 group-hover:text-amber-800 underline underline-offset-2">
                  {searchResults.didYouMean.query}
                </span>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Nincs találat */}
          {debouncedQuery.length >= 2 && (!searchResults.results || searchResults.results.length === 0) && autocompleteSuggestions.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-800 font-semibold mb-1">Nincs találat: "{debouncedQuery}"</p>
              <p className="text-sm text-gray-500 mb-4">Próbálj más kulcsszavakat vagy egyszerűsítsd a keresést</p>
              
              {/* Javaslatok */}
              {searchResults.suggestions?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Próbáld ezeket:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchResults.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick({ text: sug.action })}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        {sug.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Népszerű keresések fallback */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">Népszerű keresések:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['kanapé', 'fotel', 'asztal', 'szekrény', 'ágy'].map(term => (
                    <button
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Betöltés jelző gépelés közben */}
          {query.length >= 2 && query !== debouncedQuery && (
            <div className="p-6 text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Keresés...</p>
            </div>
          )}

          {/* Kezdőállapot - amikor nincs query */}
          {debouncedQuery.length < 2 && query.length < 2 && (
            <>
              {/* Proaktív AI javaslatok */}
              {proactiveSuggestions.length > 0 && (
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                    Személyre szabott ajánlatok
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proactiveSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(sug)}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
                      >
                        <span>{sug.icon}</span>
                        {sug.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Korábbi keresések */}
              {recentSearches.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Korábbi keresések
                  </p>
                  <div className="mt-2 space-y-1">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700">{search}</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nemrég nézett termékek */}
              {recentlyViewed.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Nemrég nézett
                  </p>
                  <div className="mt-2 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {recentlyViewed.map((product, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleProductClick(product)}
                        className="flex-shrink-0 w-24 group"
                      >
                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden ring-1 ring-gray-200 group-hover:ring-primary-300 transition-all">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-gray-700 truncate group-hover:text-primary-600 transition-colors font-medium">
                          {product.name}
                        </p>
                        <p className="text-xs text-primary-600 font-semibold">
                          {product.price?.toLocaleString()} Ft
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trendi keresések */}
              <div className="p-3">
                <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                  Népszerű keresések
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {trendingSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(item.text)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      <span>{item.icon}</span>
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gyors kategóriák */}
              {categories.length > 0 && (
                <div className="p-3 pt-0">
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    Kategóriák
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.slice(0, 6).map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(cat)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer - keresési tippek és keyboard hints */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {indexStatus.building ? (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    🧠 Tanulás folyamatban...
                  </span>
                ) : indexStatus.ready ? (
                  <span className="flex items-center gap-1.5 text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    🧠 {indexStatus.count?.toLocaleString()} termék betanulva
                  </span>
                ) : (
                  <span>💡 Keress természetesen, pl. "fehér kanapé 150e alatt"</span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">↑↓</kbd>
                <span>navigálás</span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">Enter</kbd>
                <span>kiválasztás</span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">Esc</kbd>
                <span>bezárás</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
