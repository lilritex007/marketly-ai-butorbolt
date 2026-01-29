import React, { useMemo, useState } from 'react';
import { 
  ArrowLeft, TrendingUp, Package, Tag, Sparkles, 
  ChevronRight, Filter, Grid3X3, List, Star,
  ArrowUpDown, SlidersHorizontal
} from 'lucide-react';
import { getCategoryIcon } from '../ui/Icons';
import { EnhancedProductCard } from '../product/EnhancedProductCard';

/**
 * Category color themes based on category name
 */
const getCategoryTheme = (categoryName) => {
  const themes = {
    // Living Room
    'Kanapé': { gradient: 'from-blue-600 to-indigo-700', accent: 'blue', bg: 'bg-blue-50' },
    'Kanapék': { gradient: 'from-blue-600 to-indigo-700', accent: 'blue', bg: 'bg-blue-50' },
    'Fotel': { gradient: 'from-indigo-600 to-purple-700', accent: 'indigo', bg: 'bg-indigo-50' },
    'Nappali': { gradient: 'from-violet-600 to-purple-700', accent: 'violet', bg: 'bg-violet-50' },
    
    // Bedroom
    'Ágy': { gradient: 'from-purple-600 to-pink-700', accent: 'purple', bg: 'bg-purple-50' },
    'Hálószoba': { gradient: 'from-purple-600 to-pink-700', accent: 'purple', bg: 'bg-purple-50' },
    'Matrac': { gradient: 'from-pink-600 to-rose-700', accent: 'pink', bg: 'bg-pink-50' },
    
    // Dining
    'Asztal': { gradient: 'from-amber-600 to-orange-700', accent: 'amber', bg: 'bg-amber-50' },
    'Étkezőasztal': { gradient: 'from-orange-600 to-red-700', accent: 'orange', bg: 'bg-orange-50' },
    'Szék': { gradient: 'from-yellow-600 to-amber-700', accent: 'yellow', bg: 'bg-yellow-50' },
    
    // Office
    'Iroda': { gradient: 'from-slate-600 to-gray-700', accent: 'slate', bg: 'bg-slate-50' },
    'Íróasztal': { gradient: 'from-gray-600 to-slate-700', accent: 'gray', bg: 'bg-gray-50' },
    
    // Storage
    'Szekrény': { gradient: 'from-teal-600 to-cyan-700', accent: 'teal', bg: 'bg-teal-50' },
    'Polc': { gradient: 'from-cyan-600 to-blue-700', accent: 'cyan', bg: 'bg-cyan-50' },
    
    // Lighting
    'Lámpa': { gradient: 'from-yellow-500 to-orange-600', accent: 'yellow', bg: 'bg-yellow-50' },
    'Világítás': { gradient: 'from-amber-500 to-yellow-600', accent: 'amber', bg: 'bg-amber-50' },
    
    // Garden
    'Kert': { gradient: 'from-green-600 to-emerald-700', accent: 'green', bg: 'bg-green-50' },
    'Kerti': { gradient: 'from-emerald-600 to-teal-700', accent: 'emerald', bg: 'bg-emerald-50' },
    
    // Default
    default: { gradient: 'from-indigo-600 to-purple-700', accent: 'indigo', bg: 'bg-indigo-50' }
  };
  
  // Find matching theme
  for (const [key, theme] of Object.entries(themes)) {
    if (categoryName?.toLowerCase().includes(key.toLowerCase())) {
      return theme;
    }
  }
  return themes.default;
};

/**
 * Category Hero Banner
 */
const CategoryHero = ({ category, productCount, theme, onBack }) => {
  const CategoryIcon = getCategoryIcon(category);
  
  return (
    <div className={`relative bg-gradient-to-br ${theme.gradient} text-white overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4 sm:mb-6 transition-colors tap-scale"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Vissza</span>
        </button>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          {/* Title & Count */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
              {category}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              <span className="font-semibold text-white">{productCount.toLocaleString('hu-HU')}</span> termék ebben a kategóriában
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Price Statistics Card
 */
const PriceStats = ({ products, theme }) => {
  const stats = useMemo(() => {
    if (!products || products.length === 0) return null;
    
    const prices = products.map(p => p.salePrice || p.price).filter(p => p > 0);
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const inStock = products.filter(p => p.inStock !== false).length;
    
    return { min, max, avg, inStock, total: products.length };
  }, [products]);
  
  if (!stats) return null;
  
  const formatPrice = (price) => new Intl.NumberFormat('hu-HU', { 
    style: 'currency', currency: 'HUF', maximumFractionDigits: 0 
  }).format(price);
  
  return (
    <div className={`${theme.bg} rounded-2xl p-4 sm:p-6 border border-gray-100`}>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Árstatisztikák
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Legolcsóbb</p>
          <p className="text-lg font-bold text-gray-900">{formatPrice(stats.min)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Átlagár</p>
          <p className="text-lg font-bold text-gray-900">{formatPrice(stats.avg)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Legdrágább</p>
          <p className="text-lg font-bold text-gray-900">{formatPrice(stats.max)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Készleten</p>
          <p className="text-lg font-bold text-green-600">{stats.inStock} db</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Featured Products Carousel
 */
const FeaturedProducts = ({ products, onProductClick, onWishlistToggle, wishlist }) => {
  // Get top products (by discount or just first few)
  const featured = useMemo(() => {
    return products
      .filter(p => p.salePrice && p.price > p.salePrice)
      .sort((a, b) => {
        const discountA = (a.price - a.salePrice) / a.price;
        const discountB = (b.price - b.salePrice) / b.price;
        return discountB - discountA;
      })
      .slice(0, 6);
  }, [products]);
  
  if (featured.length === 0) return null;
  
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Kiemelt ajánlatok
        </h3>
        <span className="text-sm text-gray-500">{featured.length} termék</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {featured.map((product, index) => (
          <div key={product.id} className="w-48 sm:w-56 shrink-0">
            <EnhancedProductCard
              product={product}
              onQuickView={onProductClick}
              onToggleWishlist={onWishlistToggle}
              isWishlisted={wishlist?.includes(product.id)}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Subcategories Navigation
 */
const SubcategoriesNav = ({ products, activeSubcategory, onSubcategoryChange }) => {
  // Extract unique subcategories from products
  const subcategories = useMemo(() => {
    const cats = new Map();
    products.forEach(p => {
      if (p.subcategory) {
        cats.set(p.subcategory, (cats.get(p.subcategory) || 0) + 1);
      }
    });
    return Array.from(cats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [products]);
  
  if (subcategories.length <= 1) return null;
  
  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
        <Grid3X3 className="w-4 h-4" />
        Alkategóriák
      </h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSubcategoryChange(null)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors tap-scale ${
            !activeSubcategory 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mind ({products.length})
        </button>
        {subcategories.map(([name, count]) => (
          <button
            key={name}
            onClick={() => onSubcategoryChange(name)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors tap-scale ${
              activeSubcategory === name 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {name} ({count})
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * AI Recommendations Banner
 */
const AIRecommendations = ({ category, onAskAI }) => (
  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">AI Segítség ehhez: {category}</h3>
        <p className="text-white/80 text-sm">
          Kérdezd meg az AI asszisztensünket, hogy melyik {category.toLowerCase()} illik hozzád!
        </p>
      </div>
      <button
        onClick={onAskAI}
        className="w-full sm:w-auto px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors tap-scale flex items-center justify-center gap-2"
      >
        AI Tanácsadó
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/**
 * Sort & Filter Bar
 */
const SortFilterBar = ({ sortOption, onSortChange, viewMode, onViewModeChange, productCount }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-100">
    <p className="text-sm text-gray-500">
      <span className="font-semibold text-gray-900">{productCount}</span> termék
    </p>
    
    <div className="flex items-center gap-3 w-full sm:w-auto">
      {/* Sort */}
      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2 min-h-[44px] text-sm border border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
      >
        <option value="default">Relevancia</option>
        <option value="price-asc">Ár: növekvő</option>
        <option value="price-desc">Ár: csökkenő</option>
        <option value="name-asc">Név: A-Z</option>
        <option value="discount">Legnagyobb kedvezmény</option>
      </select>
      
      {/* View mode toggle */}
      <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

/**
 * Main Category Page Component
 */
const CategoryPage = ({
  category,
  products,
  onBack,
  onProductClick,
  onWishlistToggle,
  wishlist,
  onAskAI,
  visibleCount,
  onLoadMore,
  hasMore
}) => {
  const [sortOption, setSortOption] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  
  const theme = getCategoryTheme(category);
  
  // Filter and sort products
  const displayedProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filter by subcategory
    if (activeSubcategory) {
      filtered = filtered.filter(p => p.subcategory === activeSubcategory);
    }
    
    // Sort
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'hu'));
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
          const discountB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
          return discountB - discountA;
        });
        break;
      default:
        break;
    }
    
    return filtered;
  }, [products, sortOption, activeSubcategory]);
  
  const visibleProducts = displayedProducts.slice(0, visibleCount);
  const hasMoreToShow = visibleCount < displayedProducts.length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <CategoryHero 
        category={category} 
        productCount={products.length} 
        theme={theme}
        onBack={onBack}
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* AI Recommendations */}
        <AIRecommendations category={category} onAskAI={onAskAI} />
        
        {/* Price Stats */}
        <div className="mb-6 sm:mb-8">
          <PriceStats products={products} theme={theme} />
        </div>
        
        {/* Featured Products */}
        <FeaturedProducts 
          products={products} 
          onProductClick={onProductClick}
          onWishlistToggle={onWishlistToggle}
          wishlist={wishlist}
        />
        
        {/* Subcategories */}
        <SubcategoriesNav 
          products={products}
          activeSubcategory={activeSubcategory}
          onSubcategoryChange={setActiveSubcategory}
        />
        
        {/* Sort & Filter Bar */}
        <SortFilterBar
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          productCount={displayedProducts.length}
        />
        
        {/* Product Grid */}
        <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
          {visibleProducts.map((product, index) => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              onQuickView={onProductClick}
              onToggleWishlist={onWishlistToggle}
              isWishlisted={wishlist?.includes(product.id)}
              index={index}
            />
          ))}
        </div>
        
        {/* Load More */}
        {hasMoreToShow && (
          <div className="flex justify-center mt-8">
            <button
              onClick={onLoadMore}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors tap-scale flex items-center gap-2"
            >
              Több termék betöltése
              <span className="text-indigo-200">
                ({visibleProducts.length} / {displayedProducts.length})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
