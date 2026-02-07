import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight, X, Flame } from 'lucide-react';

/**
 * FlashSaleBanner - Impactful, urgent sale banner
 * Clear message: SALE + TIME + ACTION
 */
const FLASH_DISMISS_KEY = 'mkt_flash_dismissed_date';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const FlashSaleBanner = ({ 
  endTime,
  title = 'Flash Sale',
  subtitle = 'Akár 50% kedvezmény',
  onViewSale,
  onDismiss,
  variant = 'banner'
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
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
    <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 overflow-hidden">
      {/* Animated shine effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-[shimmer_3s_infinite]" 
          style={{ animation: 'shimmer 3s infinite', transform: 'translateX(-100%)' }} />
      </div>

      {/* Mobile Layout - Stacked, centered */}
      <div className="sm:hidden relative px-3 py-3">
        {/* Top row: Icon + Title + Dismiss */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base">{title}</span>
                <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded animate-pulse">
                  -50%
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
          className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 font-bold text-sm rounded-lg shadow-lg active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500"
          aria-label="Akciók megtekintése"
        >
          <Zap className="w-4 h-4" aria-hidden />
          Megnézem az akciókat
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>

      {/* Desktop Layout - Single row, all visible */}
      <div className="hidden sm:flex relative items-center justify-between gap-4 lg:gap-6 px-4 lg:px-8 py-2.5 lg:py-3 max-w-[1800px] mx-auto">
        {/* Left: Icon + Title + Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 lg:w-7 lg:h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg lg:text-xl">{title}</span>
              <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-black rounded-md">
                AKÁR -50%
              </span>
            </div>
            <p className="text-white/80 text-xs lg:text-sm">{subtitle}</p>
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
            className="min-h-[44px] flex items-center gap-2 px-5 lg:px-6 py-2.5 bg-white text-red-600 font-bold text-sm lg:text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500"
            aria-label="Akciók megtekintése"
          >
            <Zap className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden />
            Megnézem
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

      {/* Time-left progress bar – shrinks as countdown runs out */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20" aria-hidden="true">
        <div className="h-full bg-white/60 transition-[width] duration-1000 ease-linear" style={{ width: `${timeLeftProgress}%` }} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

export default FlashSaleBanner;
