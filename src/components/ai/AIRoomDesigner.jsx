import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Sparkles, CheckCircle, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA';

/**
 * AIRoomDesigner - Upload room photo, AI analyzes style and recommends products
 * Uses Gemini Vision API for image understanding
 */
const AIRoomDesigner = ({ products, onProductRecommendations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
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
    setRecommendations([]);

    try {
      // Convert image to base64 (remove data URL prefix)
      const base64Image = imagePreview.split(',')[1];

      const prompt = `
Elemezd ezt a szobát és adj részletes stílus elemzést magyarul:

1. **Stílus kategória**: Mi a domináns stílus? (pl. Modern, Skandináv, Indusztriális, Vintage, Minimalist, Bohém, stb.)
2. **Színpaletta**: Milyen színek dominálnak?
3. **Hangulat**: Milyen érzést kelt a tér?
4. **Hiányosságok**: Mi hiányzik vagy mit lehetne fejleszteni?
5. **Bútor ajánlások**: Konkrétan milyen bútorok lennének ideálisak? (3-5 db)

Formázd szépen, rövid bekezdésekben, barátságos hangnemben.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: selectedImage.type,
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 800,
            }
          })
        }
      );

      const data = await response.json();
      const aiAnalysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'Nem sikerült elemezni a képet. Próbálj meg egy másik fotót!';

      setAnalysis(aiAnalysis);

      // Find matching products based on analysis (simple keyword matching)
      const keywords = aiAnalysis.toLowerCase();
      const matchedProducts = products
        .filter(p => {
          const productText = `${p.name} ${p.shortDescription} ${p.category}`.toLowerCase();
          return keywords.includes('modern') && productText.includes('modern') ||
                 keywords.includes('skandináv') && productText.includes('skandináv') ||
                 keywords.includes('kanapé') && productText.includes('kanapé') ||
                 keywords.includes('fotel') && productText.includes('fotel') ||
                 keywords.includes('asztal') && productText.includes('asztal');
        })
        .slice(0, 6);

      setRecommendations(matchedProducts);

      if (onProductRecommendations) {
        onProductRecommendations(matchedProducts);
      }

    } catch (error) {
      setAnalysis('❌ Hiba történt az elemzés közben. Kérlek próbáld újra!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setRecommendations([]);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          px-6 py-3 rounded-xl
          bg-gradient-to-r from-purple-500 to-pink-600
          text-white font-semibold
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-105
          flex items-center gap-2
        "
      >
        <Camera className="w-5 h-5" />
        <span>AI Szoba Tervező</span>
        <Sparkles className="w-4 h-4" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="
                w-full max-w-4xl max-h-[90vh] overflow-y-auto
                bg-white rounded-2xl shadow-2xl
                p-6
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      AI Szoba Tervező
                    </h2>
                    <p className="text-sm text-gray-500">
                      Töltsd fel a szobád fotóját, és az AI megtervezi neked!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Upload Area */}
              {!imagePreview && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    border-2 border-dashed border-gray-300 rounded-xl
                    p-12 text-center cursor-pointer
                    hover:border-purple-500 hover:bg-purple-50/50
                    transition-all duration-300
                  "
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Kattints vagy húzd ide a fotót
                  </h3>
                  <p className="text-sm text-gray-500">
                    JPG, PNG vagy WEBP (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Image Preview & Analysis */}
              {imagePreview && (
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Room preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="
                        absolute top-4 right-4
                        p-2 bg-white/90 rounded-full
                        hover:bg-white transition-colors
                      "
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* Analyze Button */}
                  {!analysis && !isAnalyzing && (
                    <button
                      onClick={analyzeRoom}
                      className="
                        w-full py-4 rounded-xl
                        bg-gradient-to-r from-purple-500 to-pink-600
                        text-white font-semibold text-lg
                        shadow-lg hover:shadow-xl
                        transition-all duration-300
                        hover:scale-105
                        flex items-center justify-center gap-3
                      "
                    >
                      <Sparkles className="w-6 h-6" />
                      AI Elemzés Indítása
                    </button>
                  )}

                  {/* Loading */}
                  {isAnalyzing && (
                    <div className="text-center py-8">
                      <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Az AI elemzi a szobádat...</p>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Analysis Text (or error) */}
                      <div className={`rounded-xl p-6 ${analysis.startsWith('❌') ? 'bg-red-50' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                        <div className="flex items-center gap-2 mb-4">
                          {analysis.startsWith('❌') ? (
                            <X className="w-6 h-6 text-red-500" />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          <h3 className="text-xl font-bold text-gray-800">
                            {analysis.startsWith('❌') ? 'Hiba' : 'Elemzés Eredménye'}
                          </h3>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                          {analysis}
                        </div>
                        {analysis.startsWith('❌') && (
                          <button
                            type="button"
                            onClick={analyzeRoom}
                            className="mt-4 px-6 py-3 min-h-[44px] bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                          >
                            Újrapróbálás
                          </button>
                        )}
                      </div>

                      {/* Product Recommendations */}
                      {recommendations.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                              Ajánlott Termékek
                            </h3>
                            <span className="text-sm text-gray-500">
                              {recommendations.length} találat
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {recommendations.map((product) => (
                              <div
                                key={product.id}
                                className="
                                  bg-white rounded-lg overflow-hidden
                                  border border-gray-200
                                  hover:shadow-lg transition-shadow
                                  cursor-pointer
                                "
                              >
                                <img
                                  src={product.mainImage || '/placeholder.png'}
                                  alt={product.name}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="p-3">
                                  <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                                    {product.name}
                                  </h4>
                                  <p className="text-lg font-bold text-indigo-600">
                                    {(product.salePrice || product.price)?.toLocaleString('hu-HU')} Ft
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis && !analysis.startsWith('❌') && recommendations.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Nincs egyező ajánlat a katalógusban. Próbálj másik fotót vagy böngéssz a termékek között!</p>
                      )}

                      {/* Try Again Button */}
                      <button
                        type="button"
                        onClick={resetAnalysis}
                        className="
                          w-full py-3 rounded-xl
                          bg-gray-100 text-gray-700 font-semibold
                          hover:bg-gray-200 transition-colors
                          flex items-center justify-center gap-2
                        "
                      >
                        <Upload className="w-5 h-5" />
                        Új Fotó Feltöltése
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIRoomDesigner;
