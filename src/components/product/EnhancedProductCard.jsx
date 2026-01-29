import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { StockBadge, NewBadge, DiscountBadge } from '../ui/Badge';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Enhanced Product Card - Golden Standard Responsive Design
 * Mobile: Compact, touch-friendly
 * Tablet: Balanced
 * Desktop: Spacious, detailed
 */
export const EnhancedProductCard = ({ 
  product, 
  onToggleWishlist, 
  isWishlisted, 
  onQuickView,
  onAddToCart,
  showBadges = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const images = product.images || [];
  const mainImage = images[0] || PLACEHOLDER_IMAGE;

  const isNew = product.createdAt && 
    (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

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

  return (
    <article 
      className="group relative bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      {showBadges && (isNew || discount > 0) && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col gap-1 sm:gap-1.5">
          {isNew && <NewBadge />}
          {discount > 0 && <DiscountBadge percent={discount} />}
        </div>
      )}

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
          ${isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/95 text-gray-500 hover:bg-red-50 hover:text-red-500'
          }
        `}
        aria-label={isWishlisted ? 'Eltávolítás' : 'Kedvencekhez'}
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image Section - Square aspect ratio */}
      <div 
        onClick={() => onQuickView?.(product)} 
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        
        <img 
          src={imageError ? PLACEHOLDER_IMAGE : mainImage}
          alt={product.name} 
          className={`
            w-full h-full object-contain p-2 sm:p-3 lg:p-4 transition-all duration-500
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            group-hover:scale-105
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
          hidden md:flex absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
          items-end justify-center pb-4 lg:pb-6 transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="bg-white text-gray-900 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-sm lg:text-base font-semibold shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-gray-50"
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
          className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600 transition-colors mb-2 lg:mb-3" 
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
              className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-600 hover:text-white transition-all"
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
