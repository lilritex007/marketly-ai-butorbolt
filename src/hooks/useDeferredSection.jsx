import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_ROOT_MARGIN = '200px';
const DEFAULT_THRESHOLD = 0;

/**
 * useDeferredSection - IntersectionObserver-based deferred mount.
 * Children mount only when the wrapper is near the viewport (rootMargin).
 * @param {Object} options - { rootMargin, threshold }
 * @returns {[React.RefObject, boolean]} - [ref to attach to wrapper, shouldMount]
 */
export function useDeferredSection(options = {}) {
  const { rootMargin = DEFAULT_ROOT_MARGIN, threshold = DEFAULT_THRESHOLD } = options;
  const [shouldMount, setShouldMount] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || shouldMount) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldMount(true);
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, shouldMount]);

  return [ref, shouldMount];
}

/**
 * DeferredSection - Wrapper that defers rendering children until near viewport.
 * Uses a minimal sentinel (min-height) when not mounted so IntersectionObserver can fire.
 */
export function DeferredSection({ children, rootMargin = '200px', threshold = 0, fallback = null, className = '', minHeight = '100px', ...rest }) {
  const [ref, shouldMount] = useDeferredSection({ rootMargin, threshold });
  const content = shouldMount ? children : (fallback ?? <div style={{ minHeight }} aria-hidden="true" />);
  return (
    <div ref={ref} className={className} {...rest}>
      {content}
    </div>
  );
}
