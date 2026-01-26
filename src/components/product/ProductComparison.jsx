import React, { useState } from 'react';
import { X, Check, ArrowLeftRight, Plus } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

/**
 * Product Comparison Tool
 */
export const ProductComparison = ({ 
  comparisonList = [], 
  onRemove, 
  onClear,
  onAddMore 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Comparison Button */}
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 hover:scale-105 transform"
      >
        <ArrowLeftRight className="w-5 h-5" />
        <span className="font-bold">Összehasonlítás ({comparisonList.length})</span>
      </button>

      {/* Comparison Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsExpanded(false)}>
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
                  Termékek összehasonlítása
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {comparisonList.length} termék kiválasztva
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClear}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  Összes törlése
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisonList.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow relative">
                    {/* Remove button */}
                    <button
                      onClick={() => onRemove(product.id)}
                      className="absolute top-3 right-3 z-10 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image */}
                    <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/200'}}
                      />
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{product.name}</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Ár:</span>
                          <span className="font-bold text-indigo-600 text-lg">{formatPrice(product.price)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Kategória:</span>
                          <span className="font-medium text-gray-900">{product.category}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Készlet:</span>
                          <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            {product.inStock ? 'Raktáron' : 'Nincs raktáron'}
                          </span>
                        </div>

                        {product.params && (
                          <div className="pt-2">
                            <span className="text-gray-600 text-xs block mb-1">Paraméterek:</span>
                            <p className="text-gray-700 text-xs line-clamp-3">{product.params}</p>
                          </div>
                        )}
                      </div>

                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-indigo-600 text-white py-2 rounded-xl text-center font-bold hover:bg-indigo-700 transition-colors text-sm mt-4"
                      >
                        Megveszem
                      </a>
                    </div>
                  </div>
                ))}

                {/* Add More */}
                {comparisonList.length < 6 && (
                  <div
                    onClick={() => {
                      setIsExpanded(false);
                      onAddMore?.();
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">Még több termék</p>
                    <p className="text-gray-400 text-sm mt-1">Max. 6 termék</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Comparison Toggle Button for Product Cards
 */
export const ComparisonToggle = ({ product, isInComparison, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(product);
      }}
      className={`p-2 rounded-full shadow-md transition-all transform hover:scale-110 ${
        isInComparison
          ? 'bg-indigo-500 text-white'
          : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
      title={isInComparison ? 'Eltávolítás az összehasonlításból' : 'Hozzáadás az összehasonlításhoz'}
    >
      <ArrowLeftRight className="w-4 h-4" />
    </button>
  );
};

/**
 * Hook for managing comparison list
 */
export const useComparison = () => {
  const [comparisonList, setComparisonList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('comparison_list') || '[]');
    } catch {
      return [];
    }
  });

  const addToComparison = (product) => {
    if (comparisonList.length >= 6) {
      return { success: false, message: 'Maximum 6 termék hasonlítható össze' };
    }
    
    if (comparisonList.find(p => p.id === product.id)) {
      return { success: false, message: 'Ez a termék már az összehasonlításban van' };
    }

    const updated = [...comparisonList, product];
    setComparisonList(updated);
    localStorage.setItem('comparison_list', JSON.stringify(updated));
    return { success: true, message: 'Hozzáadva az összehasonlításhoz' };
  };

  const removeFromComparison = (productId) => {
    const updated = comparisonList.filter(p => p.id !== productId);
    setComparisonList(updated);
    localStorage.setItem('comparison_list', JSON.stringify(updated));
  };

  const clearComparison = () => {
    setComparisonList([]);
    localStorage.removeItem('comparison_list');
  };

  const toggleComparison = (product) => {
    const exists = comparisonList.find(p => p.id === product.id);
    if (exists) {
      removeFromComparison(product.id);
      return { success: true, message: 'Eltávolítva az összehasonlításból', action: 'removed' };
    } else {
      return { ...addToComparison(product), action: 'added' };
    }
  };

  const isInComparison = (productId) => {
    return comparisonList.some(p => p.id === productId);
  };

  return {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparison,
    isInComparison
  };
};
