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
      {/* Smart Badges */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20">
        <SmartBadges product={product} maxBadges={2} />
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleWishlist?.(product.id); 
        }} 
        className={`
          absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-20
          w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex items-center justify-center 
          rounded-full shadow-md tap-scale
          ${isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/95 text-gray-500 hover:text-red-500'
          }
        `}
        style={{ transition: 'background-color 0.15s, color 0.15s' }}
        aria-label={isWishlisted ? 'Eltávolítás' : 'Kedvencekhez'}
      >
        <Heart className={`w-4.5 h-4.5 sm:w-5 sm:h-5 lg:w-5 lg:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
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
        
        {/* Actual image */}
        <img 
          src={imageError ? PLACEHOLDER_IMAGE : mainImage}
          alt={product.name} 
          className={`
            w-full h-full object-contain p-3 sm:p-4 lg:p-5
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
        <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5">
          <StockBadge inStock={inStock} size="sm" />
        </div>
        
        {/* Desktop hover overlay */}
        <div 
          className="hidden md:flex absolute inset-0 bg-black/40 items-end justify-center pb-5 lg:pb-6 transition-opacity duration-200"
          style={{ opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="bg-white text-gray-900 px-5 py-2.5 lg:px-6 lg:py-3 rounded-full text-sm lg:text-base font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 tap-scale"
          >
            <Eye className="w-4 h-4 lg:w-5 lg:h-5" /> 
            Megnézem
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[11px] sm:text-xs lg:text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1 lg:mb-1.5 truncate">
          {product.category}
        </span>
        
        {/* Product Name */}
        <h3 
          onClick={() => onQuickView?.(product)} 
          className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600 transition-colors mb-2" 
          title={product.name}
        >
          {product.name}
        </h3>
        
        {/* Price Section */}
        <div className="mt-auto pt-2.5 lg:pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0">
              {discount > 0 && (
                <span className="text-xs sm:text-sm text-gray-400 line-through block">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className={`text-lg sm:text-xl lg:text-2xl font-black ${discount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatPrice(displayPrice)}
              </span>
            </div>
            
            {/* Quick View Button */}
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onQuickView?.(product); 
              }} 
              className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all tap-scale"
              aria-label="Részletek"
            >
              <Eye className="w-5 h-5 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default EnhancedProductCard;
