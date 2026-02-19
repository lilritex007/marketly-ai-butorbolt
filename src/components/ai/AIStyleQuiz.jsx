import React, { useState, useMemo } from 'react';
import { 
  Sparkles, ArrowRight, X, Loader2, CheckCircle,
  Building2, TreePine, Factory, Clock, Palette,
  CircleDot, Leaf, Zap, Circle,
  DollarSign, Gem, Crown, Target,
  Sofa, Paintbrush, Shield, RefreshCw, TreeDeciduous,
  Tv, BedDouble, UtensilsCrossed, Briefcase, Home,
  ShoppingBag, Star
} from 'lucide-react';
import { generateText } from '../../services/geminiService';
import { formatPrice } from '../../utils/helpers';
import { saveStyleDNA, getPersonalizedRecommendations } from '../../services/userPreferencesService';

/**
 * AIStyleQuiz - Személyre szabott stílus kvíz Gemini AI-val
 * Teljes adatbázis ismeretével
 */
const AIStyleQuiz = ({ products, onRecommendations, onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [styleDNA, setStyleDNA] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [aiExplanation, setAiExplanation] = useState('');

  // Termék statisztikák az AI számára
  const productStats = useMemo(() => {
    if (!products || products.length === 0) return null;
    
    const categories = {};
    const priceRanges = { budget: 0, mid: 0, premium: 0 };
    
    products.forEach(p => {
      // Kategóriák
      const cat = (p.category || 'Egyéb').split(' > ')[0];
      categories[cat] = (categories[cat] || 0) + 1;
      
      // Árkategóriák
      const price = p.salePrice || p.price || 0;
      if (price < 100000) priceRanges.budget++;
      else if (price <= 300000) priceRanges.mid++;
      else priceRanges.premium++;
    });
    
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');
    
    return { 
      total: products.length, 
      topCategories,
      priceRanges
    };
  }, [products]);

  const questions = [
    {
      id: 'space',
      question: 'Milyen a lakásod jelenlegi stílusa?',
      icon: Home,
      options: [
        { id: 'modern', label: 'Modern & Minimalista', icon: Building2, color: 'text-blue-600 bg-blue-50', keywords: ['modern', 'minimalista', 'letisztult', 'egyszerű', 'fehér'] },
        { id: 'scandinavian', label: 'Skandináv & Világos', icon: TreePine, color: 'text-emerald-600 bg-emerald-50', keywords: ['skandináv', 'natúr', 'világos', 'fa', 'természetes'] },
        { id: 'industrial', label: 'Indusztriális & Nyers', icon: Factory, color: 'text-gray-600 bg-gray-100', keywords: ['indusztriális', 'loft', 'fém', 'ipari', 'beton'] },
        { id: 'vintage', label: 'Vintage & Retro', icon: Clock, color: 'text-amber-600 bg-amber-50', keywords: ['vintage', 'retro', 'antik', 'klasszikus', 'régi'] },
        { id: 'bohemian', label: 'Bohém & Színes', icon: Palette, color: 'text-pink-600 bg-pink-50', keywords: ['bohém', 'színes', 'egyedi', 'mintás', 'kreatív'] },
      ]
    },
    {
      id: 'colors',
      question: 'Milyen színeket preferálsz?',
      icon: Palette,
      options: [
        { id: 'neutral', label: 'Semleges (Fehér, Bézs, Szürke)', icon: CircleDot, color: 'text-gray-500 bg-gray-50', keywords: ['fehér', 'bézs', 'szürke', 'krém', 'natúr'] },
        { id: 'earth', label: 'Földszínek (Barna, Zöld)', icon: Leaf, color: 'text-amber-700 bg-amber-50', keywords: ['barna', 'zöld', 'fa', 'dió', 'tölgy'] },
        { id: 'bold', label: 'Merész (Kék, Piros)', icon: Zap, color: 'text-red-600 bg-red-50', keywords: ['kék', 'piros', 'sárga', 'élénk', 'színes'] },
        { id: 'dark', label: 'Sötét (Fekete, Antracit)', icon: Circle, color: 'text-gray-800 bg-gray-200', keywords: ['fekete', 'antracit', 'sötét', 'grafit', 'éjfekete'] },
        { id: 'pastel', label: 'Pasztell (Rózsaszín, Menta)', icon: Sparkles, color: 'text-secondary-500 bg-secondary-50', keywords: ['rózsaszín', 'menta', 'pasztell', 'halvány', 'lágy'] },
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
        { id: 'flexible', label: 'Rugalmas', icon: Target, color: 'text-primary-500 bg-primary-50' },
      ]
    },
    {
      id: 'priority',
      question: 'Mi a legfontosabb számodra?',
      icon: Target,
      options: [
        { id: 'comfort', label: 'Kényelem', icon: Sofa, color: 'text-primary-500 bg-primary-50', keywords: ['kényelmes', 'puha', 'tágas'] },
        { id: 'design', label: 'Design', icon: Paintbrush, color: 'text-pink-600 bg-pink-50', keywords: ['design', 'stílusos', 'elegáns', 'divatos'] },
        { id: 'durability', label: 'Tartósság', icon: Shield, color: 'text-gray-600 bg-gray-100', keywords: ['tartós', 'strapabíró', 'erős', 'masszív'] },
        { id: 'versatility', label: 'Sokoldalúság', icon: RefreshCw, color: 'text-blue-600 bg-blue-50', keywords: ['praktikus', 'átalakítható', 'multifunkciós'] },
        { id: 'eco', label: 'Fenntarthatóság', icon: TreeDeciduous, color: 'text-green-600 bg-green-50', keywords: ['öko', 'natúr', 'fenntartható', 'bio'] },
      ]
    },
    {
      id: 'room',
      question: 'Melyik helyiségbe keresel bútort?',
      icon: Home,
      options: [
        { id: 'living', label: 'Nappali', icon: Tv, color: 'text-primary-500 bg-primary-50', keywords: ['kanapé', 'fotel', 'dohányzó', 'tv', 'nappali', 'ülőgarnitúra', 'sarok'] },
        { id: 'bedroom', label: 'Hálószoba', icon: BedDouble, color: 'text-secondary-700 bg-secondary-50', keywords: ['ágy', 'matrac', 'éjjeli', 'hálószoba', 'gardrób', 'komód', 'franciaágy'] },
        { id: 'dining', label: 'Étkező', icon: UtensilsCrossed, color: 'text-amber-600 bg-amber-50', keywords: ['étkező', 'asztal', 'szék', 'tálaló', 'étkezőasztal', 'étkezőszék'] },
        { id: 'office', label: 'Dolgozószoba', icon: Briefcase, color: 'text-gray-600 bg-gray-100', keywords: ['íróasztal', 'iroda', 'forgószék', 'polc', 'könyvespolc'] },
        { id: 'all', label: 'Teljes lakás', icon: Home, color: 'text-emerald-600 bg-emerald-50', keywords: [] },
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

    try {
      // Összegyűjtjük a kulcsszavakat a válaszok alapján
      const selectedKeywords = [];
      questions.forEach(q => {
        const answer = allAnswers[q.id];
        const option = q.options.find(o => o.id === answer);
        if (option?.keywords) {
          selectedKeywords.push(...option.keywords);
        }
      });

      // AI-val keresünk termékeket
      const matchedProducts = await findMatchingProductsWithAI(allAnswers, selectedKeywords);
      setRecommendations(matchedProducts);

      // Stílus leírások
      const styleLabels = {
        modern: 'modern, minimalista',
        scandinavian: 'skandináv, világos',
        industrial: 'indusztriális, loft',
        vintage: 'vintage, retro',
        bohemian: 'bohém, színes'
      };
      
      const colorLabels = {
        neutral: 'semleges színeket (fehér, bézs, szürke)',
        earth: 'földszíneket (barna, zöld)',
        bold: 'élénk színeket (kék, piros)',
        dark: 'sötét tónusokat (fekete, antracit)',
        pastel: 'pasztell árnyalatokat'
      };

      const roomLabels = {
        living: 'nappaliba',
        bedroom: 'hálószobába',
        dining: 'étkezőbe',
        office: 'dolgozószobába',
        all: 'a teljes lakásba'
      };

      const budgetLabels = {
        budget: '100 ezer Ft alatt',
        mid: '100-300 ezer Ft között',
        premium: '300 ezer Ft felett',
        flexible: 'rugalmas költségvetéssel'
      };

      // AI prompt a személyre szabott profilhoz
      const prompt = `Te egy profi lakberendező tanácsadó vagy. Készíts személyre szabott profilt és adj konkrét termékajánlásokat!

VÁSÁRLÓ PREFERENCIÁI:
- Stílus: ${styleLabels[allAnswers.space] || allAnswers.space}
- Színek: ${colorLabels[allAnswers.colors] || allAnswers.colors}
- Helyiség: ${roomLabels[allAnswers.room] || allAnswers.room}
- Költségvetés: ${budgetLabels[allAnswers.budget] || allAnswers.budget}

ELÉRHETŐ TERMÉKEK (${productStats?.total || 0} db összesen):
${matchedProducts.slice(0, 8).map(p => `- ${p.name}: ${(p.salePrice || p.price || 0).toLocaleString('hu-HU')} Ft`).join('\n')}

FELADATOD:
1. Írj egy 2-3 mondatos személyre szabott stílusprofilt
2. Magyarázd el, MIÉRT ezeket a termékeket ajánlod (1 mondat)

Legyél barátságos, használj tegezést. Magyarul válaszolj!`;

      const result = await generateText(prompt, { temperature: 0.8, maxTokens: 250 });

      let finalStyleDNA;
      if (result.success && result.text) {
        finalStyleDNA = result.text;
      } else {
        finalStyleDNA = getLocalStyleDNA(allAnswers);
      }
      
      setStyleDNA(finalStyleDNA);
      saveStyleDNA(allAnswers, finalStyleDNA);

      if (onRecommendations && matchedProducts.length > 0) {
        onRecommendations(matchedProducts);
      }

    } catch (error) {
      console.error('Quiz hiba:', error);
      const fallbackProducts = findMatchingProductsLocal(allAnswers);
      setRecommendations(fallbackProducts);
      const fallbackDNA = getLocalStyleDNA(allAnswers);
      setStyleDNA(fallbackDNA);
      saveStyleDNA(allAnswers, fallbackDNA);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI-val támogatott termék keresés
  const findMatchingProductsWithAI = async (allAnswers, keywords) => {
    if (!products || products.length === 0) return [];
    
    // Először lokálisan szűrünk
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

    // Helyiség és kulcsszó alapú szűrés
    const roomOption = questions.find(q => q.id === 'room')?.options.find(o => o.id === allAnswers.room);
    const roomKeywords = roomOption?.keywords || [];
    const allKeywords = [...keywords, ...roomKeywords];

    // Pontozás a termékeknek
    const scored = filtered.map(p => {
      const productText = `${p.name || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
      let score = 0;
      
      allKeywords.forEach(kw => {
        if (productText.includes(kw.toLowerCase())) {
          score += 10;
        }
      });
      
      // Kategória egyezés extra pont
      if (roomKeywords.length > 0) {
        roomKeywords.forEach(kw => {
          if (productText.includes(kw.toLowerCase())) {
            score += 5;
          }
        });
      }
      
      return { product: p, score };
    });

    // Top termékek
    const topProducts = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(s => s.product);

    // Ha van elég találat, random válogatás a változatosságért
    if (topProducts.length > 12) {
      return topProducts.sort(() => Math.random() - 0.5).slice(0, 12);
    }

    // Ha kevés a pontos találat, töltsük fel releváns termékekkel
    if (topProducts.length < 6) {
      const additionalProducts = filtered
        .filter(p => !topProducts.some(tp => tp.id === p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 12 - topProducts.length);
      
      return [...topProducts, ...additionalProducts];
    }

    return topProducts;
  };

  // Lokális fallback keresés
  const findMatchingProductsLocal = (allAnswers) => {
    if (!products || products.length === 0) return [];
    
    let filtered = [...products];
    
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

    return filtered.sort(() => Math.random() - 0.5).slice(0, 12);
  };

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

    return `${styleMap[allAnswers.space] || 'Egyedi ízlésed van'}, és ${priorityMap[allAnswers.priority] || 'a minőséget'} helyezed előtérbe. Az ajánlott termékek tökéletesen illenek a stílusodhoz!`;
  };

  const QuestionIcon = currentQuestion?.icon || Home;

  return (
    <div 
      className="fixed inset-0 lg:top-[60px] z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-700 p-5 relative">
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
              <p className="text-white/80 text-sm">
                {productStats ? `${productStats.total.toLocaleString()} termékből válogatunk` : 'Fedezd fel a stílusodat!'}
              </p>
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
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI elemzés folyamatban...</h3>
              <p className="text-gray-500 text-sm">
                {productStats?.total.toLocaleString()} termékből keressük a neked valókat
              </p>
            </div>
          ) : styleDNA ? (
            <div className="space-y-5">
              {/* Result */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-5 border border-primary-100">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-bold text-gray-900">A Te Style DNA-d</h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{styleDNA}</p>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Személyre szabott ajánlatok ({recommendations.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {recommendations.slice(0, 6).map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-2 text-center hover:bg-primary-50 transition-colors cursor-pointer">
                        <img
                          src={product.images?.[0] || product.image || '/placeholder.png'}
                          alt={product.name}
                          className="w-full aspect-square object-contain rounded bg-white mb-1"
                          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">Kép</text></svg>'; }}
                        />
                        <p className="text-[10px] text-gray-600 truncate">{product.name}</p>
                        <p className="text-xs font-bold text-primary-500">{formatPrice(product.salePrice || product.price)}</p>
                      </div>
                    ))}
                  </div>
                  {recommendations.length > 6 && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                      + {recommendations.length - 6} további ajánlat
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-700 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Termékek megtekintése
              </button>
            </div>
          ) : (
            <div>
              {/* Question */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <QuestionIcon className="w-5 h-5 text-primary-500" />
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
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${option.color}`}>
                        <OptionIcon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 flex-1">{option.label}</span>
                      {isSelected && <ArrowRight className="w-5 h-5 text-primary-500" />}
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
