import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Sparkles, CheckCircle, X, AlertCircle, RotateCcw } from 'lucide-react';
import { analyzeImage } from '../../services/geminiService';

/**
 * AIRoomDesigner - Szoba elemzés Gemini Vision AI-val
 * Kép feltöltés és AI alapú stílus elemzés
 */
const AIRoomDesigner = ({ products, onProductRecommendations, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Max 4MB ellenőrzés
      if (file.size > 4 * 1024 * 1024) {
        setAnalysisError('A kép túl nagy! Maximum 4MB engedélyezett.');
        return;
      }
      
      setSelectedImage(file);
      setAnalysisError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeRoom = async () => {
    if (!selectedImage || !imagePreview) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);
    setRecommendations([]);

    try {
      // Base64 kinyerése (data URL prefix nélkül)
      const base64Image = imagePreview.split(',')[1];
      const mimeType = selectedImage.type || 'image/jpeg';

      const prompt = `Elemezd ezt a szobafotót és adj rövid, hasznos tanácsokat magyarul:

1. Milyen stílusú a szoba? (pl. Modern, Skandináv, Klasszikus)
2. Milyen színek dominálnak?
3. Milyen bútorok illenének ide? (adj 2-3 konkrét javaslatot)

Válaszolj 4-5 mondatban, barátságos hangnemben, tegezve.`;

      const result = await analyzeImage(base64Image, mimeType, prompt);

      if (result.success && result.text) {
        setAnalysis(result.text);
        
        // Termék ajánlások keresése
        if (products && products.length > 0) {
          const matchedProducts = findMatchingProducts(result.text);
          setRecommendations(matchedProducts);
          
          if (onProductRecommendations && matchedProducts.length > 0) {
            onProductRecommendations(matchedProducts);
          }
        }
      } else {
        setAnalysisError(result.error || 'Nem sikerült elemezni a képet.');
      }

    } catch (error) {
      console.error('Képelemzés hiba:', error);
      setAnalysisError('Váratlan hiba történt. Próbálj másik képet!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findMatchingProducts = (analysisText) => {
    if (!products || products.length === 0) return [];
    
    const text = analysisText.toLowerCase();
    
    // Bútor típusok és szinonimák
    const furnitureTerms = {
      'kanapé': ['kanapé', 'ülőgarnitúra', 'sofa', 'couch'],
      'fotel': ['fotel', 'szék', 'armchair'],
      'asztal': ['asztal', 'dohányzó', 'étkező', 'íróasztal', 'table'],
      'ágy': ['ágy', 'franciaágy', 'matrac', 'bed'],
      'szekrény': ['szekrény', 'gardrób', 'komód', 'tálaló', 'polc'],
      'lámpa': ['lámpa', 'világítás', 'led'],
    };
    
    // Stílusok
    const styleTerms = ['modern', 'skandináv', 'minimalista', 'klasszikus', 'vintage', 'indusztriális', 'rusztikus', 'elegáns', 'letisztult'];
    
    // Színek
    const colorTerms = ['fehér', 'fekete', 'szürke', 'barna', 'bézs', 'kék', 'zöld', 'natúr', 'fa'];
    
    // Kereső kifejezések kinyerése az elemzésből
    const foundTerms = [];
    
    Object.entries(furnitureTerms).forEach(([key, synonyms]) => {
      if (synonyms.some(s => text.includes(s))) {
        foundTerms.push(...synonyms);
      }
    });
    
    styleTerms.forEach(s => { if (text.includes(s)) foundTerms.push(s); });
    colorTerms.forEach(c => { if (text.includes(c)) foundTerms.push(c); });
    
    if (foundTerms.length === 0) {
      // Ha nincs konkrét találat, adj random népszerű termékeket
      return products
        .filter(p => p.price > 0)
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    }
    
    // Termékek pontozása
    const scored = products.map(p => {
      const productText = `${p.name || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
      let score = 0;
      
      foundTerms.forEach(term => {
        if (productText.includes(term)) score += 5;
      });
      
      return { product: p, score };
    });
    
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(s => s.product);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setAnalysisError(null);
    setRecommendations([]);
  };

  const handleClose = () => {
    resetAnalysis();
    if (onClose) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">AI Szoba Tervező</h2>
              <p className="text-sm text-gray-500">Töltsd fel a szobád fotóját!</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5">
          {/* Upload Area */}
          {!imagePreview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition-all"
            >
              <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Kattints vagy húzd ide a fotót
              </h3>
              <p className="text-sm text-gray-500">JPG, PNG vagy WEBP (max 4MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-5">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Szoba előnézet"
                  className="w-full h-56 object-cover"
                />
                <button
                  onClick={resetAnalysis}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Analyze Button */}
              {!analysis && !isAnalyzing && !analysisError && (
                <button
                  onClick={analyzeRoom}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-6 h-6" />
                  AI Elemzés Indítása
                </button>
              )}

              {/* Loading */}
              {isAnalyzing && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Az AI elemzi a szobádat...</p>
                  <p className="text-gray-400 text-sm mt-1">Ez pár másodpercet vehet igénybe</p>
                </div>
              )}

              {/* Error */}
              {analysisError && (
                <div className="bg-red-50 rounded-xl p-5 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700 font-medium mb-4">{analysisError}</p>
                  <button
                    onClick={analyzeRoom}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Újrapróbálás
                  </button>
                </div>
              )}

              {/* Analysis Result */}
              {analysis && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-bold text-gray-800">Elemzés Eredménye</h3>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis}</p>
                  </div>

                  {/* Product Recommendations */}
                  {recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Ajánlott Termékek ({recommendations.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {recommendations.map((product) => (
                          <div
                            key={product.id}
                            className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <img
                              src={product.images?.[0] || product.mainImage}
                              alt={product.name}
                              className="w-full h-28 object-cover bg-gray-100"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
                            />
                            <div className="p-2.5">
                              <h4 className="font-medium text-sm text-gray-800 line-clamp-1 mb-1">
                                {product.name}
                              </h4>
                              <p className="text-base font-bold text-indigo-600">
                                {(product.salePrice || product.price)?.toLocaleString('hu-HU')} Ft
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Photo Button */}
                  <button
                    onClick={resetAnalysis}
                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Új Fotó Feltöltése
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRoomDesigner;
