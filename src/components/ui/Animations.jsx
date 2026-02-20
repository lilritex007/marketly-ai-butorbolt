import React, { useState, useEffect, useRef } from 'react';

/**
 * FadeInOnScroll - Animates children when they enter viewport
 */
export const FadeInOnScroll = ({ 
  children, 
  direction = 'up', // 'up', 'down', 'left', 'right', 'none'
  delay = 0,
  duration = 500,
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
    return undefined;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !(el instanceof Element)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    try {
      observer.observe(el);
    } catch (err) {
      return undefined;
    }
    return () => observer.disconnect();
  }, [threshold]);

  const getTransform = () => {
    if (isVisible || prefersReducedMotion) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up': return 'translate3d(0, 30px, 0)';
      case 'down': return 'translate3d(0, -30px, 0)';
      case 'left': return 'translate3d(30px, 0, 0)';
      case 'right': return 'translate3d(-30px, 0, 0)';
      default: return 'translate3d(0, 0, 0)';
    }
  };

  const visible = isVisible || prefersReducedMotion;
  const transition = prefersReducedMotion ? 'none' : `transform ${duration}ms ease-out ${delay}ms, opacity ${duration}ms ease-out ${delay}ms`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: getTransform(),
        opacity: visible ? 1 : 0,
        transition,
        willChange: prefersReducedMotion || visible ? 'auto' : 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

/**
 * StaggerChildren - Staggers animation of child elements
 */
export const StaggerChildren = ({ 
  children, 
  staggerDelay = 100,
  direction = 'up',
  duration = 400,
  className = ''
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeInOnScroll
          direction={direction}
          delay={index * staggerDelay}
          duration={duration}
        >
          {child}
        </FadeInOnScroll>
      ))}
    </div>
  );
};

/**
 * Confetti - Celebration animation for add to cart, etc.
 */
export const Confetti = ({ isActive, duration = 2000, onComplete }) => {
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Generate confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      size: Math.random() * 8 + 4,
      color: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 6)],
      speedX: (Math.random() - 0.5) * 3,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    }));

    setParticles(newParticles);

    const timeout = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timeout);
  }, [isActive, duration, onComplete]);

  useEffect(() => {
    if (particles.length === 0) return;

    let animationFrame;
    const animate = () => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          y: p.y + p.speedY,
          x: p.x + p.speedX,
          rotation: p.rotation + p.rotationSpeed
        })).filter(p => p.y < 110)
      );
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [particles.length > 0]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            opacity: 1 - (p.y / 110)
          }}
        />
      ))}
    </div>
  );
};

/**
 * PulseButton - Button with pulse animation
 */
export const PulseButton = ({ children, className = '', ...props }) => {
  return (
    <button 
      className={`relative ${className}`}
      {...props}
    >
      <span className="absolute inset-0 rounded-xl bg-current opacity-20 animate-ping" />
      {children}
    </button>
  );
};

/**
 * ShimmerText - Text with shimmer effect
 */
export const ShimmerText = ({ children, className = '' }) => {
  return (
    <span 
      className={`relative inline-block ${className}`}
      style={{
        background: 'linear-gradient(90deg, currentColor 0%, #a78bfa 50%, currentColor 100%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'shimmer 2s linear infinite'
      }}
    >
      {children}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </span>
  );
};

/**
 * FloatingElement - Gentle floating animation
 */
export const FloatingElement = ({ children, className = '', amplitude = 10, duration = 3 }) => {
  return (
    <div 
      className={className}
      style={{
        animation: `float ${duration}s ease-in-out infinite`
      }}
    >
      {children}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-${amplitude}px); }
        }
      `}</style>
    </div>
  );
};

/**
 * CountUp - Animated number counter
 */
export const CountUp = ({ end, duration = 2000, prefix = '', suffix = '', className = '' }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !(ref.current instanceof Element)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    try {
      observer.observe(ref.current);
    } catch (err) {
      return;
    }
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString('hu-HU')}{suffix}
    </span>
  );
};

/**
 * ProgressBar - Animated progress bar
 */
export const ProgressBar = ({ progress, className = '', color = 'primary' }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(progress), 100);
    return () => clearTimeout(timeout);
  }, [progress]);

  return (
    <div className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-500 rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export default {
  FadeInOnScroll,
  StaggerChildren,
  Confetti,
  PulseButton,
  ShimmerText,
  FloatingElement,
  CountUp,
  ProgressBar
};
