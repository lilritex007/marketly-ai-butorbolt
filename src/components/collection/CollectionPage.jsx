import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Home, ChevronRight, Filter, LayoutGrid, Rows3, SlidersHorizontal, Sparkles } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';

/**
 * CollectionHero – kollekció fejléc, gradient háttér
 */
const CollectionHero = ({ collection, productCount, onBack }) => {
  const Icon = collection.icon;
  return (
    <div className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="relative w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-12 sm:py-20 lg:py-28 text-white">
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button onClick={onBack} className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            <span>Főoldal</span>
          </button>
          <ChevronRight className="w-4 h-4 text-white/60" />
          <span className="text-white font-medium">Kollekció</span>
          <ChevronRight className="w-4 h-4 text-white/60" />
          <span className="font-semibold">{collection.title}</span>
        </nav>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
            <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">{collection.title}</h1>
            <p className="text-white/90 text-lg sm:text-xl mb-2">{collection.subtitle}</p>
            <p className="text-white/80 text-base">
              <span className="font-semibold">{productCount.toLocaleString('hu-HU')}</span> termék
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CollectionPage – kollekció landing, valós termékekkel
 */
const CollectionPage = ({
  collection,
  products,
  onBack,
  onProductClick,
  onWishlistToggle,
  wishlist,
  onAskAI,
  totalCount = 0,
  loadedCount = 0,
  onLoadMore,
  isLoading = false
}) => {
  const [sortOption, setSortOption] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef(null);

  const hasMoreToShow = totalCount > 0 && loadedCount < totalCount;

  const displayedProducts = useMemo(() => {
    let list = [...products];
    if (collection.styleKeywords?.length > 0) {
      const keywords = collection.styleKeywords.map((k) => k.toLowerCase());
      list = list.filter((p) => {
        const searchStr = [p.name || '', p.category || '', p.description || '', p.params || ''].join(' ').toLowerCase();
        return keywords.some((kw) => searchStr.includes(kw));
      });
    }
    switch (sortOption) {
      case 'price-asc':
        list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name-asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'hu'));
        break;
      case 'discount':
        list.sort((a, b) => {
          const dA = a.salePrice && a.price ? (a.price - a.salePrice) / a.price : 0;
          const dB = b.salePrice && b.price ? (b.price - b.salePrice) / b.price : 0;
          return dB - dA;
        });
        break;
    }
    return list;
  }, [products, sortOption, collection.styleKeywords]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreToShow) onLoadMore?.();
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    if (loadMoreRef.current instanceof Element) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMoreToShow, onLoadMore]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CollectionHero collection={collection} productCount={displayedProducts.length} onBack={onBack} />

      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12">
        {/* AI banner */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-700 rounded-2xl p-4 sm:p-6 text-white mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">AI segít választani</h3>
              <p className="text-white/80 text-sm">Melyik {collection.title.toLowerCase()} illik hozzád?</p>
            </div>
            <button
              onClick={onAskAI}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-primary-500 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              AI Tanácsadó
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
            >
              <Filter className="w-4 h-4" />
              Szűrők
            </button>
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{displayedProducts.length.toLocaleString('hu-HU')}</span>
              {totalCount > 0 && <span className="text-gray-400"> / {totalCount.toLocaleString('hu-HU')}</span>} termék
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-500 outline-none"
            >
              <option value="default">Relevancia</option>
              <option value="price-asc">Ár ↑</option>
              <option value="price-desc">Ár ↓</option>
              <option value="name-asc">Név A-Z</option>
              <option value="discount">Kedvezmény</option>
            </select>
            <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
              {[
                { mode: 'grid', icon: LayoutGrid },
                { mode: 'compact', icon: Rows3 }
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 ${viewMode === mode ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid */}
        {isLoading && products.length === 0 ? (
          <ProductGridSkeleton count={8} />
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">Nincs találat ebben a kollekcióban.</p>
            <button onClick={onBack} className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600">
              Vissza a kollekciókhoz
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="product-grid">
            {displayedProducts.map((product, index) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onQuickView={onProductClick}
                onToggleWishlist={onWishlistToggle}
                isWishlisted={wishlist?.includes(product.id)}
                index={index}
                sectionId={`collection-${collection.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedProducts.map((product) => (
              <div key={product.id} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <img
                  src={product.images?.[0] || product.image || '/placeholder.png'}
                  alt={product.name}
                  className="w-20 h-20 object-contain rounded-lg bg-gray-50 shrink-0 cursor-pointer"
                  onClick={() => onProductClick?.(product)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary-500 font-medium mb-1">{product.category}</p>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-primary-500" onClick={() => onProductClick?.(product)}>
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-gray-900">
                      {(product.salePrice || product.price).toLocaleString('hu-HU')} Ft
                    </span>
                    <button
                      onClick={() => onWishlistToggle?.(product.id)}
                      className={`p-1.5 rounded-lg ${wishlist?.includes(product.id) ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-400'}`}
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMoreToShow && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasMoreToShow && displayedProducts.length > 0 && (
          <p className="text-center text-gray-400 py-10">Minden termék betöltve</p>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
