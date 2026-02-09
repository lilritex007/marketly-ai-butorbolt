import React, { useState, useEffect } from 'react';
import { 
  Shield, Truck, Award, Clock, Heart, Star, 
  ArrowRight, Check, TrendingUp, Zap, Users,
  ShoppingBag, Package, Sparkles, RefreshCw
} from 'lucide-react';
import SectionHeader from './SectionHeader';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { getStockLevel } from '../../utils/helpers';
import { trackSectionEvent } from '../../services/userPreferencesService';

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
    <div className="py-8 sm:py-10 lg:py-14 xl:py-16 bg-white border-t border-gray-100">
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
const SECTION_ID = 'customer-favorites';

export const LiveShowcase = ({ products = [], onProductClick }) => {
  const [seed, setSeed] = useState(0);

  // Randomize and select products on each render
  const showcaseProducts = React.useMemo(() => {
    if (products.length > 0) {
      const inStock = products.filter((p) => (p.inStock ?? p.in_stock ?? true));
      const shuffled = [...inStock].sort(() => (seed % 2 === 0 ? 1 : -1) * (Math.random() - 0.5));
      return shuffled.slice(0, 12);
    }
    return [];
  }, [products, seed]);

  useEffect(() => {
    trackSectionEvent(SECTION_ID, 'section_impression');
  }, []);

  return (
    <div
      className="section-shell section-shell--favorites py-8 sm:py-10 lg:py-14 xl:py-16 overflow-hidden"
      role="region"
      aria-label="Vásárlóink kedvencei"
      data-section={SECTION_ID}
    >
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <SectionHeader
          id="customer-favorites-heading"
          title="Vásárlóink kedvencei"
          subtitle="A legjobbra értékelt és legtöbbet választott bútorok"
          Icon={Heart}
          accentClass="from-pink-500 to-rose-600"
          eyebrow="Közösségi kedvencek"
          badge="Közönségkedvenc"
          meta={`Összesen: ${showcaseProducts.length.toLocaleString('hu-HU')} termék`}
          helpText="Csak készleten lévő termékek"
          actions={
            <button
              type="button"
              onClick={() => setSeed((v) => v + 1)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors text-sm font-semibold min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              Frissítem
            </button>
          }
        />
        {showcaseProducts.length > 0 ? (
          <div className="product-grid">
            {showcaseProducts.map((product, index) => {
              const stockLevel = getStockLevel(product);
              const highlightBadge = stockLevel !== null && stockLevel <= 3 ? `Utolsó ${stockLevel} db` : '';
              return (
                <EnhancedProductCard
                  key={product.id || index}
                  product={product}
                  onQuickView={onProductClick}
                  index={index}
                  highlightBadge={highlightBadge}
                  sectionId={SECTION_ID}
                  showFeedback
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-inner">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nincs elég adat a kedvencekhez</p>
            <p className="text-gray-400 text-sm">Térj vissza később!</p>
          </div>
        )}
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
