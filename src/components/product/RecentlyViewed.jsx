import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { EnhancedProductCard } from './EnhancedProductCard';

/**
 * Recently Viewed Products - Tracks and displays user's browsing history
 */
export const RecentlyViewed = ({ 
  onToggleWishlist, 
  wishlist, 
  onQuickView,
  maxItems = 4 
}) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    setRecentProducts(recent.slice(0, maxItems));

    // Listen for storage changes (when new product is viewed)
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      setRecentProducts(updated.slice(0, maxItems));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('recently-viewed-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('recently-viewed-updated', handleStorageChange);
    };
  }, [maxItems]);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 my-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Utoljára megtekintett
              </h2>
            </div>
            <p className="text-gray-600">
              Böngéssz vissza a nemrég nézett termékek között
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map(product => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
              onQuickView={onQuickView}
              showBadges={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Utility function to track viewed products
 * Call this when a product is viewed (e.g., in ProductModal)
 */
export const trackProductView = (product) => {
  try {
    const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    
    // Remove if already exists
    const filtered = recent.filter(p => p.id !== product.id);
    
    // Add to beginning
    const updated = [product, ...filtered].slice(0, 10); // Keep max 10
    
    localStorage.setItem('recently_viewed', JSON.stringify(updated));
    
    // Dispatch custom event
    window.dispatchEvent(new Event('recently-viewed-updated'));
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};
