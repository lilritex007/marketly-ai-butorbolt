import React, { useState } from 'react';
import { Brain, Palette, Home, Sofa, DollarSign, Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA';

/**
 * AIStyleQuiz - Personalized style quiz powered by Gemini
 * Creates user's "Style DNA" and personalized product recommendations
 */
const AIStyleQuiz = ({ products, onRecommendations, onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [styleDNA, setStyleDNA] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const questions = [
    {
      id: 'space',
      question: 'Milyen a lakásod jelenlegi stílusa?',
      options: [
        { id: 'modern', label: '✨ Modern & Minimalista', emoji: '🏢' },
        { id: 'scandinavian', label: '🌲 Skandináv & Világos', emoji: '❄️' },
        { id: 'industrial', label: '🏭 Indusztriális & Nyers', emoji: '🔧' },
        { id: 'vintage', label: '🕰️ Vintage & Retro', emoji: '📻' },
        { id: 'bohemian', label: '🎨 Bohém & Színes', emoji: '🌈' },
      ]
    },
    {
      id: 'colors',
      question: 'Milyen színeket preferálsz?',
      options: [
        { id: 'neutral', label: 'Semleges (Fehér, Bézs, Szürke)', emoji: '⚪' },
        { id: 'earth', label: 'Földszínek (Barna, Zöld, Terrakotta)', emoji: '🌍' },
        { id: 'bold', label: 'Merész (Kék, Piros, Sárga)', emoji: '🎨' },
        { id: 'dark', label: 'Sötét (Fekete, Sötétkék, Antracit)', emoji: '⚫' },
        { id: 'pastel', label: 'Pasztell (Rózsaszín, Menta, Lila)', emoji: '🎀' },
      ]
    },
    {
      id: 'budget',
      question: 'Mi a preferált ár kategóriád?',
      options: [
        { id: 'budget', label: '💰 Költséghatékony (< 100k)', emoji: '💸' },
        { id: 'mid', label: '💎 Középkategória (100-300k)', emoji: '💳' },
        { id: 'premium', label: '👑 Prémium (> 300k)', emoji: '💎' },
        { id: 'flexible', label: '🎯 Rugalmas', emoji: '🤝' },
      ]
    },
    {
      id: 'priority',
      question: 'Mi a legfontosabb számodra?',
      options: [
        { id: 'comfort', label: 'Kényelem', emoji: '🛋️' },
        { id: 'design', label: 'Design', emoji: '🎨' },
        { id: 'durability', label: 'Tartósság', emoji: '💪' },
        { id: 'versatility', label: 'Sokoldalúság', emoji: '🔄' },
        { id: 'eco', label: 'Fenntarthatóság', emoji: '🌱' },
      ]
    },
    {
      id: 'room',
      question: 'Melyik helyiségbe keresel bútort?',
      options: [
        { id: 'living', label: 'Nappali', emoji: '🛋️' },
        { id: 'bedroom', label: 'Hálószoba', emoji: '🛏️' },
        { id: 'dining', label: 'Étkező', emoji: '🍽️' },
        { id: 'office', label: 'Dolgozószoba', emoji: '💼' },
        { id: 'all', label: 'Teljes lakás', emoji: '🏠' },
      ]
    }
  ];

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleAnswer = (optionId) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Last question - analyze
      setTimeout(() => analyzeStyle({ ...answers, [currentQuestion.id]: optionId }), 500);
    }
  };

  const analyzeStyle = async (allAnswers) => {
    setIsAnalyzing(true);

    try {
      const prompt = `
Te egy AI interior design szakértő vagy. A felhasználó elvégzett egy stílus kvízt:

**Válaszok:**
1. Jelenlegi stílus: ${allAnswers.space}
2. Kedvenc színek: ${allAnswers.colors}
3. Budget: ${allAnswers.budget}
4. Prioritás: ${allAnswers.priority}
5. Helyiség: ${allAnswers.room}

Készíts egy személyre szabott "Style DNA" profilt magyarul:

1. **Stílus Név** (kreatív, egyedi név, pl. "Urban Zen Collector")
2. **Leírás** (2-3 mondat)
3. **Kulcsszavak** (5-6 db)
4. **Színpaletta ajánlás**
5. **Bútor típusok** (konkrét ajánlások)
6. **Tippek** (3 praktikus tipp)

Formázd szépen, emoji-kkal, barátságosan!
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 600,
            }
          })
        }
      );

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'Modern Minimalista ✨\n\nSzeretvesz a tiszta vonalakat és a letisztult tereket.';

      setStyleDNA(result);

      // Find matching products
      const matched = products.filter(p => {
        const text = `${p.name} ${p.shortDescription} ${p.category}`.toLowerCase();
        if (allAnswers.space === 'modern' && text.includes('modern')) return true;
        if (allAnswers.space === 'scandinavian' && text.includes('skandináv')) return true;
        if (allAnswers.room === 'living' && (text.includes('kanapé') || text.includes('fotel'))) return true;
        if (allAnswers.room === 'bedroom' && text.includes('ágy')) return true;
        return Math.random() > 0.7; // Some randomness
      }).slice(0, 8);

      setRecommendations(matched);
      if (onRecommendations) onRecommendations(matched);

    } catch (error) {
      setStyleDNA('❌ Hiba történt. Próbáld újra!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setStyleDNA(null);
    setRecommendations([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">AI Stílus Quiz</h2>
              <p className="text-white/80 text-sm">Találd meg a Style DNA-d!</p>
            </div>
          </div>
          {/* Progress Bar */}
          {!styleDNA && (
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-white"
                />
              </div>
              <p className="text-white/80 text-sm mt-2">
                {step + 1} / {questions.length} kérdés
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Questions */}
          {!styleDNA && !isAnalyzing && currentQuestion && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {currentQuestion.question}
              </h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.id)}
                    className="
                      w-full p-4 rounded-xl
                      bg-gray-50 hover:bg-indigo-50
                      border-2 border-transparent hover:border-indigo-500
                      transition-all
                      flex items-center gap-4
                      text-left
                    "
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="text-lg font-medium text-gray-800">
                      {option.label}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Sparkles className="w-16 h-16 text-indigo-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Az AI elemzi a válaszaidat...
              </h3>
              <p className="text-gray-500">Készül a Style DNA-d 🧬</p>
            </div>
          )}

          {/* Results */}
          {styleDNA && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Style DNA */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    A Te Style DNA-d
                  </h3>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {styleDNA}
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Személyre Szabott Ajánlataink ({recommendations.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recommendations.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <img
                          src={product.mainImage || product.images?.[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-24 object-cover"
                        />
                        <div className="p-2">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">
                            {product.name}
                          </p>
                          <p className="text-sm font-bold text-indigo-600">
                            {(product.salePrice || product.price)?.toLocaleString('hu-HU')} Ft
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {styleDNA && recommendations.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nincs egyező ajánlat a katalógusban. Böngéssz tovább a termékek között!</p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetQuiz}
                  className="
                    flex-1 py-3 rounded-xl
                    bg-gray-100 text-gray-700 font-semibold
                    hover:bg-gray-200 transition-colors
                  "
                >
                  Új Quiz
                </button>
                <button
                  onClick={onClose}
                  className="
                    flex-1 py-3 rounded-xl
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    text-white font-semibold
                    hover:shadow-lg transition-shadow
                  "
                >
                  Kész
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIStyleQuiz;
