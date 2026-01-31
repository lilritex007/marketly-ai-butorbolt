import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Check, AlertTriangle, Truck, Clock, Shield, ChevronUp } from 'lucide-react';

/**
 * StickyAddToCart - Sticky bottom bar for product pages
 * Shows when scrolling down, with stock status and quick actions
 */
const StickyAddToCart = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted = false,
  isVisible = true 
}) => {
  const [isShown, setIsShown] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Show after scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsShown(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product || !isVisible) return null;

  const price = product.salePrice || product.price || 0;
  const originalPrice = product.originalPrice || (product.salePrice ? product.price : null);
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  // Stock simulation (in real app this would come from API)
  const stockLevel = Math.floor(Math.random() * 20) + 1;
  const isLowStock = stockLevel <= 5;
  const isInStock = stockLevel > 0;

  const formatPrice = (p) => (p || 0).toLocaleString('hu-HU');

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
    setAddedToCart(true);
    
    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-40 transition-all duration-300
        ${isShown ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {/* Main sticky bar */}
      <div className="bg-white border-t border-gray-200 shadow-2xl">
        {/* Stock urgency banner */}
        {isLowStock && isInStock && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1.5 text-sm font-medium flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Már csak {stockLevel} db van raktáron!
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Product info - mobile */}
          <div className="flex-1 min-w-0 sm:hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-indigo-600">{formatPrice(price)} Ft</span>
              {hasDiscount && (
                <span className="text-sm line-through text-gray-400">{formatPrice(originalPrice)}</span>
              )}
            </div>
          </div>

          {/* Product info - desktop */}
          <div className="hidden sm:flex items-center gap-4 flex-1">
            <img 
              src={product.images?.[0] || product.image} 
              alt={product.name}
              className="w-14 h-14 object-contain bg-gray-50 rounded-lg"
            />
            <div>
              <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-indigo-600">{formatPrice(price)} Ft</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm line-through text-gray-400">{formatPrice(originalPrice)}</span>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Trust badges - desktop only */}
          <div className="hidden lg:flex items-center gap-4 text-gray-500 text-xs">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-green-600" />
              <span>Ingyenes szállítás</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>2 év garancia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>24h kiszállítás</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Quantity selector - desktop only */}
            <div className="hidden sm:flex items-center border border-gray-200 rounded-lg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="px-3 py-2 font-medium min-w-[40px] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => onToggleWishlist?.(product.id)}
              className={`
                p-3 rounded-xl transition-all
                ${isWishlisted 
                  ? 'bg-red-100 text-red-500' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || addedToCart}
              className={`
                flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold transition-all
                ${addedToCart 
                  ? 'bg-green-500 text-white' 
                  : isInStock 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="hidden sm:inline">Hozzáadva!</span>
                </>
              ) : isInStock ? (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">Kosárba</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span className="hidden sm:inline">Elfogyott</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-12 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StickyAddToCart;
