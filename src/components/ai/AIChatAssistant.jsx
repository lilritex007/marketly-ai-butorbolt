import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, User, Bot, AlertCircle, ThumbsUp, ThumbsDown, Search, Package, Tag, TrendingUp, Filter } from 'lucide-react';
import { generateText } from '../../services/geminiService';
import { 
  getPersonalizedContext, 
  trackAIFeedback, 
  getViewedProducts, 
  trackSearch,
  saveChatContext,
  getChatContext,
  getSearchHistory
} from '../../services/userPreferencesService';

/**
 * AIChatAssistant - Super Smart AI Chat with Full Product Knowledge
 * - Teljes termékkatalógus ismerete
 * - Okos keresés szinonimákkal és ár szűréssel
 * - Kategória és stílus alapú ajánlások
 * - Személyre szabott válaszok
 */
const AIChatAssistant = ({ products, onShowProducts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdRef = useRef(0);

  // Szinonimák és kapcsolódó kifejezések
  const synonymMap = useMemo(() => ({
    // Bútor típusok
    'kanapé': ['ülőgarnitúra', 'szófa', 'couch', 'sofa', 'heverő', 'pamlag'],
    'ülőgarnitúra': ['kanapé', 'szófa', 'nappali bútor'],
    'ágy': ['franciaágy', 'hálószoba', 'fekvőhely', 'ágyneműtartós'],
    'asztal': ['étkezőasztal', 'dohányzóasztal', 'íróasztal'],
    'szék': ['étkező szék', 'forgószék', 'irodai szék'],
    'szekrény': ['gardrób', 'ruhásszekrény', 'gardróbszekrény', 'komód'],
    'komód': ['fiókos szekrény', 'tároló'],
    'polc': ['könyvespolc', 'falipolc', 'állópolc'],
    
    // Stílusok
    'modern': ['kortárs', 'minimalista', 'letisztult'],
    'skandináv': ['nordic', 'északi', 'scandi'],
    'rusztikus': ['vidéki', 'country', 'vintage'],
    'klasszikus': ['elegáns', 'tradicionális', 'időtlen'],
    'indusztriális': ['industrial', 'loft', 'ipari'],
    
    // Szobák
    'nappali': ['living room', 'társalgó'],
    'hálószoba': ['bedroom', 'alvó'],
    'étkező': ['dining', 'ebédlő'],
    'dolgozószoba': ['iroda', 'home office', 'munkaszoba'],
    'előszoba': ['hall', 'közlekedő'],
    'fürdőszoba': ['bathroom', 'mosdó'],
    
    // Anyagok
    'fa': ['tömörfa', 'fenyő', 'tölgy', 'bükk'],
    'bőr': ['valódi bőr', 'műbőr', 'textilbőr'],
    'szövet': ['textil', 'kárpit'],
  }), []);

  // Ár szűrő kulcsszavak
  const priceKeywords = useMemo(() => ({
    'olcsó': { max: 50000 },
    'kedvező': { max: 80000 },
    'megfizethető': { max: 100000 },
    'akciós': { max: 100000 },
    'budget': { max: 80000 },
    '50 ezer alatt': { max: 50000 },
    '100 ezer alatt': { max: 100000 },
    '150 ezer alatt': { max: 150000 },
    '200 ezer alatt': { max: 200000 },
    '300 ezer alatt': { max: 300000 },
    'prémium': { min: 200000 },
    'luxus': { min: 300000 },
    'minőségi': { min: 150000 },
  }), []);

  // Teljes katalógus elemzés
  const catalogStats = useMemo(() => {
    if (!products || products.length === 0) return null;

    const categories = {};
    const mainCategories = {};
    const priceRanges = { under50k: 0, under100k: 0, under200k: 0, over200k: 0 };
    let minPrice = Infinity;
    let maxPrice = 0;
    const brands = {};

    products.forEach(p => {
      // Kategória feldolgozás
      const cat = p.category || 'Egyéb';
      categories[cat] = (categories[cat] || 0) + 1;
      
      const mainCat = cat.split(' > ')[0];
      if (!mainCategories[mainCat]) {
        mainCategories[mainCat] = { count: 0, subcategories: new Set(), priceRange: { min: Infinity, max: 0 } };
      }
      mainCategories[mainCat].count++;
      if (cat.includes(' > ')) {
        mainCategories[mainCat].subcategories.add(cat.split(' > ').slice(1).join(' > '));
      }
      
      // Ár feldolgozás
      const price = p.salePrice || p.price || 0;
      if (price > 0) {
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
        mainCategories[mainCat].priceRange.min = Math.min(mainCategories[mainCat].priceRange.min, price);
        mainCategories[mainCat].priceRange.max = Math.max(mainCategories[mainCat].priceRange.max, price);
        
        if (price < 50000) priceRanges.under50k++;
        else if (price < 100000) priceRanges.under100k++;
        else if (price < 200000) priceRanges.under200k++;
        else priceRanges.over200k++;
      }
    });

    // Top kategóriák
    const topCategories = Object.entries(mainCategories)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([name, data]) => ({
        name,
        count: data.count,
        subcategories: Array.from(data.subcategories).slice(0, 5),
        priceRange: data.priceRange
      }));

    return {
      total: products.length,
      categories: topCategories,
      priceRange: { min: minPrice, max: maxPrice },
      priceDistribution: priceRanges
    };
  }, [products]);

  // Okos termék keresés
  const smartSearch = useCallback((query, options = {}) => {
    if (!products || products.length === 0) return [];
    
    const { maxResults = 12, priceMin, priceMax } = options;
    const lowerQuery = query.toLowerCase();
    
    // Szinonimák kibontása
    const expandedTerms = new Set();
    const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);
    
    words.forEach(word => {
      expandedTerms.add(word);
      Object.entries(synonymMap).forEach(([key, synonyms]) => {
        if (key.includes(word) || synonyms.some(s => s.includes(word))) {
          expandedTerms.add(key);
          synonyms.forEach(s => expandedTerms.add(s));
        }
      });
    });

    // Ár szűrő felismerés
    let detectedPriceMax = priceMax;
    let detectedPriceMin = priceMin;
    Object.entries(priceKeywords).forEach(([keyword, range]) => {
      if (lowerQuery.includes(keyword)) {
        if (range.max) detectedPriceMax = detectedPriceMax ? Math.min(detectedPriceMax, range.max) : range.max;
        if (range.min) detectedPriceMin = detectedPriceMin ? Math.max(detectedPriceMin, range.min) : range.min;
      }
    });

    // Szám alapú ár felismerés (pl. "100 ezer", "50000")
    const priceMatch = lowerQuery.match(/(\d+)\s*(ezer|000|k)/i);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1]) * (priceMatch[2].toLowerCase() === 'ezer' || priceMatch[2] === 'k' ? 1000 : 1);
      if (lowerQuery.includes('alatt') || lowerQuery.includes('max')) {
        detectedPriceMax = amount;
      } else if (lowerQuery.includes('felett') || lowerQuery.includes('min')) {
        detectedPriceMin = amount;
      }
    }

    // Pontozásos keresés
    const scored = products.map(p => {
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const desc = (p.description || p.params || '').toLowerCase();
      const price = p.salePrice || p.price || 0;
      
      // Ár szűrés
      if (detectedPriceMax && price > detectedPriceMax) return { product: p, score: -1 };
      if (detectedPriceMin && price < detectedPriceMin) return { product: p, score: -1 };
      
      let score = 0;
      
      expandedTerms.forEach(term => {
        // Pontos egyezés a névben
        if (name.includes(term)) score += 15;
        // Kategória egyezés
        if (category.includes(term)) score += 10;
        // Leírás egyezés
        if (desc.includes(term)) score += 5;
      });
      
      // Bónusz akciós termékekre
      if (p.salePrice && p.salePrice < p.price) score += 3;
      
      // Bónusz ha van kép
      if (p.images?.length > 0 || p.image) score += 2;
      
      return { product: p, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.product);
  }, [products, synonymMap, priceKeywords]);

  // Kategória alapú ajánlások
  const getCategoryProducts = useCallback((categoryName, limit = 6) => {
    if (!products) return [];
    return products
      .filter(p => (p.category || '').toLowerCase().includes(categoryName.toLowerCase()))
      .sort((a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0))
      .slice(0, limit);
  }, [products]);

  const generateMessageId = () => {
    messageIdRef.current += 1;
    return `msg_${Date.now()}_${messageIdRef.current}`;
  };

  // Inicializálás
  useEffect(() => {
    const savedContext = getChatContext();
    const recentlyViewed = getViewedProducts(3);
    
    let welcomeMessage = `Szia! 👋 A Marketly AI tanácsadója vagyok.\n\n`;
    welcomeMessage += `📦 **${catalogStats?.total?.toLocaleString('hu-HU') || 0}** termék közül segítek választani!\n`;
    welcomeMessage += `💡 Kérdezz bátran, ismerem a teljes kínálatot.`;
    
    if (recentlyViewed.length > 0) {
      welcomeMessage = `Szia újra! 👋\n\nLátom, hogy a **${recentlyViewed[0].name}** terméket nézted.\nSegíthetek hasonlót találni, vagy valami mást keresel?\n\n📦 ${catalogStats?.total?.toLocaleString('hu-HU') || 0} termék áll rendelkezésre!`;
    }
    
    setMessages([{
      id: generateMessageId(),
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  }, [catalogStats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleFeedback = (messageId, isPositive) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    trackAIFeedback(messageId, isPositive, {
      query: message.userQuery || '',
      productCount: message.products?.length || 0,
    });
    
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback: isPositive ? 'positive' : 'negative' } : m
    ));
  };

  const handleProductClick = (product, allRecommended) => {
    if (onShowProducts) {
      onShowProducts(product, allRecommended);
    }
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    trackSearch(userMessage);

    const userMsgId = generateMessageId();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      // Okos keresés
      const relevantProducts = smartSearch(userMessage, { maxResults: 12 });
      
      // Személyre szabott kontextus
      const personalContext = getPersonalizedContext();
      const recentViewed = getViewedProducts(3);
      
      // Beszélgetés előzménye
      const conversationHistory = messages
        .slice(-4)
        .map(m => `${m.role === 'user' ? 'VÁSÁRLÓ' : 'TANÁCSADÓ'}: ${m.content.slice(0, 150)}`)
        .join('\n');

      // Kategória összefoglaló az AI-nak
      const categoryInfo = catalogStats?.categories
        .slice(0, 10)
        .map(c => `• ${c.name}: ${c.count} db (${Math.round(c.priceRange.min/1000)}k - ${Math.round(c.priceRange.max/1000)}k Ft)`)
        .join('\n') || '';

      // Talált termékek formázása
      const productList = relevantProducts.length > 0
        ? relevantProducts.slice(0, 8).map(p => 
            `• ${p.name} | ${(p.salePrice || p.price || 0).toLocaleString('hu-HU')} Ft | ${p.category?.split(' > ')[0] || 'Egyéb'}${p.salePrice && p.salePrice < p.price ? ' [AKCIÓ!]' : ''}`
          ).join('\n')
        : 'Nem találtam pontos egyezést, de tudok ajánlani hasonlókat!';

      // Korábban nézett termékek
      const viewedInfo = recentViewed.length > 0
        ? `Korábban nézett: ${recentViewed.map(p => p.name).join(', ')}`
        : '';

      const prompt = `Te a Marketly bútorwebshop SZAKÉRTŐ AI tanácsadója vagy. Tökéletesen ismered a teljes kínálatot!

===== WEBSHOP ADATOK =====
Összes termék: ${catalogStats?.total?.toLocaleString('hu-HU') || 0} db
Árkategória: ${Math.round((catalogStats?.priceRange?.min || 0)/1000)}k - ${Math.round((catalogStats?.priceRange?.max || 0)/1000)}k Ft

TOP KATEGÓRIÁK:
${categoryInfo}

===== BESZÉLGETÉS =====
${conversationHistory || 'Új beszélgetés'}

===== VÁSÁRLÓ PROFILJA =====
${personalContext || 'Új látogató'}
${viewedInfo}

===== KÉRDÉS =====
"${userMessage}"

===== TALÁLT TERMÉKEK =====
${productList}
${relevantProducts.length > 0 ? `\n(Összesen ${relevantProducts.length} releváns termék)` : ''}

===== FELADATOD =====
1. MINDIG válaszolj magyarul, tegezve, barátságosan de professzionálisan
2. Ha vannak releváns termékek, ajánlj KONKRÉTAN 2-4 darabot névvel és árral
3. Ha nincs pontos találat, javasolj KATEGÓRIÁT vagy szűkítést
4. Adj hasznos tanácsot (méret, stílus, kombináció)
5. Ha ár kérdés volt, hangsúlyozd az ár-érték arányt
6. Maximum 4-5 mondat, lényegre törően
7. Ha termékeket mutatsz, zárd: "👇 Kattints rájuk lent a részletekért!"

VÁLASZOLJ MOST:`;

      const result = await generateText(prompt, { temperature: 0.7, maxTokens: 500 });

      const assistantMsgId = generateMessageId();

      if (result.success && result.text) {
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: 'assistant',
          content: result.text,
          timestamp: new Date(),
          products: relevantProducts.slice(0, 8),
          userQuery: userMessage
        }]);
        
        saveChatContext(`${userMessage.slice(0, 50)}... kerestél.`);
      } else {
        // Fallback válasz jobb termékekkel
        const fallbackProducts = relevantProducts.length > 0 
          ? relevantProducts 
          : getCategoryProducts('kanapé', 4);
          
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: 'assistant',
          content: relevantProducts.length > 0 
            ? `Találtam ${relevantProducts.length} terméket! 👇 Nézd meg őket lent, és kattints a részletekért!`
            : 'Jelenleg nem tudok konkrét terméket ajánlani, de böngészd a kategóriákat a menüben!',
          timestamp: new Date(),
          products: fallbackProducts,
          userQuery: userMessage,
          isError: !relevantProducts.length
        }]);
      }

    } catch (error) {
      console.error('Chat hiba:', error);
      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Elnézést, technikai hiba történt. Próbáld újra!',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gyors kérdések - okosabb javaslatok
  const quickSuggestions = useMemo(() => {
    const viewed = getViewedProducts(2);
    const searches = getSearchHistory(2);
    
    const suggestions = [];
    
    // Személyre szabott javaslatok
    if (viewed.length > 0) {
      const cat = viewed[0].category?.split(' > ')[0];
      if (cat) suggestions.push(`${cat} ajánlatok`);
    }
    
    if (searches.length > 0 && searches[0].query) {
      suggestions.push(searches[0].query);
    }

    // Alapértelmezett javaslatok
    const defaults = [
      'Modern kanapé 150 ezer alatt',
      'Étkezőasztal 6 személyes',
      'Skandináv stílusú bútorok',
      'Hálószoba berendezés',
      'Akciós termékek'
    ];
    
    return [...suggestions, ...defaults].slice(0, 5);
  }, []);

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('hu-HU') + ' Ft';
  };

  return (
    <>
      {/* Lebegő Chat Gomb */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            fixed bottom-[calc(1.5rem+44px)] md:bottom-6 right-4 md:right-6 z-[100]
            w-14 h-14 md:w-16 md:h-16 rounded-full
            bg-gradient-to-br from-primary-500 to-secondary-700
            text-white shadow-2xl
            flex items-center justify-center
            transition-all duration-300
            hover:shadow-primary-500/50 hover:scale-110
            group
          "
          aria-label="AI Chat megnyitása"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
            AI
          </span>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Tanácsadó
          </span>
        </button>
      )}

      {/* Chat Ablak */}
      {isOpen && (
        <div className="
          fixed bottom-0 md:bottom-6 right-0 md:right-6 z-[9999]
          w-full md:w-[440px] h-[100dvh] md:h-[650px] md:max-h-[85vh]
          bg-white md:rounded-2xl shadow-2xl
          flex flex-col overflow-hidden border-0 md:border border-gray-200
        ">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AI Tanácsadó</h3>
                <p className="text-white/80 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {catalogStats?.total?.toLocaleString('hu-HU') || 0} termék ismerete
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              aria-label="Bezárás"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Üzenetek */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                    ${message.role === 'user' 
                      ? 'bg-primary-500' 
                      : message.isError 
                        ? 'bg-orange-500'
                        : 'bg-gradient-to-br from-primary-500 to-secondary-700'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : message.isError ? (
                      <AlertCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className="max-w-[85%]">
                    <div className={`
                      rounded-2xl p-3.5
                      ${message.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm shadow-md border border-gray-100'
                      }
                    `}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Feedback */}
                    {message.role === 'assistant' && !message.feedback && !message.isError && (
                      <div className="flex items-center gap-1 mt-1.5 ml-1">
                        <button
                          onClick={() => handleFeedback(message.id, true)}
                          className="p-1.5 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
                          title="Hasznos volt"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, false)}
                          className="p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                          title="Nem volt hasznos"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    
                    {message.feedback && (
                      <div className={`text-[10px] mt-1 ml-1 ${message.feedback === 'positive' ? 'text-green-600' : 'text-gray-400'}`}>
                        {message.feedback === 'positive' ? '👍 Köszönjük!' : '👎 Fejlődünk'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Termék kártyák - javított megjelenés */}
                {message.products && message.products.length > 0 && (
                  <div className="ml-12 mt-3">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5 font-medium">
                      <Package className="w-3.5 h-3.5" />
                      {message.products.length} termék - kattints a megtekintéshez:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {message.products.slice(0, 6).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product, message.products)}
                          className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-300 hover:-translate-y-0.5 transition-all text-left group"
                        >
                          <div className="aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden relative">
                            <img
                              src={product.images?.[0] || product.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
                            />
                            {product.salePrice && product.salePrice < product.price && (
                              <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                -{Math.round((1 - product.salePrice/product.price) * 100)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                          <p className="text-sm font-bold text-primary-600">{formatPrice(product.salePrice || product.price)}</p>
                        </button>
                      ))}
                    </div>
                    {message.products.length > 6 && (
                      <button
                        onClick={() => handleProductClick(message.products[0], message.products)}
                        className="w-full mt-2 py-2.5 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                      >
                        + {message.products.length - 6} további termék megtekintése →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-700 flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    <span className="text-sm text-gray-600">Keresem a legjobb ajánlatokat...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Gyors javaslatok */}
          {messages.length <= 2 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Népszerű keresések:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 text-xs bg-white text-gray-700 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors border border-gray-200 hover:border-primary-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pl: Modern kanapé 100 ezer alatt..."
                className="
                  flex-1 px-4 py-3.5 rounded-full
                  bg-gray-100 text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                  text-sm placeholder:text-gray-400
                  border border-transparent focus:border-primary-300
                "
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="
                  w-12 h-12 rounded-full
                  bg-gradient-to-br from-primary-500 to-secondary-700
                  text-white
                  flex items-center justify-center
                  transition-all
                  hover:scale-105 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                "
                aria-label="Küldés"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
