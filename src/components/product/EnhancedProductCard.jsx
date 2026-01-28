import React, { useState } from 'react';
import { Heart, Eye, Plus, ShoppingBag, Share2, ArrowLeftRight } from 'lucide-react';
import { AIBadge, StockBadge, NewBadge, TrendingBadge, DiscountBadge } from '../ui/Badge';

/**
 * Enhanced Product Card with animations and badges
 */
export const EnhancedProductCard = ({ 
  product, 
  onToggleWishlist, 
  isWishlisted, 
  onQuickView,
  onAddToCart,
  showBadges = true,
  isInComparison = false,
  onToggleComparison
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const images = product.images || [];

  // Determine if product is new (added in last 7 days)
  const isNew = product.createdAt && 
    (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  // Calculate discount if sale price exists
  const discount = product.salePrice && product.price > product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const displayPrice = product.salePrice || product.price;

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      {showBadges && (
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {isNew && <NewBadge />}
          {discount > 0 && <DiscountBadge percent={discount} />}
          {product.trending && <TrendingBadge />}
          {product.aiRecommended && <AIBadge size="sm" animate />}
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggleWishlist(product.id); 
          }} 
          className={`
            p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all transform 
            ${isWishlisted 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:scale-110'
            }
          `}
          aria-label="Hozzáadás kívánságlistához"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''} transition-transform ${isWishlisted ? 'animate-ping-once' : ''}`} />
        </button>
        
        {/* Comparison Button */}
        {onToggleComparison && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComparison(product);
            }}
            className={`
              p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110
              ${isInComparison
                ? 'bg-indigo-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }
            `}
            aria-label="Összehasonlítás"
            title={isInComparison ? 'Eltávolítás az összehasonlításból' : 'Hozzáadás az összehasonlításhoz'}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        )}
        
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.share?.({
                title: product.name,
                text: `Nézd meg: ${product.name}`,
                url: product.link
              });
            }}
            className="p-2.5 rounded-full bg-white/90 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 animate-slide-in-down"
            aria-label="Megosztás"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Image section */}
      <div 
        onClick={(e) => { e.stopPropagation(); onQuickView(product); }} 
        className="relative h-64 overflow-hidden bg-gray-50 cursor-pointer shrink-0"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        )}
        
        <img 
          src={images[0] || PLACEHOLDER_IMAGE} 
          alt={product.name} 
          className={`
            w-full h-full object-contain p-4 transition-all duration-700
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            ${isHovered && images[1] ? 'opacity-0 scale-105' : 'scale-100'}
          `}
          loading="lazy" 
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {e.target.src = PLACEHOLDER_IMAGE}} 
        />
        
        {images[1] && (
          <img 
            src={images[1]} 
            alt={product.name + " alt"} 
            className={`
              absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700
              ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}
            `}
            loading="lazy"
            onError={(e) => {e.target.style.display='none'}}
          />
        )}
        
        {/* Stock label */}
        <div className="absolute bottom-3 left-3">
          <StockBadge inStock={product.inStock} count={product.stockCount} />
        </div>
        
        {/* Hover overlay with quick view */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
          flex items-end justify-center pb-6 transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2 hover:bg-gray-100"
            >
              <Eye className="w-4 h-4" /> Gyorsnézet
            </button>
            {onAddToCart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="bg-indigo-600 text-white p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-indigo-700"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <h3 
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }} 
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-indigo-600 transition-colors" 
          title={product.name}
        >
          {product.name}
        </h3>
        
        {product.params && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-3">
            {product.params.split(',')[0]?.trim()}
          </p>
        )}
        
        {/* Price section */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through block">
                  {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.price)}
                </span>
              )}
              <span className={`text-xl font-extrabold ${discount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(displayPrice)}
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }} 
              className="bg-gray-100 text-gray-900 p-2.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 hover:rotate-90 shadow-sm"
              aria-label="Részletek"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes ping-once {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes slide-in-down {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-ping-once {
            animation: ping-once 0.5s ease-out;
          }
          .animate-slide-in-down {
            animation: slide-in-down 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};
