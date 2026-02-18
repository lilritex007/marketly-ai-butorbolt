import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { EnhancedProductCard } from './EnhancedProductCard';
import { generateText } from '../../services/geminiService';
import { 
  getSimilarProducts, 
  likeProduct, 
  dislikeProduct, 
  isProductLiked,
  getDislikedProducts 
} from '../../services/userPreferencesService';

/**
 * AI-Powered Similar Products Recommendation
 * Uses user preferences and AI for personalized recommendations
 */
export const SimilarProducts = ({ 
  currentProduct, 
  allProducts, 
  onToggleWishlist, 
  wishlist = [], 
  onQuickView,
  onAddToCart,
  maxResults = 4 
}) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiReason, setAiReason] = useState('');

  useEffect(() => {
    if (currentProduct && allProducts.length > 0) {
      findSimilarProducts();
    }
  }, [currentProduct, allProducts]);

  const findSimilarProducts = async () => {
    setIsLoading(true);
    setAiReason('');

    try {
      // Először próbáljuk a userPreferencesService-t (gyors, lokális)
      const localSimilar = getSimilarProducts(currentProduct, allProducts, maxResults + 4);
      
      if (localSimilar.length >= maxResults) {
        // Van elég lokális találat
        setSimilarProducts(localSimilar.slice(0, maxResults));
        setAiReason('Személyre szabott ajánlás a böngészési előzmények alapján');
        setIsLoading(false);
        return;
      }

      // Ha kevés lokális találat van, kérjünk AI-tól is segítséget
      const productContext = allProducts
        .filter(p => p.id !== currentProduct.id)
        .slice(0, 30)
        .map(p => `${p.name} (${p.category}) - ${(p.salePrice || p.price || 0).toLocaleString('hu-HU')} Ft`)
        .join('\n');

      const prompt = `A vásárló épp ezt nézi: "${currentProduct.name}" (${currentProduct.category})
Ár: ${(currentProduct.salePrice || currentProduct.price || 0).toLocaleString('hu-HU')} Ft

Elérhető termékek:
${productContext}

Ajánlj 4 hasonló terméket ami illik hozzá! 
Válaszolj egyetlen mondatban, hogy MIÉRT passzolnak ezek.
Csak az indoklást írd meg, ne a termékneveket!`;

      const result = await generateText(prompt, { temperature: 0.7, maxTokens: 100 });
      
      if (result.success && result.text) {
        setAiReason(result.text);
      }

      // Kombináljuk a lokális és egyszerű hasonlóságot
      const combined = localSimilar.length > 0 
        ? localSimilar 
        : findBasicSimilar();
      
      setSimilarProducts(combined.slice(0, maxResults));

    } catch (error) {
      console.warn('Similar products error:', error);
      setSimilarProducts(findBasicSimilar());
    } finally {
      setIsLoading(false);
    }
  };

  const findBasicSimilar = () => {
    // Basic similarity: same category, similar price range
    const price = currentProduct.salePrice || currentProduct.price || 0;
    const priceRange = price * 0.4; // ±40%
    const dislikedIds = getDislikedProducts();
    
    const similar = allProducts
      .filter(p => 
        p.id !== currentProduct.id &&
        !dislikedIds.includes(p.id) &&
        (p.category || '').includes((currentProduct.category || '').split(' > ')[0]) &&
        Math.abs((p.salePrice || p.price || 0) - price) <= priceRange
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, maxResults);

    return similar;
  };

  // Feedback kezelés
  const handleLike = (productId) => {
    likeProduct(productId);
  };

  const handleDislike = (productId) => {
    dislikeProduct(productId);
    // Eltávolítjuk a listából
    setSimilarProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (similarProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-secondary-50 to-primary-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 my-8 sm:my-16 rounded-2xl sm:rounded-3xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Neked ajánljuk
              </h2>
            </div>
            {aiReason && (
              <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                {aiReason}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-primary-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="text-base sm:text-lg font-medium">Személyre szabott ajánlás készül...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {similarProducts.map((product, index) => (
              <div key={product.id} className="relative group">
                <EnhancedProductCard
                  product={product}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  showBadges={false}
                  index={index}
                />
                
                {/* Feedback buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLike(product.id); }}
                    className={`p-1.5 rounded-full bg-white shadow-sm ${isProductLiked(product.id) ? 'text-green-600' : 'text-gray-400 hover:text-green-600'} transition-colors`}
                    title="Tetszik"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDislike(product.id); }}
                    className="p-1.5 rounded-full bg-white shadow-sm text-gray-400 hover:text-red-600 transition-colors"
                    title="Nem tetszik"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
