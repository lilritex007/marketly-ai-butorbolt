import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Grid3X3, Sparkles } from 'lucide-react';

/**
 * CategorySwipe - Category Navigation (Grid-based, not swipeable)
 * Shows categories as clickable pills in a collapsible grid
 */
const CategorySwipe = ({ categories, activeCategory, onCategoryChange, displayedCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Find active category data
  const activeData = categories.find(c => c.id === activeCategory);
  const activeTotalCount = activeData?.totalCount || 0;
  
  // Show first 12 categories when collapsed, all when expanded
  const VISIBLE_COUNT = 12;
  const visibleCategories = isExpanded ? categories : categories.slice(0, VISIBLE_COUNT);
  const hasMore = categories.length > VISIBLE_COUNT;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Kategóriák</h3>
            <span className="text-sm text-gray-500">({categories.length})</span>
          </div>
          
          {/* Active category info */}
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-indigo-600">{displayedCount?.toLocaleString('hu-HU') || 0}</span>
            <span className="text-gray-400"> / </span>
            <span className="font-medium">{activeTotalCount.toLocaleString('hu-HU')}</span>
            <span className="text-gray-500 ml-1">termék</span>
          </div>
        </div>
      </div>

      {/* Category Pills Grid */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {visibleCategories.map((category) => {
            const isActive = category.id === activeCategory;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Expand/Collapse Button */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1 transition-colors"
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
