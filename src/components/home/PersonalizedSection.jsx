import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Clock, Heart, TrendingUp, Eye, Star } from 'lucide-react';
import { getViewedProducts, getPersonalizedRecommendations, getLikedProducts, getStyleDNA } from '../../services/userPreferencesService';

/**
 * PersonalizedSection - Személyre szabott főoldal szekciók
 * Recently Viewed + For You + Trending
 */
const PersonalizedSection = ({ 
  products, 
  onProductClick, 
  onToggleWishlist, 
  wishlist = [] 
}) => {
  const [activeTab, setActiveTab] = useState('foryou');
  const scrollRef = useRef(null);
  
  // User adatok
  const recentlyViewed = useMemo(() => getViewedProducts(12), []);
  const likedProducts = useMemo(() => getLikedProducts(), []);
  const styleDNA = useMemo(() => getStyleDNA(), []);
  
  // Személyre szabott ajánlások
  const forYouProducts = useMemo(() => {
    if (!products?.length) return [];
    return getPersonalizedRecommendations(products, 12);
  }, [products]);
  
  // Trending - top árkategória, random mix
  const trendingProducts = useMemo(() => {
    if (!products?.length) return [];
    return products
      .filter(p => (p.salePrice || p.price) > 50000)
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  }, [products]);

  const tabs = [
    { id: 'foryou', label: 'Neked ajánljuk', icon: Sparkles, products: forYouProducts },
    { id: 'recent', label: 'Nemrég nézted', icon: Clock, products: recentlyViewed },
    { id: 'trending', label: 'Trendi most', icon: TrendingUp, products: trendingProducts },
  ];

  const currentProducts = tabs.find(t => t.id === activeTab)?.products || [];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatPrice = (price) => (price || 0).toLocaleString('hu-HU') + ' Ft';

  // Ha nincs elég adat, ne jelenjen meg
  if (currentProducts.length < 2 && forYouProducts.length < 2) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Style DNA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary-500" />
              Személyre szabva neked
            </h2>
            {styleDNA?.styleDNA && (
              <p className="text-gray-600 text-sm mt-1 max-w-md line-clamp-1">
                {styleDNA.styleDNA.split('.')[0]}
              </p>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

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
                  flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
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

        {/* Products Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {currentProducts.map((product, index) => {
              const isWishlisted = wishlist.includes(product.id);
              const isLiked = likedProducts.includes(product.id);
              const price = product.salePrice || product.price || 0;
              const viewedAt = product.viewedAt ? new Date(product.viewedAt) : null;
              
              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[250px] scroll-snap-align-start"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div 
                    onClick={() => onProductClick?.(product)}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {activeTab === 'foryou' && index < 3 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-primary-500 to-secondary-700 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" fill="currentColor" />
                            Top {index + 1}
                          </span>
                        )}
                        {isLiked && (
                          <span className="px-2 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full">
                            ❤️ Kedveled
                          </span>
                        )}
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist?.(product.id);
                        }}
                        className={`
                          absolute top-2 right-2 p-2 rounded-full transition-all
                          ${isWishlisted 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                          }
                        `}
                      >
                        <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>

                      {/* Quick view overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 bg-white rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Megnézem
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-1">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-500">
                          {formatPrice(price)}
                        </span>
                        {viewedAt && activeTab === 'recent' && (
                          <span className="text-[10px] text-gray-400">
                            {formatTimeAgo(viewedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gradient edges */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
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

// Helper: időformázás
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'most';
  if (diffMins < 60) return `${diffMins} perce`;
  if (diffHours < 24) return `${diffHours} órája`;
  if (diffDays < 7) return `${diffDays} napja`;
  return date.toLocaleDateString('hu-HU');
}

export default PersonalizedSection;
