import { useState, useEffect, useRef } from 'react';

/**
 * CountUp animation component
 * Counts from 0 to target value with easing
 */
export const CountUp = ({ end, duration = 2000, suffix = '', decimals = 0, start = 0, delay = 0 }) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(null);
  const hasStarted = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      observer.disconnect();
    };
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const diff = end - start;

    const easeOutQuad = (t) => t * (2 - t);

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const current = start + diff * easedProgress;

      setCount(current);

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [isVisible, end, start, duration]);

  const formatNumber = (num) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.floor(num).toLocaleString('hu-HU');
  };

  return (
    <span ref={countRef}>
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

export default CountUp;
