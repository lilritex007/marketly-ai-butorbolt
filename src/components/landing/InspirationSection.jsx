import React, { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS } from "../../config/collections";

const AUTO_SCROLL_MS = 4500;

/**
 * Fedezd fel a stílusokat – kollekció kártyák
 * Mobil: 2x2 carousel (2 kártya látható, horizontal scroll + auto-scroll), Desktop: 6 oszlopos grid
 */
export default function InspirationSection({ onExplore, onCategorySelect, onCollectionSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [cardWidth, setCardWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const handleClick = (col) => {
    if (onCollectionSelect) {
      onCollectionSelect(col);
      return;
    }
    onExplore?.();
  };

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const updateWidth = () => {
      const gap = 12;
      const w = (el.offsetWidth - gap) / 2;
      setCardWidth(w + gap);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (e) => setReduceMotion(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (reduceMotion || isPaused || !scrollRef.current || cardWidth <= 0) return;
    const el = scrollRef.current;
    const count = COLLECTIONS.length;
    const totalWidth = count * cardWidth;
    const t = setInterval(() => {
      const curr = el.scrollLeft;
      const next = curr + cardWidth;
      if (next >= totalWidth - 20) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: next, behavior: "smooth" });
      }
    }, AUTO_SCROLL_MS);
    return () => clearInterval(t);
  }, [reduceMotion, isPaused, cardWidth]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = cardWidth > 0 ? cardWidth : el.offsetWidth / 2 + 8;
    el.scrollBy({ left: dir * cardW, behavior: "smooth" });
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPaused(false), 3000);
  };

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white border-t border-gray-100"
      aria-labelledby="inspiration-heading"
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block h-1 w-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-600 mb-4" aria-hidden />
          <h2 id="inspiration-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
            Fedezd fel a stílusokat
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Gondosan válogatott kollekciók
          </p>
        </div>

        {/* Mobil: 2x2 carousel – 2 kártya látható, horizontal scroll */}
        <div className="lg:hidden relative -mx-4">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="Balra gördítés"
            >
              ‹
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="Jobbra gördítés"
            >
              ›
            </button>
          )}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={() => setIsPaused(true)}
            className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth pb-2 pl-4 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
          >
            {COLLECTIONS.map((col, idx) => (
              <div
                key={col.id}
                className="flex-shrink-0 w-[calc(50%-6px)] min-w-[calc(50%-6px)] snap-center"
              >
                <CollectionCard col={col} onPress={() => handleClick(col)} mobile />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 6 oszlop, méretezett kártyák */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-4 xl:gap-5">
          {COLLECTIONS.map((col, idx) => (
            <div key={col.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}>
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
      className={`group relative rounded-xl overflow-hidden bg-gray-100 text-left shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 w-full ${
        mobile ? "aspect-[4/3] min-h-[140px]" : "h-[220px] xl:h-[260px]"
      }`}
      aria-label={`${col.title} – böngészés`}
    >
      {col.image && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${col.image})` }} aria-hidden />
      )}
      <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-4 sm:p-5">
        <Icon className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 text-white/80" aria-hidden />
        {col.isSale && (
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 py-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-md">
            AKCIÓ
          </span>
        )}
        {col.isNew && (
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md">
            ÚJ
          </span>
        )}
        <h3 className="text-base sm:text-xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-1">{col.title}</h3>
        <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-3 line-clamp-2">{col.subtitle}</p>
        <span className="inline-flex items-center gap-2 text-white font-semibold text-sm">
          Böngészés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
        </span>
      </div>
    </button>
  );
}
