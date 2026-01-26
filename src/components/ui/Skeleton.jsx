import React from 'react';

/**
 * Skeleton loader component for loading states
 */
export const Skeleton = ({ className = "", variant = "default" }) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";
  
  const variants = {
    default: "rounded",
    text: "rounded h-4 w-full",
    title: "rounded h-6 w-3/4",
    circle: "rounded-full",
    card: "rounded-2xl h-80 w-full",
    avatar: "rounded-full h-10 w-10"
  };
  
  return (
    <div 
      className={`${baseClasses} ${variants[variant] || variants.default} ${className}`}
      style={{ animation: 'shimmer 2s infinite linear' }}
    />
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4">
    <Skeleton variant="card" className="mb-4" />
    <Skeleton variant="title" className="mb-2" />
    <Skeleton variant="text" className="mb-4 w-1/2" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-20" />
      <Skeleton variant="circle" className="h-10 w-10" />
    </div>
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="flex justify-start">
    <div className="max-w-[85%] bg-white border rounded-2xl p-3">
      <Skeleton variant="text" className="mb-2" />
      <Skeleton variant="text" className="w-3/4" />
    </div>
  </div>
);

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}
