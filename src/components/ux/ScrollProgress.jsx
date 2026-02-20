import React from 'react';
import { useScrollPosition } from '../../hooks/useScrollPosition';

/**
 * ScrollProgress - Shows reading/scrolling progress at top of page
 * Gradient bar that fills as user scrolls down. Uses shared scroll hook.
 */
const ScrollProgress = () => {
  const { scrollPercent } = useScrollPosition();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/50">
      <div
        className="h-full bg-gradient-to-r from-primary-500 via-secondary-600 to-pink-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollPercent}%` }}
      />
      {/* Glow effect at the end */}
      {scrollPercent > 0 && (
        <div
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 blur-sm"
          style={{ 
            left: `${Math.max(0, scrollPercent - 2)}%`,
            transition: 'left 150ms ease-out'
          }}
        />
      )}
    </div>
  );
};

export default ScrollProgress;
