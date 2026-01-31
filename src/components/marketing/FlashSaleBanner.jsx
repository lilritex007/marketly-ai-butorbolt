import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight, X, Flame, Gift } from 'lucide-react';

/**
 * FlashSaleBanner - Countdown timer for flash sales
 * Creates urgency with animated countdown and product highlights
 */
const FlashSaleBanner = ({ 
  endTime, // Date object or timestamp
  title = 'Flash Sale!',
  subtitle = 'Csak ma! Akár 50% kedvezmény',
  products = [], // Featured sale products
  onViewSale,
  onDismiss,
  variant = 'banner' // 'banner' | 'floating' | 'inline'
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  function calculateTimeLeft() {
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

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
    if (onDismiss) onDismiss();
  };

  if (isDismissed || isExpired) return null;

  const formatNumber = (num) => String(num).padStart(2, '0');

  // Floating variant
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-24 left-4 z-50 animate-bounce-in">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl shadow-2xl max-w-xs">
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-600 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">{title}</p>
              <p className="text-xs text-white/80">{subtitle}</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex justify-center gap-2 mb-3">
            {[
              { value: timeLeft.hours, label: 'óra' },
              { value: timeLeft.minutes, label: 'perc' },
              { value: timeLeft.seconds, label: 'mp' }
            ].map((unit, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[50px]">
                  <span className="text-2xl font-bold tabular-nums">{formatNumber(unit.value)}</span>
                </div>
                <span className="text-[10px] text-white/70 mt-1">{unit.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onViewSale}
            className="w-full py-2.5 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            Megnézem <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-[2px] rounded-2xl">
        <div className="bg-white rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Countdown */}
              <div className="flex gap-2">
                {[
                  { value: timeLeft.hours, label: 'Ó' },
                  { value: timeLeft.minutes, label: 'P' },
                  { value: timeLeft.seconds, label: 'MP' }
                ].map((unit, idx) => (
                  <React.Fragment key={idx}>
                    <div className="text-center">
                      <div className="bg-gray-900 text-white rounded-lg px-3 py-2 min-w-[48px]">
                        <span className="text-xl font-bold tabular-nums">{formatNumber(unit.value)}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1">{unit.label}</span>
                    </div>
                    {idx < 2 && <span className="text-2xl font-bold text-gray-300 self-start mt-2">:</span>}
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={onViewSale}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Akciók <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default banner variant
  return (
    <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-4 text-white">
            <div className="hidden sm:flex w-14 h-14 bg-white/20 backdrop-blur rounded-2xl items-center justify-center animate-bounce">
              <Zap className="w-7 h-7" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Zap className="w-5 h-5 sm:hidden" />
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{title}</h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base">{subtitle}</p>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-white/80 hidden sm:block" />
            <div className="flex gap-1.5 sm:gap-2">
              {[
                { value: timeLeft.hours, label: 'óra' },
                { value: timeLeft.minutes, label: 'perc' },
                { value: timeLeft.seconds, label: 'mp' }
              ].map((unit, idx) => (
                <React.Fragment key={idx}>
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2">
                      <span className="text-xl sm:text-3xl font-black text-white tabular-nums">
                        {formatNumber(unit.value)}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-white/70 font-medium">{unit.label}</span>
                  </div>
                  {idx < 2 && (
                    <span className="text-xl sm:text-2xl font-bold text-white/50 self-start mt-1.5 sm:mt-2">:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: CTA */}
          <button
            onClick={onViewSale}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Gift className="w-5 h-5" />
            <span>Akciók</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default FlashSaleBanner;
