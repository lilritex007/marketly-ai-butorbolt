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
  showFeedback = true,
  size = 'default',
  tone = 'default',
  accentClass, // világ gradiens pl. 'from-pink-500 to-rose-600' – teljes kártyás megkülönböztetés
  skipScrollAnimation = false, // Worlds: állandó megjelenés, ne villanjon fel
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(skipScrollAnimation);
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
      image: 'p-2 sm:p-3 md:p-4 lg:p-5',
      content: 'p-4 sm:p-5',
      contentMinH: 'min-h-[160px] sm:min-h-[180px]'
    },
    compact: {
      image: 'p-2 sm:p-2.5 md:p-3 lg:p-3.5',
      content: 'p-4 sm:p-5',
      contentMinH: 'min-h-[140px] sm:min-h-[155px]'
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

  // Intersection Observer for scroll animation – kihagyva ha skipScrollAnimation (Worlds)
  const timeoutRef = useRef(null);
  useEffect(() => {
    if (skipScrollAnimation) return;
    const element = cardRef.current;
    if (!element || !(element instanceof Element)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = Math.min((index % 4) * 25, 100);
          if (delay > 0) {
            timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
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
    } catch {
      return;
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      observer.disconnect();
    };
  }, [index, skipScrollAnimation]);

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

  const hasWorldAccent = accentClass && (tone === 'favorites' || tone === 'new' || tone === 'popular');
  const worldGlow = hasWorldAccent && {
    favorites: 'radial-gradient(ellipse 120% 120% at 100% 100%, rgba(244,63,94,0.18) 0%, transparent 50%)',
    new: 'radial-gradient(ellipse 120% 120% at 100% 100%, rgba(139,92,246,0.18) 0%, transparent 50%)',
    popular: 'radial-gradient(ellipse 120% 120% at 100% 100%, rgba(251,191,36,0.18) 0%, transparent 50%)',
  }[tone];
  const worldCorner = hasWorldAccent && {
    favorites: 'linear-gradient(315deg, rgba(244,63,94,0.45) 0%, transparent 40%)',
    new: 'linear-gradient(315deg, rgba(139,92,246,0.45) 0%, transparent 40%)',
    popular: 'linear-gradient(315deg, rgba(251,191,36,0.45) 0%, transparent 40%)',
  }[tone];

  return (
    <article 
      ref={cardRef}
      className={`
        group relative rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm
        hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 active:scale-[0.99]
        h-full flex flex-col touch-manipulation
        ${toneClasses[tone] || ''}
        ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-3'}
        transition-all duration-200
      `}
      style={{ willChange: isVisible ? 'auto' : 'opacity, transform' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Világ dizájn – bal él (kártya eleje) border, jobb alsó sarok gradient */}
      {hasWorldAccent && (
        <>
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: worldGlow }} aria-hidden />
          <div className="absolute bottom-0 right-0 w-16 h-16 z-[2] pointer-events-none" style={{ background: worldCorner, clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} aria-hidden />
          <div className={`absolute left-0 top-0 bottom-0 w-2 sm:w-2.5 bg-gradient-to-b ${accentClass} z-[2] pointer-events-none`} aria-hidden />
        </>
      )}
      {/* Smart Badges - kisebb mobilon */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
        <SmartBadges product={product} maxBadges={2} />
        {highlightBadge && (
          <span className="mt-1.5 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
            {highlightBadge}
          </span>
        )}
      </div>

      {/* Wishlist Button - min 44px touch target mobilon */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleWishlist?.(product.id); 
        }} 
        className={`
          absolute top-2 sm:top-3 right-2 sm:right-4 z-20
          min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 flex items-center justify-center 
          rounded-full shadow-md tap-scale touch-manipulation
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
        
        {/* Actual image - width/height prevents CLS */}
        <img 
          src={imageError ? PLACEHOLDER_IMAGE : (optimizedProps.src || mainImage)}
          alt={product.name}
          width={400}
          height={400}
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
        
        {/* Stock badge - kompakt mobilon */}
        <div className="absolute bottom-1.5 sm:bottom-2.5 left-1.5 sm:left-2.5">
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

      {/* Content Section - gombok alul, középre, magasabb kártya */}
      <div className={`${sizeConfig.content} ${sizeConfig.contentMinH || 'min-h-[160px]'} flex flex-col flex-1`}>
        {/* Category - kompakt */}
        <span className="text-xs sm:text-sm font-semibold text-primary-600 uppercase tracking-wide mb-1 truncate">
          {product.category}
        </span>
        
        {/* Product Name - 2 sor, biztosan férjen ki, kompakt betűméret */}
        <h3 
          onClick={handleQuickView} 
          className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 line-clamp-2 leading-tight cursor-pointer hover:text-primary-600 active:text-primary-700 transition-colors mb-2 min-h-[2.4em] overflow-hidden touch-manipulation" 
          title={product.name}
        >
          {product.name}
        </h3>
        
        {/* Ár - nagy, szembetűnő; eredeti áthúzva pirosan, kedvezmény % */}
        <div className="pt-2 sm:pt-3 border-t border-gray-100 text-center space-y-1 min-w-0">
          {discount > 0 ? (
            <>
              <span className="text-sm sm:text-base text-red-600 line-through block font-semibold">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-red-600 block">
                {formatPrice(displayPrice)}
              </span>
              <span className="inline-block px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs sm:text-sm font-black">
                -{discount}%
              </span>
            </>
          ) : (
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 block">
              {formatPrice(displayPrice)}
            </span>
          )}
        </div>
        
        {/* Tetszik / Nem tetszik - ikonok csak, középre, a CTA gombok fölé */}
        {showFeedback && (
          <div className="mt-3 flex justify-center items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFeedbackState(toggleLikeProduct(product));
              }}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors tap-scale touch-manipulation ${
                feedbackState.liked
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
              aria-label={feedbackState.liked ? 'Tetszik (eltávolítás)' : 'Tetszik'}
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFeedbackState(toggleDislikeProduct(product));
              }}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors tap-scale touch-manipulation ${
                feedbackState.disliked
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}
              aria-label={feedbackState.disliked ? 'Nem tetszik (eltávolítás)' : 'Nem tetszik'}
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* CTA gombok - Kosárba hangsúlyosabb */}
        <div className="mt-3 sm:mt-4 flex justify-center items-center gap-2 sm:gap-3">
          {inStock && onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, 1);
              }}
              className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 active:bg-emerald-700 transition-all tap-scale touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 shadow-lg shadow-emerald-500/30 font-bold text-sm sm:text-base"
              aria-label="Kosárba"
              title="Kosárba"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <span>Kosárba</span>
            </button>
          )}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleQuickView(); 
            }} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-all tap-scale touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            aria-label="Megnézem"
            title="Megnézem"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-sm font-bold ml-1.5">Megnézem</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default EnhancedProductCard;
