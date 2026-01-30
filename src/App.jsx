import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ShoppingCart, Camera, MessageCircle, X, Send, Plus, Move, Trash2, Home, ZoomIn, ZoomOut, Upload, Settings, Link as LinkIcon, FileText, RefreshCw, AlertCircle, Database, Lock, Search, ChevronLeft, ChevronRight, Filter, Heart, ArrowDownUp, Info, Check, Star, Truck, ShieldCheck, Phone, ArrowRight, Mail, Eye, Sparkles, Lightbulb, Image as ImageIcon, MousePointer2, Menu, Bot, Moon, Sun, Clock, Gift, Zap, TrendingUp, Instagram, Facebook, MapPin, Sofa, Lamp, BedDouble, Armchair, Grid3X3, ExternalLink, Timer, ChevronDown } from 'lucide-react';
// framer-motion removed due to Vite production build TDZ issues
import { fetchUnasProducts, refreshUnasProducts, fetchCategories } from './services/unasApi';

// New UI Components
import { ProductCardSkeleton, ProductGridSkeleton, CategorySkeleton } from './components/ui/Skeleton';
import { ToastProvider, useToast } from './components/ui/Toast';
import { NoSearchResults, NoFilterResults, ErrorState } from './components/ui/EmptyState';
import { SmartBadges } from './components/ui/Badge';

// AI Components
import { AIShowcase, AIOnboarding } from './components/ai/AIShowcase';
import AIChatAssistant from './components/ai/AIChatAssistant';
import AIRoomDesigner from './components/ai/AIRoomDesigner';
import AIStyleQuiz from './components/ai/AIStyleQuiz';

// Category Components
import CategorySwipe from './components/category/CategorySwipe';
import CategoryPage from './components/category/CategoryPage';

// UX Components
import ScrollProgress from './components/ux/ScrollProgress';
import BackToTop from './components/ux/BackToTop';
import LiveSocialProof from './components/ux/LiveSocialProof';

// Landing Components
import { ModernHero, AIFeaturesShowcase } from './components/landing/ModernHero';
import { SocialProof, LiveShowcase, InteractiveCTA } from './components/landing/ShowcaseSections';
// Footer eltávolítva - a fő UNAS shopnak már van saját láblécce

// Product Components
import { EnhancedProductCard } from './components/product/EnhancedProductCard';
import { SmartSearch } from './components/product/SmartSearch';
import { SimilarProducts } from './components/product/SimilarProducts';
import { RecentlyViewed, trackProductView } from './components/product/RecentlyViewed';
import { ProductComparison, useComparison } from './components/product/ProductComparison';
import { AdvancedFilters, applyFilters } from './components/product/AdvancedFilters';
import QuickAddToCart from './components/product/QuickAddToCart';
import ProductQuickPeek from './components/product/ProductQuickPeek';
import AIPricePredictor from './components/ai/AIPricePredictor';

// Search Components - removed VoiceSearch (framer-motion bundling issue)

// Marketing Components
import SmartNewsletterPopup from './components/marketing/SmartNewsletterPopup';

// AR Components
import ARProductPreview from './components/ar/ARProductPreview';

// Hooks
import { useLocalStorage } from './hooks/index';
// useInfiniteScroll removed - using manual "Load More" button instead

// Utils
import { getOptimizedImageProps } from './utils/imageOptimizer';
import { PLACEHOLDER_IMAGE } from './utils/helpers';

/* --- 1. KONFIGURÁCIÓ & ADATOK --- */

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA"; 
const WEBSHOP_DOMAIN = "https://www.marketly.hu";
const SHOP_ID = "81697"; 

// PERFORMANCE CONFIG - Don't load all 170k products!
// Server-side filtering + pagination for instant UX
// No page size limit - load ALL products at once (slim mode + GZIP = fast)
const DISPLAY_BATCH = 48;  // Products shown initially, more on scroll

/* --- 2. SEGÉDFÜGGVÉNYEK --- */

const formatPrice = (price) => {
  return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);
};

const fixUrl = (url, type = 'main') => {
    if (!url) return PLACEHOLDER_IMAGE;
    let cleanUrl = url.trim().replace(/^"|"$/g, '');
    
    if (cleanUrl.length === 0) return PLACEHOLDER_IMAGE;
    if (cleanUrl.startsWith('http')) return cleanUrl;

    // UNAS speciális útvonalak kezelése
    if (!cleanUrl.includes('/')) {
        const folder = type === 'alt' ? 'shop_altpic' : 'shop_pic';
        return `${WEBSHOP_DOMAIN}/shop_ordered/${SHOP_ID}/${folder}/${cleanUrl}`;
    }

    // Relatív útvonalak
    if (cleanUrl.startsWith('/') || cleanUrl.startsWith('img/')) {
        const path = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
        return WEBSHOP_DOMAIN.replace(/\/$/, '') + path;
    }

    return cleanUrl;
};

const generateAltImages = (mainImageUrl) => {
    if (mainImageUrl.includes('/shop_pic/')) {
        const baseUrl = mainImageUrl.replace('/shop_pic/', '/shop_altpic/');
        const extIndex = baseUrl.lastIndexOf('.');
        if (extIndex > -1) {
            const basePath = baseUrl.substring(0, extIndex);
            const ext = baseUrl.substring(extIndex);
            return [
                `${basePath}_altpic_1${ext}`,
                `${basePath}_altpic_2${ext}`
            ];
        }
    }
    return [];
};

const splitCSVLine = (line, delimiter) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === delimiter && !inQuotes) { values.push(current); current = ''; }
        else { current += char; }
    }
    values.push(current);
    return values;
};

const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/);
  const products = [];
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const headers = splitCSVLine(firstLine, delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  
  const findCol = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

  const nameCol = findCol("Termék Név");
  const priceCol = findCol("Bruttó Ár"); 
  const catCol = findCol("Kategória");
  const imgCol = findCol("Kép link"); 
  const urlCol = findCol("Termék link");
  const descCol = findCol("Tulajdonságok");
  const stockCol = findCol("Raktárkészlet");
  const altImgCol = findCol("Kép kapcsolat"); 
  
  const paramCols = headers.reduce((acc, header, index) => {
      if (header.startsWith("Paraméter:")) {
          const cleanName = header.replace("Paraméter:", "").split("|")[0].trim();
          acc.push({ index, name: cleanName });
      }
      return acc;
  }, []);

  for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const row = splitCSVLine(lines[i], delimiter);
      const getVal = (colIndex) => colIndex > -1 && row[colIndex] ? row[colIndex].replace(/^"|"$/g, '').trim() : "";

      const stock = getVal(stockCol);
      const priceStr = getVal(priceCol);
      if (!priceStr || !getVal(nameCol)) continue;

      let categoryPath = getVal(catCol) || "Egyéb";
      const category = categoryPath.includes('>') ? categoryPath.split('>').pop().trim() : categoryPath;

      const mainImgUrl = fixUrl(getVal(imgCol), 'main');
      let images = [mainImgUrl];
      
      const altImgsRaw = getVal(altImgCol);
      if (altImgsRaw) {
          const alts = altImgsRaw.split(/[|]/).map(url => fixUrl(url.trim(), 'alt'));
          images = [...images, ...alts].slice(0, 4);
      } else {
          const generatedAlts = generateAltImages(mainImgUrl);
          images = [...images, ...generatedAlts];
      }

      let aiContextParams = [];
      paramCols.forEach(p => {
          const val = getVal(p.index);
          if (val) aiContextParams.push(`${p.name}: ${val}`);
      });
      const paramsString = aiContextParams.join(", ");

      products.push({
          id: `mkt-prod-${i}`,
          name: getVal(nameCol),
          price: parseInt(priceStr.replace(/[^0-9]/g, '')) || 0,
          category: category,
          images: images, 
          description: getVal(descCol).replace(/<[^>]*>/g, ' ').substring(0, 500),
          params: paramsString,
          link: fixUrl(getVal(urlCol)),
          inStock: !(stock === '0' || stock.toLowerCase() === 'nincs')
      });
  }
  return products;
};

// --- 3. KOMPONENSEK ---

// Announcement bar messages for rotation
const ANNOUNCEMENT_MESSAGES = [
  { icon: Truck, text: 'Ingyenes szállítás 50.000 Ft felett', highlight: 'Ingyenes' },
  { icon: Gift, text: 'Első rendelésre 10% kedvezmény: ELSO10', highlight: 'ELSO10' },
  { icon: Zap, text: 'AI-alapú bútorajánlatok - Csak Neked!', highlight: 'AI' },
  { icon: TrendingUp, text: 'Több mint 90.000 termék egy helyen', highlight: '90.000' },
  { icon: Star, text: '4.9★ értékelés 10.000+ vásárlótól', highlight: '4.9★' },
];

// Popular categories for mega menu and mobile
const POPULAR_CATEGORIES = [
  { id: 'kanapek', name: 'Kanapék', icon: Sofa, color: 'from-blue-500 to-indigo-600' },
  { id: 'agyak', name: 'Ágyak', icon: BedDouble, color: 'from-purple-500 to-pink-600' },
  { id: 'fotelek', name: 'Fotelek', icon: Armchair, color: 'from-orange-500 to-red-600' },
  { id: 'lampak', name: 'Lámpák', icon: Lamp, color: 'from-yellow-500 to-orange-600' },
  { id: 'szekrenyek', name: 'Szekrények', icon: Grid3X3, color: 'from-green-500 to-teal-600' },
  { id: 'asztalok', name: 'Asztalok', icon: Grid3X3, color: 'from-cyan-500 to-blue-600' },
];

const Navbar = ({ activeTab, setActiveTab, wishlistCount, productCount = 0, onScrollToProducts, recentlyViewed = [], categories = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const mobileMenuRef = useRef(null);

  // Check for returning user
  useEffect(() => {
    const lastVisit = localStorage.getItem('mkt_last_visit');
    const savedName = localStorage.getItem('mkt_user_name');
    if (lastVisit) {
      setIsReturningUser(true);
      if (savedName) setUserName(savedName);
    }
    localStorage.setItem('mkt_last_visit', Date.now().toString());
  }, []);

  // Rotating announcement messages
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex(prev => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection for navbar shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.getElementById('mkt-butorbolt-app')?.classList.add('dark-mode');
    } else {
      document.getElementById('mkt-butorbolt-app')?.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Swipe gesture handling for mobile menu
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    // Swipe right to close (diff > 80px)
    if (diff > 80) {
      closeMobileMenu();
    }
  };

  const closeMobileMenu = () => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    setMobileMenuClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuClosing(false);
    }, 300);
  };

  const openMobileMenu = () => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    setMobileMenuOpen(true);
  };

  const setTabAndClose = (tab) => {
    setActiveTab(tab);
    closeMobileMenu();
  };

  const navItems = [
    { id: 'shop', label: 'Termékek', icon: ShoppingCart, badge: productCount > 0 ? `${(productCount/1000).toFixed(0)}K+` : null, desc: 'Böngéssz a kínálatban' },
    { id: 'visual-search', label: 'AI Képkereső', icon: Camera, isAI: true, desc: 'Fotózz és keress' },
    { id: 'room-planner', label: 'Szobatervező', icon: Move, isAI: true, desc: 'Tervezd meg a szobád' },
  ];

  const currentAnnouncement = ANNOUNCEMENT_MESSAGES[announcementIndex];

  return (
    <>
      {/* Animated Announcement Bar - UNIFIED sizing */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px'}} />
        
        {/* Animated message */}
        <div className="relative flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
          <div 
            key={announcementIndex}
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 animate-fade-in"
          >
            <currentAnnouncement.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 shrink-0" />
            <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-medium">
              {currentAnnouncement.text.split(currentAnnouncement.highlight).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="font-bold bg-white/20 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded mx-1 text-sm sm:text-base lg:text-lg xl:text-xl">
                      {currentAnnouncement.highlight}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </span>
          </div>
          
          {/* Progress dots */}
          <div className="hidden sm:flex items-center gap-1 lg:gap-1.5 ml-4 lg:ml-6">
            {ANNOUNCEMENT_MESSAGES.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-300 ${
                  i === announcementIndex ? 'bg-white w-4 lg:w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Returning User Greeting */}
      {isReturningUser && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 py-2 px-3 text-center">
          <span className="text-sm sm:text-base text-green-800 font-medium">
            👋 Üdv újra{userName ? `, ${userName}` : ''}! Örülünk, hogy visszatértél!
          </span>
        </div>
      )}

      {/* Main navbar - UNIFIED sizing */}
      <nav 
        id="mkt-butorbolt-navbar" 
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100' 
            : 'bg-white/80 backdrop-blur-md'
          }
        `}
      >
        <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 lg:px-10 xl:px-16 2xl:px-20">
          <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-16 sm:h-18 lg:h-20 xl:h-24' : 'h-18 sm:h-20 lg:h-24 xl:h-28'}`}>
            
            {/* Logo - UNIFIED scaling */}
            <div className="flex items-center cursor-pointer group" onClick={() => setActiveTab('shop')}>
              <div className={`
                relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl 
                flex items-center justify-center text-white mr-3 sm:mr-4 lg:mr-5
                transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 
                shadow-lg shadow-indigo-300/50 group-hover:shadow-xl
                ${isScrolled ? 'w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16' : 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20'}
              `}>
                <Home className={`${isScrolled ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8' : 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10'}`} />
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className={`font-black text-gray-900 tracking-tight transition-all ${isScrolled ? 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl' : 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl'}`}>
                    Marketly
                  </span>
                  <span className={`font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all ${isScrolled ? 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl' : 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl'}`}>
                    .AI
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-500 font-semibold tracking-widest -mt-0.5">
                  BÚTORBOLT
                </span>
              </div>
            </div>

            {/* Desktop Navigation with Mega Menu - UNIFIED */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4">
              {/* Categories Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button className="flex items-center gap-2 xl:gap-3 px-4 xl:px-6 2xl:px-7 py-2.5 xl:py-3.5 2xl:py-4 rounded-xl xl:rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold text-base xl:text-lg 2xl:text-xl transition-all">
                  <Grid3X3 className="w-5 h-5 xl:w-6 xl:h-6" />
                  <span>Kategóriák</span>
                  <ChevronDown className={`w-4 h-4 xl:w-5 xl:h-5 transition-transform ${showMegaMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Menu Dropdown - UNIFIED */}
                {showMegaMenu && (
                  <div className="absolute top-full left-0 mt-2 w-[500px] xl:w-[600px] 2xl:w-[700px] bg-white rounded-2xl xl:rounded-3xl shadow-2xl border border-gray-100 p-6 xl:p-8 animate-fade-in-up z-50">
                    <div className="grid grid-cols-3 gap-3 xl:gap-4">
                      {POPULAR_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveTab('shop');
                            setShowMegaMenu(false);
                          }}
                          className="flex flex-col items-center gap-2 xl:gap-3 p-4 xl:p-5 rounded-xl xl:rounded-2xl hover:bg-gray-50 transition-all group"
                        >
                          <div className={`w-12 h-12 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 rounded-xl xl:rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                            <cat.icon className="w-6 h-6 xl:w-8 xl:h-8 2xl:w-10 2xl:h-10" />
                          </div>
                          <span className="text-sm xl:text-base 2xl:text-lg font-semibold text-gray-700">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 xl:mt-6 pt-4 xl:pt-6 border-t border-gray-100">
                      <button 
                        onClick={() => {
                          setActiveTab('shop');
                          setShowMegaMenu(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 xl:gap-3 py-3 xl:py-4 text-base xl:text-lg 2xl:text-xl text-indigo-600 hover:bg-indigo-50 rounded-xl xl:rounded-2xl font-bold transition-all"
                      >
                        Összes kategória megtekintése
                        <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    relative flex items-center gap-2 xl:gap-3 px-4 xl:px-6 2xl:px-7 py-2.5 xl:py-3.5 2xl:py-4 rounded-xl xl:rounded-2xl
                    font-bold text-base xl:text-lg 2xl:text-xl transition-all duration-200
                    ${activeTab === item.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-300/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 xl:w-6 xl:h-6" />
                  <span>{item.label}</span>
                  {item.isAI && activeTab !== item.id && (
                    <span className="px-2 py-0.5 xl:px-2.5 xl:py-1 text-[10px] xl:text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 rounded-full">
                      AI
                    </span>
                  )}
                  {item.badge && activeTab !== item.id && (
                    <span className="px-2 py-0.5 xl:px-2.5 xl:py-1 text-[10px] xl:text-xs font-bold bg-green-100 text-green-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right side actions - UNIFIED */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              
              {/* Progressive Search (appears when scrolled on desktop) */}
              {isScrolled && (
                <button
                  onClick={() => {
                    const productsSection = document.getElementById('products-section');
                    productsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hidden lg:flex items-center gap-2 xl:gap-3 px-4 xl:px-5 py-2.5 xl:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl xl:rounded-2xl text-gray-600 hover:text-gray-900 transition-all"
                >
                  <Search className="w-5 h-5 xl:w-6 xl:h-6" />
                  <span className="text-sm xl:text-base font-bold">Keresés</span>
                </button>
              )}

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hidden sm:flex p-2.5 sm:p-3 lg:p-3.5 xl:p-4 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] xl:min-w-[56px] xl:min-h-[56px] items-center justify-center text-gray-600 hover:text-gray-900 rounded-xl xl:rounded-2xl hover:bg-gray-100 transition-all"
                aria-label={isDarkMode ? 'Világos mód' : 'Sötét mód'}
              >
                {isDarkMode ? <Sun className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />}
              </button>

              {/* Wishlist */}
              <button 
                className="relative p-2.5 sm:p-3 lg:p-3.5 xl:p-4 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] xl:min-w-[56px] xl:min-h-[56px] flex items-center justify-center text-gray-600 hover:text-red-500 rounded-xl xl:rounded-2xl hover:bg-red-50 transition-all group"
                aria-label="Kívánságlista"
              >
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-all group-hover:scale-110 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] lg:min-w-[24px] h-5 lg:h-6 flex items-center justify-center px-1.5 lg:px-2 text-xs lg:text-sm font-bold text-white bg-red-500 rounded-full shadow-lg animate-scale-in">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                onClick={openMobileMenu}
                aria-label="Menü megnyitása"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* CTA Button - UNIFIED */}
              <a 
                href={WEBSHOP_DOMAIN} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hidden md:flex items-center gap-2 xl:gap-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-5 lg:px-7 xl:px-9 2xl:px-10 py-2.5 lg:py-3.5 xl:py-4 2xl:py-5 rounded-xl lg:rounded-2xl text-sm lg:text-base xl:text-lg 2xl:text-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>Fő webshop</span>
                <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ENHANCED Mobile Menu - Slide-in with swipe gesture */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className={`fixed inset-0 z-[200] lg:hidden ${mobileMenuClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
          style={{ bottom: '40px' }}
          role="dialog"
          aria-label="Navigációs menü"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
          
          {/* Animated floating shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-5 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-32 right-5 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-float-medium" />
            <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl animate-float-fast" />
          </div>
          
          {/* Content */}
          <div className="relative h-full flex flex-col text-white p-4 sm:p-5 overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="font-black text-xl">Marketly</span>
                    <span className="font-black text-xl text-white/80">.AI</span>
                  </div>
                  <p className="text-[10px] text-white/60 font-medium tracking-wider">BÚTORBOLT</p>
                </div>
              </div>
              <button
                type="button"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-colors"
                onClick={closeMobileMenu}
                aria-label="Menü bezárása"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex gap-3 mb-5">
              <button 
                onClick={() => {
                  closeMobileMenu();
                  setTimeout(() => {
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 350);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/15 backdrop-blur-xl rounded-xl font-bold text-base"
              >
                <Search className="w-5 h-5" />
                <span>Keresés</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/15 backdrop-blur-xl rounded-xl font-bold text-base relative">
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-white' : ''}`} />
                <span>Kedvencek</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>

            {/* Popular Categories Grid */}
            <div className="mb-5">
              <p className="text-sm text-white/70 font-bold uppercase tracking-wider mb-3">Népszerű kategóriák</p>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTabAndClose('shop')}
                    className="flex flex-col items-center gap-2 py-3 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Navigation */}
            <div className="space-y-2.5 mb-5">
              <p className="text-sm text-white/70 font-bold uppercase tracking-wider mb-3">Navigáció</p>
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setTabAndClose(item.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all
                    ${activeTab === item.id
                      ? 'bg-white text-gray-900 shadow-2xl'
                      : 'bg-white/10 hover:bg-white/20 backdrop-blur-xl'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                    ${activeTab === item.id 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                      : 'bg-white/20'
                    }
                  `}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${activeTab === item.id ? 'text-gray-900' : 'text-white'}`}>
                        {item.label}
                      </span>
                      {item.isAI && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          activeTab === item.id 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-white/20 text-white'
                        }`}>
                          AI
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${activeTab === item.id ? 'text-gray-500' : 'text-white/60'}`}>
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-indigo-600' : 'text-white/40'}`} />
                </button>
              ))}
            </div>

            {/* Recently Viewed (if any) */}
            {recentlyViewed && recentlyViewed.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Utoljára nézett
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {recentlyViewed.slice(0, 4).map((product) => (
                    <div key={product.id} className="shrink-0 w-20">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden mb-1">
                        <img 
                          src={fixUrl(product.imageUrl)} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-[10px] text-white/80 truncate">{product.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Section */}
            <div className="mt-auto space-y-3">
              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-semibold">{isDarkMode ? 'Világos mód' : 'Sötét mód'}</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-400' : 'bg-white/30'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isDarkMode ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} />
                </div>
              </button>

              {/* Contact Row */}
              <div className="flex gap-2">
                <a href="tel:+36123456789" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-sm font-semibold">
                  <Phone className="w-4 h-4" />
                  Hívás
                </a>
                <a href="mailto:info@marketly.hu" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-sm font-semibold">
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors">
                  <MapPin className="w-5 h-5" />
                </a>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold">{productCount > 0 ? `${(productCount/1000).toFixed(0)}K+` : '...'}</p>
                  <p className="text-[9px] text-white/60">Termék</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold">24/7</p>
                  <p className="text-[9px] text-white/60">AI Support</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold">4.9★</p>
                  <p className="text-[9px] text-white/60">Értékelés</p>
                </div>
              </div>

              {/* CTA Button */}
              <a 
                href={WEBSHOP_DOMAIN} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl font-bold text-base bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-2xl"
                onClick={closeMobileMenu}
              >
                Vissza a fő webshopba
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FileLoaderBar = ({ onFileLoad, onUnasRefresh, isLoadingUnas, lastUpdated, unasError }) => {
    const fileInputRef = useRef(null);
    
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'most';
        if (diffMins < 60) return `${diffMins} perce`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} órája`;
        return date.toLocaleDateString('hu-HU');
    };
    
    return (
        <div id="mkt-butorbolt-loader" className="bg-indigo-600 text-white py-3 px-4 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                        {lastUpdated ? `Frissítve: ${formatTimestamp(lastUpdated)}` : 'Adatok betöltése...'}
                    </span>
                    {unasError && (
                        <span className="ml-2 text-xs bg-red-500 px-2 py-0.5 rounded-full flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> Hiba
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) {
                            file.text().then(text => onFileLoad(parseCSV(text)));
                        }
                    }} />
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center shadow-sm"
                    >
                        <Upload className="w-4 h-4 mr-1.5" /> CSV
                    </button>
                    <button 
                        onClick={onUnasRefresh}
                        disabled={isLoadingUnas}
                        className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoadingUnas ? 'animate-spin' : ''}`} /> 
                        {isLoadingUnas ? 'Frissítés...' : 'UNAS Frissítés'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Hero = ({ onExplore }) => (
    <div className="relative bg-gray-50 overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="py-20 lg:py-28 flex flex-col lg:flex-row items-center justify-between">
                <div className="lg:w-1/2 mb-12 lg:mb-0">
                    <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm text-indigo-600 text-sm font-bold mb-6 border border-indigo-50">
                        <Star className="w-4 h-4 mr-2 fill-current" /> Prémium Minőség 2025
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                        Otthonod, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">a te stílusod.</span>
                    </h1>
                    <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
                        Találd meg a tökéletes bútort az AI segítségével. Tölts fel egy fotót álmaid szobájáról, és mi megmutatjuk hozzá a termékeket.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={onExplore} className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center transform hover:-translate-y-1">
                            Kollekció megtekintése <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="lg:w-1/2 relative h-[500px] w-full">
                    <img 
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000" 
                        alt="Bútor enteriőr" 
                        className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl transform lg:rotate-1 hover:rotate-0 transition-transform duration-700"
                    />
                </div>
            </div>
        </div>
    </div>
);

const Features = () => (
    <div className="bg-white py-16 lg:py-20 xl:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
                <div className="flex items-center p-6 lg:p-8 xl:p-10 bg-gray-50 rounded-2xl xl:rounded-3xl">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-blue-100 text-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-5 xl:mr-6 shrink-0">
                        <Truck className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl">Ingyenes Szállítás</h3>
                        <p className="text-sm lg:text-base xl:text-lg text-gray-500 mt-1">Minden 50.000 Ft feletti rendelésnél.</p>
                    </div>
                </div>
                <div className="flex items-center p-6 lg:p-8 xl:p-10 bg-gray-50 rounded-2xl xl:rounded-3xl">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-green-100 text-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-5 xl:mr-6 shrink-0">
                        <ShieldCheck className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl">Garancia</h3>
                        <p className="text-sm lg:text-base xl:text-lg text-gray-500 mt-1">Minden bútorra teljes körű garancia.</p>
                    </div>
                </div>
                <div className="flex items-center p-6 lg:p-8 xl:p-10 bg-gray-50 rounded-2xl xl:rounded-3xl">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-purple-100 text-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-5 xl:mr-6 shrink-0">
                        <Phone className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl">Ügyfélszolgálat</h3>
                        <p className="text-sm lg:text-base xl:text-lg text-gray-500 mt-1">Szakértő segítség minden nap.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Testimonials = () => (
    <div className="bg-gray-50 py-16 lg:py-20 xl:py-24 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-12 lg:mb-16">Mit mondanak rólunk?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
                {[
                    { name: "Kovács Anna", text: "Az AI segítségével találtam meg a kanapét, ami pont illik a függönyhöz.", role: "Lakberendező" },
                    { name: "Nagy Péter", text: "Gyors szállítás, és a minőség is kiváló. A képkereső funkció nagyon hasznos.", role: "Vásárló" },
                    { name: "Szabó Éva", text: "Végre egy webshop, ahol nem kell órákig görgetni. Az asszisztens azonnal segített.", role: "Vásárló" }
                ].map((t, i) => (
                    <div key={i} className="bg-white p-8 lg:p-10 xl:p-12 rounded-2xl xl:rounded-3xl shadow-sm hover:shadow-lg transition-shadow text-left">
                        <div className="flex text-yellow-400 mb-4 lg:mb-5">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />)}
                        </div>
                        <p className="text-gray-600 mb-6 lg:mb-8 italic text-base lg:text-lg xl:text-xl leading-relaxed">"{t.text}"</p>
                        <div className="flex items-center">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 text-lg lg:text-xl xl:text-2xl mr-4">
                                {t.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-base lg:text-lg xl:text-xl">{t.name}</h4>
                                <p className="text-sm lg:text-base text-gray-500">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProductModal = ({ product, isOpen, onClose }) => {
    const [activeImg, setActiveImg] = useState(0);
    const [aiTip, setAiTip] = useState(null);
    const [loadingTip, setLoadingTip] = useState(false);
    
    useEffect(() => {
        setAiTip(null);
        setActiveImg(0);
    }, [product]);

    if (!isOpen || !product) return null;

    const generateStyleTip = async () => {
        setLoadingTip(true);
        try {
            const prompt = `Lakberendező vagy. Adj 2 rövid, konkrét tippet ehhez:
            Termék: ${product.name} (${product.category})
            Paraméterek: ${product.params || "Nincs adat"}
            Válaszolj magyarul, emojikkal.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            setAiTip(data.candidates?.[0]?.content?.parts?.[0]?.text);
        } catch (error) {
            setAiTip("Sajnos most nem tudok tippet adni.");
        } finally {
            setLoadingTip(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-6 h-6 text-gray-600" /></button>
                
                <div className="md:w-1/2 bg-gray-50 p-6 flex flex-col justify-center">
                    <div className="flex-1 relative rounded-2xl overflow-hidden mb-4 bg-white shadow-inner aspect-square">
                        <img 
                            src={product.images && product.images[activeImg]} 
                            alt={product.name} 
                            className="absolute inset-0 w-full h-full object-contain p-4"
                            onError={(e) => {e.target.src = PLACEHOLDER_IMAGE}}
                        />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setActiveImg(idx)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImg === idx ? 'border-indigo-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" onError={(e) => {e.target.style.display='none'}} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:w-1/2 p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{product.category}</span>
                        {product.inStock ?? product.in_stock ? 
                            <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-1 rounded-full"><Check className="w-3 h-3 mr-1" /> Raktáron</span> : 
                            <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">Készlethiány</span>
                        }
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h2>
                    <p className="text-3xl font-bold text-indigo-600 mb-6">{formatPrice(product.price)}</p>
                    
                    <div className="mb-6">
                        {!aiTip && !loadingTip && (
                            <button onClick={generateStyleTip} className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-indigo-700 p-4 rounded-xl border border-indigo-100 flex items-center justify-center transition-all group">
                                <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Kérj AI Lakberendező tippet!
                            </button>
                        )}
                        {loadingTip && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 animate-pulse">
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> A tervező gondolkodik...
                            </div>
                        )}
                        {aiTip && (
                            <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
                                <div className="flex items-center mb-2 text-indigo-700 font-bold"><Lightbulb className="w-5 h-5 mr-2" /> AI Tipp:</div>
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiTip}</div>
                            </div>
                        )}
                    </div>

                    <div className="prose prose-sm text-gray-600 mb-8 border-t border-gray-100 pt-4">
                        <h4 className="font-bold text-gray-900 mb-2">Leírás</h4>
                        <p>{product.description || "Nincs leírás."}</p>
                        {product.params && (
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                {product.params.split(',').slice(0, 6).map((param, i) => (
                                    <div key={i} className="bg-gray-50 p-2 rounded text-gray-700">{param.trim()}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 mt-auto">
                        <a href={product.link} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg text-center hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center hover:shadow-xl transform hover:-translate-y-1">
                            Megveszem a webshopban <ArrowRight className="ml-2 w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatWidget = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'system', text: 'Szia! Bútor szakértő vagyok. Segíthetek választani?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const lowerQuery = userMsg.toLowerCase();
      const relevantProducts = products.filter(p =>
          (p.name || '').toLowerCase().includes(lowerQuery) ||
          (p.category || '').toLowerCase().includes(lowerQuery) ||
          (p.params && p.params.toLowerCase().includes(lowerQuery))
      ).slice(0, 5);

      let contextText = relevantProducts.length === 0 
          ? "Nincs pontos találat."
          : relevantProducts.map(p => `- ${p.name} (${p.category}): ${formatPrice(p.price)}. Adatok: ${p.params}. Link: ${p.link}`).join('\n');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Te egy segítőkész webshop asszisztens vagy a Marketly bútorboltban.
        VEVŐ: "${userMsg}"
        KÉSZLETÜNK: ${contextText}
        Instrukciók: Válaszolj röviden, kedvesen, magyarul. Ajánlj konkrét terméket linkkel.` }] }] })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'system', text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Hiba történt." }]);
    } catch (error) { setMessages(prev => [...prev, { role: 'system', text: "Hiba az AI kapcsolódásban." }]); } 
    finally { setIsLoading(false); }
  };

  return (
    <div id="mkt-butorbolt-chat" className="fixed bottom-[calc(1.5rem+44px)] md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl mb-4 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-140px)] md:max-h-none overflow-hidden border border-gray-200 animate-fade-in-up">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <span className="font-bold flex items-center"><MessageCircle className="w-5 h-5 mr-2" /> AI Asszisztens</span>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-800'}`}>{msg.text}</div></div>
            ))}
            {isLoading && <div className="text-xs text-gray-400 p-2">Gépelés...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Írj üzenetet..." className="flex-1 p-2 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 text-white p-2 rounded-xl"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform">{isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}</button>
    </div>
  );
};

const VisualSearch = ({ products }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [analysisText, setAnalysisText] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setSelectedImage(reader.result); analyzeImage(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image) => {
    setIsAnalyzing(true); setSearchResults([]); setAnalysisText("Elemzés...");
    try {
      const base64Data = base64Image.split(',')[1];
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Elemezd a bútort. JSON: { \"style\": \"...\", \"category\": \"...\", \"color\": \"...\" } Magyarul." }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const data = await response.json();
      const analysis = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
      if (analysis) {
        setAnalysisText(`Felismerve: ${analysis.style} stílusú ${analysis.color} ${analysis.category}.`);
        const relevant = products.filter(p => p.category.toLowerCase().includes(analysis.category.toLowerCase()) || p.name.toLowerCase().includes(analysis.category.toLowerCase())).slice(0, 4);
        setSearchResults(relevant);
      }
    } catch (error) { setAnalysisText("Hiba az elemzésben."); } 
    finally { setIsAnalyzing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900">AI Vizuális Kereső</h2></div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
        {!selectedImage ? (
          <>
            <div className="bg-indigo-50 p-4 rounded-full mb-4"><Camera className="w-8 h-8 text-indigo-600" /></div>
            <label className="cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Fénykép feltöltése<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
          </>
        ) : (
          <div className="relative w-full max-w-md mx-auto">
            <img src={selectedImage} alt="Uploaded" className="rounded-lg shadow-md max-h-64 mx-auto" />
            <button onClick={() => { setSelectedImage(null); setSearchResults([]); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"><X className="w-4 h-4" /></button>
            {isAnalyzing && <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg"><span className="text-indigo-800 font-bold animate-pulse">Elemzés...</span></div>}
          </div>
        )}
      </div>
      {!isAnalyzing && selectedImage && searchResults.length === 0 && (
        <p className="text-center text-gray-600 py-6">Nincs találat a feltöltött kép alapján. Próbálj másik fotót vagy böngéssz a kategóriákban.</p>
      )}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{searchResults.map(product => (<div key={product.id} className="border border-gray-200 p-4 rounded-xl hover:shadow-lg transition-shadow"><img src={product.images?.[0]} alt={product.name} className="h-32 mx-auto object-contain" /><p className="font-bold mt-2 truncate">{product.name}</p><p>{formatPrice(product.price)}</p></div>))}</div>
      )}
    </div>
  );
};

const RoomPlanner = ({ products }) => {
  const [background, setBackground] = useState(null);
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setBackground(reader.result); reader.readAsDataURL(file); }
  };

  const addItem = (product) => {
    if (!background) { alert("Tölts fel szobát!"); return; }
    setPlacedItems([...placedItems, { id: Date.now(), image: product.images[0], x: 50, y: 50, scale: 1 }]);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-6 h-[80vh]">
      <div className="lg:w-1/4 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50"><h3 className="font-bold">Bútorok</h3></div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {products.slice(0, 50).map(p => (
                  <div key={p.id} onClick={() => addItem(p)} className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded cursor-pointer"><img src={p.images[0]} className="w-12 h-12 object-contain" /><p className="text-xs font-bold truncate w-24">{p.name}</p></div>
              ))}
          </div>
      </div>
      <div className="lg:w-3/4 bg-gray-100 rounded-2xl border-2 border-dashed relative overflow-hidden flex items-center justify-center">
          {!background ? (
              <label className="bg-indigo-600 text-white px-6 py-3 rounded-xl cursor-pointer">Szobafotó feltöltése<input type="file" className="hidden" accept="image/*" onChange={handleBackgroundUpload} /></label>
          ) : (
              <div className="relative w-full h-full">
                  <img src={background} className="w-full h-full object-cover" />
                  {placedItems.map((item) => (
                      <div key={item.id} className="absolute w-32 cursor-move" style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translate(-50%, -50%) scale(${item.scale})` }} onClick={() => setSelectedItemId(item.id)}>
                          <img src={item.image} className="w-full" />
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(DISPLAY_BATCH);
  const visibleCountRef = useRef(visibleCount);
  const filteredLengthRef = useRef(0);
  const hasMoreProductsRef = useRef(hasMoreProducts);
  const isLoadingMoreRef = useRef(isLoadingMore);
  visibleCountRef.current = visibleCount;
  // filteredLengthRef.current updated below after filteredAndSortedProducts is defined
  hasMoreProductsRef.current = hasMoreProducts;
  isLoadingMoreRef.current = isLoadingMore;
  const [wishlist, setWishlist] = useLocalStorage('mkt_wishlist', []);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Összes");
  const [sortOption, setSortOption] = useState("default");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);
  const [onboardingFeature, setOnboardingFeature] = useState('chat');
  const [advancedFilters, setAdvancedFilters] = useState({});
  
  // AI Feature states
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);
  const [showRoomDesigner, setShowRoomDesigner] = useState(false);
  
  // Quick Peek & AR states
  const [quickPeekProduct, setQuickPeekProduct] = useState(null);
  const [showARPreview, setShowARPreview] = useState(false);
  const [arProduct, setArProduct] = useState(null);
  
  // UNAS API states
  const [isLoadingUnas, setIsLoadingUnas] = useState(true);
  const [unasError, setUnasError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('demo');
  
  // New hooks
  const toast = useToast();
  const comparison = useComparison();
  
  // Track product views
  const handleProductView = (product) => {
    trackProductView(product);
    setSelectedProduct(product);
  };

  const toggleWishlist = (id) => {
    const isAdding = !wishlist.includes(id);
    setWishlist(prev => 
      isAdding 
        ? [...prev, id] 
        : prev.filter(item => item !== id)
    );
    
    if (isAdding) {
      toast.wishlist('Hozzáadva a kívánságlistához!');
    } else {
      toast.info('Eltávolítva a kívánságlistáról');
    }
  };
  
  const handleToggleComparison = (product) => {
    const result = comparison.toggleComparison(product);
    if (result.success) {
      if (result.action === 'added') {
        toast.success('Hozzáadva az összehasonlításhoz!');
      } else {
        toast.info('Eltávolítva az összehasonlításból');
      }
    } else {
      toast.error(result.message);
    }
  };
  
  // Server-side search state
  const [serverSearchQuery, setServerSearchQuery] = useState('');
  const [serverCategory, setServerCategory] = useState('');
  const searchTimeoutRef = useRef(null);

  // FAST LOADING: Load ALL products at once (slim mode + GZIP compression)
  // This ensures all categories are available immediately
  const loadUnasData = useCallback(async (options = {}) => {
    const { silent = false, search = '', category = '' } = options;
    
    if (!silent) {
      setIsLoadingUnas(true);
      setUnasError(null);
    }
    
    try {
      // Load ALL products at once - slim mode + GZIP makes this fast (~2-3 sec)
      const params = { 
        slim: true,
        ...(search && { search }),
        ...(category && category !== 'Összes' && { category })
      };
      
      const data = await fetchUnasProducts(params);
      const newProducts = (data.products || []).map(p => ({
        ...p,
        images: p.image ? [p.image] : [],
        inStock: p.inStock ?? true
      }));
      
      const totalCount = data.total ?? newProducts.length;
      
      setProducts(newProducts);
      setVisibleCount(DISPLAY_BATCH);
      setTotalProductsCount(totalCount);
      setHasMoreProducts(false); // All products loaded
      setLastUpdated(data.lastSync || data.lastUpdated);
      setDataSource('unas');
      setUnasError(null);
      
    } catch (err) {
      console.error('Load error:', err);
      if (!silent) setUnasError('Termékek betöltése sikertelen');
    } finally {
      if (!silent) setIsLoadingUnas(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Debounced server-side search
  const handleServerSearch = useCallback((query) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setServerSearchQuery(query);
      loadUnasData({ search: query, category: serverCategory });
    }, 300); // 300ms debounce
  }, [loadUnasData, serverCategory]);

  // Server-side category filter
  const handleCategoryChange = useCallback((category) => {
    setCategoryFilter(category);
    setServerCategory(category);
    loadUnasData({ search: serverSearchQuery, category });
  }, [loadUnasData, serverSearchQuery]);

  // Load more is now just showing more from already-loaded products
  // All products are loaded at once, so no server fetch needed
  const loadMoreProducts = useCallback(() => {
    // This is handled by handleLoadMore - just show more from filteredAndSortedProducts
  }, []);

  const loadUnasDataRef = useRef(loadUnasData);
  loadUnasDataRef.current = loadUnasData;

  useEffect(() => {
    loadUnasDataRef.current({}); // Initial load with no filters
  }, []);

  useEffect(() => {
    const t = setInterval(() => loadUnasDataRef.current?.({ silent: true }), 300000);
    return () => clearInterval(t);
  }, []);
  
  // Products are already filtered server-side (search + category)
  // Only apply client-side sorting and advanced filters
  const filteredAndSortedProducts = useMemo(() => {
      let result = products;
      // Advanced filters (price range, etc.) - still client-side for now
      if (Object.keys(advancedFilters).length > 0) result = applyFilters(result, advancedFilters);
      // Sorting
      if (sortOption === 'price-asc') result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
      if (sortOption === 'price-desc') result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
      return result;
  }, [products, sortOption, advancedFilters]);

  // Update ref after filteredAndSortedProducts is defined
  filteredLengthRef.current = filteredAndSortedProducts.length;

  // Show first visibleCount items from filtered products
  const displayedProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMoreToShow = visibleCount < filteredAndSortedProducts.length;

  // When sort/advanced filters change, reset visible window
  useEffect(() => {
    setVisibleCount(DISPLAY_BATCH);
  }, [sortOption, advancedFilters]);

  // Manual "Load More" button handler - shows more from already-loaded products
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + DISPLAY_BATCH, filteredAndSortedProducts.length));
  }, [filteredAndSortedProducts.length]);

  // Compute categories from products (already filtered by EXCLUDED_MAIN_CATEGORIES)
  // This ensures only valid categories with actual products are shown
  const categories = useMemo(() => {
    if (!products || products.length === 0) return ['Összes'];
    
    // Count products per category
    const categoryCount = new Map();
    for (const p of products) {
      if (p.category) {
        categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
      }
    }
    
    // Sort by count (most products first)
    const sorted = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
    
    return [{ name: 'Összes', count: products.length }, ...sorted];
  }, [products]);

  return (
    <ToastProvider>
    <div id="mkt-butorbolt-app" className="min-h-screen bg-white font-sans text-gray-900">
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        wishlistCount={wishlist.length}
        productCount={products.length}
      />
      
      {/* AI Onboarding */}
      <AIOnboarding 
        isOpen={showAIOnboarding} 
        onClose={() => setShowAIOnboarding(false)}
        targetFeature={onboardingFeature}
      />
      
      {/* Live Social Proof */}
      <LiveSocialProof 
        currentProduct={selectedProduct} 
        recentPurchases={products.slice(0, 10)}
      />
      
      {/* Back to Top Button */}
      <BackToTop />
      
      {/* AI Chat Assistant */}
      <AIChatAssistant products={products} />

      <main id="mkt-butorbolt-main">
        {activeTab === 'shop' && (
          <>
            <ModernHero 
              onExplore={() => {
                const productsSection = document.getElementById('products-section');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              onTryAI={() => setActiveTab('visual-search')}
            />
            <AIFeaturesShowcase 
              onFeatureClick={(feature) => {
                if (feature.title.includes('Képfelismerés')) setActiveTab('visual-search');
                else if (feature.title.includes('Asszisztens')) {
                  const chat = document.getElementById('mkt-butorbolt-chat');
                  chat?.scrollIntoView({ behavior: 'smooth' });
                }
                else if (feature.title.includes('Tervező')) setActiveTab('room-planner');
              }}
            />
            
            {/* AI Super Features Row */}
            <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8 lg:py-12">
              <div className="text-center mb-6 lg:mb-8">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-indigo-100 rounded-full mb-5">
                  <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                  <span className="text-base lg:text-lg font-bold text-indigo-600">AI Powered</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                  AI Szuper Funkciók
                </h2>
                <p className="text-lg lg:text-xl text-gray-600">
                  Próbáld ki a legújabb AI technológiáinkat!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setShowStyleQuiz(true)}
                  className="
                    group p-5 sm:p-8 rounded-2xl
                    bg-gradient-to-br from-indigo-50 to-purple-50
                    hover:from-indigo-100 hover:to-purple-100
                    border-2 border-transparent hover:border-indigo-300
                    transition-all duration-300
                    hover:shadow-xl hover:scale-[1.02]
                    text-left
                  "
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform shrink-0">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                        AI Stílus Quiz
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 sm:mb-3">
                        5 kérdés, és megismered a Style DNA-d! Személyre szabott ajánlatok.
                      </p>
                      <span className="text-indigo-600 font-semibold text-sm flex items-center gap-2">
                        Kipróbálom <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowRoomDesigner(true)}
                  className="
                    group p-5 sm:p-8 rounded-2xl
                    bg-gradient-to-br from-purple-50 to-pink-50
                    hover:from-purple-100 hover:to-pink-100
                    border-2 border-transparent hover:border-purple-300
                    transition-all duration-300
                    hover:shadow-xl hover:scale-[1.02]
                    text-left
                  "
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white group-hover:scale-110 transition-transform shrink-0">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                        AI Szoba Tervező
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 sm:mb-3">
                        Töltsd fel a szobád fotóját, és az AI megtervezi neked!
                      </p>
                      <span className="text-purple-600 font-semibold text-sm flex items-center gap-2">
                        Kipróbálom <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <SocialProof />
            <LiveShowcase 
              products={products.slice(0, 6)} 
              onProductClick={handleProductView}
            />
            <Features />
            
            {/* Category Page View - shown when specific category selected */}
            {categoryFilter && categoryFilter !== "Összes" && !isLoadingUnas ? (
              <CategoryPage
                category={categoryFilter}
                products={filteredAndSortedProducts}
                allCategories={categories}
                onBack={() => handleCategoryChange("Összes")}
                onProductClick={handleProductView}
                onWishlistToggle={toggleWishlist}
                onCategoryChange={handleCategoryChange}
                wishlist={wishlist}
                onAskAI={() => setShowStyleQuiz(true)}
                visibleCount={visibleCount}
                onLoadMore={handleLoadMore}
              />
            ) : (
            <section id="products-section" className="container-app section-padding">
                {/* Sticky products header - PROMINENT */}
                <div className="sticky top-16 sm:top-20 z-40 mx-0 sm:-mx-4 lg:-mx-8 xl:-mx-10 px-3 sm:px-4 lg:px-8 xl:px-10 py-3 sm:py-4 lg:py-5 xl:py-6 mb-3 sm:mb-4 lg:mb-8 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
                    {/* Title & Count */}
                    <div className="flex items-baseline gap-2 sm:gap-3 lg:gap-4">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900">Termékek</h2>
                      {!isLoadingUnas && (
                        <span className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-500">
                          <span className="font-semibold text-indigo-600">{products.length.toLocaleString('hu-HU')}</span> db
                        </span>
                      )}
                    </div>
                    
                    {/* Search & Filters */}
                    <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <div className="flex-1 sm:flex-initial sm:w-64 lg:w-80 xl:w-[420px] 2xl:w-[500px]">
                        <SmartSearch 
                          products={products}
                          onSearch={handleServerSearch}
                          onSelectProduct={handleProductView}
                        />
                      </div>
                      <AdvancedFilters
                        products={products}
                        onFilterChange={setAdvancedFilters}
                        initialFilters={advancedFilters}
                      />
                      <select 
                        onChange={(e) => setSortOption(e.target.value)} 
                        className="hidden sm:block px-4 lg:px-5 xl:px-6 py-3 lg:py-3.5 xl:py-4 min-h-[48px] lg:min-h-[52px] xl:min-h-[56px] text-sm sm:text-base lg:text-lg xl:text-xl border-2 border-gray-200 rounded-xl lg:rounded-2xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer font-medium"
                        aria-label="Rendezés"
                      >
                        <option value="default">Rendezés</option>
                        <option value="price-asc">Ár: alacsony → magas</option>
                        <option value="price-desc">Ár: magas → alacsony</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Category Navigation */}
                <CategorySwipe
                  categories={categories.map((cat, idx) => ({
                    id: cat.name,
                    name: cat.name,
                    totalCount: cat.count,
                    icon: null // Icons handled by CategorySwipe component
                  }))}
                  activeCategory={categoryFilter}
                  onCategoryChange={handleCategoryChange}
                  displayedCount={Math.min(visibleCount, filteredAndSortedProducts.length)}
                />

                {/* Loading State */}
                {isLoadingUnas && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500 font-medium">Termékek betöltése...</p>
                    </div>
                    <div className="product-grid">
                      {[...Array(12)].map((_, i) => (
                        <ProductCardSkeleton key={`skeleton-${i}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* API Error State */}
                {!isLoadingUnas && unasError && (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nem sikerült betölteni a termékeket</h3>
                    <p className="text-gray-600 mb-6 max-w-md">Próbáld később, vagy ellenőrizd a kapcsolatot.</p>
                    <button
                      type="button"
                      onClick={() => loadUnasData(false)}
                      className="px-6 py-3 min-h-[44px] bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Újrapróbálás
                    </button>
                  </div>
                )}

                {/* Empty State (no error, just no products) */}
                {!isLoadingUnas && !unasError && displayedProducts.length === 0 && (
                  searchQuery ? (
                    <NoSearchResults 
                      query={searchQuery}
                      onClear={() => { setSearchQuery(''); handleServerSearch(''); }}
                    />
                  ) : (
                    <NoFilterResults 
                      onClearFilters={() => {
                        handleCategoryChange("Összes");
                        setAdvancedFilters({});
                      }}
                    />
                  )
                )}

                {/* Products Grid - Responsive with Scroll Animations */}
                {!isLoadingUnas && displayedProducts.length > 0 && (
                  <div className="product-grid">
                    {displayedProducts.map((product, index) => (
                      <EnhancedProductCard 
                        key={product.id}
                        product={product} 
                        onToggleWishlist={toggleWishlist} 
                        isWishlisted={wishlist.includes(product.id)} 
                        onQuickView={handleProductView}
                        index={index}
                      />
                    ))}
                  </div>
                )}
                
                {/* Load More Button */}
                {!isLoadingUnas && !unasError && displayedProducts.length > 0 && (
                  <div className="py-8 sm:py-10 lg:py-14 flex flex-col items-center gap-4">
                    {hasMoreToShow ? (
                      <button
                        onClick={handleLoadMore}
                        className="px-6 sm:px-8 lg:px-10 py-3.5 sm:py-4 lg:py-5 min-h-[48px] lg:min-h-[56px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl lg:rounded-2xl
                                   hover:from-indigo-700 hover:to-purple-700 transition-all duration-200
                                   shadow-lg hover:shadow-xl active:scale-[0.98]
                                   flex items-center gap-3 sm:gap-4 text-base sm:text-lg lg:text-xl"
                      >
                        <span>Több termék</span>
                        <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 bg-white/20 rounded-lg text-sm sm:text-base">
                          {displayedProducts.length.toLocaleString('hu-HU')} / {filteredAndSortedProducts.length.toLocaleString('hu-HU')}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 text-sm sm:text-base lg:text-lg text-gray-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Minden termék ({displayedProducts.length.toLocaleString('hu-HU')} db)</span>
                      </div>
                    )}
                  </div>
                )}
            </section>
            )}
            
            {/* Recently Viewed Products */}
            <RecentlyViewed
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
              onQuickView={handleProductView}
            />
            
            <Testimonials />
            
            {/* Final CTA */}
            <InteractiveCTA 
              onGetStarted={() => {
                const productsSection = document.getElementById('products-section');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </>
        )}
        
        {activeTab === 'visual-search' && <VisualSearch products={products} onAddToCart={() => {}} />}
        {activeTab === 'room-planner' && <RoomPlanner products={products} />}
      </main>

      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
      
      {/* Similar Products AI Recommendation */}
      {selectedProduct && (
        <SimilarProducts
          currentProduct={selectedProduct}
          allProducts={products}
          onToggleWishlist={toggleWishlist}
          wishlist={wishlist}
          onQuickView={handleProductView}
        />
      )}
      
      {/* Product Comparison */}
      <ProductComparison
        comparisonList={comparison.comparisonList}
        onRemove={comparison.removeFromComparison}
        onClear={comparison.clearComparison}
      />
      
      {/* AI Style Quiz Modal */}
      {showStyleQuiz && (
        <AIStyleQuiz
          products={products}
          onRecommendations={(recs) => {
            toast.success(`${recs.length} termék a Style DNA-d alapján!`);
          }}
          onClose={() => setShowStyleQuiz(false)}
        />
      )}
      
      {/* AI Room Designer Modal */}
      {showRoomDesigner && (
        <AIRoomDesigner
          products={products}
          onProductRecommendations={(recs) => {
            toast.success(`${recs.length} termék ajánlat!`);
          }}
          onClose={() => setShowRoomDesigner(false)}
        />
      )}

      {/* Product Quick Peek Modal */}
      <ProductQuickPeek
        product={quickPeekProduct}
        isOpen={!!quickPeekProduct}
        onClose={() => setQuickPeekProduct(null)}
        onAddToCart={(product) => {
          toast.success(`${product.name} hozzáadva a kosárhoz!`);
          setQuickPeekProduct(null);
        }}
      />

      {/* AR Product Preview */}
      {showARPreview && arProduct && (
        <ARProductPreview
          product={arProduct}
          onClose={() => {
            setShowARPreview(false);
            setArProduct(null);
          }}
        />
      )}

      {/* Smart Newsletter Popup */}
      <SmartNewsletterPopup
        onSubscribe={(email) => {
          toast.success('Sikeres feliratkozás! Ellenőrizd az email fiókod.');
          return Promise.resolve();
        }}
      />
    </div>
    </ToastProvider>
  );
};

export default App;
