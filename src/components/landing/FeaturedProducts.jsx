import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { PLACEHOLDER_IMAGE } from '../../utils/helpers';

/**
 * Featured / recommended products – horizontal scroll on mobile, grid on desktop
 */
export const FeaturedProducts = ({ products = [], onProductClick, onToggleWishlist, wishlist = [], onToggleComparison, isInComparison }) => {
  const featured = products
    .filter((p) => p.trending || p.aiRecommended || (p.price && p.price < 150000))
    .slice(0, 6);
  if (featured.length === 0) {
    const fallback = products.slice(0, 6);
    if (fallback.length === 0) return null;
  }

  const list = featured.length > 0 ? featured : products.slice(0, 6);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-app">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Kiemelt ajánlatok
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 md:gap-6 min-w-max md:min-w-0">
            {list.map((product) => (
              <div
                key={product.id}
                className="w-64 flex-shrink-0 md:w-auto cursor-pointer group"
                onClick={() => onProductClick?.(product)}
              >
                <EnhancedProductCard
                  product={product}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                  onQuickView={onProductClick}
                  onToggleComparison={onToggleComparison}
                  isInComparison={isInComparison?.(product.id)}
                  showBadges={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
