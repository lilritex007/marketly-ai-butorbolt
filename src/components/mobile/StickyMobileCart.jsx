import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Heart, ChevronUp, Truck, Shield, Check } from 'lucide-react';

/**
 * StickyMobileCart - Fixed bottom add to cart bar for mobile
 * Shows product price and quick add functionality
 */
const StickyMobileCart = ({ 
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  isVisible = true,
  freeShippingThreshold = 30000
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleAddToCart = () => {
    onAddToCart?.(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const totalPrice = (product?.price || 0) * quantity;
  const freeShippingProgress = Math.min(100, (totalPrice / freeShippingThreshold) * 100);
  const needsMore = freeShippingThreshold - totalPrice;

  if (!isVisible || !product) return null;

  return (
    <>
      {/* Backdrop when details open */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 sm:hidden"
          onClick={() => setShowDetails(false)}
        />
      )}

      {/* Sticky Bar */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 sm:hidden
        transition-transform duration-300
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}>
        {/* Expandable Details Panel */}
        <div className={`
          bg-white border-t border-gray-200 overflow-hidden transition-all duration-300
          ${showDetails ? 'max-h-48' : 'max-h-0'}
        `}>
          <div className="p-4 space-y-3">
            {/* Free Shipping Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-primary-500" />
                  {freeShippingProgress >= 100 
                    ? 'Ingyenes szállítás!' 
                    : `Még ${needsMore.toLocaleString()} Ft az ingyenes szállításig`
                  }
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    freeShippingProgress >= 100 ? 'bg-green-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                14 nap visszaküldés
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-primary-500" />
                2-5 nap szállítás
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mennyiség:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Bar */}
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 p-3">
            {/* Expand Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 shrink-0"
            >
              <ChevronUp className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite?.(product)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isFavorite 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Price + Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`
                flex-1 flex items-center justify-between gap-2 py-3 px-4 rounded-xl font-bold transition-all
                ${isAdded 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg active:scale-[0.98]'
                }
              `}
            >
              <div className="text-left">
                <div className="text-[10px] opacity-80 font-normal">Összesen</div>
                <div className="text-lg">{totalPrice.toLocaleString()} Ft</div>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Hozzáadva!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Kosárba</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StickyMobileCart;
