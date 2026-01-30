import React, { useState, useEffect } from 'react';
import { 
  Shield, Truck, Award, Clock, Heart, Star, 
  ArrowRight, Check, TrendingUp, Zap, Users,
  ShoppingBag, Package, Eye, Sparkles
} from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../../utils/helpers';

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
    <div className="py-16 sm:py-20 lg:py-28 xl:py-32 bg-white">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Happy Customers Counter - UNIFIED */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24">
          <div className="inline-flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6 px-4 py-2 lg:px-5 lg:py-2.5 bg-indigo-50 rounded-full">
            <Users className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-600" />
            <span className="text-sm lg:text-base xl:text-lg font-bold text-indigo-600 uppercase tracking-wide">
              Elégedett Vásárlóink
            </span>
          </div>
          <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 lg:mb-6">
            {count.toLocaleString('hu-HU')}+
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600">
            csatlakozott már a Marketly közösséghez
          </p>
        </div>

        {/* Trust Badges - UNIFIED */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {trustBadges.map((badge, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-8 xl:p-10 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-gradient-to-br ${colorClasses[badge.color]} rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 xl:mb-6 transform group-hover:rotate-6 transition-transform`}>
                <badge.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl xl:text-2xl">{badge.label}</h3>
            </div>
          ))}
        </div>

        {/* Star Rating - UNIFIED */}
        <div className="mt-12 sm:mt-16 lg:mt-20 xl:mt-24 text-center">
          <div className="flex justify-center items-center gap-1.5 sm:gap-2 lg:gap-3 mb-4 lg:mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
            4.9 / 5.0 átlagos értékelés
          </p>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600">
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
    <div className="py-16 sm:py-20 lg:py-28 xl:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-4 py-2 lg:px-5 lg:py-2.5 xl:px-6 xl:py-3 bg-green-100 rounded-full mb-4 lg:mb-6">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-green-600 mr-2 lg:mr-3" />
            <span className="text-sm lg:text-base xl:text-lg font-bold text-green-600">Most népszerű</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-gray-900 mb-4">
            Vásárlóink <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">kedvencei</span>
          </h2>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Carousel Container */}
          <div className="flex gap-4 sm:gap-6 lg:gap-8 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / showcaseProducts.length)}%)` }}
          >
            {showcaseProducts.map((product, idx) => (
              <div
                key={product.id}
                onClick={() => onProductClick?.(product)}
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 cursor-pointer group"
              >
                <div className="relative bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                  {/* Tag */}
                  <div className="absolute top-3 sm:top-4 lg:top-5 left-3 sm:left-4 lg:left-5 z-10">
                    <span className="px-3 py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs lg:text-sm xl:text-base font-bold rounded-full">
                      {product.tag || 'Népszerű'}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative h-64 sm:h-72 lg:h-80 xl:h-96 overflow-hidden bg-gray-100">
                    <img
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {e.target.src = PLACEHOLDER_IMAGE}}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 lg:bottom-6 left-4 lg:left-6 right-4 lg:right-6 flex items-center justify-between">
                        <span className="text-white font-bold text-sm lg:text-base xl:text-lg flex items-center gap-2 lg:gap-3">
                          <Eye className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                          Részletek
                        </span>
                        <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 lg:p-6 xl:p-8">
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2 lg:mb-3 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-indigo-600">
                        {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.price)}
                      </span>
                      <button className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-indigo-600 text-white rounded-full lg:rounded-2xl flex items-center justify-center hover:bg-indigo-700 transform group-hover:rotate-90 transition-all">
                        <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 lg:gap-3 mt-8 lg:mt-10 xl:mt-12">
            {showcaseProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 lg:h-3 rounded-full transition-all ${
                  currentIndex === idx ? 'w-10 lg:w-14 xl:w-16 bg-indigo-600' : 'w-2 lg:w-3 bg-gray-300 hover:bg-gray-400'
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
    <div className="py-16 sm:py-20 lg:py-28 xl:py-36 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 sm:w-96 lg:w-[500px] h-72 sm:h-96 lg:h-[500px] bg-white rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-72 sm:w-96 lg:w-[500px] h-72 sm:h-96 lg:h-[500px] bg-yellow-300 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-72 sm:w-96 lg:w-[500px] h-72 sm:h-96 lg:h-[500px] bg-pink-300 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 text-center">
        <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 bg-white/20 backdrop-blur-sm rounded-full mb-6 lg:mb-8">
          <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-white mr-2 lg:mr-3 animate-pulse" />
          <span className="text-sm lg:text-base xl:text-lg font-bold text-white">Kezdd el ma!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-white mb-5 lg:mb-8 leading-tight">
          Készen állsz a <br />
          <span className="text-yellow-300">tökéletes bútor</span> megtalálására?
        </h2>

        <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white/90 mb-10 lg:mb-14 xl:mb-16 max-w-4xl mx-auto leading-relaxed">
          Csatlakozz 50.000+ elégedett vásárlónkhoz és fedezd fel, hogyan könnyítheti meg az AI a bútorvásárlást
        </p>

        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center">
          <button
            onClick={onGetStarted}
            className="group px-6 py-3.5 sm:px-8 sm:py-4 lg:px-10 lg:py-5 xl:px-12 xl:py-6 bg-white text-indigo-600 rounded-xl lg:rounded-2xl font-bold text-base sm:text-lg lg:text-xl xl:text-2xl shadow-2xl hover:shadow-white/50 transition-all transform hover:-translate-y-1 flex items-center"
          >
            Kezdjük el most
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 ml-2 lg:ml-3 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-6 py-3.5 sm:px-8 sm:py-4 lg:px-10 lg:py-5 xl:px-12 xl:py-6 bg-white/10 backdrop-blur-sm text-white rounded-xl lg:rounded-2xl font-bold text-base sm:text-lg lg:text-xl xl:text-2xl border-2 border-white/30 hover:bg-white/20 transition-all">
            Tudj meg többet
          </button>
        </div>

        {/* Trust indicators - UNIFIED */}
        <div className="mt-10 lg:mt-14 xl:mt-16 flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10 xl:gap-12 text-white/80">
          <div className="flex items-center gap-2 lg:gap-3">
            <Check className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
            <span className="text-sm lg:text-base xl:text-lg font-medium">Ingyenes kipróbálás</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Check className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
            <span className="text-sm lg:text-base xl:text-lg font-medium">Nincs kártyaigény</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Check className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
            <span className="text-sm lg:text-base xl:text-lg font-medium">24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { SocialProof, LiveShowcase, InteractiveCTA };
