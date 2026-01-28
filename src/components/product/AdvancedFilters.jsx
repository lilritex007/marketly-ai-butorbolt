import React, { useState, useEffect } from 'react';
import { Filter, X, DollarSign, Package, Tag } from 'lucide-react';

/**
 * Advanced Filters Panel
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
    for (let i = 0; i < products.length; i++) {
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

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };

  const toggleCategory = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      inStockOnly: false,
      categories: []
    });
  };

  const activeFilterCount = [
    filters.inStockOnly,
    filters.categories.length > 0,
    filters.priceMin > priceRange.min,
    filters.priceMax < priceRange.max
  ].filter(Boolean).length;

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-indigo-500 transition-all flex items-center gap-2 font-medium"
      >
        <Filter className="w-4 h-4" />
        <span>Szűrők</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-fade-in-down">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              Szűrők
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
            {/* Price Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <DollarSign className="w-4 h-4" />
                Ár tartomány
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Minimum</label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step="5000"
                    value={filters.priceMin}
                    onChange={(e) => handlePriceChange('priceMin', e.target.value)}
                    className="w-full"
                  />
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(filters.priceMin)}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Maximum</label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step="5000"
                    value={filters.priceMax}
                    onChange={(e) => handlePriceChange('priceMax', e.target.value)}
                    className="w-full"
                  />
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(filters.priceMax)}
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Package className="w-4 h-4" />
                Készlet
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Csak raktáron lévő termékek</span>
              </label>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Tag className="w-4 h-4" />
                  Kategóriák
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Törlés
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Alkalmaz
            </button>
          </div>
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

    // Stock filter
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    return true;
  });
};
