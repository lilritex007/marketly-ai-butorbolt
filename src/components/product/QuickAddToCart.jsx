import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';

/**
 * QuickAddToCart - One-click add to cart with visual feedback
 * Uses CSS transitions instead of framer-motion
 */
const QuickAddToCart = ({ product, onAdd, className = '' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }

    setIsAdding(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onAdd) {
        await onAdd(product);
      }

      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setIsAdding(false);
      }, 2000);

    } catch (error) {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={isAdding || showSuccess}
      className={`
        relative overflow-hidden
        flex items-center justify-center gap-2
        px-4 py-2 rounded-lg
        font-medium text-sm
        transition-all duration-200
        transform hover:scale-105 active:scale-95
        ${showSuccess 
          ? 'bg-green-500 text-white' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }
        disabled:opacity-80
        ${className}
      `}
    >
      {isAdding && !showSuccess && (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Hozzáadás...</span>
        </span>
      )}

      {showSuccess && (
        <span className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Hozzáadva!</span>
        </span>
      )}

      {!isAdding && !showSuccess && (
        <span className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Kosárba</span>
        </span>
      )}
    </button>
  );
};

export default QuickAddToCart;
