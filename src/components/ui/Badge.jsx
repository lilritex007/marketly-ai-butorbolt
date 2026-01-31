import React from 'react';
import { 
  Sparkles, Flame, Star, TrendingUp, Clock, Tag, 
  Percent, Package, Truck, Shield, Award, Zap
} from 'lucide-react';

/**
 * Modern Badge Components
 * Consistent, accessible product badges with animations
 */

// Base Badge Component
export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'sm',
  icon: Icon,
  pulse = false,
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
    gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
    outline: 'bg-transparent border-2 border-current'
  };

  // UNIFIED TYPOGRAPHY SCALE - Comfortable readable sizes
  const sizes = {
    xs: 'text-sm px-2.5 py-1',              // 14px - small but readable
    sm: 'text-sm sm:text-base px-3 py-1.5', // 14-16px - standard badge
    md: 'text-base sm:text-lg px-4 py-2',   // 16-18px - prominent
    lg: 'text-lg sm:text-xl px-5 py-2.5'    // 18-20px - hero badges
  };

  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-4 h-4 sm:w-5 sm:h-5',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-6 h-6'
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-semibold rounded-full
      ${variants[variant]} ${sizes[size]}
      ${pulse ? 'animate-pulse' : ''}
      ${className}
    `}>
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  );
};

// New Product Badge
export const NewBadge = ({ size = 'sm' }) => (
  <Badge variant="primary" size={size} icon={Sparkles}>
    ÚJ
  </Badge>
);

// Sale/Discount Badge
export const DiscountBadge = ({ percent, size = 'sm' }) => (
  <Badge variant="danger" size={size} icon={Percent}>
    -{percent}%
  </Badge>
);

// Hot/Popular Badge
export const HotBadge = ({ size = 'sm' }) => (
  <Badge variant="warning" size={size} icon={Flame} pulse>
    Népszerű
  </Badge>
);

// Bestseller Badge
export const BestsellerBadge = ({ size = 'sm' }) => (
  <Badge variant="gradient" size={size} icon={Award}>
    Bestseller
  </Badge>
);

// Trending Badge
export const TrendingBadge = ({ size = 'sm' }) => (
  <Badge variant="purple" size={size} icon={TrendingUp}>
    Trend
  </Badge>
);

// Limited Badge
export const LimitedBadge = ({ size = 'sm' }) => (
  <Badge variant="pink" size={size} icon={Clock}>
    Limitált
  </Badge>
);

// Free Shipping Badge
export const FreeShippingBadge = ({ size = 'sm' }) => (
  <Badge variant="success" size={size} icon={Truck}>
    Ingyenes szállítás
  </Badge>
);

// Stock Badge
export const StockBadge = ({ inStock, quantity, size = 'sm' }) => {
  if (!inStock || quantity === 0) {
    return (
      <Badge variant="default" size={size}>
        Elfogyott
      </Badge>
    );
  }
  
  if (quantity && quantity <= 5) {
    return (
      <Badge variant="warning" size={size} icon={Package}>
        Csak {quantity} db
      </Badge>
    );
  }
  
  return (
    <Badge variant="success" size={size} icon={Package}>
      Készleten
    </Badge>
  );
};

// Rating Badge
export const RatingBadge = ({ rating, count, size = 'sm' }) => (
  <Badge variant="warning" size={size} icon={Star}>
    {rating?.toFixed(1) || '5.0'} {count && `(${count})`}
  </Badge>
);

// Premium/Quality Badge
export const PremiumBadge = ({ size = 'sm' }) => (
  <Badge variant="gradient" size={size} icon={Shield}>
    Prémium
  </Badge>
);

// Fast Delivery Badge  
export const FastDeliveryBadge = ({ size = 'sm' }) => (
  <Badge variant="success" size={size} icon={Zap}>
    24h szállítás
  </Badge>
);

// Price Drop Badge
export const PriceDropBadge = ({ size = 'sm' }) => (
  <Badge variant="danger" size={size} icon={Tag}>
    Áresés
  </Badge>
);

// Smart Badge - automatically determines which badge to show
// Uses sm size for READABLE badges
export const SmartBadges = ({ product, maxBadges = 2 }) => {
  const badges = [];
  
  // Check for new (last 7 days)
  if (product.createdAt) {
    const daysSinceCreation = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 7) {
      badges.push({ component: NewBadge, priority: 3 });
    }
  }
  
  // Check for discount
  if (product.salePrice && product.price > product.salePrice) {
    const percent = Math.round(((product.price - product.salePrice) / product.price) * 100);
    if (percent >= 10) {
      badges.push({ 
        component: ({ size }) => <DiscountBadge percent={percent} size={size} />, 
        priority: 5 
      });
    }
  }
  
  // Check for popularity (if we have sales data)
  if (product.salesCount && product.salesCount > 50) {
    badges.push({ component: HotBadge, priority: 2 });
  }
  
  // Check for low stock
  if (product.inStock && product.quantity && product.quantity <= 5 && product.quantity > 0) {
    badges.push({ component: LimitedBadge, priority: 4 });
  }
  
  // Check for bestseller
  if (product.isBestseller) {
    badges.push({ component: BestsellerBadge, priority: 6 });
  }
  
  // Check for free shipping
  if (product.freeShipping) {
    badges.push({ component: FreeShippingBadge, priority: 1 });
  }
  
  // Sort by priority and take top badges
  const topBadges = badges
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxBadges);
  
  if (topBadges.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      {topBadges.map((badge, idx) => (
        <badge.component key={idx} size="sm" />
      ))}
    </div>
  );
};

export default {
  Badge,
  NewBadge,
  DiscountBadge,
  HotBadge,
  BestsellerBadge,
  TrendingBadge,
  LimitedBadge,
  FreeShippingBadge,
  StockBadge,
  RatingBadge,
  PremiumBadge,
  FastDeliveryBadge,
  PriceDropBadge,
  SmartBadges
};
