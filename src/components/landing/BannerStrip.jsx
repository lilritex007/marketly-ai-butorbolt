import React, { useState, useEffect } from 'react';
import { Truck, Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'marketly_banner_dismissed';

/**
 * Promo / trust strip – one line, dismissible (session or localStorage)
 */
export const BannerStrip = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      setDismissed(stored === '1');
    } catch (_) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (_) {}
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4">
      <div className="container-app flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Truck className="w-5 h-5 flex-shrink-0 hidden sm:block" />
          <span className="text-sm font-medium truncate">
            Ingyenes szállítás 50 000 Ft felett
          </span>
          <span className="hidden md:inline text-white/80 text-sm">|</span>
          <span className="hidden md:inline text-sm text-white/90">
            AI ajánlás 24/7
          </span>
          <Sparkles className="w-4 h-4 flex-shrink-0 hidden md:block text-white/80" />
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label="Üzenet bezárása"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
