import React, { useMemo, useState } from 'react';
import { Package, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { getStockLevel } from '../../utils/helpers';
import SectionHeader from './SectionHeader';

const PAGE_SIZE = 12;

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

export default function NewArrivalsSection({ products = [], onProductClick, onToggleWishlist, wishlist = [], onViewAll, onAddToCart, contextLabel = '' }) {
  const [page, setPage] = useState(0);
  const newArrivals = useMemo(() => {
    if (!products.length) return [];
    const inStock = products.filter((p) => (p.inStock ?? p.in_stock ?? true));
    const sorted = [...inStock].sort((a, b) => {
      const timeA = toTimestamp(a.updated_at || a.updatedAt || a.created_at || a.createdAt || a.last_synced_at);
      const timeB = toTimestamp(b.updated_at || b.updatedAt || b.created_at || b.createdAt || b.last_synced_at);
      if (timeA !== timeB) return timeB - timeA;
      const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
      const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
      return idB - idA;
    });
    return sorted;
  }, [products]);
  const visibleProducts = useMemo(() => {
    const start = (page * PAGE_SIZE) % Math.max(1, newArrivals.length);
    return sliceWrap(newArrivals, start, PAGE_SIZE);
  }, [newArrivals, page]);

  if (visibleProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200" aria-labelledby="new-arrivals-heading">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <SectionHeader
          id="new-arrivals-heading"
          title="Friss beérkezés"
          subtitle="A legújabb termékeink, folyamatosan frissítve"
          Icon={Package}
          accentClass="from-primary-500 to-secondary-600"
          eyebrow="Újdonság"
          badge="Újdonságok"
          contextLabel={contextLabel}
          meta={`Összesen: ${newArrivals.length.toLocaleString('hu-HU')} termék`}
          helpText="Csak készleten lévő termékek"
          actions={
            <>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-primary-700 bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors text-sm font-semibold min-h-[44px]"
                aria-label="További újdonságok"
              >
                <RefreshCw className="w-4 h-4" />
                Következő
              </button>
              {onViewAll && (
                <button type="button" onClick={onViewAll} className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg px-3 py-2 min-h-[44px]">
                  Összes megtekintése <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          }
        />
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
                onAddToCart={onAddToCart || (() => {})}
                index={index}
                highlightBadge={highlightBadge}
              />
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-primary-100 text-primary-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Frissítve
          </span>
          <span>Az újdonságok automatikusan a legfrissebb termékekből válogatnak.</span>
        </div>
      </div>
    </section>
  );
}
