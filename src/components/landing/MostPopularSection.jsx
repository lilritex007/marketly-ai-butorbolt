import React, { useMemo, useState } from 'react';
import { TrendingUp, ArrowRight, RefreshCw, Flame } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import SectionHeader from './SectionHeader';

/**
 * Legnépszerűbb – valós adat: akciós termékek (nagy kedvezmény) + többi ár szerint, max 8.
 */
const PAGE_SIZE = 12;

const sliceWrap = (items, start, size) => {
  if (items.length <= size) return items;
  const end = start + size;
  if (end <= items.length) return items.slice(start, end);
  const first = items.slice(start);
  const rest = items.slice(0, end - items.length);
  return [...first, ...rest];
};

export default function MostPopularSection({ products = [], onProductClick, onToggleWishlist, wishlist = [], onViewAll, onAddToCart, contextLabel = '' }) {
  const [page, setPage] = useState(0);
  const mostPopular = useMemo(() => {
    if (!products.length) return [];
    const inStock = products.filter((p) => (p.inStock ?? p.in_stock ?? true));
    const withDiscount = [...inStock]
      .filter((p) => p.salePrice && p.price > p.salePrice)
      .sort((a, b) => (b.price - (b.salePrice || 0)) - (a.price - (a.salePrice || 0)));
    const ids = new Set(withDiscount.map((p) => p.id));
    const rest = [...inStock]
      .filter((p) => !ids.has(p.id))
      .sort((a, b) => (b.price || 0) - (a.price || 0));
    return [...withDiscount, ...rest];
  }, [products]);
  const visibleProducts = useMemo(() => {
    const start = (page * PAGE_SIZE) % Math.max(1, mostPopular.length);
    return sliceWrap(mostPopular, start, PAGE_SIZE);
  }, [mostPopular, page]);
  const saleCount = useMemo(() => mostPopular.filter((p) => p.salePrice && p.price > p.salePrice).length, [mostPopular]);
  const inStockCount = useMemo(() => mostPopular.length, [mostPopular]);

  if (visibleProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-amber-50/40 border-t border-gray-200" aria-labelledby="most-popular-heading">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <SectionHeader
          id="most-popular-heading"
          title="Legnépszerűbb"
          subtitle="A vásárlók kedvencei és a legjobb ajánlatok"
          Icon={TrendingUp}
          accentClass="from-amber-500 to-orange-600"
          eyebrow="Felfedezés"
          badge={saleCount > 0 ? `${saleCount} akciós termék` : 'Prémium válogatás'}
          contextLabel={contextLabel}
          meta={`Raktáron: ${inStockCount.toLocaleString('hu-HU')} • Összesen: ${mostPopular.length.toLocaleString('hu-HU')}`}
          helpText="Csak készleten lévő termékek"
          actions={
            <>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors text-sm font-semibold min-h-[44px]"
                aria-label="Új válogatás"
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
          }
        />
        <div className="product-grid">
          {visibleProducts.map((product, index) => (
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
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-amber-100 text-amber-700 font-semibold">
            <Flame className="w-3.5 h-3.5" />
            Most pörög
          </span>
          <span>Dinamikus válogatás a készleten lévő és akciós termékekből.</span>
        </div>
      </div>
    </section>
  );
}
