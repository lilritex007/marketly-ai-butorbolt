import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA';

/**
 * AIChatAssistant - Floating AI Chat powered by Gemini
 * Natural language product search and recommendations
 */
const AIChatAssistant = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Szia! 👋 Segíthetek találni a tökéletes bútort. Mit keresel?',
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

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      // Prepare product context for Gemini
      const productContext = products.slice(0, 50).map(p => ({
        name: p.name,
        category: p.category,
        price: p.salePrice || p.price,
        description: p.shortDescription,
        id: p.id
      }));

      const prompt = `
Te egy segítőkész AI asszisztens vagy egy bútoráruházban. A felhasználó kérdése: "${userMessage}"

Elérhető termékek (minta):
${JSON.stringify(productContext.slice(0, 10), null, 2)}

Add meg a választ:
1. Értsd meg pontosan mit keres a felhasználó
2. Ajánlj konkrét termékeket (ha releváns)
3. Adj hasznos tanácsokat
4. Legyél barátságos és segítőkész
5. Magyar nyelven válaszolj

Ha konkrét termékeket ajánlasz, hivatkozz a nevükre.
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
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        }
      );

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'Elnézést, nem tudtam feldolgozni a kérésedet. Próbálj meg másképp megfogalmazni!';

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hoppá, valami hiba történt! 😅 Kérlek próbáld újra.',
        timestamp: new Date()
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

  const quickQuestions = [
    'Modern kanapékat keresek',
    'Van olcsó étkezőasztalotok?',
    'Skandináv stílusú bútorokat szeretnék',
    'Ajánlasz valamit egy 150k budget alatt?'
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="
              fixed bottom-6 right-6 z-50
              w-16 h-16 rounded-full
              bg-gradient-to-br from-indigo-500 to-purple-600
              text-white shadow-2xl
              flex items-center justify-center
              transition-all duration-300
              hover:shadow-indigo-500/50
            "
            aria-label="AI Chat megnyitása"
          >
            <MessageCircle className="w-7 h-7" />
            
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-0 animate-ping" />
            
            {/* Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="
              fixed bottom-6 right-6 z-50
              w-96 h-[600px] max-h-[80vh]
              bg-white rounded-2xl shadow-2xl
              flex flex-col
              overflow-hidden
              border border-gray-200
            "
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Asszisztens</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Bezárás"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.role === 'user' 
                      ? 'bg-indigo-500' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`
                    max-w-[75%] rounded-2xl p-3
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
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions (if no messages yet) */}
            {messages.length <= 1 && (
              <div className="p-3 bg-white border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Gyors kérdések:</p>
                <div className="space-y-1">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(question);
                        inputRef.current?.focus();
                      }}
                      className="
                        w-full text-left px-3 py-2 rounded-lg
                        text-xs text-gray-700
                        bg-gray-50 hover:bg-gray-100
                        transition-colors
                      "
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
                    flex-1 px-4 py-2 rounded-full
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
                    w-10 h-10 rounded-full
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;
