import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';

/**
 * CategorySwipe - Beautiful Responsive Category Navigation
 * - Mobile: Horizontal scroll with fade edges
 * - Desktop: Collapsible grid with smooth animations
 */
const CategorySwipe = ({ categories, activeCategory, onCategoryChange, displayedCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);
  
  // Find active category data
  const activeData = categories.find(c => c.id === activeCategory);
  const activeTotalCount = activeData?.totalCount || 0;
  
  // Visible categories config
  const MOBILE_VISIBLE = 20;
  const DESKTOP_VISIBLE = 16;
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const visibleCount = isMobile ? MOBILE_VISIBLE : DESKTOP_VISIBLE;
  const visibleCategories = isExpanded ? categories : categories.slice(0, visibleCount);
  const hasMore = categories.length > visibleCount;
  
  // Update scroll indicators
  const updateScrollIndicators = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  useEffect(() => {
    updateScrollIndicators();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollIndicators);
      return () => el.removeEventListener('scroll', updateScrollIndicators);
    }
  }, [categories]);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.6;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // Scroll active category into view
  useEffect(() => {
    if (scrollRef.current && isMobile) {
      const activeEl = scrollRef.current.querySelector(`[data-category="${activeCategory}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeCategory, isMobile]);

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 mb-6 sm:mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/30 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">Kategóriák</h3>
              <p className="text-xs text-gray-500 hidden sm:block">{categories.length} kategória</p>
            </div>
          </div>
          
          {/* Active category counter */}
          <div className="text-right shrink-0">
            <div className="text-xs sm:text-sm text-gray-600">
              <span className="font-bold text-indigo-600">{displayedCount?.toLocaleString('hu-HU') || 0}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="font-semibold">{activeTotalCount.toLocaleString('hu-HU')}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400">termék látható</p>
          </div>
        </div>
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="md:hidden relative">
        {/* Scroll fade indicators */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/90 rounded-full shadow-md flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/90 rounded-full shadow-md flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
        
        {/* Scrollable container */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto py-3 px-3 scrollbar-hide scroll-smooth"
        >
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              data-category={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                ${category.id === activeCategory
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                }
              `}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name}
            </button>
          ))}
          
          {hasMore && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 whitespace-nowrap"
            >
              +{categories.length - visibleCount} több
            </button>
          )}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:block p-4">
        <div className="flex flex-wrap gap-2">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all
                ${category.id === activeCategory
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }
              `}
            >
              {category.icon && <span className="mr-1.5">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>

        {/* Expand/Collapse Button */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 w-full py-2.5 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-xl hover:bg-indigo-50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Kevesebb kategória
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Mind a {categories.length} kategória
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CategorySwipe;
