import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Check, AlertTriangle, Truck, Clock, Shield, ChevronUp } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

/**
 * StickyAddToCart - Sticky bottom bar for product pages
 * Shows when the product view (modal) is not in viewport, or after scrolling past threshold
 */
const StickyAddToCart = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted = false,
  isVisible = true,
  /** When set, bar is shown only when this element is NOT in viewport (e.g. product modal root) */
  observedElementId = null
}) => {
  const [isShown, setIsShown] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (observedElementId) {
      const el = document.getElementById(observedElementId);
      if (!el) {
        setIsShown(window.scrollY > 400);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsShown(!entry.isIntersecting);
        },
        { threshold: 0.1, root: null }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
    const handleScroll = () => setIsShown(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [observedElementId]);

  if (!product || !isVisible) return null;

  const price = product.salePrice || product.price || 0;
  const originalPrice = product.originalPrice || (product.salePrice ? product.price : null);
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  const stockLevel = typeof product.stockLevel === 'number' ? product.stockLevel : null;
  const isInStock = product.inStock ?? product.in_stock ?? true;
  const isLowStock = isInStock && stockLevel != null && stockLevel <= 5;

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

        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          {/* Product info - mobile - UNIFIED TYPOGRAPHY */}
          <div className="flex-1 min-w-0 sm:hidden">
            <p className="text-base font-medium text-gray-900 truncate">{product.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary-500">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-sm line-through text-gray-400">{formatPrice(originalPrice)}</span>
              )}
            </div>
          </div>

          {/* Product info - desktop - UNIFIED TYPOGRAPHY */}
          <div className="hidden sm:flex items-center gap-4 flex-1">
            <img 
              src={product.images?.[0] || product.image} 
              alt={product.name}
              className="w-16 h-16 object-contain bg-gray-50 rounded-lg"
            />
            <div>
              <p className="font-medium text-gray-900 text-base lg:text-lg line-clamp-1">{product.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl lg:text-2xl font-bold text-primary-500">{formatPrice(price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-base line-through text-gray-400">{formatPrice(originalPrice)}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-bold rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Trust badges - desktop only - UNIFIED TYPOGRAPHY */}
          <div className="hidden lg:flex items-center gap-5 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-600" />
              <span>Ingyenes szállítás</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>2 év garancia</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>24h kiszállítás</span>
            </div>
          </div>

          {/* Actions - UNIFIED TYPOGRAPHY */}
          <div className="flex items-center gap-3">
            {/* Quantity selector - desktop only */}
            <div className="hidden sm:flex items-center border border-gray-200 rounded-xl">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
              >
                -
              </button>
              <span className="px-4 py-2.5 font-medium min-w-[48px] text-center text-base">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
              >
                +
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => onToggleWishlist?.(product.id)}
              className={`
                p-3.5 rounded-xl transition-all
                ${isWishlisted 
                  ? 'bg-red-100 text-red-500' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || addedToCart}
              className={`
                flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl font-bold text-base transition-all
                ${addedToCart 
                  ? 'bg-green-500 text-white' 
                  : isInStock 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-700 text-white hover:shadow-lg hover:scale-[1.02]'
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
        className="absolute -top-12 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-primary-500 hover:border-primary-300 transition-all"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StickyAddToCart;
