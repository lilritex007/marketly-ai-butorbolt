import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Camera, Move3d, MessageCircle, ArrowRight, Check, 
  Users, Star, Zap, Package, ChevronRight, Bot
} from 'lucide-react';

/**
 * Modern Hero Section with 3D effect and animations
 */
export const ModernHero = ({ onExplore, onTryAI }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-br from-primary-300 to-secondary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
          style={{
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`
          }}
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 138, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 138, 0, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* FULLSCREEN: Edge-to-edge, LARGE elements for enjoyable browsing */}
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-10 sm:py-14 lg:py-20 xl:py-24">
        <div className="text-center">
          {/* Floating Badge - VISIBLE and prominent */}
          <div className="inline-flex items-center px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-primary-100 mb-6 sm:mb-8 lg:mb-10 animate-float">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary-500 mr-2.5 animate-pulse" />
            <span className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-600 bg-clip-text text-transparent">
              AI-Powered Furniture Shopping
            </span>
            <span className="ml-2.5 px-3 py-1 sm:py-1.5 bg-green-100 text-green-700 text-xs sm:text-sm lg:text-base font-bold rounded-full">
              ÚJ
            </span>
          </div>

          {/* Main Heading - LARGE and impactful */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold mb-6 sm:mb-8 lg:mb-12 leading-[1.1]">
            <span className="block text-gray-900 mb-2">Találd meg az</span>
            <span className="block bg-gradient-to-r from-primary-500 via-secondary-700 to-pink-600 bg-clip-text text-transparent animate-gradient">
              ideális bútort
            </span>
            <span className="block text-gray-900 mt-2">AI segítséggel</span>
          </h1>

          {/* Subheading - READABLE */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-600 max-w-6xl mx-auto mb-10 sm:mb-12 lg:mb-16 leading-relaxed px-2">
            Forradalmi AI technológia találkozik a bútorvásárlással. 
            <span className="font-semibold text-primary-500"> Fotózz, tervezz, vásárolj</span> - minden egy helyen.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-12 sm:mb-14 lg:mb-16 px-3">
            <button
              onClick={onTryAI}
              className="group relative w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-gradient-to-r from-primary-500 to-secondary-700 text-white rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-xl hover:shadow-primary-500/50 transition-all transform hover:-translate-y-1 overflow-hidden flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                Próbáld ki az AI-t
                <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-white text-gray-900 rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-gray-200 hover:border-primary-300 flex items-center justify-center"
            >
              Kollekció megtekintése
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 ml-2" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 max-w-5xl mx-auto px-2">
            {[
              { icon: Package, value: '170K+', label: 'Termék' },
              { icon: Users, value: '50K+', label: 'Elégedett vásárló' },
              { icon: Star, value: '4.9/5', label: 'Értékelés' },
              { icon: Zap, value: '24/7', label: 'AI Support' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/60 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <stat.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary-500 mx-auto mb-2 lg:mb-3" />
                <div className="text-2xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm sm:text-sm lg:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-500 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-3 bg-primary-500 rounded-full animate-scroll" />
        </div>
      </div>
    </div>
  );
};

/**
 * AI Features - Ultra-compact, professional showcase
 * Smart hover effects and elegant design
 */
export const AIFeaturesShowcase = ({ onFeatureClick }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    {
      icon: Camera,
      title: 'Képfelismerés',
      shortDesc: 'Fotózz és keress',
      color: 'from-blue-500 to-primary-500',
      bgColor: 'bg-blue-50',
      stat: '99%',
      statLabel: 'pontosság'
    },
    {
      icon: MessageCircle,
      title: 'AI Chat',
      shortDesc: 'Személyes tanácsadó',
      color: 'from-secondary-600 to-secondary-700',
      bgColor: 'bg-secondary-50',
      stat: '24/7',
      statLabel: 'elérhető'
    },
    {
      icon: Move3d,
      title: 'Szobatervező',
      shortDesc: 'Virtuális elhelyezés',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      stat: 'AR',
      statLabel: 'támogatás'
    }
  ];

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div className="py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-500 to-secondary-700 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                AI a <span className="bg-gradient-to-r from-primary-500 to-secondary-700 bg-clip-text text-transparent">szolgálatodban</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Okos funkciók a tökéletes választáshoz</p>
            </div>
          </div>
          
          {/* Progress dots - desktop only */}
          <div className="hidden sm:flex items-center gap-1.5">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeFeature === idx ? 'w-6 bg-primary-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature Cards - Horizontal scroll on mobile, grid on desktop */}
        <div 
          className="flex gap-3 sm:grid sm:grid-cols-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {features.map((feature, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveFeature(idx);
                onFeatureClick?.(feature);
              }}
              className={`
                relative flex-shrink-0 w-[280px] sm:w-auto snap-center
                group p-4 sm:p-5 rounded-xl sm:rounded-2xl text-left
                transition-all duration-300 border-2
                ${activeFeature === idx 
                  ? `${feature.bgColor} border-transparent shadow-lg` 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                }
              `}
            >
              {/* Top Row: Icon + Title + Stat */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0
                    transition-all duration-300
                    ${activeFeature === idx 
                      ? `bg-gradient-to-br ${feature.color} shadow-md` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                    }
                  `}>
                    <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                      activeFeature === idx ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs text-gray-500">{feature.shortDesc}</p>
                  </div>
                </div>
                
                {/* Stat Badge */}
                <div className={`
                  text-right shrink-0 px-2 py-1 rounded-lg
                  ${activeFeature === idx ? 'bg-white/80' : 'bg-gray-50'}
                `}>
                  <div className="text-sm sm:text-base font-bold text-gray-900">{feature.stat}</div>
                  <div className="text-[10px] text-gray-500">{feature.statLabel}</div>
                </div>
              </div>

              {/* Bottom: CTA hint */}
              <div className={`
                flex items-center gap-1.5 text-xs font-medium transition-all
                ${activeFeature === idx ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
              `}>
                <span>Kipróbálom</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Active indicator line */}
              <div className={`
                absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all duration-300
                ${activeFeature === idx ? `bg-gradient-to-r ${feature.color}` : 'bg-transparent'}
              `} />
            </button>
          ))}
        </div>

        {/* Mobile progress dots */}
        <div className="flex sm:hidden justify-center gap-1.5 mt-3">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFeature(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeFeature === idx ? 'w-5 bg-primary-500' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default { ModernHero, AIFeaturesShowcase };
