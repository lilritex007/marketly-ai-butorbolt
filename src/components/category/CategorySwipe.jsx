import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { CategoryIcon } from '../ui/Icons';

/**
 * CategorySwipe - Golden Standard Responsive Category Navigation
 * Typography: Mobile 13-14px, Tablet 14px, Desktop 14-15px
 * Touch targets: 44px minimum
 */
const CategorySwipe = ({ categories, activeCategory, onCategoryChange, displayedCount, activeTotalOverride }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);
  
  const activeData = categories.find(c => c.id === activeCategory);
  const activeTotalCount = typeof activeTotalOverride === 'number' ? activeTotalOverride : (activeData?.totalCount || 0);
  
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
    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 mb-4 sm:mb-6 lg:mb-8 xl:mb-10 overflow-hidden">
      {/* Header - UNIFIED spacing */}
      <div className="px-3 sm:px-5 lg:px-8 xl:px-10 py-3 sm:py-4 lg:py-6 xl:py-7 bg-gradient-to-r from-primary-50/80 via-secondary-50/50 to-pink-50/30 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-xl lg:rounded-2xl xl:rounded-3xl bg-primary-100 flex items-center justify-center shrink-0">
              <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-primary-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">Kategóriák</h3>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-500 hidden sm:block">{categories.length} kategória</p>
            </div>
          </div>
          
          {/* Counter - UNIFIED */}
          <div className="text-right shrink-0">
            <div className="text-sm sm:text-base lg:text-xl xl:text-2xl text-gray-700">
              <span className="font-bold text-primary-500">{displayedCount?.toLocaleString('hu-HU') || 0}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="font-semibold">{activeTotalCount.toLocaleString('hu-HU')}</span>
            </div>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">termék látható</p>
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
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }
              `}
            >
              <CategoryIcon name={category.name} className="w-4 h-4 shrink-0" />
              <span>{category.name}</span>
              {typeof category.totalCount === 'number' && (
                <span className={`text-[11px] font-medium ${category.id === activeCategory ? 'text-white/80' : 'text-gray-500'}`}>
                  {category.totalCount.toLocaleString('hu-HU')}
                </span>
              )}
            </button>
          ))}
          
          {hasMore && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="shrink-0 px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold bg-primary-50 text-primary-500 whitespace-nowrap"
            >
              +{categories.length - visibleCount}
            </button>
          )}
        </div>
      </div>

      {/* Desktop: Grid Layout - UNIFIED spacing */}
      <div className="hidden md:block p-4 lg:p-6 xl:p-8 2xl:p-10">
        <div className="flex flex-wrap gap-2 lg:gap-3 xl:gap-4">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-4 lg:px-5 xl:px-7 2xl:px-8 py-2.5 lg:py-3 xl:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base xl:text-lg 2xl:text-xl font-semibold transition-all
                flex items-center gap-2 lg:gap-2.5 xl:gap-3
                ${category.id === activeCategory
                  ? 'bg-primary-500 text-white shadow-lg scale-[1.02]'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }
              `}
            >
              <CategoryIcon name={category.name} className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 shrink-0" />
              <span>{category.name}</span>
              {typeof category.totalCount === 'number' && (
                <span className={`text-xs lg:text-sm font-medium ${category.id === activeCategory ? 'text-white/85' : 'text-gray-500'}`}>
                  {category.totalCount.toLocaleString('hu-HU')}
                </span>
              )}
            </button>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-5 lg:mt-6 xl:mt-8 w-full py-3.5 lg:py-4 xl:py-5 text-base lg:text-lg xl:text-xl 2xl:text-2xl text-primary-500 hover:text-primary-600 font-bold flex items-center justify-center gap-2 lg:gap-3 transition-colors rounded-xl lg:rounded-2xl hover:bg-primary-50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                Kevesebb
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
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
