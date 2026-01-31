import React, { useState, useEffect } from 'react';

/**
 * ScrollProgress - Shows reading/scrolling progress at top of page
 * Gradient bar that fills as user scrolls down
 */
const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call

    return () => window.removeEventListener('scroll', updateScrollProgress);
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
