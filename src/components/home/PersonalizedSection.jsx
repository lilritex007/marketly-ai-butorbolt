import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { getViewedProducts, getPersonalizedRecommendations, getStyleDNA } from '../../services/userPreferencesService';
import SectionHeader from '../landing/SectionHeader';
import { EnhancedProductCard } from '../product/EnhancedProductCard';

/**
 * PersonalizedSection - Személyre szabott főoldal szekciók
 * Recently Viewed + For You + Trending
 */
const PersonalizedSection = ({ 
  products, 
  onProductClick, 
  onToggleWishlist, 
  wishlist = [],
  contextLabel = ''
}) => {
  const [activeTab, setActiveTab] = useState('foryou');
  const [refreshKey, setRefreshKey] = useState(0);
  // User adatok
  const recentlyViewed = useMemo(() => getViewedProducts(12), []);
  const styleDNA = useMemo(() => getStyleDNA(), []);
  
  // Személyre szabott ajánlások
  const forYouProducts = useMemo(() => {
    if (!products?.length) return [];
    const base = getPersonalizedRecommendations(products, 12);
    return [...base].sort(() => (refreshKey % 2 === 0 ? 1 : -1) * (Math.random() - 0.5));
  }, [products, refreshKey]);
  
  // Trending - top árkategória, random mix
  const trendingProducts = useMemo(() => {
    if (!products?.length) return [];
    return products
      .filter(p => (p.salePrice || p.price) > 50000)
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  }, [products, refreshKey]);

  const tabs = [
    { id: 'foryou', label: 'Neked ajánljuk', icon: Sparkles, products: forYouProducts },
    { id: 'recent', label: 'Nemrég nézted', icon: Clock, products: recentlyViewed },
    { id: 'trending', label: 'Trendi most', icon: TrendingUp, products: trendingProducts },
  ];

  const currentProducts = tabs.find(t => t.id === activeTab)?.products || [];
  const visibleProducts = currentProducts.slice(0, 12);

  // Ha nincs elég adat, ne jelenjen meg
  if (currentProducts.length < 2 && forYouProducts.length < 2) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-white to-primary-50/40 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          id="personalized-heading"
          title="Személyre szabva neked"
          subtitle={styleDNA?.styleDNA ? styleDNA.styleDNA.split('.')[0] : 'AI ajánlások a böngészésed alapján'}
          Icon={Sparkles}
          accentClass="from-primary-500 to-secondary-700"
          badge="AI ajánlás"
          contextLabel={contextLabel}
          meta={`Megjelenítve: ${currentProducts.length} termék`}
          actions={
            <button
              onClick={() => setRefreshKey((v) => v + 1)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-primary-700 bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors text-sm font-semibold min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              Frissítem
            </button>
          }
        />

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

        <div className="product-grid">
          {visibleProducts.map((product, index) => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
              onQuickView={onProductClick}
              index={index}
            />
          ))}
        </div>

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
