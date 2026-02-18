import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Home, ChevronRight, Filter, LayoutGrid, Rows3, SlidersHorizontal, Sparkles, ShoppingCart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { toggleLikeProduct, toggleDislikeProduct, isProductLiked, isProductDisliked } from '../../services/userPreferencesService';
import { ProductGridSkeleton } from '../ui/Skeleton';

/**
 * CollectionHero – kollekció fejléc, gradient háttér
 */
const CollectionHero = ({ collection, productCount, onBack }) => {
  const Icon = collection.icon;
  return (
    <div className="relative overflow-hidden">
      {collection.image && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${collection.image})` }} aria-hidden />
      )}
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
 * Collection compact card - mint főoldal: like/dislike, ár formázás
 */
const CollectionCompactCard = ({ product, onProductClick, onWishlistToggle, onAddToCart, wishlist }) => {
  const [feedbackState, setFeedbackState] = useState(() => ({
    liked: isProductLiked(product?.id),
    disliked: isProductDisliked(product?.id)
  }));
  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.price > product.salePrice;
  const discountPct = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  useEffect(() => {
    if (product?.id) setFeedbackState({ liked: isProductLiked(product.id), disliked: isProductDisliked(product.id) });
  }, [product?.id]);

  return (
    <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow touch-manipulation">
      <img
        src={product.images?.[0] || product.image || '/placeholder.png'}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg bg-gray-50 shrink-0 cursor-pointer"
        onClick={() => onProductClick?.(product)}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-primary-500 font-medium mb-0.5 truncate">{product.category}</p>
        <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-primary-500 leading-tight overflow-hidden" onClick={() => onProductClick?.(product)}>
          {product.name}
        </h4>
        <div className="mt-1.5 text-center min-w-0 space-y-0.5">
          {hasDiscount ? (
            <>
              <span className="text-[10px] text-red-500 line-through block truncate">{product.price.toLocaleString('hu-HU')} Ft</span>
              <span className="text-xs font-bold text-red-600 block truncate">{displayPrice.toLocaleString('hu-HU')} Ft</span>
              <span className="inline-block px-1 py-0.5 rounded bg-red-100 text-red-600 text-[9px] font-bold">-{discountPct}%</span>
            </>
          ) : (
            <span className="text-xs font-bold text-gray-900 block truncate">{displayPrice.toLocaleString('hu-HU')} Ft</span>
          )}
        </div>
        <div className="flex justify-center items-center gap-1 sm:gap-2 mt-2 flex-wrap">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFeedbackState(toggleLikeProduct(product)); }}
            className={`min-w-[36px] min-h-[36px] p-1.5 flex items-center justify-center rounded-full transition-colors ${feedbackState.liked ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
            aria-label="Tetszik"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFeedbackState(toggleDislikeProduct(product)); }}
            className={`min-w-[36px] min-h-[36px] p-1.5 flex items-center justify-center rounded-full transition-colors ${feedbackState.disliked ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
            aria-label="Nem tetszik"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          {(product.inStock ?? product.in_stock) !== false && onAddToCart && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1); }}
              className="min-w-[36px] min-h-[36px] p-1.5 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors touch-manipulation shadow-md shadow-emerald-500/30 font-bold"
              title="Kosárba"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onWishlistToggle?.(product.id)}
            className={`min-w-[36px] min-h-[36px] p-1.5 flex items-center justify-center rounded-lg transition-colors ${wishlist?.includes(product.id) ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            ♥
          </button>
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
  onAddToCart,
  onAskAI,
  onNavigateToCategory,
  allCategories = [],
  totalCount = 0,
  loadedCount = 0,
  onLoadMore,
  isLoading = false
}) => {
  const [sortOption, setSortOption] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('');
  const loadMoreRef = useRef(null);

  const hasMoreToShow = totalCount > 0 && loadedCount < totalCount;

  const styleFilteredProducts = useMemo(() => {
    let list = [...products];
    if (collection.styleKeywords?.length > 0) {
      const keywords = collection.styleKeywords.map((k) => k.toLowerCase());
      list = list.filter((p) => {
        const searchStr = [p.name || '', p.category || '', p.description || '', p.params || ''].join(' ').toLowerCase();
        return keywords.some((kw) => searchStr.includes(kw));
      });
    }
    return list;
  }, [products, collection.styleKeywords]);

  const inCollectionCategories = useMemo(() => {
    const set = new Set();
    styleFilteredProducts.forEach((p) => {
      if (p.category && String(p.category).trim()) set.add(String(p.category).trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'hu'));
  }, [styleFilteredProducts]);

  const displayedProducts = useMemo(() => {
    let list = activeCategoryFilter
      ? styleFilteredProducts.filter((p) => p.category === activeCategoryFilter)
      : [...styleFilteredProducts];
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
  }, [styleFilteredProducts, activeCategoryFilter, sortOption]);

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
    <div id="products-section" className="min-h-screen bg-gray-50">
      <CollectionHero collection={collection} productCount={displayedProducts.length} onBack={onBack} />

      <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
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

        {/* Kollekción belüli szűrés – terméktípus chipek */}
        {inCollectionCategories.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Szűrés a kollekción belül</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:flex-wrap lg:overflow-visible">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('')}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategoryFilter === '' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Összes
              </button>
              {inCollectionCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategoryFilter === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Böngéssz kategóriák szerint – kilépés a kollekcióból */}
        {onNavigateToCategory && (collection.relatedCategories?.length > 0 || allCategories.length > 0) && (
          <div className="mb-6 p-4 rounded-xl bg-gray-100/80 border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-3">Böngéssz kategóriák szerint</p>
            <div className="flex flex-wrap gap-2">
              {(collection.relatedCategories?.length > 0
                ? collection.relatedCategories
                : allCategories
                    .filter((c) => (typeof c === 'string' ? c : c?.name) !== 'Összes')
                    .slice(0, 8)
                    .map((c) => (typeof c === 'string' ? c : c.name))
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onNavigateToCategory(cat)}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

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
          <div className="product-grid product-grid-collection">
            {displayedProducts.map((product, index) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onQuickView={onProductClick}
                onToggleWishlist={onWishlistToggle}
                onAddToCart={onAddToCart}
                isWishlisted={wishlist?.includes(product.id)}
                index={index}
                sectionId={`collection-${collection.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {displayedProducts.map((product) => (
              <CollectionCompactCard
                key={product.id}
                product={product}
                onProductClick={onProductClick}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={onAddToCart}
                wishlist={wishlist}
              />
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
