import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Camera, Move3d, MessageCircle, ArrowRight, Check, 
  TrendingUp, Users, ShoppingBag, Star, Zap, Eye, Heart,
  Package, Shield, Clock, Award, ChevronRight, Play, Target, Gift, Bot
} from 'lucide-react';
import { DemoFlow } from '../ui/Icons';

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
          style={{
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`
          }}
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* FULLSCREEN: Edge-to-edge, LARGE elements for enjoyable browsing */}
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-10 sm:py-14 lg:py-20 xl:py-24">
        <div className="text-center">
          {/* Floating Badge - VISIBLE and prominent */}
          <div className="inline-flex items-center px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-indigo-100 mb-6 sm:mb-8 lg:mb-10 animate-float">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-indigo-600 mr-2.5 animate-pulse" />
            <span className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Furniture Shopping
            </span>
            <span className="ml-2.5 px-3 py-1 sm:py-1.5 bg-green-100 text-green-700 text-xs sm:text-sm lg:text-base font-bold rounded-full">
              ÚJ
            </span>
          </div>

          {/* Main Heading - LARGE and impactful */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold mb-6 sm:mb-8 lg:mb-12 leading-[1.1]">
            <span className="block text-gray-900 mb-2">Találd meg az</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              ideális bútort
            </span>
            <span className="block text-gray-900 mt-2">AI segítséggel</span>
          </h1>

          {/* Subheading - READABLE */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-600 max-w-6xl mx-auto mb-10 sm:mb-12 lg:mb-16 leading-relaxed px-2">
            Forradalmi AI technológia találkozik a bútorvásárlással. 
            <span className="font-semibold text-indigo-600"> Fotózz, tervezz, vásárolj</span> - minden egy helyen.
          </p>

          {/* CTA Buttons - COMPACT and readable */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-10 sm:mb-12 lg:mb-16 px-3">
            <button
              onClick={onTryAI}
              className="group relative w-full sm:w-auto px-5 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-1 overflow-hidden flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                Próbáld ki az AI-t
                <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-5 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 bg-white text-gray-900 rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-gray-200 hover:border-indigo-300 flex items-center justify-center"
            >
              Kollekció megtekintése
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 ml-2" />
            </button>
          </div>

          {/* Stats - COMPACT on all screens */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 max-w-5xl mx-auto px-2">
            {[
              { icon: Package, value: '170K+', label: 'Termék' },
              { icon: Users, value: '50K+', label: 'Elégedett vásárló' },
              { icon: Star, value: '4.9/5', label: 'Értékelés' },
              { icon: Zap, value: '24/7', label: 'AI Support' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/60 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-600 mx-auto mb-2 lg:mb-3" />
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-0.5">{stat.value}</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-indigo-600 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-3 bg-indigo-600 rounded-full animate-scroll" />
        </div>
      </div>
    </div>
  );
};

/**
 * AI Features Interactive Showcase
 */
export const AIFeaturesShowcase = ({ onFeatureClick }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Camera,
      title: 'AI Képfelismerés',
      description: 'Fotózd le a bútort és azonnal találd meg a hasonló termékeket',
      color: 'from-blue-500 to-indigo-600',
      demoSteps: [
        { icon: Camera, color: 'text-blue-600', bg: 'bg-blue-100' },
        { icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' }
      ],
      stats: '99% pontosság'
    },
    {
      icon: MessageCircle,
      title: 'Intelligens Asszisztens',
      description: 'Beszélgess szakértőnkkel és kérj személyre szabott ajánlatokat',
      color: 'from-purple-500 to-pink-600',
      demoSteps: [
        { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
        { icon: Target, color: 'text-pink-600', bg: 'bg-pink-100' },
        { icon: Gift, color: 'text-rose-600', bg: 'bg-rose-100' }
      ],
      stats: '24/7 elérhető'
    },
    {
      icon: Move3d,
      title: 'Virtuális Tervező',
      description: 'Helyezd el a bútorokat otthonodban virtuálisan, látogatás élőben',
      color: 'from-green-500 to-emerald-600',
      demoSteps: [
        { icon: Camera, color: 'text-green-600', bg: 'bg-green-100' },
        { icon: Move3d, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { icon: Eye, color: 'text-teal-600', bg: 'bg-teal-100' }
      ],
      stats: 'AR támogatás'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8 sm:py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-100 rounded-full mb-4 lg:mb-5">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mr-2" />
            <span className="text-sm sm:text-base font-bold text-indigo-600">AI Powered Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 lg:mb-4">
            Mesterséges intelligencia a <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">szolgálatodban</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Használd ki a legmodernebb AI technológiát a tökéletes bútor megtalálásához
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveFeature(idx);
                onFeatureClick?.(feature);
              }}
              className={`relative group cursor-pointer transition-all duration-500 ${
                activeFeature === idx ? 'scale-[1.02]' : 'scale-100 opacity-75 hover:opacity-100'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
              
              <div className="relative bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${feature.color} rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>

                {/* Description */}
                <p className="text-sm sm:text-sm lg:text-base text-gray-600 mb-4 leading-relaxed">{feature.description}</p>

                {/* Demo Flow */}
                <div className="bg-gray-50 rounded-lg lg:rounded-xl p-3 sm:p-4 mb-4">
                  <DemoFlow steps={feature.demoSteps} />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-indigo-600">{feature.stats}</span>
                  <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all`} />
                </div>

                {/* Active Indicator */}
                {activeFeature === idx && (
                  <div className="absolute -top-1.5 -right-1.5">
                    <div className="w-6 h-6 lg:w-7 lg:h-7 bg-green-500 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
                      <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-8 lg:mt-10">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFeature(idx)}
              className={`h-2 rounded-full transition-all ${
                activeFeature === idx ? 'w-8 sm:w-10 bg-indigo-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default { ModernHero, AIFeaturesShowcase };
