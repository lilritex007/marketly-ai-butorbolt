import React from 'react';
import { Sparkles, Zap, Star, TrendingUp } from 'lucide-react';

/**
 * Badge component for labels and tags
 */
export const Badge = ({ children, variant = 'default', size = 'md', icon }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    ai: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 border border-indigo-200',
    new: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
    sale: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    premium: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide ${variants[variant]} ${sizes[size]}`}>
      {icon}
      {children}
    </span>
  );
};

/**
 * AI-specific badge with sparkles
 */
export const AIBadge = ({ children = 'AI', size = 'md', animate = false }) => (
  <Badge variant="ai" size={size} icon={<Sparkles className={`w-3 h-3 ${animate ? 'animate-pulse' : ''}`} />}>
    {children}
  </Badge>
);

/**
 * Stock badge with dynamic colors
 */
export const StockBadge = ({ inStock, count }) => {
  if (!inStock) {
    return <Badge variant="error" size="sm">Készlethiány</Badge>;
  }
  if (count && count <= 5) {
    return <Badge variant="warning" size="sm">Csak {count} db!</Badge>;
  }
  return <Badge variant="success" size="sm" icon={<Zap className="w-3 h-3" />}>Raktáron</Badge>;
};

/**
 * Discount badge
 */
export const DiscountBadge = ({ percent }) => (
  <Badge variant="sale" size="sm">
    -{percent}%
  </Badge>
);

/**
 * New product badge
 */
export const NewBadge = () => (
  <Badge variant="new" size="sm" icon={<Star className="w-3 h-3 fill-current" />}>
    ÚJ
  </Badge>
);

/**
 * Trending badge
 */
export const TrendingBadge = () => (
  <Badge variant="premium" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
    Népszerű
  </Badge>
);
