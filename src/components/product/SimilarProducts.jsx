import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { EnhancedProductCard } from './EnhancedProductCard';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA";

/**
 * AI-Powered Similar Products Recommendation
 */
export const SimilarProducts = ({ 
  currentProduct, 
  allProducts, 
  onToggleWishlist, 
  wishlist, 
  onQuickView,
  maxResults = 4 
}) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    if (currentProduct && allProducts.length > 0) {
      if (useAI) {
        findSimilarWithAI();
      } else {
        findSimilarBasic();
      }
    }
  }, [currentProduct, allProducts, useAI]);

  const findSimilarBasic = () => {
    // Basic similarity: same category, similar price range
    const priceRange = currentProduct.price * 0.3; // ±30%
    
    const similar = allProducts
      .filter(p => 
        p.id !== currentProduct.id &&
        p.category === currentProduct.category &&
        Math.abs(p.price - currentProduct.price) <= priceRange
      )
      .slice(0, maxResults);

    setSimilarProducts(similar);
  };

  const findSimilarWithAI = async () => {
    setIsLoading(true);
    try {
      // Get product IDs and basic info for AI
      const productList = allProducts
        .filter(p => p.id !== currentProduct.id)
        .map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          params: p.params
        }));

      const prompt = `Jelenlegi termék: "${currentProduct.name}"
Kategória: ${currentProduct.category}
Ár: ${currentProduct.price} Ft
Paraméterek: ${currentProduct.params || 'Nincs'}

Elérhető termékek (${productList.length} db):
${productList.slice(0, 50).map(p => `- ID:${p.id} | ${p.name} (${p.category}) - ${p.price} Ft`).join('\n')}

Adj vissza JSON-t a ${maxResults} LEGINKÁBB HASONLÓ termék ID-jével:
{
  "similarIds": [id1, id2, id3, id4],
  "reason": "rövid indoklás"
}

Figyelj a stílusra, kategóriára, árkategóriára.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      const data = await response.json();
      const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{"similarIds":[]}');

      const similar = result.similarIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean);

      setSimilarProducts(similar.length > 0 ? similar : findSimilarBasic());
    } catch (error) {
      findSimilarBasic(); // Fallback to basic
    } finally {
      setIsLoading(false);
    }
  };

  if (similarProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 my-16 rounded-3xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Hasonló termékek
              </h2>
            </div>
            <p className="text-gray-600">
              AI ajánlás a(z) <strong>{currentProduct.name}</strong> alapján
            </p>
          </div>
          
          <button
            onClick={() => setUseAI(!useAI)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
            title={useAI ? 'AI ajánlás' : 'Egyszerű ajánlás'}
          >
            {useAI ? (
              <>
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI
              </>
            ) : (
              <>Basic</>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-indigo-600">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="text-lg font-medium">AI elemzi a termékeket...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map(product => (
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
        )}
      </div>
    </div>
  );
};
