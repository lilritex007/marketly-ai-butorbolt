import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, Suspense, lazy } from 'react';
import { ShoppingCart, Camera, MessageCircle, X, Send, Plus, Move, Trash2, Home, ZoomIn, ZoomOut, Upload, Settings, Link as LinkIcon, FileText, RefreshCw, AlertCircle, Database, Lock, Search, ChevronLeft, ChevronRight, Filter, Heart, ArrowDownUp, Info, Check, Star, Truck, ShieldCheck, Phone, ArrowRight, Mail, Eye, Sparkles, Lightbulb, Image as ImageIcon, MousePointer2, Menu, Bot, Moon, Sun, Clock, Gift, Zap, TrendingUp, Instagram, Facebook, MapPin, Sofa, Lamp, BedDouble, Armchair, Grid3X3, ExternalLink, Timer, ChevronDown } from 'lucide-react';
// framer-motion removed due to Vite production build TDZ issues
import { fetchUnasProducts, refreshUnasProducts, fetchCategories, fetchCategoryHierarchy, fetchSearchIndex, fetchProductStats, fetchUnasProductById } from './services/unasApi';
import { smartSearch } from './services/aiSearchService';
import { trackProductView as trackProductViewPref, getPersonalizedRecommendations, getSimilarProducts } from './services/userPreferencesService';
import { generateText, analyzeImage as analyzeImageAI } from './services/geminiService';

// New UI Components
import { ProductCardSkeleton, ProductGridSkeleton, CategorySkeleton } from './components/ui/Skeleton';
import { ToastProvider, useToast } from './components/ui/Toast';
import { NoSearchResults, NoFilterResults, ErrorState } from './components/ui/EmptyState';
import { SmartBadges } from './components/ui/Badge';

// AI Components
import { AIShowcase, AIOnboarding } from './components/ai/AIShowcase';
import AIDebugPanel from './components/debug/AIDebugPanel';
// Lazy load heavier AI features for smaller initial bundle
const AIChatAssistant = lazy(() => import('./components/ai/AIChatAssistant'));
const AIRoomDesigner = lazy(() => import('./components/ai/AIRoomDesigner'));
const AIStyleQuiz = lazy(() => import('./components/ai/AIStyleQuiz'));

// Category Components
import CategorySwipe from './components/category/CategorySwipe';
import CategoryPage from './components/category/CategoryPage';
import MainCategoriesSection from './components/category/MainCategoriesSection';
import Navbar from './components/layout/Navbar';

// UX Components
import ScrollProgress from './components/ux/ScrollProgress';
import BackToTop from './components/ux/BackToTop';
import LiveSocialProof from './components/ux/LiveSocialProof';
import LiveActivityStrip from './components/ux/LiveActivityStrip';

// Landing Components  
import { ModernHero } from './components/landing/ModernHero';
import AIModuleUnified from './components/landing/AIModuleUnified';
import { LiveShowcase, InteractiveCTA } from './components/landing/ShowcaseSections';
import InspirationSection from './components/landing/InspirationSection';
import NewArrivalsSection from './components/landing/NewArrivalsSection';
import MostPopularSection from './components/landing/MostPopularSection';
// Footer eltávolítva - a fő UNAS shopnak már van saját láblécce

// Product Components
import { EnhancedProductCard } from './components/product/EnhancedProductCard';
import { SimilarProducts } from './components/product/SimilarProducts';
import { RecentlyViewed, trackProductView } from './components/product/RecentlyViewed';
import { ProductComparison, useComparison } from './components/product/ProductComparison';
import { AdvancedFilters, AdvancedFiltersPanel, applyFilters } from './components/product/AdvancedFilters';
import QuickAddToCart from './components/product/QuickAddToCart';
import ProductQuickPeek from './components/product/ProductQuickPeek';
import AIPricePredictor from './components/ai/AIPricePredictor';

// Search Components - removed VoiceSearch (framer-motion bundling issue)

// Marketing Components
import SmartNewsletterPopup from './components/marketing/SmartNewsletterPopup';
import ExitIntentPopup from './components/marketing/ExitIntentPopup';
import NewsletterStrip from './components/marketing/NewsletterStrip';

// AR Components
import ARProductPreview from './components/ar/ARProductPreview';

// New UX Components
import CompleteTheLook from './components/product/CompleteTheLook';
import PersonalizedSection from './components/home/PersonalizedSection';
import ImageGallery from './components/product/ImageGallery';
import StickyAddToCart from './components/product/StickyAddToCart';
import PriceAlert from './components/product/PriceAlert';
import { FadeInOnScroll, Confetti, CountUp } from './components/ui/Animations';
import BottomSheet from './components/mobile/BottomSheet';

// New UX Components - Phase 2
import WishlistDrawer from './components/wishlist/WishlistDrawer';
import FlashSaleBanner from './components/marketing/FlashSaleBanner';
import DeliveryEstimator from './components/product/DeliveryEstimator';
import StockUrgency from './components/product/StockUrgency';
import ProductShare from './components/product/ProductShare';
import FloatingCartPreview from './components/cart/FloatingCartPreview';
import FreeShippingProgress from './components/cart/FreeShippingProgress';
import QuickActionsBar from './components/product/QuickActionsBar';
import ProductTabs from './components/product/ProductTabs';
import SmartBundle from './components/product/SmartBundle';
import PriceHistory from './components/product/PriceHistory';
import OneClickCheckout from './components/checkout/OneClickCheckout';
import SmartSearchBar from './components/search/SmartSearchBar';
import LoyaltyProgram from './components/loyalty/LoyaltyProgram';
import ARMeasure from './components/ar/ARMeasure';
import StickyAddToCartMobile from './components/mobile/StickyAddToCartMobile';
import TrustBadges from './components/trust/TrustBadges';

// Hooks
import { useLocalStorage, useDebounce } from './hooks/index';
// useInfiniteScroll removed - using manual "Load More" button instead

// Utils
import { getOptimizedImageProps } from './utils/imageOptimizer';
import { PLACEHOLDER_IMAGE, formatPrice } from './utils/helpers';
import { WEBSHOP_DOMAIN, SHOP_ID, DISPLAY_BATCH, INITIAL_PAGE, TAB_HASH, HASH_TO_TAB } from './config';

/* --- 1. KONFIGURÁCIÓ & ADATOK (config.js) --- */

/* --- 2. SEGÉDFÜGGVÉNYEK --- */

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
        <div id="mkt-butorbolt-loader" className="bg-primary-500 text-white py-3 px-4 shadow-md">
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
                        className="bg-white text-primary-500 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors flex items-center shadow-sm"
                    >
                        <Upload className="w-4 h-4 mr-1.5" /> CSV
                    </button>
                    <button 
                        onClick={onUnasRefresh}
                        disabled={isLoadingUnas}
                        className="bg-white text-primary-500 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoadingUnas ? 'animate-spin' : ''}`} /> 
                        {isLoadingUnas ? 'Frissítés...' : 'UNAS Frissítés'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Features = () => (
    <section className="py-12 sm:py-14 bg-white border-t border-gray-100" aria-labelledby="features-heading">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-16">
            <h2 id="features-heading" className="sr-only">Szolgáltatások</h2>
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="group relative flex-1 overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-white to-emerald-50/50 border border-emerald-100 shadow-[0_6px_20px_rgba(16,185,129,0.08)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.14)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="absolute inset-y-4 left-0 w-px bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-300 opacity-70" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Truck className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-base mb-0.5">Ingyenes szállítás</h3>
                            <p className="text-sm text-gray-600">50.000 Ft felett minden rendelésnél</p>
                        </div>
                    </div>
                </div>
                <div className="group relative flex-1 overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-white to-blue-50/50 border border-blue-100 shadow-[0_6px_20px_rgba(59,130,246,0.08)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.14)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="absolute inset-y-4 left-0 w-px bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300 opacity-70" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <ShieldCheck className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-base mb-0.5">2 év garancia</h3>
                            <p className="text-sm text-gray-600">Minden termékre teljes körűen</p>
                        </div>
                    </div>
                </div>
                <div className="group relative flex-1 overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-white to-primary-50/45 border border-primary-100 shadow-[0_6px_20px_rgba(255,138,0,0.08)] hover:shadow-[0_12px_28px_rgba(255,138,0,0.14)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="absolute inset-y-4 left-0 w-px bg-gradient-to-b from-primary-300 via-primary-400 to-primary-300 opacity-70" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Phone className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-base mb-0.5">Ügyfélszolgálat</h3>
                            <p className="text-sm text-gray-600">Szakértő segítség minden nap</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const ProductModal = ({ product, isOpen, onClose, allProducts = [], onAddToCart }) => {
    const [aiTip, setAiTip] = useState(null);
    const [loadingTip, setLoadingTip] = useState(false);
    
    useEffect(() => {
        setAiTip(null);
    }, [product]);

    if (!isOpen || !product) return null;

    const generateStyleTip = async () => {
        setLoadingTip(true);
        try {
            const prompt = `Lakberendező vagy. Adj 2 rövid, konkrét tippet ehhez:
            Termék: ${product.name} (${product.category})
            Paraméterek: ${product.params || "Nincs adat"}
            Válaszolj magyarul, emojikkal.`;

            const result = await generateText(prompt);
            if (result.success) {
                setAiTip(result.text);
            } else {
                setAiTip("Sajnos most nem tudok tippet adni.");
            }
        } catch (error) {
            setAiTip("Sajnos most nem tudok tippet adni.");
        } finally {
            setLoadingTip(false);
        }
    };

    return (
        <div className="fixed inset-0 lg:top-[60px] z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div id="mkt-product-modal-root" className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-6 h-6 text-gray-600" /></button>
                
                <div className="flex flex-col md:flex-row overflow-y-auto">
                  {/* Left: Image Gallery */}
                  <div className="md:w-1/2 bg-gray-50 p-6">
                      <ImageGallery 
                        images={product.images || []} 
                        productName={product.name}
                      />
                  </div>

                  {/* Right: Product Info */}
                  <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-3">
                          <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{product.category}</span>
                          {product.inStock ?? product.in_stock ? 
                              <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-1 rounded-full"><Check className="w-3 h-3 mr-1" /> Raktáron</span> : 
                              <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">Készlethiány</span>
                          }
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h2>
                      <p className="text-2xl md:text-3xl font-bold text-primary-500 mb-4">{formatPrice(product.price)}</p>
                      
                      {/* Price Alert & Share */}
                      <div className="flex items-center gap-3 mb-4">
                        <PriceAlert product={product} />
                        <ProductShare product={product} />
                      </div>
                      
                      {/* Stock Urgency */}
                      <div className="mb-4">
                        <StockUrgency product={product} variant="compact" />
                      </div>
                      
                      {/* Delivery Estimator */}
                      <div className="mb-6">
                        <DeliveryEstimator product={product} variant="compact" />
                      </div>
                      
                      <div className="mb-6">
                          {!aiTip && !loadingTip && (
                              <button onClick={generateStyleTip} className="w-full bg-gradient-to-r from-secondary-50 to-primary-50 hover:from-secondary-100 hover:to-primary-100 text-primary-600 p-4 rounded-xl border border-primary-100 flex items-center justify-center transition-all group">
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
                              <div className="bg-gradient-to-br from-primary-50 to-white p-5 rounded-xl border border-primary-100 shadow-sm animate-fade-in">
                                  <div className="flex items-center mb-2 text-primary-600 font-bold"><Lightbulb className="w-5 h-5 mr-2" /> AI Tipp:</div>
                                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiTip}</div>
                              </div>
                          )}
                      </div>

                      <div className="prose prose-sm text-gray-600 mb-6 border-t border-gray-100 pt-4">
                          <h4 className="font-bold text-gray-900 mb-2">Leírás</h4>
                          <p className="text-sm">{product.description || "Nincs leírás."}</p>
                          {product.params && (
                              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                  {product.params.split(',').slice(0, 6).map((param, i) => (
                                      <div key={i} className="bg-gray-50 p-2 rounded text-gray-700">{param.trim()}</div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Complete The Look - AI Bundle */}
                      {allProducts.length > 0 && (
                        <div className="mb-6">
                          <CompleteTheLook
                            currentProduct={product}
                            allProducts={allProducts}
                            onAddToCart={onAddToCart}
                          />
                        </div>
                      )}

                      {/* Smart Bundle - temporarily disabled for debugging */}
                      {/* {allProducts.length > 0 && (
                        <div className="mb-6">
                          <SmartBundle
                            currentProduct={product}
                            allProducts={allProducts}
                            onAddBundle={(items, price) => {
                              items.forEach(item => onAddToCart(item, 1));
                            }}
                          />
                        </div>
                      )} */}

                      {/* Price History */}
                      <div className="mb-6">
                        <PriceHistory
                          currentPrice={product.price}
                          productId={product.id}
                          onSetAlert={(id, price) => console.log('Alert set for', id, price)}
                        />
                      </div>

                      {/* Product Tabs - Details, Specs, Reviews */}
                      <div className="mb-6">
                        <ProductTabs product={product} />
                      </div>

                      <div className="sticky bottom-0 bg-white pt-4 pb-4 border-t border-gray-200 mt-auto shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                          <div className="flex flex-col xs:flex-row gap-3">
                              <button
                                  type="button"
                                  onClick={() => onAddToCart(product, 1)}
                                  disabled={!(product.inStock ?? product.in_stock)}
                                  className="min-h-[44px] flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold text-base text-center transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                  <ShoppingCart className="w-5 h-5" />
                                  Kosárba
                              </button>
                              <a href={product.link} target="_blank" rel="noopener noreferrer" className="min-h-[44px] flex-1 bg-gray-900 text-white py-3 px-4 rounded-xl font-bold text-base text-center hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 border-2 border-gray-900 hover:border-gray-700">
                                  Megveszem a webshopban <ArrowRight className="w-5 h-5" />
                              </a>
                          </div>
                      </div>
                  </div>
                </div>
            </div>
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
      const prompt = "Elemezd a bútort. JSON: { \"style\": \"...\", \"category\": \"...\", \"color\": \"...\" } Magyarul.";
      
      const result = await analyzeImageAI(base64Data, "image/jpeg", prompt);
      
      if (result.success && result.text) {
        const analysis = JSON.parse(result.text);
        if (analysis) {
          setAnalysisText(`Felismerve: ${analysis.style} stílusú ${analysis.color} ${analysis.category}.`);
          const relevant = products.filter(p => p.category.toLowerCase().includes(analysis.category.toLowerCase()) || p.name.toLowerCase().includes(analysis.category.toLowerCase())).slice(0, 4);
          setSearchResults(relevant);
        }
      } else {
        setAnalysisText("Hiba az elemzésben.");
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
            <div className="bg-primary-50 p-4 rounded-full mb-4"><Camera className="w-8 h-8 text-primary-500" /></div>
            <label className="cursor-pointer bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors">Fénykép feltöltése<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
          </>
        ) : (
          <div className="relative w-full max-w-md mx-auto">
            <img src={selectedImage} alt="Uploaded" className="rounded-lg shadow-md max-h-64 mx-auto" />
            <button onClick={() => { setSelectedImage(null); setSearchResults([]); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"><X className="w-4 h-4" /></button>
            {isAnalyzing && <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg"><span className="text-primary-700 font-bold animate-pulse">Elemzés...</span></div>}
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
                  <div key={p.id} onClick={() => addItem(p)} className="flex items-center gap-3 p-2 hover:bg-primary-50 rounded cursor-pointer"><img src={p.images[0]} className="w-12 h-12 object-contain" /><p className="text-xs font-bold truncate w-24">{p.name}</p></div>
              ))}
          </div>
      </div>
      <div className="lg:w-3/4 bg-gray-100 rounded-2xl border-2 border-dashed relative overflow-hidden flex items-center justify-center">
          {!background ? (
              <label className="bg-primary-500 text-white px-6 py-3 rounded-xl cursor-pointer">Szobafotó feltöltése<input type="file" className="hidden" accept="image/*" onChange={handleBackgroundUpload} /></label>
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
  const [activeTab, setActiveTabState] = useState(() => {
    const hash = (typeof window !== 'undefined' && window.location.hash.slice(1)) || '';
    return HASH_TO_TAB[hash] || 'shop';
  });
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    const hash = TAB_HASH[tab] ?? tab;
    if (typeof window !== 'undefined') {
      const newHash = hash ? `#${hash}` : '';
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
      }
    }
  }, []);
  const [products, setProducts] = useState([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const filteredLengthRef = useRef(0);
  const hasMoreProductsRef = useRef(hasMoreProducts);
  const isLoadingMoreRef = useRef(isLoadingMore);
  hasMoreProductsRef.current = hasMoreProducts;
  isLoadingMoreRef.current = isLoadingMore;
  const [wishlist, setWishlist] = useLocalStorage('mkt_wishlist', []);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [sectionRotateTick, setSectionRotateTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;
  const SERVER_SEARCH_ONLY = true;
  const MAX_LOCAL_INDEX = SERVER_SEARCH_ONLY ? 0 : 50000;
  const searchIndexRef = useRef([]);
  const [searchIndexReady, setSearchIndexReady] = useState(false);
  const [searchIndexVersion, setSearchIndexVersion] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotalMatches, setSearchTotalMatches] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("Összes");
  const [sortOption, setSortOption] = useState("default");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);
  const [onboardingFeature, setOnboardingFeature] = useState('chat');
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [categoryHierarchy, setCategoryHierarchy] = useState({ mainCategories: [] });
  const [categoryStats, setCategoryStats] = useState(null);
  const mainCategorySet = useMemo(() => {
    return new Set((categoryHierarchy?.mainCategories || []).map((c) => c.name));
  }, [categoryHierarchy]);
  const activeHierarchyCount = useMemo(() => {
    const main = (categoryHierarchy?.mainCategories || []).find((m) => m.name === categoryFilter);
    return typeof main?.productCount === 'number' ? main.productCount : null;
  }, [categoryHierarchy, categoryFilter]);
  const getCategoryMainList = useCallback((category) => {
    if (!category) return [];
    const main = (categoryHierarchy?.mainCategories || []).find((m) => m.name === category);
    if (!main) return [];
    return Array.isArray(main.rawSegments) && main.rawSegments.length > 0 ? main.rawSegments : [category];
  }, [categoryHierarchy]);
  
  // AI Feature states
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);
  const [showRoomDesigner, setShowRoomDesigner] = useState(false);
  const [showAIDebug, setShowAIDebug] = useState(false);
  const [aiRecommendedProducts, setAiRecommendedProducts] = useState([]);
  const [aiRecommendationLabel, setAiRecommendationLabel] = useState('');
  const [showDeferredAI, setShowDeferredAI] = useState(false);
  
  // Quick Peek & AR states
  const [quickPeekProduct, setQuickPeekProduct] = useState(null);
  const [showARPreview, setShowARPreview] = useState(false);
  const [arProduct, setArProduct] = useState(null);
  
  // AR Measure & One-Click Checkout states
  const [showARMeasure, setShowARMeasure] = useState(false);
  const [arMeasureProduct, setArMeasureProduct] = useState(null);
  const [showOneClickCheckout, setShowOneClickCheckout] = useState(false);
  const [oneClickProduct, setOneClickProduct] = useState(null);
  
  // New UX states
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(true); // Exit intent enabled
  
  // Phase 2 UX states
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [recentlyAddedToCart, setRecentlyAddedToCart] = useState(null);
  const [featuredPool, setFeaturedPool] = useState([]);
  const featuredPoolKeyRef = useRef('');
  
  // Flash sale end time (set to 12 hours from now for demo)
  const flashSaleEndTime = useMemo(() => {
    const end = new Date();
    end.setHours(end.getHours() + 12);
    return end;
  }, []);
  
  // UNAS API states
  const [isLoadingUnas, setIsLoadingUnas] = useState(true);
  const [unasError, setUnasError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('demo');
  
  // New hooks
  const toast = useToast();
  const comparison = useComparison();
  
  // Track product views - both for RecentlyViewed component and user preferences
  const handleProductView = (product) => {
    trackProductView(product); // RecentlyViewed component
    trackProductViewPref(product); // User preferences service (for AI personalization)
    setSelectedProduct(product);
  };
  
  // Handle AI recommended products - scroll to products and show them
  // Accepts either: (product, allRecommended) OR (recommendedProducts, label)
  const handleShowAIProducts = useCallback((firstArg, secondArg) => {
    let recommendedProducts = [];
    let label = 'AI ajánlások';
    
    // Check if first argument is a single product or an array
    if (firstArg && !Array.isArray(firstArg) && firstArg.id) {
      // Single product clicked - show it first, then add similar products
      const clickedProduct = firstArg;
      const allRecommended = secondArg || [];
      
      // Get similar products from the full products list
      const similarProducts = products
        .filter(p => {
          if (p.id === clickedProduct.id) return false;
          const clickedCat = (clickedProduct.category || '').toLowerCase();
          const pCat = (p.category || '').toLowerCase();
          // Same main category or similar price range
          const sameCategory = clickedCat && pCat && pCat.includes(clickedCat.split(' > ')[0]);
          const price = p.salePrice || p.price || 0;
          const clickedPrice = clickedProduct.salePrice || clickedProduct.price || 0;
          const similarPrice = clickedPrice > 0 && Math.abs(price - clickedPrice) / clickedPrice < 0.5;
          return sameCategory || similarPrice;
        })
        .slice(0, 12);
      
      // Combine: clicked product + other recommendations + similar
      recommendedProducts = [
        clickedProduct,
        ...allRecommended.filter(p => p.id !== clickedProduct.id),
        ...similarProducts.filter(p => !allRecommended.some(r => r.id === p.id))
      ].slice(0, 20);
      
      label = `"${clickedProduct.name.slice(0, 30)}..." és hasonló termékek`;
    } else if (Array.isArray(firstArg)) {
      // Array of products provided
      recommendedProducts = firstArg;
      label = typeof secondArg === 'string' ? secondArg : 'AI ajánlások';
    }
    
    if (recommendedProducts.length === 0) return;
    
    setAiRecommendedProducts(recommendedProducts);
    setAiRecommendationLabel(label);
    setCategoryFilter('Összes'); // Reset category
    setSearchQuery(''); // Reset search
    
    setActiveTab('shop');
    setTimeout(() => scrollToProductsSectionRef.current?.(), 400);
  }, [products]);
  
  // Clear AI recommendations
  const clearAIRecommendations = useCallback(() => {
    setAiRecommendedProducts([]);
    setAiRecommendationLabel('');
  }, []);

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

  useEffect(() => {
    let cancelled = false;
    if (!showWishlistDrawer) return () => { cancelled = true; };
    if (!wishlist || wishlist.length === 0) {
      setWishlistItems([]);
      return () => { cancelled = true; };
    }
    Promise.all(wishlist.map((id) => fetchUnasProductById(id)))
      .then((items) => {
        if (!cancelled) setWishlistItems(items.filter(Boolean));
      });
    return () => { cancelled = true; };
  }, [wishlist, showWishlistDrawer]);
  
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
  
  // Handle add to cart with confetti celebration
  const handleAddToCart = useCallback((product, quantity = 1) => {
    // Trigger confetti
    setShowConfetti(true);
    
    // Add to cart state
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    
    // Set recently added for notification
    setRecentlyAddedToCart(product);
    setTimeout(() => setRecentlyAddedToCart(null), 3000);
    
    // Show toast
    toast.success(`${product.name} hozzáadva a kosárhoz!`);
    
    // In real app: Sync with backend
    console.log('Added to cart:', product.name, 'x', quantity);
  }, [toast]);
  
  // Handle remove from cart
  const handleRemoveFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast.info('Eltávolítva a kosárból');
  }, [toast]);
  
  // Handle update cart quantity
  const handleUpdateCartQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  }, [handleRemoveFromCart]);
  
  // Server-side search state
  const [serverSearchQuery, setServerSearchQuery] = useState('');
  const [serverCategory, setServerCategory] = useState('');
  const searchTimeoutRef = useRef(null);

  // API-first: kis lap, gyors first paint; soha nem töltünk 200k-t
  const loadUnasData = useCallback(async (options = {}) => {
    const { silent = false, search = '', category = '', categoryMain, append = false, limit = INITIAL_PAGE, offset = 0 } = options;
    
    if (!silent && !append) {
      setIsLoadingUnas(true);
      setUnasError(null);
    }
    if (append) setIsLoadingMore(true);
    
    try {
      const categoryMainList = Array.isArray(categoryMain)
        ? categoryMain.filter(Boolean)
        : (typeof categoryMain === 'string' && categoryMain.trim()
          ? [categoryMain.trim()]
          : getCategoryMainList(category));
      const params = {
        limit,
        offset,
        slim: false,
        ...(search && search.trim() && { search: search.trim() }),
        ...(categoryMainList.length > 0 && { categoryMain: categoryMainList }),
        ...(categoryMainList.length === 0 && category && category !== 'Összes' && { category })
      };
      const data = await fetchUnasProducts(params);
      const newProducts = (data.products || []).map(p => ({
        ...p,
        images: p.images || (p.image ? [p.image] : []),
        image: p.images?.[0] || p.image,
        inStock: p.inStock ?? p.in_stock ?? true
      }));
      const totalCount = data.total ?? 0;
      
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
        setHasMoreProducts(newProducts.length > 0 && (data.count + offset) < totalCount);
      } else {
        setProducts(newProducts);
        setTotalProductsCount(totalCount);
        setHasMoreProducts(newProducts.length > 0 && newProducts.length < totalCount);
      }
      if (!append && search && String(search).trim()) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          scrollToProductsSectionRef.current?.()
        }));
      }
      if (!append) setTotalProductsCount(totalCount);
      setLastUpdated(data.lastSync || data.lastUpdated);
      setDataSource('unas');
      setUnasError(null);
    } catch (err) {
      if (!append) setUnasError('Termékek betöltése sikertelen');
    } finally {
      if (!silent && !append) setIsLoadingUnas(false);
      if (append) setIsLoadingMore(false);
    }
  }, [getCategoryMainList]);

  // Server-side search (marketplace-style). scrollFromEffect: true = görgetés az effect-ben (pl. header keresés), false = hívó intézi (pl. hero)
  const requestScrollToProductsRef = useRef(false);
  const handleServerSearch = useCallback((query, opts = {}) => {
    hasUserSearchedRef.current = true;
    if (opts.scrollFromEffect !== false) requestScrollToProductsRef.current = true;
    setSearchQuery(query);
  }, []);
  const hasUserSearchedRef = useRef(false);
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSectionRotateTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(id);
  }, []);


  // Scroll container: ne használjunk olyan containert, ami a mi appunk belsejében van (#mkt-butorbolt-app).
  // UNAS embed: gyakran a page_content article szülője a scroll container; standalone = window.
  const getScrollParent = useCallback((element) => {
    const appRoot = document.getElementById('mkt-butorbolt-app');
    const isScrollable = (el) => {
      if (!el || el === document.body) return false;
      const style = getComputedStyle(el);
      const oy = style.overflowY;
      return (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && el.scrollHeight > el.clientHeight;
    };
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (isScrollable(parent)) {
        const insideApp = appRoot && parent.closest('#mkt-butorbolt-app');
        const wrapsApp = appRoot && parent.contains(appRoot);
        if (wrapsApp || !insideApp) return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }, []);

  const scrollToProductsSection = useCallback(() => {
    const el = document.getElementById('products-section');
    if (!el) return;
    const offset = 100;
    const initialRect = el.getBoundingClientRect();
    if (initialRect.top >= 0 && initialRect.top <= offset + 20) return;

    const run = () => {
      const scrollParent = getScrollParent(el);
      if (scrollParent) {
        const elRect = el.getBoundingClientRect();
        const parentRect = scrollParent.getBoundingClientRect();
        const targetScrollTop = scrollParent.scrollTop + (elRect.top - parentRect.top) - offset;
        scrollParent.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
      } else {
        const scrollY = window.scrollY ?? window.pageYOffset;
        const targetTop = Math.max(0, el.getBoundingClientRect().top + scrollY - offset);
        window.scrollTo({ top: Math.max(0, scrollY - 1), behavior: 'auto' });
        requestAnimationFrame(() => {
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        });
      }
      // Fallback: ha 400 ms után még nincs a szekció a viewportban, scrollIntoView (pl. UNAS embed)
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top <= 150 && rect.bottom >= 0;
        if (!inView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }
      }, 400);
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [getScrollParent]);

  const scrollToProductsSectionRef = useRef(scrollToProductsSection);
  scrollToProductsSectionRef.current = scrollToProductsSection;

  const handleCategoryChange = useCallback((category) => {
    setCategoryFilter(category);
    setCategoryStats(null);
    setSearchQuery('');
    hasUserSearchedRef.current = false;
    setAdvancedFilters({});
    setSortOption('default');
    clearAIRecommendations();
    setProducts([]);
    setTotalProductsCount(0);
    setHasMoreProducts(true);
    setIsLoadingUnas(true);
    setUnasError(null);
    if (category && category !== 'Összes') setActiveTab('shop');
    setTimeout(scrollToProductsSection, 500);
  }, [scrollToProductsSection, clearAIRecommendations]);

  const loadUnasDataRef = useRef(loadUnasData);
  loadUnasDataRef.current = loadUnasData;

  const canUseLocalSearch = useMemo(() => {
    if (SERVER_SEARCH_ONLY) return false;
    return searchIndexReady && searchIndexRef.current.length > 0 && searchIndexRef.current.length <= MAX_LOCAL_INDEX;
  }, [SERVER_SEARCH_ONLY, searchIndexReady, searchIndexVersion]);

  const debouncedSearch = useDebounce(searchQuery, 400);
  useEffect(() => {
    // Ha a keresőindex kész, a keresés lokálisan fut – ne írjuk felül a listát API kereséssel
    const useApiSearch = !canUseLocalSearch || !debouncedSearch.trim();
    const categoryMainList = getCategoryMainList(categoryFilter);
    loadUnasDataRef.current({
      search: useApiSearch ? (debouncedSearch.trim() || undefined) : undefined,
      category: categoryMainList.length === 0 && categoryFilter !== 'Összes' ? categoryFilter : '',
      categoryMain: categoryMainList.length > 0 ? categoryMainList : undefined,
      limit: INITIAL_PAGE,
      offset: 0
    });
    // Csak akkor görgetünk a termékekre, ha a felhasználó most indított keresést/kategóriaváltást (ne listagörgetéskor)
    if (requestScrollToProductsRef.current && debouncedSearch.trim()) {
      requestScrollToProductsRef.current = false;
      setTimeout(() => scrollToProductsSectionRef.current?.(), 120);
    }
  }, [categoryFilter, debouncedSearch, canUseLocalSearch, getCategoryMainList]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      const tab = HASH_TO_TAB[hash] || 'shop';
      setActiveTabState(tab);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCategoryHierarchy().then((data) => {
      if (!cancelled && data?.mainCategories) setCategoryHierarchy(data);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!categoryFilter || categoryFilter === 'Összes') {
      setCategoryStats(null);
      return () => { cancelled = true; };
    }
    const categoryMainList = getCategoryMainList(categoryFilter);
    const category = categoryMainList.length === 0 ? categoryFilter : '';
    fetchProductStats({ category, categoryMain: categoryMainList.length > 0 ? categoryMainList : undefined }).then((stats) => {
      if (!cancelled) setCategoryStats(stats);
    });
    return () => { cancelled = true; };
  }, [categoryFilter, getCategoryMainList]);

  // Defer heavy AI widgets to keep TTI under 3s
  useEffect(() => {
    const t = setTimeout(() => setShowDeferredAI(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Keresőindex háttérben (800ms késleltetés, ne blokkolja az első paint-et); 5 percenként frissítés = készlet naprakész
  useEffect(() => {
    if (SERVER_SEARCH_ONLY) return;
    let cancelled = false;
    const load = () => {
      fetchSearchIndex().then((data) => {
        if (!cancelled && data && Array.isArray(data.products)) {
          searchIndexRef.current = data.products;
          setSearchIndexReady(true);
          setSearchIndexVersion((v) => v + 1);
          // #region agent log
          // #endregion
          if (data.lastSync) setLastUpdated(data.lastSync);
          const q = searchQueryRef.current.trim();
          if (q && data.products.length <= MAX_LOCAL_INDEX) {
            const { results = [], totalMatches = 0 } = smartSearch(searchIndexRef.current, q, { limit: 500 });
            setSearchResults(results);
            setSearchTotalMatches(totalMatches || results.length);
          }
        }
      });
    };
    const t0 = setTimeout(load, 800);
    const t1 = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearTimeout(t0); clearInterval(t1); };
  }, []);

  // Keresés a teljes indexen (ha már betöltött); üres keresés = üres találat
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchTotalMatches(0);
      return;
    }
    if (!canUseLocalSearch) {
      setSearchResults([]);
      setSearchTotalMatches(0);
      return;
    }
    const { results = [], totalMatches = 0 } = smartSearch(searchIndexRef.current, searchQuery.trim(), { limit: 500 });
    setSearchResults(results);
    setSearchTotalMatches(totalMatches || results.length);
  }, [searchQuery, canUseLocalSearch]);

  useEffect(() => {
    const t = setInterval(() => loadUnasDataRef.current?.({ silent: true }), 300000);
    return () => clearInterval(t);
  }, []);

  // Featured pool for homepage modules (more variety than the first page)
  useEffect(() => {
    if (!totalProductsCount || totalProductsCount <= 0) return;
    const key = `${totalProductsCount}-${lastUpdated || ''}`;
    if (featuredPoolKeyRef.current === key) return;
    featuredPoolKeyRef.current = key;
    let cancelled = false;
    const limit = 120;
    const baseOffsets = [0];
    if (totalProductsCount > limit * 2) {
      baseOffsets.push(
        Math.max(0, Math.floor(totalProductsCount / 3) - Math.floor(limit / 2)),
        Math.max(0, Math.floor((totalProductsCount * 2) / 3) - Math.floor(limit / 2))
      );
    }
    Promise.all(
      baseOffsets.map((offset) => fetchUnasProducts({ limit, offset, slim: false }))
    )
      .then((batches) => {
        if (cancelled) return;
        const merged = new Map();
        batches.forEach((data) => {
          (data?.products || []).forEach((p) => {
            if (!p || !p.id) return;
            const normalized = {
              ...p,
              images: p.images || (p.image ? [p.image] : []),
              image: p.images?.[0] || p.image,
              inStock: p.inStock ?? p.in_stock ?? true
            };
            merged.set(p.id, normalized);
          });
        });
        setFeaturedPool(Array.from(merged.values()));
      })
      .catch(() => {
        if (!cancelled) setFeaturedPool([]);
      });
    return () => { cancelled = true; };
  }, [totalProductsCount, lastUpdated]);

  const normalizedAdvancedFilters = useMemo(() => ({
    priceMin: advancedFilters.priceMin ?? 0,
    priceMax: advancedFilters.priceMax ?? 1000000,
    inStockOnly: advancedFilters.inStockOnly ?? false,
    categories: Array.isArray(advancedFilters.categories) ? advancedFilters.categories : []
  }), [advancedFilters]);

  const mobileActiveFilterCount = useMemo(() => [
    normalizedAdvancedFilters.inStockOnly,
    normalizedAdvancedFilters.categories.length > 0,
    normalizedAdvancedFilters.priceMin > 0,
    normalizedAdvancedFilters.priceMax < 1000000
  ].filter(Boolean).length, [normalizedAdvancedFilters]);
  
  // Szerver már szűr (kategória, keresés); itt csak rendezés + advanced filter a kis listán
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (Object.keys(advancedFilters).length > 0) {
      result = applyFilters(result, normalizedAdvancedFilters);
    }
    if (sortOption === 'price-asc') result = result.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortOption === 'price-desc') result = result.sort((a, b) => (b.price || 0) - (a.price || 0));
    return result;
  }, [products, sortOption, advancedFilters, normalizedAdvancedFilters]);

  filteredLengthRef.current = filteredAndSortedProducts.length;

  const isSearchMode = searchQuery.trim().length >= 2 && canUseLocalSearch;
  const isSearchActive = searchQuery.trim().length > 0;
  const sectionProducts = isSearchActive ? [] : filteredAndSortedProducts;
  const sectionContextLabel = categoryFilter && categoryFilter !== 'Összes'
    ? categoryFilter
    : (mobileActiveFilterCount > 0 ? 'Szűrt ajánlások' : '');
  const useContextSections = isSearchActive || (categoryFilter && categoryFilter !== 'Összes') || mobileActiveFilterCount > 0;
  const featuredBase = useContextSections ? sectionProducts : (featuredPool.length > 0 ? featuredPool : sectionProducts);
  const displayedProducts = aiRecommendedProducts.length > 0
    ? aiRecommendedProducts
    : isSearchMode
      ? searchResults
      : filteredAndSortedProducts;
  const hasMoreToShow = aiRecommendedProducts.length === 0 && !isSearchMode && products.length < totalProductsCount;
  const headerCount = isSearchMode
    ? (searchTotalMatches || searchResults.length)
    : (totalProductsCount || filteredAndSortedProducts.length);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMoreProducts) return;
    const categoryMainList = getCategoryMainList(categoryFilter);
    loadUnasDataRef.current({
      append: true,
      limit: DISPLAY_BATCH,
      offset: products.length,
      search: searchQuery.trim() || undefined,
      category: categoryMainList.length === 0 && categoryFilter !== 'Összes' ? categoryFilter : '',
      categoryMain: categoryMainList.length > 0 ? categoryMainList : undefined
    });
  }, [isLoadingMore, hasMoreProducts, products.length, searchQuery, categoryFilter, getCategoryMainList]);

  // Categories with TOTAL counts (from hierarchy if available, fallback to loaded products)
  const categories = useMemo(() => {
    const total = totalProductsCount || products.length;
    if (categoryHierarchy?.mainCategories?.length) {
      const main = categoryHierarchy.mainCategories.map((m) => ({
        id: m.name,
        name: m.name,
        totalCount: Number(m.productCount || 0)
      }));
      return [{ id: 'Összes', name: 'Összes', totalCount: total }, ...main];
    }
    if (!products || products.length === 0) return [{ id: 'Összes', name: 'Összes', totalCount: total }];
    const categoryCount = new Map();
    for (const p of products) {
      if (p.category) {
        categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
      }
    }
    const sorted = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ id: name, name, totalCount: count }));
    return [{ id: 'Összes', name: 'Összes', totalCount: total }, ...sorted];
  }, [categoryHierarchy?.mainCategories, products, totalProductsCount]);

  return (
    <ToastProvider>
    <div id="mkt-butorbolt-app" className="min-h-screen bg-white font-sans text-gray-900 rounded-3xl sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-300/50 mx-auto w-full max-w-[2000px]">
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        wishlistCount={wishlist.length}
        productCount={totalProductsCount || products.length}
        categories={categories}
        categoryHierarchy={categoryHierarchy.mainCategories}
        activeCategory={categoryFilter}
        onOpenWishlist={() => setShowWishlistDrawer(true)}
        onCategorySelect={handleCategoryChange}
        onScrollToShop={scrollToProductsSection}
        fixUrl={fixUrl}
        onRecentProductClick={handleProductView}
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
      
      {/* AI Chat Assistant (deferred for faster first paint) */}
      {showDeferredAI && (
        <Suspense fallback={null}>
            <AIChatAssistant
              products={products}
              catalogProducts={searchIndexReady ? searchIndexRef.current : products}
              onShowProducts={handleShowAIProducts}
              serverSearchMode={SERVER_SEARCH_ONLY}
              totalProductsCount={totalProductsCount}
              categoryHierarchy={categoryHierarchy}
            />
        </Suspense>
      )}

      <main id="mkt-butorbolt-main">
        {activeTab === 'shop' && (
          <>
            {/* Flash Sale Banner – nem teljes szélesség, lekerekített, váltakozó ajánlatok */}
            <div className="px-[2px] sm:px-2 lg:px-4">
              <FlashSaleBanner
                endTime={flashSaleEndTime}
                title="🔥 Flash Sale!"
                subtitle="Csak ma! Akár 50% kedvezmény kiválasztott bútorokra"
                onViewSale={scrollToProductsSection}
                variant="banner"
              />
            </div>

            {/* Free Shipping Progress - shows when cart has items */}
            {cartItems.length > 0 && (
              <FreeShippingProgress
                currentTotal={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                threshold={30000}
                variant="banner"
              />
            )}
            
            <ModernHero 
              onExplore={scrollToProductsSection}
              onTryAI={() => setActiveTab('visual-search')}
              products={SERVER_SEARCH_ONLY ? products : (searchIndexReady ? searchIndexRef.current : products)}
              onHeroQuickView={(product) => handleProductView(product)}
              onHeroSearch={(query, meta = {}) => {
                if (!query?.trim()) return;
                if (meta?.source !== 'instant') {
                  setActiveTab('shop');
                }
                handleServerSearch(query, { scrollFromEffect: false });
                if (meta?.source !== 'instant') {
                  setTimeout(() => scrollToProductsSectionRef.current?.(), 150);
                }
              }}
              quickCategories={(categoryHierarchy?.mainCategories || []).slice(0, 6).map((c) => c.name)}
              onQuickCategory={(name) => {
                setActiveTab('shop');
                handleCategoryChange(name);
              }}
            />
            <FadeInOnScroll direction="up" className="section-perf">
              <AIModuleUnified
                onFeatureClick={(feature) => {
                  if (feature.id === 'visual-search') setActiveTab('visual-search');
                  else if (feature.id === 'chat') {
                    document.getElementById('mkt-butorbolt-chat')?.scrollIntoView({ behavior: 'smooth' });
                  }
                  else if (feature.id === 'room-planner') setActiveTab('room-planner');
                  else if (feature.id === 'style-quiz') setShowStyleQuiz(true);
                  else if (feature.id === 'room-designer') setShowRoomDesigner(true);
                }}
              />
            </FadeInOnScroll>

            <FadeInOnScroll direction="up" className="section-perf section-gap-lg">
              <InspirationSection
                onExplore={scrollToProductsSection}
                onCategorySelect={(name) => {
                  setActiveTab('shop');
                  handleCategoryChange(name);
                  setTimeout(() => scrollToProductsSectionRef.current?.(), 400);
                }}
              />
            </FadeInOnScroll>
            
            <FadeInOnScroll direction="up" className="section-perf">
            <LiveShowcase 
              products={featuredBase} 
              onProductClick={handleProductView}
              rotationTick={sectionRotateTick}
            />
            </FadeInOnScroll>


            {featuredBase.length > 0 && (
              <FadeInOnScroll direction="up" className="section-perf">
                <NewArrivalsSection
                  products={featuredBase}
                  onProductClick={handleProductView}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                  onViewAll={scrollToProductsSection}
                  onAddToCart={handleAddToCart}
                  contextLabel={sectionContextLabel}
                  rotationTick={sectionRotateTick}
                />
              </FadeInOnScroll>
            )}

            {featuredBase.length > 0 && (
              <FadeInOnScroll direction="up" className="section-perf">
                <MostPopularSection
                  products={featuredBase}
                  onProductClick={handleProductView}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                  onViewAll={scrollToProductsSection}
                  onAddToCart={handleAddToCart}
                  contextLabel={sectionContextLabel}
                  rotationTick={sectionRotateTick}
                />
              </FadeInOnScroll>
            )}
            
            {/* Personalized Section - For You + Recently Viewed + Trending */}
            {featuredBase.length > 0 && (
              <PersonalizedSection
                products={featuredBase}
                onProductClick={handleProductView}
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist}
                contextLabel={sectionContextLabel}
                cartItems={cartItems}
              />
            )}

            <div className="w-full max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <LoyaltyProgram
                currentPoints={2450}
                totalSpent={485000}
                tier="silver"
                onViewRewards={() => {}}
                onRedeemPoints={(reward) => console.log('Redeem:', reward)}
              />
            </div>

            <NewsletterStrip />

            <FadeInOnScroll direction="up" className="section-perf">
              <Features />
            </FadeInOnScroll>
            
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
                totalCount={totalProductsCount}
                loadedCount={products.length}
                stats={categoryStats}
                onLoadMore={handleLoadMore}
              />
            ) : (
            <section id="products-section" className="container-app section-padding section-perf">
                {/* Sticky products header - solid, breadcrumb when category selected */}
                <div className="sticky top-16 sm:top-20 z-40 mx-0 sm:-mx-4 lg:-mx-8 xl:-mx-10 px-3 sm:px-4 lg:px-8 xl:px-10 py-3 sm:py-4 lg:py-5 xl:py-6 mb-3 sm:mb-4 lg:mb-8 bg-white border-b border-gray-200 shadow-sm search-shell rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
                    <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
                      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary-600 font-medium transition-colors" aria-label="Főoldal teteje">Főoldal</button>
                      <span aria-hidden="true">/</span>
                      <button type="button" onClick={() => handleCategoryChange('Összes')} className="hover:text-primary-600 font-medium transition-colors" aria-label="Összes kategória">Termékek</button>
                      {categoryFilter && categoryFilter !== 'Összes' && (
                        <>
                          <span aria-hidden="true">/</span>
                          <span className="font-semibold text-gray-700">{categoryFilter}</span>
                        </>
                      )}
                      {searchQuery && (
                        <>
                          <span aria-hidden="true">/</span>
                          <span className="text-gray-600">Keresés: &quot;{searchQuery}&quot;</span>
                        </>
                      )}
                      <span className="text-gray-400">({headerCount.toLocaleString('hu-HU')} termék)</span>
                    </nav>
                    <LiveActivityStrip className="hidden sm:flex shrink-0" />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
                    {/* Title & Count */}
                    <div className="flex items-baseline gap-2 sm:gap-3 lg:gap-4 flex-wrap">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900">
                        {searchQuery ? 'Keresés' : 'Termékek'}
                      </h2>
                      {!isLoadingUnas && (
                        <span className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-500">
                          <span className="font-semibold text-primary-500">
                            {(headerCount || 0).toLocaleString('hu-HU')}
                          </span> db
                        </span>
                      )}
                      {searchQuery && (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                            "{searchQuery}"
                          </span>
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Keresés törlése"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Search & Filters */}
                    <div className="w-full sm:w-auto">
                      <div className="w-full flex items-center gap-2 sm:gap-3 lg:gap-4 rounded-2xl border-2 border-primary-100 bg-gradient-to-r from-primary-50 via-white to-secondary-50 shadow-md p-2 sm:p-3">
                        <div className="flex-1 sm:flex-initial sm:w-64 lg:w-80 xl:w-[420px] 2xl:w-[520px]">
                          <SmartSearchBar 
                            products={SERVER_SEARCH_ONLY ? products : (searchIndexReady ? searchIndexRef.current : products)}
                            indexVersion={searchIndexVersion}
                            shouldBuildIndex={!SERVER_SEARCH_ONLY && searchIndexReady}
                            maxLocalIndex={MAX_LOCAL_INDEX}
                            serverSearchMode={SERVER_SEARCH_ONLY}
                            categories={categories}
                            onSearch={handleServerSearch}
                            onProductClick={handleProductView}
                            placeholder="Keresés bútorok között..."
                          />
                        </div>
                        {/* Desktop filters */}
                        <div className="hidden sm:block">
                          <AdvancedFilters
                            products={products}
                            onFilterChange={setAdvancedFilters}
                            initialFilters={advancedFilters}
                          />
                        </div>
                        {/* Mobile filter button – same state as desktop AdvancedFilters */}
                        <button
                          onClick={() => setShowFilterSheet(true)}
                          className="sm:hidden relative p-3 min-h-[48px] min-w-[48px] border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
                          aria-label="Szűrők"
                        >
                          <Filter className="w-5 h-5 text-gray-700" />
                          {mobileActiveFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                              {mobileActiveFilterCount}
                            </span>
                          )}
                        </button>
                        <select 
                          onChange={(e) => setSortOption(e.target.value)} 
                          className="hidden sm:block px-4 lg:px-5 xl:px-6 py-3 lg:py-3.5 xl:py-4 min-h-[48px] lg:min-h-[52px] xl:min-h-[56px] text-sm sm:text-base lg:text-lg xl:text-xl border-2 border-gray-200 rounded-xl lg:rounded-2xl bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all cursor-pointer font-medium"
                          aria-label="Rendezés"
                        >
                          <option value="default">Rendezés</option>
                          <option value="price-asc">Ár: alacsony → magas</option>
                          <option value="price-desc">Ár: magas → alacsony</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Active filter chips + sort chips – wrap mobil/tablet, 44px touch */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-3 mt-3 pt-3 border-t border-gray-100">
                    {mobileActiveFilterCount > 0 && (
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        {normalizedAdvancedFilters.inStockOnly && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium min-h-[44px] sm:min-h-0 sm:py-1.5">
                            Raktáron
                            <button type="button" onClick={() => setAdvancedFilters(prev => ({ ...prev, inStockOnly: false }))} className="p-1.5 sm:p-0.5 hover:bg-primary-100 rounded-full min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center" aria-label="Eltávolítás">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                        {normalizedAdvancedFilters.priceMin > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium min-h-[44px] sm:min-h-0 sm:py-1.5">
                            Min. {new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 }).format(normalizedAdvancedFilters.priceMin)} Ft
                            <button type="button" onClick={() => setAdvancedFilters(prev => ({ ...prev, priceMin: 0 }))} className="p-1.5 sm:p-0.5 hover:bg-primary-100 rounded-full min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center" aria-label="Eltávolítás">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                        {normalizedAdvancedFilters.priceMax < 1000000 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium min-h-[44px] sm:min-h-0 sm:py-1.5">
                            Max. {new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 }).format(normalizedAdvancedFilters.priceMax)} Ft
                            <button type="button" onClick={() => setAdvancedFilters(prev => ({ ...prev, priceMax: 1000000 }))} className="p-1.5 sm:p-0.5 hover:bg-primary-100 rounded-full min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center" aria-label="Eltávolítás">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                        {(normalizedAdvancedFilters.categories || []).map(cat => (
                          <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium min-h-[44px] sm:min-h-0 sm:py-1.5">
                            {cat}
                            <button type="button" onClick={() => setAdvancedFilters(prev => ({ ...prev, categories: (prev.categories || []).filter(c => c !== cat) }))} className="p-1.5 sm:p-0.5 hover:bg-primary-100 rounded-full min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center" aria-label={`${cat} eltávolítása`}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                        <button type="button" onClick={() => setAdvancedFilters({})} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors min-h-[44px] px-2 flex items-center sm:min-h-0">
                          Összes törlése
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto flex-shrink-0">
                      <span className="text-xs sm:text-sm text-gray-500 mr-1 hidden sm:inline">Rendezés:</span>
                      {['default', 'price-asc', 'price-desc'].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSortOption(value)}
                          className={`min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${
                            sortOption === value
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {value === 'default' ? 'Alap' : value === 'price-asc' ? 'Ár ↑' : 'Ár ↓'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Main categories (from hierarchy) + quick filter swipe */}
                {categoryHierarchy?.mainCategories?.length > 0 && (
                  <MainCategoriesSection
                    mainCategories={categoryHierarchy.mainCategories}
                    activeCategory={categoryFilter}
                    onCategorySelect={handleCategoryChange}
                    totalProductCount={totalProductsCount || products.length}
                  />
                )}
                <CategorySwipe
                  categories={(() => {
                    if (categoryHierarchy?.mainCategories?.length > 0) {
                      return [
                        { id: 'Összes', name: 'Összes', totalCount: totalProductsCount || products.length },
                        ...categoryHierarchy.mainCategories.map((m) => ({
                          id: m.name,
                          name: m.name,
                          totalCount: m.productCount ?? 0,
                          icon: null,
                        })),
                      ];
                    }
                    return categories.map((cat) => ({
                      id: cat.name,
                      name: cat.name,
                      totalCount: cat.count,
                      icon: null,
                    }));
                  })()}
                  activeCategory={categoryFilter}
                  onCategoryChange={handleCategoryChange}
                  displayedCount={products.length}
                  activeTotalOverride={categoryFilter === 'Összes'
                    ? (totalProductsCount || products.length)
                    : (categoryStats?.total ?? activeHierarchyCount ?? 0)}
                />

                {/* Loading State */}
                {isLoadingUnas && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
                      onClick={() => loadUnasDataRef.current({
                        search: searchIndexReady ? undefined : (searchQuery.trim() || undefined),
                        category: getCategoryMainList(categoryFilter).length === 0 && categoryFilter !== 'Összes' ? categoryFilter : '',
                        categoryMain: getCategoryMainList(categoryFilter).length > 0 ? getCategoryMainList(categoryFilter) : undefined,
                        limit: INITIAL_PAGE,
                        offset: 0
                      })}
                      className="px-6 py-3 min-h-[44px] bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
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
                      onClear={() => setSearchQuery('')}
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

                {/* AI Recommendations Banner */}
                {aiRecommendedProducts.length > 0 && (
                  <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-primary-500 via-secondary-600 to-secondary-500 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-base sm:text-lg">{aiRecommendationLabel}</h3>
                          <p className="text-white/80 text-sm">{aiRecommendedProducts.length} személyre szabott ajánlás</p>
                        </div>
                      </div>
                      <button
                        onClick={clearAIRecommendations}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Összes termék</span>
                      </button>
                    </div>
                  </div>
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
                        disabled={isLoadingMore}
                        className="px-6 sm:px-8 lg:px-10 py-3.5 sm:py-4 lg:py-5 min-h-[48px] lg:min-h-[56px] bg-gradient-to-r from-primary-500 to-secondary-700 text-white font-semibold rounded-xl lg:rounded-2xl
                                   hover:from-primary-600 hover:to-secondary-700 transition-all duration-200
                                   shadow-lg hover:shadow-xl active:scale-[0.98]
                                   flex items-center gap-3 sm:gap-4 text-base sm:text-lg lg:text-xl disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore && (
                          <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" aria-hidden />
                        )}
                        <span>{isLoadingMore ? 'Betöltés...' : 'Több termék'}</span>
                        <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 bg-white/20 rounded-lg text-sm sm:text-base">
                          {displayedProducts.length.toLocaleString('hu-HU')} / {totalProductsCount.toLocaleString('hu-HU')}
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
            
            {/* Final CTA */}
            <InteractiveCTA 
              onGetStarted={scrollToProductsSection}
            />
          </>
        )}
        
        {activeTab === 'visual-search' && <VisualSearch products={products} onAddToCart={() => {}} />}
        {activeTab === 'room-planner' && <RoomPlanner products={products} />}
      </main>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        allProducts={products}
        onAddToCart={handleAddToCart}
      />
      
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
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <AIStyleQuiz
            products={products}
            onRecommendations={(recs) => {
              toast.success(`${recs.length} termék a Style DNA-d alapján!`);
            }}
            onClose={() => setShowStyleQuiz(false)}
          />
        </Suspense>
      )}
      
      {/* AI Room Designer Modal */}
      {showRoomDesigner && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <AIRoomDesigner
            products={products}
            onProductRecommendations={(recs) => {
              toast.success(`${recs.length} termék ajánlat!`);
            }}
            onClose={() => setShowRoomDesigner(false)}
          />
        </Suspense>
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

      {/* AR Measure - Room fit checker */}
      {showARMeasure && arMeasureProduct && (
        <div className="fixed inset-0 lg:top-[60px] bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowARMeasure(false)}>
          <div onClick={e => e.stopPropagation()}>
            <ARMeasure
              product={arMeasureProduct}
              onClose={() => {
                setShowARMeasure(false);
                setArMeasureProduct(null);
              }}
              onConfirmFit={() => {
                handleAddToCart(arMeasureProduct);
                setShowARMeasure(false);
                setArMeasureProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {/* One-Click Checkout */}
      {showOneClickCheckout && oneClickProduct && (
        <div className="fixed inset-0 lg:top-[60px] bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowOneClickCheckout(false)}>
          <div onClick={e => e.stopPropagation()}>
            <OneClickCheckout
              product={oneClickProduct}
              savedAddress="1234 Budapest, Példa utca 12."
              userEmail="user@example.com"
              userName="Felhasználó"
              onCheckout={({ product }) => {
                toast.success('Sikeres rendelés!');
                setShowOneClickCheckout(false);
                setOneClickProduct(null);
              }}
              onClose={() => {
                setShowOneClickCheckout(false);
                setOneClickProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Smart Newsletter Popup */}
      <SmartNewsletterPopup
        onSubscribe={(email) => {
          toast.success('Sikeres feliratkozás! Ellenőrizd az email fiókod.');
          return Promise.resolve();
        }}
      />

      {/* AI Debug Panel */}
      {showAIDebug && (
        <AIDebugPanel onClose={() => setShowAIDebug(false)} />
      )}

      {/* AI Debug Trigger - kis gomb a bal alsó sarokban */}
      <button
        onClick={() => setShowAIDebug(true)}
        className="fixed bottom-[calc(1.5rem+44px)] md:bottom-6 left-4 z-40 w-10 h-10 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors text-xs font-bold"
        title="AI Debug Panel"
      >
        🔧
      </button>

      {/* Confetti Celebration */}
      <Confetti 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      {/* Sticky Add to Cart (shows for selected product) */}
      {selectedProduct && (
        <StickyAddToCart
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onToggleWishlist={toggleWishlist}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          observedElementId="mkt-product-modal-root"
        />
      )}

      {/* Exit Intent Popup */}
      {showExitIntent && (
        <ExitIntentPopup 
          discountPercent={10}
          onClose={() => setShowExitIntent(false)}
        />
      )}

      {/* Mobile Filter Bottom Sheet – same state as desktop AdvancedFilters */}
      <BottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        title="Szűrők"
        snapPoints={[0.7, 0.9]}
      >
        <AdvancedFiltersPanel
          products={products}
          filters={advancedFilters}
          onFilterChange={setAdvancedFilters}
          onApply={() => setShowFilterSheet(false)}
          showHeader={false}
        />
      </BottomSheet>

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={showWishlistDrawer}
        onClose={() => setShowWishlistDrawer(false)}
        wishlistItems={wishlistItems}
        onRemove={(id) => toggleWishlist(id)}
        onAddToCart={handleAddToCart}
        onProductClick={(product) => {
          setShowWishlistDrawer(false);
          handleProductView(product);
        }}
        onClearAll={() => {
          wishlist.forEach(id => toggleWishlist(id));
        }}
      />

      {/* Floating Cart Preview */}
      <FloatingCartPreview
        cartItems={cartItems}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onCheckout={() => {
          window.open(`${WEBSHOP_DOMAIN}/checkout`, '_blank');
        }}
        onViewCart={() => {
          window.open(`${WEBSHOP_DOMAIN}/cart`, '_blank');
        }}
        recentlyAdded={recentlyAddedToCart}
        suggestedProducts={products.slice(0, 3)}
      />

      {/* Trust Badges Footer Section */}
      <TrustBadges variant="footer" />

      {/* Sticky Mobile Add to Cart - shows on product view */}
      {selectedProduct && (
        <StickyAddToCartMobile
          product={selectedProduct}
          onAddToCart={(product, qty) => handleAddToCart(product, qty)}
          onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
          isInWishlist={wishlist.includes(selectedProduct?.id)}
          isVisible={true}
          freeShippingThreshold={50000}
        />
      )}
    </div>
    </ToastProvider>
  );
};

export default App;
