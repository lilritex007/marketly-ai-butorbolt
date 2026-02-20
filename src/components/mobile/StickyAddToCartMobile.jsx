import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Minus, Plus, Check, Zap, ChevronUp, Star, Truck } from 'lucide-react';

/**
 * StickyAddToCartMobile - Floating add to cart bar for mobile
 * Always visible, smooth UX with quantity selector
 */
const StickyAddToCartMobile = ({ 
  product,
  isVisible = true,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  isInCart = false,
  freeShippingThreshold = 50000
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const price = product?.price || 0;
  const originalPrice = product?.originalPrice;
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const totalPrice = price * quantity;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - totalPrice);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart?.(product, quantity);
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        setQuantity(1);
        setShowQuantity(false);
      }, 2000);
    } catch {
      /* handled by parent / toast */
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => setQuantity(q => Math.min(q + 1, 10));
  const decrementQuantity = () => setQuantity(q => Math.max(q - 1, 1));

  if (!isVisible || !product) return null;

  return (
    <>
      {/* Backdrop when quantity selector is open */}
      {showQuantity && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setShowQuantity(false)}
        />
      )}

      {/* Sticky Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        {/* Free Shipping Progress - Compact */}
        {freeShippingRemaining > 0 && freeShippingRemaining < freeShippingThreshold && (
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-1.5">
            <div className="flex items-center justify-center gap-2 text-white text-xs">
              <Truck className="w-3.5 h-3.5" />
              <span>Még <strong>{freeShippingRemaining.toLocaleString()} Ft</strong> az ingyenes szállításig!</span>
            </div>
          </div>
        )}

        {/* Quantity Selector Panel */}
        {showQuantity && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Mennyiség</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm disabled:opacity-50"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <span className="w-8 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 10}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Összesen:</span>
              <span className="text-xl font-black text-gray-900">{totalPrice.toLocaleString()} Ft</span>
            </div>
          </div>
        )}

        {/* Main Bar */}
        <div className="bg-white border-t border-gray-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist?.(product)}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all ${
                isInWishlist 
                  ? 'bg-red-50 border-red-200 text-red-500' 
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Price & Quantity Toggle */}
            <button
              onClick={() => setShowQuantity(!showQuantity)}
              className="flex-1 flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900 text-lg">{price.toLocaleString()} Ft</span>
                  {discount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">
                      -{discount}%
                    </span>
                  )}
                </div>
                {quantity > 1 && (
                  <span className="text-xs text-gray-500">{quantity} db = {totalPrice.toLocaleString()} Ft</span>
                )}
              </div>
              <ChevronUp className={`w-5 h-5 text-gray-400 transition-transform ${showQuantity ? 'rotate-180' : ''}`} />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || justAdded}
              className={`h-12 px-5 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all ${
                justAdded
                  ? 'bg-green-500 text-white'
                  : isAdding
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Hozzáadva!</span>
                </>
              ) : isAdding ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Kosárba</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default StickyAddToCartMobile;
