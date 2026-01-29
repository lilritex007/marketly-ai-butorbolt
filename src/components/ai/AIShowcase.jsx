import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, MessageCircle, Camera, Home, Lightbulb } from 'lucide-react';
import { GradientIcon } from '../ui/Icons';

/**
 * AI Feature Showcase - highlights AI capabilities with modern icons
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

  const features = [
    {
      title: 'AI Asszisztens',
      description: 'Beszélgess szakértőnkkel, kérdezz, tanácsot kérj.',
      icon: MessageCircle,
      gradient: 'from-blue-500 to-indigo-600',
      feature: 'Chat'
    },
    {
      title: 'Képkereső',
      description: 'Fotózd le a bútort, mi megtaláljuk a hasonlót.',
      icon: Camera,
      gradient: 'from-purple-500 to-pink-600',
      feature: 'Visual Search'
    },
    {
      title: 'Szobatervező',
      description: 'Tervezd meg a szobát virtuálisan, lásd élőben.',
      icon: Home,
      gradient: 'from-emerald-500 to-teal-600',
      feature: 'Room Planner'
    }
  ];

  return (
    <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white py-12 sm:py-16 mb-8 sm:mb-12 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        aria-label="Bezárás"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            AI-Powered Shopping
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">
            Találd meg az ideális bútort <br className="hidden md:block" />
            <span className="text-yellow-300">mesterséges intelligenciával</span>
          </h2>
          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto">
            Használd az AI asszisztensünket, képkeresőnket és szobatervezőnket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 hover:bg-white/20 transition-all transform hover:-translate-y-1 cursor-pointer group"
            >
              <GradientIcon 
                icon={item.icon} 
                gradient={item.gradient}
                size="lg"
                className="mb-4 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-white/80 text-sm sm:text-base mb-4">{item.description}</p>
              <div className="flex items-center text-sm font-bold text-yellow-300 group-hover:text-yellow-200 transition-colors">
                Próbáld ki <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
      tip: 'Például: "Keresek egy skandináv kanapét 200.000 Ft alatt"',
      icon: MessageCircle
    },
    visualSearch: {
      title: 'AI Képkereső',
      description: 'Tölts fel egy képet, és megmutatjuk a hasonló termékeket.',
      tip: 'Fotózd le a bútort ami tetszik, mi megtaláljuk!',
      icon: Camera
    },
    roomPlanner: {
      title: 'Virtuális Szobatervező',
      description: 'Helyezd el a bútorokat a saját szobádban, és lásd élőben.',
      tip: 'Tölts fel egy fotót a szobádról, és kezdj el tervezni!',
      icon: Home
    }
  };

  const content = messages[targetFeature] || messages.chat;
  const TipIcon = content.icon || Lightbulb;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{content.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">{content.description}</p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 sm:p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-600 mb-1">Tipp</p>
            <p className="text-sm text-indigo-700">{content.tip}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors min-h-[44px]"
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
