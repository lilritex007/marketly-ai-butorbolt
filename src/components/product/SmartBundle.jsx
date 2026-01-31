import React, { useState, useMemo } from 'react';
import { Package, Sparkles, Check, Plus, Minus, ShoppingCart, Tag, ArrowRight, Gift, Percent } from 'lucide-react';

/**
 * SmartBundle - AI-powered bundle recommendations
 * Beautiful UI with animated selections and savings calculator
 */
const SmartBundle = ({ currentProduct, allProducts = [], onAddBundle }) => {
  const [selectedItems, setSelectedItems] = useState(new Set([currentProduct?.id]));
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate smart bundle suggestions based on current product
  const bundleSuggestions = useMemo(() => {
    if (!currentProduct || !allProducts.length) return [];
    
    // Find complementary products (different category, similar style)
    const suggestions = allProducts
      .filter(p => p.id !== currentProduct.id)
      .filter(p => p.category !== currentProduct.category)
      .slice(0, 3);
    
    return suggestions;
  }, [currentProduct, allProducts]);

  const allBundleItems = useMemo(() => {
    return [currentProduct, ...bundleSuggestions].filter(Boolean);
  }, [currentProduct, bundleSuggestions]);

  const selectedProducts = useMemo(() => {
    return allBundleItems.filter(p => selectedItems.has(p.id));
  }, [allBundleItems, selectedItems]);

  // Calculate pricing
  const originalTotal = selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  const bundleDiscount = selectedProducts.length >= 3 ? 0.15 : selectedProducts.length >= 2 ? 0.10 : 0;
  const discountAmount = originalTotal * bundleDiscount;
  const bundlePrice = originalTotal - discountAmount;

  const toggleItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (id === currentProduct?.id) return; // Can't deselect main product
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleAddBundle = () => {
    onAddBundle?.(selectedProducts, bundlePrice);
  };

  if (!currentProduct || bundleSuggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl border border-primary-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Vedd meg együtt</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI ajánlat
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Spórolj akár 15%-ot a csomaggal</p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <Minus className="w-4 h-4 text-gray-600" />
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
          {/* Bundle Items */}
          <div className="space-y-2">
            {allBundleItems.map((product, idx) => {
              const isSelected = selectedItems.has(product.id);
              const isMain = product.id === currentProduct?.id;
              
              return (
                <button
                  key={product.id}
                  onClick={() => toggleItem(product.id)}
                  disabled={isMain}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-primary-400 bg-primary-50/50 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                    ${isMain ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  {/* Checkbox */}
                  <div className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                    ${isSelected 
                      ? 'bg-primary-500 border-primary-500' 
                      : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Product Image */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {isMain && (
                          <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wide">Kiválasztott termék</span>
                        )}
                        <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{product.category}</p>
                      </div>
                      <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                        {product.price?.toLocaleString()} Ft
                      </span>
                    </div>
                  </div>

                  {/* Add indicator */}
                  {!isMain && !isSelected && (
                    <Plus className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Pricing Summary */}
          {selectedProducts.length >= 2 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Eredeti ár ({selectedProducts.length} termék)</span>
                <span className="text-gray-500 line-through">{originalTotal.toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  Csomag kedvezmény ({Math.round(bundleDiscount * 100)}%)
                </span>
                <span className="text-green-600 font-bold">-{discountAmount.toLocaleString()} Ft</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Csomag ár</span>
                <span className="text-xl font-black text-primary-600">{bundlePrice.toLocaleString()} Ft</span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleAddBundle}
            disabled={selectedProducts.length < 2}
            className={`
              w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all
              ${selectedProducts.length >= 2
                ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <ShoppingCart className="w-5 h-5" />
            {selectedProducts.length >= 2 
              ? `Csomag kosárba (${selectedProducts.length} termék)`
              : 'Válassz legalább 2 terméket'
            }
            {selectedProducts.length >= 2 && <ArrowRight className="w-5 h-5" />}
          </button>

          {/* Discount tiers hint */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className={selectedProducts.length >= 2 ? 'text-green-600 font-medium' : ''}>
              2 termék = 10%
            </span>
            <span className="text-gray-300">•</span>
            <span className={selectedProducts.length >= 3 ? 'text-green-600 font-medium' : ''}>
              3+ termék = 15%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartBundle;
