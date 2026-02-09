import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Truck, Award, Clock, Heart, Star, 
  ArrowRight, Check, TrendingUp, Zap, Users,
  ShoppingBag, Package, Sparkles, RefreshCw
} from 'lucide-react';
import SectionHeader from './SectionHeader';
import { EnhancedProductCard } from '../product/EnhancedProductCard';
import { getStockLevel } from '../../utils/helpers';
import { trackSectionEvent } from '../../services/userPreferencesService';
import ProductCarousel from '../ui/ProductCarousel';

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
    <section className="py-20 bg-gray-50 border-t border-gray-100" aria-labelledby="social-proof-heading">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-full shadow-sm">
            <Users className="w-5 h-5 text-primary-500" aria-hidden />
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Bizalom</span>
          </div>
          <div className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-secondary-600 bg-clip-text text-transparent mb-3">
            {count.toLocaleString('hu-HU')}+
          </div>
          <p className="text-lg text-gray-500">
            elégedett vásárló
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {trustBadges.map((badge, idx) => (
            <div
              key={idx}
              className="group text-center p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${colorClasses[badge.color]} flex items-center justify-center mb-3`}>
                <badge.icon className="w-6 h-6 text-white" aria-hidden />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{badge.label}</h3>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="flex justify-center gap-1.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-7 h-7 fill-amber-400 text-amber-400" aria-hidden />
            ))}
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1">
            4.9 / 5.0 átlagos értékelés
          </p>
          <p className="text-sm text-gray-500">
            12,487 valós véleményből
          </p>
        </div>
      </div>
    </section>
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

export const LiveShowcase = ({ products = [], onProductClick, rotationTick = 0 }) => {
  const [seed, setSeed] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const sectionRef = useRef(null);

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

  useEffect(() => {
    if (!rotationTick || isInView || isInteracting) return;
    setSeed((v) => v + 1);
  }, [rotationTick, isInView, isInteracting]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (!sectionRef.current || !(sectionRef.current instanceof Element)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    try {
      observer.observe(sectionRef.current);
    } catch (err) {
      return;
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="section-shell section-world section-world--favorites py-8 sm:py-10 lg:py-14 xl:py-16 overflow-hidden"
      role="region"
      aria-label="Vásárlóink kedvencei"
      data-section={SECTION_ID}
    >
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="section-frame">
          <SectionHeader
            id="customer-favorites-heading"
            title="Vásárlóink kedvencei"
            subtitle="A legjobbra értékelt és legtöbbet választott bútorok"
            Icon={Heart}
            accentClass="from-pink-500 to-rose-600"
            eyebrow="Közösségi kedvencek"
            badge="Közönségkedvenc"
            prominent
            className="border border-rose-100 shadow-sm section-header-hero section-header-hero--favorites"
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
            <ProductCarousel className="mt-2" onInteractionChange={setIsInteracting}>
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
                    size="compact"
                    tone="favorites"
                  />
                );
              })}
            </ProductCarousel>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-inner">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nincs elég adat a kedvencekhez</p>
              <p className="text-gray-400 text-sm">Térj vissza később!</p>
            </div>
          )}
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
    <section className="py-24 bg-gradient-to-br from-primary-500 to-secondary-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-[120px] animate-blob motion-reduce:animate-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full filter blur-[120px] animate-blob animation-delay-2000 motion-reduce:animate-none" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
          <Sparkles className="w-5 h-5 text-white" aria-hidden />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Kezdd el</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Készen állsz a tökéletes bútor megtalálására?
        </h2>

        <p className="text-lg text-white/90 mb-10">
          Csatlakozz 50.000+ elégedett vásárlónkhoz
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={onGetStarted}
            className="group w-full sm:w-auto min-h-[48px] px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-base shadow-2xl hover:shadow-white/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            aria-label="Böngészés indítása"
          >
            Böngészem a termékeket
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
};

export default { SocialProof, LiveShowcase, InteractiveCTA };
