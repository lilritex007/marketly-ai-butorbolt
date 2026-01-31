import React, { useState, useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus, Clock, Bell, ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';

/**
 * PriceHistory - Dynamic pricing indicator with history chart
 * Shows price trends and alerts for best buying time
 */
const PriceHistory = ({ 
  currentPrice = 0, 
  priceHistory = [], 
  productId,
  onSetAlert 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  // Generate mock price history if not provided
  const history = useMemo(() => {
    if (priceHistory.length > 0) return priceHistory;
    
    // Generate 6 months of price data
    const months = ['Aug', 'Szept', 'Okt', 'Nov', 'Dec', 'Jan'];
    const basePrice = currentPrice;
    
    return months.map((month, idx) => {
      const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
      const price = Math.round(basePrice * (1 + variance));
      return {
        month,
        price,
        date: new Date(2025, 7 + idx, 1)
      };
    });
  }, [currentPrice, priceHistory]);

  // Calculate stats
  const stats = useMemo(() => {
    const prices = history.map(h => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const previousPrice = history[history.length - 2]?.price || currentPrice;
    const priceChange = currentPrice - previousPrice;
    const changePercent = ((priceChange / previousPrice) * 100).toFixed(1);
    const isLowest = currentPrice <= min * 1.05; // Within 5% of lowest
    const isHighest = currentPrice >= max * 0.95;
    
    return { min, max, avg, priceChange, changePercent, isLowest, isHighest, previousPrice };
  }, [history, currentPrice]);

  // Chart dimensions
  const chartHeight = 60;
  const chartWidth = 200;

  // Generate SVG path for price chart
  const chartPath = useMemo(() => {
    const prices = history.map(h => h.price);
    const min = Math.min(...prices) * 0.95;
    const max = Math.max(...prices) * 1.05;
    const range = max - min;
    
    const points = prices.map((price, idx) => {
      const x = (idx / (prices.length - 1)) * chartWidth;
      const y = chartHeight - ((price - min) / range) * chartHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [history]);

  // Area fill path
  const areaPath = useMemo(() => {
    return `${chartPath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;
  }, [chartPath]);

  const handleSetAlert = () => {
    setAlertSet(true);
    onSetAlert?.(productId, currentPrice);
    setTimeout(() => setAlertSet(false), 3000);
  };

  const getTrendIcon = () => {
    if (stats.priceChange < 0) return <TrendingDown className="w-4 h-4" />;
    if (stats.priceChange > 0) return <TrendingUp className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (stats.priceChange < 0) return 'text-green-600 bg-green-50';
    if (stats.priceChange > 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Compact Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{stats.priceChange > 0 ? '+' : ''}{stats.changePercent}%</span>
          </div>
          
          {stats.isLowest && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              <TrendingDown className="w-3 h-3" />
              Most a legolcsóbb!
            </span>
          )}
          
          {stats.isHighest && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              <AlertCircle className="w-3 h-3" />
              Magas ár
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Árváltozás</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 space-y-4">
          {/* Mini Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-end justify-between mb-3">
              <span className="text-xs text-gray-500">Elmúlt 6 hónap</span>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{currentPrice.toLocaleString()} Ft</span>
                <span className="text-xs text-gray-500 ml-1">most</span>
              </div>
            </div>
            
            {/* SVG Chart */}
            <div className="relative h-16">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Gradient fill */}
                <defs>
                  <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={stats.priceChange <= 0 ? '#10b981' : '#f59e0b'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={stats.priceChange <= 0 ? '#10b981' : '#f59e0b'} stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path d={areaPath} fill="url(#priceGradient)" />
                
                {/* Line */}
                <path 
                  d={chartPath} 
                  fill="none" 
                  stroke={stats.priceChange <= 0 ? '#10b981' : '#f59e0b'} 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Current price dot */}
                <circle 
                  cx={chartWidth} 
                  cy={chartHeight - ((currentPrice - stats.min * 0.95) / (stats.max * 1.05 - stats.min * 0.95)) * chartHeight}
                  r="4" 
                  fill={stats.priceChange <= 0 ? '#10b981' : '#f59e0b'}
                />
              </svg>
              
              {/* Month labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-400 -mb-4">
                {history.filter((_, i) => i % 2 === 0).map((h, i) => (
                  <span key={i}>{h.month}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded-lg p-2.5 text-center">
              <div className="text-xs text-green-600 mb-0.5">Legalacsonyabb</div>
              <div className="font-bold text-green-700 text-sm">{stats.min.toLocaleString()} Ft</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
              <div className="text-xs text-gray-500 mb-0.5">Átlagár</div>
              <div className="font-bold text-gray-700 text-sm">{stats.avg.toLocaleString()} Ft</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5 text-center">
              <div className="text-xs text-red-600 mb-0.5">Legmagasabb</div>
              <div className="font-bold text-red-700 text-sm">{stats.max.toLocaleString()} Ft</div>
            </div>
          </div>

          {/* Price Alert Button */}
          <button
            onClick={handleSetAlert}
            disabled={alertSet}
            className={`
              w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
              ${alertSet 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {alertSet ? (
              <>
                <Check className="w-4 h-4" />
                Értesítés beállítva!
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Értesíts, ha csökken az ár
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PriceHistory;
