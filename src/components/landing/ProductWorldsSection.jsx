import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Heart,
  Package,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  ChevronsLeftRight,
} from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { getStockLevel } from '../../utils/helpers';
import {
  getLikedProducts,
  getViewedProducts,
  getPersonalizedRecommendations,
  getSimilarProducts,
  getPreferenceSignals,
  trackSectionEvent,
} from '../../services/userPreferencesService';
import ProductCarousel from '../ui/ProductCarousel';

const POOL_SIZE = 450;
const PAGE_SIZE = 12;
const DEDUPE_EXCLUDE_NEW = 50;
const DEDUPE_EXCLUDE_POPULAR = 40;

const toTimestamp = (value) => {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
};

const sliceWrap = (items, start, size) => {
  if (items.length <= size) return items;
  const end = start + size;
  if (end <= items.length) return items.slice(start, end);
  const first = items.slice(start);
  const rest = items.slice(0, end - items.length);
  return [...first, ...rest];
};

/** Egyszerű seeded hash - determinisztikus shuffle-hez */
function seededHash(str, seed) {
  let h = seed;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h / 4294967296;
}

/** Kedvencek: személyre szabott (getPersonalizedRecommendations), liked + hasonlók, excludeIds */
function buildFavoritesPool(products, seed, excludeIds = []) {
  if (!products.length) return [];
  const exclude = new Set(excludeIds);
  const likedIds = getLikedProducts();
  const viewed = getViewedProducts(40);
  const viewedIds = new Set(viewed.map((p) => p.id));
  const ids = new Set();
  const result = [];
  const inStock = (arr) => arr.filter((p) => (p.inStock ?? p.in_stock ?? true) && !exclude.has(p.id) && !ids.has(p.id));
  const addUnique = (arr) => {
    arr.forEach((p) => {
      if (p?.id && !ids.has(p.id) && !exclude.has(p.id)) {
        ids.add(p.id);
        result.push(p);
      }
    });
  };
  addUnique(inStock(products.filter((p) => likedIds.includes(p.id))));
  viewed.forEach((p) => {
    const full = products.find((x) => x.id === p.id);
    if (full && !ids.has(full.id)) addUnique([full]);
  });
  viewed.slice(0, 6).forEach((p) => {
    const full = products.find((x) => x.id === p.id);
    if (full && full.id) {
      const similar = getSimilarProducts(full, products, 10);
      addUnique(inStock(similar));
    }
  });
  const personalized = getPersonalizedRecommendations(products, POOL_SIZE);
  addUnique(inStock(personalized));
  const rest = products.filter((p) => !ids.has(p.id) && !exclude.has(p.id) && (p.inStock ?? p.in_stock ?? true));
  const withSale = rest.filter((p) => p.salePrice && p.price > p.salePrice);
  const withoutSale = rest.filter((p) => !(p.salePrice && p.price > p.salePrice));
  const restSorted = [...withSale, ...withoutSale].sort((a, b) => {
    const ha = seededHash(String(a.id), seed);
    const hb = seededHash(String(b.id), seed);
    return ha - hb;
  });
  addUnique(restSorted);
  return result.slice(0, POOL_SIZE);
}

/** Friss: updated_at DESC, max POOL_SIZE */
function buildNewArrivalsPool(products) {
  if (!products.length) return [];
  const inStock = products.filter((p) => p.inStock ?? p.in_stock ?? true);
  const sorted = [...inStock].sort((a, b) => {
    const timeA = toTimestamp(a.updated_at || a.updatedAt || a.created_at || a.createdAt || a.last_synced_at);
    const timeB = toTimestamp(b.updated_at || b.updatedAt || b.created_at || b.createdAt || b.last_synced_at);
    if (timeA !== timeB) return timeB - timeA;
    const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
    const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
    return idB - idA;
  });
  return sorted.slice(0, POOL_SIZE);
}

/** Popular: getPersonalizedRecommendations blend + liked/viewed, akciós elöl, excludeIds */
function buildPopularPool(products, excludeIds = []) {
  if (!products.length) return [];
  const exclude = new Set(excludeIds);
  const inStock = products.filter((p) => (p.inStock ?? p.in_stock ?? true) && !exclude.has(p.id));
  const likedIds = getLikedProducts();
  const viewed = getViewedProducts(50);
  const viewedIds = viewed.map((p) => p.id);
  const signals = getPreferenceSignals();
  const personalized = getPersonalizedRecommendations(inStock, Math.floor(POOL_SIZE * 0.5));
  const withDiscount = [...inStock]
    .filter((p) => p.salePrice && p.price > p.salePrice)
    .sort((a, b) => (b.price - (b.salePrice || 0)) - (a.price - (a.salePrice || 0)));
  const ids = new Set(withDiscount.map((p) => p.id));
  const rest = [...inStock]
    .filter((p) => !ids.has(p.id))
    .sort((a, b) => (b.price || 0) - (a.price || 0));
  const combined = [...withDiscount, ...rest];
  const categoryParts = (p) =>
    (p.category || '')
      .split('>')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);
  return combined
    .sort((a, b) => {
      const stockA = getStockLevel(a) ?? 0;
      const stockB = getStockLevel(b) ?? 0;
      let scoreA = (likedIds.includes(a.id) ? 10 : 0) + (viewedIds.includes(a.id) ? 5 : 0) + Math.min(stockA, 20) * 0.1;
      let scoreB = (likedIds.includes(b.id) ? 10 : 0) + (viewedIds.includes(b.id) ? 5 : 0) + Math.min(stockB, 20) * 0.1;
      categoryParts(a).forEach((cat) => { scoreA += (signals.categories?.[cat] || 0) * 0.5; });
      categoryParts(b).forEach((cat) => { scoreB += (signals.categories?.[cat] || 0) * 0.5; });
      if (personalized.some((p) => p.id === a.id)) scoreA += 3;
      if (personalized.some((p) => p.id === b.id)) scoreB += 3;
      return scoreB - scoreA;
    })
    .slice(0, POOL_SIZE);
}

const WORLDS = [
  {
    id: 'favorites',
    title: 'Vásárlóink kedvencei',
    subtitle: 'A legjobbra értékelt és legtöbbet választott bútorok',
    Icon: Heart,
    accentClass: 'from-pink-500 to-rose-600',
    eyebrow: 'Közösségi kedvencek',
    badge: 'Közönségkedvenc',
    className: 'border border-rose-100 shadow-sm section-header-hero section-header-hero--favorites',
    tone: 'favorites',
    sectionId: 'customer-favorites',
    metaLabel: 'Összesen',
  },
  {
    id: 'new',
    title: 'Friss beérkezés',
    subtitle: 'A legújabb termékeink, folyamatosan frissítve',
    Icon: Package,
    accentClass: 'from-primary-500 to-secondary-600',
    eyebrow: 'Újdonság',
    badge: 'Újdonságok',
    className: 'border border-primary-100 shadow-sm section-header-hero section-header-hero--new',
    tone: 'new',
    sectionId: 'new-arrivals',
    metaLabel: 'Összesen',
  },
  {
    id: 'popular',
    title: 'Legnépszerűbb',
    subtitle: 'A vásárlók kedvencei és a legjobb ajánlatok',
    Icon: TrendingUp,
    accentClass: 'from-amber-500 to-orange-600',
    eyebrow: 'Felfedezés',
    badge: null,
    className: 'border border-amber-100 shadow-sm section-header-hero section-header-hero--popular',
    tone: 'popular',
    sectionId: 'most-popular',
    metaLabel: 'Raktáron',
  },
];

export default function ProductWorldsSection({
  products = [],
  onProductClick,
  onToggleWishlist,
  wishlist = [],
  onViewAll,
  onAddToCart,
  contextLabel = '',
  rotationTick,
}) {
  const [activeWorld, setActiveWorld] = useState('favorites');
  const [favoritesSeed, setFavoritesSeed] = useState(() => Math.floor(Date.now() / 10000));
  const [favoritesPage, setFavoritesPage] = useState(0);
  const [newPage, setNewPage] = useState(0);
  const [popularPage, setPopularPage] = useState(0);
  const [popularPeriod, setPopularPeriod] = useState('weekly');
  const [isInteracting, setIsInteracting] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const sectionRef = useRef(null);
  const tabSwipeRef = useRef(null);
  const tabSwipeStartX = useRef(0);

  const handleTabSwipeStart = (e) => {
    tabSwipeStartX.current = e.touches?.[0]?.clientX ?? 0;
  };

  const handleTabSwipeEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? 0;
    const diff = tabSwipeStartX.current - endX;
    if (Math.abs(diff) > 60) {
      const idx = WORLDS.findIndex((w) => w.id === activeWorld);
      if (diff > 0 && idx < WORLDS.length - 1) setActiveWorld(WORLDS[idx + 1].id);
      else if (diff < 0 && idx > 0) setActiveWorld(WORLDS[idx - 1].id);
    }
  };

  const newArrivalsPool = useMemo(() => buildNewArrivalsPool(products), [products]);
  const newExcludeIds = useMemo(
    () => newArrivalsPool.slice(0, DEDUPE_EXCLUDE_NEW).map((p) => p.id),
    [newArrivalsPool]
  );
  const popularFull = useMemo(
    () => buildPopularPool(products, newExcludeIds),
    [products, newExcludeIds]
  );
  const popularExcludeIds = useMemo(
    () => popularFull.slice(0, DEDUPE_EXCLUDE_POPULAR).map((p) => p.id),
    [popularFull]
  );
  const favoritesExcludeIds = useMemo(
    () => [...newExcludeIds, ...popularExcludeIds],
    [newExcludeIds, popularExcludeIds]
  );
  const favoritesPool = useMemo(
    () => buildFavoritesPool(products, favoritesSeed, favoritesExcludeIds),
    [products, favoritesSeed, favoritesExcludeIds]
  );
  const popularWeekly = useMemo(() => popularFull.slice(0, Math.floor(POOL_SIZE / 2)), [popularFull]);
  const popularMonthly = useMemo(
    () =>
      popularFull.slice(Math.floor(POOL_SIZE / 2)).length > 0
        ? popularFull.slice(Math.floor(POOL_SIZE / 2))
        : popularFull,
    [popularFull]
  );
  const popularPool = popularPeriod === 'weekly' ? popularWeekly : popularMonthly;

  const favoritesVisible = useMemo(() => {
    const start = (favoritesPage * PAGE_SIZE) % Math.max(1, favoritesPool.length);
    return sliceWrap(favoritesPool, start, PAGE_SIZE);
  }, [favoritesPool, favoritesPage]);

  const newVisible = useMemo(() => {
    const start = (newPage * PAGE_SIZE) % Math.max(1, newArrivalsPool.length);
    return sliceWrap(newArrivalsPool, start, PAGE_SIZE);
  }, [newArrivalsPool, newPage]);

  const popularVisible = useMemo(() => {
    const start = (popularPage * PAGE_SIZE) % Math.max(1, popularPool.length);
    return sliceWrap(popularPool, start, PAGE_SIZE);
  }, [popularPool, popularPage]);

  const saleCount = useMemo(
    () => popularFull.filter((p) => p.salePrice && p.price > p.salePrice).length,
    [popularFull]
  );

  useEffect(() => {
    trackSectionEvent('product-worlds', 'section_impression');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (!sectionRef.current || !(sectionRef.current instanceof Element)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    try {
      observer.observe(sectionRef.current);
    } catch {
      return;
    }
    return () => observer.disconnect();
  }, []);

  const currentWorld = WORLDS.find((w) => w.id === activeWorld);
  const visibleProducts =
    activeWorld === 'favorites'
      ? favoritesVisible
      : activeWorld === 'new'
        ? newVisible
        : popularVisible;
  const poolLength =
    activeWorld === 'favorites'
      ? favoritesPool.length
      : activeWorld === 'new'
        ? newArrivalsPool.length
        : popularPool.length;
  const totalPool =
    activeWorld === 'favorites'
      ? favoritesPool.length
      : activeWorld === 'new'
        ? newArrivalsPool.length
        : popularFull.length;

  if (products.length === 0) return null;

  const renderActions = () => {
    if (activeWorld === 'favorites') {
      return (
        <button
          type="button"
          onClick={() => {
            setFavoritesSeed((s) => s + 1);
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors text-sm font-semibold min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          Frissítem
        </button>
      );
    }
    if (activeWorld === 'new') {
      return (
        <>
          <button
            type="button"
            onClick={() => setNewPage((p) => p + 1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-primary-700 bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors text-sm font-semibold min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Következő
          </button>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg px-3 py-2 min-h-[44px]"
            >
              Összes megtekintése <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </>
      );
    }
    return (
      <>
        <div className="inline-flex items-center rounded-full bg-white border border-gray-100 shadow-sm p-1">
          {[
            { id: 'weekly', label: 'Heti kedvencek' },
            { id: 'monthly', label: 'Havi toplista' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPopularPeriod(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${
                popularPeriod === item.id
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPopularPage((p) => p + 1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors text-sm font-semibold min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          Új válogatás
        </button>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg px-3 py-2 min-h-[44px]"
          >
            Összes megtekintése <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </>
    );
  };

  const metaText =
    activeWorld === 'popular'
      ? `Raktáron: ${totalPool.toLocaleString('hu-HU')} • Összesen: ${popularFull.length.toLocaleString('hu-HU')}`
      : `${currentWorld.metaLabel}: ${totalPool.toLocaleString('hu-HU')} termék`;

  const badgeText =
    activeWorld === 'popular'
      ? saleCount > 0
        ? `${saleCount} akciós termék`
        : 'Prémium válogatás'
      : currentWorld.badge;

  const sectionBgClass = {
    favorites: 'bg-gradient-to-br from-rose-100/60 via-white to-pink-100/50',
    new: 'bg-gradient-to-br from-primary-100/50 via-white to-secondary-100/40',
    popular: 'bg-gradient-to-br from-amber-100/60 via-white to-orange-100/50',
  }[activeWorld];

  return (
    <section
      ref={sectionRef}
      className={`section-shell section-world section-world--${activeWorld} py-12 sm:py-14 lg:py-20 overflow-hidden w-full transition-colors duration-500 ${sectionBgClass}`}
      aria-labelledby={`${activeWorld}-heading`}
      aria-label="Termék világok"
      role="region"
      data-section="product-worlds"
    >
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Tab bar – swipe a fejlécen, rövid cím mobilon, swipe jelzés */}
        <div
          className="flex justify-center mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4"
          role="tablist"
          aria-label="Válassz világot"
        >
          <div
            ref={tabSwipeRef}
            onTouchStart={handleTabSwipeStart}
            onTouchEnd={handleTabSwipeEnd}
            className="flex w-full max-w-2xl sm:w-auto sm:inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex flex-1 sm:flex-initial rounded-2xl bg-white/95 backdrop-blur-sm border-2 border-gray-200/80 shadow-xl shadow-gray-300/40 p-2 sm:p-2.5 gap-2">
              {WORLDS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="tab"
                  aria-selected={activeWorld === w.id}
                  aria-controls={`panel-${w.id}`}
                  id={`tab-${w.id}`}
                  onClick={() => setActiveWorld(w.id)}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 min-h-[48px] sm:min-h-[52px] whitespace-nowrap ${
                    activeWorld === w.id
                      ? `bg-gradient-to-r ${w.accentClass} text-white shadow-lg`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <w.Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden />
                  <span className="truncate">
                    {w.id === 'favorites' ? 'Kedvencek' : w.id === 'new' ? 'Friss' : (
                      <>
                        <span className="sm:hidden">Népszerű</span>
                        <span className="hidden sm:inline">Legnépszerűbb</span>
                      </>
                    )}
                  </span>
                </button>
              ))}
            </div>
            {/* Swipe jelzés – csak mobilon */}
            <div className="sm:hidden flex items-center justify-center gap-1.5 py-2 text-gray-500 text-xs font-medium">
              <ChevronsLeftRight className="w-4 h-4" aria-hidden />
              <span>Pörgethető</span>
            </div>
          </div>
        </div>

        {/* Hero fejléc – full-bleed, dramatikus, erősebb színek */}
        <div className={`relative overflow-hidden px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14 rounded-2xl lg:rounded-3xl border-2 ${currentWorld.className} transition-all duration-500`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/60 to-transparent pointer-events-none" />
          {/* WoW: erősebb dekoratív gradient a sarkokban */}
          <div className={`absolute -top-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br ${currentWorld.accentClass} opacity-[0.12] blur-3xl pointer-events-none`} aria-hidden />
          <div className={`absolute -bottom-8 -left-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr ${currentWorld.accentClass} opacity-[0.08] blur-2xl pointer-events-none`} aria-hidden />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4 min-w-0">
                <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/95 backdrop-blur border-2 border-gray-200/90 text-gray-800 text-xs sm:text-sm font-black tracking-wide shadow-md uppercase">
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r ${currentWorld.accentClass} shrink-0`} />
                  <span className="truncate">{currentWorld.eyebrow}</span>
                </span>
                <h2
                  id={`${activeWorld}-heading`}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.15] tracking-tight text-gray-900 break-words"
                >
                  {currentWorld.title}
                </h2>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-2xl font-semibold">
                  {currentWorld.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                  {badgeText && (
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/95 border-2 border-gray-200/90 text-gray-800 text-xs sm:text-sm font-bold shadow-sm">
                      <currentWorld.Icon className="w-4 h-4 sm:w-5 sm:h-5 opacity-80 shrink-0" />
                      {badgeText}
                    </span>
                  )}
                  {contextLabel && (
                    <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/95 border-2 border-gray-200/90 text-gray-800 text-xs sm:text-sm font-bold shadow-sm max-w-[160px] sm:max-w-none truncate">
                      {contextLabel}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-medium text-gray-500 truncate">{metaText}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">{renderActions()}</div>
            </div>
          </div>
        </div>

        <div
          id={`panel-${activeWorld}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeWorld}`}
          className="product-worlds-content mt-8 lg:mt-10 px-0 sm:px-2 transition-opacity duration-300 touch-pan-y"
          key={activeWorld}
        >
            {visibleProducts.length > 0 ? (
              <ProductCarousel
                className="mt-2 -mx-4 sm:mx-0 pl-4 sm:pl-0 pr-4 sm:pr-0"
                autoScroll={false}
                onInteractionChange={setIsInteracting}
                cardSize="large"
              >
                {visibleProducts.map((product, index) => {
                  const stockLevel = getStockLevel(product);
                  const highlightBadge =
                    stockLevel !== null && stockLevel <= 3 ? `Utolsó ${stockLevel} db` : '';
                  return (
                    <div
                      key={product.id}
                      className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ring-1 ring-gray-200/80 hover:ring-gray-300`}
                      style={{ transitionDelay: `${Math.min(index * 30, 300)}ms` }}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-2.5 sm:h-3 bg-gradient-to-r ${currentWorld.accentClass} opacity-90`} aria-hidden />
                      <EnhancedProductCard
                        product={product}
                        onToggleWishlist={onToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                        onQuickView={onProductClick}
                        onAddToCart={onAddToCart || (() => {})}
                        index={index}
                        highlightBadge={highlightBadge}
                        sectionId={currentWorld.sectionId}
                        showFeedback
                        size="default"
                        tone={currentWorld.tone}
                      />
                    </div>
                  );
                })}
              </ProductCarousel>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-inner">
                <currentWorld.Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nincs elég adat</p>
                <p className="text-gray-400 text-sm">Térj vissza később vagy frissítsd az oldalt.</p>
              </div>
            )}

            {visibleProducts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                {activeWorld === 'favorites' && (
                  <span>Kedvenceid és megtekintéseid alapján személyre szabott válogatás.</span>
                )}
                {activeWorld === 'new' && (
                  <span>Legfrissebb termékek a backend adataiból.</span>
                )}
                {activeWorld === 'popular' && (
                  <span>Kedvelések, megtekintések és akciós ajánlatok alapján.</span>
                )}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
