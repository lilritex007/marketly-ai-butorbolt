import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, TrendingUp, Clock, X } from 'lucide-react';
import { useDebounce } from '../../hooks';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA";

/**
 * AI-Powered Smart Search with autocomplete and suggestions
 */
export const SmartSearch = ({ products, onSearch, onSelectProduct }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => 
    JSON.parse(localStorage.getItem('recent_searches') || '[]')
  );
  
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);

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
      setAiSuggestions([]);
      return;
    }

    // Basic text-based suggestions
    const lowerQuery = debouncedQuery.toLowerCase();
    const matches = products
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        (p.params && p.params.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5);

    setSuggestions(matches);

    // Get AI suggestions if query is substantial
    if (debouncedQuery.length >= 5 && matches.length < 3) {
      getAISuggestions(debouncedQuery);
    }
  }, [debouncedQuery, products]);

  const getAISuggestions = async (searchQuery) => {
    setIsLoadingAI(true);
    try {
      const categoryList = [...new Set(products.map(p => p.category))].join(', ');
      
      const prompt = `Bútor webshop vásárlói keresés: "${searchQuery}"
      
Elérhető kategóriák: ${categoryList}

Add vissza JSON formátumban 3 találó keresési javaslat a mi termékeink alapján:
{
  "suggestions": ["javaslat1", "javaslat2", "javaslat3"]
}

Magyarul, röviden, konkrétan. Csak olyan kategóriák/termékek amit TÉNYLEG van a listában!`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      const data = await response.json();
      const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{"suggestions":[]}');
      setAiSuggestions(result.suggestions || []);
    } catch (error) {
      setAiSuggestions([]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const term = searchTerm || query;
    if (term.trim()) {
      // Save to recent searches
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      
      onSearch(term);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (typeof suggestion === 'string') {
      setQuery(suggestion);
      handleSearch(suggestion);
    } else {
      // It's a product
      onSelectProduct(suggestion);
      setIsOpen(false);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Keresés bútorok között... (pl. skandináv kanapé)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-base"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setAiSuggestions([]);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50 animate-fade-in-down">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Legutóbbi keresések
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Törlés
                </button>
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(search)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Termékek
              </div>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectSuggestion(product)}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-3 group"
                >
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/50'}
                    alt={product.name}
                    className="w-10 h-10 object-contain rounded bg-gray-50"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/50'}}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.price)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Javaslatok
              </div>
              {aiSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700 group-hover:text-purple-700">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Loading AI */}
          {isLoadingAI && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-indigo-600">
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI gondolkodik...
              </div>
            </div>
          )}

          {/* No Results */}
          {query && !isLoadingAI && suggestions.length === 0 && aiSuggestions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">Nincs találat erre: <strong>{query}</strong></p>
              <p className="text-xs mt-2">Próbálj meg más keresési kifejezést!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
