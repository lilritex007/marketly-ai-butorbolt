import React, { useState } from 'react';
import { Heart, BarChart2, Share2, Bell, Eye, Ruler, Palette, Check, X } from 'lucide-react';

/**
 * QuickActionsBar - Floating action bar for product pages
 * Features: Wishlist, Compare, Share, Price Alert, Quick View
 */
const QuickActionsBar = ({ 
  product,
  isWishlisted = false,
  isComparing = false,
  onWishlist,
  onCompare,
  onShare,
  onPriceAlert,
  onQuickView,
  onDimensionView,
  variant = 'horizontal' // 'horizontal' | 'vertical'
}) => {
  const [activeAction, setActiveAction] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);

  const actions = [
    {
      id: 'wishlist',
      icon: Heart,
      label: isWishlisted ? 'Eltávolítás' : 'Kedvencekhez',
      color: isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50',
      activeColor: 'bg-red-500 text-white',
      isActive: isWishlisted,
      fill: isWishlisted,
      onClick: () => onWishlist?.(product.id)
    },
    {
      id: 'compare',
      icon: BarChart2,
      label: isComparing ? 'Eltávolítás' : 'Összehasonlítás',
      color: isComparing ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50',
      activeColor: 'bg-blue-500 text-white',
      isActive: isComparing,
      onClick: () => onCompare?.(product)
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Megosztás',
      color: 'text-gray-600 hover:text-green-500 hover:bg-green-50',
      onClick: () => onShare?.(product)
    },
    {
      id: 'alert',
      icon: Bell,
      label: 'Árfigyelő',
      color: 'text-gray-600 hover:text-amber-500 hover:bg-amber-50',
      onClick: () => onPriceAlert?.(product)
    },
    {
      id: 'dimensions',
      icon: Ruler,
      label: 'Méretek',
      color: 'text-gray-600 hover:text-secondary-600 hover:bg-secondary-50',
      onClick: () => onDimensionView?.(product)
    }
  ];

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleAction = (action) => {
    triggerHaptic();
    setActiveAction(action.id);
    action.onClick?.();
    
    setTimeout(() => setActiveAction(null), 300);
  };

  // Vertical variant (for sidebar)
  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-2 p-2 bg-white rounded-2xl shadow-lg border border-gray-100">
        {actions.map((action) => (
          <div key={action.id} className="relative">
            <button
              onClick={() => handleAction(action)}
              onMouseEnter={() => setShowTooltip(action.id)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`
                relative p-3 rounded-xl transition-all duration-200
                ${action.isActive ? action.activeColor : action.color}
                ${activeAction === action.id ? 'scale-90' : 'hover:scale-105'}
              `}
            >
              <action.icon 
                className="w-5 h-5" 
                fill={action.fill ? 'currentColor' : 'none'}
              />
              {action.isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
            
            {/* Tooltip */}
            {showTooltip === action.id && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-10">
                {action.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className="flex items-center gap-1 p-1.5 bg-white rounded-full shadow-lg border border-gray-100">
      {actions.map((action, index) => (
        <React.Fragment key={action.id}>
          <button
            onClick={() => handleAction(action)}
            className={`
              relative p-2.5 rounded-full transition-all duration-200
              ${action.isActive ? action.activeColor : action.color}
              ${activeAction === action.id ? 'scale-90' : 'hover:scale-110'}
            `}
            title={action.label}
          >
            <action.icon 
              className="w-5 h-5" 
              fill={action.fill ? 'currentColor' : 'none'}
            />
            {action.isActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </button>
          
          {index < actions.length - 1 && (
            <div className="w-px h-6 bg-gray-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * FloatingQuickActions - Fixed position quick actions
 */
export const FloatingQuickActions = (props) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div 
      className={`
        fixed left-4 top-1/2 -translate-y-1/2 z-40
        transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}
    >
      <QuickActionsBar {...props} variant="vertical" />
      
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white rounded-r-lg shadow-lg border border-l-0 border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
      >
        {isVisible ? <X className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  );
};

export default QuickActionsBar;
