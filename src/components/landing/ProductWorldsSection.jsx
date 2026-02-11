import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Heart,
  Package,
  TrendingUp,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { getStockLevel } from '../../utils/helpers';
import SectionHeader from './SectionHeader';
import {
  getLikedProducts,
  getViewedProducts,
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

/** Kedvencek: liked/viewed elöl (valós felhasználói adat), majd keverés, excludeIds hogy ne ismétlődjön */
function buildFavoritesPool(products, seed, excludeIds = []) {
  if (!products.length) return [];
  const exclude = new Set(excludeIds);
  const inStock = products.filter((p) => (p.inStock ?? p.in_stock ?? true) && !exclude.has(p.id));
  const likedIds = getLikedProducts();
  const viewed = getViewedProducts(30);
  const viewedIds = new Set(viewed.map((p) => p.id));
  const liked = inStock.filter((p) => likedIds.includes(p.id));
  const viewedOnly = inStock.filter((p) => viewedIds.has(p.id) && !likedIds.includes(p.id));
  const rest = inStock.filter((p) => !likedIds.includes(p.id) && !viewedIds.has(p.id));
  const withSale = rest.filter((p) => p.salePrice && p.price > p.salePrice);
  const withoutSale = rest.filter((p) => !(p.salePrice && p.price > p.salePrice));
  const restSorted = [...withSale, ...withoutSale].sort((a, b) => {
    const ha = seededHash(String(a.id), seed);
    const hb = seededHash(String(b.id), seed);
    return ha - hb;
  });
  const combined = [...liked, ...viewedOnly, ...restSorted];
  return combined.slice(0, POOL_SIZE);
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

/** Popular: liked/viewed (valós adat) erős súllyal, akciós elöl, excludeIds a Friss-ből */
function buildPopularPool(products, excludeIds = []) {
  if (!products.length) return [];
  const exclude = new Set(excludeIds);
  const inStock = products.filter((p) => (p.inStock ?? p.in_stock ?? true) && !exclude.has(p.id));
  const likedIds = getLikedProducts();
  const viewed = getViewedProducts(40);
  const viewedIds = viewed.map((p) => p.id);
  const withDiscount = [...inStock]
    .filter((p) => p.salePrice && p.price > p.salePrice)
    .sort((a, b) => (b.price - (b.salePrice || 0)) - (a.price - (a.salePrice || 0)));
  const ids = new Set(withDiscount.map((p) => p.id));
  const rest = [...inStock]
    .filter((p) => !ids.has(p.id))
    .sort((a, b) => (b.price || 0) - (a.price || 0));
  const combined = [...withDiscount, ...rest];
  return combined
    .sort((a, b) => {
      const stockA = getStockLevel(a) ?? 0;
      const stockB = getStockLevel(b) ?? 0;
      const scoreA = (likedIds.includes(a.id) ? 8 : 0) + (viewedIds.includes(a.id) ? 4 : 0) + Math.min(stockA, 20) * 0.1;
      const scoreB = (likedIds.includes(b.id) ? 8 : 0) + (viewedIds.includes(b.id) ? 4 : 0) + Math.min(stockB, 20) * 0.1;
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

  return (
    <section
      ref={sectionRef}
      className={`section-shell section-world section-world--${activeWorld} py-10 sm:py-12 lg:py-16 overflow-hidden`}
      aria-labelledby={`${activeWorld}-heading`}
      aria-label="Termék világok"
      role="region"
      data-section="product-worlds"
    >
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="section-frame">
          {/* Tab bar – világváltó */}
          <div
            className="flex justify-center mb-6 lg:mb-8"
            role="tablist"
            aria-label="Válassz világot"
          >
            <div className="flex w-full sm:w-auto sm:inline-flex rounded-2xl bg-white/90 border border-gray-200/80 shadow-sm p-1.5 gap-1">
              {WORLDS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="tab"
                  aria-selected={activeWorld === w.id}
                  aria-controls={`panel-${w.id}`}
                  id={`tab-${w.id}`}
                  onClick={() => setActiveWorld(w.id)}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                    activeWorld === w.id
                      ? `bg-gradient-to-r ${w.accentClass} text-white shadow-md`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <w.Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden />
                  <span>
                    {w.id === 'favorites' ? 'Kedvencek' : w.id === 'new' ? 'Friss' : 'Legnépszerűbb'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SectionHeader
            id={`${activeWorld}-heading`}
            title={currentWorld.title}
            subtitle={currentWorld.subtitle}
            Icon={currentWorld.Icon}
            accentClass={currentWorld.accentClass}
            eyebrow={currentWorld.eyebrow}
            badge={badgeText}
            contextLabel={contextLabel}
            prominent
            className={currentWorld.className}
            meta={metaText}
            helpText="Csak készleten lévő termékek"
            actions={<div className="flex flex-wrap items-center gap-2">{renderActions()}</div>}
          />

          <div
            id={`panel-${activeWorld}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeWorld}`}
            className="product-worlds-content transition-opacity duration-200"
          >
            {visibleProducts.length > 0 ? (
              <ProductCarousel
                className="mt-2"
                autoScroll={false}
                onInteractionChange={setIsInteracting}
              >
                {visibleProducts.map((product, index) => {
                  const stockLevel = getStockLevel(product);
                  const highlightBadge =
                    stockLevel !== null && stockLevel <= 3 ? `Utolsó ${stockLevel} db` : '';
                  return (
                    <EnhancedProductCard
                      key={product.id}
                      product={product}
                      onToggleWishlist={onToggleWishlist}
                      isWishlisted={wishlist.includes(product.id)}
                      onQuickView={onProductClick}
                      onAddToCart={onAddToCart || (() => {})}
                      index={index}
                      highlightBadge={highlightBadge}
                      sectionId={currentWorld.sectionId}
                      showFeedback
                      size="compact"
                      tone={currentWorld.tone}
                    />
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
      </div>
    </section>
  );
}
