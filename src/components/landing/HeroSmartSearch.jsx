import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Sparkles, Camera, ArrowRight, Wand2, X, Package, CheckCircle2, TrendingUp, ChevronRight, Plus, SlidersHorizontal, BrainCircuit, RotateCcw, Filter, Award, Lightbulb } from 'lucide-react';
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
const SEARCH_DEBOUNCE_MS = 180;
const LONG_PRESS_MS = 450;

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
  const [resultCountPulse, setResultCountPulse] = useState(false);
  const [hoverCard, setHoverCard] = useState({ id: null, rx: 0, ry: 0 });
  const [smartResults, setSmartResults] = useState([]);
  const [smartTotalMatches, setSmartTotalMatches] = useState(0);
  const [isIndexBuilding, setIsIndexBuilding] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewAnchor, setPreviewAnchor] = useState(null);
  const instantSearchRef = useRef('');
  const longPressTimerRef = useRef(null);

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

  // Debounced query for expensive smartSearch
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);
  useEffect(() => {
    if (trimmedQuery.length < 2) {
      const t = setTimeout(() => setDebouncedQuery(''), SEARCH_DEBOUNCE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDebouncedQuery(trimmedQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [trimmedQuery]);

  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setSmartResults([]);
      setSmartTotalMatches(0);
      return;
    }
    if (debouncedQuery.length < 2) {
      setSmartResults([]);
      setSmartTotalMatches(0);
      return;
    }

    const result = smartSearch(products, debouncedQuery, { limit: 24 });
    const nextResults = result?.results || [];
    const nextTotal = result?.totalMatches || 0;
    setSmartResults(nextResults);
    setSmartTotalMatches(nextTotal);
    setResultCountPulse(true);
  }, [products, debouncedQuery]);

  useEffect(() => {
    if (!resultCountPulse) return;
    const t = setTimeout(() => setResultCountPulse(false), 500);
    return () => clearTimeout(t);
  }, [resultCountPulse]);

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

  const rewriteSuggestionsWithQuality = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    return rewriteSuggestions.map((text) => {
      const result = smartSearch(products, text, { limit: 12 });
      const count = Number(result?.totalMatches || 0);
      let quality = { label: 'Közepes', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
      if (count >= 16) quality = { label: 'Erős', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      else if (count <= 3) quality = { label: 'Szűk', classes: 'bg-rose-50 text-rose-700 border-rose-200' };
      return { text, count, quality };
    });
  }, [rewriteSuggestions, products]);

  const intentTimeline = useMemo(() => {
    if (!intent || trimmedQuery.length < 2) return [];
    const timeline = [];
    if (Array.isArray(intent.productTypes) && intent.productTypes[0]) {
      timeline.push({ title: 'Terméktípus felismerve', value: intent.productTypes[0], tone: 'bg-primary-50 border-primary-200 text-primary-700' });
    }
    if (Array.isArray(intent.styles) && intent.styles[0]) {
      timeline.push({ title: 'Stílus felismerve', value: intent.styles[0], tone: 'bg-secondary-50 border-secondary-200 text-secondary-700' });
    }
    if (Array.isArray(intent.colors) && intent.colors[0]) {
      timeline.push({ title: 'Szín preferencia', value: intent.colors[0], tone: 'bg-sky-50 border-sky-200 text-sky-700' });
    }
    if (intent.priceRange?.max || intent.priceRange?.min) {
      const priceText = intent.priceRange?.max
        ? `${Math.round((intent.priceRange.max || 0) / 1000)}k alatt`
        : `${Math.round((intent.priceRange.min || 0) / 1000)}k felett`;
      timeline.push({ title: 'Árhatár', value: priceText, tone: 'bg-amber-50 border-amber-200 text-amber-700' });
    }
    timeline.push({ title: 'Találati magabiztosság', value: `${actualResultCount ?? 0} találat`, tone: 'bg-emerald-50 border-emerald-200 text-emerald-700' });
    return timeline.slice(0, 5);
  }, [intent, trimmedQuery, actualResultCount]);

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

  const triggerFullSearch = (inputQuery, source = 'submit') => {
    const safeQuery = String(inputQuery || '').trim();
    if (!safeQuery) return;
    onSearch?.(safeQuery, { source });
    setIsOpen(false);
  };

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
      const now = Date.now();
      const prevNorm = prev.map((x) => (typeof x === 'string' ? { q: x, t: 0 } : x));
      const next = [{ q: trimmedQuery, t: now }, ...prevNorm.filter((x) => (x.q || x).toLowerCase() !== trimmedQuery.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(SUCCESSFUL_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    triggerFullSearch(trimmedQuery, 'submit');
    setTimeout(() => {
      setIsSearching(false);
      setIsOpen(false);
    }, 350);
  };

  const applySuggestion = (text, opts = {}) => {
    if (!text) return;
    const { submit = true, source = 'suggestion' } = opts;
    setQuery(text);
    setDidSearch(true);
    trackSearch(text);
    trackSectionEvent(`hero-search-${variant}`, 'click', 'suggestion');
    setSearchPulse(true);
    instantSearchRef.current = text.trim();
    setSearchJourney((prev) => {
      const now = Date.now();
      const prevNorm = prev.map((x) => (typeof x === 'string' ? { q: x, t: 0 } : x));
      const next = [{ q: text, t: now }, ...prevNorm.filter((x) => (x.q || x).toLowerCase() !== text.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(SUCCESSFUL_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (submit) {
      triggerFullSearch(text, source);
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

  const removeFromHistory = (queryToRemove) => {
    const key = String(queryToRemove || '').toLowerCase();
    if (!key) return;
    setSearchJourney((prev) => {
      const next = prev
        .map((x) => (typeof x === 'string' ? { q: x, t: 0 } : x))
        .filter((x) => (x.q || x).toLowerCase() !== key);
      try {
        localStorage.setItem(SUCCESSFUL_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
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
    if (index === 2) return { text: 'Top #3', classes: 'bg-secondary-50 text-secondary-700 border-secondary-200' };
    return { text: 'Ajánlott', classes: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  const handleCardMouseMove = (event, productId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 6;
    const ry = (px - 0.5) * 8;
    setHoverCard({ id: String(productId), rx, ry });
  };

  const displayedTopProducts = trimmedQuery.length < 2 ? starterProducts : previewProducts;

  const historyGrouped = useMemo(() => {
    const list = searchJourney.map((x) => (typeof x === 'string' ? { q: x, t: 0 } : x));
    if (list.length === 0) return { today: [], earlier: [] };
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startTs = startOfToday.getTime();
    const today = list.filter((x) => (x.t || 0) >= startTs);
    const earlier = list.filter((x) => (x.t || 0) < startTs);
    return { today, earlier };
  }, [searchJourney]);

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
    if (trimmedQuery.length >= 1) {
      setIsOpen(true);
    }
  }, [trimmedQuery]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewProduct(null);
      setPreviewAnchor(null);
    }
  }, [isOpen]);

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
      const storedNorm = Array.isArray(stored)
        ? stored.map((x) => (typeof x === 'string' ? { q: x, t: 0 } : { q: x.q || x, t: x.t || 0 }))
        : [];
      const merged = [...storedNorm];
      history.forEach((q) => {
        const key = String(q).toLowerCase();
        if (!merged.some((x) => (x.q || x).toLowerCase() === key)) merged.push({ q, t: 0 });
      });
      const unique = [];
      const seen = new Set();
      merged.forEach((item) => {
        const q = item.q || item;
        const key = String(q).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(typeof item === 'object' && item && 'q' in item ? item : { q, t: 0 });
        }
      });
      setSearchJourney(unique.slice(0, 6));
    } catch {
      setSearchJourney([]);
    }
  }, []);

  return (
    <section
      className="mb-8 sm:mb-12 min-w-0 w-full max-w-full px-2 sm:px-3"
      style={{ touchAction: 'pan-y' }}
      aria-label="AI Kereső"
    >
      <div className="relative w-full max-w-[min(1400px,98vw)] mx-auto rounded-2xl overflow-x-clip overflow-y-visible border border-gray-200/90 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]">
        {/* Gradient orbs – AI modul stílus */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-200/40 mix-blend-multiply filter blur-[80px]" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary-300/30 mix-blend-multiply filter blur-[60px]" />
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-0 pb-5 sm:pb-6 min-w-0 max-w-full">
          {/* Fejléc – modul teljes szélesség, igényes, erőteljes színek */}
          <header className="mb-4 sm:mb-5 relative -mx-4 sm:-mx-6 lg:-mx-8 mt-0 overflow-hidden rounded-t-2xl border-b-2 border-primary-400/90">
            {/* Erőteljes gradient háttér */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-100 pointer-events-none" aria-hidden />
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-primary-600 pointer-events-none" aria-hidden />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_20%,rgba(255,138,0,0.25),transparent_50%)] pointer-events-none" aria-hidden />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_80%,rgba(0,107,111,0.2),transparent_50%)] pointer-events-none" aria-hidden />
            {/* Tartalom – igényes elrendezés */}
            <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-5 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                  <span className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white items-center justify-center shadow-[0_6px_20px_rgba(255,138,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)_inset]">
                    <Search className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border-2 border-primary-300/80 shadow-md mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" aria-hidden />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary-800">{isIndexBuilding ? 'Betöltés…' : 'Okos keresés'}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                      <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent drop-shadow-sm">AI</span>
                      <span className="text-gray-900"> Kereső</span>
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 mt-1.5 font-medium max-w-md">
                      Termék, stílus, ár – <span className="text-primary-700 font-bold">okos találatok</span> a teljes katalógusban
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 flex-shrink-0">
                  <button
                    type="button"
                    onClick={onTryAI}
                    className="inline-flex items-center justify-center h-11 sm:h-12 px-4 rounded-xl bg-white border-2 border-secondary-400 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-500 font-bold shadow-md hover:shadow-lg transition-all touch-manipulation gap-2 text-sm"
                    title="Képből keresés"
                    aria-label="Képből keresés"
                  >
                    <Camera className="w-5 h-5 shrink-0" aria-hidden />
                    <span>Képből</span>
                  </button>
                  <span
                    className={`inline-flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-xl border-2 shadow-md ${isIndexBuilding ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-emerald-100 border-emerald-400 text-emerald-800'}`}
                    title={isIndexBuilding ? 'Index épül' : 'Index kész'}
                    aria-live="polite"
                  >
                    <Sparkles className="w-5 h-5 shrink-0" aria-hidden />
                  </span>
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500 w-full max-w-md" aria-hidden />
            </div>
          </header>

          {/* Keresési tartalom */}
          <div className="space-y-4 sm:space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div
              className={`rounded-xl border bg-gradient-to-br from-primary-50/50 to-white p-2.5 sm:p-3 transition-all duration-200 focus-within:from-primary-50/80 focus-within:ring-2 focus-within:ring-primary-300/50 focus-within:border-primary-300 ${searchPulse ? 'ring-2 ring-emerald-300/60 border-emerald-300' : 'border-primary-200/80'}`}
            >
              {/* Mobilon: keresősáv teljes szélesség, alatta Szűrők + Keresés gombok */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 flex items-center gap-3 rounded-lg bg-white/95 border border-gray-200/90 shadow-sm px-3.5 py-3 sm:py-3.5 min-h-[48px] min-w-0 w-full">
                  <Search className="w-5 h-5 text-primary-500 shrink-0" aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Termék, stílus, ár... pl. bézs kanapé 100e alatt"
                    className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-lg text-gray-900 placeholder:text-gray-500"
                    aria-label="Keresés a teljes katalógusban"
                    autoComplete="off"
                  />
                </div>
                <div className="flex gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowQuickFilterPanel((prev) => !prev)}
                    className={`w-[30%] sm:w-auto min-h-[48px] px-3 sm:px-4 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-150 touch-manipulation active:scale-[0.98] ${showQuickFilterPanel ? 'border-primary-400 bg-primary-50 text-primary-800 shadow-sm' : 'border-gray-200 bg-white text-gray-700 hover:bg-primary-50/50 hover:border-primary-200'}`}
                    title="Gyors szűrők"
                    aria-expanded={showQuickFilterPanel}
                  >
                    <Filter className="w-5 h-5 shrink-0" aria-hidden />
                    <span>Szűrők</span>
                  </button>
                  <button
                    type="submit"
                    className="w-[70%] sm:w-auto min-h-[48px] px-4 sm:px-5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-bold shadow-[0_4px_14px_rgba(255,138,0,0.35)] hover:shadow-[0_6px_20px_rgba(255,138,0,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 inline-flex items-center justify-center gap-2 touch-manipulation"
                    aria-busy={isSearching}
                  >
                    {isSearching ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white/80 border-t-transparent animate-spin shrink-0" aria-hidden />
                    ) : (
                      <ArrowRight className="w-5 h-5 shrink-0" aria-hidden />
                    )}
                    <span>{isSearching ? 'Keres...' : 'Keresés'}</span>
                  </button>
                </div>
              </div>
            </div>
          {showQuickFilterPanel && (
            <div className="mt-3 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white px-4 py-4 relative overflow-hidden w-full">
              <div className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-primary-500" aria-hidden />
              <p className="text-sm font-bold text-amber-800 flex items-center gap-2.5 mb-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm"><Filter className="w-5 h-5" aria-hidden /></span>
                Gyors szűrők
              </p>
              <div className="space-y-3">
                {Object.entries(QUICK_FILTER_PRESETS).map(([group, values]) => (
                  <div key={group} className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500 min-w-14">
                      {group}
                    </span>
                    {values.map((value) => (
                      <button
                        key={`${group}-${value}`}
                        type="button"
                        onClick={() => applyQuickFilterToken(value)}
                        className="px-3 py-2 rounded-lg border border-amber-200/80 bg-white/90 text-amber-900 text-sm font-medium hover:bg-amber-100/80 hover:border-amber-300 transition-colors touch-manipulation min-h-[40px]"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                ))}
                {preferredCategories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 min-w-14">
                      Neked
                    </span>
                    {preferredCategories.slice(0, 3).map((value) => (
                      <button
                        key={`fav-${value}`}
                        type="button"
                        onClick={() => applyQuickFilterToken(value)}
                        className="px-3 py-2 rounded-lg border border-primary-200 bg-primary-50/60 text-primary-800 text-sm font-medium hover:bg-primary-50 transition-colors touch-manipulation min-h-[40px]"
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

          {/* Pontosság – trust card, AI modul stílus */}
          <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white px-4 py-3.5 relative overflow-hidden w-full shadow-sm" role="status" aria-live="polite">
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-secondary-500" aria-hidden />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-emerald-800 flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm"><Award className="w-5 h-5" aria-hidden /></span>
                Találatok
              </span>
              <span className={`text-base font-bold text-emerald-900 tabular-nums transition-transform duration-300 ${resultCountPulse ? 'scale-110' : 'scale-100'}`}>{actualResultCount ?? 0}</span>
            </div>
            <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${confidenceMeta.tone}`} style={{ width: `${confidenceScore}%` }} />
            </div>
            {actualResultCount != null && (
              <p className="mt-1.5 text-xs text-emerald-700/90">{confidenceMeta.label}</p>
            )}
          </div>

          {trimmedQuery.length >= 2 && (
            <div className="mt-3 sm:mt-4">
              <button
                type="button"
                onClick={() => triggerFullSearch(trimmedQuery, 'submit')}
                className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white font-bold text-base shadow-[0_4px_14px_rgba(255,138,0,0.35)] hover:shadow-[0_6px_20px_rgba(255,138,0,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 touch-manipulation"
              >
                Összes találat megnyitása ({actualResultCount ?? 0})
              </button>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-white px-4 py-3.5 relative overflow-hidden w-full shadow-sm">
              <div className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" aria-hidden />
              <span className="w-full flex items-center gap-2.5 mb-2 text-sm font-bold text-sky-800">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm"><SlidersHorizontal className="w-5 h-5" aria-hidden /></span>
                Aktív szűrők
              </span>
              {activeFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => removeFilter(f)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-sky-200/80 text-sky-800 text-sm font-medium hover:bg-sky-50 transition-colors touch-manipulation min-h-[40px]"
                >
                  {f.label}: {f.value}
                  <X className="w-3 h-3" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 touch-manipulation min-h-[40px]"
              >
                Szűrők törlése
              </button>
            </div>
          )}

          {trimmedQuery.length >= 2 && (
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-secondary-200/80 bg-gradient-to-br from-secondary-50/90 to-white px-4 py-3.5 relative overflow-hidden w-full shadow-sm">
              <div className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-secondary-400 via-teal-500 to-emerald-500" aria-hidden />
              <button
                type="button"
                onClick={() => setShowRewriteOptions((prev) => !prev)}
                className="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-secondary-500/20 to-teal-500/20 text-secondary-800 text-sm font-bold border border-secondary-200/80 hover:from-secondary-500/30 hover:to-teal-500/30 transition-colors touch-manipulation min-h-[40px]"
              >
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white flex items-center justify-center shrink-0 shadow-sm"><BrainCircuit className="w-5 h-5" aria-hidden /></span>
                AI átfogalmazás
              </button>
              {showRewriteOptions && rewriteSuggestionsWithQuality.slice(0, 3).map((item) => (
                <button
                  key={item.text}
                  type="button"
                  onClick={() => applyRewrite(item.text)}
                  className="px-3 py-2 rounded-lg border border-secondary-200 bg-white text-secondary-800 text-sm hover:bg-secondary-50/80 transition-colors inline-flex items-center gap-1.5 touch-manipulation min-h-[40px]"
                >
                  <span>{item.text}</span>
                  <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${item.quality.classes}`}>
                    {item.quality.label} · {item.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {intentTimeline.length > 0 && (
            <div className="mt-3 sm:mt-4 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white px-4 py-3.5 relative overflow-hidden w-full shadow-sm">
              <div className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-500" aria-hidden />
              <p className="text-sm font-bold text-indigo-800 flex items-center gap-2.5 mb-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm"><Lightbulb className="w-5 h-5" aria-hidden /></span>
                AI értelmezés
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {intentTimeline.map((step, idx) => (
                  <div key={`${step.title}-${idx}`} className={`rounded-lg border px-3 py-2 ${step.tone}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{step.title}</p>
                    <p className="text-sm font-semibold mt-0.5">{step.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(historyGrouped.today.length > 0 || historyGrouped.earlier.length > 0) && (
            <div className="mt-3 sm:mt-4 rounded-xl border border-gray-200/90 bg-gradient-to-br from-gray-50 to-white px-4 py-3.5 relative overflow-hidden w-full shadow-sm">
              <div className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-gray-300 via-gray-400 to-primary-400" aria-hidden />
              <p className="text-sm font-bold text-gray-800 flex items-center gap-2.5 mb-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white flex items-center justify-center shadow-sm"><RotateCcw className="w-5 h-5" aria-hidden /></span>
                Előzmények
              </p>
              {historyGrouped.today.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Ma</p>
                  <div className="flex flex-wrap gap-2">
                    {historyGrouped.today.slice(0, 4).map((item) => {
                      const q = item.q || item;
                      return (
                        <span key={`today-${q}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden min-h-[40px]">
                          <button
                            type="button"
                            onClick={() => applySuggestion(q, { submit: true, source: 'history' })}
                            className="px-3 py-2 text-left text-gray-700 text-sm font-medium hover:bg-primary-50 hover:text-primary-800 flex-1 min-w-0 truncate max-w-[180px] sm:max-w-none touch-manipulation"
                          >
                            <RotateCcw className="w-3 h-3 shrink-0 inline mr-1.5 align-middle" aria-hidden />
                            <span className="truncate">{q}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFromHistory(q); }}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0 touch-manipulation"
                            aria-label={`${q} törlése`}
                          >
                            <X className="w-3.5 h-3.5" aria-hidden />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {historyGrouped.earlier.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Korábbi</p>
                  <div className="flex flex-wrap gap-2">
                    {historyGrouped.earlier.slice(0, 4).map((item) => {
                      const q = item.q || item;
                      return (
                        <span key={`earlier-${q}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden min-h-[40px]">
                          <button
                            type="button"
                            onClick={() => applySuggestion(q, { submit: true, source: 'history' })}
                            className="px-3 py-2 text-left text-gray-700 text-sm font-medium hover:bg-primary-50 hover:text-primary-800 flex-1 min-w-0 truncate max-w-[180px] sm:max-w-none touch-manipulation"
                          >
                            <RotateCcw className="w-3 h-3 shrink-0 inline mr-1.5 align-middle" aria-hidden />
                            <span className="truncate">{q}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFromHistory(q); }}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0 touch-manipulation"
                            aria-label={`${q} törlése`}
                          >
                            <X className="w-3.5 h-3.5" aria-hidden />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        {didSearch && !isOpen && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold border border-emerald-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden />
            Keresés elindítva
          </div>
        )}

        {isOpen && (
          <div
            className="mt-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white overflow-hidden max-h-[70vh] sm:max-h-[65vh] overflow-y-auto overflow-x-hidden shadow-lg max-w-full min-w-0 w-full"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            onScroll={() => {
              setPreviewProduct(null);
              setPreviewAnchor(null);
            }}
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-50/60 to-white border-b border-primary-100 rounded-t-xl px-4 py-3 flex items-center justify-between min-h-[52px]">
              <p className="text-base font-bold text-gray-800 flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 text-white flex items-center justify-center shadow-sm"><TrendingUp className="w-5 h-5" aria-hidden /></span>
                Javaslatok és találatok
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Keresőpanel bezárása"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {displayedTopProducts.length > 0 && (
              <div className="px-4 py-4 border-b border-primary-100/80 bg-gradient-to-b from-primary-50/40 to-white w-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="inline-flex items-center gap-2 text-base font-bold text-gray-800">
                    <TrendingUp className="w-5 h-5 text-primary-600" aria-hidden />
                    {trimmedQuery.length < 2 ? 'Ajánlott indulásnak' : 'Legjobb találatok'}
                  </p>
                  <span className="text-sm text-gray-500 tabular-nums">{displayedTopProducts.length} db</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
                  {displayedTopProducts.map((p, index) => {
                    const badge = getTopBadge(p, index);
                    return (
                      <div
                        key={p.id || p.name}
                        data-product-id={p.id || p.name}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (previewProduct?.id === p.id || previewProduct?.name === p.name) {
                            setPreviewProduct(null);
                            setPreviewAnchor(null);
                            return;
                          }
                          handlePreviewProductClick(p);
                        }}
                        onMouseMove={(e) => handleCardMouseMove(e, p.id || p.name)}
                        onMouseLeave={() => setHoverCard({ id: null, rx: 0, ry: 0 })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handlePreviewProductClick(p);
                          }
                        }}
                        className="min-w-[140px] xs:min-w-[160px] sm:min-w-[200px] lg:min-w-[220px] snap-start text-left rounded-xl border-2 border-primary-100 bg-white hover:border-primary-300 hover:shadow-lg transition-all p-3 touch-manipulation active:scale-[0.98]"
                        style={hoverCard.id === String(p.id || p.name)
                          ? { transform: `perspective(900px) rotateX(${hoverCard.rx}deg) rotateY(${hoverCard.ry}deg) translateY(-2px)` }
                          : undefined}
                      >
                        <div
                          className="relative w-full h-24 sm:h-28 rounded-lg bg-gray-100 overflow-hidden mb-2 flex items-center justify-center"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setPreviewProduct(p);
                            setPreviewAnchor(rect);
                          }}
                          onMouseLeave={() => {
                            setPreviewProduct(null);
                            setPreviewAnchor(null);
                          }}
                          onTouchStart={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            longPressTimerRef.current = setTimeout(() => {
                              longPressTimerRef.current = null;
                              setPreviewProduct(p);
                              setPreviewAnchor(rect);
                            }, LONG_PRESS_MS);
                          }}
                          onTouchEnd={() => {
                            if (longPressTimerRef.current) {
                              clearTimeout(longPressTimerRef.current);
                              longPressTimerRef.current = null;
                            }
                          }}
                        >
                          {getProductImage(p) ? <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Package className="w-5 h-5 text-gray-400" aria-hidden />}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${badge.classes}`}>
                          <Award className="w-3.5 h-3.5" aria-hidden />
                          {badge.text}
                        </div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-2 mt-1.5 min-h-[2.2rem]">{p.name}</p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <p className="text-sm text-primary-600 font-semibold">{formatPrice(p.salePrice || p.price)}</p>
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
                            <Plus className="w-3.5 h-3.5" aria-hidden />
                            Összevetés
                          </button>
                          <span className="text-xs text-primary-600 font-medium">QuickView</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {suggestions.length > 0 ? (
              <div className="px-4 py-4 space-y-4 bg-gradient-to-b from-secondary-50/40 to-white w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.slice(0, 6).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applySuggestion(s.text || s.query || '', { submit: true, source: 'suggestion' })}
                      className="text-left px-4 py-3 rounded-xl border-2 border-secondary-200/80 bg-white hover:border-secondary-400 hover:bg-secondary-50/80 transition-colors min-h-[48px] touch-manipulation"
                    >
                      <p className="text-base font-semibold text-gray-800 truncate">{s.text || s.query}</p>
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary-800/90 mb-2">Gyorstalálatok</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {quickHitSuggestions.slice(0, 6).map((item) => (
                      <button
                        key={`dyn-${item.text}`}
                        type="button"
                        onClick={() => applySuggestion(item.text, { submit: true, source: 'quick-hit' })}
                        className="px-3 py-2 rounded-lg border-2 border-secondary-200 bg-secondary-50 text-secondary-800 text-sm font-semibold hover:bg-secondary-100 hover:border-secondary-300 transition-colors inline-flex items-center gap-1.5 touch-manipulation min-h-[40px]"
                      >
                        <span>{item.text}</span>
                        <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${item.badge.classes}`}>{item.badge.label}</span>
                      </button>
                    ))}
                  </div>
                  {(historyGrouped.today.length > 0 || historyGrouped.earlier.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {[...historyGrouped.today, ...historyGrouped.earlier].slice(0, 2).map((item) => {
                        const q = item.q || item;
                        return (
                          <button
                            key={`journey-inline-${q}`}
                            type="button"
                            onClick={() => applySuggestion(q, { submit: true, source: 'journey' })}
                            className="px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-600 text-[11px] hover:bg-gray-50 transition-colors"
                          >
                            Gyors újrafuttatás: {q}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 w-full">
                <div className="flex flex-wrap gap-2">
                  {quickHitSuggestions.map((item) => (
                    <button
                      key={item.text}
                      type="button"
                      onClick={() => applySuggestion(item.text, { submit: true, source: 'quick-hit' })}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{item.text}</span>
                      <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${item.badge.classes}`}>{item.badge.label}</span>
                    </button>
                  ))}
                </div>
                {hasNoResults && rescueSuggestions.length > 0 && (
                  <div className="rounded-xl border-2 border-primary-200 bg-gradient-to-br from-primary-50/80 to-white px-4 py-3">
                    <p className="text-base font-semibold text-gray-700 mb-2">Nincs találat. Próbáld inkább:</p>
                    <div className="flex flex-wrap gap-2">
                      {rescueSuggestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => applySuggestion(q, { submit: true, source: 'rescue' })}
                          className="px-3 py-2 rounded-lg border-2 border-primary-200 bg-white text-primary-800 text-sm font-semibold hover:bg-primary-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={onTryAI}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-600 text-white text-sm font-semibold hover:bg-secondary-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" aria-hidden />
                      Képalapú keresés
                    </button>
                  </div>
                )}
              </div>
            )}

            {compareProducts.length > 0 && (
              <div className="sticky bottom-0 z-10 border-t-2 border-secondary-200/90 bg-gradient-to-b from-secondary-50/95 to-secondary-50 px-4 py-3 rounded-b-xl backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-secondary-900">Összevető tálca</p>
                  {compareProducts.map((p) => (
                    <span key={`cmp-${p.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium">
                      {p.name}
                      <button
                        type="button"
                        onClick={() => toggleCompareProduct(p)}
                        className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                        aria-label="Termék eltávolítása összevetésből"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={runCompareSearch}
                    disabled={compareProducts.length < 2}
                    className="ml-auto min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] transition-all"
                  >
                    Összehasonlítás
                  </button>
                </div>
              </div>
            )}

            {/* Előnézet tooltip (hover / long-press) */}
            {previewProduct && previewAnchor && (
              <div
                className="fixed z-[100] rounded-xl border-2 border-primary-200 bg-white shadow-xl p-3 w-[200px] sm:w-[220px] pointer-events-none"
                style={{
                  left: Math.max(8, Math.min(previewAnchor.left, typeof window !== 'undefined' ? window.innerWidth - 220 : previewAnchor.left)),
                  top: previewAnchor.top - 8,
                  transform: 'translateY(-100%)',
                }}
              >
                <div className="h-24 rounded-lg bg-gray-100 overflow-hidden mb-2 flex items-center justify-center">
                  {getProductImage(previewProduct) ? (
                    <img src={getProductImage(previewProduct)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" aria-hidden />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{previewProduct.name}</p>
                <p className="text-sm text-primary-600 font-semibold mt-1">{formatPrice(previewProduct.salePrice || previewProduct.price)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Kattints a részletekhez</p>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </section>
  );
}

