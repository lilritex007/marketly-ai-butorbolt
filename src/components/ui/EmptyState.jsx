import React from 'react';
import { Search, Heart, Package, Camera } from 'lucide-react';

/**
 * Empty state component for various scenarios
 */
export const EmptyState = ({ 
  type = 'products', 
  title, 
  description, 
  action, 
  onAction 
}) => {
  const configs = {
    products: {
      icon: <Search className="w-16 h-16" />,
      title: title || 'Nincs találat',
      description: description || 'Próbálj meg más keresési kifejezést használni, vagy böngészd a kategóriákat.',
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    wishlist: {
      icon: <Heart className="w-16 h-16" />,
      title: title || 'Üres a kívánságlistád',
      description: description || 'Még nem mentettél el kedvenc termékeket. Kezdj el böngészni!',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    category: {
      icon: <Package className="w-16 h-16" />,
      title: title || 'Ebben a kategóriában nincsenek termékek',
      description: description || 'Hamarosan új termékekkel bővülünk. Nézz vissza később!',
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    upload: {
      icon: <Camera className="w-16 h-16" />,
      title: title || 'Tölts fel egy képet',
      description: description || 'Használd az AI képkeresőt hogy megtaláld a hasonló termékeket.',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  };

  const config = configs[type] || configs.products;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className={`${config.bgColor} ${config.iconColor} rounded-full p-6 mb-6`}>
        {config.icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{config.title}</h3>
      <p className="text-gray-500 max-w-md mb-8">{config.description}</p>
      {action && onAction && (
        <button 
          onClick={onAction}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
        >
          {action}
        </button>
      )}
    </div>
  );
};
