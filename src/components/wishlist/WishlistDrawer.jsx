import React, { useState } from 'react';
import { X, Heart, Trash2, ShoppingCart, Share2, ChevronRight, Sparkles, Package } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { formatPrice } from '../../utils/helpers';

/**
 * WishlistDrawer - Slide-in sidebar showing all wishlist items
 * Features: Remove items, add all to cart, share wishlist, AI recommendations
 */
const WishlistDrawer = ({ 
  isOpen, 
  onClose, 
  wishlistItems = [], 
  onRemove, 
  onAddToCart, 
  onProductClick,
  onClearAll 
}) => {
  const [isClosing, setIsClosing] = useState(false);
  useScrollLock(isOpen);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const totalValue = wishlistItems.reduce((sum, item) => sum + (item.salePrice || item.price || 0), 0);

  const handleShare = async () => {
    const text = `Nézd meg a kívánságlistámat! ${wishlistItems.length} termék, összesen ${formatPrice(totalValue)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kívánságlistám - Marketly.AI',
          text,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text + ' ' + window.location.href);
          alert('Link másolva a vágólapra!');
        } else {
          alert('Nem sikerült másolni. Próbáld meg manuálisan.');
        }
      } catch {
        alert('Nem sikerült másolni. Próbáld meg manuálisan.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 lg:top-[60px] bg-black transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-50'}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div 
        className={`
          absolute top-0 lg:top-[60px] right-0 h-full lg:h-[calc(100vh-60px)] w-full max-w-md bg-white shadow-2xl
          transition-transform duration-300 ease-out
          ${isClosing ? 'translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Header - UNIFIED TYPOGRAPHY */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6" fill="white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Kívánságlista</h2>
                <p className="text-white/80 text-sm sm:text-base">{wishlistItems.length} termék</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-180px)] overflow-hidden">
          {wishlistItems.length === 0 ? (
            /* Empty state - UNIFIED TYPOGRAPHY */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-12 h-12 text-pink-300" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Üres a kívánságlista</h3>
              <p className="text-base text-gray-500 mb-6">Adj hozzá termékeket a szív ikonra kattintva!</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold text-base rounded-xl hover:shadow-lg transition-all"
              >
                Böngészés
              </button>
            </div>
          ) : (
            /* Items list */
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {wishlistItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <div 
                      className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden cursor-pointer shrink-0"
                      onClick={() => {
                        onProductClick?.(item);
                        handleClose();
                      }}
                    >
                      <img
                        src={item.images?.[0] || item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
                      />
                    </div>

                    {/* Info - UNIFIED TYPOGRAPHY */}
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 cursor-pointer hover:text-primary-500 transition-colors"
                        onClick={() => {
                          onProductClick?.(item);
                          handleClose();
                        }}
                      >
                        {item.name}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-primary-500 mt-1">
                        {formatPrice(item.salePrice || item.price)}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onAddToCart?.(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Kosárba
                        </button>
                        <button
                          onClick={() => onRemove?.(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eltávolítás"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - UNIFIED TYPOGRAPHY */}
        {wishlistItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600">Összérték:</span>
              <span className="text-2xl font-bold text-gray-900">{formatPrice(totalValue)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 font-bold text-sm sm:text-base rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Megosztás
              </button>
              <button
                onClick={() => {
                  wishlistItems.forEach(item => onAddToCart?.(item));
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-secondary-700 text-white font-bold text-sm sm:text-base rounded-xl hover:shadow-lg transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Mind a kosárba
              </button>
            </div>

            {/* Clear all */}
            <button
              onClick={onClearAll}
              className="w-full text-center text-sm sm:text-base text-gray-400 hover:text-red-500 transition-colors py-2"
            >
              Lista törlése
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistDrawer;
