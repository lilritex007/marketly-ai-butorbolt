import React, { useState, useRef, useEffect } from 'react';
import { Heart, Eye, ShoppingBag, Info, ThumbsUp, ThumbsDown, Bell, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import { SmartBadges, StockBadge } from '../ui/Badge';
import { getOptimizedImageProps, getAdaptiveQuality } from '../../utils/imageOptimizer';
import {
  trackSectionEvent,
  requestBackInStock,
  toggleLikeProduct,
  toggleDislikeProduct,
  isProductLiked,
  isProductDisliked
} from '../../services/userPreferencesService';

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
  index = 0,
  highlightBadge,
  recommendationReasons = [],
  sectionId,
  showFeedback = false,
  size = 'default',
  tone = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const toneClasses = {
    default: 'lux-card',
    popular: 'lux-card lux-card--popular',
    new: 'lux-card lux-card--new',
    favorites: 'lux-card lux-card--favorites',
    personal: 'lux-card lux-card--personal'
  };
  const sizeClasses = {
    default: {
      image: 'p-3 sm:p-4 lg:p-5',
      content: 'p-4 sm:p-5 lg:p-6'
    },
    compact: {
      image: 'p-2.5 sm:p-3 lg:p-3.5',
      content: 'p-3 sm:p-4 lg:p-4'
    }
  };
  const sizeConfig = sizeClasses[size] || sizeClasses.default;
  const [feedbackState, setFeedbackState] = useState(() => ({
    liked: isProductLiked(product?.id),
    disliked: isProductDisliked(product?.id)
  }));
  const cardRef = useRef(null);
  const impressionRef = useRef(false);

  const images = product.images || [];
  const mainImage = images[0] || PLACEHOLDER_IMAGE;

  const discount = product.salePrice && product.price > product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const displayPrice = product.salePrice || product.price;
  const inStock = product.inStock ?? product.in_stock ?? true;
  const reasonsText = recommendationReasons && recommendationReasons.length > 0
    ? recommendationReasons.slice(0, 2).join(' • ')
    : '';
  const optimizedProps = getOptimizedImageProps(mainImage, product.name, { responsive: true, lazy: false, quality: getAdaptiveQuality() });

  // Intersection Observer for scroll animation - optimized
  useEffect(() => {
    const element = cardRef.current;
    if (!element || !(element instanceof Element)) return;

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

    try {
      observer.observe(element);
    } catch (err) {
      // Silently ignore invalid targets to avoid breaking render
      return;
    }
    return () => observer.disconnect();
  }, [index]);

  useEffect(() => {
    if (sectionId && isVisible && !impressionRef.current) {
      impressionRef.current = true;
      trackSectionEvent(sectionId, 'impression', product?.id);
    }
  }, [sectionId, isVisible, product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    setFeedbackState({
      liked: isProductLiked(product.id),
      disliked: isProductDisliked(product.id)
    });
  }, [product?.id]);

  const handleQuickView = () => {
    if (sectionId) trackSectionEvent(sectionId, 'click', product?.id);
    onQuickView?.(product);
  };

  const handleNotify = (e) => {
    e.stopPropagation();
    requestBackInStock(product);
    setNotifySaved(true);
    setTimeout(() => setNotifySaved(false), 2000);
  };

  return (
    <article 
      ref={cardRef}
      className={`
        group relative rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm
        hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5
        h-full flex flex-col
        ${toneClasses[tone] || ''}
        ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-3'}
        transition-all duration-200
      `}
      style={{ 
        willChange: isVisible ? 'auto' : 'opacity, transform'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Smart Badges */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20">
        <SmartBadges product={product} maxBadges={2} />
        {highlightBadge && (
          <span className="mt-1.5 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
            {highlightBadge}
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleWishlist?.(product.id); 
        }} 
        className={`
          absolute top-3 sm:top-4 right-3 sm:right-4 z-20
          w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 flex items-center justify-center 
          rounded-full shadow-md tap-scale
          ${isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/95 text-gray-500 hover:text-red-500'
          }
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
        `}
        style={{ transition: 'background-color 0.15s, color 0.15s' }}
        aria-label={isWishlisted ? 'Eltávolítás' : 'Kedvencekhez'}
      >
        <Heart className={`w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {reasonsText && (
        <div className="absolute top-14 sm:top-16 right-3 sm:right-4 z-20 group">
          <button
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-md hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            aria-label="Miért ezt ajánljuk?"
            title={reasonsText}
          >
            <Info className="w-4 h-4" />
          </button>
          <div className="absolute right-0 mt-2 w-56 p-2 rounded-lg bg-gray-900 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl">
            {reasonsText}
          </div>
        </div>
      )}

      {/* Image Section - FILL the space */}
      <div 
        onClick={handleQuickView} 
        className="relative aspect-square overflow-hidden ecom-card__image cursor-pointer"
      >
        {/* Simple placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100" />
        )}
        
        {/* Actual image */}
        <img 
          src={imageError ? PLACEHOLDER_IMAGE : (optimizedProps.src || mainImage)}
          alt={product.name} 
          className={`
            w-full h-full object-contain ${sizeConfig.image}
            transition-opacity duration-300 ease-out
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ transform: 'translateZ(0)' }}
          srcSet={optimizedProps.srcSet}
          sizes={optimizedProps.sizes}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />

        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold tracking-wide">
                Elfogyott
              </span>
              <button
                type="button"
                onClick={handleNotify}
                className="px-3 py-1.5 rounded-full bg-white text-gray-800 text-xs font-semibold border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                {notifySaved ? 'Elmentve' : 'Értesítést kérek'}
              </button>
            </div>
          </div>
        )}
        
        {/* Stock badge */}
        <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5">
          <StockBadge inStock={inStock} size="sm" />
        </div>
        
        {/* Desktop hover overlay */}
        <div 
          className="hidden md:flex absolute inset-0 bg-black/40 items-end justify-center pb-6 lg:pb-8 transition-opacity duration-200"
          style={{ opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="bg-white text-gray-900 px-6 py-3 lg:px-8 lg:py-3.5 rounded-full text-base lg:text-lg font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 tap-scale focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          >
            <Eye className="w-5 h-5 lg:w-6 lg:h-6" /> 
            Megnézem
          </button>
        </div>
      </div>

      {/* Content Section - UNIFIED TYPOGRAPHY */}
      <div className={`${sizeConfig.content} flex flex-col flex-1`}>
        {/* Category - small readable (14px) */}
        <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-1.5 truncate">
          {product.category}
        </span>
        
        {/* Product Name - body to large (16-20px) */}
        <h3 
          onClick={handleQuickView} 
          className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-primary-600 transition-colors mb-3" 
          title={product.name}
        >
          {product.name}
        </h3>
        
        {/* Price Section */}
        <div className="mt-auto pt-3 lg:pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              {discount > 0 && (
                <span className="text-sm sm:text-base text-gray-400 line-through block">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className={`text-xl sm:text-2xl lg:text-2xl font-black ${discount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatPrice(displayPrice)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Add to Cart Button */}
              {inStock && onAddToCart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product, 1);
                  }}
                  className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all tap-scale focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                  aria-label="Kosárba"
                  title="Kosárba"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
              {/* Quick View Button */}
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleQuickView(); 
                }} 
                className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all tap-scale focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                aria-label="Részletek"
              >
                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {showFeedback && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFeedbackState(toggleLikeProduct(product));
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 transition-colors ${
                feedbackState.liked
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {feedbackState.liked ? 'Tetszik · mentve' : 'Tetszik'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFeedbackState(toggleDislikeProduct(product));
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 transition-colors ${
                feedbackState.disliked
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {feedbackState.disliked ? 'Nem tetszik · mentve' : 'Nem tetszik'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default EnhancedProductCard;
