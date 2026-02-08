import React, { useMemo } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';

/**
 * Legnépszerűbb – valós adat: akciós termékek (nagy kedvezmény) + többi ár szerint, max 8.
 */
export default function MostPopularSection({ products = [], onProductClick, onToggleWishlist, wishlist = [], onViewAll, onAddToCart, contextLabel = '' }) {
  const mostPopular = useMemo(() => {
    if (!products.length) return [];
    const withDiscount = [...products]
      .filter((p) => p.salePrice && p.price > p.salePrice)
      .sort((a, b) => (b.price - (b.salePrice || 0)) - (a.price - (a.salePrice || 0)));
    const ids = new Set(withDiscount.map((p) => p.id));
    const rest = [...products]
      .filter((p) => !ids.has(p.id))
      .sort((a, b) => (b.price || 0) - (a.price || 0));
    return [...withDiscount, ...rest].slice(0, 8);
  }, [products]);

  if (mostPopular.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-amber-50/40 border-t border-gray-200" aria-labelledby="most-popular-heading">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" aria-hidden />
            </div>
            <div>
              <h2 id="most-popular-heading" className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Legnépszerűbb</h2>
              <p className="text-sm text-gray-600">A vásárlók kedvencei és legjobb akciók</p>
            </div>
          </div>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg px-3 py-2 min-h-[44px]"
            >
              Összes megtekintése <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {contextLabel && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-amber-100 text-amber-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {contextLabel}
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {mostPopular.map((product, index) => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
              onQuickView={onProductClick}
              onAddToCart={onAddToCart || (() => {})}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
