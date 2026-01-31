import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, Package, Sparkles } from 'lucide-react';

/**
 * FloatingCartPreview - Shows cart preview when items are added
 * Features: Mini cart, quick remove, checkout button, upsell suggestions
 */
const FloatingCartPreview = ({ 
  cartItems = [], 
  onRemove,
  onUpdateQuantity,
  onCheckout,
  onViewCart,
  recentlyAdded = null, // Last added product for animation
  suggestedProducts = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);

  // Show notification when item is added
  useEffect(() => {
    if (recentlyAdded) {
      setShowAddedNotification(true);
      setIsExpanded(true);
      
      const timer = setTimeout(() => {
        setShowAddedNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [recentlyAdded]);

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.salePrice || item.price || 0) * (item.quantity || 1), 0);

  const formatPrice = (price) => (price || 0).toLocaleString('hu-HU') + ' Ft';

  if (cartItems.length === 0) return null;

  return (
    <>
      {/* Floating cart button */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
        {/* Added notification */}
        {showAddedNotification && recentlyAdded && (
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg animate-bounce-in max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg overflow-hidden shrink-0">
                <img 
                  src={recentlyAdded.images?.[0] || recentlyAdded.image} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">Kosárba téve!</p>
                <p className="text-xs text-white/80 truncate">{recentlyAdded.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cart button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-scale-in">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Expanded cart preview */}
      {isExpanded && (
        <div className="fixed bottom-40 right-4 z-50 w-80 max-h-[60vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold">Kosár ({totalItems})</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-60 overflow-y-auto p-3 space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                  <img 
                    src={item.images?.[0] || item.image} 
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-sm font-bold text-indigo-600">
                    {formatPrice(item.salePrice || item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Quantity controls */}
                  <button
                    onClick={() => onUpdateQuantity?.(item.id, Math.max(0, (item.quantity || 1) - 1))}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity || 1}</span>
                  <button
                    onClick={() => onUpdateQuantity?.(item.id, (item.quantity || 1) + 1)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => onRemove?.(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upsell suggestion */}
          {suggestedProducts.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2 text-amber-700 text-xs font-medium mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Ajánljuk mellé:
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestedProducts.slice(0, 3).map((product) => (
                  <div 
                    key={product.id}
                    className="shrink-0 w-16 text-center cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden mb-1 shadow-sm">
                      <img 
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 line-clamp-1">{product.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Összesen:</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onViewCart}
                className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Kosár
              </button>
              <button
                onClick={onCheckout}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-1 text-sm"
              >
                Pénztár <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.4s ease-out; }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default FloatingCartPreview;
