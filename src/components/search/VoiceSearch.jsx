import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VoiceSearch - AI-powered voice search using Web Speech API
 * Real-time voice recognition for product search
 */
const VoiceSearch = ({ onSearchQuery, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('A böngésző nem támogatja a hangfelismerést.');
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'hu-HU';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        handleFinalTranscript(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError('Nem hallottam semmit. Próbáld újra!');
      } else if (event.error === 'not-allowed') {
        setError('Mikrofon hozzáférés megtagadva.');
      } else {
        setError(`Hiba: ${event.error}`);
      }
      setTimeout(() => setError(null), 3000);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleFinalTranscript = async (text) => {
    setIsProcessing(true);
    
    // Haptic feedback
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }

    try {
      // Process the voice query
      const cleanedQuery = text.trim().toLowerCase();
      
      // Trigger search with the transcript
      if (onSearchQuery) {
        await onSearchQuery(cleanedQuery);
      }

      // Clear transcript after a delay
      setTimeout(() => {
        setTranscript('');
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      setError('Nem sikerült feldolgozni a keresést.');
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Voice Button */}
      <motion.button
        onClick={toggleListening}
        disabled={isProcessing || !!error}
        className={`
          relative overflow-hidden
          p-3 rounded-full
          transition-all duration-300
          ${isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}

        {/* Pulse animation when listening */}
        {isListening && (
          <motion.div
            className="absolute inset-0 bg-red-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.button>

      {/* Transcript Popup */}
      <AnimatePresence>
        {(transcript || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full right-0 mt-2 z-50 min-w-[250px]"
          >
            <div className={`
              rounded-xl shadow-2xl p-4 border-2
              ${error 
                ? 'bg-red-50 border-red-200' 
                : 'bg-white border-indigo-200'
              }
            `}>
              {error ? (
                <div className="flex items-start gap-2 text-red-700">
                  <Volume2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Volume2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Hallgatom...</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    "{transcript}"
                  </p>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Keresés...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper tooltip */}
      {!isListening && !transcript && !error && (
        <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Kattints és mondj valamit 🎤
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
