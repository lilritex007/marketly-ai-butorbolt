import React, { useEffect, useRef, useState } from 'react';
import { Camera, MessageCircle, Move3d, Sparkles, Home, ArrowRight } from 'lucide-react';
import { trackSectionEvent } from '../../services/userPreferencesService';
import { CountUp } from '../ui/Animations';

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

function StatDisplay({ feature, isMobile, reduceMotion }) {
  if (!feature.stat) return null;
  const statPos = feature.isHighlighted ? 'top-4 left-4' : 'top-4 right-4 sm:top-5 sm:right-5';
  const parsed = feature.stat === '99%' ? { num: 99, suffix: '%' } : feature.stat === '24/7' ? { num: 24, suffix: '/7' } : null;

  return (
    <div className={`absolute ${statPos} text-right`}>
      <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold ${feature.text}`}>
        {reduceMotion || !parsed ? feature.stat : <CountUp end={parsed.num} suffix={parsed.suffix} duration={1200} />}
      </div>
      <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>{feature.statLabel}</div>
    </div>
  );
}

function FeatureCard({ feature, layout, onClick, reduceMotion }) {
  const Icon = feature.icon;
  const isMobile = layout === 'mobile';
  const badgePos = 'top-4 right-4 sm:top-5 sm:right-5';

  return (
    <button
      type="button"
      onClick={() => {
        trackSectionEvent(SECTION_ID, 'click', feature.id);
        onClick?.(feature);
      }}
      className={`group relative flex-shrink-0 w-[calc(50%-10px)] min-w-[calc(50%-10px)] h-[220px] rounded-xl border bg-gradient-to-br ${feature.border} ${feature.bg} text-left shadow-lg hover:shadow-xl hover:ring-2 hover:ring-primary-200/80 active:scale-[0.98] transition-all duration-200 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 [transform-style:preserve-3d] hover:[transform:perspective(1000px)_rotateX(-2deg)_rotateY(2deg)_translateY(-4px)] motion-reduce:hover:[transform:translateY(-2px)] ${feature.isHighlighted ? 'ring-2 ring-amber-300/60' : ''} ${!isMobile ? 'hidden sm:block sm:w-auto sm:min-w-0 sm:h-[240px]' : ''}`}
      aria-label={`${feature.title} – ${feature.subtitle}`}
    >
      <div className={`absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r ${feature.accent}`} aria-hidden />
      <div className={`relative h-full flex flex-col ${isMobile ? 'p-4' : 'p-5'}`}>
        <div className={`${isMobile ? 'w-10 h-10 mb-3' : 'w-11 h-11 mb-4'} rounded-xl bg-gradient-to-br ${feature.iconGradient} text-white flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5`}>
          <Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} transition-transform duration-200 group-hover:scale-105`} aria-hidden />
        </div>
        <StatDisplay feature={feature} isMobile={isMobile} reduceMotion={reduceMotion} />
        {feature.isHighlighted && (
          <span className={`absolute ${badgePos} px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold`}>
            Próbáld először
          </span>
        )}
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold ${feature.text} mb-0.5 sm:mb-1`}>{feature.title}</h3>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mb-auto`}>{feature.subtitle}</p>
        <span className={`inline-flex items-center gap-1.5 sm:gap-2 ${isMobile ? 'text-sm' : 'text-sm'} font-semibold ${feature.text} mt-2`}>
          {feature.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-200" aria-hidden />
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
      let idx = Math.min(count - 1, Math.round(x / cardWidth));
      if (idx < 0) idx = 0;
      setActiveIndex(idx);
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
      if (next >= totalWidth - 20) {
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

  const [sectionInView, setSectionInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSectionInView(true),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden bg-gradient-to-b from-primary-50/40 via-white to-white border-t border-gray-100"
      aria-labelledby="ai-module-heading"
    >
      {/* Gradient orbs háttér */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-200/50 mix-blend-multiply filter blur-[100px] animate-blob motion-reduce:animate-none" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[350px] rounded-full bg-secondary-300/40 mix-blend-multiply filter blur-[90px] animate-blob animation-delay-2000 motion-reduce:animate-none" />
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] rounded-full bg-amber-200/40 mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000 motion-reduce:animate-none" />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
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
          {FEATURES.map((feature, idx) => (
            <div
              key={feature.id}
              className={`flex-shrink-0 transition-all duration-500 ease-out ${(sectionInView || reduceMotion) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={!reduceMotion ? { transitionDelay: `${idx * 80}ms` } : undefined}
            >
              <FeatureCard
                feature={feature}
                layout="mobile"
                onClick={handleClick}
                reduceMotion={reduceMotion}
              />
            </div>
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

        {/* Tablet + Desktop: 5 kártya egy sorban, staggered fade-in */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mt-0">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            const show = sectionInView || reduceMotion;
            return (
            <div
              key={feature.id}
              className={`transition-all duration-500 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={!reduceMotion ? { transitionDelay: `${idx * 90}ms` } : undefined}
            >
              <button
                type="button"
                onClick={() => {
                  trackSectionEvent(SECTION_ID, 'click', feature.id);
                  handleClick(feature);
                }}
                className={`group relative w-full rounded-xl border bg-gradient-to-br ${feature.border} ${feature.bg} h-[220px] lg:h-[240px] text-left shadow-lg hover:shadow-xl hover:ring-2 hover:ring-primary-200/80 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 overflow-hidden min-w-0 [transform-style:preserve-3d] hover:[transform:perspective(1000px)_rotateX(-2deg)_rotateY(2deg)_translateY(-4px)] motion-reduce:hover:[transform:translateY(-2px)] ${feature.isHighlighted ? 'ring-2 ring-amber-300/60' : ''}`}
                aria-label={`${feature.title} – ${feature.subtitle}`}
              >
                <div className={`absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r ${feature.accent}`} aria-hidden />
                <div className="relative h-full flex flex-col p-5">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.iconGradient} text-white flex items-center justify-center mb-4 shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5`}>
                    <Icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" aria-hidden />
                  </div>
                  {feature.stat && (
                    <div className={`absolute top-5 ${feature.isHighlighted ? 'left-5' : 'right-5'} text-right`}>
                      <div className={`text-base font-bold ${feature.text}`}>
                        {reduceMotion ? feature.stat : feature.stat === '99%' ? (
                          <CountUp end={99} suffix="%" duration={1200} />
                        ) : feature.stat === '24/7' ? (
                          <CountUp end={24} suffix="/7" duration={1200} />
                        ) : (
                          feature.stat
                        )}
                      </div>
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
                    {feature.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-200" aria-hidden />
                  </span>
                </div>
              </button>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
