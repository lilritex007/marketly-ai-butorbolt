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

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Staggered delay based on index
          const delay = Math.min(index % 6 * 50, 250);
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <article 
      ref={cardRef}
      className={`
        group relative bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden 
        shadow-sm hover:shadow-xl border border-gray-100 h-full flex flex-col
        transition-all duration-300 hover-card tap-scale
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${Math.min(index % 6 * 50, 250)}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Smart Badges */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
        <SmartBadges product={product} maxBadges={2} />
      </div>

      {/* Wishlist Button - 44px touch target */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleWishlist?.(product.id); 
        }} 
        className={`
          absolute top-2 sm:top-3 right-2 sm:right-3 z-20
          w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center 
          rounded-full shadow-lg backdrop-blur-sm transition-all duration-200
          hover-lift tap-scale
          ${isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/95 text-gray-500 hover:bg-red-50 hover:text-red-500'
          }
        `}
        aria-label={isWishlisted ? 'Eltávolítás' : 'Kedvencekhez'}
      >
        <Heart className={`w-5 h-5 transition-transform ${isWishlisted ? 'fill-current scale-110' : ''}`} />
      </button>

      {/* Image Section with Blur-up Loading */}
      <div 
        onClick={() => onQuickView?.(product)} 
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
      >
        {/* Blur placeholder */}
        <div 
          className={`
            absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200
            transition-opacity duration-500
            ${imageLoaded ? 'opacity-0' : 'opacity-100'}
          `}
        >
          {/* Shimmer effect while loading */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer bg-[length:200%_100%]" />
        </div>
        
        {/* Actual image */}
        <img 
          src={imageError ? PLACEHOLDER_IMAGE : mainImage}
          alt={product.name} 
          className={`
            w-full h-full object-contain p-2 sm:p-3 lg:p-4 
            transition-all duration-500
            ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
            group-hover:scale-110
          `}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />
        
        {/* Stock badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
          <StockBadge inStock={inStock} />
        </div>
        
        {/* Desktop hover overlay */}
        <div className={`
          hidden md:flex absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent
          items-end justify-center pb-4 lg:pb-6 transition-all duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="bg-white text-gray-900 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-sm lg:text-base font-semibold shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-gray-50 hover-lift"
          >
            <Eye className="w-4 h-4 lg:w-5 lg:h-5" /> 
            Megnézem
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[11px] sm:text-xs lg:text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1 lg:mb-1.5">
          {product.category}
        </span>
        
        {/* Product Name */}
        <h3 
          onClick={() => onQuickView?.(product)} 
          className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600 transition-colors mb-2 lg:mb-3 underline-slide" 
          title={product.name}
        >
          {product.name}
        </h3>
        
        {/* Price Section */}
        <div className="mt-auto pt-2 sm:pt-3 lg:pt-4 border-t border-gray-100">
          <div className="flex justify-between items-end gap-2">
            <div className="min-w-0">
              {discount > 0 && (
                <span className="text-xs sm:text-sm text-gray-400 line-through block">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className={`text-base sm:text-lg lg:text-xl font-extrabold ${discount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatPrice(displayPrice)}
              </span>
            </div>
            
            {/* Quick View Button - 44px touch target */}
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onQuickView?.(product); 
              }} 
              className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-600 hover:text-white transition-all hover-lift tap-scale"
              aria-label="Részletek"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default EnhancedProductCard;
