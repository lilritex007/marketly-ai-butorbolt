import React, { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS } from "../../config/collections";

/**
 * Fedezd fel a stílusokat – bővített kollekció kártyák
 * Mobil: horizontal carousel, Desktop: grid
 */
export default function InspirationSection({ onExplore, onCategorySelect, onCollectionSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const handleClick = (col) => {
    if (onCollectionSelect) {
      onCollectionSelect(col);
      return;
    }
    onExplore?.();
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white border-t border-gray-100"
      aria-labelledby="inspiration-heading"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block h-1 w-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-600 mb-4" aria-hidden />
          <h2 id="inspiration-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
            Fedezd fel a stílusokat
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Gondosan válogatott kollekciók
          </p>
        </div>

        {/* Mobil: horizontal carousel */}
        <div className="lg:hidden relative">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 -ml-2"
              aria-label="Balra gördítés"
            >
              ‹
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 -mr-2"
              aria-label="Jobbra gördítés"
            >
              ›
            </button>
          )}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pb-2 -mx-2 px-2"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {COLLECTIONS.map((col) => (
              <CollectionCard key={col.id} col={col} onPress={() => handleClick(col)} mobile />
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 lg:gap-6">
          {COLLECTIONS.map((col, idx) => (
            <div key={col.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}>
              <CollectionCard col={col} onPress={() => handleClick(col)} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onExplore}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 transition-colors"
          >
            Összes termék megtekintése
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function CollectionCard({ col, onPress, mobile }) {
  const Icon = col.icon;
  return (
    <button
      type="button"
      onClick={onPress}
      className={`group relative rounded-xl overflow-hidden bg-gray-100 text-left shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 flex-shrink-0 ${
        mobile ? "w-[260px] h-[200px] snap-center" : "h-[220px] xl:h-[240px]"
      }`}
      aria-label={`${col.title} – böngészés`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-5 sm:p-6">
        <Icon className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 sm:w-12 sm:h-12 text-white/80" aria-hidden />
        {col.isSale && (
          <span className="absolute top-4 left-4 px-2.5 py-1 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-md">
            AKCIÓ
          </span>
        )}
        {col.isNew && (
          <span className="absolute top-4 left-4 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-md">
            ÚJ
          </span>
        )}
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{col.title}</h3>
        <p className="text-sm text-white/90 mb-3">{col.subtitle}</p>
        <span className="inline-flex items-center gap-2 text-white font-semibold text-sm">
          Böngészés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
        </span>
      </div>
    </button>
  );
}
