import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useScrollPastPercent } from '../../hooks/useScrollPosition';

/**
 * BackToTop - Floating button to scroll back to top
 * Only appears after scrolling down 30%. Uses shared scroll hook.
 */
const BackToTop = () => {
  const isVisible = useScrollPastPercent(30);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="
        fixed bottom-[calc(5rem+44px)] md:bottom-24 right-4 md:right-6 z-40
        w-11 h-11 md:w-12 md:h-12 rounded-full min-w-[44px] min-h-[44px]
        bg-gradient-to-br from-primary-500 to-secondary-700
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:shadow-xl
        active:scale-95
        animate-fade-in-up
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
      "
      aria-label="Vissza a tetejére"
      title="Vissza a tetejére"
    >
      <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
      
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-primary-500 opacity-0 animate-ping" />
    </button>
  );
};

export default BackToTop;
