import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, TrendingUp, Package, Tag, Sparkles, 
  ChevronRight, Filter, Grid3X3, List, Star, Home,
  ArrowUpDown, SlidersHorizontal, X, Check, LayoutGrid,
  Rows3, Plus, GitCompare, ChevronDown, ChevronUp
} from 'lucide-react';
import { getCategoryIcon } from '../ui/Icons';
import { EnhancedProductCard } from '../product/EnhancedProductCard';

/**
 * Category Images - unsplash stock photos by category
 */
const CATEGORY_IMAGES = {
  'Kanapé': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
  'Kanapék': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
  'Fotel': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
  'Nappali': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
  'Ágy': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
  'Hálószoba': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80',
  'Matrac': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
  'Asztal': 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=1200&q=80',
  'Szék': 'https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80',
  'Iroda': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
  'Szekrény': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80',
  'Lámpa': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80',
  'Kert': 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80'
};

const getCategoryImage = (name) => {
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return CATEGORY_IMAGES.default;
};

/**
 * Category color themes
 */
const getCategoryTheme = (categoryName) => {
  const themes = {
    'Kanapé': { gradient: 'from-blue-600/90 to-primary-700/90', accent: 'indigo' },
    'Fotel': { gradient: 'from-primary-500/90 to-secondary-800/90', accent: 'purple' },
    'Nappali': { gradient: 'from-secondary-700/90 to-secondary-800/90', accent: 'violet' },
    'Ágy': { gradient: 'from-secondary-700/90 to-pink-800/90', accent: 'purple' },
    'Hálószoba': { gradient: 'from-secondary-700/90 to-pink-800/90', accent: 'pink' },
    'Asztal': { gradient: 'from-amber-600/90 to-orange-800/90', accent: 'amber' },
    'Szék': { gradient: 'from-yellow-600/90 to-amber-800/90', accent: 'yellow' },
    'Iroda': { gradient: 'from-slate-600/90 to-gray-800/90', accent: 'slate' },
    'Szekrény': { gradient: 'from-teal-600/90 to-cyan-800/90', accent: 'teal' },
    'Lámpa': { gradient: 'from-yellow-500/90 to-orange-700/90', accent: 'yellow' },
    'Kert': { gradient: 'from-green-600/90 to-emerald-800/90', accent: 'green' },
    default: { gradient: 'from-primary-500/90 to-secondary-800/90', accent: 'indigo' }
  };
  
  for (const [key, theme] of Object.entries(themes)) {
    if (categoryName?.toLowerCase().includes(key.toLowerCase())) return theme;
  }
  return themes.default;
};

/**
 * Breadcrumb Navigation
 */
const Breadcrumb = ({ category, onBack }) => (
  <nav className="flex items-center gap-2 text-sm mb-4 animate-fade-in">
    <button onClick={onBack} className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
      <Home className="w-4 h-4" />
      <span>Főoldal</span>
    </button>
    <ChevronRight className="w-4 h-4 text-white/50" />
    <span className="text-white font-medium">{category}</span>
  </nav>
);

/**
 * Category Hero with Image Background
 */
const CategoryHero = ({ category, productCount, theme, onBack }) => {
  const CategoryIcon = getCategoryIcon(category);
  const bgImage = getCategoryImage(category);
  
  return (
    <div className="relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
      
      {/* Content - FULL WIDTH and LARGER on desktop */}
      <div className="relative w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-12 sm:py-20 lg:py-28 xl:py-36 text-white">
        <Breadcrumb category={category} onBack={onBack} />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 lg:gap-14">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 bg-white/20 backdrop-blur rounded-2xl lg:rounded-3xl flex items-center justify-center animate-scale-in">
            <CategoryIcon className="w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 xl:w-20 xl:h-20 text-white" />
          </div>
          
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 lg:mb-5">
              {category}
            </h1>
            <p className="text-white/80 text-lg sm:text-xl lg:text-2xl xl:text-3xl">
              <span className="font-semibold text-white">{productCount.toLocaleString('hu-HU')}</span> termék ebben a kategóriában
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Sidebar Filters
 */
const SidebarFilters = ({ 
  products, 
  filters, 
  onFilterChange, 
  priceRange, 
  onPriceRangeChange,
  isOpen,
  onClose
}) => {
  // Extract unique values from products
  const filterOptions = useMemo(() => {
    const brands = new Set();
    const colors = new Set();
    
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
      if (p.color) colors.add(p.color);
    });
    
    const prices = products.map(p => p.salePrice || p.price).filter(p => p > 0);
    const minPrice = Math.min(...prices) || 0;
    const maxPrice = Math.max(...prices) || 1000000;
    
    return {
      brands: Array.from(brands).sort(),
      colors: Array.from(colors).sort(),
      priceMin: minPrice,
      priceMax: maxPrice
    };
  }, [products]);

  const toggleFilter = (type, value) => {
    const current = filters[type] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [type]: updated });
  };

  const FilterSection = ({ title, items, type, icon: Icon }) => (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {title}
      </h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {items.map(item => (
          <label key={item} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={(filters[type] || []).includes(item)}
              onChange={() => toggleFilter(type, item)}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const content = (
    <div className="p-4 sm:p-0">
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <h3 className="text-lg font-bold text-gray-900">Szűrők</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          Ártartomány
        </h4>
        <div className="space-y-3">
          <input
            type="range"
            min={filterOptions.priceMin}
            max={filterOptions.priceMax}
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{priceRange[0].toLocaleString('hu-HU')} Ft</span>
            <span>{priceRange[1].toLocaleString('hu-HU')} Ft</span>
          </div>
        </div>
      </div>

      {filterOptions.brands.length > 0 && (
        <FilterSection title="Márka" items={filterOptions.brands} type="brands" icon={Package} />
      )}
      
      {filterOptions.colors.length > 0 && (
        <FilterSection title="Szín" items={filterOptions.colors} type="colors" icon={Tag} />
      )}

      {/* Stock Filter */}
      <div className="pb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Csak készleten</span>
        </label>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({})}
        className="w-full py-2 text-sm text-primary-500 hover:text-primary-600 font-medium"
      >
        Szűrők törlése
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Szűrők
          </h3>
          {content}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white animate-fade-in-right">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Related Categories
 */
const RelatedCategories = ({ currentCategory, allCategories, onCategoryChange }) => {
  // Find related categories (same "type" or popular ones)
  const related = useMemo(() => {
    return allCategories
      .filter(cat => cat.name !== currentCategory && cat.name !== 'Összes' && cat.count > 0)
      .slice(0, 6);
  }, [allCategories, currentCategory]);

  if (related.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-gray-400" />
        Kapcsolódó kategóriák
      </h3>
      <div className="flex flex-wrap gap-2">
        {related.map(cat => {
          const Icon = getCategoryIcon(cat.name);
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name)}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors tap-scale"
            >
              <Icon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              <span className="text-xs text-gray-400">({cat.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Price Statistics Card
 */
const PriceStats = ({ products }) => {
  const stats = useMemo(() => {
    if (!products || products.length === 0) return null;
    const prices = products.map(p => p.salePrice || p.price).filter(p => p > 0);
    if (prices.length === 0) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      inStock: products.filter(p => p.inStock !== false).length
    };
  }, [products]);
  
  if (!stats) return null;
  
  const formatPrice = (price) => new Intl.NumberFormat('hu-HU', { 
    style: 'currency', currency: 'HUF', maximumFractionDigits: 0 
  }).format(price);
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Legolcsóbb', value: formatPrice(stats.min), color: 'text-green-600' },
        { label: 'Átlagár', value: formatPrice(stats.avg), color: 'text-gray-900' },
        { label: 'Legdrágább', value: formatPrice(stats.max), color: 'text-gray-900' },
        { label: 'Készleten', value: `${stats.inStock} db`, color: 'text-primary-500' }
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
          <p className={`text-base sm:text-lg font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Featured Products
 */
const FeaturedProducts = ({ products, onProductClick, onWishlistToggle, wishlist }) => {
  const featured = useMemo(() => {
    return products
      .filter(p => p.salePrice && p.price > p.salePrice)
      .sort((a, b) => ((b.price - b.salePrice) / b.price) - ((a.price - a.salePrice) / a.price))
      .slice(0, 6);
  }, [products]);
  
  if (featured.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        Kiemelt ajánlatok
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {featured.map((product, index) => (
          <div key={product.id} className="w-44 sm:w-52 shrink-0">
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
 * Compact Product Card
 */
const CompactProductCard = ({ product, onQuickView, onToggleWishlist, isWishlisted, onCompare, isComparing }) => {
  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.price > product.salePrice;
  
  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow tap-scale">
      <img 
        src={product.images?.[0] || '/placeholder.png'}
        alt={product.name}
        className="w-20 h-20 object-contain rounded-lg bg-gray-50 shrink-0 cursor-pointer"
        onClick={() => onQuickView(product)}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-primary-500 font-medium mb-1">{product.category}</p>
        <h4 
          className="text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-primary-500"
          onClick={() => onQuickView(product)}
        >
          {product.name}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <div>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through mr-2">
                {product.price.toLocaleString('hu-HU')} Ft
              </span>
            )}
            <span className={`font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
              {displayPrice.toLocaleString('hu-HU')} Ft
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onCompare?.(product)}
              className={`p-1.5 rounded-lg transition-colors ${isComparing ? 'bg-primary-100 text-primary-500' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-1.5 rounded-lg transition-colors ${isWishlisted ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <Star className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * AI Recommendations Banner
 */
const AIBanner = ({ category, onAskAI }) => (
  <div className="bg-gradient-to-r from-primary-500 to-secondary-700 rounded-2xl p-4 sm:p-6 text-white mb-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">AI segít választani</h3>
        <p className="text-white/80 text-sm">Melyik {category.toLowerCase()} illik hozzád?</p>
      </div>
      <button
        onClick={onAskAI}
        className="w-full sm:w-auto px-5 py-2.5 bg-white text-primary-500 rounded-xl font-semibold hover:bg-primary-50 transition-colors tap-scale"
      >
        AI Tanácsadó
      </button>
    </div>
  </div>
);

/**
 * View & Sort Controls
 */
const ViewControls = ({ 
  sortOption, onSortChange, 
  viewMode, onViewModeChange, 
  productCount,
  onOpenFilters,
  compareCount
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <button
        onClick={onOpenFilters}
        className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 tap-scale"
      >
        <Filter className="w-4 h-4" />
        Szűrők
      </button>
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{productCount}</span> termék
      </p>
      {compareCount > 0 && (
        <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
          {compareCount} összehasonlításra
        </span>
      )}
    </div>
    
    <div className="flex items-center gap-2">
      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-500 outline-none"
      >
        <option value="default">Relevancia</option>
        <option value="price-asc">Ár ↑</option>
        <option value="price-desc">Ár ↓</option>
        <option value="name-asc">Név A-Z</option>
        <option value="discount">Kedvezmény</option>
      </select>
      
      <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
        {[
          { mode: 'grid', icon: LayoutGrid },
          { mode: 'compact', icon: Rows3 },
        ].map(({ mode, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`p-2 ${viewMode === mode ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
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
  allCategories = [],
  onBack,
  onProductClick,
  onWishlistToggle,
  onCategoryChange,
  wishlist,
  onAskAI,
  visibleCount,
  onLoadMore
}) => {
  const [sortOption, setSortOption] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const loadMoreRef = useRef(null);
  
  const theme = getCategoryTheme(category);
  
  // Initialize price range from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.salePrice || p.price).filter(p => p > 0);
      if (prices.length > 0) {
        setPriceRange([Math.min(...prices), Math.max(...prices)]);
      }
    }
  }, [products]);
  
  // Filter and sort products
  const displayedProducts = useMemo(() => {
    let filtered = [...products];
    
    // Price filter
    filtered = filtered.filter(p => {
      const price = p.salePrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Brand filter
    if (filters.brands?.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }
    
    // Color filter
    if (filters.colors?.length > 0) {
      filtered = filtered.filter(p => filters.colors.includes(p.color));
    }
    
    // In stock only
    if (filters.inStockOnly) {
      filtered = filtered.filter(p => p.inStock !== false);
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
          const dA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
          const dB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
          return dB - dA;
        });
        break;
    }
    
    return filtered;
  }, [products, sortOption, filters, priceRange]);
  
  const visibleProducts = displayedProducts.slice(0, visibleCount);
  const hasMoreToShow = visibleCount < displayedProducts.length;
  
  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreToShow) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    
    if (loadMoreRef.current instanceof Element) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMoreToShow, onLoadMore]);
  
  const toggleCompare = (product) => {
    setCompareList(prev => 
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : prev.length < 4 ? [...prev, product] : prev
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryHero category={category} productCount={products.length} theme={theme} onBack={onBack} />
      
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12 lg:py-16">
        <AIBanner category={category} onAskAI={onAskAI} />
        <PriceStats products={products} />
        <FeaturedProducts products={products} onProductClick={onProductClick} onWishlistToggle={onWishlistToggle} wishlist={wishlist} />
        <RelatedCategories currentCategory={category} allCategories={allCategories} onCategoryChange={onCategoryChange} />
        
        <div className="flex gap-8">
          <SidebarFilters
            products={products}
            filters={filters}
            onFilterChange={setFilters}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
          />
          
          <div className="flex-1 min-w-0">
            <ViewControls
              sortOption={sortOption}
              onSortChange={setSortOption}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              productCount={displayedProducts.length}
              onOpenFilters={() => setShowFilters(true)}
              compareCount={compareList.length}
            />
            
            {viewMode === 'grid' ? (
              <div className="product-grid">
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
            ) : (
              <div className="space-y-3">
                {visibleProducts.map(product => (
                  <CompactProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onProductClick}
                    onToggleWishlist={onWishlistToggle}
                    isWishlisted={wishlist?.includes(product.id)}
                    onCompare={toggleCompare}
                    isComparing={compareList.some(p => p.id === product.id)}
                  />
                ))}
              </div>
            )}
            
            {/* Infinite scroll trigger */}
            {hasMoreToShow && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {!hasMoreToShow && visibleProducts.length > 0 && (
              <p className="text-center text-gray-400 text-base lg:text-lg py-10 lg:py-12">
                Minden termék betöltve ({displayedProducts.length} db)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
