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
    purple: 'from-secondary-500 to-secondary-700',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="py-8 sm:py-10 lg:py-14 xl:py-16 bg-white">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Happy Customers Counter */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16 xl:mb-20">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-5 lg:mb-6 px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-primary-50 rounded-full">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary-500" />
            <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-primary-500 uppercase tracking-wide">
              Elégedett Vásárlóink
            </span>
          </div>
          <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-700 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-5">
            {count.toLocaleString('hu-HU')}+
          </div>
          <p className="text-base sm:text-lg lg:text-2xl xl:text-3xl text-gray-600">
            csatlakozott már a Marketly közösséghez
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {trustBadges.map((badge, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${colorClasses[badge.color]} rounded-xl flex items-center justify-center mb-3 sm:mb-4 transform group-hover:rotate-6 transition-transform`}>
                <badge.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg leading-tight">{badge.label}</h3>
            </div>
          ))}
        </div>

        {/* Star Rating */}
        <div className="mt-10 sm:mt-12 lg:mt-16 xl:mt-20 text-center">
          <div className="flex justify-center items-center gap-1.5 sm:gap-2 lg:gap-2.5 mb-3 sm:mb-4 lg:mb-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
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
 * Live Product Showcase with Swipeable Carousel
 * - Random products on each load
 * - Touch swipe support for mobile
 * - Arrow navigation for desktop
 * - Compact mobile cards
 */
export const LiveShowcase = ({ products = [], onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = React.useRef(null);

  // Randomize and select products on each render
  const showcaseProducts = React.useMemo(() => {
    const tags = ['Bestseller', 'ÚJ', 'Akció', 'Népszerű', 'Top 10', 'Limitált'];
    if (products.length > 0) {
      // Shuffle and pick 6 random products
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 6).map((p, i) => ({
        ...p,
        tag: tags[i % tags.length],
        image: p.images?.[0] || p.image
      }));
    }
    return [
      { id: 1, name: 'Skandináv Kanapé', price: 189900, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', tag: 'Bestseller' },
      { id: 2, name: 'Modern Fotel', price: 125000, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800', tag: 'ÚJ' },
      { id: 3, name: 'Tölgy Asztal', price: 95000, image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800', tag: 'Akció' }
    ];
  }, [products]);

  // Auto-rotate
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isHovered, showcaseProducts.length]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);
    }
  };

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % showcaseProducts.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);

  return (
    <div className="py-8 sm:py-10 lg:py-14 xl:py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <div className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-green-100 rounded-full mb-4 sm:mb-5 lg:mb-6">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600 mr-2" />
            <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-green-600">Most népszerű</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900">
            Vásárlóink <span className="bg-gradient-to-r from-primary-500 to-secondary-700 bg-clip-text text-transparent">kedvencei</span>
          </h2>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Arrows - Desktop */}
          <button 
            onClick={goPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4 z-20 w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-white shadow-lg rounded-full items-center justify-center text-gray-600 hover:text-primary-500 hover:shadow-xl transition-all"
          >
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 rotate-180" />
          </button>
          <button 
            onClick={goNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 z-20 w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-white shadow-lg rounded-full items-center justify-center text-gray-600 hover:text-primary-500 hover:shadow-xl transition-all"
          >
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          {/* Carousel Container - Swipeable */}
          <div 
            ref={carouselRef}
            className="overflow-hidden px-1"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div 
              className="flex gap-3 sm:gap-4 lg:gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
                {showcaseProducts.map((product, idx) => (
                <div
                  key={product.id || idx}
                  onClick={() => onProductClick?.(product)}
                  className="flex-shrink-0 w-[80%] sm:w-[45%] lg:w-[32%] cursor-pointer group"
                >
                  <div className="relative bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    {/* Tag */}
                    <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10">
                      <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-bold rounded-full">
                        {product.tag || 'Népszerű'}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden bg-gray-100">
                      <img
                        src={product.image || product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {e.target.src = PLACEHOLDER_IMAGE}}
                        loading="lazy"
                      />
                    </div>

                    {/* Content - UNIFIED TYPOGRAPHY */}
                    <div className="p-4 sm:p-5 lg:p-6">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-primary-500 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl lg:text-2xl font-extrabold text-primary-500">
                          {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.price)}
                        </span>
                        <button className="w-11 h-11 sm:w-12 sm:h-12 lg:w-12 lg:h-12 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-all">
                          <Eye className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-4 sm:mt-6 lg:mt-8">
            {showcaseProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 sm:w-8 lg:w-10 bg-primary-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
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
    <div className="py-10 sm:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-primary-500 via-secondary-700 to-pink-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-white rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-yellow-300 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-pink-300 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 text-center">
        <div className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-white/20 backdrop-blur-sm rounded-full mb-5 sm:mb-6 lg:mb-8">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white mr-2 animate-pulse" />
          <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-white">Kezdd el ma!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-5 sm:mb-6 lg:mb-8 leading-tight">
          Készen állsz a <br />
          <span className="text-yellow-300">tökéletes bútor</span> megtalálására?
        </h2>

        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto leading-relaxed">
          Csatlakozz 50.000+ elégedett vásárlónkhoz és fedezd fel, hogyan könnyítheti meg az AI a bútorvásárlást
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={onGetStarted}
            className="group w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 bg-white text-primary-500 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-white/50 transition-all transform hover:-translate-y-1 flex items-center justify-center"
          >
            Kezdjük el most
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => {
              const aiSection = document.querySelector('[data-ai-features]');
              if (aiSection) aiSection.scrollIntoView({ behavior: 'smooth' });
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-base sm:text-lg border-2 border-white/30 hover:bg-white/20 transition-all"
          >
            Tudj meg többet
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-wrap justify-center gap-5 sm:gap-6 lg:gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">Ingyenes kipróbálás</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">Nincs kártyaigény</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { SocialProof, LiveShowcase, InteractiveCTA };
