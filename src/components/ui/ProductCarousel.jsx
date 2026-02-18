import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const getScrollStep = (container) => {
  if (!container) return 320;
  const first = container.firstElementChild;
  if (!first) return 320;
  const rect = first.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(container).columnGap || '16');
  return Math.max(260, rect.width + gap);
};

const ProductCarousel = ({
  children,
  autoScroll = true,
  intervalMs = 5200,
  stepFraction = 1,
  className = '',
  onInteractionChange,
  cardSize = 'default',
  desktopColumns, // override: 6 = 6 kártya/sor desktopon (pl. Worlds)
}) => {
  const containerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const interactionTimeoutRef = useRef(null);

  useEffect(() => {
    if (!autoScroll || paused) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    const step = getScrollStep(container) * stepFraction;
    const id = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const next = container.scrollLeft + step;
      if (next >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoScroll, paused, intervalMs]);

  const scrollByStep = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const step = getScrollStep(container) * stepFraction;
    container.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => scrollByStep(-1)}
        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50"
        aria-label="Balra"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        type="button"
        onClick={() => scrollByStep(1)}
        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50"
        aria-label="Jobbra"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
      <div
        ref={containerRef}
        onMouseEnter={() => {
          setPaused(true);
          onInteractionChange?.(true);
        }}
        onMouseLeave={() => {
          setPaused(false);
          onInteractionChange?.(false);
        }}
        onPointerDown={() => {
          setPaused(true);
          onInteractionChange?.(true);
          if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
          interactionTimeoutRef.current = setTimeout(() => {
            setPaused(false);
            onInteractionChange?.(false);
          }, 4000);
        }}
        onFocusCapture={() => {
          setPaused(true);
          onInteractionChange?.(true);
        }}
        onBlurCapture={() => {
          setPaused(false);
          onInteractionChange?.(false);
        }}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory scrollbar-hide"
      >
        {React.Children.map(children, (child, index) => {
          const lgCols6 = 'lg:min-w-[calc((100%-80px)/6)]';
          const lgCols5 = 'lg:min-w-[calc((100%-80px)/5)]';
          const use6cols = desktopColumns === 6 || (cardSize !== 'large' && !desktopColumns);
          const lgClass = use6cols ? lgCols6 : lgCols5;
          return (
            <div
              key={index}
              className={`snap-start ${cardSize === 'large' ? `min-w-[220px] sm:min-w-[260px] ${lgClass}` : `min-w-[170px] sm:min-w-[200px] ${lgClass}`}`}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCarousel;
