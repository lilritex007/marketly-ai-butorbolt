import React, { useMemo, useState } from 'react';
import { Search, Sparkles, Camera, ArrowRight, Wand2, X, Package, CheckCircle2 } from 'lucide-react';
import { getAutocompleteSuggestions, parseSearchIntent } from '../../services/aiSearchService';
import { trackSearch, trackSectionEvent } from '../../services/userPreferencesService';

const QUICK_INTENTS = [
  'bézs kanapé 100e alatt',
  'kis nappaliba fotel',
  'skandináv stílusú komód',
  'gyors szállítással'
];

export default function HeroSmartSearch({
  products = [],
  onSearch,
  onTryAI,
  variant = 'A'
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [didSearch, setDidSearch] = useState(false);

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

  const intentTokens = useMemo(() => {
    if (!intent) return [];
    const tokens = [];
    if (Array.isArray(intent.productTypes) && intent.productTypes.length > 0) {
      tokens.push(`termék: ${intent.productTypes[0]}`);
    }
    if (Array.isArray(intent.styles) && intent.styles.length > 0) {
      tokens.push(`stílus: ${intent.styles[0]}`);
    }
    if (Array.isArray(intent.colors) && intent.colors.length > 0) {
      tokens.push(`szín: ${intent.colors[0]}`);
    }
    if (intent.priceRange?.max && Number.isFinite(intent.priceRange.max)) {
      tokens.push(`max ár: ${Math.round(intent.priceRange.max / 1000)}k`);
    } else if (intent.priceRange?.min) {
      tokens.push(`min ár: ${Math.round(intent.priceRange.min / 1000)}k`);
    }
    if (intent.isOnSale) tokens.push('akciós');
    return tokens.slice(0, 4);
  }, [intent]);

  const previewProducts = useMemo(() => {
    return suggestions
      .filter((s) => s?.type === 'product' && s?.product)
      .map((s) => s.product)
      .slice(0, 3);
  }, [suggestions]);

  const hasNoResults = trimmedQuery.length >= 2 && suggestions.length === 0;
  const rescueSuggestions = useMemo(() => {
    if (!hasNoResults) return [];
    const q = trimmedQuery.toLowerCase();
    const base = [];
    if (q.includes('alatt')) base.push(q.replace(/(\d+\s*(e|ez|ezer|k).*)/i, '').trim());
    if (q.includes('olcsó')) base.push(q.replace('olcsó', ''));
    base.push(`${trimmedQuery} akció`);
    base.push(`${trimmedQuery} modern`);
    return base.map((v) => v.trim()).filter((v) => v.length >= 3).slice(0, 3);
  }, [hasNoResults, trimmedQuery]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!trimmedQuery) return;
    setIsSearching(true);
    setDidSearch(true);
    trackSearch(trimmedQuery);
    trackSectionEvent(`hero-search-${variant}`, 'click', 'submit');
    onSearch?.(trimmedQuery);
    setTimeout(() => {
      setIsSearching(false);
      setIsOpen(false);
    }, 350);
  };

  const applySuggestion = (text) => {
    if (!text) return;
    setQuery(text);
    setDidSearch(true);
    trackSearch(text);
    trackSectionEvent(`hero-search-${variant}`, 'click', 'suggestion');
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
              {isSearching ? 'Keresés...' : 'Keresés'}
              {isSearching ? <span className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" aria-hidden /> : <ArrowRight className="w-4 h-4" aria-hidden />}
            </button>
          </div>
        </form>

        {intentTokens.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {intentTokens.map((token, idx) => (
              <span key={`${token}-${idx}`} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                {token}
              </span>
            ))}
          </div>
        )}

        {didSearch && !isOpen && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
            Keresés elindítva
          </div>
        )}

        {isOpen && (
          <div className="mt-3 rounded-2xl border border-gray-200 bg-white overflow-hidden max-h-[56vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-3 py-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Okos javaslatok</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Keresőpanel bezárása"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewProducts.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Talán ezt keresed</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {previewProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applySuggestion(p.name)}
                      className="text-left rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary-200 transition-colors p-2"
                    >
                      <div className="w-full h-16 rounded-lg bg-gray-100 overflow-hidden mb-2 flex items-center justify-center">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" aria-hidden />}
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-primary-600 font-semibold mt-1">
                        {(p.salePrice || p.price || 0).toLocaleString('hu-HU')} Ft
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 ? (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <div className="p-3 space-y-3">
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
                {hasNoResults && rescueSuggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Nincs találat. Próbáld inkább:</p>
                    <div className="flex flex-wrap gap-2">
                      {rescueSuggestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => applySuggestion(q)}
                          className="px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs hover:bg-primary-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

