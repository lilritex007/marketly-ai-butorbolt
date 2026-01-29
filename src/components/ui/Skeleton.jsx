import React from 'react';

/**
 * Modern Skeleton Loading Components
 * Shimmer effect with smooth animations
 */

// Base skeleton with shimmer
export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer';
  
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
    rounded: 'rounded-xl'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full">
    {/* Image placeholder */}
    <div className="aspect-square relative overflow-hidden bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      {/* Fake badge */}
      <div className="absolute top-3 left-3">
        <Skeleton className="w-12 h-5 rounded-full" />
      </div>
      {/* Fake wishlist button */}
      <div className="absolute top-3 right-3">
        <Skeleton variant="circular" className="w-10 h-10" />
      </div>
    </div>
    
    {/* Content */}
    <div className="p-3 sm:p-4 lg:p-5 space-y-3">
      {/* Category */}
      <Skeleton className="w-16 h-3" />
      
      {/* Title - 2 lines */}
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
      
      {/* Price section */}
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-20 h-6" />
        </div>
        <Skeleton variant="circular" className="w-10 h-10" />
      </div>
    </div>
  </div>
);

// Grid of Product Skeletons
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="product-grid">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Category Pills Skeleton
export const CategorySkeleton = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-6 p-4">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" className="w-10 h-10" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-16 h-3 hidden sm:block" />
        </div>
      </div>
      <div className="space-y-1 text-right">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
    
    {/* Pills */}
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="rounded" 
          className="h-10"
          style={{ width: `${60 + Math.random() * 40}px` }}
        />
      ))}
    </div>
  </div>
);

// Search Bar Skeleton
export const SearchSkeleton = () => (
  <div className="relative">
    <Skeleton variant="rounded" className="w-full h-12" />
  </div>
);

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
    <div className="text-center space-y-6 max-w-2xl">
      <Skeleton className="w-40 h-8 mx-auto rounded-full" />
      <div className="space-y-3">
        <Skeleton className="w-full h-12 mx-auto" />
        <Skeleton className="w-3/4 h-12 mx-auto" />
      </div>
      <Skeleton className="w-2/3 h-6 mx-auto" />
      <div className="flex gap-4 justify-center pt-4">
        <Skeleton variant="rounded" className="w-40 h-14" />
        <Skeleton variant="rounded" className="w-40 h-14" />
      </div>
    </div>
  </div>
);

// Inline Content Skeleton (for text areas)
export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        className={i === lines - 1 ? 'w-2/3' : 'w-full'}
      />
    ))}
  </div>
);

// Stats Card Skeleton
export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-6 text-center">
        <Skeleton variant="circular" className="w-10 h-10 mx-auto mb-3" />
        <Skeleton className="w-16 h-8 mx-auto mb-2" />
        <Skeleton className="w-20 h-4 mx-auto" />
      </div>
    ))}
  </div>
);

export default {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  CategorySkeleton,
  SearchSkeleton,
  HeroSkeleton,
  TextSkeleton,
  StatsSkeleton
};
