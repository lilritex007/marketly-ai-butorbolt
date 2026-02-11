import React from 'react';
import { Camera, MessageCircle, Move3d, Sparkles, Home, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    id: 'style-quiz',
    title: 'AI Stílus Quiz',
    subtitle: '5 kérdés a Style DNA-dhoz',
    gradient: 'from-amber-500 via-orange-500 to-primary-600',
    icon: Sparkles,
    stat: null,
    statLabel: null,
    isHighlighted: true
  },
  {
    id: 'visual-search',
    title: 'Képfelismerés',
    subtitle: 'Fotózz és keress',
    gradient: 'from-blue-500 via-primary-500 to-secondary-600',
    icon: Camera,
    stat: '99%',
    statLabel: 'pontosság'
  },
  {
    id: 'chat',
    title: 'AI Chat',
    subtitle: 'Személyes tanácsadó',
    gradient: 'from-secondary-600 via-teal-600 to-emerald-700',
    icon: MessageCircle,
    stat: '24/7',
    statLabel: 'elérhető'
  },
  {
    id: 'room-planner',
    title: 'Szobatervező',
    subtitle: 'Virtuális elhelyezés',
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    icon: Move3d,
    stat: 'AR',
    statLabel: 'támogatás'
  },
  {
    id: 'room-designer',
    title: 'AI Szoba Tervező',
    subtitle: 'Tervezd meg a tökéletes szobát',
    gradient: 'from-indigo-600 via-violet-600 to-secondary-700',
    icon: Home,
    stat: null,
    statLabel: null
  }
];

export default function AIModuleUnified({ onFeatureClick }) {
  const handleClick = (feature) => {
    onFeatureClick?.(feature);
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleClick(feature)}
                className={`group relative rounded-xl overflow-hidden bg-gray-100 h-[240px] text-left shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${feature.isHighlighted ? 'ring-2 ring-primary-300/50 lg:col-span-2' : ''}`}
                aria-label={`${feature.title} – ${feature.subtitle}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-4 sm:p-5">
                  <Icon className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 sm:w-12 sm:h-12 text-white/80" aria-hidden />
                  {feature.stat && (
                    <div className="absolute top-4 left-4 sm:top-5 sm:left-5 text-right">
                      <div className="text-sm sm:text-base font-bold text-white/95">{feature.stat}</div>
                      <div className="text-[10px] sm:text-xs text-white/80">{feature.statLabel}</div>
                    </div>
                  )}
                  {feature.isHighlighted && (
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400/95 text-amber-950 text-[10px] font-bold uppercase tracking-wide">
                      Próbáld ki elsőként
                    </span>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-3">{feature.subtitle}</p>
                  <span className="inline-flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                    Kipróbálom <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
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
