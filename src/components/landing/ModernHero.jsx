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

      {/* MOBILE-FIRST: Minimal padding, full-width feel */}
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12 lg:py-20 xl:py-28">
        <div className="text-center">
          {/* Floating Badge - compact on mobile */}
          <div className="inline-flex items-center px-3 sm:px-5 py-2 sm:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-indigo-100 mb-4 sm:mb-6 lg:mb-10 animate-float">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mr-2 animate-pulse" />
            <span className="text-xs sm:text-sm lg:text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Bútorbolt
            </span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold rounded-full">
              ÚJ
            </span>
          </div>

          {/* Main Heading - BIGGER on mobile too */}
          <h1 className="text-[2.5rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold mb-4 sm:mb-6 lg:mb-10">
            <span className="block text-gray-900 mb-1">Találd meg az</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              ideális bútort
            </span>
            <span className="block text-gray-900 mt-1">AI segítséggel</span>
          </h1>

          {/* Subheading - readable on mobile */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-600 max-w-5xl mx-auto mb-6 sm:mb-10 lg:mb-16 leading-relaxed px-1">
            Forradalmi AI technológia találkozik a bútorvásárlással. 
            <span className="font-semibold text-indigo-600"> Fotózz, tervezz, vásárolj</span> - minden egy helyen.
          </p>

          {/* CTA Buttons - FULL WIDTH on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-stretch sm:items-center mb-8 sm:mb-12 lg:mb-20 px-1">
            <button
              onClick={onTryAI}
              className="group relative w-full sm:w-auto px-6 py-4 min-h-[56px] sm:px-8 sm:py-5 lg:px-12 lg:py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-2xl shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-1 hover:scale-105 overflow-hidden flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2.5" />
                Próbáld ki az AI-t
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ml-2.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-6 py-4 min-h-[56px] sm:px-8 sm:py-5 lg:px-12 lg:py-6 bg-white text-gray-900 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-gray-200 hover:border-indigo-300 flex items-center justify-center"
            >
              Kollekció
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ml-2" />
            </button>
          </div>

          {/* Stats - COMPACT on mobile, 2x2 grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 max-w-6xl mx-auto px-1">
            {[
              { icon: Package, value: '170K+', label: 'Termék' },
              { icon: Users, value: '50K+', label: 'Vásárló' },
              { icon: Star, value: '4.9/5', label: 'Értékelés' },
              { icon: Zap, value: '24/7', label: 'Support' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-5 lg:p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-indigo-600 mx-auto mb-1 sm:mb-2 lg:mb-3" />
                <div className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-gray-900 mb-0.5">{stat.value}</div>
                <div className="text-xs sm:text-sm lg:text-lg text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator - hidden on small mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
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
    <div className="py-16 sm:py-20 lg:py-28 xl:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-5 py-2.5 bg-indigo-100 rounded-full mb-5">
            <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-base lg:text-lg font-bold text-indigo-600">AI Powered Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-5">
            Mesterséges intelligencia a <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">szolgálatodban</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
            Használd ki a legmodernebb AI technológiát a tökéletes bútor megtalálásához
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveFeature(idx);
                onFeatureClick?.(feature);
              }}
              className={`relative group cursor-pointer transition-all duration-500 ${
                activeFeature === idx ? 'scale-105' : 'scale-100 opacity-75 hover:opacity-100'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
              
              <div className="relative bg-white rounded-3xl p-7 sm:p-8 lg:p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                {/* Icon */}
                <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 lg:mb-8 transform group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">{feature.title}</h3>

                {/* Description */}
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 leading-relaxed">{feature.description}</p>

                {/* Demo Flow */}
                <div className="bg-gray-50 rounded-xl p-4 lg:p-5 mb-5 lg:mb-6">
                  <DemoFlow steps={feature.demoSteps} />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-base lg:text-lg font-bold text-indigo-600">{feature.stats}</span>
                  <ArrowRight className={`w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all`} />
                </div>

                {/* Active Indicator */}
                {activeFeature === idx && (
                  <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-green-500 rounded-full border-4 border-white animate-pulse flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFeature(idx)}
              className={`h-2 rounded-full transition-all ${
                activeFeature === idx ? 'w-12 bg-indigo-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default { ModernHero, AIFeaturesShowcase };
