import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, TrendingUp, Clock, X } from 'lucide-react';
import { useDebounce } from '../../hooks';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA";

/**
 * SmartSearch - Responsive Search with Autocomplete
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions from products
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
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
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
          className="w-full h-10 sm:h-11 pl-9 sm:pl-11 pr-9 sm:pr-10 text-sm sm:text-base border-2 border-gray-200 rounded-xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Törlés"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-80 sm:max-h-96 overflow-y-auto z-50 animate-fade-in">
          
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 sm:p-3 border-b border-gray-100">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Korábbi
                </span>
                <button
                  onClick={() => { setRecentSearches([]); localStorage.removeItem('recent_searches'); }}
                  className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Törlés
                </button>
              </div>
              <div className="space-y-0.5">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuery(search); handleSearch(search); }}
                    className="w-full text-left px-2 sm:px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2 sm:p-3">
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Termékek
              </div>
              <div className="space-y-0.5">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-left px-2 sm:px-3 py-2 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-2 sm:gap-3 group"
                  >
                    <img
                      src={product.images?.[0] || PLACEHOLDER_IMAGE}
                      alt=""
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-gray-50 shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate">{product.category}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap shrink-0">
                      {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && (
            <div className="p-6 sm:p-8 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Nincs találat: <strong className="text-gray-600">{query}</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
