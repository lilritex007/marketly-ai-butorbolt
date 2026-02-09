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
  intervalMs = 4500,
  className = ''
}) => {
  const containerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoScroll || paused) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    const step = getScrollStep(container);
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
    const step = getScrollStep(container);
    container.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => scrollByStep(-1)}
        className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50"
        aria-label="Balra"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        type="button"
        onClick={() => scrollByStep(1)}
        className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50"
        aria-label="Jobbra"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
      <div
        ref={containerRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory"
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="min-w-[240px] sm:min-w-[280px] lg:min-w-[320px] snap-start">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
