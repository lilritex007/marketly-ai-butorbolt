import React, { useMemo, useState, useEffect } from 'react';
import { Package, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { getStockLevel } from '../../utils/helpers';
import SectionHeader from './SectionHeader';
import { trackSectionEvent } from '../../services/userPreferencesService';

const PAGE_SIZE = 12;
const SECTION_ID = 'new-arrivals';

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

  const timeline = useMemo(() => {
    const now = Date.now();
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(now - (6 - idx) * 24 * 60 * 60 * 1000);
      const label = day.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
      return { label, start: new Date(day.setHours(0, 0, 0, 0)).getTime(), end: new Date(day.setHours(23, 59, 59, 999)).getTime(), count: 0 };
    });
    newArrivals.forEach((p) => {
      const t = toTimestamp(p.updated_at || p.updatedAt || p.created_at || p.createdAt || p.last_synced_at);
      const bucket = days.find((d) => t >= d.start && t <= d.end);
      if (bucket) bucket.count += 1;
    });
    return days;
  }, [newArrivals]);

  useEffect(() => {
    trackSectionEvent(SECTION_ID, 'section_impression');
  }, []);

  if (visibleProducts.length === 0) return null;

  return (
    <section
      className="section-shell section-shell--new py-10 sm:py-12 lg:py-16"
      aria-labelledby="new-arrivals-heading"
      aria-label="Friss beérkezés"
      role="region"
      data-section="new-arrivals"
    >
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
              sectionId={SECTION_ID}
              showFeedback
              />
            );
          })}
        </div>
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
          <Sparkles className="w-4 h-4 text-primary-500" />
          Újdonságok idővonala (7 nap)
        </div>
        <div className="grid grid-cols-7 gap-2">
          {timeline.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-2">
              <div className="w-full h-16 rounded-xl bg-gray-100 flex items-end overflow-hidden">
                <div
                  className="w-full bg-primary-500/80"
                  style={{ height: `${Math.min(100, day.count * 8)}%` }}
                />
              </div>
              <span className="text-[11px] text-gray-500">{day.label}</span>
              <span className="text-[11px] font-semibold text-gray-700">{day.count}</span>
            </div>
          ))}
        </div>
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
