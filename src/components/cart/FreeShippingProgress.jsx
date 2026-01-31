import React, { useMemo } from 'react';
import { Truck, Check, Gift, Sparkles, PartyPopper } from 'lucide-react';

/**
 * FreeShippingProgress - Progress bar to free shipping threshold
 * Motivates customers to add more to cart
 */
const FreeShippingProgress = ({ 
  currentTotal = 0,
  threshold = 50000,
  variant = 'default', // 'default' | 'compact' | 'celebration'
  className = ''
}) => {
  const progress = useMemo(() => {
    return Math.min(100, (currentTotal / threshold) * 100);
  }, [currentTotal, threshold]);

  const remaining = Math.max(0, threshold - currentTotal);
  const isFreeShipping = currentTotal >= threshold;

  // Milestone markers
  const milestones = [
    { percent: 50, label: '50%' },
    { percent: 75, label: '75%' },
    { percent: 100, icon: Truck },
  ];

  // Compact variant for header/mini cart
  if (variant === 'compact') {
    if (isFreeShipping) {
      return (
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full ${className}`}>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-xs font-bold text-green-700">Ingyenes szállítás!</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 whitespace-nowrap">
          -{remaining.toLocaleString()} Ft
        </span>
      </div>
    );
  }

  // Celebration variant when threshold reached
  if (variant === 'celebration' && isFreeShipping) {
    return (
      <div className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <PartyPopper className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Gratulálunk!</h4>
            <p className="text-white/90 text-sm">A szállítás ingyenes a rendelésedre!</p>
          </div>
        </div>
      </div>
    );
  }

  // Default full variant
  return (
    <div className={`bg-gradient-to-r from-gray-50 to-primary-50 rounded-2xl p-4 border border-gray-100 ${className}`}>
      {isFreeShipping ? (
        // Free shipping achieved
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-green-700 flex items-center gap-2">
              Ingyenes szállítás!
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </h4>
            <p className="text-sm text-gray-600">A rendelésed értéke elérte az {threshold.toLocaleString()} Ft-ot</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-500" />
              <span className="font-medium text-gray-900 text-sm">Ingyenes szállítás</span>
            </div>
            <span className="text-sm text-gray-600">
              <span className="font-bold text-primary-600">{remaining.toLocaleString()} Ft</span> hiányzik
            </span>
          </div>

          {/* Progress Bar with Milestones */}
          <div className="relative">
            {/* Track */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-green-500 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Milestones */}
            <div className="absolute inset-0 flex items-center">
              {milestones.map((milestone, idx) => (
                <div 
                  key={idx}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${milestone.percent}%` }}
                >
                  {milestone.icon ? (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      progress >= milestone.percent 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}>
                      <milestone.icon className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${
                      progress >= milestone.percent ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{currentTotal.toLocaleString()} Ft</span>
            <span>{threshold.toLocaleString()} Ft</span>
          </div>

          {/* Motivational Message */}
          {progress >= 75 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Már majdnem ott vagy! Adj hozzá még {remaining.toLocaleString()} Ft-ot!
              </span>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};

export default FreeShippingProgress;
