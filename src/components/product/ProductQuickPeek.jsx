import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Heart, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickAddToCart from './QuickAddToCart';
import { PLACEHOLDER_IMAGE } from '../../utils/helpers';

/**
 * ProductQuickPeek - Hover/click modal for quick product preview
 * Shows essential info without full page navigation
 */
const ProductQuickPeek = ({ product, isOpen, onClose, onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setActiveImage(0);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Parse product images (array or single)
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image ? [product.image] : [];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Wrapper: always center modal on screen (safe area for mobile) */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none overflow-y-auto">
            {/* Modal: centered, scrolls on small screens */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl max-h-[90vh] my-auto pointer-events-auto flex flex-col"
            >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Gyors előnézet</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content: scrollable, keeps modal centered */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Left: Image */}
                  <div className="space-y-4">
                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                      <img
                        src={images[activeImage] || product.image || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        onLoad={() => setImageLoaded(true)}
                        className={`
                          w-full h-full object-cover
                          transition-all duration-300
                          ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
                        `}
                      />
                      
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {/* Quick View Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-indigo-600">
                        Gyors előnézet
                      </div>
                    </div>

                    {/* Additional images thumbnails (if any) */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            className={`
                              flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                              ${activeImage === idx ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:border-indigo-300'}
                            `}
                          >
                            <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Info */}
                  <div className="flex flex-col gap-4">
                    {/* Category */}
                    <div className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium">
                      <span>{product.category}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-indigo-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Description/Params */}
                    {product.params && (
                      <div className="prose prose-sm max-w-none text-gray-600">
                        <p>{product.params.substring(0, 200)}{product.params.length > 200 ? '...' : ''}</p>
                      </div>
                    )}

                    {/* Features/Specs (if available) */}
                    <div className="border-t border-b border-gray-200 py-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Állapot</span>
                        <span className={`font-medium ${(product.inStock ?? product.in_stock) ? 'text-green-600' : 'text-red-500'}`}>
                          {(product.inStock ?? product.in_stock) ? 'Raktáron' : 'Készlethiány'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Szállítás</span>
                        <span className="font-medium">2-5 munkanap</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto">
                      <QuickAddToCart
                        product={product}
                        onAdd={onAddToCart}
                        className="flex-1"
                      />
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist logic
                        }}
                        className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share logic
                        }}
                        className="p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Full Details Link */}
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
                    >
                      <span>Teljes leírás megtekintése</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickPeek;
