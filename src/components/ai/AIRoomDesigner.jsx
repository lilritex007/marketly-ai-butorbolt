import React, { useState, useRef, useMemo } from 'react';
import { Camera, Upload, Loader2, Sparkles, CheckCircle, X, AlertCircle, RotateCcw, ShoppingBag, Lightbulb, Star } from 'lucide-react';
import { analyzeImage } from '../../services/geminiService';
import { trackProductView } from '../../services/userPreferencesService';

/**
 * AIRoomDesigner - Szoba elemzés Gemini Vision AI-val
 * Teljes adatbázis ismeretével személyre szabott ajánlások
 */
const AIRoomDesigner = ({ products, onProductRecommendations, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [aiKeywords, setAiKeywords] = useState([]);
  const fileInputRef = useRef(null);

  // Termék statisztikák az AI számára
  const productStats = useMemo(() => {
    if (!products?.length) return null;
    
    const categories = {};
    products.forEach(p => {
      const cat = (p.category || 'Egyéb').split(' > ')[0];
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
    
    return { total: products.length, topCategories };
  }, [products]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 4 * 1024 * 1024) {
        setAnalysisError('A kép túl nagy! Maximum 4MB engedélyezett.');
        return;
      }
      
      setSelectedImage(file);
      setAnalysisError(null);
      setAnalysis(null);
      setRecommendations([]);
      setAiKeywords([]);
      
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
    setAiKeywords([]);

    try {
      const base64Image = imagePreview.split(',')[1];
      const mimeType = selectedImage.type || 'image/jpeg';

      // Részletes prompt a jobb elemzéshez
      const prompt = `Elemezd részletesen ezt a szobafotót és adj bútor ajánlásokat!

ELEMEZD:
1. Szoba típusa (nappali, hálószoba, étkező, iroda, stb.)
2. Jelenlegi stílus (modern, skandináv, klasszikus, minimalista, stb.)
3. Domináns színek
4. Milyen bútorok hiányoznak vagy cserélendők

VÁLASZOD FORMÁTUMA (pontosan ezt kövesd!):
SZOBA: [szoba típusa]
STÍLUS: [stílus neve]
SZÍNEK: [2-3 szín]
AJÁNLOTT_BÚTOROK: [bútor1], [bútor2], [bútor3], [bútor4]
TIPP: [1 mondat személyre szabott tanács magyarul, tegezve]`;

      const result = await analyzeImage(base64Image, mimeType, prompt);

      if (result.success && result.text) {
        // Strukturált válasz feldolgozása
        const responseText = result.text;
        
        // Kulcsszavak kinyerése
        const keywords = [];
        
        const roomMatch = responseText.match(/SZOBA:\s*(.+)/i);
        const styleMatch = responseText.match(/STÍLUS:\s*(.+)/i);
        const colorsMatch = responseText.match(/SZÍNEK:\s*(.+)/i);
        const furnitureMatch = responseText.match(/AJÁNLOTT_BÚTOROK:\s*(.+)/i);
        const tippMatch = responseText.match(/TIPP:\s*(.+)/i);
        
        if (roomMatch) keywords.push(...roomMatch[1].toLowerCase().split(/[,\s]+/).filter(k => k.length > 2));
        if (styleMatch) keywords.push(...styleMatch[1].toLowerCase().split(/[,\s]+/).filter(k => k.length > 2));
        if (colorsMatch) keywords.push(...colorsMatch[1].toLowerCase().split(/[,\s]+/).filter(k => k.length > 2));
        if (furnitureMatch) keywords.push(...furnitureMatch[1].toLowerCase().split(/[,\s]+/).filter(k => k.length > 2));
        
        setAiKeywords(keywords);
        
        // Olvasható elemzés összeállítása
        let readableAnalysis = '';
        if (roomMatch) readableAnalysis += `📍 **Szoba:** ${roomMatch[1].trim()}\n`;
        if (styleMatch) readableAnalysis += `🎨 **Stílus:** ${styleMatch[1].trim()}\n`;
        if (colorsMatch) readableAnalysis += `🎯 **Színvilág:** ${colorsMatch[1].trim()}\n`;
        if (furnitureMatch) readableAnalysis += `🛋️ **Ajánlott bútorok:** ${furnitureMatch[1].trim()}\n`;
        if (tippMatch) readableAnalysis += `\n💡 ${tippMatch[1].trim()}`;
        
        // Ha nem sikerült strukturálni, használjuk az eredeti választ
        if (!readableAnalysis) {
          readableAnalysis = responseText;
        }
        
        setAnalysis(readableAnalysis);
        
        // Termék ajánlások keresése
        const matchedProducts = findMatchingProductsAdvanced(keywords, furnitureMatch?.[1] || '');
        setRecommendations(matchedProducts);
        
        if (onProductRecommendations && matchedProducts.length > 0) {
          onProductRecommendations(matchedProducts);
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

  // Fejlett termék keresés AI kulcsszavak alapján
  const findMatchingProductsAdvanced = (keywords, furnitureText) => {
    if (!products || products.length === 0) return [];
    
    // Bútor típus szinonimák
    const furnitureSynonyms = {
      'kanapé': ['kanapé', 'ülőgarnitúra', 'sofa', 'szófa', 'sarokülő', 'heverő'],
      'fotel': ['fotel', 'karosszék', 'pihenőfotel', 'relax fotel'],
      'asztal': ['asztal', 'dohányzóasztal', 'étkezőasztal', 'íróasztal', 'konzolasztal'],
      'szék': ['szék', 'étkezőszék', 'forgószék', 'irodai szék'],
      'ágy': ['ágy', 'franciaágy', 'boxspring', 'hálószoba'],
      'szekrény': ['szekrény', 'gardrób', 'komód', 'tálaló', 'vitrin'],
      'polc': ['polc', 'könyvespolc', 'falipolc', 'állvány'],
      'lámpa': ['lámpa', 'világítás', 'állólámpa', 'asztali lámpa'],
    };

    // Stílus kulcsszavak
    const styleKeywords = {
      'modern': ['modern', 'minimalista', 'kortárs', 'letisztult', 'egyszerű'],
      'skandináv': ['skandináv', 'nordic', 'natúr', 'világos', 'fehér', 'fa'],
      'klasszikus': ['klasszikus', 'elegáns', 'tradicionális', 'időtlen'],
      'indusztriális': ['indusztriális', 'loft', 'ipari', 'fém', 'vas'],
      'vintage': ['vintage', 'retro', 'antik', 'régi'],
    };

    // Szín kulcsszavak
    const colorKeywords = ['fehér', 'fekete', 'szürke', 'barna', 'bézs', 'kék', 'zöld', 'piros', 'natúr', 'fa', 'dió', 'tölgy'];

    // Összes releváns kulcsszó összegyűjtése
    const searchTerms = new Set();
    
    // AI által talált kulcsszavak
    keywords.forEach(kw => {
      searchTerms.add(kw.toLowerCase());
      
      // Szinonimák hozzáadása
      Object.entries(furnitureSynonyms).forEach(([key, synonyms]) => {
        if (kw.toLowerCase().includes(key) || synonyms.some(s => kw.toLowerCase().includes(s))) {
          synonyms.forEach(s => searchTerms.add(s));
        }
      });
      
      // Stílus kulcsszavak
      Object.entries(styleKeywords).forEach(([style, words]) => {
        if (words.some(w => kw.toLowerCase().includes(w))) {
          words.forEach(w => searchTerms.add(w));
        }
      });
    });

    // Bútor szövegből is
    if (furnitureText) {
      furnitureText.toLowerCase().split(/[,\s]+/).forEach(term => {
        if (term.length > 2) searchTerms.add(term);
      });
    }

    // Termékek pontozása
    const scored = products.map(p => {
      const productText = `${p.name || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
      let score = 0;
      
      searchTerms.forEach(term => {
        if (productText.includes(term)) {
          // Név egyezés értékesebb
          if ((p.name || '').toLowerCase().includes(term)) score += 15;
          // Kategória egyezés
          else if ((p.category || '').toLowerCase().includes(term)) score += 10;
          // Leírás egyezés
          else score += 3;
        }
      });
      
      return { product: p, score };
    });

    // Top termékek, változatos kategóriákból
    const topScored = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    // Kategória diverzitás biztosítása
    const selectedProducts = [];
    const usedCategories = new Set();
    
    for (const item of topScored) {
      const cat = (item.product.category || '').split(' > ')[0];
      
      // Első 4 termék bármilyen kategóriából
      if (selectedProducts.length < 4) {
        selectedProducts.push(item.product);
        usedCategories.add(cat);
      }
      // További termékek különböző kategóriákból
      else if (selectedProducts.length < 12 && !usedCategories.has(cat)) {
        selectedProducts.push(item.product);
        usedCategories.add(cat);
      }
      // Ha elég kategória van, többi is jöhet
      else if (selectedProducts.length < 12) {
        selectedProducts.push(item.product);
      }
      
      if (selectedProducts.length >= 12) break;
    }

    // Ha kevés a találat, töltsük fel random termékekkel
    if (selectedProducts.length < 6) {
      const additionalProducts = products
        .filter(p => !selectedProducts.some(sp => sp.id === p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 6 - selectedProducts.length);
      
      selectedProducts.push(...additionalProducts);
    }

    return selectedProducts;
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setAnalysisError(null);
    setRecommendations([]);
    setAiKeywords([]);
  };

  const handleClose = () => {
    resetAnalysis();
    if (onClose) onClose();
  };

  const handleProductClick = (product) => {
    trackProductView(product);
    if (onProductRecommendations) {
      onProductRecommendations([product, ...recommendations.filter(p => p.id !== product.id)]);
    }
  };

  const formatPrice = (price) => (price || 0).toLocaleString('hu-HU') + ' Ft';

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
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-600">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Szoba Tervező</h2>
              <p className="text-sm text-white/80">
                {productStats ? `${productStats.total.toLocaleString()} termékből válogatunk` : 'Töltsd fel a szobád fotóját!'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
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
              <p className="text-xs text-purple-600 mt-2">
                Az AI elemzi a szobát és {productStats?.total.toLocaleString() || ''} termékből ajánl
              </p>
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
                  <p className="text-gray-400 text-sm mt-1">
                    {productStats?.total.toLocaleString()} termékből keressük a tökéleteset
                  </p>
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
                  {/* AI Analysis */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-bold text-gray-800">AI Elemzés</h3>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {analysis.split('\n').map((line, i) => {
                        if (line.startsWith('💡')) {
                          return (
                            <div key={i} className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-amber-800">{line.replace('💡 ', '')}</p>
                              </div>
                            </div>
                          );
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </div>

                  {/* AI Keywords */}
                  {aiKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {aiKeywords.slice(0, 8).map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Product Recommendations */}
                  {recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Személyre szabott ajánlatok ({recommendations.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {recommendations.slice(0, 6).map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all text-left"
                          >
                            <img
                              src={product.images?.[0] || product.image || product.mainImage}
                              alt={product.name}
                              className="w-full h-28 object-contain bg-gray-50"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
                            />
                            <div className="p-2.5">
                              <h4 className="font-medium text-sm text-gray-800 line-clamp-1 mb-1">
                                {product.name}
                              </h4>
                              <p className="text-base font-bold text-purple-600">
                                {formatPrice(product.salePrice || product.price)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {recommendations.length > 6 && (
                        <p className="text-center text-sm text-gray-500 mt-3">
                          + {recommendations.length - 6} további ajánlat
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show All / New Photo Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={resetAnalysis}
                      className="py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Új Fotó
                    </button>
                    <button
                      onClick={handleClose}
                      className="py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Megnézem
                    </button>
                  </div>
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
