import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Clock, TrendingUp, RefreshCw, ShoppingCart, Info } from 'lucide-react';
import { getViewedProducts, getPersonalizedRecommendations, getStyleDNA, getTopCategories, getSearchHistory, getSimilarProducts } from '../../services/userPreferencesService';
import SectionHeader from '../landing/SectionHeader';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { getStockLevel } from '../../utils/helpers';

/**
 * PersonalizedSection - Személyre szabott főoldal szekciók
 * Recently Viewed + For You + Trending
 */
const PersonalizedSection = ({ 
  products, 
  onProductClick, 
  onToggleWishlist, 
  wishlist = [],
  contextLabel = '',
  cartItems = []
}) => {
  const [activeTab, setActiveTab] = useState('foryou');
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewSize, setViewSize] = useState(12);
  const [focusCategory, setFocusCategory] = useState('');
  // User adatok
  const recentlyViewed = useMemo(() => getViewedProducts(12).filter((p) => (p.inStock ?? p.in_stock ?? true)), []);
  const styleDNA = useMemo(() => getStyleDNA(), []);
  const topCategories = useMemo(() => getTopCategories(6), []);
  const searchHistory = useMemo(() => getSearchHistory(6), []);
  
  // Személyre szabott ajánlások
  const forYouProducts = useMemo(() => {
    if (!products?.length) return [];
    const base = getPersonalizedRecommendations(products, 12).filter((p) => (p.inStock ?? p.in_stock ?? true));
    return [...base].sort(() => (refreshKey % 2 === 0 ? 1 : -1) * (Math.random() - 0.5));
  }, [products, refreshKey]);
  
  // Trending - top árkategória, random mix
  const trendingProducts = useMemo(() => {
    if (!products?.length) return [];
    return products
      .filter(p => (p.inStock ?? p.in_stock ?? true))
      .filter(p => (p.salePrice || p.price) > 50000)
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  }, [products, refreshKey]);

  const cartBasedProducts = useMemo(() => {
    if (!products?.length) return [];
    const base = Array.isArray(cartItems) && cartItems.length > 0 ? cartItems : recentlyViewed;
    if (!base || base.length === 0) return [];
    const merged = new Map();
    base.forEach((p) => {
      const similar = getSimilarProducts(p, products, 8);
      similar.forEach((item) => {
        if (item && item.id && (item.inStock ?? item.in_stock ?? true)) merged.set(item.id, item);
      });
    });
    return Array.from(merged.values()).slice(0, 24);
  }, [products, cartItems, recentlyViewed]);

  const tabs = [
    { id: 'foryou', label: 'Neked ajánljuk', icon: Sparkles, products: forYouProducts },
    { id: 'recent', label: 'Nemrég nézted', icon: Clock, products: recentlyViewed },
    { id: 'trending', label: 'Trendi most', icon: TrendingUp, products: trendingProducts },
    { id: 'cart', label: 'Hasonló a kosaradhoz', icon: ShoppingCart, products: cartBasedProducts },
  ];

  const currentProductsRaw = tabs.find(t => t.id === activeTab)?.products || [];
  const currentProducts = focusCategory
    ? currentProductsRaw.filter((p) => (p.category || '').toLowerCase().includes(focusCategory.toLowerCase()))
    : currentProductsRaw;
  const visibleProducts = currentProducts.slice(0, Math.max(12, viewSize));
  const inStockCount = useMemo(
    () => currentProducts.filter((p) => (p.inStock ?? p.in_stock ?? true)).length,
    [currentProducts]
  );

  const fallbackCategories = useMemo(() => {
    if (topCategories.length > 0) return topCategories;
    const counts = new Map();
    products.forEach((p) => {
      if (p?.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);
  }, [topCategories, products]);

  const buildRecommendationReasons = (product) => {
    if (!product) return [];
    const reasons = [];
    const category = product.category || '';
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      const cartCategories = cartItems.map((p) => p.category || '').filter(Boolean);
      if (cartCategories.some((c) => category.toLowerCase().includes(c.toLowerCase()))) {
        reasons.push('Hasonló a kosaradhoz');
      }
    } else if (recentlyViewed.length > 0) {
      const viewedCats = recentlyViewed.map((p) => p.category || '').filter(Boolean);
      if (viewedCats.some((c) => category.toLowerCase().includes(c.toLowerCase()))) {
        reasons.push('Hasonló a korábban nézett termékeidhez');
      }
    }
    if (topCategories.some((c) => category.toLowerCase().includes(c.toLowerCase()))) {
      reasons.push(`Kedvelt kategória: ${category}`);
    }
    if (searchHistory.length > 0) {
      const term = searchHistory.find((s) => {
        const q = (s.query || '').toLowerCase();
        const text = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
        return q && text.includes(q);
      });
      if (term?.query) reasons.push(`Korábbi keresés: “${term.query}”`);
    }
    if (styleDNA?.answers) {
      const { space, room } = styleDNA.answers;
      const text = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
      const styleKeywords = {
        modern: ['modern', 'minimalista', 'letisztult'],
        scandinavian: ['skandináv', 'natúr', 'világos', 'fehér'],
        industrial: ['indusztriális', 'loft', 'fém', 'ipari'],
        vintage: ['vintage', 'retro', 'antik'],
        bohemian: ['bohém', 'színes', 'mintás'],
      };
      if (space && styleKeywords[space] && styleKeywords[space].some((kw) => text.includes(kw))) {
        reasons.push(`Stílus illeszkedés: ${space}`);
      }
      const roomKeywords = {
        living: ['kanapé', 'fotel', 'dohányzó', 'tv', 'nappali'],
        bedroom: ['ágy', 'matrac', 'éjjeli', 'hálószoba'],
        dining: ['étkező', 'asztal', 'szék'],
        office: ['íróasztal', 'iroda', 'forgószék'],
      };
      if (room && roomKeywords[room] && roomKeywords[room].some((kw) => text.includes(kw))) {
        reasons.push(`Szoba típusa: ${room}`);
      }
    }
    return reasons.slice(0, 2);
  };

  // Ha nincs elég adat, ne jelenjen meg
  if (currentProducts.length < 2 && forYouProducts.length < 2) {
    return null;
  }

  return (
    <section className="relative py-10 sm:py-14 lg:py-20 bg-gradient-to-b from-white via-white to-primary-50/40 border-t border-gray-100 overflow-hidden">
      <div className="absolute -top-20 -right-16 w-72 h-72 bg-primary-200/30 blur-3xl rounded-full" aria-hidden />
      <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-secondary-200/30 blur-3xl rounded-full" aria-hidden />
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <SectionHeader
          id="personalized-heading"
          title="Személyre szabva neked"
          subtitle={styleDNA?.styleDNA ? styleDNA.styleDNA.split('.')[0] : 'AI ajánlások a böngészésed alapján'}
          Icon={Sparkles}
          accentClass="from-primary-500 to-secondary-700"
          eyebrow="Neked szól"
          badge={styleDNA?.styleDNA ? 'Style DNA aktív' : 'AI ajánlás'}
          contextLabel={contextLabel}
          meta={`Megjelenítve: ${Math.min(visibleProducts.length, currentProducts.length)} / ${currentProducts.length} termék`}
          helpText="Csak készleten lévő termékek"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center rounded-full bg-white border border-gray-100 shadow-sm p-1">
                {[12, 24].map((size) => (
                  <button
                    key={size}
                    onClick={() => setViewSize(size)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${
                      viewSize === size
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {size} db
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRefreshKey((v) => v + 1)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-primary-700 bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors text-sm font-semibold min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                {refreshKey % 2 === 0 ? 'Hasonlókat kérek' : 'Frissítem'}
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="rounded-2xl bg-white/90 border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Neked ajánlott</p>
            <p className="text-lg font-bold text-gray-900">{forYouProducts.length.toLocaleString('hu-HU')} termék</p>
          </div>
          <div className="rounded-2xl bg-white/90 border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Nemrég nézted</p>
            <p className="text-lg font-bold text-gray-900">{recentlyViewed.length.toLocaleString('hu-HU')} termék</p>
          </div>
          <div className="rounded-2xl bg-white/90 border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Készleten</p>
            <p className="text-lg font-bold text-gray-900">{inStockCount.toLocaleString('hu-HU')} termék</p>
          </div>
        </div>

        {styleDNA?.styleDNA && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-primary-100 text-primary-700 text-xs font-semibold shadow-sm">
            <Info className="w-3.5 h-3.5" />
            Style DNA aktív – személyre szabott ajánlások
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.products?.length || 0;
            
            if (count === 0 && tab.id !== 'foryou') return null;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all border
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-lg border-primary-500' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow border-gray-100'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary-500'}`} />
                <span className="font-medium text-sm">{tab.label}</span>
                {count > 0 && (
                  <span className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'}
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {fallbackCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-gray-500 mr-1">Fókusz:</span>
            <button
              type="button"
              onClick={() => setFocusCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                focusCategory === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
              }`}
            >
              Összes
            </button>
            {fallbackCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFocusCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  focusCategory === cat ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="product-grid">
          {visibleProducts.map((product, index) => {
            const stockLevel = getStockLevel(product);
            const highlightBadge = stockLevel !== null && stockLevel <= 3 ? `Utolsó ${stockLevel} db` : '';
            return (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
                onQuickView={onProductClick}
                index={index}
                highlightBadge={highlightBadge}
                recommendationReasons={buildRecommendationReasons(product)}
              />
            );
          })}
        </div>

        {currentProducts.length > visibleProducts.length && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setViewSize((v) => Math.min(currentProducts.length, v + 12))}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors min-h-[48px]"
            >
              Több ajánlás
            </button>
          </div>
        )}

        {/* Empty state for recent */}
        {activeTab === 'recent' && currentProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-inner">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Még nem néztél meg termékeket</p>
            <p className="text-gray-400 text-sm">Böngéssz a kínálatban!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonalizedSection;
