import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import { generateText } from '../../services/geminiService';

/**
 * AIChatAssistant - Lebegő AI Chat Gemini-val
 * Természetes nyelvű termékkeresés és ajánlások
 */
const AIChatAssistant = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Szia! 👋 Segíthetek megtalálni a tökéletes bútort. Mit keresel?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // User üzenet hozzáadása
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      // Termék kontextus előkészítése
      const productSample = products && products.length > 0 
        ? products.slice(0, 15).map(p => 
            `${p.name} - ${(p.salePrice || p.price || 0).toLocaleString('hu-HU')} Ft`
          ).join('\n')
        : 'Nincs elérhető termék.';

      const prompt = `Te egy kedves és segítőkész AI bútor tanácsadó vagy a Marketly webshopban.

FELHASZNÁLÓ KÉRDÉSE: "${userMessage}"

NÉHÁNY TERMÉK A KÍNÁLATBÓL:
${productSample}

SZABÁLYOK:
- Válaszolj magyarul, 2-3 mondatban
- Legyél barátságos és segítőkész
- Ha bútort keres, adj konkrét javaslatokat
- Ha nem értesz valamit, kérdezz vissza`;

      const result = await generateText(prompt, { temperature: 0.8, maxTokens: 300 });

      if (result.success && result.text) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.text,
          timestamp: new Date()
        }]);
      } else {
        // Fallback válasz API hiba esetén
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: getFallbackResponse(userMessage),
          timestamp: new Date(),
          isError: true
        }]);
      }

    } catch (error) {
      console.error('Chat hiba:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Elnézést, technikai hiba történt. Próbáld újra!',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback válaszok ha az API nem működik
  const getFallbackResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('kanapé') || msg.includes('ülőgarnitúra')) {
      return 'Kanapékat keresel? Nézd meg a "Kanapék" kategóriát a termékek között! Modern és klasszikus stílusokban is találsz remek darabokat.';
    }
    if (msg.includes('asztal') || msg.includes('étkező')) {
      return 'Asztalokat keresel? Az étkezőasztalok és dohányzóasztalok széles választékát találod a termékek között!';
    }
    if (msg.includes('szék') || msg.includes('fotel')) {
      return 'Ülőalkalmatosságot keresel? Böngéssz a székek és fotelek között, biztosan találsz megfelelőt!';
    }
    if (msg.includes('ágy') || msg.includes('matrac') || msg.includes('hálószoba')) {
      return 'Hálószobai bútorokat keresel? Az ágyak és matracok kategóriában remek választékot találsz!';
    }
    
    return 'Szívesen segítek! Böngéssz a termékek között, vagy írd le pontosabban, milyen bútort keresel (pl. kanapé, asztal, szék).';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'Modern kanapékat keresek',
    'Olcsó étkezőasztalok?',
    'Skandináv stílusú bútorok',
    'Mit ajánlasz 150 ezer alatt?'
  ];

  return (
    <>
      {/* Lebegő Chat Gomb */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            fixed bottom-[calc(1.5rem+44px)] md:bottom-6 right-4 md:right-6 z-50
            w-14 h-14 md:w-16 md:h-16 rounded-full
            bg-gradient-to-br from-indigo-500 to-purple-600
            text-white shadow-2xl
            flex items-center justify-center
            transition-all duration-300
            hover:shadow-indigo-500/50 hover:scale-110
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
          w-[calc(100vw-1rem)] md:w-96 h-[calc(100vh-120px)] md:h-[550px] max-h-[80vh]
          bg-white rounded-2xl shadow-2xl
          flex flex-col overflow-hidden border border-gray-200
        ">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Asszisztens</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Gemini AI
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
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${message.role === 'user' 
                    ? 'bg-indigo-500' 
                    : message.isError 
                      ? 'bg-orange-500'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
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

                <div className={`
                  max-w-[80%] rounded-2xl p-3
                  ${message.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
                  }
                `}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('hu-HU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span className="text-sm text-gray-500">Gondolkodom...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Gyors kérdések */}
          {messages.length <= 1 && (
            <div className="p-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">💡 Próbáld ki:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(question);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    {question}
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
                placeholder="Írj üzenetet..."
                className="
                  flex-1 px-4 py-3 rounded-full
                  bg-gray-100 text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  text-sm
                "
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="
                  w-12 h-12 rounded-full
                  bg-gradient-to-br from-indigo-500 to-purple-600
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
