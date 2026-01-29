import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/**
 * CategorySwipe - Category Navigation
 * Shows all categories as pills
 * Active category is highlighted with displayed/total count below
 */
const CategorySwipe = ({ categories, activeCategory, onCategoryChange, displayedCount, totalCount }) => {
  // Horizontal scroll ref for mobile
  const scrollRef = React.useRef(null);
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-6 px-4 rounded-2xl shadow-lg mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Kategóriák</h3>
        </div>
        <span className="text-sm text-gray-500">
          {categories.length} kategória
        </span>
      </div>

      {/* Category Pills Container */}
      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all hidden md:flex"
          aria-label="Görgetés balra"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Pills */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 px-8 md:px-10 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
                  }
                `}
              >
                {category.icon && <span className="mr-1.5">{category.icon}</span>}
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all hidden md:flex"
          aria-label="Görgetés jobbra"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Active Category Info - displayed/total */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-indigo-600">{displayedCount?.toLocaleString('hu-HU') || 0}</span>
          {' / '}
          <span className="font-semibold">{totalCount?.toLocaleString('hu-HU') || 0}</span>
          {' termék látható'}
        </p>
      </div>
    </div>
  );
};

export default CategorySwipe;
