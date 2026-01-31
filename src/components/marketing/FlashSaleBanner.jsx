import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight, X, Flame, Percent } from 'lucide-react';

/**
 * FlashSaleBanner - Ultra-compact, elegant countdown banner
 * Professional UX with smooth animations
 */
const FlashSaleBanner = ({ 
  endTime,
  title = 'Flash Sale',
  subtitle = 'Akár 50% kedvezmény',
  onViewSale,
  onDismiss,
  variant = 'banner'
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isDismissed, setIsDismissed] = useState(false);
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
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed || isExpired) return null;

  const pad = (n) => String(n).padStart(2, '0');

  // Compact time display
  const TimeUnit = ({ value, label }) => (
    <div className="flex items-center">
      <span className="bg-white/20 backdrop-blur-sm text-white font-bold tabular-nums px-1.5 py-0.5 rounded text-sm sm:text-base lg:text-lg">
        {pad(value)}
      </span>
      <span className="text-white/60 text-[10px] ml-0.5 hidden sm:inline">{label}</span>
    </div>
  );

  return (
    <div className="relative bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
        }} />
      </div>

      {/* Content - Ultra compact single line */}
      <div className="relative flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm sm:text-base truncate">{title}</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                Live
              </span>
            </div>
            <p className="text-white/80 text-[10px] sm:text-xs truncate hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Center: Countdown */}
        <div className="flex items-center gap-1 shrink-0">
          <Clock className="w-3.5 h-3.5 text-white/70 hidden sm:block" />
          <div className="flex items-center gap-0.5 sm:gap-1">
            <TimeUnit value={timeLeft.hours} label="ó" />
            <span className="text-white/50 font-bold">:</span>
            <TimeUnit value={timeLeft.minutes} label="p" />
            <span className="text-white/50 font-bold">:</span>
            <TimeUnit value={timeLeft.seconds} label="mp" />
          </div>
        </div>

        {/* Right: CTA */}
        <button
          onClick={onViewSale}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white text-red-600 font-bold text-xs sm:text-sm rounded-lg hover:bg-red-50 transition-all shadow-md hover:shadow-lg shrink-0"
        >
          <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Akciók</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0"
          aria-label="Bezárás"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FlashSaleBanner;
