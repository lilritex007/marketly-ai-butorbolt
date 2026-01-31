import React, { useState, useRef } from 'react';
import { Heart, BarChart2, Eye, ShoppingCart, X } from 'lucide-react';

/**
 * SwipeableProductCard - Tinder-style swipe actions
 * Swipe right = Wishlist, Swipe left = Compare
 */
const SwipeableProductCard = ({
  product,
  onWishlist,
  onCompare,
  onQuickView,
  onAddToCart,
  isWishlisted = false,
  isComparing = false,
  children
}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const cardRef = useRef(null);

  const minSwipeDistance = 80;

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e) => {
    const currentTouch = e.touches[0].clientX;
    setTouchEnd(currentTouch);
    
    const diff = currentTouch - touchStart;
    setSwipeOffset(diff);
    
    if (Math.abs(diff) > 30) {
      setSwipeDirection(diff > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      resetSwipe();
      return;
    }
    
    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;
    const isLeftSwipe = distance < -minSwipeDistance;

    if (isRightSwipe) {
      // Wishlist action
      triggerHaptic();
      if (onWishlist) onWishlist(product.id);
      animateAction('right');
    } else if (isLeftSwipe) {
      // Compare action
      triggerHaptic();
      if (onCompare) onCompare(product);
      animateAction('left');
    } else {
      resetSwipe();
    }
  };

  const animateAction = (direction) => {
    setSwipeOffset(direction === 'right' ? 100 : -100);
    setTimeout(resetSwipe, 300);
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setSwipeDirection(null);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const formatPrice = (price) => (price || 0).toLocaleString('hu-HU') + ' Ft';

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background action indicators */}
      <div 
        className={`
          absolute inset-0 flex items-center px-6 transition-opacity duration-200
          ${swipeDirection === 'right' ? 'bg-gradient-to-r from-pink-500 to-red-500 opacity-100' : 'opacity-0'}
        `}
      >
        <div className="flex items-center gap-2 text-white">
          <Heart className="w-8 h-8" fill="white" />
          <span className="font-bold text-lg">Kedvenc</span>
        </div>
      </div>
      
      <div 
        className={`
          absolute inset-0 flex items-center justify-end px-6 transition-opacity duration-200
          ${swipeDirection === 'left' ? 'bg-gradient-to-l from-blue-500 to-primary-500 opacity-100' : 'opacity-0'}
        `}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="font-bold text-lg">Összehasonlít</span>
          <BarChart2 className="w-8 h-8" />
        </div>
      </div>

      {/* Main card */}
      <div
        ref={cardRef}
        className="relative bg-white transition-transform duration-200 ease-out"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          touchAction: 'pan-y'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children || (
          <DefaultProductCard
            product={product}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            isWishlisted={isWishlisted}
            isComparing={isComparing}
            formatPrice={formatPrice}
          />
        )}
      </div>

      {/* Swipe hint (shows once) */}
      {!localStorage.getItem('swipeHintShown') && (
        <SwipeHint onDismiss={() => localStorage.setItem('swipeHintShown', 'true')} />
      )}
    </div>
  );
};

// Default card layout
const DefaultProductCard = ({ product, onQuickView, onAddToCart, isWishlisted, isComparing, formatPrice }) => {
  const price = product.salePrice || product.price || 0;

  return (
    <div className="p-4">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f3f4f6" width="200" height="200"/></svg>'; }}
        />
        
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isWishlisted && (
            <span className="px-2 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
              <Heart className="w-3 h-3" fill="currentColor" /> Kedvenc
            </span>
          )}
          {isComparing && (
            <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> Összehasonlítás
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={() => onQuickView?.(product)}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="font-medium text-gray-900 line-clamp-2 mb-1 text-sm">{product.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-500">{formatPrice(price)}</span>
          <button
            onClick={() => onAddToCart?.(product)}
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// First-time swipe hint
const SwipeHint = ({ onDismiss }) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
      <div className="text-center text-white p-6">
        <div className="flex justify-center gap-8 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mb-2 animate-pulse">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-sm">← Jobbra</span>
            <span className="text-xs text-white/70">Kedvenc</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 animate-pulse">
              <BarChart2 className="w-6 h-6" />
            </div>
            <span className="text-sm">Balra →</span>
            <span className="text-xs text-white/70">Összehasonlít</span>
          </div>
        </div>
        <p className="text-sm mb-4">Húzd a kártyát jobbra vagy balra!</p>
        <button
          onClick={onDismiss}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm"
        >
          Értem
        </button>
      </div>
    </div>
  );
};

export default SwipeableProductCard;
