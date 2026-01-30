import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, X, Loader2, CheckCircle,
  Building2, TreePine, Factory, Clock, Palette,
  CircleDot, Leaf, Zap, Circle,
  DollarSign, Gem, Crown, Target,
  Sofa, Paintbrush, Shield, RefreshCw, TreeDeciduous,
  Tv, BedDouble, UtensilsCrossed, Briefcase, Home
} from 'lucide-react';
import { generateText } from '../../services/geminiService';

/**
 * AIStyleQuiz - Személyre szabott stílus kvíz Gemini AI-val
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
        { id: 'earth', label: 'Földszínek (Barna, Zöld)', icon: Leaf, color: 'text-amber-700 bg-amber-50' },
        { id: 'bold', label: 'Merész (Kék, Piros)', icon: Zap, color: 'text-red-600 bg-red-50' },
        { id: 'dark', label: 'Sötét (Fekete, Antracit)', icon: Circle, color: 'text-gray-800 bg-gray-200' },
        { id: 'pastel', label: 'Pasztell (Rózsaszín, Menta)', icon: Sparkles, color: 'text-purple-400 bg-purple-50' },
      ]
    },
    {
      id: 'budget',
      question: 'Mi a preferált árkategóriád?',
      icon: DollarSign,
      options: [
        { id: 'budget', label: 'Megfizethető (< 100k Ft)', icon: DollarSign, color: 'text-green-600 bg-green-50' },
        { id: 'mid', label: 'Közép (100-300k Ft)', icon: Gem, color: 'text-blue-600 bg-blue-50' },
        { id: 'premium', label: 'Prémium (> 300k Ft)', icon: Crown, color: 'text-amber-600 bg-amber-50' },
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
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => analyzeStyle(newAnswers), 300);
    }
  };

  const analyzeStyle = async (allAnswers) => {
    setIsAnalyzing(true);

    // Termék ajánlások generálása (mindenképp)
    const matchedProducts = findMatchingProducts(allAnswers);
    setRecommendations(matchedProducts);

    try {
      // Stílus leírások
      const styleLabels = {
        modern: 'modern, minimalista',
        scandinavian: 'skandináv, világos',
        industrial: 'indusztriális, loft',
        vintage: 'vintage, retro',
        bohemian: 'bohém, színes'
      };
      
      const colorLabels = {
        neutral: 'semleges színeket',
        earth: 'földszíneket',
        bold: 'élénk színeket',
        dark: 'sötét tónusokat',
        pastel: 'pasztell árnyalatokat'
      };

      const priorityLabels = {
        comfort: 'kényelmet',
        design: 'designt',
        durability: 'tartósságot',
        versatility: 'sokoldalúságot',
        eco: 'fenntarthatóságot'
      };

      const prompt = `Írj egy rövid (2 mondat) személyre szabott lakberendezési profilt az alábbi preferenciák alapján:
- Stílus: ${styleLabels[allAnswers.space] || allAnswers.space}
- Színek: ${colorLabels[allAnswers.colors] || allAnswers.colors}
- Prioritás: ${priorityLabels[allAnswers.priority] || allAnswers.priority}

Legyél barátságos, használj tegezést. Magyarul válaszolj.`;

      const result = await generateText(prompt, { temperature: 0.8, maxTokens: 150 });

      if (result.success && result.text) {
        setStyleDNA(result.text);
      } else {
        // Lokális fallback
        setStyleDNA(getLocalStyleDNA(allAnswers));
      }

      if (onRecommendations && matchedProducts.length > 0) {
        onRecommendations(matchedProducts);
      }

    } catch (error) {
      console.error('Quiz hiba:', error);
      setStyleDNA(getLocalStyleDNA(allAnswers));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Lokális stílus generálás (fallback)
  const getLocalStyleDNA = (allAnswers) => {
    const styleMap = {
      modern: 'Modern, letisztult ízlésed van',
      scandinavian: 'A skandináv egyszerűséget kedveled',
      industrial: 'Az ipari, loft stílus híve vagy',
      vintage: 'A vintage báj rajongója vagy',
      bohemian: 'Egyedi, bohém stílusod van'
    };

    const priorityMap = {
      comfort: 'a kényelmet',
      design: 'az esztétikát',
      durability: 'a minőséget',
      versatility: 'a praktikumot',
      eco: 'a környezettudatosságot'
    };

    return `${styleMap[allAnswers.space] || 'Egyedi ízlésed van'}, és ${priorityMap[allAnswers.priority] || 'a minőséget'} helyezed előtérbe. Remek választásokat találsz a kínálatunkban!`;
  };

  const findMatchingProducts = (allAnswers) => {
    if (!products || products.length === 0) return [];
    
    let filtered = [...products];
    
    // Budget szűrés
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

    // Helyiség szűrés
    const roomKeywords = {
      living: ['kanapé', 'fotel', 'dohányzó', 'tv', 'nappali', 'ülőgarnitúra'],
      bedroom: ['ágy', 'matrac', 'éjjeli', 'hálószoba', 'gardrób', 'komód'],
      dining: ['étkező', 'asztal', 'szék', 'tálaló'],
      office: ['íróasztal', 'iroda', 'forgószék', 'polc']
    };

    if (allAnswers.room && allAnswers.room !== 'all') {
      const keywords = roomKeywords[allAnswers.room] || [];
      if (keywords.length > 0) {
        const roomFiltered = filtered.filter(p => 
          keywords.some(kw => 
            (p.name || '').toLowerCase().includes(kw) || 
            (p.category || '').toLowerCase().includes(kw)
          )
        );
        if (roomFiltered.length > 0) {
          filtered = roomFiltered;
        }
      }
    }

    // Random sorrend és top 12
    return filtered.sort(() => Math.random() - 0.5).slice(0, 12);
  };

  const QuestionIcon = currentQuestion?.icon || Home;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Style DNA Quiz</h2>
              <p className="text-white/80 text-sm">Fedezd fel a stílusodat!</p>
            </div>
          </div>
          
          {/* Progress */}
          {!styleDNA && !isAnalyzing && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/80 mb-1.5">
                <span>Kérdés {step + 1}/{questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {isAnalyzing ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Elemzés folyamatban...</h3>
              <p className="text-gray-500 text-sm">Az AI készíti a Style DNA profilodat</p>
            </div>
          ) : styleDNA ? (
            <div className="space-y-5">
              {/* Result */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
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
                      <div key={product.id} className="bg-gray-50 rounded-lg p-2 text-center">
                        <img
                          src={product.images?.[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-full aspect-square object-contain rounded bg-white mb-1"
                          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">Kép</text></svg>'; }}
                        />
                        <p className="text-[10px] text-gray-600 truncate">{product.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Termékek megtekintése
              </button>
            </div>
          ) : (
            <div>
              {/* Question */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <QuestionIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{currentQuestion.question}</h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((option) => {
                  const OptionIcon = option.icon;
                  const isSelected = answers[currentQuestion.id] === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={`
                        w-full p-3.5 rounded-xl border-2 text-left transition-all
                        flex items-center gap-3
                        ${isSelected 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${option.color}`}>
                        <OptionIcon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 flex-1">{option.label}</span>
                      {isSelected && <ArrowRight className="w-5 h-5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStyleQuiz;
