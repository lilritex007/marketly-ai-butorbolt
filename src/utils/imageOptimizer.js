import { useRef } from 'react';

/**
 * Image Optimization Utilities
 * WebP conversion, lazy loading, responsive images
 */

/**
 * Convert image URL to WebP format (if CDN supports it)
 * Falls back to original if WebP not supported
 */
export const toWebP = (imageUrl, quality = 80) => {
  if (!imageUrl) return '';
  
  // Check if browser supports WebP
  if (!isWebPSupported()) {
    return imageUrl;
  }

  // If it's already a WebP, return as is
  if (imageUrl.toLowerCase().endsWith('.webp')) {
    return imageUrl;
  }

  // For external CDNs that support WebP conversion via query params
  // Example: Cloudinary, Imgix, etc.
  // Adjust based on your CDN provider
  
  // Generic approach: if URL has query params, append format
  if (imageUrl.includes('?')) {
    return `${imageUrl}&format=webp&quality=${quality}`;
  }
  
  // Otherwise, try to replace extension (works if your server supports it)
  return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Check if browser supports WebP
 */
export const isWebPSupported = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for cached result
  if (window._webpSupport !== undefined) {
    return window._webpSupport;
  }

  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    // Check for WebP support
    const support = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    window._webpSupport = support;
    return support;
  }
  
  window._webpSupport = false;
  return false;
};

/**
 * Generate responsive image srcset
 * Creates multiple sizes for different screen resolutions
 */
export const getResponsiveSrcSet = (imageUrl, sizes = [400, 800, 1200]) => {
  if (!imageUrl) return '';
  
  return sizes
    .map(size => {
      const url = appendSizeParam(imageUrl, size);
      return `${url} ${size}w`;
    })
    .join(', ');
};

/**
 * Append size parameter to image URL
 */
const appendSizeParam = (imageUrl, width) => {
  if (imageUrl.includes('?')) {
    return `${imageUrl}&w=${width}`;
  }
  return `${imageUrl}?w=${width}`;
};

/**
 * Lazy load image with Intersection Observer.
 * Returns a ref callback. Callback receives element on mount and null on unmount.
 * Observer is disconnected when element is removed or component unmounts.
 */
export const useLazyLoad = () => {
  const observerRef = useRef(null);
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => {}; // no-op when IO unavailable
  }

  return (imageElement) => {
    const prev = observerRef.current;
    if (prev) {
      prev.disconnect();
      observerRef.current = null;
    }
    if (!imageElement || !(imageElement instanceof Element)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            const srcset = img.getAttribute('data-srcset');
            if (src) img.src = src;
            if (srcset) img.srcset = srcset;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px', threshold: 0.01 }
    );
    try {
      observer.observe(imageElement);
      observerRef.current = observer;
    } catch {
      observerRef.current = null;
    }
  };
};

/**
 * OptimizedImage Component Helper
 * Returns optimized image props
 */
export const getOptimizedImageProps = (imageUrl, alt = '', options = {}) => {
  const {
    width,
    height,
    quality = 80,
    lazy = true,
    responsive = true,
    className = ''
  } = options;

  const optimizedUrl = toWebP(imageUrl, quality);
  const props = {
    alt,
    className: `${className} ${lazy ? 'lazy' : ''}`,
    loading: lazy ? 'lazy' : 'eager',
    decoding: 'async'
  };

  if (responsive) {
    props.srcSet = getResponsiveSrcSet(optimizedUrl);
    props.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }

  if (lazy) {
    props['data-src'] = optimizedUrl;
    props.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3C/svg%3E'; // Placeholder
  } else {
    props.src = optimizedUrl;
  }

  if (width) props.width = width;
  if (height) props.height = height;

  return props;
};

/**
 * Preload critical images
 */
export const preloadImage = (imageUrl) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = toWebP(imageUrl);
  document.head.appendChild(link);
};

/**
 * Calculate image dimensions to maintain aspect ratio
 */
export const calculateAspectRatio = (originalWidth, originalHeight, maxWidth) => {
  const ratio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * ratio)
  };
};

/**
 * Image compression quality based on screen size
 */
export const getAdaptiveQuality = () => {
  if (typeof window === 'undefined') return 80;
  
  const width = window.innerWidth;
  
  if (width < 768) {
    return 70; // Mobile: lower quality
  } else if (width < 1920) {
    return 80; // Desktop: medium quality
  } else {
    return 90; // Large screens: high quality
  }
};

export default {
  toWebP,
  isWebPSupported,
  getResponsiveSrcSet,
  useLazyLoad,
  getOptimizedImageProps,
  preloadImage,
  calculateAspectRatio,
  getAdaptiveQuality
};
