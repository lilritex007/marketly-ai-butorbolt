import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, Expand, Maximize2 } from 'lucide-react';

/**
 * ImageGallery - Professional product image gallery
 * Features: Zoom, Swipe, Thumbnails, Fullscreen
 */
const ImageGallery = ({ images = [], productName = 'Termék' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const mainImageRef = useRef(null);

  // Ensure we have at least one image
  const imageList = images.length > 0 ? images : ['data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f3f4f6" width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="16">Nincs kép</text></svg>'];
  
  const currentImage = imageList[currentIndex];

  // Navigation
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
    setIsZoomed(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    setIsZoomed(false);
  };

  // Zoom handling
  const handleMouseMove = (e) => {
    if (!mainImageRef.current || !isZoomed) return;
    
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Touch handling for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    
    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fullscreen Gallery Modal
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 lg:top-[60px] z-[100] bg-black flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Main Image */}
        <img
          src={currentImage}
          alt={`${productName} - ${currentIndex + 1}`}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
          {currentIndex + 1} / {imageList.length}
        </div>

        {/* Thumbnails */}
        {imageList.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
            {imageList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`
                  w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}
                `}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Image Container */}
      <div 
        ref={mainImageRef}
        className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in group"
        onClick={toggleZoom}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image */}
        <img
          src={currentImage}
          alt={`${productName} - ${currentIndex + 1}`}
          className={`
            w-full h-full object-contain transition-transform duration-300
            ${isZoomed ? 'scale-[2.5]' : 'group-hover:scale-105'}
          `}
          style={isZoomed ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          } : {}}
          onError={(e) => { 
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f3f4f6" width="400" height="400"/></svg>'; 
          }}
          draggable={false}
        />

        {/* Zoom indicator */}
        {!isZoomed && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4" />
            Kattints a nagyításhoz
          </div>
        )}

        {/* Navigation arrows */}
        {imageList.length > 1 && !isZoomed && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Fullscreen button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
          title="Teljes képernyő"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image counter badge */}
        {imageList.length > 1 && (
          <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/50 text-white text-xs rounded-full">
            {currentIndex + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsZoomed(false); }}
              className={`
                flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all
                ${idx === currentIndex 
                  ? 'border-primary-500 ring-2 ring-primary-200' 
                  : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                }
              `}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-contain bg-gray-50"
                onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots indicator (mobile) */}
      {imageList.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
          {imageList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`
                w-2 h-2 rounded-full transition-all
                ${idx === currentIndex ? 'bg-primary-500 w-6' : 'bg-gray-300'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
