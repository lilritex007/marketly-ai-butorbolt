import React, { useState, useEffect, useMemo } from 'react';
import { Filter, X, DollarSign, Package, Tag } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

/**
 * Shared filter panel content (controlled). Used in desktop dropdown and mobile BottomSheet.
 * products, filters (from parent), onFilterChange(filters), onApply() when "Alkalmaz" is clicked.
 */
export const AdvancedFiltersPanel = ({
  products = [],
  filters = {},
  onFilterChange,
  onApply,
  showHeader = true,
  onCloseHeader
}) => {
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000000 };
    let min = Infinity, max = -Infinity;
    const cap = Math.min(products.length, 100000);
    for (let i = 0; i < cap; i++) {
      const p = products[i].price;
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return {
      min: min === Infinity ? 0 : Math.floor(min / 1000) * 1000,
      max: max === -Infinity ? 1000000 : Math.ceil(max / 1000) * 1000
    };
  }, [products]);

  const categories = useMemo(() => {
    const seen = new Set();
    const step = Math.max(1, Math.floor(products.length / 20000));
    for (let i = 0; i < products.length && seen.size < 500; i += step) {
      const c = products[i]?.category;
      if (c) seen.add(c);
    }
    return [...seen].sort();
  }, [products]);

  const effective = useMemo(() => ({
    priceMin: filters.priceMin ?? priceRange.min,
    priceMax: filters.priceMax ?? priceRange.max,
    inStockOnly: filters.inStockOnly ?? false,
    categories: Array.isArray(filters.categories) ? filters.categories : []
  }), [filters, priceRange]);

  const previousFiltersRef = React.useRef(null);
  const [hasRestorableFilters, setHasRestorableFilters] = useState(false);

  const handlePriceChange = (type, value) => {
    const v = parseInt(value, 10);
    if (Number.isNaN(v)) return;
    onFilterChange?.({ ...effective, [type]: v });
  };

  const toggleCategory = (cat) => {
    const next = effective.categories.includes(cat)
      ? effective.categories.filter(c => c !== cat)
      : [...effective.categories, cat];
    onFilterChange?.({ ...effective, categories: next });
  };

  const clearFilters = () => {
    previousFiltersRef.current = { ...effective };
    setHasRestorableFilters(true);
    onFilterChange?.({
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      inStockOnly: false,
      categories: []
    });
  };

  const restorePrevious = () => {
    if (previousFiltersRef.current) {
      onFilterChange?.(previousFiltersRef.current);
      previousFiltersRef.current = null;
      setHasRestorableFilters(false);
    }
  };

  const activeCount = [
    effective.inStockOnly,
    effective.categories.length > 0,
    effective.priceMin > priceRange.min,
    effective.priceMax < priceRange.max
  ].filter(Boolean).length;

  return (
    <>
      {showHeader && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-500" />
            Szűrők
          </h3>
          {onCloseHeader && (
            <button type="button" onClick={onCloseHeader} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors" aria-label="Szűrők bezárása">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      )}
      <div className="p-4 space-y-6 max-h-[60vh] md:max-h-96 overflow-y-auto custom-scrollbar flex-1 min-h-0">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <DollarSign className="w-4 h-4" />
            Ár tartomány
          </label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Minimum</label>
              <input type="range" min={priceRange.min} max={priceRange.max} step="5000" value={effective.priceMin} onChange={(e) => handlePriceChange('priceMin', e.target.value)} className="w-full" />
              <div className="text-sm font-medium text-gray-900">{formatPrice(effective.priceMin)}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600">Maximum</label>
              <input type="range" min={priceRange.min} max={priceRange.max} step="5000" value={effective.priceMax} onChange={(e) => handlePriceChange('priceMax', e.target.value)} className="w-full" />
              <div className="text-sm font-medium text-gray-900">{formatPrice(effective.priceMax)}</div>
            </div>
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Package className="w-4 h-4" />
            Készlet
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={effective.inStockOnly} onChange={(e) => onFilterChange?.({ ...effective, inStockOnly: e.target.checked })} className="w-4 h-4 text-primary-500 rounded" />
            <span className="text-sm text-gray-700">Csak raktáron lévő termékek</span>
          </label>
        </div>
        {categories.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Kategóriák
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" checked={effective.categories.includes(cat)} onChange={() => toggleCategory(cat)} className="w-4 h-4 text-primary-500 rounded" />
                  <span className="text-sm text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 flex flex-wrap gap-2 shrink-0">
        <button type="button" onClick={clearFilters} className="flex-1 min-w-[80px] px-4 py-3 min-h-[44px] border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Törlés</button>
        {hasRestorableFilters && (
          <button type="button" onClick={restorePrevious} className="flex-1 min-w-[80px] px-4 py-3 min-h-[44px] border border-primary-300 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors">Visszaállítás</button>
        )}
        <button type="button" onClick={onApply} className="flex-1 min-w-[80px] px-4 py-3 min-h-[44px] bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors">Alkalmaz</button>
      </div>
    </>
  );
};

/**
 * Advanced Filters (desktop: button + dropdown)
 */
export const AdvancedFilters = ({ 
  products = [],
  onFilterChange,
  initialFilters = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: initialFilters.priceMin || 0,
    priceMax: initialFilters.priceMax || 1000000,
    inStockOnly: initialFilters.inStockOnly || false,
    categories: initialFilters.categories || [],
    ...initialFilters
  });

  // Calculate price range from products (avoid Math.min/max spread – 168k args = stack overflow)
  const priceRange = React.useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000000 };
    let min = Infinity;
    let max = -Infinity;
    const cap = Math.min(products.length, 100000);
    for (let i = 0; i < cap; i++) {
      const p = products[i].price;
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return {
      min: min === Infinity ? 0 : Math.floor(min / 1000) * 1000,
      max: max === -Infinity ? 1000000 : Math.ceil(max / 1000) * 1000
    };
  }, [products]);

  // Get unique categories (limit to 500 to avoid huge lists; sample if needed)
  const categories = React.useMemo(() => {
    const seen = new Set();
    const step = Math.max(1, Math.floor(products.length / 20000));
    for (let i = 0; i < products.length && seen.size < 500; i += step) {
      const c = products[i]?.category;
      if (c) seen.add(c);
    }
    return [...seen].sort();
  }, [products]);

  // Extract colors and materials from params (sample to avoid long loop on 168k)
  const extractedAttributes = React.useMemo(() => {
    const colors = new Set();
    const materials = new Set();
    const step = Math.max(1, Math.floor(products.length / 5000));
    for (let i = 0; i < products.length; i += step) {
      const p = products[i];
      if (p.params) {
        const params = p.params.toLowerCase();
        // Simple extraction - can be enhanced
        if (params.includes('szín:') || params.includes('színe:')) {
          const match = params.match(/szín[e]?:\s*([^,]+)/i);
          if (match) colors.add(match[1].trim());
        }
        if (params.includes('anyag:')) {
          const match = params.match(/anyag:\s*([^,]+)/i);
          if (match) materials.add(match[1].trim());
        }
      }
    }

    return {
      colors: Array.from(colors).slice(0, 10),
      materials: Array.from(materials).slice(0, 10)
    };
  }, [products]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters]);

  const activeFilterCount = [
    filters.inStockOnly,
    filters.categories.length > 0,
    filters.priceMin > priceRange.min,
    filters.priceMax < priceRange.max
  ].filter(Boolean).length;

  const panelContent = (
    <AdvancedFiltersPanel
      products={products}
      filters={filters}
      onFilterChange={(next) => {
        setFilters(next);
        onFilterChange?.(next);
      }}
      onApply={() => setIsOpen(false)}
      showHeader={true}
      onCloseHeader={() => setIsOpen(false)}
    />
  );

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-4 py-2 min-h-[44px] border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-all flex items-center gap-2 font-medium"
        aria-label="Szűrők megnyitása"
      >
        <Filter className="w-4 h-4" />
        <span>Szűrők</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile: full-screen overlay + bottom sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden" role="dialog" aria-label="Szűrők">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-2xl shadow-2xl flex flex-col animate-fade-in-down">
            {panelContent}
          </div>
        </div>
      )}

      {/* Desktop: dropdown panel */}
      {isOpen && (
        <div className="hidden md:block absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-fade-in-down">
          {panelContent}
        </div>
      )}
    </>
  );
};

/**
 * Apply filters to product list
 */
export const applyFilters = (products, filters) => {
  return products.filter(product => {
    // Price filter
    if (product.price < filters.priceMin || product.price > filters.priceMax) {
      return false;
    }

    // Stock filter (support both inStock and in_stock)
    if (filters.inStockOnly && !(product.inStock ?? product.in_stock)) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    return true;
  });
};
