import React from 'react';
import { 
  Search, Package, Heart, ShoppingCart, Filter, 
  FolderOpen, AlertCircle, RefreshCw, ArrowRight,
  Sparkles, Frown
} from 'lucide-react';

/**
 * Modern Empty State Components
 * Beautiful, helpful empty states with actions
 */

// Base Empty State
export const EmptyState = ({ 
  icon: Icon = Package,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-12 h-12',
      iconWrapper: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm'
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16',
      iconWrapper: 'w-24 h-24',
      title: 'text-lg',
      description: 'text-base',
      button: 'px-5 py-2.5 text-sm'
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20',
      iconWrapper: 'w-32 h-32',
      title: 'text-xl',
      description: 'text-lg',
      button: 'px-6 py-3 text-base'
    }
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${s.container} ${className}`}>
      {/* Animated Icon Container */}
      <div className={`
        ${s.iconWrapper} rounded-full 
        bg-gradient-to-br from-gray-100 to-gray-50 
        flex items-center justify-center mb-6
        relative overflow-hidden
      `}>
        {/* Subtle animation ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 animate-spin-slow" />
        <Icon className={`${s.icon} text-gray-400`} />
      </div>

      {/* Title */}
      {title && (
        <h3 className={`${s.title} font-bold text-gray-900 mb-2`}>
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className={`${s.description} text-gray-500 max-w-md mb-6`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={`
                ${s.button} min-h-[44px]
                bg-primary-500 text-white font-semibold rounded-xl
                hover:bg-primary-600 transition-colors
                flex items-center justify-center gap-2
              `}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={`
                ${s.button} min-h-[44px]
                bg-gray-100 text-gray-700 font-semibold rounded-xl
                hover:bg-gray-200 transition-colors
                flex items-center justify-center gap-2
              `}
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

// No Search Results
export const NoSearchResults = ({ query, onClear, onSuggest }) => (
  <EmptyState
    icon={Search}
    title={`Nincs találat: "${query}"`}
    description="Próbálj más kulcsszavakat használni, vagy böngéssz a kategóriák között."
    action={onClear && {
      label: 'Keresés törlése',
      icon: RefreshCw,
      onClick: onClear
    }}
    secondaryAction={onSuggest && {
      label: 'AI javaslatok',
      icon: Sparkles,
      onClick: onSuggest
    }}
  />
);

// No Products in Category
export const NoCategoryProducts = ({ category, onShowAll }) => (
  <EmptyState
    icon={FolderOpen}
    title={`Nincs termék: ${category}`}
    description="Ez a kategória jelenleg üres. Nézd meg a többi kategóriát!"
    action={onShowAll && {
      label: 'Összes termék',
      icon: ArrowRight,
      onClick: onShowAll
    }}
  />
);

// Empty Wishlist
export const EmptyWishlist = ({ onBrowse }) => (
  <EmptyState
    icon={Heart}
    title="Üres a kívánságlistád"
    description="Még nem adtál hozzá termékeket. Böngéssz és jelöld meg kedvenceidet!"
    action={onBrowse && {
      label: 'Böngészés',
      icon: ArrowRight,
      onClick: onBrowse
    }}
  />
);

// Empty Cart
export const EmptyCart = ({ onBrowse }) => (
  <EmptyState
    icon={ShoppingCart}
    title="Üres a kosarad"
    description="Még nem tettél semmit a kosárba. Fedezd fel kínálatunkat!"
    action={onBrowse && {
      label: 'Vásárlás',
      icon: ArrowRight,
      onClick: onBrowse
    }}
  />
);

// No Filter Results
export const NoFilterResults = ({ onClearFilters }) => (
  <EmptyState
    icon={Filter}
    title="Nincs találat a szűrésre"
    description="A megadott szűrőknek egyetlen termék sem felel meg. Próbáld lazítani a feltételeket."
    action={onClearFilters && {
      label: 'Szűrők törlése',
      icon: RefreshCw,
      onClick: onClearFilters
    }}
  />
);

// Error State
export const ErrorState = ({ message, onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Hiba történt"
    description={message || "Valami nem sikerült. Kérlek próbáld újra!"}
    action={onRetry && {
      label: 'Újrapróbálás',
      icon: RefreshCw,
      onClick: onRetry
    }}
  />
);

// Coming Soon
export const ComingSoon = ({ feature }) => (
  <EmptyState
    icon={Sparkles}
    title="Hamarosan"
    description={feature ? `${feature} - dolgozunk rajta!` : "Ez a funkció hamarosan elérhető!"}
  />
);

// Not Found (404)
export const NotFound = ({ onGoHome }) => (
  <EmptyState
    icon={Frown}
    title="Az oldal nem található"
    description="A keresett oldal nem létezik vagy áthelyezésre került."
    action={onGoHome && {
      label: 'Vissza a főoldalra',
      icon: ArrowRight,
      onClick: onGoHome
    }}
    size="lg"
  />
);

export default {
  EmptyState,
  NoSearchResults,
  NoCategoryProducts,
  EmptyWishlist,
  EmptyCart,
  NoFilterResults,
  ErrorState,
  ComingSoon,
  NotFound
};
