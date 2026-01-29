import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, X, Loader2,
  Building2, TreePine, Factory, Clock, Palette,
  CircleDot, Leaf, Zap, Circle,
  DollarSign, Gem, Crown, Target,
  Sofa, Paintbrush, Shield, RefreshCw, TreeDeciduous,
  Tv, BedDouble, UtensilsCrossed, Briefcase, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA';

/**
 * AIStyleQuiz - Personalized style quiz powered by Gemini
 * Creates user's "Style DNA" and personalized product recommendations
 * Modern icons instead of emojis
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
      icon: Home,
      options: [
        { id: 'modern', label: 'Modern & Minimalista', icon: Building2, color: 'text-blue-600 bg-blue-50' },
        { id: 'scandinavian', label: 'Skandináv & Világos', icon: TreePine, color: 'text-emerald-600 bg-emerald-50' },
        { id: 'industrial', label: 'Indusztriális & Nyers', icon: Factory, color: 'text-gray-600 bg-gray-100' },
        { id: 'vintage', label: 'Vintage & Retro', icon: Clock, color: 'text-amber-600 bg-amber-50' },
        { id: 'bohemian', label: 'Bohém & Színes', icon: Palette, color: 'text-pink-600 bg-pink-50' },
      ]
    },
    {
      id: 'colors',
      question: 'Milyen színeket preferálsz?',
      icon: Palette,
      options: [
        { id: 'neutral', label: 'Semleges (Fehér, Bézs, Szürke)', icon: CircleDot, color: 'text-gray-500 bg-gray-50' },
        { id: 'earth', label: 'Földszínek (Barna, Zöld, Terrakotta)', icon: Leaf, color: 'text-amber-700 bg-amber-50' },
        { id: 'bold', label: 'Merész (Kék, Piros, Sárga)', icon: Zap, color: 'text-red-600 bg-red-50' },
        { id: 'dark', label: 'Sötét (Fekete, Sötétkék, Antracit)', icon: Circle, color: 'text-gray-800 bg-gray-200' },
        { id: 'pastel', label: 'Pasztell (Rózsaszín, Menta, Lila)', icon: Sparkles, color: 'text-purple-400 bg-purple-50' },
      ]
    },
    {
      id: 'budget',
      question: 'Mi a preferált ár kategóriád?',
      icon: DollarSign,
      options: [
        { id: 'budget', label: 'Költséghatékony (< 100k)', icon: DollarSign, color: 'text-green-600 bg-green-50' },
        { id: 'mid', label: 'Középkategória (100-300k)', icon: Gem, color: 'text-blue-600 bg-blue-50' },
        { id: 'premium', label: 'Prémium (> 300k)', icon: Crown, color: 'text-amber-600 bg-amber-50' },
        { id: 'flexible', label: 'Rugalmas', icon: Target, color: 'text-indigo-600 bg-indigo-50' },
      ]
    },
    {
      id: 'priority',
      question: 'Mi a legfontosabb számodra?',
      icon: Target,
      options: [
        { id: 'comfort', label: 'Kényelem', icon: Sofa, color: 'text-indigo-600 bg-indigo-50' },
        { id: 'design', label: 'Design', icon: Paintbrush, color: 'text-pink-600 bg-pink-50' },
        { id: 'durability', label: 'Tartósság', icon: Shield, color: 'text-gray-600 bg-gray-100' },
        { id: 'versatility', label: 'Sokoldalúság', icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
        { id: 'eco', label: 'Fenntarthatóság', icon: TreeDeciduous, color: 'text-green-600 bg-green-50' },
      ]
    },
    {
      id: 'room',
      question: 'Melyik helyiségbe keresel bútort?',
      icon: Home,
      options: [
        { id: 'living', label: 'Nappali', icon: Tv, color: 'text-indigo-600 bg-indigo-50' },
        { id: 'bedroom', label: 'Hálószoba', icon: BedDouble, color: 'text-purple-600 bg-purple-50' },
        { id: 'dining', label: 'Étkező', icon: UtensilsCrossed, color: 'text-amber-600 bg-amber-50' },
        { id: 'office', label: 'Dolgozószoba', icon: Briefcase, color: 'text-gray-600 bg-gray-100' },
        { id: 'all', label: 'Teljes lakás', icon: Home, color: 'text-emerald-600 bg-emerald-50' },
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

Készíts egy rövid (2-3 mondat) "Style DNA" profilt magyarul. Legyél barátságos és informatív.
Ne használj emojikat.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
          })
        }
      );

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'Modern stíluskedvelő vagy, aki a funkcionalitást és az esztétikát egyaránt értékeli.';

      setStyleDNA(result);

      // Generate recommendations based on answers
      const matchedProducts = findMatchingProducts(allAnswers);
      setRecommendations(matchedProducts);
      
      if (onRecommendations) {
        onRecommendations(matchedProducts);
      }

    } catch (error) {
      setStyleDNA('Hiba történt az elemzés közben. Próbáld újra később!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findMatchingProducts = (allAnswers) => {
    if (!products || products.length === 0) return [];
    
    // Simple matching based on answers
    let filtered = [...products];
    
    // Filter by budget
    if (allAnswers.budget === 'budget') {
      filtered = filtered.filter(p => (p.salePrice || p.price) < 100000);
    } else if (allAnswers.budget === 'mid') {
      filtered = filtered.filter(p => {
        const price = p.salePrice || p.price;
        return price >= 100000 && price <= 300000;
      });
    } else if (allAnswers.budget === 'premium') {
      filtered = filtered.filter(p => (p.salePrice || p.price) > 300000);
    }

    // Filter by room type
    const roomKeywords = {
      living: ['kanapé', 'fotel', 'dohányzó', 'tv', 'nappali', 'ülőgarnitúra'],
      bedroom: ['ágy', 'matrac', 'éjjeli', 'hálószoba', 'gardrób', 'komód'],
      dining: ['étkező', 'asztal', 'szék', 'tálaló'],
      office: ['íróasztal', 'iroda', 'forgószék', 'polc']
    };

    if (allAnswers.room && allAnswers.room !== 'all') {
      const keywords = roomKeywords[allAnswers.room] || [];
      if (keywords.length > 0) {
        filtered = filtered.filter(p => 
          keywords.some(kw => 
            p.name.toLowerCase().includes(kw) || 
            (p.category && p.category.toLowerCase().includes(kw))
          )
        );
      }
    }

    // Return top matches
    return filtered.slice(0, 12);
  };

  const QuestionIcon = currentQuestion?.icon || Home;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Style DNA Quiz</h2>
                <p className="text-white/80 text-sm">Fedezd fel a stílusodat!</p>
              </div>
            </div>
            
            {/* Progress */}
            {!styleDNA && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/80 mb-1.5">
                  <span>Kérdés {step + 1}/{questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {isAnalyzing ? (
              <div className="py-12 text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Elemzés folyamatban...</h3>
                <p className="text-gray-500 text-sm">Készül a Style DNA profilod</p>
              </div>
            ) : styleDNA ? (
              <div className="space-y-6">
                {/* Style DNA Result */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 sm:p-6 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">A Te Style DNA-d</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{styleDNA}</p>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Ajánlott termékek ({recommendations.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {recommendations.slice(0, 6).map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded-xl p-2 text-center">
                          <img
                            src={product.images?.[0] || '/placeholder.png'}
                            alt={product.name}
                            className="w-full aspect-square object-contain rounded-lg bg-white mb-1"
                          />
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">{product.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors min-h-[44px]"
                >
                  Termékek megtekintése
                </button>
              </div>
            ) : (
              <div>
                {/* Question */}
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <QuestionIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{currentQuestion.question}</h3>
                </div>

                {/* Options */}
                <div className="space-y-2 sm:space-y-3">
                  {currentQuestion.options.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = answers[currentQuestion.id] === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(option.id)}
                        className={`
                          w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all min-h-[44px]
                          flex items-center gap-3
                          ${isSelected 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${option.color}`}>
                          <OptionIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-gray-800 flex-1">{option.label}</span>
                        {isSelected && (
                          <ArrowRight className="w-5 h-5 text-indigo-600" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIStyleQuiz;
