import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Clock, TrendingUp, ArrowRight, Sparkles, Package, Filter, ChevronRight } from 'lucide-react';

/**
 * SmartSearchBar - Intelligent search with autocomplete and previews
 * Features: image previews, trending searches, recent searches, category filters
 */
const SmartSearchBar = ({ 
  products = [], 
  categories = [],
  onSearch, 
  onProductClick,
  placeholder = "Keresés bútorok között..." 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Recent searches (mock - would be from localStorage in real app)
  const recentSearches = ['kanapé', 'étkező asztal', 'könyvespolc'];
  
  // Trending searches
  const trendingSearches = ['skandináv kanapé', 'minimál íróasztal', 'bőr fotel', 'tölgyfa komód'];

  // Filter products based on query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return products
      .filter(p => {
        const matchesQuery = p.name?.toLowerCase().includes(lowerQuery) || 
                            p.category?.toLowerCase().includes(lowerQuery);
        const matchesCategory = !activeCategory || p.category === activeCategory;
        return matchesQuery && matchesCategory;
      })
      .slice(0, 5);
  }, [query, products, activeCategory]);

  // Suggested categories based on query
  const suggestedCategories = useMemo(() => {
    if (!query.trim()) return categories.slice(0, 4);
    
    const lowerQuery = query.toLowerCase();
    return categories.filter(c => c.toLowerCase().includes(lowerQuery)).slice(0, 4);
  }, [query, categories]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query, activeCategory);
      setIsOpen(false);
    }
  };

  const handleProductClick = (product) => {
    onProductClick?.(product);
    setQuery('');
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch?.(suggestion, activeCategory);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          flex items-center gap-2 bg-white rounded-xl sm:rounded-2xl border-2 transition-all
          ${isOpen ? 'border-primary-400 shadow-lg shadow-primary-100' : 'border-gray-200 hover:border-gray-300'}
        `}>
          <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 py-3 sm:py-3.5 bg-transparent text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 mr-1.5 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-medium text-sm rounded-lg sm:rounded-xl hover:shadow-md transition-all"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Keresés</span>
          </button>
        </div>
      </form>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          
          {/* Category Filter Pills */}
          {suggestedCategories.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                    !activeCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Mind
                </button>
                {suggestedCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                      activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results with Images */}
          {searchResults.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Termékek</p>
              {searchResults.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-sm font-bold text-primary-600 mt-0.5">{product.price?.toLocaleString()} Ft</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && searchResults.length === 0 && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Nincs találat: "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Próbálj más kulcsszavakat</p>
            </div>
          )}

          {/* Recent & Trending - Show when no query */}
          {!query && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Legutóbbi keresések
                  </p>
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{search}</span>
                      <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                  Népszerű keresések
                </p>
                <div className="flex flex-wrap gap-2 px-3 py-2">
                  {trendingSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
