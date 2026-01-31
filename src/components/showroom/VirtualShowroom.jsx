import React, { useState } from 'react';
import { Home, Bed, Sofa, UtensilsCrossed, Monitor, Move, Eye, ChevronLeft, ChevronRight, Package, Plus, X, Sparkles, RotateCcw } from 'lucide-react';

/**
 * VirtualShowroom - 360° room view with clickable furniture
 * Interactive room visualization with product placement
 */
const VirtualShowroom = ({ products = [], onProductClick, onAddToCart }) => {
  const [activeRoom, setActiveRoom] = useState('living');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [placedProducts, setPlacedProducts] = useState({});
  const [viewAngle, setViewAngle] = useState(0);

  const rooms = [
    { id: 'living', name: 'Nappali', icon: Sofa, color: 'from-amber-500 to-orange-500' },
    { id: 'bedroom', name: 'Hálószoba', icon: Bed, color: 'from-indigo-500 to-purple-500' },
    { id: 'dining', name: 'Étkező', icon: UtensilsCrossed, color: 'from-emerald-500 to-teal-500' },
    { id: 'office', name: 'Dolgozószoba', icon: Monitor, color: 'from-blue-500 to-cyan-500' },
  ];

  // Furniture placement spots for each room
  const roomSpots = {
    living: [
      { id: 'sofa', x: 30, y: 60, label: 'Kanapé helye', category: 'Kanapék' },
      { id: 'table', x: 50, y: 70, label: 'Dohányzóasztal', category: 'Asztalok' },
      { id: 'shelf', x: 75, y: 40, label: 'Polc/Szekrény', category: 'Tárolók' },
      { id: 'lamp', x: 15, y: 35, label: 'Lámpa', category: 'Világítás' },
    ],
    bedroom: [
      { id: 'bed', x: 50, y: 55, label: 'Ágy helye', category: 'Ágyak' },
      { id: 'nightstand', x: 25, y: 60, label: 'Éjjeliszekrény', category: 'Tárolók' },
      { id: 'wardrobe', x: 80, y: 45, label: 'Szekrény', category: 'Tárolók' },
      { id: 'dresser', x: 20, y: 40, label: 'Komód', category: 'Tárolók' },
    ],
    dining: [
      { id: 'table', x: 50, y: 55, label: 'Étkezőasztal', category: 'Asztalok' },
      { id: 'chairs', x: 35, y: 65, label: 'Székek', category: 'Székek' },
      { id: 'cabinet', x: 80, y: 40, label: 'Tálalószekrény', category: 'Tárolók' },
      { id: 'light', x: 50, y: 25, label: 'Függőlámpa', category: 'Világítás' },
    ],
    office: [
      { id: 'desk', x: 50, y: 55, label: 'Íróasztal', category: 'Asztalok' },
      { id: 'chair', x: 50, y: 70, label: 'Irodai szék', category: 'Székek' },
      { id: 'bookshelf', x: 15, y: 45, label: 'Könyvespolc', category: 'Tárolók' },
      { id: 'cabinet', x: 85, y: 50, label: 'Iratszekrény', category: 'Tárolók' },
    ],
  };

  const currentRoom = rooms.find(r => r.id === activeRoom);
  const currentSpots = roomSpots[activeRoom] || [];

  const handleSpotClick = (spot) => {
    setSelectedSpot(selectedSpot?.id === spot.id ? null : spot);
  };

  const handlePlaceProduct = (spot, product) => {
    setPlacedProducts(prev => ({
      ...prev,
      [`${activeRoom}-${spot.id}`]: product
    }));
    setSelectedSpot(null);
  };

  const handleRemoveProduct = (spotKey) => {
    setPlacedProducts(prev => {
      const updated = { ...prev };
      delete updated[spotKey];
      return updated;
    });
  };

  const rotateView = (direction) => {
    setViewAngle(prev => (prev + direction * 90) % 360);
  };

  // Get matching products for a spot's category
  const getMatchingProducts = (category) => {
    return products.filter(p => p.category === category).slice(0, 4);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">Virtuális Showroom</h3>
              <p className="text-xs sm:text-sm text-gray-500">Helyezd el a bútorokat virtuálisan</p>
            </div>
          </div>
          
          {/* Room Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoom(room.id);
                  setSelectedSpot(null);
                }}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeRoom === room.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <room.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{room.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Room View */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-gradient-to-b from-blue-100 to-gray-200 overflow-hidden">
        {/* Room Background with perspective */}
        <div 
          className="absolute inset-0 transition-transform duration-500"
          style={{ transform: `perspective(1000px) rotateY(${viewAngle * 0.1}deg)` }}
        >
          {/* Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-amber-100 to-amber-50" 
            style={{ transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'bottom' }} 
          />
          
          {/* Back Wall */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[55%] bg-gradient-to-b from-gray-100 to-gray-200 border-b-4 border-gray-300" />
          
          {/* Side Walls */}
          <div className="absolute top-0 left-0 w-[10%] h-[55%] bg-gradient-to-r from-gray-200 to-gray-100" />
          <div className="absolute top-0 right-0 w-[10%] h-[55%] bg-gradient-to-l from-gray-200 to-gray-100" />
          
          {/* Window */}
          <div className="absolute top-[10%] left-[20%] w-[25%] h-[35%] bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg border-4 border-white shadow-inner">
            <div className="absolute inset-2 border-2 border-white/50 rounded" />
          </div>
        </div>

        {/* Furniture Spots */}
        {currentSpots.map(spot => {
          const spotKey = `${activeRoom}-${spot.id}`;
          const placedProduct = placedProducts[spotKey];
          
          return (
            <div
              key={spot.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              {placedProduct ? (
                // Placed Product
                <div className="group relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-primary-200 transition-transform hover:scale-110 cursor-pointer">
                    {placedProduct.image ? (
                      <img src={placedProduct.image} alt={placedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <p className="font-medium">{placedProduct.name}</p>
                      <p className="text-primary-400">{placedProduct.price?.toLocaleString()} Ft</p>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveProduct(spotKey)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              ) : (
                // Empty Spot
                <button
                  onClick={() => handleSpotClick(spot)}
                  className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all
                    ${selectedSpot?.id === spot.id 
                      ? 'bg-primary-100 border-primary-400 scale-110' 
                      : 'bg-white/80 border-gray-300 hover:bg-white hover:border-primary-300 hover:scale-105'
                    }
                  `}
                >
                  <Plus className={`w-5 h-5 ${selectedSpot?.id === spot.id ? 'text-primary-500' : 'text-gray-400'}`} />
                  <span className="text-[10px] text-gray-500 mt-0.5 hidden sm:block">{spot.label}</span>
                </button>
              )}
            </div>
          );
        })}

        {/* View Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            onClick={() => rotateView(-1)}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => setViewAngle(0)}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => rotateView(1)}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Placed Items Counter */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-lg">
          <span className="text-sm font-medium text-gray-700">
            {Object.keys(placedProducts).filter(k => k.startsWith(activeRoom)).length} / {currentSpots.length} elhelyezve
          </span>
        </div>
      </div>

      {/* Product Selection Panel */}
      {selectedSpot && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{selectedSpot.label}</h4>
              <p className="text-xs text-gray-500">Válassz egy terméket az elhelyezéshez</p>
            </div>
            <button
              onClick={() => setSelectedSpot(null)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {getMatchingProducts(selectedSpot.category).map(product => (
              <button
                key={product.id}
                onClick={() => handlePlaceProduct(selectedSpot, product)}
                className="flex-shrink-0 w-32 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-full aspect-square bg-white rounded-lg overflow-hidden mb-2">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs font-bold text-primary-600">{product.price?.toLocaleString()} Ft</p>
              </button>
            ))}
            
            {getMatchingProducts(selectedSpot.category).length === 0 && (
              <div className="flex-1 text-center py-6 text-gray-500 text-sm">
                Nincs elérhető termék ebben a kategóriában
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualShowroom;
