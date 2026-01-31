import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Plus, ShoppingBag, Check, ChevronRight, Package, Percent } from 'lucide-react';
import { generateText } from '../../services/geminiService';

/**
 * CompleteTheLook - AI-powered bundle suggestions
 * "Add hozzá ezeket is és kapj kedvezményt!"
 */
const CompleteTheLook = ({ currentProduct, allProducts, onAddToCart, onViewProduct }) => {
  const [bundleItems, setBundleItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bundleTitle, setBundleTitle] = useState('Tedd teljessé a szobát');

  useEffect(() => {
    if (currentProduct && allProducts?.length > 0) {
      findComplementaryProducts();
    }
  }, [currentProduct, allProducts]);

  const findComplementaryProducts = async () => {
    setIsLoading(true);
    
    try {
      // Kategória és típus alapú párosítások
      const complementaryMap = {
        'kanapé': ['dohányzóasztal', 'fotel', 'lámpa', 'szőnyeg', 'polc', 'puff'],
        'ülőgarnitúra': ['dohányzóasztal', 'fotel', 'lámpa', 'szőnyeg', 'tv állvány'],
        'ágy': ['éjjeliszekrény', 'matrac', 'komód', 'lámpa', 'tükör', 'szekrény'],
        'franciaágy': ['éjjeliszekrény', 'matrac', 'komód', 'lámpa', 'gardrób'],
        'étkezőasztal': ['szék', 'étkező', 'tálaló', 'lámpa', 'vitrin'],
        'asztal': ['szék', 'lámpa', 'polc'],
        'íróasztal': ['forgószék', 'polc', 'lámpa', 'irattartó'],
        'szék': ['asztal', 'étkező'],
        'fotel': ['dohányzóasztal', 'lámpa', 'puff', 'takaró'],
        'szekrény': ['komód', 'tükör', 'polc'],
        'tv állvány': ['polc', 'lámpa', 'dohányzóasztal'],
      };

      const productName = (currentProduct.name || '').toLowerCase();
      const productCategory = (currentProduct.category || '').toLowerCase();
      
      // Keressük meg a megfelelő kiegészítőket
      let searchTerms = [];
      
      Object.entries(complementaryMap).forEach(([key, complements]) => {
        if (productName.includes(key) || productCategory.includes(key)) {
          searchTerms.push(...complements);
        }
      });

      // Ha nincs specifikus match, általános kiegészítők
      if (searchTerms.length === 0) {
        searchTerms = ['lámpa', 'polc', 'szőnyeg', 'dekoráció'];
      }

      // Keresés a termékek között
      const currentPrice = currentProduct.salePrice || currentProduct.price || 0;
      const priceRange = currentPrice * 0.8; // Hasonló árkategória
      
      const matches = allProducts
        .filter(p => {
          if (p.id === currentProduct.id) return false;
          const pName = (p.name || '').toLowerCase();
          const pCat = (p.category || '').toLowerCase();
          const pPrice = p.salePrice || p.price || 0;
          
          // Ne legyen túl drága
          if (pPrice > currentPrice * 1.5) return false;
          
          // Keressük a kiegészítőket
          return searchTerms.some(term => pName.includes(term) || pCat.includes(term));
        })
        .map(p => {
          let score = 0;
          const pName = (p.name || '').toLowerCase();
          const pCat = (p.category || '').toLowerCase();
          
          searchTerms.forEach(term => {
            if (pName.includes(term)) score += 10;
            if (pCat.includes(term)) score += 5;
          });
          
          return { product: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(m => m.product);

      // Ha van találat, tegyük be
      if (matches.length >= 2) {
        setBundleItems(matches.slice(0, 4));
        
        // AI generált cím
        const prompt = `Írj egy rövid, vonzó marketing címet (max 6 szó) ami arra ösztönöz, hogy a "${currentProduct.name}" mellé vegyék meg a kiegészítőket is. Magyarul, kreatívan!`;
        
        const result = await generateText(prompt, { temperature: 0.9, maxTokens: 30 });
        if (result.success && result.text) {
          setBundleTitle(result.text.replace(/["']/g, '').trim());
        }
      } else {
        // Fallback: random népszerű termékek
        const fallbackProducts = allProducts
          .filter(p => p.id !== currentProduct.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
        setBundleItems(fallbackProducts);
      }

    } catch (error) {
      console.warn('Bundle search error:', error);
      // Fallback
      const fallback = allProducts
        .filter(p => p.id !== currentProduct.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      setBundleItems(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const formatPrice = (price) => (price || 0).toLocaleString('hu-HU');

  // Számítások
  const selectedProducts = bundleItems.filter(p => selectedItems.includes(p.id));
  const bundleOriginalPrice = selectedProducts.reduce((sum, p) => sum + (p.salePrice || p.price || 0), 0);
  const bundleDiscount = selectedProducts.length >= 2 ? 0.1 : selectedProducts.length >= 3 ? 0.15 : 0; // 10-15% kedvezmény
  const bundleFinalPrice = bundleOriginalPrice * (1 - bundleDiscount);
  const savedAmount = bundleOriginalPrice - bundleFinalPrice;

  const handleAddBundle = () => {
    selectedProducts.forEach(product => {
      if (onAddToCart) onAddToCart(product);
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-amber-200/50 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-3">
              <div className="aspect-square bg-amber-100 rounded-lg mb-2" />
              <div className="h-4 bg-amber-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bundleItems.length < 2) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-5 sm:p-6 border border-amber-200/50 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl">{bundleTitle}</h3>
            <p className="text-amber-700 text-sm">Válassz kiegészítőket és spórolj!</p>
          </div>
        </div>
        
        {bundleDiscount > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg animate-pulse">
            <Percent className="w-4 h-4" />
            -{Math.round(bundleDiscount * 100)}%
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {bundleItems.map((product) => {
          const isSelected = selectedItems.includes(product.id);
          const price = product.salePrice || product.price || 0;
          
          return (
            <button
              key={product.id}
              onClick={() => toggleItem(product.id)}
              className={`
                relative bg-white rounded-xl p-3 text-left transition-all duration-300
                ${isSelected 
                  ? 'ring-2 ring-amber-500 shadow-lg scale-[1.02]' 
                  : 'hover:shadow-md hover:scale-[1.01] border border-gray-100'
                }
              `}
            >
              {/* Selection indicator */}
              <div className={`
                absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all
                ${isSelected 
                  ? 'bg-amber-500 text-white scale-100' 
                  : 'bg-gray-200 text-gray-400 scale-90'
                }
              `}>
                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>

              {/* Image */}
              <div className="aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden">
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
                />
              </div>

              {/* Info */}
              <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 mb-1 leading-tight">
                {product.name}
              </p>
              <p className="text-sm sm:text-base font-bold text-amber-600">
                {formatPrice(price)} Ft
              </p>
            </button>
          );
        })}
      </div>

      {/* Bundle Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {selectedItems.length} termék kiválasztva
              </p>
              <div className="flex items-center gap-3">
                {bundleDiscount > 0 && (
                  <span className="text-gray-400 line-through text-sm">
                    {formatPrice(bundleOriginalPrice)} Ft
                  </span>
                )}
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(Math.round(bundleFinalPrice))} Ft
                </span>
              </div>
              {savedAmount > 0 && (
                <p className="text-green-600 text-sm font-medium mt-1">
                  💰 Megtakarítás: {formatPrice(Math.round(savedAmount))} Ft
                </p>
              )}
            </div>

            <button
              onClick={handleAddBundle}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Mind a kosárba
            </button>
          </div>
        </div>
      )}

      {/* Hint when nothing selected */}
      {selectedItems.length === 0 && (
        <p className="text-center text-amber-700 text-sm py-2">
          👆 Kattints a termékekre a kiválasztáshoz
        </p>
      )}
    </div>
  );
};

export default CompleteTheLook;
