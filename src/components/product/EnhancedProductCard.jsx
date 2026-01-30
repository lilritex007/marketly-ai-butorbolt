import React, { useState, useRef, useEffect } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { SmartBadges, StockBadge } from '../ui/Badge';

// Tiny placeholder for blur-up effect (1x1 transparent pixel)
const BLUR_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%23f3f4f6" width="1" height="1"/%3E%3C/svg%3E';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Enhanced Product Card with:
 * - Blur-up lazy loading images
 * - Smart badges (New, Sale, Popular)
 * - Micro-interactions
 * - Scroll animations
 */
export const EnhancedProductCard = ({ 
  product, 
  onToggleWishlist, 
  isWishlisted, 
  onQuickView,
  onAddToCart,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const images = product.images || [];
  const mainImage = images[0] || PLACEHOLDER_IMAGE;

  const discount = product.salePrice && product.price > product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const displayPrice = product.salePrice || product.price;
  const inStock = product.inStock ?? product.in_stock ?? true;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU', { 
      style: 'currency', 
      currency: 'HUF', 
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Intersection Observer for scroll animation - optimized
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    // Use requestIdleCallback for non-critical animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Minimal stagger, max 100ms
          const delay = Math.min((index % 4) * 25, 100);
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '100px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [index]);

  return (
    <article 
      ref={cardRef}
      className={`
        group relative bg-white rounded-xl sm:rounded-2xl lg:rounded-2xl xl:rounded-3xl overflow-hidden 
        border border-gray-100 shadow-sm hover:shadow-xl h-full flex flex-col
        hover-card tap-scale
        ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-3'}
      `}
      style={{ 
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out, box-shadow 0.2s ease-out',
        willChange: isVisible ? 'auto' : 'opacity, transform'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Smart Badges - VISIBLE and clear */}
      <div className="absolute top-2 sm:top-3 lg:top-4 xl:top-5 left-2 sm:left-3 lg:left-4 xl:left-5 z-20">
        <SmartBadges product={product} maxBadges={2} />
      </div>

      {/* Wishlist Button - UNIFIED touch target */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleWishlist?.(product.id); 
        }} 
        className={`
          absolute top-2 sm:top-3 lg:top-4 xl:top-5 right-2 sm:right-3 lg:right-4 xl:right-5 z-20
          w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 flex items-center justify-center 
          rounded-full shadow-lg tap-scale
          ${isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/95 text-gray-500 hover:text-red-500'
          }
        `}
        style={{ transition: 'background-color 0.15s, color 0.15s' }}
        aria-label={isWishlisted ? 'Eltávolítás' : 'Kedvencekhez'}
      >
        <Heart className={`w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image Section - FILL the space */}
      <div 
        onClick={() => onQuickView?.(product)} 
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
      >
        {/* Simple placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100" />
        )}
        
        {/* Actual image - generous padding for clarity */}
        <img 
          src={imageError ? PLACEHOLDER_IMAGE : mainImage}
          alt={product.name} 
          className={`
            w-full h-full object-contain p-3 sm:p-4 lg:p-6 xl:p-8
            transition-opacity duration-300 ease-out
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ transform: 'translateZ(0)' }}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />
        
        {/* Stock badge */}
        <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4">
          <StockBadge inStock={inStock} />
        </div>
        
        {/* Desktop hover overlay - lightweight */}
        <div 
          className="hidden md:flex absolute inset-0 bg-black/40 items-end justify-center pb-6 lg:pb-8 xl:pb-10 transition-opacity duration-200"
          style={{ opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="bg-white text-gray-900 px-5 py-2.5 lg:px-6 lg:py-3 xl:px-8 xl:py-4 rounded-full text-sm lg:text-base xl:text-lg font-bold shadow-lg flex items-center gap-2 lg:gap-3 hover:bg-gray-50 tap-scale"
          >
            <Eye className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" /> 
            Megnézem
          </button>
        </div>
      </div>

      {/* Content Section - UNIFIED typography scale */}
      <div className="p-3 sm:p-4 lg:p-5 xl:p-6 flex flex-col flex-1">
        {/* Category - visible */}
        <span className="text-xs sm:text-xs lg:text-sm xl:text-base font-bold text-indigo-600 uppercase tracking-wide mb-1 lg:mb-2 truncate">
          {product.category}
        </span>
        
        {/* Product Name - UNIFIED scale */}
        <h3 
          onClick={() => onQuickView?.(product)} 
          className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 line-clamp-2 leading-tight cursor-pointer hover:text-indigo-600 transition-colors mb-2 lg:mb-3" 
          title={product.name}
        >
          {product.name}
        </h3>
        
        {/* Price Section - UNIFIED scale */}
        <div className="mt-auto pt-2 lg:pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center gap-2 lg:gap-3">
            <div className="min-w-0">
              {discount > 0 && (
                <span className="text-sm sm:text-sm lg:text-base text-gray-400 line-through block">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black ${discount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatPrice(displayPrice)}
              </span>
            </div>
            
            {/* Quick View Button - UNIFIED */}
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onQuickView?.(product); 
              }} 
              className="shrink-0 w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 flex items-center justify-center bg-indigo-600 text-white rounded-xl lg:rounded-2xl hover:bg-indigo-700 transition-all tap-scale"
              aria-label="Részletek"
            >
              <Eye className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default EnhancedProductCard;
