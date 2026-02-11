import React, { useEffect, useRef, useState } from 'react';
import { Camera, MessageCircle, Move3d, Sparkles, Home, ArrowRight } from 'lucide-react';
import { trackSectionEvent } from '../../services/userPreferencesService';

const FEATURES = [
  {
    id: 'style-quiz',
    title: 'AI Stílus Quiz',
    subtitle: '5 kérdés a Style DNA-dhoz',
    cta: 'Style DNA megismerése',
    icon: Sparkles,
    stat: null,
    statLabel: null,
    isHighlighted: true,
    displayOrder: 0,
    border: 'border-amber-200/80',
    bg: 'from-amber-50/90 to-white',
    accent: 'from-amber-400 via-amber-500 to-primary-500',
    iconGradient: 'from-amber-500 to-orange-500',
    text: 'text-amber-800'
  },
  {
    id: 'visual-search',
    title: 'Képfelismerés',
    subtitle: 'Fotózz és keress',
    cta: 'Keresés indítása',
    icon: Camera,
    stat: '99%',
    statLabel: 'pontosság',
    isHighlighted: false,
    displayOrder: 1,
    border: 'border-sky-200/80',
    bg: 'from-sky-50/90 to-white',
    accent: 'from-sky-400 via-blue-500 to-indigo-500',
    iconGradient: 'from-sky-500 to-blue-600',
    text: 'text-sky-800'
  },
  {
    id: 'chat',
    title: 'AI Chat',
    subtitle: 'Személyes tanácsadó',
    cta: 'Chat megnyitása',
    icon: MessageCircle,
    stat: '24/7',
    statLabel: 'elérhető',
    isHighlighted: false,
    displayOrder: 2,
    border: 'border-secondary-200/80',
    bg: 'from-secondary-50/90 to-white',
    accent: 'from-secondary-400 via-teal-500 to-emerald-500',
    iconGradient: 'from-secondary-500 to-secondary-600',
    text: 'text-secondary-800'
  },
  {
    id: 'room-planner',
    title: 'Szobatervező',
    subtitle: 'Virtuális elhelyezés',
    cta: 'Tervezés indítása',
    icon: Move3d,
    stat: 'AR',
    statLabel: 'támogatás',
    isHighlighted: false,
    displayOrder: 3,
    border: 'border-emerald-200/80',
    bg: 'from-emerald-50/90 to-white',
    accent: 'from-emerald-400 via-green-500 to-teal-500',
    iconGradient: 'from-emerald-500 to-green-600',
    text: 'text-emerald-800'
  },
  {
    id: 'room-designer',
    title: 'AI Szoba Tervező',
    subtitle: 'Tervezd meg a tökéletes szobát',
    cta: 'Szoba megtervezése',
    icon: Home,
    stat: null,
    statLabel: null,
    isHighlighted: false,
    displayOrder: 4,
    border: 'border-indigo-200/80',
    bg: 'from-indigo-50/90 to-white',
    accent: 'from-indigo-400 via-violet-500 to-secondary-500',
    iconGradient: 'from-indigo-500 to-violet-600',
    text: 'text-indigo-800'
  }
].sort((a, b) => a.displayOrder - b.displayOrder);

const AUTO_SCROLL_MS = 4000;
const SECTION_ID = 'ai-module';

function FeatureCard({ feature, layout, onClick }) {
  const Icon = feature.icon;
  const isMobile = layout === 'mobile';
  const statPos = feature.isHighlighted && feature.stat ? 'top-4 left-4' : 'top-4 right-4 sm:top-5 sm:right-5';
  const badgePos = 'top-4 right-4 sm:top-5 sm:right-5';

  return (
    <button
      type="button"
      onClick={() => {
        trackSectionEvent(SECTION_ID, 'click', feature.id);
        onClick?.(feature);
      }}
      className={`group relative flex-shrink-0 w-[calc(50%-10px)] min-w-[calc(50%-10px)] h-[220px] rounded-xl border bg-gradient-to-br ${feature.border} ${feature.bg} text-left shadow-md hover:shadow-xl hover:ring-2 hover:ring-primary-200/80 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${feature.isHighlighted ? 'ring-2 ring-amber-300/60' : ''} ${!isMobile ? 'hidden sm:block sm:w-auto sm:min-w-0 sm:h-[240px]' : ''}`}
      aria-label={`${feature.title} – ${feature.subtitle}`}
    >
      <div className={`absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r ${feature.accent}`} aria-hidden />
      <div className={`relative h-full flex flex-col ${isMobile ? 'p-4' : 'p-5'}`}>
        <div className={`${isMobile ? 'w-10 h-10 mb-3' : 'w-11 h-11 mb-4'} rounded-xl bg-gradient-to-br ${feature.iconGradient} text-white flex items-center justify-center shadow-sm`}>
          <Icon className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} aria-hidden />
        </div>
        {feature.stat && (
          <div className={`absolute ${statPos} text-right`}>
            <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold ${feature.text}`}>{feature.stat}</div>
            <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>{feature.statLabel}</div>
          </div>
        )}
        {feature.isHighlighted && (
          <span className={`absolute ${badgePos} px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold`}>
            Próbáld először
          </span>
        )}
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold ${feature.text} mb-0.5 sm:mb-1`}>{feature.title}</h3>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mb-auto`}>{feature.subtitle}</p>
        <span className={`inline-flex items-center gap-1.5 sm:gap-2 ${isMobile ? 'text-sm' : 'text-sm'} font-semibold ${feature.text} mt-2`}>
          {feature.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
        </span>
      </div>
    </button>
  );
}

export default function AIModuleUnified({ onFeatureClick }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    trackSectionEvent(SECTION_ID, 'impression');
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const fn = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const handleClick = (feature) => {
    onFeatureClick?.(feature);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const updateWidth = () => {
      const gap = 20;
      const w = (el.offsetWidth - gap) / 2;
      setCardWidth(w + gap);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || cardWidth <= 0) return;
    const count = FEATURES.length;
    const totalWidth = count * cardWidth;
    const onScroll = () => {
      const x = el.scrollLeft;
      let idx = Math.round(x / cardWidth) % count;
      if (idx < 0) idx += count;
      setActiveIndex(idx);
      if (x >= totalWidth - 10) el.scrollLeft = x - totalWidth;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [cardWidth]);

  useEffect(() => {
    if (reduceMotion || isPaused || !scrollRef.current || cardWidth <= 0) return;
    const el = scrollRef.current;
    const count = FEATURES.length;
    const totalWidth = count * cardWidth;
    const t = setInterval(() => {
      const curr = el.scrollLeft;
      const next = curr + cardWidth;
      if (next >= totalWidth - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollTo({ left: next, behavior: 'smooth' });
      }
    }, AUTO_SCROLL_MS);
    return () => clearInterval(t);
  }, [reduceMotion, isPaused, cardWidth]);

  const handleTouchStart = () => {
    setIsPaused(true);
    setIsScrolling(false);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPaused(false), 3000);
    setTimeout(() => setIsScrolling(false), 100);
  };

  const handleTouchMove = () => {
    setIsScrolling(true);
  };

  return (
    <section
      className="py-20 bg-white border-t border-gray-100"
      aria-labelledby="ai-module-heading"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12">
          <h2
            id="ai-module-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3"
          >
            AI a <span className="bg-gradient-to-r from-primary-500 to-secondary-600 bg-clip-text text-transparent">szolgálatodban</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Okos funkciók a tökéletes választáshoz
          </p>
        </div>

        {/* Mobil: scroll carousel, 2 kártya, auto-scroll */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className={`flex sm:hidden gap-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth pb-2 -mx-4 pl-4 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isScrolling ? 'opacity-95' : ''}`}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft: 16
          }}
        >
          {[...FEATURES, ...FEATURES].map((feature, i) => (
            <FeatureCard
              key={`${feature.id}-${i}`}
              feature={feature}
              layout="mobile"
              onClick={handleClick}
            />
          ))}
        </div>

        {/* Dot indicator – mobil */}
        <div className="flex sm:hidden justify-center gap-1.5 mt-4">
          {FEATURES.map((_, i) => (
            <span
              key={i}
              className={`block w-2 h-2 rounded-full transition-colors ${i === activeIndex ? 'bg-primary-500' : 'bg-gray-300'}`}
              aria-hidden
            />
          ))}
        </div>

        {/* Tablet + Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-5 mt-0">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
            <button
              key={feature.id}
              type="button"
              onClick={() => {
                trackSectionEvent(SECTION_ID, 'click', feature.id);
                handleClick(feature);
              }}
              className={`group relative rounded-xl border bg-gradient-to-br ${feature.border} ${feature.bg} h-[240px] text-left shadow-md hover:shadow-xl hover:ring-2 hover:ring-primary-200/80 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 overflow-hidden ${feature.isHighlighted ? 'ring-2 ring-amber-300/60 lg:col-span-2' : ''}`}
              aria-label={`${feature.title} – ${feature.subtitle}`}
            >
              <div className={`absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r ${feature.accent}`} aria-hidden />
              <div className="relative h-full flex flex-col p-5">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.iconGradient} text-white flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-6 h-6" aria-hidden />
                </div>
                {feature.stat && (
                  <div className={`absolute top-5 ${feature.isHighlighted ? 'left-5' : 'right-5'} text-right`}>
                    <div className={`text-base font-bold ${feature.text}`}>{feature.stat}</div>
                    <div className="text-xs text-gray-500">{feature.statLabel}</div>
                  </div>
                )}
                {feature.isHighlighted && (
                  <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    Próbáld először
                  </span>
                )}
                <h3 className={`text-lg font-bold ${feature.text} mb-1`}>{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-auto">{feature.subtitle}</p>
                <span className={`inline-flex items-center gap-2 text-sm font-semibold ${feature.text} mt-2`}>
                  {feature.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
                </span>
              </div>
            </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
