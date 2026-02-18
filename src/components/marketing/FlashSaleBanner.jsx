import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, ArrowRight, X, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * FlashSaleBanner - Impactful, urgent sale banner
 * Clear message: SALE + TIME + ACTION
 */
const FLASH_DISMISS_KEY = 'mkt_flash_dismissed_date';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const FLASH_OFFERS = [
  { title: '🔥 Flash Sale!', badge: '-50%', text: 'Akár 50% kedvezmény kiválasztott bútorokra', cta: 'Megnézem az akciókat', ctaShort: 'Megnézem', bg: 'from-red-600 via-orange-500 to-amber-500', ctaColor: 'text-red-600' },
  { title: '🏷️ Megtakarítások', badge: 'OLCSÓBB', text: 'Kanapék, ágyak, szekrények – ma legolcsóbban', cta: 'Nézd meg a kedvezményeket', ctaShort: 'Nézd meg', bg: 'from-rose-600 via-pink-500 to-amber-500', ctaColor: 'text-rose-600' },
  { title: '🚚 Ingyenes szállítás', badge: '50e+', text: 'Ingyenes szállítás 50.000 Ft felett', cta: 'Vásárlás most', ctaShort: 'Vásárolj', bg: 'from-emerald-600 via-teal-500 to-cyan-500', ctaColor: 'text-emerald-700' },
  { title: '⏰ Csak ma!', badge: 'SIESS', text: 'Korlátozott idő – ne maradj le', cta: 'Nem hagyom ki', ctaShort: 'Nem hagyom ki', bg: 'from-orange-600 via-red-500 to-rose-600', ctaColor: 'text-orange-600' },
];

const FlashSaleBanner = ({ 
  endTime,
  title = 'Flash Sale',
  subtitle,
  onViewSale,
  onDismiss,
  variant = 'banner'
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [offerIndex, setOfferIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const currentOffer = FLASH_OFFERS[offerIndex];
  const displayTitle = currentOffer.title;
  const displaySubtitle = currentOffer.text;
  const displayCta = currentOffer.cta;
  const displayCtaShort = currentOffer.ctaShort;
  const bgGradient = currentOffer.bg;
  const ctaColor = currentOffer.ctaColor || 'text-red-600';
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(FLASH_DISMISS_KEY) === getTodayKey();
  });
  const [isExpired, setIsExpired] = useState(false);

  function calculateTimeLeft() {
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    const diff = end - new Date();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      if (newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  useEffect(() => {
    if (isPaused) return;
    const offerTimer = setInterval(() => {
      setOfferIndex((i) => (i + 1) % FLASH_OFFERS.length);
    }, 4500);
    return () => clearInterval(offerTimer);
  }, [isPaused]);

  const goToOffer = (idx) => {
    setOfferIndex(idx);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? e.clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? e.clientX;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setOfferIndex((i) => (i + 1) % FLASH_OFFERS.length);
      } else {
        setOfferIndex((i) => (i - 1 + FLASH_OFFERS.length) % FLASH_OFFERS.length);
      }
    }
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handlePrev = () => {
    setOfferIndex((i) => (i - 1 + FLASH_OFFERS.length) % FLASH_OFFERS.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleNext = () => {
    setOfferIndex((i) => (i + 1) % FLASH_OFFERS.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(FLASH_DISMISS_KEY, getTodayKey());
    } catch (_) {}
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed || isExpired) return null;

  const pad = (n) => String(n).padStart(2, '0');

  /* Time-left progress: assume 24h sale duration so bar shrinks as time runs out */
  const TOTAL_SALE_MS = 24 * 60 * 60 * 1000;
  const remainingMs = timeLeft.hours * 3600000 + timeLeft.minutes * 60000 + timeLeft.seconds * 1000;
  const timeLeftProgress = Math.min(100, (remainingMs / TOTAL_SALE_MS) * 100);

  return (
    <div
      className={`relative bg-gradient-to-r ${bgGradient} overflow-hidden rounded-xl sm:rounded-2xl shadow-xl transition-all duration-500`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated shine effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-[shimmer_3s_infinite]" 
          style={{ animation: 'shimmer 3s infinite', transform: 'translateX(-100%)' }} />
      </div>

      {/* Decorative: subtle floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-24 h-24 rounded-full bg-white/5 blur-2xl pointer-events-none" aria-hidden />
      <div className="absolute bottom-1/3 left-1/4 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" aria-hidden />

      {/* Mobile Layout - Stacked, centered */}
      <div className="sm:hidden relative px-4 py-4 pb-20 min-h-[200px]">
        {/* Top row: Icon + Title + Dismiss */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span key={offerIndex} className="font-black text-white text-sm sm:text-base flash-offer-enter inline-block">{displayTitle}</span>
                <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded animate-pulse shrink-0">
                  {currentOffer.badge}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Banner elrejtése ma"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Countdown - Big and clear */}
        <div className="flex items-center justify-center gap-1 mb-2.5">
          <Clock className="w-4 h-4 text-white/80" />
          <span className="text-white/80 text-xs font-medium mr-1">Vége:</span>
          {[
            { value: timeLeft.hours, label: 'ó' },
            { value: timeLeft.minutes, label: 'p' },
            { value: timeLeft.seconds, label: 'mp' }
          ].map((unit, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-black/30 backdrop-blur-sm rounded px-2 py-1">
                <span className="flash-countdown-digit text-white font-black text-lg tabular-nums inline-block">{pad(unit.value)}</span>
                <span className="text-white/70 text-[10px] ml-0.5">{unit.label}</span>
              </div>
              {idx < 2 && <span className="text-white/40 font-bold">:</span>}
            </React.Fragment>
          ))}
        </div>

        {/* CTA Button - Full width */}
        <button
          type="button"
          onClick={onViewSale}
          className={`w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-white ${ctaColor} font-bold text-sm rounded-lg shadow-lg active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-current`}
          aria-label={displayCta}
        >
          <Zap className="w-4 h-4" aria-hidden />
          <span key={offerIndex} className="animate-fade-in">{displayCta}</span>
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>

      {/* Desktop Layout - flex-col: tartalom + pöttyök sor + progress */}
      <div className="hidden sm:flex flex-col relative max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          {/* Left: Icon + Title + Badge */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink">
            <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 lg:w-7 lg:h-7 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span key={`title-${offerIndex}`} className="font-black text-white text-base sm:text-lg lg:text-xl flash-offer-enter">{displayTitle}</span>
                <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-black rounded-md shrink-0">
                  {currentOffer.badge}
                </span>
              </div>
              <p key={`sub-${offerIndex}`} className="text-white/80 text-xs lg:text-sm flash-offer-enter line-clamp-2 mt-0.5">{displaySubtitle}</p>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white/80" />
            <span className="text-white/90 text-sm font-medium">Lejár:</span>
            <div className="flex items-center gap-1">
              {[
                { value: timeLeft.hours, label: 'óra' },
                { value: timeLeft.minutes, label: 'perc' },
                { value: timeLeft.seconds, label: 'mp' }
              ].map((unit, idx) => (
                <React.Fragment key={idx}>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2.5 lg:px-3 py-1.5">
                    <span className="flash-countdown-digit text-white font-black text-xl lg:text-2xl tabular-nums inline-block">{pad(unit.value)}</span>
                    <span className="text-white/70 text-[10px] lg:text-xs ml-1">{unit.label}</span>
                  </div>
                  {idx < 2 && <span className="text-white/40 font-bold text-xl mx-0.5">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: CTA + Dismiss */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onViewSale}
              className={`min-h-[44px] flex items-center gap-2 px-5 lg:px-6 py-2.5 bg-white ${ctaColor} font-bold text-sm lg:text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-current`}
              aria-label={displayCta}
            >
              <Zap className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden />
              <span key={offerIndex} className="animate-fade-in">{displayCtaShort}</span>
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Banner elrejtése ma"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Desktop: pöttyök dedikált sorban, progress bar fölött */}
        <div className="flex justify-center gap-2 py-4 z-10" role="tablist" aria-label="Ajánlat váltása">
          {FLASH_OFFERS.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={offerIndex === i}
              onClick={() => goToOffer(i)}
              className={`w-3 h-3 rounded-full transition-all duration-200 min-w-[12px] min-h-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-600 ${
                offerIndex === i ? 'bg-white scale-125 shadow-lg' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Ajánlat ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Dots – mobil: absolute, progress bar fölött */}
      <div className="sm:hidden absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-10" role="tablist" aria-label="Ajánlat váltása">
        {FLASH_OFFERS.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={offerIndex === i}
            onClick={() => goToOffer(i)}
            className={`w-3 h-3 rounded-full transition-all duration-200 min-w-[12px] min-h-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-600 ${
              offerIndex === i ? 'bg-white scale-125 shadow-lg' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Ajánlat ${i + 1}`}
          />
        ))}
      </div>

      {/* Desktop: nyilak */}
      <button
        type="button"
        onClick={handlePrev}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Előző ajánlat"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Következő ajánlat"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Time-left progress bar – shrinks as countdown runs out */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20" aria-hidden="true">
        <div className="h-full bg-white/60 transition-[width] duration-1000 ease-linear" style={{ width: `${timeLeftProgress}%` }} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes flash-slide-in {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .flash-offer-enter {
          animation: flash-slide-in 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FlashSaleBanner;
