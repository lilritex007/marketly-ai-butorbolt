import React, { useMemo, useState } from 'react';
import { Search, Sparkles, Camera, ArrowRight, Wand2 } from 'lucide-react';
import { getAutocompleteSuggestions, parseSearchIntent } from '../../services/aiSearchService';

const QUICK_INTENTS = [
  'bézs kanapé 100e alatt',
  'kis nappaliba fotel',
  'skandináv stílusú komód',
  'gyors szállítással'
];

export default function HeroSmartSearch({
  products = [],
  onSearch,
  onTryAI
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const trimmedQuery = query.trim();

  const suggestions = useMemo(() => {
    if (trimmedQuery.length < 2 || !Array.isArray(products) || products.length === 0) return [];
    const local = getAutocompleteSuggestions(products, trimmedQuery, 6) || [];
    return local;
  }, [products, trimmedQuery]);

  const intent = useMemo(() => {
    if (trimmedQuery.length < 3) return null;
    return parseSearchIntent(trimmedQuery);
  }, [trimmedQuery]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!trimmedQuery) return;
    onSearch?.(trimmedQuery);
    setIsOpen(false);
  };

  const applySuggestion = (text) => {
    if (!text) return;
    setQuery(text);
    onSearch?.(text);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-10">
      <div className="rounded-3xl border border-gray-200/90 bg-white/95 backdrop-blur-sm shadow-[0_14px_36px_rgba(15,23,42,0.08)] p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            AI keresés
          </span>
          <button
            type="button"
            onClick={onTryAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-50 text-secondary-700 text-xs font-semibold hover:bg-secondary-100 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" aria-hidden />
            Képből keresés
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
            <Wand2 className="w-3.5 h-3.5" aria-hidden />
            Okos ajánlások
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300 transition-all">
            <Search className="w-5 h-5 text-gray-400 ml-1" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="Mit keresel? pl. bézs kanapé 180 cm alatt"
              className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder:text-gray-400 py-2"
              aria-label="Hero okoskereső"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 sm:px-5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white text-sm font-semibold hover:opacity-95 active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
            >
              Keresés
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </form>

        {intent && (
          <div className="mt-3 flex flex-wrap gap-2">
            {(intent.filters || []).slice(0, 3).map((f, idx) => (
              <span key={`${f.type}-${idx}`} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                {f.type}: {String(f.value)}
              </span>
            ))}
          </div>
        )}

        {isOpen && (
          <div className="mt-3">
            {suggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.slice(0, 6).map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySuggestion(s.text || s.query || '')}
                    className="text-left px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary-200 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">{s.text || s.query}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {QUICK_INTENTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => applySuggestion(q)}
                    className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 text-xs hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

