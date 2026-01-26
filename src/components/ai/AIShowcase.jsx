import React, { useState } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';

/**
 * AI Feature Showcase - highlights AI capabilities
 */
export const AIShowcase = () => {
  const [isDismissed, setIsDismissed] = useState(() => 
    localStorage.getItem('ai-showcase-dismissed') === 'true'
  );

  if (isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('ai-showcase-dismissed', 'true');
    setIsDismissed(true);
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white py-16 mb-12 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            AI-Powered Shopping
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Találd meg az ideális bútort <br className="hidden md:block" />
            <span className="text-yellow-300">mesterséges intelligenciával</span>
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Használd az AI asszisztensünket, képkeresőnket és szobatervezőnket a tökéletes bútor megtalálásához.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'AI Asszisztens',
              description: 'Beszélgess szakértőnkkel, kérdezz, tanácsot kérj.',
              icon: '💬',
              feature: 'Chat'
            },
            {
              title: 'Képkereső',
              description: 'Fotózd le a bútort, mi megtaláljuk a hasonlót.',
              icon: '📸',
              feature: 'Visual Search'
            },
            {
              title: 'Szobatervező',
              description: 'Tervezd meg a szobát virtuálisan, lásd élőben.',
              icon: '🏠',
              feature: 'Room Planner'
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-white/80 text-sm mb-4">{item.description}</p>
              <div className="flex items-center text-sm font-bold text-yellow-300">
                Próbáld ki <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}
      </style>
    </div>
  );
};

/**
 * AI Onboarding Tooltip
 */
export const AIOnboarding = ({ isOpen, onClose, targetFeature }) => {
  if (!isOpen) return null;

  const messages = {
    chat: {
      title: 'Próbáld ki az AI Asszisztenst!',
      description: 'Kérdezz bármit a termékekről, és azonnal választ kapsz.',
      tip: 'Például: "Keresek egy skandináv kanapét 200.000 Ft alatt"'
    },
    visualSearch: {
      title: 'AI Képkereső',
      description: 'Tölts fel egy képet, és megmutatjuk a hasonló termékeket.',
      tip: 'Fotózd le a bútort ami tetszik, mi megtaláljuk!'
    },
    roomPlanner: {
      title: 'Virtuális Szobatervező',
      description: 'Helyezd el a bútorokat a saját szobádban, és lásd élőben.',
      tip: 'Tölts fel egy fotót a szobádról, és kezdj el tervezni!'
    }
  };

  const content = messages[targetFeature] || messages.chat;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md m-4 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900">{content.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">{content.description}</p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6">
          <p className="text-sm text-indigo-700">💡 <strong>Tipp:</strong> {content.tip}</p>
        </div>
        <button 
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Értem, kezdjük!
        </button>
      </div>
      <style>
        {`
          @keyframes scale-in {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
};
