import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { ShoppingCart, Camera, MessageCircle, X, Send, Plus, Move, Trash2, Home, ZoomIn, ZoomOut, Upload, Settings, Link as LinkIcon, FileText, RefreshCw, AlertCircle, Database, Lock, Search, ChevronLeft, ChevronRight, Filter, Heart, ArrowDownUp, Info, Check, Star, Truck, ShieldCheck, Phone, ArrowRight, Mail, Eye, Sparkles, Lightbulb, Image as ImageIcon, MousePointer2, Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { fetchUnasProducts, refreshUnasProducts } from './services/unasApi';

// New UI Components
import { ProductCardSkeleton, ChatMessageSkeleton } from './components/ui/Skeleton';
import { ToastContainer } from './components/ui/Toast';
import { EmptyState } from './components/ui/EmptyState';
import { AIBadge } from './components/ui/Badge';

// AI Components
import { AIShowcase, AIOnboarding } from './components/ai/AIShowcase';
import AIChatAssistant from './components/ai/AIChatAssistant';
import AIRoomDesigner from './components/ai/AIRoomDesigner';
import AIStyleQuiz from './components/ai/AIStyleQuiz';

// Category Components
import CategorySwipe from './components/category/CategorySwipe';

// UX Components
import ScrollProgress from './components/ux/ScrollProgress';
import BackToTop from './components/ux/BackToTop';
import LiveSocialProof from './components/ux/LiveSocialProof';

// Landing Components
import { ModernHero, AIFeaturesShowcase } from './components/landing/ModernHero';
import { SocialProof, LiveShowcase, InteractiveCTA } from './components/landing/ShowcaseSections';
import { Footer } from './components/landing/Footer';

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

// Search Components (lazy loaded to avoid TDZ issues with framer-motion)
const VoiceSearch = lazy(() => import('./components/search/VoiceSearch'));

// Marketing Components
import SmartNewsletterPopup from './components/marketing/SmartNewsletterPopup';

// AR Components
import ARProductPreview from './components/ar/ARProductPreview';

// Hooks
import { useToast } from './hooks/useToast';
import { useLocalStorage } from './hooks/index';
import { useInfiniteScroll, InfiniteScrollSentinel } from './hooks/useInfiniteScroll.jsx';

// Utils
import { getOptimizedImageProps } from './utils/imageOptimizer';
import { PLACEHOLDER_IMAGE } from './utils/helpers';

/* --- 1. KONFIGURÁCIÓ & ADATOK --- */

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyDZV-fAFVCvh4Ad2lKlARMdtHoZWNRwZQA"; 
const WEBSHOP_DOMAIN = "https://www.marketly.hu";
const SHOP_ID = "81697"; 

const INITIAL_PAGE_SIZE = 2000;
const DISPLAY_BATCH = 48;

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

const Navbar = ({ activeTab, setActiveTab, wishlistCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const setTabAndClose = (tab) => {
    setActiveTab(tab);
    closeMobileMenu();
  };

  return (
    <nav id="mkt-butorbolt-navbar" className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[4rem] h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => setActiveTab('shop')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-200">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-2xl text-gray-900 tracking-tight">Marketly</span>
              <span className="text-indigo-600 font-bold text-2xl">.AI</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setActiveTab('shop')} className={`text-sm font-medium transition-colors ${activeTab === 'shop' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Főoldal</button>
            <button onClick={() => setActiveTab('visual-search')} className={`flex items-center text-sm font-medium transition-colors ${activeTab === 'visual-search' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}><Camera className="w-4 h-4 mr-1.5" /> Képkereső</button>
            <button onClick={() => setActiveTab('room-planner')} className={`flex items-center text-sm font-medium transition-colors ${activeTab === 'room-planner' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}><Move className="w-4 h-4 mr-1.5" /> Szobatervező</button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-red-500 cursor-pointer transition-colors group" aria-label="Kívánságlista">
              <Heart className={`h-6 w-6 transition-transform group-hover:scale-110 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlistCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">{wishlistCount}</span>}
            </div>
            <button
              type="button"
              className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menü megnyitása"
            >
              <Menu className="w-6 h-6" />
            </button>
            <a href={WEBSHOP_DOMAIN} target="_blank" rel="noopener noreferrer" className="hidden sm:block bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-h-[44px] flex items-center">
              Belépés
            </a>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay / drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <div
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col animate-fade-in"
              role="dialog"
              aria-label="Navigációs menü"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <span className="font-bold text-lg text-gray-900">Menü</span>
                <button
                  type="button"
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
                  onClick={closeMobileMenu}
                  aria-label="Menü bezárása"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 flex flex-col gap-2">
                <button onClick={() => setTabAndClose('shop')} className={`flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left font-medium transition-colors ${activeTab === 'shop' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Home className="w-5 h-5" /> Főoldal
                </button>
                <button onClick={() => setTabAndClose('visual-search')} className={`flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left font-medium transition-colors ${activeTab === 'visual-search' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Camera className="w-5 h-5" /> Képkereső
                </button>
                <button onClick={() => setTabAndClose('room-planner')} className={`flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left font-medium transition-colors ${activeTab === 'room-planner' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Move className="w-5 h-5" /> Szobatervező
                </button>
                <a href={WEBSHOP_DOMAIN} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-4 py-3 min-h-[44px] rounded-xl text-left font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors mt-4" onClick={closeMobileMenu}>
                  Belépés a webshopba
                </a>
              </nav>
            </div>
          </>
        )}
      </AnimatePresence>
    </nav>
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
    <div className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center p-6 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Ingyenes Szállítás</h3>
                        <p className="text-sm text-gray-500">Minden 50.000 Ft feletti rendelésnél.</p>
                    </div>
                </div>
                <div className="flex items-center p-6 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mr-4">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Garancia</h3>
                        <p className="text-sm text-gray-500">Minden bútorra teljes körű garancia.</p>
                    </div>
                </div>
                <div className="flex items-center p-6 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Ügyfélszolgálat</h3>
                        <p className="text-sm text-gray-500">Szakértő segítség minden nap.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Testimonials = () => (
    <div className="bg-gray-50 py-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Mit mondanak rólunk?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Kovács Anna", text: "Az AI segítségével találtam meg a kanapét, ami pont illik a függönyhöz.", role: "Lakberendező" },
                    { name: "Nagy Péter", text: "Gyors szállítás, és a minőség is kiváló. A képkereső funkció nagyon hasznos.", role: "Vásárló" },
                    { name: "Szabó Éva", text: "Végre egy webshop, ahol nem kell órákig görgetni. Az asszisztens azonnal segített.", role: "Vásárló" }
                ].map((t, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left">
                        <div className="flex text-yellow-400 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                        <p className="text-gray-600 mb-6 italic">"{t.text}"</p>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 mr-3">
                                {t.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{t.name}</h4>
                                <p className="text-xs text-gray-500">{t.role}</p>
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
    <div id="mkt-butorbolt-chat" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl mb-4 w-80 sm:w-96 overflow-hidden border border-gray-200 animate-fade-in-up">
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
  const loadMoreSentinelRef = useRef(null);
  const visibleCountRef = useRef(visibleCount);
  const filteredLengthRef = useRef(0);
  const hasMoreProductsRef = useRef(hasMoreProducts);
  const isLoadingMoreRef = useRef(isLoadingMore);
  visibleCountRef.current = visibleCount;
  filteredLengthRef.current = filteredAndSortedProducts.length;
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
      toast.wishlist('Hozzáadva a kívánságlistához! ❤️');
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
  
  // Initial load: first batch only for fast display. Background refresh: silent, replace current data.
  const loadUnasData = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoadingUnas(true);
      setUnasError(null);
    }
    try {
      const offset = silent ? 0 : 0;
      const limit = silent && products.length > 0 ? Math.max(INITIAL_PAGE_SIZE, products.length) : INITIAL_PAGE_SIZE;
      const data = await fetchUnasProducts({ limit, offset });
      const list = data.products || [];
      if (!silent) {
        setProducts(list);
        setTotalProductsCount(data.total ?? list.length);
        setHasMoreProducts((data.total ?? 0) > list.length);
        setVisibleCount(DISPLAY_BATCH);
      } else if (list.length > 0) {
        setProducts(list);
        setTotalProductsCount(data.total ?? list.length);
        setHasMoreProducts((data.total ?? 0) > list.length);
      }
      setLastUpdated(data.lastSync || data.lastUpdated);
      if (list.length > 0) {
        setDataSource('unas');
        setUnasError(null);
      } else if (!silent) {
        setUnasError(data.error || 'Nincs termék');
      }
    } catch (_) {
      if (!silent) setUnasError('Termékek betöltése sikertelen');
    } finally {
      if (!silent) setIsLoadingUnas(false);
    }
  }, [products.length]);

  // Load more from API when user scrolls to bottom
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMoreProducts || products.length >= totalProductsCount) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchUnasProducts({ limit: INITIAL_PAGE_SIZE, offset: products.length });
      const list = data.products || [];
      if (list.length > 0) {
        setProducts(prev => [...prev, ...list]);
        setHasMoreProducts(products.length + list.length < (data.total ?? 0));
      } else {
        setHasMoreProducts(false);
      }
    } catch (_) {
      setHasMoreProducts(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreProducts, products.length, totalProductsCount]);

  const loadUnasDataRef = useRef(loadUnasData);
  loadUnasDataRef.current = loadUnasData;

  useEffect(() => {
    loadUnasDataRef.current(false);
  }, []);

  useEffect(() => {
    const t = setInterval(() => loadUnasDataRef.current?.(true), 300000);
    return () => clearInterval(t);
  }, []);
  
  const filteredAndSortedProducts = useMemo(() => {
      let result = products;
      const q = (searchQuery || '').toLowerCase();
      if (q) result = result.filter(p => (p.name || '').toLowerCase().includes(q));
      if (categoryFilter !== 'Összes') result = result.filter(p => p.category === categoryFilter);
      if (Object.keys(advancedFilters).length > 0) result = applyFilters(result, advancedFilters);
      if (sortOption === 'price-asc') result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
      if (sortOption === 'price-desc') result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
      return result;
  }, [products, searchQuery, categoryFilter, sortOption, advancedFilters]);

  // Infinite scroll: show first visibleCount items; when sentinel visible, show more or load from API
  const displayedProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMoreToShow = visibleCount < filteredAndSortedProducts.length || (hasMoreProducts && products.length < totalProductsCount);

  // When filters/search/category change, scroll list to top and reset visible window
  useEffect(() => {
    setVisibleCount(DISPLAY_BATCH);
    const productsSection = document.getElementById('products-section');
    if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [searchQuery, categoryFilter, sortOption, advancedFilters]);

  // Infinite scroll: when sentinel is visible, show more items or load from API
  useEffect(() => {
    const el = loadMoreSentinelRef.current;
    if (!el || !(el instanceof Element)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        const v = visibleCountRef.current;
        const len = filteredLengthRef.current;
        if (v < len) {
          setVisibleCount(prev => Math.min(prev + DISPLAY_BATCH, len));
          return;
        }
        if (hasMoreProductsRef.current && !isLoadingMoreRef.current) loadMoreProducts();
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMoreProducts]);

  const categories = useMemo(() => {
      const seen = new Set();
      const step = Math.max(1, Math.floor(products.length / 500));
      for (let i = 0; i < products.length && seen.size < 200; i += step) {
        const c = products[i]?.category;
        if (c) seen.add(c);
      }
      return ['Összes', ...[...seen].sort()];
  }, [products]);

  return (
    <div id="mkt-butorbolt-app" className="min-h-screen bg-white font-sans text-gray-900">
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} wishlistCount={wishlist.length} />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  🤖 AI Szuper Funkciók
                </h2>
                <p className="text-gray-600">
                  Próbáld ki a legújabb AI technológiáinkat!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setShowStyleQuiz(true)}
                  className="
                    group p-8 rounded-2xl
                    bg-gradient-to-br from-indigo-50 to-purple-50
                    hover:from-indigo-100 hover:to-purple-100
                    border-2 border-transparent hover:border-indigo-300
                    transition-all duration-300
                    hover:shadow-xl hover:scale-105
                    text-left
                  "
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        AI Stílus Quiz 🧬
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
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
                    group p-8 rounded-2xl
                    bg-gradient-to-br from-purple-50 to-pink-50
                    hover:from-purple-100 hover:to-pink-100
                    border-2 border-transparent hover:border-purple-300
                    transition-all duration-300
                    hover:shadow-xl hover:scale-105
                    text-left
                  "
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        AI Szoba Tervező 📸
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
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
            
            <div id="products-section" className="container-app py-10">
                {/* Sticky products header: search + filters + sort */}
                <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 2xl:-mx-10 2xl:px-10 mb-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold">Termékek {!isLoadingUnas && <span className="text-gray-400 text-lg sm:text-xl ml-2">({filteredAndSortedProducts.length})</span>}</h2>
                    <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
                      <div className="flex-1 md:flex-initial flex items-center gap-2 min-w-0">
                        <SmartSearch 
                          products={products}
                          onSearch={(query) => setSearchQuery(query)}
                          onSelectProduct={handleProductView}
                        />
                        <Suspense fallback={<div className="p-3 rounded-full bg-gray-200 animate-pulse w-11 h-11" />}>
                          <VoiceSearch
                            onSearchQuery={(query) => setSearchQuery(query)}
                            className="group"
                          />
                        </Suspense>
                      </div>
                      <div className="relative">
                        <AdvancedFilters
                          products={products}
                          onFilterChange={setAdvancedFilters}
                          initialFilters={advancedFilters}
                        />
                      </div>
                      <select 
                        onChange={(e) => setSortOption(e.target.value)} 
                        className="px-4 py-3 min-h-[44px] border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        aria-label="Rendezés"
                      >
                        <option value="default">Rendezés</option>
                        <option value="price-asc">Ár ↑</option>
                        <option value="price-desc">Ár ↓</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Category Swipe Navigation */}
                <CategorySwipe
                  categories={categories.map((cat, idx) => ({
                    id: cat,
                    name: cat,
                    count: filteredAndSortedProducts.filter(p => cat === "Összes" || p.category === cat).length,
                    icon: cat === "Összes" ? "🏠" : idx % 6 === 0 ? "🛋️" : idx % 6 === 1 ? "🪑" : idx % 6 === 2 ? "🛏️" : idx % 6 === 3 ? "🪞" : idx % 6 === 4 ? "💡" : "📦"
                  }))}
                  activeCategory={categoryFilter}
                  onCategoryChange={(catId) => setCategoryFilter(catId)}
                />

                {/* Loading State */}
                {isLoadingUnas && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 text-center font-medium">Termékek betöltése...</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                      {[...Array(8)].map((_, i) => (
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
                  <EmptyState 
                    type="products"
                    action="Minden kategória megtekintése"
                    onAction={() => setCategoryFilter("Összes")}
                  />
                )}

                {/* Products Grid */}
                {!isLoadingUnas && displayedProducts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                      {displayedProducts.map(product => (
                          <div 
                            key={product.id}
                            onClick={() => setQuickPeekProduct(product)}
                            className="cursor-pointer group"
                          >
                            <EnhancedProductCard 
                              product={product} 
                              onToggleWishlist={toggleWishlist} 
                              isWishlisted={wishlist.includes(product.id)} 
                              onQuickView={handleProductView}
                              isInComparison={comparison.isInComparison(product.id)}
                              onToggleComparison={handleToggleComparison}
                            />
                          </div>
                      ))}
                  </div>
                )}
                
                {/* Infinite scroll: load more when sentinel visible */}
                {!isLoadingUnas && !unasError && displayedProducts.length > 0 && (
                  <div ref={loadMoreSentinelRef} className="py-8 flex justify-center min-h-[80px]">
                    {isLoadingMore && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-500 font-medium">Több termék betöltése...</span>
                      </div>
                    )}
                    {!isLoadingMore && !hasMoreToShow && filteredAndSortedProducts.length > 0 && (
                      <span className="text-sm text-gray-400">✓ Minden termék betöltve</span>
                    )}
                  </div>
                )}
            </div>
            
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

      <Footer />

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
      <AnimatePresence>
        {showStyleQuiz && (
          <AIStyleQuiz
            products={products}
            onRecommendations={(recs) => {
              toast.success(`${recs.length} termék a Style DNA-d alapján!`);
            }}
            onClose={() => setShowStyleQuiz(false)}
          />
        )}
      </AnimatePresence>
      
      {/* AI Room Designer Modal */}
      <AnimatePresence>
        {showRoomDesigner && (
          <AIRoomDesigner
            products={products}
            onProductRecommendations={(recs) => {
              toast.success(`${recs.length} termék ajánlat!`);
            }}
            onClose={() => setShowRoomDesigner(false)}
          />
        )}
      </AnimatePresence>

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
  );
};

export default App;
