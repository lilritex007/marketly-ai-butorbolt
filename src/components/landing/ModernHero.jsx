import React, { useState, useEffect } from 'react';
import {
  Sparkles, Camera, ArrowRight,
  Package, Users, Star, Zap, ChevronRight
} from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import HeroSmartSearch from './HeroSmartSearch';
import { getCategoryImage } from '../../utils/categoryImages';
import { trackSectionEvent } from '../../services/userPreferencesService';

const HERO_REVEAL_DELAY = { badge: 0, line1: 100, line2: 220, line3: 340, sub: 460, cta: 600, stats: [720, 820, 920, 1020] };

/**
 * Premium Hero – egyetlen üzenet, erős vizuál, légzés
 */
export const ModernHero = ({
  onExplore,
  onTryAI,
  quickCategories = [],
  onQuickCategory,
  products = [],
  onHeroSearch,
  onHeroQuickView
}) => {
  const mounted = true;
  const [heroVariant, setHeroVariant] = useState('A');

  useEffect(() => {
    try {
      const storageKey = 'mkt_hero_ab_variant';
      const existing = localStorage.getItem(storageKey);
      if (existing === 'A' || existing === 'B') {
        setHeroVariant(existing);
        trackSectionEvent(`hero-variant-${existing}`, 'impression');
        return;
      }
      const assigned = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(storageKey, assigned);
      setHeroVariant(assigned);
      trackSectionEvent(`hero-variant-${assigned}`, 'impression');
    } catch {
      setHeroVariant('A');
      trackSectionEvent('hero-variant-A', 'impression');
    }
  }, []);

  const heroCopy = heroVariant === 'B'
    ? {
      line1: 'Alakítsd át a teret,',
      line2: 'mielőtt egyetlen bútort megvennél.',
      sub: 'AI útvonalterv, azonnali vizualizáció és valódi termékek egyetlen prémium élményben.',
      ctaPrimary: 'Személyes AI terv indul',
      ctaBadge: 'PRÉMIUM',
      ctaSecondary: 'Inspiráció böngészése'
    }
    : {
      line1: 'Tervezz úgy,',
      line2: 'mintha ez lenne az álomotthonod.',
      sub: 'Fotó, AI-tervezés, valós ajánlatok. Egyetlen flow, ami 5 perc alatt eljuttat az ihlettől a rendelésig.',
      ctaPrimary: 'Kezdjük AI-val',
      ctaBadge: 'Most',
      ctaSecondary: 'Kollekció megtekintése'
    };

  const stats = [
    { icon: Package, value: 170, suffix: 'K+', label: 'Termék', decimals: 0 },
    { icon: Users, value: 50, suffix: 'K+', label: 'Elégedett vásárló', decimals: 0 },
    { icon: Star, value: 4.9, suffix: '/5', label: 'Értékelés', decimals: 1 },
    { icon: Zap, value: 24, suffix: '/7', label: 'AI támogatás', decimals: 0 }
  ];
  const statCardStyles = [
    {
      card: 'from-emerald-50 to-white border-emerald-200',
      iconWrap: 'from-emerald-500 to-emerald-600',
      edge: 'from-emerald-500 via-emerald-400 to-transparent'
    },
    {
      card: 'from-blue-50 to-white border-blue-200',
      iconWrap: 'from-blue-500 to-blue-600',
      edge: 'from-blue-500 via-blue-400 to-transparent'
    },
    {
      card: 'from-amber-50 to-white border-amber-200',
      iconWrap: 'from-amber-500 to-orange-600',
      edge: 'from-amber-500 via-amber-400 to-transparent'
    },
    {
      card: 'from-secondary-50 to-white border-secondary-200',
      iconWrap: 'from-secondary-600 to-secondary-700',
      edge: 'from-secondary-600 via-secondary-500 to-transparent'
    }
  ];

  const HERO_BG_IMAGE = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85';

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fcfcfb]"
      aria-label="Főoldal – AI bútorbolt"
    >
      {/* Háttérkép ~10% halványan – minden képernyőméreten (mobil, tablet, desktop) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/72 to-primary-50/90" aria-hidden />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[30%] h-[520px] w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,138,0,0.24),transparent_62%)] blur-2xl" />
        <div className="absolute left-1/2 top-[34%] h-[420px] w-[min(860px,84vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,107,111,0.16),transparent_70%)] blur-xl" />
      </div>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary-300 to-transparent opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-secondary-300 to-transparent opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 overflow-x-hidden min-w-0">
        <div className="flex flex-col items-center text-center w-full min-w-0 max-w-full">
          <div
            className={`inline-flex items-center gap-2.5 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-8 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.badge}ms` } : undefined}
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500" aria-hidden />
            <span className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Marketly AI rendszer
            </span>
          </div>

          <h1 className="mb-6 sm:mb-7 lg:mb-8">
            <span
              className={`block text-[2.3rem] sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.03] ${mounted ? 'hero-reveal' : 'opacity-0'}`}
              style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.line1}ms`, letterSpacing: '-0.03em' } : { letterSpacing: '-0.03em' }}
            >
              {heroCopy.line1}
            </span>
            <span
              className={`block text-[2.3rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.03] bg-gradient-to-r from-primary-500 to-secondary-700 bg-clip-text text-transparent ${mounted ? 'hero-reveal' : 'opacity-0'}`}
              style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.line2}ms`, letterSpacing: '-0.03em' } : { letterSpacing: '-0.03em' }}
            >
              {heroCopy.line2}
            </span>
          </h1>

          <div
            className={`mx-auto h-1.5 w-28 rounded-full bg-gradient-to-r from-primary-500 to-secondary-700 mb-5 sm:mb-6 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.line2 + 40}ms` } : undefined}
            aria-hidden
          />

          {/* Gyorskategóriák – valós kategóriák képekkel, headline alatt */}
          {quickCategories.length > 0 && (
            <div
              className={`w-full max-w-4xl mx-auto mb-5 sm:mb-6 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
              style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.line2 + 80}ms` } : undefined}
            >
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory">
                {quickCategories.map((cat) => {
                  const name = typeof cat === 'string' ? cat : cat?.name;
                  const count = typeof cat === 'object' && cat != null ? Number(cat.productCount || 0) : null;
                  const productImg = Array.isArray(products) && products.length > 0
                    ? products.find((p) => (p?.category || '').toLowerCase().includes(String(name || '').toLowerCase()))?.images?.[0]
                    : null;
                  const img = productImg || getCategoryImage(name);
                  if (!name) return null;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onQuickCategory?.(name)}
                      className="group relative shrink-0 w-[140px] sm:w-[160px] lg:w-[180px] aspect-[4/5] rounded-2xl overflow-hidden border border-gray-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                    >
                      <img
                        src={img}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 text-left">
                        <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg line-clamp-2">
                          {name}
                        </span>
                        {count != null && count > 0 && (
                          <span className="text-white/90 text-xs mt-0.5 font-medium">
                            {count.toLocaleString('hu-HU')} termék
                          </span>
                        )}
                        <ChevronRight className="absolute bottom-3 right-3 w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform" aria-hidden />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Központi hero search – full width minus 2px */}
          <div
            className={`relative w-full min-w-0 max-w-full px-[1px] mb-6 sm:mb-8 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.sub - 60}ms` } : undefined}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/70 bg-white/[0.04] backdrop-blur-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]" aria-hidden />
            <div className="pointer-events-none absolute inset-x-8 -top-10 h-24 bg-[radial-gradient(ellipse_at_center,rgba(255,138,0,0.22),transparent_65%)] blur-2xl" aria-hidden />
            <div className="pointer-events-none absolute inset-x-12 -bottom-12 h-28 bg-[radial-gradient(ellipse_at_center,rgba(0,107,111,0.18),transparent_70%)] blur-2xl" aria-hidden />
            <HeroSmartSearch
              products={products}
              onSearch={onHeroSearch}
              onTryAI={onTryAI}
              variant={heroVariant}
              onOpenProductQuickView={onHeroQuickView}
            />
          </div>

          <p
            className={`text-sm sm:text-base text-gray-600/95 max-w-xl mx-auto mb-8 sm:mb-9 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.sub}ms`, lineHeight: '1.6' } : { lineHeight: '1.6' }}
          >
            {heroCopy.sub}
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center mb-7 sm:mb-9 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.cta + 120}ms` } : undefined}
          >
            <button
              type="button"
              onClick={() => {
                trackSectionEvent(`hero-variant-${heroVariant}`, 'click', 'cta-primary');
                onTryAI?.();
              }}
              className="group relative w-full sm:w-auto min-h-[48px] px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-700 text-white rounded-2xl font-semibold text-base shadow-[0_10px_26px_rgba(255,138,0,0.32)] hover:shadow-[0_14px_34px_rgba(255,138,0,0.42)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Kezdj AI tervezéssel"
            >
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wide">{heroCopy.ctaBadge}</span>
              <Sparkles className="w-5 h-5" aria-hidden />
              {heroCopy.ctaPrimary}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                trackSectionEvent(`hero-variant-${heroVariant}`, 'click', 'cta-secondary');
                onExplore?.();
              }}
              className="w-full sm:w-auto min-h-[48px] px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold text-base border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Kollekció böngészése"
            >
              {heroCopy.ctaSecondary}
              <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600 mb-9 ${mounted ? 'hero-reveal' : 'opacity-0'}`} style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.cta + 70}ms` } : undefined}>
            <span className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" aria-hidden /> 4.9/5 vásárlói értékelés</span>
            <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-primary-500" aria-hidden /> 50K+ elégedett vásárló</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-secondary-700" aria-hidden /> 24/7 AI támogatás</span>
          </div>

          <div className={`w-full max-w-6xl ${mounted ? 'hero-reveal' : 'opacity-0'}`} style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.cta + 180}ms` } : undefined}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, idx) => {
              const style = statCardStyles[idx % statCardStyles.length];
              return (
              <div
                key={idx}
                    className={`group relative overflow-hidden bg-gradient-to-tr ${style.card} rounded-2xl p-4 border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                    <div className={`absolute left-0 bottom-0 w-[78%] h-[2px] bg-gradient-to-r ${style.edge}`} aria-hidden />
                    <div className="absolute left-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-black/5 to-transparent rotate-12 -translate-x-7 translate-y-7 blur-[1px]" aria-hidden />
                    <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.iconWrap} text-white flex items-center justify-center mb-2.5 shadow-sm`}>
                      <stat.icon className="w-5 h-5" aria-hidden />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  <CountUp
                    end={stat.value}
                    duration={1800}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    delay={HERO_REVEAL_DELAY.stats[idx] + 180}
                  />
                </div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
              </div>
              );
            })}
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default { ModernHero };
