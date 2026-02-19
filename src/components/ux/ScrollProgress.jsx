import React, { useState, useEffect } from 'react';

/**
 * ScrollProgress - Shows reading/scrolling progress at top of page
 * Gradient bar that fills as user scrolls down
 */
const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId = null;
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };
    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        updateScrollProgress();
        rafId = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress();
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/50">
      <div
        className="h-full bg-gradient-to-r from-primary-500 via-secondary-600 to-pink-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
      {/* Glow effect at the end */}
      {scrollProgress > 0 && (
        <div
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 blur-sm"
          style={{ 
            left: `${Math.max(0, scrollProgress - 2)}%`,
            transition: 'left 150ms ease-out'
          }}
        />
      )}
    </div>
  );
};

export default ScrollProgress;
