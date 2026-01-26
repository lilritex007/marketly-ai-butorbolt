import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Camera, Move, MessageCircle, ArrowRight, Check, 
  TrendingUp, Users, ShoppingBag, Star, Zap, Eye, Heart,
  Package, Shield, Clock, Award, ChevronRight, Play
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-indigo-100 mb-8 animate-float">
            <Sparkles className="w-5 h-5 text-indigo-600 mr-2 animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Furniture Shopping
            </span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              ÚJ
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight">
            <span className="block text-gray-900 mb-2">Találd meg az</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              ideális bútort
            </span>
            <span className="block text-gray-900 mt-2">AI segítséggel</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Forradalmi AI technológia találkozik a bútorvásárlással. 
            <span className="font-semibold text-indigo-600"> Fotózz, tervezz, vásárolj</span> - minden egy helyen.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onTryAI}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Próbáld ki az AI-t
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={onExplore}
              className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-gray-200 hover:border-indigo-300 flex items-center"
            >
              Kollekció megtekintése
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Package, value: '170K+', label: 'Termék' },
              { icon: Users, value: '50K+', label: 'Elégedett vásárló' },
              { icon: Star, value: '4.9/5', label: 'Értékelés' },
              { icon: Zap, value: '24/7', label: 'AI Support' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <stat.icon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
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
      demo: '📸 → 🤖 → ✨',
      stats: '99% pontosság'
    },
    {
      icon: MessageCircle,
      title: 'Intelligens Asszisztens',
      description: 'Beszélgess szakértőnkkel és kérj személyre szabott ajánlatokat',
      color: 'from-purple-500 to-pink-600',
      demo: '💬 → 🎯 → 🎁',
      stats: '24/7 elérhető'
    },
    {
      icon: Move,
      title: 'Virtuális Tervező',
      description: 'Helyezd el a bútorokat otthonodban virtuálisan, látogatás élőben',
      color: 'from-green-500 to-emerald-600',
      demo: '🏠 → 🪄 → 👀',
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
    <div className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
            <span className="text-sm font-bold text-indigo-600">AI Powered Features</span>
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Mesterséges intelligencia a <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">szolgálatodban</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Használd ki a legmodernebb AI technológiát a tökéletes bútor megtalálásához
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
              
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>

                {/* Demo Flow */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-center text-2xl font-mono">{feature.demo}</div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-600">{feature.stats}</span>
                  <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all`} />
                </div>

                {/* Active Indicator */}
                {activeFeature === idx && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
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
