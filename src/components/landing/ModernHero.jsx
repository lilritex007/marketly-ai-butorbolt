import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Camera, Move3d, MessageCircle, ArrowRight,
  Package, Users, Star, Zap
} from 'lucide-react';
import { CountUp } from '../ui/CountUp';

const HERO_REVEAL_DELAY = { badge: 0, line1: 100, line2: 220, line3: 340, sub: 460, cta: 600, stats: [720, 820, 920, 1020] };

/**
 * Premium Hero – egyetlen üzenet, erős vizuál, légzés
 */
export const ModernHero = ({ onExplore, onTryAI, quickCategories = [], onQuickCategory }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroRef = useRef(null);
  const rafRef = useRef(null);
  const lastEventRef = useRef(null);
  const mounted = true;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
    return undefined;
  }, []);

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || window.innerWidth < 768) return; // Skip on mobile
    lastEventRef.current = e;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const ev = lastEventRef.current;
      if (!ev || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const y = ((ev.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
      setMousePosition({ x, y });
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const stats = [
    { icon: Package, value: 170, suffix: 'K+', label: 'Termék', decimals: 0 },
    { icon: Users, value: 50, suffix: 'K+', label: 'Elégedett vásárló', decimals: 0 },
    { icon: Star, value: 4.9, suffix: '/5', label: 'Értékelés', decimals: 1 },
    { icon: Zap, value: 24, suffix: '/7', label: 'AI támogatás', decimals: 0 }
  ];

  return (
    <section
      ref={heroRef}
      onMouseMove={handlePointerMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f8f8f7]"
      aria-label="Főoldal – AI bútorbolt"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            background: 'radial-gradient(ellipse 75% 55% at 50% -10%, rgba(255, 138, 0, 0.20), transparent), radial-gradient(ellipse 55% 35% at 100% 40%, rgba(0, 107, 111, 0.08), transparent), radial-gradient(ellipse 50% 30% at 0% 85%, rgba(255, 138, 0, 0.08), transparent)'
          }}
        />
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[140px] opacity-[0.15]"
          style={{ background: '#ff8a00' }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-[420px] h-[420px] rounded-full mix-blend-multiply filter blur-[95px] opacity-[0.12] motion-reduce:animate-none"
          style={{
            background: 'linear-gradient(135deg, #ff8a00 0%, #fb923c 100%)',
            transform: prefersReducedMotion ? 'none' : `translate(${mousePosition.x * 18}px, ${mousePosition.y * 18}px)`
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[360px] h-[360px] rounded-full mix-blend-multiply filter blur-[85px] opacity-[0.1] motion-reduce:animate-none"
          style={{
            background: 'linear-gradient(135deg, #006b6f 0%, #0d9488 100%)',
            transform: prefersReducedMotion ? 'none' : `translate(${mousePosition.x * -12}px, ${mousePosition.y * -12}px)`
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-16 sm:py-20 lg:py-24">
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-2.5 px-4 py-2 bg-white/95 rounded-full border border-gray-200 shadow-sm mb-8 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.badge}ms` } : undefined}
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            <span className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Marketly Signature AI
            </span>
          </div>

          <h1 className="mb-7 sm:mb-8 lg:mb-10">
            <span
              className={`block text-[2.35rem] sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold text-gray-900 leading-[1.06] ${mounted ? 'hero-reveal' : 'opacity-0'}`}
              style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.line1}ms`, letterSpacing: '-0.03em' } : { letterSpacing: '-0.03em' }}
            >
              Tervezd meg az otthonod
            </span>
            <span
              className={`block text-[2.35rem] sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold leading-[1.06] bg-gradient-to-r from-primary-500 to-secondary-700 bg-clip-text text-transparent ${mounted ? 'hero-reveal' : 'opacity-0'}`}
              style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.line2}ms`, letterSpacing: '-0.03em' } : { letterSpacing: '-0.03em' }}
            >
              mintha beleszeretnél
            </span>
          </h1>

          <p
            className={`text-base sm:text-lg lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 sm:mb-12 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.sub}ms`, lineHeight: '1.6' } : { lineHeight: '1.6' }}
          >
            Fotó, AI-tervezés, valós ajánlatok. Egyetlen flow, ami 5 perc alatt eljuttat az ihlettől a rendelésig.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center mb-8 sm:mb-10 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
            style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.cta}ms` } : undefined}
          >
            <button
              type="button"
              onClick={onTryAI}
              className="group relative w-full sm:w-auto min-h-[48px] px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-base shadow-primary hover:shadow-primary-lg hover:bg-primary-600 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Kezdj AI tervezéssel"
            >
              <Sparkles className="w-5 h-5" aria-hidden />
              Kezdjük AI-val
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onExplore}
              className="w-full sm:w-auto min-h-[48px] px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-base border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Kollekció böngészése"
            >
              Kollekció megtekintése
              <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600 mb-10 ${mounted ? 'hero-reveal' : 'opacity-0'}`} style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.cta + 70}ms` } : undefined}>
            <span className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" aria-hidden /> 4.9/5 vásárlói értékelés</span>
            <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-primary-500" aria-hidden /> 50K+ elégedett vásárló</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-secondary-700" aria-hidden /> 24/7 AI támogatás</span>
          </div>

          {quickCategories.length > 0 && (
            <div className={`flex flex-wrap items-center justify-center gap-2.5 mb-10 ${mounted ? 'hero-reveal' : 'opacity-0'}`} style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.cta + 120}ms` } : undefined}>
              {quickCategories.slice(0, 3).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onQuickCategory?.(cat)}
                  className="px-4 py-2 rounded-full bg-white/95 border border-gray-200 text-gray-700 font-medium text-sm hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors shadow-sm"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`bg-white/85 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${mounted ? 'hero-reveal' : 'opacity-0'}`}
                style={mounted ? { animationDelay: `${HERO_REVEAL_DELAY.stats[idx]}ms` } : undefined}
              >
                <stat.icon className="w-7 h-7 text-primary-500 mx-auto mb-2" aria-hidden />
                <div className="text-2xl font-bold text-gray-900">
                  <CountUp
                    end={stat.value}
                    duration={1800}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    delay={HERO_REVEAL_DELAY.stats[idx] + 180}
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * AI Features Showcase – wow kártyák, egyértelmű CTA
 */
export const AIFeaturesShowcase = ({ onFeatureClick }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    { icon: Camera, title: 'Képfelismerés', shortDesc: 'Fotózz és keress', color: 'from-blue-500 to-primary-500', bgColor: 'bg-blue-50', stat: '99%', statLabel: 'pontosság' },
    { icon: MessageCircle, title: 'AI Chat', shortDesc: 'Személyes tanácsadó', color: 'from-secondary-600 to-secondary-700', bgColor: 'bg-secondary-50', stat: '24/7', statLabel: 'elérhető' },
    { icon: Move3d, title: 'Szobatervező', shortDesc: 'Virtuális elhelyezés', color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-50', stat: 'AR', statLabel: 'támogatás' }
  ];

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => setActiveFeature((prev) => (prev + 1) % features.length), 4000);
    return () => clearInterval(interval);
  }, [isHovering, features.length]);

  return (
    <section className="py-20 bg-white border-t border-gray-100" aria-labelledby="ai-features-heading">
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-primary-500" aria-hidden />
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">AI Powered</span>
          </div>
          <h2 id="ai-features-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
            AI a <span className="bg-gradient-to-r from-primary-500 to-secondary-600 bg-clip-text text-transparent">szolgálatodban</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">Okos funkciók a tökéletes választáshoz</p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {features.map((feature, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveFeature(idx);
                onFeatureClick?.(feature);
              }}
              className={`
                relative text-left rounded-xl p-6 border transition-all duration-200
                ${activeFeature === idx 
                  ? 'bg-white border-primary-200 shadow-lg' 
                  : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
                }
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeFeature === idx ? `bg-gradient-to-br ${feature.color} shadow-md` : 'bg-white border border-gray-200'}`}>
                  <feature.icon className={`w-6 h-6 ${activeFeature === idx ? 'text-white' : 'text-gray-600'}`} aria-hidden />
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900">{feature.stat}</div>
                  <div className="text-xs text-gray-400">{feature.statLabel}</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{feature.shortDesc}</p>
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${activeFeature === idx ? 'text-primary-600' : 'text-gray-400'}`}>
                Kipróbálom <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
              {activeFeature === idx && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl bg-gradient-to-r ${feature.color}`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default { ModernHero, AIFeaturesShowcase };
