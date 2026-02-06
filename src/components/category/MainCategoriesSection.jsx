import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getCategoryIcon } from '../ui/Icons';

const CARD_COLORS = [
  'from-primary-500 to-secondary-700',
  'from-orange-500 to-amber-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
];

/**
 * Fő kategóriák kártyák a főoldalon – hierarchia alapján.
 * Desktop: 3 oszlop, tablet: 2, mobil: horizontális scroll vagy 1 oszlop.
 */
export default function MainCategoriesSection({
  mainCategories = [],
  activeCategory,
  onCategorySelect,
  totalProductCount = 0,
}) {
  if (!mainCategories.length) return null;

  return (
    <div className="mb-6 sm:mb-8 lg:mb-10">
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5 lg:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
            Böngéssz fő kategóriák szerint
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mt-0.5">
            {totalProductCount > 0 && (
              <span className="font-medium text-primary-600">{totalProductCount.toLocaleString('hu-HU')}</span>
            )}{' '}
            termék egy helyen
          </p>
        </div>
      </div>

      {/* Desktop / tablet: grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 xl:gap-6">
        {mainCategories.map((main, idx) => {
          const isActive = activeCategory === main.name;
          const children = (main.children || []).slice(0, 6);
          const Icon = getCategoryIcon(main.name);
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          return (
            <article
              key={main.name}
              className={`rounded-2xl lg:rounded-3xl border-2 overflow-hidden transition-all duration-200 hover:shadow-xl ${
                isActive
                  ? 'border-primary-400 bg-primary-50/50 shadow-lg'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onCategorySelect(main.name)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 lg:p-6 text-left min-h-[44px]"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0 shadow-md`}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl truncate">
                    {main.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {Number(main.productCount || 0).toLocaleString('hu-HU')} termék
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </button>
              {children.length > 0 && (
                <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6 pt-0 flex flex-wrap gap-2">
                  {children.map((child) => (
                    <button
                      key={child.name}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategorySelect(child.name);
                      }}
                      className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-100 hover:border-primary-200"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-3 px-3">
        <div className="flex gap-3 pb-2">
          {mainCategories.map((main, idx) => {
            const isActive = activeCategory === main.name;
            const Icon = getCategoryIcon(main.name);
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <button
                key={main.name}
                type="button"
                onClick={() => onCategorySelect(main.name)}
                className={`shrink-0 w-[160px] rounded-2xl border-2 p-4 text-left transition-all min-h-[100px] ${
                  isActive ? 'border-primary-400 bg-primary-50/50' : 'border-gray-100 bg-white'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-gray-900 text-sm truncate">{main.name}</p>
                <p className="text-xs text-gray-500">{Number(main.productCount || 0).toLocaleString('hu-HU')} db</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
