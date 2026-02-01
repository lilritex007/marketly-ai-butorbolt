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
      gradient: 'from-blue-500 to-primary-500',
      feature: 'Chat'
    },
    {
      title: 'Képkereső',
      description: 'Fotózd le a bútort, mi megtaláljuk a hasonlót.',
      icon: Camera,
      gradient: 'from-secondary-600 to-pink-600',
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
    <div className="relative bg-gradient-to-br from-secondary-700 via-primary-500 to-blue-600 text-white py-6 sm:py-8 lg:py-12 xl:py-14 mb-4 sm:mb-6 lg:mb-8 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-5 lg:right-5 w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        aria-label="Bezárás"
      >
        <X className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

      <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-16 relative z-10">
        <div className="text-center mb-6 sm:mb-10 lg:mb-14">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm lg:text-base font-bold mb-3 sm:mb-4 lg:mb-6">
            <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 mr-2 animate-pulse" />
            AI-Powered Shopping
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2 sm:mb-3 lg:mb-4">
            Találd meg az ideális bútort <br className="hidden md:block" />
            <span className="text-yellow-300">mesterséges intelligenciával</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-xl xl:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Használd az AI asszisztensünket, képkeresőnket és szobatervezőnket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
          {features.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 xl:p-8 hover:bg-white/20 transition-all transform hover:-translate-y-1 cursor-pointer group"
            >
              <GradientIcon 
                icon={item.icon} 
                gradient={item.gradient}
                size="lg"
                className="mb-3 sm:mb-4 lg:mb-5 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-1.5 sm:mb-2 lg:mb-3">{item.title}</h3>
              <p className="text-white/80 text-xs sm:text-sm lg:text-base xl:text-lg mb-3 sm:mb-4 lg:mb-5 leading-relaxed">{item.description}</p>
              <div className="flex items-center text-xs sm:text-sm lg:text-base font-bold text-yellow-300 group-hover:text-yellow-200 transition-colors">
                Próbáld ki <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-1 group-hover:translate-x-1 transition-transform" />
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
    <div className="fixed inset-0 lg:top-[60px] z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 max-w-md lg:max-w-lg xl:max-w-xl w-full shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-primary-100 rounded-xl lg:rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-primary-500 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">{content.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4 lg:mb-6 text-sm sm:text-base lg:text-lg xl:text-xl">{content.description}</p>
        <div className="bg-primary-50 border border-primary-100 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 mb-6 lg:mb-8 flex items-start gap-3 lg:gap-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-100 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 lg:w-5 lg:h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-xs lg:text-sm font-semibold text-primary-500 mb-1">Tipp</p>
            <p className="text-sm lg:text-base xl:text-lg text-primary-600">{content.tip}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-full bg-primary-500 text-white py-3 lg:py-4 xl:py-5 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg xl:text-xl hover:bg-primary-600 transition-colors min-h-[44px] lg:min-h-[52px] xl:min-h-[60px]"
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
