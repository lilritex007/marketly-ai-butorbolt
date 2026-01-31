import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, User, Bot, AlertCircle, ThumbsUp, ThumbsDown, Clock, Heart, Search } from 'lucide-react';
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
 * AIChatAssistant - Lebegő AI Chat Gemini-val
 * Személyre szabott ajánlások, conversation memory, feedback
 */
const AIChatAssistant = ({ products, onShowProducts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdRef = useRef(0);

  // Inicializálás - előző kontextus betöltése
  useEffect(() => {
    const savedContext = getChatContext();
    const recentlyViewed = getViewedProducts(3);
    
    let welcomeMessage = 'Szia! 👋 Segíthetek megtalálni a tökéletes bútort. Mit keresel?';
    
    if (savedContext?.summary) {
      welcomeMessage = `Szia újra! 👋 Legutóbb ${savedContext.summary} Miben segíthetek most?`;
    } else if (recentlyViewed.length > 0) {
      welcomeMessage = `Szia! 👋 Látom, hogy korábban ${recentlyViewed[0].name} terméket nézted. Segíthetek hasonlót találni, vagy valami mást keresel?`;
    }
    
    setMessages([{
      id: generateMessageId(),
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  }, []);

  const generateMessageId = () => {
    messageIdRef.current += 1;
    return `msg_${Date.now()}_${messageIdRef.current}`;
  };

  // Termék statisztikák
  const productStats = useMemo(() => {
    if (!products || products.length === 0) return null;

    const categories = {};
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach(p => {
      const cat = p.category || 'Egyéb';
      const mainCat = cat.split(' > ')[0];
      categories[mainCat] = (categories[mainCat] || 0) + 1;
      const price = p.salePrice || p.price || 0;
      if (price > 0) {
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      }
    });

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => `${name} (${count} db)`)
      .join(', ');

    return {
      total: products.length,
      categories: topCategories,
      priceRange: `${minPrice.toLocaleString('hu-HU')} - ${maxPrice.toLocaleString('hu-HU')} Ft`
    };
  }, [products]);

  // Keresés a termékek között
  const searchProducts = useCallback((query) => {
    if (!products || products.length === 0) return [];
    
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (terms.length === 0) return [];

    const scored = products.map(p => {
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      
      let score = 0;
      terms.forEach(term => {
        if (name.includes(term)) score += 10;
        if (category.includes(term)) score += 5;
        if (desc.includes(term)) score += 2;
      });
      return { product: p, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(s => s.product);
  }, [products]);

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

  // Feedback kezelése
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

  // Termék kattintás - megmutatja az oldalon
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
    
    // Keresés rögzítése
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
      // Releváns termékek keresése
      const relevantProducts = searchProducts(userMessage);
      
      // Személyre szabott kontextus
      const personalContext = getPersonalizedContext();
      
      // Előző beszélgetés összefoglalója
      const conversationHistory = messages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'Vásárló' : 'AI'}: ${m.content.slice(0, 100)}`)
        .join('\n');

      const productList = relevantProducts.length > 0
        ? relevantProducts.map(p => 
            `• ${p.name} - ${(p.salePrice || p.price || 0).toLocaleString('hu-HU')} Ft`
          ).join('\n')
        : 'Nincs pontos találat.';

      const prompt = `Te egy kedves, profi AI bútor tanácsadó vagy a Marketly bútorwebshopban.

WEBSHOP:
- ${productStats?.total || 0} termék
- Kategóriák: ${productStats?.categories || 'változatos'}
- Ár: ${productStats?.priceRange || 'változó'}

FELHASZNÁLÓ PROFILJA:
${personalContext}

BESZÉLGETÉS ELŐZMÉNYE:
${conversationHistory || 'Új beszélgetés'}

FELHASZNÁLÓ KÉRDÉSE: "${userMessage}"

TALÁLT TERMÉKEK:
${productList}

FELADATOD:
1. Válaszolj magyarul, barátságosan, tegezve
2. Ha vannak termékek, ajánld őket konkrétan (max 3-4)
3. Ha ismered az előzményeit, hivatkozz rá személyesen
4. Maximum 3-4 mondat
5. Ha termékeket mutatsz, zárd ezzel: "Kattints a termékekre lent, hogy megnézd őket!"`;

      const result = await generateText(prompt, { temperature: 0.7, maxTokens: 400 });

      const assistantMsgId = generateMessageId();

      if (result.success && result.text) {
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: 'assistant',
          content: result.text,
          timestamp: new Date(),
          products: relevantProducts.slice(0, 6),
          userQuery: userMessage
        }]);
        
        // Kontextus mentése
        saveChatContext(`${userMessage.slice(0, 50)}... kerestél.`);
      } else {
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: 'assistant',
          content: getFallbackResponse(userMessage, relevantProducts),
          timestamp: new Date(),
          products: relevantProducts.slice(0, 6),
          userQuery: userMessage,
          isError: true
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

  const getFallbackResponse = (message, foundProducts) => {
    if (foundProducts && foundProducts.length > 0) {
      return `Találtam ${foundProducts.length} terméket! Kattints rájuk lent, hogy megnézd őket az oldalon.`;
    }

    const msg = message.toLowerCase();
    
    if (msg.includes('kanapé') || msg.includes('ülőgarnitúra')) {
      return 'Kanapékat keresel? Használd a keresőt "kanapé" kifejezéssel, vagy böngészd a Kanapék kategóriát!';
    }
    if (msg.includes('asztal')) {
      return 'Asztalokat keresel? Az étkezőasztalok és dohányzóasztalok széles választéka vár!';
    }
    if (msg.includes('ágy') || msg.includes('hálószoba')) {
      return 'Hálószobai bútorokat keresel? Nézd meg az ágyak és matracok kínálatát!';
    }
    
    return 'Írd le pontosabban, milyen bútort keresel (pl. "modern kanapé 200 ezer alatt").';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gyors kérdések a korábbi keresések és megtekintett termékek alapján
  const quickSuggestions = useMemo(() => {
    const searches = getSearchHistory(3);
    const viewed = getViewedProducts(2);
    
    const suggestions = [];
    
    if (viewed.length > 0) {
      suggestions.push(`Hasonló mint: ${viewed[0].name.slice(0, 20)}...`);
    }
    
    if (searches.length > 0) {
      suggestions.push(searches[0].query);
    }
    
    // Default suggestions
    const defaults = ['Modern kanapékat keresek', 'Mit ajánlasz 100 ezer alatt?', 'Skandináv stílusú bútorok'];
    
    return [...suggestions, ...defaults].slice(0, 4);
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
            fixed bottom-[calc(1.5rem+44px)] md:bottom-6 right-4 md:right-6 z-50
            w-14 h-14 md:w-16 md:h-16 rounded-full
            bg-gradient-to-br from-primary-500 to-secondary-700
            text-white shadow-2xl
            flex items-center justify-center
            transition-all duration-300
            hover:shadow-primary-500/50 hover:scale-110
          "
          aria-label="AI Chat megnyitása"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Chat Ablak */}
      {isOpen && (
        <div className="
          fixed bottom-[calc(1rem+44px)] md:bottom-6 right-2 md:right-6 z-50
          w-[calc(100vw-1rem)] md:w-[420px] h-[calc(100vh-120px)] md:h-[600px] max-h-[85vh]
          bg-white rounded-2xl shadow-2xl
          flex flex-col overflow-hidden border border-gray-200
        ">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Tanácsadó</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Személyre szabott ajánlások
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2"
              aria-label="Bezárás"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Üzenetek */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
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
                      rounded-2xl p-3
                      ${message.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
                      }
                    `}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Feedback gombok (csak assistant üzeneteknél) */}
                    {message.role === 'assistant' && !message.feedback && (
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
                        <span className="text-[10px] text-gray-400 ml-1">
                          {message.timestamp.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    
                    {/* Feedback megjelenítése */}
                    {message.feedback && (
                      <div className={`text-[10px] mt-1 ml-1 ${message.feedback === 'positive' ? 'text-green-600' : 'text-gray-400'}`}>
                        {message.feedback === 'positive' ? '👍 Köszönjük!' : '👎 Fejlődünk'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Termék kártyák */}
                {message.products && message.products.length > 0 && (
                  <div className="ml-11 mt-3">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      Kattints a termékre az oldalon való megtekintéshez:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {message.products.slice(0, 4).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product, message.products)}
                          className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-300 transition-all text-left group"
                        >
                          <div className="aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden">
                            <img
                              src={product.images?.[0] || product.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
                            />
                          </div>
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">{product.name}</p>
                          <p className="text-sm font-bold text-primary-500 mt-1">{formatPrice(product.salePrice || product.price)}</p>
                        </button>
                      ))}
                    </div>
                    {message.products.length > 4 && (
                      <button
                        onClick={() => handleProductClick(message.products[0], message.products)}
                        className="w-full mt-2 py-2 text-xs text-primary-500 hover:text-primary-700 font-medium"
                      >
                        + {message.products.length - 4} további termék megtekintése
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-700 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    <span className="text-sm text-gray-500">Keresem a legjobb ajánlatokat...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Gyors javaslatok */}
          {messages.length <= 2 && (
            <div className="p-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Próbáld ki:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors truncate max-w-[180px]"
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
                placeholder="Kérdezz bármit a bútorokról..."
                className="
                  flex-1 px-4 py-3 rounded-full
                  bg-gray-100 text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  text-sm
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
                  hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
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
