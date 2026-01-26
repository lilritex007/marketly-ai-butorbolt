import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * QuickAddToCart - One-click add to cart with visual feedback
 * Shows success animation and can be used on product cards
 */
const QuickAddToCart = ({ product, onAdd, className = '' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Haptic feedback (if supported)
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }

    setIsAdding(true);

    try {
      // Simulate add to cart (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onAdd) {
        await onAdd(product);
      }

      setShowSuccess(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setIsAdding(false);
      }, 2000);

    } catch (error) {
      setIsAdding(false);
    }
  };

  return (
    <motion.button
      onClick={handleQuickAdd}
      disabled={isAdding || showSuccess}
      className={`
        relative overflow-hidden
        flex items-center justify-center gap-2
        px-4 py-2 rounded-lg
        font-medium text-sm
        transition-all duration-200
        ${showSuccess 
          ? 'bg-green-500 text-white' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }
        disabled:opacity-80
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isAdding && !showSuccess && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Hozzáadás...</span>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Hozzáadva!</span>
          </motion.div>
        )}

        {!isAdding && !showSuccess && (
          <motion.div
            key="default"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kosárba</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple effect on success */}
      {showSuccess && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-white rounded-lg"
        />
      )}
    </motion.button>
  );
};

export default QuickAddToCart;
