import React, { useState, useEffect } from 'react';
import { 
  Shield, Truck, Award, Clock, Heart, Star, 
  ArrowRight, Check, TrendingUp, Zap, Users,
  ShoppingBag, Package, Eye, Sparkles
} from 'lucide-react';

/**
 * Social Proof & Trust Signals
 */
export const SocialProof = () => {
  const [count, setCount] = useState(0);
  const targetCount = 50247;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const trustBadges = [
    { icon: Shield, label: 'Biztonságos fizetés', color: 'blue' },
    { icon: Truck, label: 'Ingyenes szállítás', color: 'green' },
    { icon: Award, label: '2 év garancia', color: 'purple' },
    { icon: Clock, label: '24h ügyfélszolgálat', color: 'orange' }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Happy Customers Counter */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              Elégedett Vásárlóink
            </span>
          </div>
          <div className="text-6xl sm:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {count.toLocaleString('hu-HU')}+
          </div>
          <p className="text-xl text-gray-600">
            csatlakozott már a Marketly közösséghez
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[badge.color]} rounded-xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform`}>
                <badge.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{badge.label}</h3>
            </div>
          ))}
        </div>

        {/* Star Rating */}
        <div className="mt-16 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            4.9 / 5.0 átlagos értékelés
          </p>
          <p className="text-gray-600">
            12,487 valós véleményből
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Live Product Showcase with Auto-Carousel
 */
export const LiveShowcase = ({ products = [], onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Sample products if none provided
  const showcaseProducts = products.length > 0 ? products.slice(0, 6) : [
    { id: 1, name: 'Skandináv Kanapé', price: 189900, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', tag: 'Bestseller' },
    { id: 2, name: 'Modern Fotel', price: 125000, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800', tag: 'ÚJ' },
    { id: 3, name: 'Tölgy Asztal', price: 95000, image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800', tag: 'Akció' }
  ];

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovered, showcaseProducts.length]);

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-bold text-green-600">Most népszerű</span>
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Vásárlóink <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">kedvencei</span>
          </h2>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Carousel Container */}
          <div className="flex gap-6 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / showcaseProducts.length)}%)` }}
          >
            {showcaseProducts.map((product, idx) => (
              <div
                key={product.id}
                onClick={() => onProductClick?.(product)}
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 cursor-pointer group"
              >
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                  {/* Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full">
                      {product.tag || 'Népszerű'}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative h-80 overflow-hidden bg-gray-100">
                    <img
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/400x400?text=Termék'}}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="text-white font-bold flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Részletek
                        </span>
                        <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-indigo-600">
                        {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.price)}
                      </span>
                      <button className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transform group-hover:rotate-90 transition-all">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {showcaseProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-12 bg-indigo-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive CTA Section
 */
export const InteractiveCTA = ({ onGetStarted }) => {
  return (
    <div className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-white mr-2 animate-pulse" />
          <span className="text-sm font-bold text-white">Kezdd el ma!</span>
        </div>

        <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
          Készen állsz a <br />
          <span className="text-yellow-300">tökéletes bútor</span> megtalálására?
        </h2>

        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Csatlakozz 50.000+ elégedett vásárlónkhoz és fedezd fel, hogyan könnyítheti meg az AI a bútorvásárlást
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onGetStarted}
            className="group px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center"
          >
            Kezdjük el most
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all">
            Tudj meg többet
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Ingyenes kipróbálás</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Nincs kártyaigény</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { SocialProof, LiveShowcase, InteractiveCTA };
