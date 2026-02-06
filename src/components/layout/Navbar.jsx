import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Sparkles, Grid3X3, ChevronDown, ArrowRight, Search, Sun, Moon, Heart, Menu, X, ChevronRight,
  ExternalLink, ShoppingCart, Camera, Move, Truck, Gift, Zap, TrendingUp, Star, Sofa, BedDouble, Armchair,
  Lamp, Instagram, Facebook, MapPin, Mail, Phone, Clock
} from 'lucide-react';
import { getCategoryIcon } from '../ui/Icons';

const DEFAULT_WEBSHOP_DOMAIN = 'https://www.marketly.hu';

const ANNOUNCEMENT_MESSAGES = [
  { icon: Truck, text: 'Ingyenes szállítás 50.000 Ft felett', highlight: 'Ingyenes' },
  { icon: Gift, text: 'Első rendelésre 10% kedvezmény: ELSO10', highlight: 'ELSO10' },
  { icon: Zap, text: 'AI-alapú bútorajánlatok - Csak Neked!', highlight: 'AI' },
  { icon: TrendingUp, text: 'Több mint 90.000 termék egy helyen', highlight: '90.000' },
  { icon: Star, text: '4.9★ értékelés 10.000+ vásárlótól', highlight: '4.9★' },
];

const POPULAR_CATEGORIES = [
  { id: 'kanapek', name: 'Kanapék', icon: Sofa, color: 'from-blue-500 to-primary-500' },
  { id: 'agyak', name: 'Ágyak', icon: BedDouble, color: 'from-secondary-600 to-secondary-600' },
  { id: 'fotelek', name: 'Fotelek', icon: Armchair, color: 'from-orange-500 to-red-600' },
  { id: 'lampak', name: 'Lámpák', icon: Lamp, color: 'from-yellow-500 to-orange-600' },
  { id: 'szekrenyek', name: 'Szekrények', icon: Grid3X3, color: 'from-green-500 to-teal-600' },
  { id: 'asztalok', name: 'Asztalok', icon: Grid3X3, color: 'from-cyan-500 to-blue-600' },
];

const MEGA_MENU_COLORS = ['from-primary-500 to-secondary-700', 'from-orange-500 to-red-600', 'from-cyan-500 to-blue-600', 'from-green-500 to-teal-600', 'from-yellow-500 to-orange-600', 'from-pink-500 to-rose-600', 'from-indigo-500 to-purple-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600'];

/**
 * Navbar – fejléc, kategória mega menu, mobil menü, announcement sáv.
 * Props: activeTab, setActiveTab, wishlistCount, productCount, categories, onOpenWishlist, onCategorySelect, onScrollToShop, webshopDomain?, recentlyViewed?, fixUrl?, onRecentProductClick?
 * Mobil: overlay kattintás / Escape zárja; fókusz a bezáró gombra nyitáskor, hamburgerre záráskor. Utoljára nézett localStorage-ból vagy prop, kattintás → onRecentProductClick + bezárás.
 */
export default function Navbar({
  activeTab,
  setActiveTab,
  wishlistCount,
  productCount = 0,
  categories = [],
  onOpenWishlist,
  onCategorySelect,
  onScrollToShop,
  webshopDomain = DEFAULT_WEBSHOP_DOMAIN,
  recentlyViewed: recentlyViewedProp = [],
  fixUrl = (url) => url || '',
  onRecentProductClick
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [recentlyViewedLocal, setRecentlyViewedLocal] = useState([]);
  const mobileMenuRef = useRef(null);
  const megaMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  useEffect(() => {
    const lastVisit = localStorage.getItem('mkt_last_visit');
    const savedName = localStorage.getItem('mkt_user_name');
    if (lastVisit) {
      setIsReturningUser(true);
      if (savedName) setUserName(savedName);
    }
    localStorage.setItem('mkt_last_visit', Date.now().toString());
  }, []);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('recently_viewed');
        const list = raw ? JSON.parse(raw) : [];
        setRecentlyViewedLocal(Array.isArray(list) ? list.slice(0, 4) : []);
      } catch {
        setRecentlyViewedLocal([]);
      }
    };
    load();
    window.addEventListener('recently-viewed-updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('recently-viewed-updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex(prev => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowMegaMenu(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (!showMegaMenu) return;
    const handleClickOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) setShowMegaMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMegaMenu]);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const handleEsc = (e) => { if (e.key === 'Escape') closeMobileMenu(); };
      window.addEventListener('keydown', handleEsc);
      const t = setTimeout(() => mobileMenuRef.current?.querySelector('button[aria-label="Menü bezárása"]')?.focus(), 100);
      return () => { window.removeEventListener('keydown', handleEsc); clearTimeout(t); };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isDarkMode) document.getElementById('mkt-butorbolt-app')?.classList.add('dark-mode');
    else document.getElementById('mkt-butorbolt-app')?.classList.remove('dark-mode');
  }, [isDarkMode]);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX - touchStartX > 80) closeMobileMenu();
  };

  const closeMobileMenu = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setMobileMenuClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuClosing(false);
      hamburgerButtonRef.current?.focus();
    }, 300);
  };

  const focusSearchAndClose = () => {
    closeMobileMenu();
    setTimeout(() => {
      document.getElementById('shop-scroll-target')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.dispatchEvent(new CustomEvent('mkt-focus-search'));
    }, 350);
  };

  const openMobileMenu = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setMobileMenuOpen(true);
  };

  const setTabAndClose = (tab) => {
    setActiveTab(tab);
    closeMobileMenu();
    if (tab === 'shop') setTimeout(() => onScrollToShop?.(), 400);
  };

  const navItems = [
    { id: 'shop', label: 'Termékek', icon: ShoppingCart, badge: productCount > 0 ? `${(productCount / 1000).toFixed(0)}K+` : null, desc: 'Böngéssz a kínálatban' },
    { id: 'visual-search', label: 'AI Képkereső', icon: Camera, isAI: true, desc: 'Fotózz és keress' },
    { id: 'room-planner', label: 'Szobatervező', icon: Move, isAI: true, desc: 'Tervezd meg a szobád' },
  ];

  const currentAnnouncement = ANNOUNCEMENT_MESSAGES[announcementIndex];

  return (
    <>
      <nav
        id="mkt-butorbolt-navbar"
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100' : 'bg-white/80 backdrop-blur-md'}`}
      >
        <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 lg:px-10 xl:px-16 2xl:px-20">
          <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-16 sm:h-18 lg:h-20 xl:h-24' : 'h-18 sm:h-20 lg:h-24 xl:h-28'}`}>
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => setActiveTab('shop')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('shop'); } }}
              aria-label="Marketly.AI – Főoldal"
            >
              <div className={`relative bg-gradient-to-br from-primary-500 via-secondary-600 to-secondary-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mr-3 sm:mr-4 lg:mr-5 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-primary-300/50 group-hover:shadow-xl ${isScrolled ? 'w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16' : 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20'}`}>
                <Home className={isScrolled ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8' : 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10'} />
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className={`font-black text-gray-900 tracking-tight transition-all ${isScrolled ? 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl' : 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl'}`}>Marketly</span>
                  <span className={`font-black bg-gradient-to-r from-primary-500 to-secondary-700 bg-clip-text text-transparent transition-all ${isScrolled ? 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl' : 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl'}`}>.AI</span>
                </div>
                <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-500 font-semibold tracking-widest -mt-0.5">BÚTORBOLT</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4">
              <div ref={megaMenuRef} className="relative" onMouseEnter={() => setShowMegaMenu(true)} onMouseLeave={() => setShowMegaMenu(false)}>
                <button className="flex items-center gap-2 xl:gap-3 px-4 xl:px-6 2xl:px-7 py-2.5 xl:py-3.5 2xl:py-4 rounded-xl xl:rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold text-base xl:text-lg 2xl:text-xl transition-all" aria-label="Kategóriák menü" aria-expanded={showMegaMenu} aria-haspopup="true">
                  <Grid3X3 className="w-5 h-5 xl:w-6 xl:h-6" />
                  <span>Kategóriák</span>
                  <ChevronDown className={`w-4 h-4 xl:w-5 xl:h-5 transition-transform ${showMegaMenu ? 'rotate-180' : ''}`} />
                </button>
                {showMegaMenu && (() => {
                  const menuCategories = (Array.isArray(categories) && categories.length > 0) ? categories.filter(c => c && c.name && c.name !== 'Összes').slice(0, 9) : POPULAR_CATEGORIES;
                  const isRealCategories = menuCategories.length > 0 && typeof menuCategories[0]?.count === 'number';
                  return (
                    <div className="absolute top-full left-0 mt-2 w-[500px] xl:w-[600px] 2xl:w-[700px] bg-white rounded-2xl xl:rounded-3xl shadow-2xl border border-gray-100 p-6 xl:p-8 animate-fade-in-up z-50">
                      <div className="grid grid-cols-3 gap-3 xl:gap-4">
                        {menuCategories.map((cat, idx) => {
                          const name = cat?.name ?? String(cat?.id ?? idx);
                          const Icon = isRealCategories ? getCategoryIcon(name) : cat?.icon ?? Grid3X3;
                          const color = isRealCategories ? MEGA_MENU_COLORS[idx % MEGA_MENU_COLORS.length] : (cat?.color ?? 'from-primary-500 to-secondary-700');
                          return (
                            <button key={isRealCategories ? name : (cat?.id ?? `cat-${idx}`)} onClick={() => { onCategorySelect?.(name); setActiveTab('shop'); setShowMegaMenu(false); setTimeout(() => onScrollToShop?.(), 80); }} className="flex flex-col items-center gap-2 xl:gap-3 p-4 xl:p-5 rounded-xl xl:rounded-2xl hover:bg-gray-50 transition-all group">
                              <div className={`w-12 h-12 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 rounded-xl xl:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 xl:w-8 xl:h-8 2xl:w-10 2xl:h-10" />
                              </div>
                              <span className="text-sm xl:text-base 2xl:text-lg font-semibold text-gray-700 text-center">{name}</span>
                              {isRealCategories && cat.count != null && <span className="text-xs text-gray-500">{Number(cat.count).toLocaleString('hu-HU')} db</span>}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 xl:mt-6 pt-4 xl:pt-6 border-t border-gray-100">
                        <button onClick={() => { onCategorySelect?.('Összes'); setActiveTab('shop'); setShowMegaMenu(false); setTimeout(() => onScrollToShop?.(), 80); }} className="w-full flex items-center justify-center gap-2 xl:gap-3 py-3 xl:py-4 text-base xl:text-lg 2xl:text-xl text-primary-500 hover:bg-primary-50 rounded-xl xl:rounded-2xl font-bold transition-all">
                          Összes kategória megtekintése
                          <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex items-center gap-2 xl:gap-3 px-4 xl:px-6 2xl:px-7 py-2.5 xl:py-3.5 2xl:py-4 rounded-xl xl:rounded-2xl font-bold text-base xl:text-lg 2xl:text-xl transition-all duration-200 ${activeTab === item.id ? 'bg-gradient-to-r from-primary-500 to-secondary-700 text-white shadow-lg shadow-primary-300/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`} aria-current={activeTab === item.id ? 'page' : undefined} aria-label={item.label}>
                  <item.icon className="w-5 h-5 xl:w-6 xl:h-6" />
                  <span>{item.label}</span>
                  {item.isAI && activeTab !== item.id && <span className="px-2 py-0.5 xl:px-2.5 xl:py-1 text-[10px] xl:text-xs font-bold bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-500 rounded-full">AI</span>}
                  {item.badge && activeTab !== item.id && <span className="px-2 py-0.5 xl:px-2.5 xl:py-1 text-[10px] xl:text-xs font-bold bg-green-100 text-green-700 rounded-full">{item.badge}</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button onClick={() => { document.getElementById('shop-scroll-target')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(() => window.dispatchEvent(new CustomEvent('mkt-focus-search')), 400); }} className="hidden lg:flex items-center gap-2 xl:gap-3 px-4 xl:px-5 py-2.5 xl:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl xl:rounded-2xl text-gray-600 hover:text-gray-900 transition-all" aria-label="Keresés">
                <Search className="w-5 h-5 xl:w-6 xl:h-6" />
                <span className="text-sm xl:text-base font-bold">Keresés</span>
              </button>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="hidden sm:flex p-2.5 sm:p-3 lg:p-3.5 xl:p-4 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] xl:min-w-[56px] xl:min-h-[56px] items-center justify-center text-gray-600 hover:text-gray-900 rounded-xl xl:rounded-2xl hover:bg-gray-100 transition-all" aria-label={isDarkMode ? 'Világos mód' : 'Sötét mód'}>
                {isDarkMode ? <Sun className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />}
              </button>
              <button onClick={onOpenWishlist} className="relative p-2.5 sm:p-3 lg:p-3.5 xl:p-4 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] xl:min-w-[56px] xl:min-h-[56px] flex items-center justify-center text-gray-600 hover:text-red-500 rounded-xl xl:rounded-2xl hover:bg-red-50 transition-all group" aria-label="Kívánságlista">
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-all group-hover:scale-110 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] lg:min-w-[24px] h-5 lg:h-6 flex items-center justify-center px-1.5 lg:px-2 text-xs lg:text-sm font-bold text-white bg-red-500 rounded-full shadow-lg animate-scale-in">{wishlistCount}</span>}
              </button>
              <button ref={hamburgerButtonRef} type="button" className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all" onClick={openMobileMenu} aria-label="Menü megnyitása">
                <Menu className="w-6 h-6" />
              </button>
              <a href={webshopDomain} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 xl:gap-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-5 lg:px-7 xl:px-9 2xl:px-10 py-2.5 lg:py-3.5 xl:py-4 2xl:py-5 rounded-xl lg:rounded-2xl text-sm lg:text-base xl:text-lg 2xl:text-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" aria-label="Fő webshop megnyitása új lapon">
                <span>Fő webshop</span>
                <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary-500 via-secondary-700 to-secondary-600 text-white py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 lg:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative flex items-center justify-center gap-2 sm:gap-3">
          <div key={announcementIndex} className="flex items-center gap-2 sm:gap-3 animate-fade-in">
            <currentAnnouncement.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-sm sm:text-base lg:text-lg font-medium">
              {currentAnnouncement.text.split(currentAnnouncement.highlight).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded mx-1">{currentAnnouncement.highlight}</span>}
                </React.Fragment>
              ))}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-3">
            {ANNOUNCEMENT_MESSAGES.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === announcementIndex ? 'bg-white w-4' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      </div>

      {isReturningUser && (
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10 pt-4 sm:pt-5">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-full py-2 px-4 sm:px-6 lg:px-8 shadow-sm w-auto lg:min-w-[400px]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-sm shrink-0">👋</div>
            <p className="text-sm font-bold text-gray-900 whitespace-nowrap">Üdv újra{userName ? `, ${userName}` : ''}!</p>
            <span className="text-xs text-emerald-600 whitespace-nowrap hidden sm:inline">Örülünk, hogy visszatértél</span>
            <Sparkles className="w-4 h-4 text-emerald-500/60 shrink-0" />
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <>
          <button type="button" className="fixed inset-0 z-[199] lg:hidden bg-black/40 backdrop-blur-sm" onClick={closeMobileMenu} aria-label="Menü bezárása (háttér)" />
          <div ref={mobileMenuRef} className={`fixed top-0 right-0 bottom-[40px] w-full max-w-sm z-[200] lg:hidden ${mobileMenuClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`} role="dialog" aria-modal="true" aria-label="Navigációs menü" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-secondary-700 to-secondary-600 rounded-l-2xl overflow-hidden" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-5 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-32 right-5 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-float-medium" />
            <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl animate-float-fast" />
          </div>
          <div className="relative h-full flex flex-col text-white p-4 sm:p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center"><Home className="w-6 h-6 sm:w-7 sm:h-7" /></div>
                <div>
                  <div className="flex items-baseline"><span className="font-black text-2xl sm:text-3xl">Marketly</span><span className="font-black text-2xl sm:text-3xl text-white/80">.AI</span></div>
                  <p className="text-xs sm:text-sm text-white/60 font-medium tracking-wider">BÚTORBOLT</p>
                </div>
              </div>
              <button type="button" className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-colors" onClick={closeMobileMenu} aria-label="Menü bezárása"><X className="w-7 h-7" /></button>
            </div>
            <div className="flex gap-3 sm:gap-4 mb-6">
              <button onClick={focusSearchAndClose} className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-white/15 backdrop-blur-xl rounded-xl font-bold text-base sm:text-lg" aria-label="Keresés"><Search className="w-5 h-5 sm:w-6 sm:h-6" /><span>Keresés</span></button>
              <button onClick={() => { onOpenWishlist?.(); closeMobileMenu(); }} className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-white/15 backdrop-blur-xl rounded-xl font-bold text-base sm:text-lg relative" aria-label="Kedvencek">
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${wishlistCount > 0 ? 'fill-white' : ''}`} /><span>Kedvencek</span>
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-sm flex items-center justify-center font-bold">{wishlistCount}</span>}
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm sm:text-base text-white/70 font-bold uppercase tracking-wider mb-3 sm:mb-4">Kategóriák</p>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {(() => {
                  const realCats = (Array.isArray(categories) && categories.length > 0) ? categories.filter(c => c && c.name && c.name !== 'Összes').slice(0, 6) : [];
                  const list = realCats.length > 0 ? realCats : POPULAR_CATEGORIES.slice(0, 6);
                  return list.map((cat, idx) => {
                    const name = typeof cat?.name === 'string' ? cat.name : (cat?.name ?? '');
                    const isReal = realCats.length > 0;
                    const Icon = isReal ? getCategoryIcon(name) : (cat?.icon ?? Grid3X3);
                    const color = isReal ? MEGA_MENU_COLORS[idx % MEGA_MENU_COLORS.length] : (cat?.color ?? 'from-primary-500 to-secondary-700');
                    return (
                      <button key={isReal ? name : (cat?.id ?? `m-${idx}`)} onClick={() => { onCategorySelect?.(name); setActiveTab('shop'); closeMobileMenu(); setTimeout(() => onScrollToShop?.(), 400); }} className="flex flex-col items-center gap-2 sm:gap-2.5 py-3.5 sm:py-4 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-all min-h-[44px]">
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}><Icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <span className="text-xs sm:text-sm font-bold text-center line-clamp-2">{name}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm sm:text-base text-white/70 font-bold uppercase tracking-wider mb-3 sm:mb-4">Navigáció</p>
              {navItems.map((item, index) => (
                <button key={item.id} onClick={() => setTabAndClose(item.id)} className={`w-full flex items-center gap-4 px-4 sm:px-5 py-4 sm:py-5 rounded-xl text-left transition-all ${activeTab === item.id ? 'bg-white text-gray-900 shadow-2xl' : 'bg-white/10 hover:bg-white/20 backdrop-blur-xl'}`} style={{ animationDelay: `${index * 50}ms` }} aria-current={activeTab === item.id ? 'page' : undefined} aria-label={item.label}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${activeTab === item.id ? 'bg-gradient-to-br from-primary-500 to-secondary-700 text-white' : 'bg-white/20'}`}><item.icon className="w-6 h-6 sm:w-7 sm:h-7" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg sm:text-xl font-bold ${activeTab === item.id ? 'text-gray-900' : 'text-white'}`}>{item.label}</span>
                      {item.isAI && <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === item.id ? 'bg-primary-100 text-primary-500' : 'bg-white/20 text-white'}`}>AI</span>}
                    </div>
                    <p className={`text-sm sm:text-base ${activeTab === item.id ? 'text-gray-500' : 'text-white/60'}`}>{item.desc}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === item.id ? 'text-primary-500' : 'text-white/40'}`} />
                </button>
              ))}
            </div>
            {((recentlyViewedProp?.length ? recentlyViewedProp : recentlyViewedLocal) || []).length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Utoljára nézett</p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {(recentlyViewedProp?.length ? recentlyViewedProp : recentlyViewedLocal).slice(0, 4).map((product) => (
                    <button key={product?.id ?? 'rv'} type="button" onClick={() => { onRecentProductClick?.(product); closeMobileMenu(); }} className="shrink-0 w-20 text-left rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden mb-1">
                        <img src={fixUrl(product?.imageUrl ?? product?.images?.[0])} alt={product?.name ?? ''} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <p className="text-[10px] text-white/80 truncate">{product?.name ?? ''}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto space-y-3">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl">
                <div className="flex items-center gap-3">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}<span className="font-semibold">{isDarkMode ? 'Világos mód' : 'Sötét mód'}</span></div>
                <div className={`w-10 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-primary-400' : 'bg-white/30'}`}><div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isDarkMode ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} /></div>
              </button>
              <div className="flex gap-2">
                <a href="tel:+36123456789" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-sm font-semibold"><Phone className="w-4 h-4" />Hívás</a>
                <a href="mailto:info@marketly.hu" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-sm font-semibold"><Mail className="w-4 h-4" />Email</a>
              </div>
              <div className="flex justify-center gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors"><MapPin className="w-5 h-5" /></a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2.5 text-center"><p className="text-lg font-bold">{productCount > 0 ? `${(productCount / 1000).toFixed(0)}K+` : '...'}</p><p className="text-[9px] text-white/60">Termék</p></div>
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2.5 text-center"><p className="text-lg font-bold">24/7</p><p className="text-[9px] text-white/60">AI Support</p></div>
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2.5 text-center"><p className="text-lg font-bold">4.9★</p><p className="text-[9px] text-white/60">Értékelés</p></div>
              </div>
              <a href={webshopDomain} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl font-bold text-base bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-2xl" onClick={closeMobileMenu}>Vissza a fő webshopba<ExternalLink className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
