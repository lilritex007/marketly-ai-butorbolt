import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, ShoppingCart, Clock, TrendingUp, Users, Package } from 'lucide-react';

/**
 * StockUrgency - Creates urgency with stock levels and real-time activity
 * Shows: Low stock warnings, recent purchases, viewing count
 */
const StockUrgency = ({ 
  product, 
  variant = 'full' // 'full' | 'compact' | 'badge'
}) => {
  const [viewingCount, setViewingCount] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState(0);
  const [lastPurchaseTime, setLastPurchaseTime] = useState(null);

  // Simulated real-time data (in production this would come from websocket/API)
  useEffect(() => {
    // Random initial values
    setViewingCount(Math.floor(Math.random() * 15) + 3);
    setRecentPurchases(Math.floor(Math.random() * 8) + 1);
    
    // Random last purchase time (within last hour)
    const minutes = Math.floor(Math.random() * 45) + 5;
    setLastPurchaseTime(minutes);

    // Simulate activity updates
    const viewInterval = setInterval(() => {
      setViewingCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(25, prev + change));
      });
    }, 15000);

    const purchaseInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setRecentPurchases(prev => prev + 1);
        setLastPurchaseTime(Math.floor(Math.random() * 5) + 1);
      }
    }, 30000);

    return () => {
      clearInterval(viewInterval);
      clearInterval(purchaseInterval);
    };
  }, [product?.id]);

  if (!product) return null;

  // Simulated stock level (in production from product data)
  const stockLevel = product.stockLevel || Math.floor(Math.random() * 20) + 1;
  const isLowStock = stockLevel <= 5;
  const isVeryLowStock = stockLevel <= 2;
  const isOutOfStock = stockLevel === 0;

  // Badge variant - just shows stock status
  if (variant === 'badge') {
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
          <Package className="w-3 h-3" />
          Elfogyott
        </span>
      );
    }
    
    if (isVeryLowStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          Utolsó {stockLevel} db!
        </span>
      );
    }
    
    if (isLowStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
          <Clock className="w-3 h-3" />
          Még {stockLevel} db
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
        <Package className="w-3 h-3" />
        Raktáron
      </span>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {/* Stock level */}
        {isLowStock && !isOutOfStock && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isVeryLowStock ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
            <AlertTriangle className={`w-4 h-4 ${isVeryLowStock ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
            <span className={`text-sm font-bold ${isVeryLowStock ? 'text-red-700' : 'text-amber-700'}`}>
              {isVeryLowStock ? `Csak ${stockLevel} db maradt!` : `Már csak ${stockLevel} db raktáron`}
            </span>
          </div>
        )}

        {/* Viewing count */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="w-4 h-4 text-primary-500" />
          <span>{viewingCount} ember nézi most</span>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-3">
      {/* Stock warning */}
      {isOutOfStock ? (
        <div className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-xl">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-bold text-gray-700">Jelenleg nincs raktáron</p>
            <p className="text-gray-500 text-sm">Értesítést kérhetsz az újbóli elérhetőségről</p>
          </div>
        </div>
      ) : isLowStock ? (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${isVeryLowStock ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isVeryLowStock ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${isVeryLowStock ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
          </div>
          <div className="flex-1">
            <p className={`font-bold ${isVeryLowStock ? 'text-red-800' : 'text-amber-800'}`}>
              {isVeryLowStock ? '⚠️ Utolsó darabok!' : 'Alacsony készlet'}
            </p>
            <p className={`text-sm ${isVeryLowStock ? 'text-red-600' : 'text-amber-600'}`}>
              Már csak <strong>{stockLevel} db</strong> van raktáron
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-16">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${isVeryLowStock ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.max(10, (stockLevel / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-800">✓ Raktáron</p>
            <p className="text-green-600 text-sm">Azonnali szállításra kész</p>
          </div>
        </div>
      )}

      {/* Social proof - viewing & purchases */}
      {!isOutOfStock && (
        <div className="grid grid-cols-2 gap-3">
          {/* Currently viewing */}
          <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-xl">
            <div className="relative">
              <Eye className="w-5 h-5 text-primary-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary-600">{viewingCount}</p>
              <p className="text-[10px] text-primary-500">nézi most</p>
            </div>
          </div>

          {/* Recent purchases */}
          <div className="flex items-center gap-2 p-3 bg-secondary-50 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-secondary-700" />
            <div>
              <p className="text-lg font-bold text-secondary-700">{recentPurchases}</p>
              <p className="text-[10px] text-secondary-700">vette meg ma</p>
            </div>
          </div>
        </div>
      )}

      {/* Last purchase notification */}
      {!isOutOfStock && lastPurchaseTime && lastPurchaseTime <= 30 && (
        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg animate-fade-in">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
          </div>
          <p className="text-xs text-green-700">
            <strong>Valaki most vette meg</strong> {lastPurchaseTime} perce {product.city || 'Budapest'}ból
          </p>
        </div>
      )}
    </div>
  );
};

export default StockUrgency;
