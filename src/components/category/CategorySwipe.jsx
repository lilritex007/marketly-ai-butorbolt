import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, Sparkles } from 'lucide-react';

/**
 * CategorySwipe - Swipeable Category Navigation
 * Mobile: Swipe gestures
 * Desktop: Click navigation + keyboard
 */
const CategorySwipe = ({ categories, activeCategory, onCategoryChange }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [direction, setDirection] = useState(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const activeCategoryIndex = categories.findIndex(cat => cat.id === activeCategory);

  const goToCategory = (index) => {
    if (index >= 0 && index < categories.length) {
      onCategoryChange(categories[index].id);
      
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const nextCategory = () => {
    const nextIndex = activeCategoryIndex + 1;
    if (nextIndex < categories.length) {
      setDirection(1);
      goToCategory(nextIndex);
    }
  };

  const prevCategory = () => {
    const prevIndex = activeCategoryIndex - 1;
    if (prevIndex >= 0) {
      setDirection(-1);
      goToCategory(prevIndex);
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextCategory();
    }
    if (isRightSwipe) {
      prevCategory();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevCategory();
      } else if (e.key === 'ArrowRight') {
        nextCategory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCategoryIndex]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-6 px-4 rounded-2xl shadow-lg mb-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Kategóriák</h3>
          </div>
          <span className="text-sm text-gray-500">
            {activeCategoryIndex + 1} / {categories.length}
          </span>
        </div>

        {/* Mobile swipe hint (only shown on first visit) */}
        <div className="md:hidden text-center mb-2">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Csúsztass balra/jobbra
            <ChevronRight className="w-4 h-4" />
          </p>
        </div>

        {/* Category Container */}
        <div 
          className="relative h-32 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Previous Button (Desktop) */}
          <button
            onClick={prevCategory}
            disabled={activeCategoryIndex === 0}
            className={`
              hidden md:flex absolute left-0 z-20 p-3 rounded-full bg-white shadow-lg
              transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed
              ${activeCategoryIndex === 0 ? '' : 'hover:bg-indigo-50'}
            `}
            aria-label="Előző kategória"
          >
            <ChevronLeft className="w-6 h-6 text-indigo-600" />
          </button>

          {/* Active Category (Animated) */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeCategory}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="flex flex-col items-center justify-center w-full max-w-md mx-auto"
            >
              {/* Category Icon/Image */}
              <div className="w-20 h-20 mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
                {categories[activeCategoryIndex]?.id === 'all' ? (
                  <Home className="w-10 h-10 text-white" />
                ) : (
                  <span className="text-3xl">{categories[activeCategoryIndex]?.icon || '📦'}</span>
                )}
              </div>

              {/* Category Name */}
              <h4 className="text-2xl font-bold text-gray-800 mb-1">
                {categories[activeCategoryIndex]?.name}
              </h4>

              {/* Category Count - displayed / total */}
              <p className="text-sm text-gray-500">
                {categories[activeCategoryIndex]?.displayedCount || 0} / {categories[activeCategoryIndex]?.totalCount || 0} termék
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Next Button (Desktop) */}
          <button
            onClick={nextCategory}
            disabled={activeCategoryIndex === categories.length - 1}
            className={`
              hidden md:flex absolute right-0 z-20 p-3 rounded-full bg-white shadow-lg
              transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed
              ${activeCategoryIndex === categories.length - 1 ? '' : 'hover:bg-indigo-50'}
            `}
            aria-label="Következő kategória"
          >
            <ChevronRight className="w-6 h-6 text-indigo-600" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => {
                setDirection(index > activeCategoryIndex ? 1 : -1);
                goToCategory(index);
              }}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === activeCategoryIndex 
                  ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-600' 
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`${category.name} kategória`}
            />
          ))}
        </div>

        {/* Quick Category Pills (Desktop) */}
        <div className="hidden lg:flex flex-wrap justify-center gap-2 mt-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setDirection(categories.findIndex(c => c.id === category.id) > activeCategoryIndex ? 1 : -1);
                onCategoryChange(category.id);
              }}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${category.id === activeCategory
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }
              `}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default CategorySwipe;
