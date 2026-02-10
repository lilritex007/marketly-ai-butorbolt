import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Sparkles, Camera, ArrowRight, Wand2, X, Package, CheckCircle2, TrendingUp, ChevronRight, Plus, SlidersHorizontal, BrainCircuit, RotateCcw, Filter, Award } from 'lucide-react';
import {
  buildSearchIndex,
  getAutocompleteSuggestions,
  getProactiveSuggestions,
  parseSearchIntent,
  smartSearch
} from '../../services/aiSearchService';
import { trackSearch, trackSectionEvent, getSearchHistory, getViewedProducts, getLikedProducts } from '../../services/userPreferencesService';

const QUICK_INTENTS = [
  'bézs kanapé 100e alatt',
  'kis nappaliba fotel',
  'skandináv stílusú komód',
  'gyors szállítással'
];

const SUCCESSFUL_SEARCHES_KEY = 'mkt_successful_hero_searches';
const QUICK_FILTER_PRESETS = {
  ar: ['80e alatt', '120e alatt', '180e alatt'],
  stilus: ['modern', 'skandináv', 'minimalista'],
  helyiseg: ['nappaliba', 'hálószobába', 'előszobába']
};
const PROACTIVE_QUICK = getProactiveSuggestions().map((item) => item.query);

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function HeroSmartSearch({
  products = [],
  onSearch,
  onTryAI,
  variant = 'A',
  onOpenProductQuickView
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [didSearch, setDidSearch] = useState(false);
  const [dismissedFilterIds, setDismissedFilterIds] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [searchJourney, setSearchJourney] = useState([]);
  const [showRewriteOptions, setShowRewriteOptions] = useState(false);
  const [showQuickFilterPanel, setShowQuickFilterPanel] = useState(false);
  const [likedProductIds, setLikedProductIds] = useState([]);
  const [viewedProductIds, setViewedProductIds] = useState([]);
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [preferredKeywords, setPreferredKeywords] = useState([]);
  const [searchPulse, setSearchPulse] = useState(false);
  const [smartResults, setSmartResults] = useState([]);
  const [smartTotalMatches, setSmartTotalMatches] = useState(0);
  const [isIndexBuilding, setIsIndexBuilding] = useState(false);
  const instantSearchRef = useRef('');

  const trimmedQuery = query.trim();

  const suggestions = useMemo(() => {
    if (trimmedQuery.length < 2 || !Array.isArray(products) || products.length === 0) return [];
    const local = getAutocompleteSuggestions(products, trimmedQuery, 6) || [];
    return local;
  }, [products, trimmedQuery]);

  useEffect(() => {
    let cancelled = false;
    if (!Array.isArray(products) || products.length === 0) return () => { cancelled = true; };
    setIsIndexBuilding(true);
    buildSearchIndex(products)
      .catch(() => false)
      .finally(() => {
        if (!cancelled) setIsIndexBuilding(false);
      });
    return () => { cancelled = true; };
  }, [products]);

  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setSmartResults([]);
      setSmartTotalMatches(0);
      return;
    }
    if (trimmedQuery.length < 2) {
      setSmartResults([]);
      setSmartTotalMatches(0);
      return;
    }

    const result = smartSearch(products, trimmedQuery, { limit: 24 });
    setSmartResults(result?.results || []);
    setSmartTotalMatches(result?.totalMatches || 0);
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

  const queryMatchedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0 || trimmedQuery.length < 2) return [];
    if (smartResults.length > 0) return smartResults.slice(0, 40);
    return products
      .filter((p) => {
        const haystack = `${p?.name || ''} ${p?.category || ''}`.toLowerCase();
        return queryTokens.some((token) => haystack.includes(token));
      })
      .slice(0, 30);
  }, [products, trimmedQuery, queryTokens, smartResults]);

  const rankedQueryProducts = useMemo(() => {
    if (queryMatchedProducts.length === 0) return [];

    const likedSet = new Set(likedProductIds.map(String));
    const viewedSet = new Set(viewedProductIds.map(String));

    return queryMatchedProducts
      .map((product) => {
        const name = String(product?.name || '').toLowerCase();
        const categoryFull = String(product?.category || '').toLowerCase();
        const categoryLeaf = categoryFull.split('>').pop()?.trim() || '';
        let score = 0;

        queryTokens.forEach((token) => {
          if (name.includes(token)) score += 20;
          if (categoryFull.includes(token)) score += 12;
          if (preferredKeywords.some((kw) => token.includes(kw) || kw.includes(token))) score += 6;
        });

        if (preferredCategories.some((cat) => categoryFull.includes(cat.toLowerCase()))) score += 15;
        if (categoryLeaf && preferredCategories.some((cat) => categoryLeaf.includes(cat.toLowerCase()))) score += 10;
        if (likedSet.has(String(product?.id))) score += 40;
        if (viewedSet.has(String(product?.id))) score += 12;

        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);
  }, [queryMatchedProducts, queryTokens, preferredKeywords, preferredCategories, likedProductIds, viewedProductIds]);

  const previewProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    const byAutocomplete = suggestions
      .filter((s) => s?.type === 'product' && s?.product)
      .map((s) => s.product);

    const merged = [...byAutocomplete, ...rankedQueryProducts];
    const unique = [];
    const seen = new Set();
    for (const item of merged) {
      const id = String(item?.id ?? item?.sku ?? item?.name ?? '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      unique.push(item);
      if (unique.length >= 10) break;
    }
    return unique;
  }, [products, suggestions, rankedQueryProducts]);

  const starterProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    const likedSet = new Set(likedProductIds.map(String));
    const viewedSet = new Set(viewedProductIds.map(String));
    const scored = products.map((p) => {
      const id = String(p?.id || '');
      const category = String(p?.category || '').toLowerCase();
      let score = 0;
      if (likedSet.has(id)) score += 40;
      if (viewedSet.has(id)) score += 20;
      if (preferredCategories.some((cat) => category.includes(String(cat).toLowerCase()))) score += 14;
      if (Number(p?.salePrice || p?.price || 0) > 0) score += 6;
      return { p, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 10).map((entry) => entry.p);
  }, [products, likedProductIds, viewedProductIds, preferredCategories]);

  const contextualSuggestions = useMemo(() => {
    if (rankedQueryProducts.length === 0) return [];
    const categoryMap = new Map();
    rankedQueryProducts.forEach((p) => {
      const category = String(p?.category || '').split('>').pop()?.trim();
      if (!category) return;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    return [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => `${category} akció`);
  }, [rankedQueryProducts]);

  const actualResultCount = useMemo(() => {
    if (trimmedQuery.length < 2) return null;
    if (smartTotalMatches > 0) return smartTotalMatches;
    return rankedQueryProducts.length;
  }, [trimmedQuery, smartTotalMatches, rankedQueryProducts.length]);

  const confidenceScore = useMemo(() => {
    if (actualResultCount === null) return 0;
    return Math.max(0, Math.min(100, Math.round((Math.min(actualResultCount, 24) / 24) * 100)));
  }, [actualResultCount]);

  const confidenceMeta = useMemo(() => {
    if (actualResultCount === null) return { label: 'Kezdj el gépelni', tone: 'bg-gray-300' };
    if (actualResultCount >= 18) return { label: `${actualResultCount} erős találat`, tone: 'bg-emerald-500' };
    if (actualResultCount >= 8) return { label: `${actualResultCount} releváns találat`, tone: 'bg-amber-500' };
    if (actualResultCount >= 1) return { label: `${actualResultCount} találat`, tone: 'bg-orange-500' };
    return { label: 'Nincs találat', tone: 'bg-rose-500' };
  }, [actualResultCount]);

  const dynamicQuickSuggestions = useMemo(() => {
    if (trimmedQuery.length < 2) return [...PROACTIVE_QUICK, ...QUICK_INTENTS].slice(0, 6);
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
    [...base, ...contextualSuggestions, ...PROACTIVE_QUICK, ...QUICK_INTENTS].forEach((q) => {
      const key = q.toLowerCase();
      if (!seen.has(key) && q.trim().length >= 3) {
        seen.add(key);
        unique.push(q.trim());
      }
    });
    return unique.slice(0, 6);
  }, [trimmedQuery, queryTokens, intent, activeFilters.length, contextualSuggestions]);

  const quickHitSuggestions = useMemo(() => {
    return dynamicQuickSuggestions.slice(0, 8).map((text) => {
      const t = text.toLowerCase();
      let badge = { label: 'Kapcsolódó', classes: 'bg-gray-100 text-gray-700 border-gray-200' };
      if (trimmedQuery.length >= 2 && t.includes(trimmedQuery.toLowerCase())) {
        badge = { label: 'Pontos egyezés', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      } else if (Array.isArray(intent?.styles) && intent.styles.some((s) => t.includes(String(s).toLowerCase()))) {
        badge = { label: 'Stílus egyezés', classes: 'bg-violet-50 text-violet-700 border-violet-200' };
      } else if (Array.isArray(intent?.colors) && intent.colors.some((c) => t.includes(String(c).toLowerCase()))) {
        badge = { label: 'Szín egyezés', classes: 'bg-sky-50 text-sky-700 border-sky-200' };
      } else if (t.includes('alatt') || t.includes('akció')) {
        badge = { label: 'Ár / akció', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
      }
      return { text, badge };
    });
  }, [dynamicQuickSuggestions, trimmedQuery, intent]);

  const rewriteSuggestions = useMemo(() => {
    if (trimmedQuery.length < 2) return [];
    const first = queryTokens[0] || 'bútor';
    const topCategories = rankedQueryProducts
      .map((p) => String(p?.category || '').split('>').pop()?.trim())
      .filter(Boolean)
      .slice(0, 3);
    const mainCategory = topCategories[0] || first;
    const topStyle = Array.isArray(intent?.styles) && intent.styles[0] ? intent.styles[0] : 'modern';
    const topColor = Array.isArray(intent?.colors) && intent.colors[0] ? intent.colors[0] : 'bézs';

    return [
      `${mainCategory} ${topStyle} stílusban`,
      `${topColor} ${mainCategory} 120e alatt`,
      `${mainCategory} prémium kivitelben gyors szállítással`,
      `${mainCategory} kisebb térbe, keskeny kivitel`
    ];
  }, [trimmedQuery, queryTokens, rankedQueryProducts, intent]);

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
    setSearchPulse(true);
    instantSearchRef.current = trimmedQuery;
    setSearchJourney((prev) => {
      const next = [trimmedQuery, ...prev.filter((q) => q.toLowerCase() !== trimmedQuery.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(SUCCESSFUL_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    onSearch?.(trimmedQuery, { source: 'submit' });
    setTimeout(() => {
      setIsSearching(false);
      setIsOpen(false);
    }, 350);
  };

  const applySuggestion = (text, opts = {}) => {
    if (!text) return;
    const { submit = false } = opts;
    setQuery(text);
    setDidSearch(true);
    trackSearch(text);
    trackSectionEvent(`hero-search-${variant}`, 'click', 'suggestion');
    setSearchPulse(true);
    instantSearchRef.current = text.trim();
    setSearchJourney((prev) => {
      const next = [text, ...prev.filter((q) => q.toLowerCase() !== text.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(SUCCESSFUL_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (submit) {
      onSearch?.(text, { source: 'submit' });
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  };

  const handlePreviewProductClick = (product) => {
    const name = product?.name || '';
    if (!name || !product) return;
    trackSectionEvent(`hero-search-${variant}`, 'click', String(product?.id || 'preview-product'));
    onOpenProductQuickView?.(product);
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

  const applyQuickFilterToken = (token) => {
    if (!token) return;
    const normalized = String(token).trim();
    if (!normalized) return;
    setQuery((prev) => {
      const base = prev.trim();
      if (!base) return normalized;
      if (base.toLowerCase().includes(normalized.toLowerCase())) return base;
      return `${base} ${normalized}`.trim();
    });
    setIsOpen(true);
    trackSectionEvent(`hero-search-${variant}`, 'click', `quick-filter-${normalized}`);
  };

  const formatPrice = (value) => {
    const amount = Number(value || 0);
    return amount > 0 ? `${amount.toLocaleString('hu-HU')} Ft` : 'Ár hamarosan';
  };

  const getProductImage = (product) => {
    if (!product) return '';
    return product.image || product.images?.[0] || product.thumbnail || '';
  };

  const isPersonalMatch = (product) => {
    const category = String(product?.category || '').toLowerCase();
    const id = String(product?.id || '');
    if (likedProductIds.includes(id)) return true;
    return preferredCategories.some((cat) => category.includes(String(cat).toLowerCase()));
  };

  const getTopBadge = (product, index) => {
    if (likedProductIds.includes(String(product?.id || ''))) {
      return { text: 'Kedvenc találat', classes: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (isPersonalMatch(product)) {
      return { text: 'Neked ajánlott', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (index === 0) return { text: 'Top #1', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (index === 1) return { text: 'Top #2', classes: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (index === 2) return { text: 'Top #3', classes: 'bg-violet-50 text-violet-700 border-violet-200' };
    return { text: 'Ajánlott', classes: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  const displayedTopProducts = trimmedQuery.length < 2 ? starterProducts : previewProducts;

  useEffect(() => {
    setDismissedFilterIds([]);
  }, [trimmedQuery]);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setIsSearching(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      if (instantSearchRef.current === trimmedQuery) {
        setIsSearching(false);
        return;
      }
      instantSearchRef.current = trimmedQuery;
      setDidSearch(true);
      setIsSearching(true);
      trackSectionEvent(`hero-search-${variant}`, 'click', 'instant');
      setTimeout(() => setIsSearching(false), 180);
    }, 220);

    return () => clearTimeout(timer);
  }, [trimmedQuery, variant]);

  useEffect(() => {
    if (!searchPulse) return undefined;
    const timer = setTimeout(() => setSearchPulse(false), 650);
    return () => clearTimeout(timer);
  }, [searchPulse]);

  useEffect(() => {
    try {
      const liked = getLikedProducts().map((id) => String(id));
      const viewed = getViewedProducts(30);
      const viewedIds = viewed.map((item) => String(item?.id)).filter(Boolean);
      const categoryCounter = new Map();
      const keywordCounter = new Map();

      viewed.forEach((item) => {
        const category = String(item?.category || '').split('>').pop()?.trim();
        if (category) {
          categoryCounter.set(category, (categoryCounter.get(category) || 0) + 1);
        }
        String(item?.name || '')
          .toLowerCase()
          .split(/[\s,/-]+/)
          .map((token) => token.trim())
          .filter((token) => token.length >= 4)
          .forEach((token) => keywordCounter.set(token, (keywordCounter.get(token) || 0) + 1));
      });

      const topCategories = [...categoryCounter.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name]) => name);
      const topKeywords = [...keywordCounter.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name]) => name);

      setLikedProductIds(liked);
      setViewedProductIds(viewedIds);
      setPreferredCategories(topCategories);
      setPreferredKeywords(topKeywords);
    } catch {
      setLikedProductIds([]);
      setViewedProductIds([]);
      setPreferredCategories([]);
      setPreferredKeywords([]);
    }
  }, []);

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
    <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-10 overflow-x-hidden">
      <div className="relative rounded-3xl border border-primary-200 bg-gradient-to-br from-white via-primary-50/40 to-secondary-50/35 backdrop-blur-sm shadow-[0_26px_52px_rgba(15,23,42,0.16)] p-2.5 sm:p-4 overflow-hidden max-w-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-primary-300/60 via-transparent to-secondary-300/60" aria-hidden />
        <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-secondary-300/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-10 -bottom-8 w-28 h-28 rounded-full bg-primary-300/20 blur-2xl" aria-hidden />
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
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isIndexBuilding ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            {isIndexBuilding ? 'AI motor tanul...' : 'AI motor aktív'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className={`rounded-2xl border border-primary-200/70 bg-white p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300 transition-all ${searchPulse ? 'ring-2 ring-emerald-200 border-emerald-300' : ''}`}>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-primary-700 mb-1.5 px-1">Azonnali keresőmező</p>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 ml-1 shrink-0" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder="Írd be, mit keresel... pl. bézs kanapé 180 cm alatt"
                className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder:text-gray-400 py-2 min-w-0"
                aria-label="Hero okoskereső"
              />
            </div>
            <p className="text-[11px] text-primary-700/90 mt-1 px-1 font-medium">
              Kattints a mezőbe és gépelj - az AI azonnal értelmezi a keresési szándékod.
            </p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowQuickFilterPanel((prev) => !prev)}
                className={`min-h-[42px] px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${showQuickFilterPanel ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Filter className="w-3.5 h-3.5" aria-hidden />
                Szűrők
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-4 sm:px-5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white text-sm font-semibold hover:opacity-95 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(251,146,60,0.35)]"
              >
                {isSearching ? 'Keresés...' : 'Keresés indítása'}
                {isSearching ? <span className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" aria-hidden /> : <ArrowRight className="w-4 h-4" aria-hidden />}
              </button>
            </div>
          </div>
          {showQuickFilterPanel && (
            <div className="mt-2 rounded-2xl border border-primary-100 bg-gradient-to-br from-white to-primary-50/40 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.10)]">
              <p className="text-xs text-gray-500 mb-2">Gyors szűrők (egy koppintásos)</p>
              <div className="space-y-2">
                {Object.entries(QUICK_FILTER_PRESETS).map(([group, values]) => (
                  <div key={group} className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 min-w-14">
                      {group}
                    </span>
                    {values.map((value) => (
                      <button
                        key={`${group}-${value}`}
                        type="button"
                        onClick={() => applyQuickFilterToken(value)}
                        className="px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-xs hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                ))}
                {preferredCategories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 min-w-14">
                      Neked
                    </span>
                    {preferredCategories.slice(0, 3).map((value) => (
                      <button
                        key={`fav-${value}`}
                        type="button"
                        onClick={() => applyQuickFilterToken(value)}
                        className="px-2.5 py-1 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs hover:bg-primary-100 transition-colors"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        <div className="mt-3 rounded-xl border border-secondary-200 bg-gradient-to-r from-secondary-50/65 to-primary-50/55 px-3 py-2">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Keresési pontosság</p>
            <span className="text-xs font-semibold text-gray-700">{actualResultCount ?? 0} tényleges találat</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full ${confidenceMeta.tone} transition-all duration-300`} style={{ width: `${confidenceScore}%` }} />
          </div>
          {actualResultCount !== null && (
            <p className="mt-1.5 text-xs text-gray-500">
              Várható találatok: <span className="font-semibold text-gray-700">{actualResultCount}</span> · {confidenceMeta.label}
            </p>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-2.5 py-2">
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
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/45 px-2.5 py-2">
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
          <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/45 px-3 py-2">
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
          <div className="mt-3 rounded-2xl border border-primary-200 bg-white overflow-hidden max-h-[66vh] sm:max-h-[60vh] overflow-y-auto">
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

            {displayedTopProducts.length > 0 && (
              <div className="p-3 border-b border-gray-100 bg-gradient-to-br from-primary-100/55 via-white to-secondary-100/55">
                <div className="flex items-center justify-between mb-2">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5 text-primary-500" aria-hidden />
                    {trimmedQuery.length < 2 ? 'Ajánlott neked indulásnak' : 'Legjobb találatok'}
                  </p>
                  <span className="text-[11px] text-gray-500">{displayedTopProducts.length} db</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {displayedTopProducts.map((p, index) => {
                    const badge = getTopBadge(p, index);
                    return (
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
                        className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] snap-start text-left rounded-xl border border-primary-100 bg-white hover:bg-white hover:border-primary-300 hover:shadow-lg transition-all p-2.5"
                      >
                        <div className="w-full h-24 sm:h-28 rounded-lg bg-gray-100 overflow-hidden mb-2 flex items-center justify-center">
                          {getProductImage(p) ? <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" aria-hidden />}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badge.classes}`}>
                          <Award className="w-3 h-3" aria-hidden />
                          {badge.text}
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 mt-1.5 min-h-[2.2rem]">{p.name}</p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <p className="text-xs text-primary-600 font-semibold">{formatPrice(p.salePrice || p.price)}</p>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" aria-hidden />
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
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
                          <span className="text-[11px] text-primary-600 font-medium">QuickView</span>
                        </div>
                      </div>
                    );
                  })}
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
                      className="text-left px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary-200 transition-colors min-h-[48px]"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">{s.text || s.query}</p>
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Gyorstalálatok ehhez a kereséshez:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {quickHitSuggestions.slice(0, 6).map((item) => (
                      <button
                        key={`dyn-${item.text}`}
                        type="button"
                        onClick={() => applySuggestion(item.text)}
                        className="px-2.5 py-1.5 rounded-full border border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 text-xs font-medium hover:from-primary-100 hover:to-secondary-100 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{item.text}</span>
                        <span className={`px-1.5 py-0.5 rounded-full border text-[10px] ${item.badge.classes}`}>{item.badge.label}</span>
                      </button>
                    ))}
                  </div>
                  {searchJourney.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {searchJourney.slice(0, 2).map((q) => (
                        <button
                          key={`journey-inline-${q}`}
                          type="button"
                          onClick={() => applySuggestion(q)}
                          className="px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-600 text-[11px] hover:bg-gray-50 transition-colors"
                        >
                          Gyors újrafuttatás: {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {quickHitSuggestions.map((item) => (
                    <button
                      key={item.text}
                      type="button"
                      onClick={() => applySuggestion(item.text)}
                      className="px-2.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 text-xs hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{item.text}</span>
                      <span className={`px-1.5 py-0.5 rounded-full border text-[10px] ${item.badge.classes}`}>{item.badge.label}</span>
                    </button>
                  ))}
                </div>
                {hasNoResults && rescueSuggestions.length > 0 && (
                  <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-2.5">
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
                    <button
                      type="button"
                      onClick={onTryAI}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-600 text-white text-xs font-semibold hover:bg-secondary-700 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" aria-hidden />
                      Próbáld képalapú kereséssel
                    </button>
                  </div>
                )}
              </div>
            )}

            {compareProducts.length > 0 && (
              <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-gray-600">Összevető tálca:</p>
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

