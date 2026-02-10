import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, Camera, ArrowRight, Wand2, X, Package, CheckCircle2, TrendingUp, ChevronRight, Plus, SlidersHorizontal, BrainCircuit, RotateCcw } from 'lucide-react';
import { getAutocompleteSuggestions, parseSearchIntent } from '../../services/aiSearchService';
import { trackSearch, trackSectionEvent, getSearchHistory } from '../../services/userPreferencesService';

const QUICK_INTENTS = [
  'bézs kanapé 100e alatt',
  'kis nappaliba fotel',
  'skandináv stílusú komód',
  'gyors szállítással'
];

const SUCCESSFUL_SEARCHES_KEY = 'mkt_successful_hero_searches';

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
  const [dismissedFilterIds, setDismissedFilterIds] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [searchJourney, setSearchJourney] = useState([]);
  const [showRewriteOptions, setShowRewriteOptions] = useState(false);

  const trimmedQuery = query.trim();

  const suggestions = useMemo(() => {
    if (trimmedQuery.length < 2 || !Array.isArray(products) || products.length === 0) return [];
    const local = getAutocompleteSuggestions(products, trimmedQuery, 6) || [];
    return local;
  }, [products, trimmedQuery]);

  const queryTokens = useMemo(() => (
    trimmedQuery
      .toLowerCase()
      .split(/[\s,/-]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2)
      .slice(0, 4)
  ), [trimmedQuery]);

  const intent = useMemo(() => {
    if (trimmedQuery.length < 3) return null;
    return parseSearchIntent(trimmedQuery);
  }, [trimmedQuery]);

  const parsedFilters = useMemo(() => {
    if (!intent) return [];
    const filters = [];
    if (Array.isArray(intent.productTypes) && intent.productTypes[0]) {
      const value = String(intent.productTypes[0]);
      filters.push({ id: `product-${value}`, label: 'termék', value, rawValue: value });
    }
    if (Array.isArray(intent.styles) && intent.styles[0]) {
      const value = String(intent.styles[0]);
      filters.push({ id: `style-${value}`, label: 'stílus', value, rawValue: value });
    }
    if (Array.isArray(intent.colors) && intent.colors[0]) {
      const value = String(intent.colors[0]);
      filters.push({ id: `color-${value}`, label: 'szín', value, rawValue: value });
    }
    if (intent.priceRange?.max && Number.isFinite(intent.priceRange.max)) {
      const value = `max ${Math.round(intent.priceRange.max / 1000)}k`;
      filters.push({ id: 'price-max', label: 'ár', value, rawValue: 'alatt' });
    } else if (intent.priceRange?.min) {
      const value = `min ${Math.round(intent.priceRange.min / 1000)}k`;
      filters.push({ id: 'price-min', label: 'ár', value, rawValue: 'felett' });
    }
    if (intent.isOnSale) filters.push({ id: 'sale', label: 'mód', value: 'akciós', rawValue: 'akció' });
    return filters.slice(0, 5);
  }, [intent]);

  const activeFilters = useMemo(
    () => parsedFilters.filter((f) => !dismissedFilterIds.includes(f.id)),
    [parsedFilters, dismissedFilterIds]
  );

  const previewProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    const byAutocomplete = suggestions
      .filter((s) => s?.type === 'product' && s?.product)
      .map((s) => s.product);

    const byQuery = trimmedQuery.length < 2
      ? []
      : products
        .filter((p) => {
          const haystack = `${p?.name || ''} ${p?.category || ''}`.toLowerCase();
          return queryTokens.some((token) => haystack.includes(token));
        })
        .slice(0, 8);

    const merged = [...byAutocomplete, ...byQuery];
    const unique = [];
    const seen = new Set();
    for (const item of merged) {
      const id = String(item?.id ?? item?.sku ?? item?.name ?? '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      unique.push(item);
      if (unique.length >= 3) break;
    }
    return unique;
  }, [products, suggestions, trimmedQuery, queryTokens]);

  const confidenceScore = useMemo(() => {
    const queryScore = Math.min(trimmedQuery.length * 3.5, 35);
    const filterScore = Math.min(activeFilters.length * 14, 35);
    const suggestionScore = suggestions.length > 0 ? Math.min(suggestions.length * 7, 25) : 0;
    const productScore = previewProducts.length > 0 ? 5 : 0;
    return Math.max(8, Math.min(100, Math.round(queryScore + filterScore + suggestionScore + productScore)));
  }, [trimmedQuery, activeFilters.length, suggestions.length, previewProducts.length]);

  const confidenceMeta = useMemo(() => {
    if (confidenceScore >= 75) return { label: 'Magas találati esély', tone: 'bg-emerald-500' };
    if (confidenceScore >= 45) return { label: 'Közepes találati esély', tone: 'bg-amber-500' };
    return { label: 'Finomítsd a keresést', tone: 'bg-rose-500' };
  }, [confidenceScore]);

  const dynamicQuickSuggestions = useMemo(() => {
    if (trimmedQuery.length < 2) return QUICK_INTENTS.slice(0, 4);
    const base = [];
    const firstToken = queryTokens[0];
    if (firstToken) {
      base.push(`${firstToken} akciós`);
      base.push(`modern ${firstToken}`);
      base.push(`${firstToken} gyors szállítással`);
      base.push(`${firstToken} 120e alatt`);
    }
    if (Array.isArray(intent?.styles) && intent.styles[0]) {
      base.push(`${intent.styles[0]} stílusú bútor`);
    }
    if (Array.isArray(intent?.colors) && intent.colors[0]) {
      base.push(`${intent.colors[0]} nappali`);
    }
    const unique = [];
    const seen = new Set();
    [...base, ...QUICK_INTENTS].forEach((q) => {
      const key = q.toLowerCase();
      if (!seen.has(key) && q.trim().length >= 3) {
        seen.add(key);
        unique.push(q.trim());
      }
    });
    return unique.slice(0, 6);
  }, [trimmedQuery, queryTokens, intent, activeFilters.length]);

  const rewriteSuggestions = useMemo(() => {
    if (trimmedQuery.length < 2) return [];
    const base = trimmedQuery;
    const first = queryTokens[0] || 'bútor';
    return [
      `${base} modern stílusban`,
      `${first} 20%-kal szélesebb árkerettel`,
      `${first} prémium kivitelben`,
      `${first} gyors szállítással`
    ];
  }, [trimmedQuery, queryTokens]);

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
    setSearchJourney((prev) => {
      const next = [trimmedQuery, ...prev.filter((q) => q.toLowerCase() !== trimmedQuery.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(SUCCESSFUL_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
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
    setSearchJourney((prev) => {
      const next = [text, ...prev.filter((q) => q.toLowerCase() !== text.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(SUCCESSFUL_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    onSearch?.(text);
    setIsOpen(false);
  };

  const handlePreviewProductClick = (product) => {
    const name = product?.name || '';
    if (!name) return;
    trackSectionEvent(`hero-search-${variant}`, 'click', String(product?.id || 'preview-product'));
    applySuggestion(name);
  };

  const removeFilter = (filter) => {
    if (!filter?.id) return;
    setDismissedFilterIds((prev) => (prev.includes(filter.id) ? prev : [...prev, filter.id]));
    if (!filter.rawValue) return;
    const raw = filter.rawValue.trim();
    if (!raw) return;
    setQuery((prev) => prev.replace(new RegExp(escapeRegExp(raw), 'ig'), '').replace(/\s{2,}/g, ' ').trim());
  };

  const clearAllFilters = () => {
    setDismissedFilterIds(parsedFilters.map((f) => f.id));
  };

  const toggleCompareProduct = (product) => {
    if (!product?.id) return;
    setCompareProducts((prev) => {
      const exists = prev.some((p) => String(p.id) === String(product.id));
      if (exists) return prev.filter((p) => String(p.id) !== String(product.id));
      const next = [...prev, product].slice(-3);
      return next;
    });
    trackSectionEvent(`hero-search-${variant}`, 'click', `compare-${product.id}`);
  };

  const runCompareSearch = () => {
    if (compareProducts.length < 2) return;
    const composed = compareProducts.map((p) => p?.name).filter(Boolean).join(' vs ');
    applySuggestion(composed);
  };

  const applyRewrite = (text) => {
    if (!text) return;
    setQuery(text);
    setShowRewriteOptions(false);
    setIsOpen(true);
    trackSectionEvent(`hero-search-${variant}`, 'click', 'rewrite');
  };

  const formatPrice = (value) => {
    const amount = Number(value || 0);
    return amount > 0 ? `${amount.toLocaleString('hu-HU')} Ft` : 'Ár hamarosan';
  };

  const getProductImage = (product) => {
    if (!product) return '';
    return product.image || product.images?.[0] || product.thumbnail || '';
  };

  useEffect(() => {
    setDismissedFilterIds([]);
  }, [trimmedQuery]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SUCCESSFUL_SEARCHES_KEY) || '[]');
      const history = getSearchHistory(6).map((entry) => entry?.query).filter(Boolean);
      const merged = [...stored, ...history];
      const unique = [];
      const seen = new Set();
      merged.forEach((item) => {
        const key = String(item).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });
      setSearchJourney(unique.slice(0, 6));
    } catch {
      setSearchJourney([]);
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-10">
      <div className="relative rounded-3xl border border-gray-200/90 bg-white/95 backdrop-blur-sm shadow-[0_20px_44px_rgba(15,23,42,0.12)] p-3 sm:p-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-primary-100/70 via-transparent to-secondary-100/70" aria-hidden />
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

        <div className="mt-3 rounded-xl border border-gray-200 bg-white/80 px-3 py-2">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Query confidence</p>
            <span className="text-xs font-semibold text-gray-700">{confidenceMeta.label}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full ${confidenceMeta.tone} transition-all duration-300`} style={{ width: `${confidenceScore}%` }} />
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => removeFilter(f)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3" aria-hidden />
                {f.label}: {f.value}
                <X className="w-3 h-3" aria-hidden />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-600 text-xs hover:bg-gray-50"
            >
              Szűrők törlése
            </button>
          </div>
        )}

        {trimmedQuery.length >= 2 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRewriteOptions((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors"
            >
              <BrainCircuit className="w-3.5 h-3.5" aria-hidden />
              AI átfogalmazás
            </button>
            {showRewriteOptions && rewriteSuggestions.slice(0, 3).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => applyRewrite(item)}
                className="px-3 py-1.5 rounded-full border border-violet-200 bg-white text-violet-700 text-xs hover:bg-violet-50 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {searchJourney.length > 0 && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 mb-2">Legutóbbi sikeres kereséseid</p>
            <div className="flex flex-wrap gap-2">
              {searchJourney.slice(0, 4).map((q) => (
                <button
                  key={`journey-${q}`}
                  type="button"
                  onClick={() => applySuggestion(q)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 text-xs hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" aria-hidden />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {didSearch && !isOpen && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
            Keresés elindítva
          </div>
        )}

        {isOpen && (
          <div className="mt-3 rounded-2xl border border-gray-200 bg-white overflow-hidden max-h-[58vh] overflow-y-auto">
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
              <div className="p-3 border-b border-gray-100 bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5 text-primary-500" aria-hidden />
                    Legjobb találatok
                  </p>
                  <span className="text-[11px] text-gray-500">Gyors megnyitás</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {previewProducts.map((p) => (
                    <div
                      key={p.id || p.name}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePreviewProductClick(p)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePreviewProductClick(p);
                        }
                      }}
                      className="text-left rounded-xl border border-gray-200 bg-white hover:bg-white hover:border-primary-300 hover:shadow-md transition-all p-2"
                    >
                      <div className="w-full h-16 rounded-lg bg-gray-100 overflow-hidden mb-2 flex items-center justify-center">
                        {getProductImage(p) ? <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" aria-hidden />}
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-primary-600 font-semibold">{formatPrice(p.salePrice || p.price)}</p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompareProduct(p);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition-colors ${compareProducts.some((cp) => String(cp.id) === String(p.id))
                              ? 'border-primary-300 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            <Plus className="w-3 h-3" aria-hidden />
                            Összevetés
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" aria-hidden />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 ? (
              <div className="p-3 space-y-3">
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
                <div>
                  <p className="text-xs text-gray-500 mb-2">Gyors javaslatok ehhez:</p>
                  <div className="flex flex-wrap gap-2">
                    {dynamicQuickSuggestions.slice(0, 4).map((q) => (
                      <button
                        key={`dyn-${q}`}
                        type="button"
                        onClick={() => applySuggestion(q)}
                        className="px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs hover:bg-primary-100 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {dynamicQuickSuggestions.map((q) => (
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

            {compareProducts.length > 0 && (
              <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-gray-600">Compare tray:</p>
                  {compareProducts.map((p) => (
                    <span key={`cmp-${p.id}`} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {p.name}
                      <button
                        type="button"
                        onClick={() => toggleCompareProduct(p)}
                        className="p-0.5 rounded-full hover:bg-gray-200"
                        aria-label="Termék eltávolítása összevetésből"
                      >
                        <X className="w-3 h-3" aria-hidden />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={runCompareSearch}
                    disabled={compareProducts.length < 2}
                    className="ml-auto px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Összehasonlítás
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

