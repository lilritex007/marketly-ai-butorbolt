import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { CategoryIcon } from '../ui/Icons';

/**
 * CategorySwipe - Golden Standard Responsive Category Navigation
 * Typography: Mobile 13-14px, Tablet 14px, Desktop 14-15px
 * Touch targets: 44px minimum
 */
const CategorySwipe = ({ categories, activeCategory, onCategoryChange, displayedCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);
  
  const activeData = categories.find(c => c.id === activeCategory);
  const activeTotalCount = activeData?.totalCount || 0;
  
  const VISIBLE_MOBILE = 15;
  const VISIBLE_DESKTOP = 18;
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const visibleCount = isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP;
  const visibleCategories = isExpanded ? categories : categories.slice(0, visibleCount);
  const hasMore = categories.length > visibleCount;
  
  const updateScrollIndicators = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
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
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -200 : 200, 
        behavior: 'smooth' 
      });
    }
  };

  useEffect(() => {
    if (scrollRef.current && isMobile) {
      const activeEl = scrollRef.current.querySelector(`[data-category="${activeCategory}"]`);
      activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeCategory, isMobile]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 mb-4 sm:mb-6 lg:mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/30 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Grid3X3 className="w-5 h-5 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">Kategóriák</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-500 hidden sm:block">{categories.length} kategória</p>
            </div>
          </div>
          
          {/* Counter */}
          <div className="text-right shrink-0">
            <div className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700">
              <span className="font-bold text-indigo-600">{displayedCount?.toLocaleString('hu-HU') || 0}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="font-semibold">{activeTotalCount.toLocaleString('hu-HU')}</span>
            </div>
            <p className="text-xs sm:text-sm lg:text-base text-gray-400">termék látható</p>
          </div>
        </div>
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="md:hidden relative">
        {canScrollLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}
        {canScrollRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}
        
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto py-3 px-3 scrollbar-hide"
        >
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              data-category={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                shrink-0 px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap
                flex items-center gap-1.5
                ${category.id === activeCategory
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }
              `}
            >
              <CategoryIcon name={category.name} className="w-4 h-4 shrink-0" />
              {category.name}
            </button>
          ))}
          
          {hasMore && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="shrink-0 px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold bg-indigo-50 text-indigo-600 whitespace-nowrap"
            >
              +{categories.length - visibleCount}
            </button>
          )}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:block p-4 lg:p-6 xl:p-7">
        <div className="flex flex-wrap gap-2 lg:gap-3 xl:gap-3.5">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-4 lg:px-5 xl:px-6 py-2.5 lg:py-3 xl:py-3.5 rounded-xl lg:rounded-2xl text-sm lg:text-base xl:text-lg font-medium transition-all
                flex items-center gap-2 lg:gap-2.5
                ${category.id === activeCategory
                  ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }
              `}
            >
              <CategoryIcon name={category.name} className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 shrink-0" />
              {category.name}
            </button>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-5 lg:mt-6 w-full py-3.5 lg:py-4 text-base lg:text-lg xl:text-xl text-indigo-600 hover:text-indigo-700 font-semibold flex items-center justify-center gap-2 transition-colors rounded-xl hover:bg-indigo-50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6" />
                Kevesebb
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />
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
