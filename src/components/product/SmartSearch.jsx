import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { useDebounce } from '../../hooks';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E';

/**
 * SmartSearch - Golden Standard Responsive
 * Touch target: 44px minimum
 * Font: Mobile 14px, Desktop 15-16px
 */
export const SmartSearch = ({ products, onSearch, onSelectProduct }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => 
    JSON.parse(localStorage.getItem('recent_searches') || '[]')
  );
  
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    const matches = products
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 6);

    setSuggestions(matches);
  }, [debouncedQuery, products]);

  const handleSearch = (searchTerm) => {
    const term = searchTerm || query;
    if (term.trim()) {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      onSearch(term);
      setIsOpen(false);
    }
  };

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input - UNIFIED sizing scale */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 lg:left-5 xl:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Keresés..."
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-100 max-h-80 sm:max-h-96 overflow-y-auto z-50 animate-fade-in">
          
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

          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 px-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Termékek
              </div>
              <div className="space-y-1">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-left px-2 sm:px-3 py-2.5 min-h-[44px] hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-3 group"
                  >
                    <img
                      src={product.images?.[0] || PLACEHOLDER_IMAGE}
                      alt=""
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-lg bg-gray-50 shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-[15px] font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">{product.category}</p>
                    </div>
                    <span className="text-sm sm:text-[15px] font-bold text-gray-900 whitespace-nowrap shrink-0">
                      {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm sm:text-base">Nincs találat: <strong className="text-gray-600">{query}</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
