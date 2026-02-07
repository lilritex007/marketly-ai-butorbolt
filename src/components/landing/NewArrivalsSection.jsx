import React, { useMemo } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';

export default function NewArrivalsSection({ products = [], onProductClick, onToggleWishlist, wishlist = [], onViewAll, onAddToCart }) {
  const newArrivals = useMemo(() => {
    if (!products.length) return [];
    const sorted = [...products].sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
      const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
      return idB - idA;
    });
    return sorted.slice(0, 8);
  }, [products]);

  if (newArrivals.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-gray-50 border-t border-gray-200" aria-labelledby="new-arrivals-heading">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" aria-hidden />
            </div>
            <div>
              <h2 id="new-arrivals-heading" className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Friss beérkezés</h2>
              <p className="text-sm text-gray-600">A legújabb termékeink</p>
            </div>
          </div>
          {onViewAll && (
            <button type="button" onClick={onViewAll} className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg px-3 py-2 min-h-[44px]">
              Összes megtekintése <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {newArrivals.map((product, index) => (
            <EnhancedProductCard key={product.id} product={product} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.includes(product.id)} onQuickView={onProductClick} onAddToCart={onAddToCart || (() => {})} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
