import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Sparkles, Grid3X3, ChevronDown, ChevronUp, ArrowRight, Search, Sun, Moon, Heart, Menu, X, ChevronRight,
  ShoppingCart, Camera, Move, Truck, Gift, Zap, TrendingUp, Star, Sofa, BedDouble, Armchair,
  Lamp, Instagram, Facebook, MapPin, Mail, Phone, Clock
} from 'lucide-react';

const RECENT_CATEGORIES_KEY = 'mkt_recent_categories';
const RECENT_CATEGORIES_MAX = 3;
import { getCategoryIcon } from '../ui/Icons';

const ANNOUNCEMENT_MESSAGES = [
  { icon: Truck, text: 'Ingyenes szállítás 50e Ft felett', highlight: 'Ingyenes' },
  { icon: Gift, text: '10% kód: ELSO10', highlight: 'ELSO10' },
  { icon: Zap, text: 'AI ajánlatok – csak neked', highlight: 'AI' },
  { icon: TrendingUp, text: '90.000+ termék', highlight: '90.000+' },
  { icon: Star, text: '4.9★ – 10.000+ vásárló', highlight: '4.9★' },
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
 * Navbar – fejléc, kategória mega menu (fő + alkategóriák), mobil menü, announcement sáv.
 * Props: activeTab, setActiveTab, wishlistCount, productCount, categories, categoryHierarchy?, onOpenWishlist, onCategorySelect, onScrollToShop, recentlyViewed?, fixUrl?, onRecentProductClick?
 * categoryHierarchy: [ { name, productCount, children: [ { name, productCount } ] } ] – ha megadva, csak fő kategóriák + alkategóriák jelennek meg.
 * activeCategory: aktuálisan kiválasztott kategória (fő vagy alkategória) – a menüben kiemelve.
 */
export default function Navbar({
  activeTab,
  setActiveTab,
  wishlistCount,
  productCount = 0,
  categories = [],
  categoryHierarchy = [],
  activeCategory = '',
  onOpenWishlist,
  onCategorySelect,
  onScrollToShop,
  recentlyViewed: recentlyViewedProp = [],
  fixUrl = (url) => url || '',
  onRecentProductClick
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcementProgress, setAnnouncementProgress] = useState(0);
  const announcementStartRef = useRef(Date.now());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [recentlyViewedLocal, setRecentlyViewedLocal] = useState([]);
  const [recentCategories, setRecentCategories] = useState([]);
  const [mobileCategoriesExpanded, setMobileCategoriesExpanded] = useState(false);
  const [mobileExpandedMain, setMobileExpandedMain] = useState(null);
  const [megaMenuHoverMain, setMegaMenuHoverMain] = useState(null);
  const mobileMenuRef = useRef(null);
  const megaMenuRef = useRef(null);
  const megaMenuPanelRef = useRef(null);
  const megaMenuCloseTimeoutRef = useRef(null);
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
    try {
      const raw = localStorage.getItem(RECENT_CATEGORIES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setRecentCategories(Array.isArray(list) ? list.slice(0, RECENT_CATEGORIES_MAX) : []);
    } catch {
      setRecentCategories([]);
    }
  }, []);

  const pushRecentCategory = (name) => {
    if (!name || name === 'Összes') return;
    setRecentCategories((prev) => {
      const next = [name, ...prev.filter((c) => c !== name)].slice(0, RECENT_CATEGORIES_MAX);
      try {
        localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const ANNOUNCEMENT_DURATION_MS = 5500;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex(prev => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
      announcementStartRef.current = Date.now();
      setAnnouncementProgress(0);
    }, ANNOUNCEMENT_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  const announcementRafRef = useRef(null);
  useEffect(() => {
    const start = announcementStartRef.current;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / ANNOUNCEMENT_DURATION_MS) * 100);
      setAnnouncementProgress(p);
      if (p < 100) announcementRafRef.current = requestAnimationFrame(tick);
    };
    announcementRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (announcementRafRef.current) cancelAnimationFrame(announcementRafRef.current);
    };
  }, [announcementIndex]);

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
    if (!showMegaMenu) return;
    const panel = megaMenuPanelRef.current;
    if (!panel) {
      // #region agent log
      fetch('http://localhost:7244/ingest/4b0575bc-02d3-43f2-bc91-db7897d5cbba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre',hypothesisId:'H5',location:'Navbar.jsx:megaMenu',message:'panel null when showMegaMenu',data:{showMegaMenu},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return;
    }
    const focusables = panel.querySelectorAll('button:not([disabled])');
    const first = focusables[0];
    if (first) {
      const t = setTimeout(() => first.focus(), 50);
      const handleKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        const idx = Array.from(focusables).indexOf(document.activeElement);
        if (e.shiftKey) {
          if (idx <= 0) {
            e.preventDefault();
            focusables[focusables.length - 1]?.focus();
          }
        } else {
          if (idx >= focusables.length - 1 || idx === -1) {
            e.preventDefault();
            focusables[0]?.focus();
          }
        }
      };
      panel.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(t);
        panel.removeEventListener('keydown', handleKeyDown);
      };
    }
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
    setMobileCategoriesExpanded(false);
    setMobileExpandedMain(null);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuClosing(false);
      hamburgerButtonRef.current?.focus();
    }, 300);
  };

  const focusSearchAndClose = () => {
    setActiveTab('shop');
    closeMobileMenu();
    setTimeout(() => {
      onScrollToShop?.();
      window.dispatchEvent(new CustomEvent('mkt-focus-search'));
    }, 400);
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
              onClick={() => { setActiveTab('shop'); setTimeout(() => onScrollToShop?.(), 350); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('shop'); setTimeout(() => onScrollToShop?.(), 350); } }}
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

            <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4 2xl:gap-4">
              <div
                ref={megaMenuRef}
                className="relative"
                onMouseEnter={() => {
                  if (megaMenuCloseTimeoutRef.current) {
                    clearTimeout(megaMenuCloseTimeoutRef.current);
                    megaMenuCloseTimeoutRef.current = null;
                  }
                  setShowMegaMenu(true);
                }}
                onMouseLeave={() => {
                  megaMenuCloseTimeoutRef.current = setTimeout(() => setShowMegaMenu(false), 180);
                }}
              >
                <button className={`flex items-center gap-2 lg:gap-3 xl:gap-3 px-3 lg:px-4 xl:px-6 2xl:px-7 py-2.5 lg:py-3 xl:py-3.5 2xl:py-4 rounded-xl lg:rounded-2xl font-bold text-sm lg:text-base xl:text-lg 2xl:text-xl transition-all duration-200 min-h-[44px] ${showMegaMenu ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-200 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`} aria-label="Kategóriák menü" aria-expanded={showMegaMenu} aria-haspopup="true">
                  <Grid3X3 className="w-5 h-5 lg:w-5 xl:w-6 xl:h-6" />
                  <span>Kategóriák</span>
                  <ChevronDown className={`w-4 h-4 lg:w-5 xl:w-5 transition-transform duration-200 ${showMegaMenu ? 'rotate-180' : ''}`} />
                </button>
                {showMegaMenu && (() => {
                  const hasHierarchy = Array.isArray(categoryHierarchy) && categoryHierarchy.length > 0;
                  if (hasHierarchy) {
                    return (
                      <div
                        ref={megaMenuPanelRef}
                        className="absolute top-full left-0 pt-1 w-[min(90vw,640px)] md:w-[min(92vw,680px)] lg:w-[640px] xl:w-[720px] 2xl:w-[800px] rounded-2xl lg:rounded-3xl z-50"
                        onMouseEnter={() => {
                          if (megaMenuCloseTimeoutRef.current) {
                            clearTimeout(megaMenuCloseTimeoutRef.current);
                            megaMenuCloseTimeoutRef.current = null;
                          }
                        }}
                        role="dialog"
                        aria-label="Kategóriák menü"
                      >
                        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden animate-fade-in-up">
                        <div className="p-4 lg:p-5 xl:p-5 border-b border-gray-200 bg-gray-50">
                          <p className="text-xs text-gray-500 font-medium" aria-hidden="true">Termékek &gt; Kategóriák</p>
                          <h3 className="text-sm lg:text-base font-bold text-gray-700 uppercase tracking-wider mt-0.5">Böngéssz kategóriák szerint</h3>
                        </div>
                        <div className="p-4 lg:p-5 xl:p-6 2xl:p-7 max-h-[65vh] md:max-h-[70vh] overflow-y-auto bg-white">
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 xl:gap-6">
                            {categoryHierarchy.slice(0, 12).map((main, idx) => {
                              const isHover = megaMenuHoverMain === main.name;
                              const isActiveMain = activeCategory === main.name;
                              const children = (main.children || []).slice(0, 8);
                              const MainIcon = getCategoryIcon(main.name);
                              const color = MEGA_MENU_COLORS[idx % MEGA_MENU_COLORS.length];
                              return (
                                <div
                                  key={main.name}
                                  className={`rounded-xl xl:rounded-2xl border-2 transition-colors duration-200 ${isActiveMain ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:border-primary-200 hover:bg-primary-50/70'}`}
                                  onMouseEnter={() => setMegaMenuHoverMain(main.name)}
                                  onMouseLeave={() => setMegaMenuHoverMain(null)}
                                >
                                  <button
                                    onClick={() => { pushRecentCategory(main.name); onCategorySelect?.(main.name); setActiveTab('shop'); setShowMegaMenu(false); }}
                                    className={`w-full flex items-center gap-3 p-3 xl:p-4 rounded-t-xl xl:rounded-t-2xl text-left min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${isHover || isActiveMain ? 'bg-primary-50' : 'hover:bg-white'}`}
                                    data-nav-action="category"
                                    data-nav-target={main.name}
                                    aria-label={`Fő kategória: ${main.name}${isActiveMain ? ' (kiválasztva)' : ''}`}
                                    aria-current={isActiveMain ? 'true' : undefined}
                                  >
                                    <div className={`w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                                      <MainIcon className="w-5 h-5 xl:w-6 xl:h-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="font-bold text-gray-800 text-sm xl:text-base block truncate">{main.name}</span>
                                      <span className="text-xs text-gray-500">{Number(main.productCount || 0).toLocaleString('hu-HU')} termék</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                  </button>
                                  {children.length > 0 && (
                                    <div className="px-3 xl:px-4 pb-3 xl:pb-4 pt-0 flex flex-wrap gap-1.5">
                                      {children.map((child) => {
                                        const isActiveChild = activeCategory === child.name;
                                        return (
                                          <button
                                            key={child.name}
                                            onClick={() => { pushRecentCategory(child.name); onCategorySelect?.(child.name); setActiveTab('shop'); setShowMegaMenu(false); }}
                                            className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-colors min-h-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 ${isActiveChild ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-primary-600 hover:bg-primary-100'}`}
                                            data-nav-action="category"
                                            data-nav-target={child.name}
                                            aria-label={`Alkategória: ${child.name}${isActiveChild ? ' (kiválasztva)' : ''}`}
                                            aria-current={isActiveChild ? 'true' : undefined}
                                          >
                                            {child.name}
                                            {child.productCount != null && <span className={isActiveChild ? 'text-white/80 ml-1' : 'text-gray-400 ml-1'}>({Number(child.productCount).toLocaleString('hu-HU')})</span>}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="px-4 lg:px-5 xl:px-6 2xl:px-7 pb-4 lg:pb-5 xl:pb-6 2xl:pb-7 pt-0 border-t border-gray-200 bg-gray-50">
                          <button onClick={() => { onCategorySelect?.('Összes'); setActiveTab('shop'); setShowMegaMenu(false); }} className="w-full flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-3.5 text-sm lg:text-base xl:text-lg text-primary-600 hover:bg-primary-100 rounded-xl lg:rounded-2xl font-bold transition-all border-2 border-primary-200 hover:border-primary-300 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2" data-nav-action="category" data-nav-target="Összes" aria-label="Összes kategória megtekintése">
                            Összes kategória megtekintése
                            <ArrowRight className="w-4 h-4 lg:w-5 xl:w-5" />
                          </button>
                        </div>
                        </div>
                      </div>
                    );
                  }
                  const menuCategories = (Array.isArray(categories) && categories.length > 0) ? categories.filter(c => c && c.name && c.name !== 'Összes').slice(0, 12) : POPULAR_CATEGORIES;
                  const isRealCategories = menuCategories.length > 0 && typeof menuCategories[0]?.count === 'number';
                  return (
                    <div ref={megaMenuPanelRef} className="absolute top-full left-0 pt-1 w-[min(90vw,640px)] md:w-[min(92vw,680px)] lg:w-[640px] xl:w-[720px] 2xl:w-[800px] z-50" onMouseEnter={() => { if (megaMenuCloseTimeoutRef.current) { clearTimeout(megaMenuCloseTimeoutRef.current); megaMenuCloseTimeoutRef.current = null; } }} role="dialog" aria-label="Kategóriák menü">
                      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden animate-fade-in-up">
                      <div className="p-4 xl:p-5 border-b border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-500 font-medium" aria-hidden="true">Termékek &gt; Kategóriák</p>
                        <h3 className="text-sm xl:text-base font-bold text-gray-700 uppercase tracking-wider mt-0.5">Böngéssz kategóriák szerint</h3>
                      </div>
                      <div className="p-5 xl:p-6 2xl:p-7">
                        <div className="grid grid-cols-4 gap-3 xl:gap-4 2xl:gap-5">
                          {menuCategories.map((cat, idx) => {
                            const name = cat?.name ?? String(cat?.id ?? idx);
                            const Icon = isRealCategories ? getCategoryIcon(name) : cat?.icon ?? Grid3X3;
                            const color = isRealCategories ? MEGA_MENU_COLORS[idx % MEGA_MENU_COLORS.length] : (cat?.color ?? 'from-primary-500 to-secondary-700');
                            return (
                              <button key={isRealCategories ? name : (cat?.id ?? `cat-${idx}`)} onClick={() => { pushRecentCategory(name); onCategorySelect?.(name); setActiveTab('shop'); setShowMegaMenu(false); }} className="flex flex-col items-center gap-2 xl:gap-2.5 p-3 xl:p-4 rounded-xl xl:rounded-2xl hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] active:bg-gray-100 transition-all duration-200 group min-h-[44px]" data-nav-action="category" data-nav-target={name} aria-label={`Kategória: ${name}`}>
                                <div className={`w-11 h-11 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 rounded-xl xl:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white group-hover:scale-110 shadow-md group-hover:shadow-lg transition-all duration-200`}>
                                  <Icon className="w-5 h-5 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8" />
                                </div>
                                <span className="text-xs xl:text-sm 2xl:text-base font-semibold text-gray-700 text-center leading-tight line-clamp-2">{name}</span>
                                {isRealCategories && cat.count != null && <span className="text-[10px] xl:text-xs text-gray-400">{Number(cat.count).toLocaleString('hu-HU')} db</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="px-5 xl:px-6 2xl:px-7 pb-5 xl:pb-6 2xl:pb-7 pt-0 border-t border-gray-200 bg-gray-50">
                        <button onClick={() => { onCategorySelect?.('Összes'); setActiveTab('shop'); setShowMegaMenu(false); }} className="w-full flex items-center justify-center gap-2 xl:gap-3 py-3 xl:py-3.5 text-sm xl:text-base 2xl:text-lg text-primary-600 hover:bg-primary-100 rounded-xl xl:rounded-2xl font-bold transition-all border-2 border-primary-200 hover:border-primary-300 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2" data-nav-action="category" data-nav-target="Összes" aria-label="Összes kategória megtekintése">
                          Összes kategória megtekintése
                          <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5" />
                        </button>
                      </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex items-center gap-2 lg:gap-3 xl:gap-3 px-3 lg:px-4 xl:px-6 2xl:px-7 py-2.5 lg:py-3 xl:py-3.5 2xl:py-4 rounded-xl lg:rounded-2xl font-bold text-sm lg:text-base xl:text-lg 2xl:text-xl transition-all duration-200 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] ${activeTab === item.id ? 'bg-gradient-to-r from-primary-500 to-secondary-700 text-white shadow-lg shadow-primary-300/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`} aria-current={activeTab === item.id ? 'page' : undefined} aria-label={item.label} data-nav-action="tab" data-nav-target={item.id}>
                  <item.icon className="w-5 h-5 lg:w-5 xl:w-6 xl:h-6" />
                  <span>{item.label}</span>
                  {item.isAI && activeTab !== item.id && <span className="px-2 py-0.5 xl:px-2.5 xl:py-1 text-[10px] xl:text-xs font-bold bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-500 rounded-full">AI</span>}
                  {item.badge && activeTab !== item.id && <span className="px-2 py-0.5 xl:px-2.5 xl:py-1 text-[10px] xl:text-xs font-bold bg-green-100 text-green-700 rounded-full">{item.badge}</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button onClick={() => { setActiveTab('shop'); setTimeout(() => { onScrollToShop?.(); window.dispatchEvent(new CustomEvent('mkt-focus-search')); }, 200); }} className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-3 px-3 lg:px-4 xl:px-5 py-2.5 lg:py-3 min-h-[44px] bg-gray-100 hover:bg-gray-200 rounded-xl lg:rounded-2xl text-gray-600 hover:text-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all" aria-label="Keresés" data-nav-action="search">
                <Search className="w-5 h-5 lg:w-5 xl:w-6 xl:h-6" />
                <span className="text-sm lg:text-base font-bold">Keresés</span>
              </button>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="hidden sm:flex p-2.5 sm:p-3 min-w-[44px] min-h-[44px] items-center justify-center text-gray-600 hover:text-gray-900 rounded-xl lg:rounded-2xl hover:bg-gray-100 transition-all" aria-label={isDarkMode ? 'Világos mód' : 'Sötét mód'}>
                {isDarkMode ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
              <button onClick={onOpenWishlist} className="relative p-2.5 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-red-500 rounded-xl lg:rounded-2xl hover:bg-red-50 transition-all group" aria-label="Kívánságlista">
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-all group-hover:scale-110 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg animate-scale-in">{wishlistCount}</span>}
              </button>
              <button ref={hamburgerButtonRef} type="button" className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all" onClick={openMobileMenu} aria-label="Menü megnyitása">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary-500 via-secondary-700 to-secondary-600 text-white py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 lg:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }} aria-hidden="true" />
        <div className="relative flex items-center justify-center gap-2 sm:gap-3 min-h-[44px]">
          <div key={announcementIndex} className="flex items-center gap-2 sm:gap-3 animate-fade-in max-w-full" role="marquee" aria-live="polite">
            <currentAnnouncement.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-white/90" aria-hidden />
            <span className="text-sm sm:text-base lg:text-lg font-medium truncate">
              {currentAnnouncement.text.split(currentAnnouncement.highlight).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="font-bold bg-white/25 px-1.5 py-0.5 rounded-md mx-1 shadow-sm">{currentAnnouncement.highlight}</span>}
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
        {/* Progress bar: time until next message */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" aria-hidden="true">
          <div className="h-full bg-white/70 transition-[width] duration-150 ease-linear" style={{ width: `${announcementProgress}%` }} />
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
          <button type="button" className="fixed inset-0 z-[199] md:hidden bg-gray-900/60" onClick={closeMobileMenu} aria-label="Menü bezárása (háttér)" />
          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 z-[200] md:hidden ${mobileMenuClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
            style={{
              width: 'min(400px, 88vw)',
              minWidth: '280px',
              maxWidth: '400px',
              bottom: 'var(--unas-bottom-nav, 40px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigációs menü"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-secondary-700 to-secondary-800 rounded-l-2xl overflow-hidden shadow-2xl shadow-black/20" />
          <div className="relative h-full flex flex-col text-white p-4 sm:p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-lg text-primary-600"><Home className="w-6 h-6 sm:w-7 sm:h-7" /></div>
                <div>
                  <div className="flex items-baseline"><span className="font-black text-2xl sm:text-3xl text-white">Marketly</span><span className="font-black text-2xl sm:text-3xl text-white/90">.AI</span></div>
                  <p className="text-xs sm:text-sm text-white/70 font-medium tracking-wider">BÚTORBOLT</p>
                </div>
              </div>
              <button type="button" className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white" onClick={closeMobileMenu} aria-label="Menü bezárása"><X className="w-7 h-7" /></button>
            </div>
            <div className="flex gap-3 sm:gap-4 mb-6" role="region" aria-label="Gyors műveletek">
              <button onClick={focusSearchAndClose} className="flex-1 flex items-center justify-center gap-2.5 py-4 min-h-[44px] bg-white rounded-xl font-bold text-gray-800 text-base sm:text-lg hover:bg-gray-100 active:scale-[0.98] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600" aria-label="Keresés" data-nav-action="search"><Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" /><span>Keresés</span></button>
              <button onClick={() => { onOpenWishlist?.(); closeMobileMenu(); }} className="flex-1 flex items-center justify-center gap-2.5 py-4 min-h-[44px] bg-white rounded-xl font-bold text-gray-800 text-base sm:text-lg relative hover:bg-gray-100 active:scale-[0.98] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600" aria-label="Kedvencek" data-nav-action="wishlist">
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} /><span>Kedvencek</span>
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-sm flex items-center justify-center font-bold text-white">{wishlistCount}</span>}
              </button>
            </div>
            <div className="mb-4" role="region" aria-label="Kategóriák">
              {recentCategories.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-white/90 font-bold uppercase tracking-wider mb-1.5">Gyakran nézett</p>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {recentCategories.map((name) => {
                      const Icon = getCategoryIcon(name);
                      const idx = recentCategories.indexOf(name);
                      const color = MEGA_MENU_COLORS[idx % MEGA_MENU_COLORS.length];
                      return (
                        <button key={name} onClick={() => { pushRecentCategory(name); onCategorySelect?.(name); setActiveTab('shop'); closeMobileMenu(); }} className="flex items-center gap-2 py-2.5 px-3.5 bg-white/15 rounded-xl hover:bg-white/25 active:scale-[0.98] transition-all min-h-[44px] min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/20" data-nav-action="category" data-nav-target={name} aria-label={`Kategória: ${name}`}>
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow`}><Icon className="w-4 h-4 text-white" /></div>
                          <span className="text-xs font-semibold text-left text-white">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="text-xs text-white/90 font-bold uppercase tracking-wider mb-3">Kategóriák</p>
              {Array.isArray(categoryHierarchy) && categoryHierarchy.length > 0 ? (
                <div className="space-y-2">
                  {categoryHierarchy.slice(0, 16).map((main, idx) => {
                    const isExpanded = mobileExpandedMain === main.name;
                    const isActiveMain = activeCategory === main.name;
                    const children = (main.children || []).slice(0, 10);
                    const MainIcon = getCategoryIcon(main.name);
                    const color = MEGA_MENU_COLORS[idx % MEGA_MENU_COLORS.length];
                    return (
                      <div key={main.name} className="rounded-xl overflow-hidden bg-white/15 border border-white/25 shadow-lg">
                        <button
                          type="button"
                          onClick={() => setMobileExpandedMain((v) => (v === main.name ? null : main.name))}
                          className={`w-full flex items-center gap-3 px-4 py-4 min-h-[48px] text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset ${isExpanded ? 'bg-white/20' : 'hover:bg-white/20'}`}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `${main.name} összecsukása` : `${main.name} kategória megnyitása`}
                          data-nav-action="category-expand"
                          data-nav-target={main.name}
                        >
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                            <MainIcon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-white flex-1 text-left">{main.name}</span>
                          <span className="text-white/90 text-sm tabular-nums">{Number(main.productCount || 0).toLocaleString('hu-HU')}</span>
                          <span className="text-white/70">{isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</span>
                        </button>
                        {isExpanded && children.length > 0 && (
                          <div className="px-4 pb-4 pt-2 border-t border-white/20 bg-white/10">
                            <div className="flex flex-wrap gap-2 justify-start text-left">
                              <button
                                onClick={() => { pushRecentCategory(main.name); onCategorySelect?.(main.name); setActiveTab('shop'); closeMobileMenu(); }}
                                className={`px-3 py-2.5 text-sm font-semibold rounded-xl min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${isActiveMain ? 'bg-primary-500 text-white' : 'bg-white/20 text-white hover:bg-white/30 border border-white/25'}`}
                                data-nav-action="category"
                                data-nav-target={main.name}
                              >
                                Összes ({main.name})
                              </button>
                              {children.map((child) => {
                                const isActiveChild = activeCategory === child.name;
                                return (
                                  <button
                                    key={child.name}
                                    onClick={() => { pushRecentCategory(child.name); onCategorySelect?.(child.name); setActiveTab('shop'); closeMobileMenu(); }}
                                    className={`px-3 py-2.5 text-sm font-medium rounded-xl min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white text-left ${isActiveChild ? 'bg-primary-500 text-white' : 'bg-white/20 text-white/95 hover:bg-white/30 border border-white/25'}`}
                                    data-nav-action="category"
                                    data-nav-target={child.name}
                                  >
                                    {child.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => { onCategorySelect?.('Összes'); setActiveTab('shop'); closeMobileMenu(); }} className="w-full flex items-center justify-center gap-2 py-4 mt-3 bg-white/15 rounded-xl font-bold text-white hover:bg-white/25 active:scale-[0.99] min-h-[48px] transition-all border border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" data-nav-action="category" data-nav-target="Összes">
                    Összes termék
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                (() => {
                  const realCats = (Array.isArray(categories) && categories.length > 0) ? categories.filter(c => c && c.name && c.name !== 'Összes') : [];
                  const list = realCats.length > 0 ? realCats : POPULAR_CATEGORIES;
                  const initialCount = 6;
                  const shown = mobileCategoriesExpanded ? list : list.slice(0, initialCount);
                  const hasMore = list.length > initialCount;
                  return (
                    <>
                      <div className="grid grid-cols-4 gap-2">
                        {shown.map((cat, idx) => {
                          const name = typeof cat?.name === 'string' ? cat.name : (cat?.name ?? '');
                          const isReal = realCats.length > 0;
                          const Icon = isReal ? getCategoryIcon(name) : (cat?.icon ?? Grid3X3);
                          const color = isReal ? MEGA_MENU_COLORS[idx % MEGA_MENU_COLORS.length] : (cat?.color ?? 'from-primary-500 to-secondary-700');
                          return (
                            <button key={isReal ? name : (cat?.id ?? `m-${idx}`)} onClick={() => { pushRecentCategory(name); onCategorySelect?.(name); setActiveTab('shop'); closeMobileMenu(); }} className="flex flex-col items-center gap-1 py-2.5 px-1 bg-white/15 rounded-xl hover:bg-white/25 active:scale-[0.98] transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/20" data-nav-action="category" data-nav-target={name} aria-label={`Kategória: ${name}`}>
                              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow`}><Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                              <span className="text-[10px] sm:text-xs font-semibold text-center line-clamp-2 leading-tight text-white">{name}</span>
                            </button>
                          );
                        })}
                      </div>
                      {hasMore && (
                        <button type="button" onClick={() => setMobileCategoriesExpanded((v) => !v)} className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 bg-white/15 rounded-xl hover:bg-white/25 transition-all min-h-[44px] text-white font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/20" aria-expanded={mobileCategoriesExpanded} aria-label={mobileCategoriesExpanded ? 'Kevesebb kategória' : 'Több kategória megjelenítése'}>
                          {mobileCategoriesExpanded ? 'Kevesebb' : 'Több megjelenítése'}
                          {mobileCategoriesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </>
                  );
                })()
              )}
            </div>
            <div className="space-y-3 mb-6" role="region" aria-label="Navigáció">
              <p className="text-sm sm:text-base text-white/90 font-bold uppercase tracking-wider mb-3 sm:mb-4">Navigáció</p>
              {navItems.map((item, index) => (
                <button key={item.id} onClick={() => setTabAndClose(item.id)} className={`w-full flex items-center gap-4 px-4 sm:px-5 py-4 sm:py-5 rounded-xl text-left transition-all min-h-[44px] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 ${activeTab === item.id ? 'bg-white text-gray-900 shadow-xl' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'}`} style={{ animationDelay: `${index * 50}ms` }} aria-current={activeTab === item.id ? 'page' : undefined} aria-label={item.label} data-nav-action="tab" data-nav-target={item.id}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${activeTab === item.id ? 'bg-gradient-to-br from-primary-500 to-secondary-700 text-white' : 'bg-gray-700 text-white'}`}><item.icon className="w-6 h-6 sm:w-7 sm:h-7" /></div>
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
              <div className="mb-4" role="region" aria-label="Utoljára nézett termékek">
                <p className="text-xs text-white/90 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Utoljára nézett</p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {(recentlyViewedProp?.length ? recentlyViewedProp : recentlyViewedLocal).slice(0, 4).map((product) => (
                    <button key={product?.id ?? 'rv'} type="button" onClick={() => { onRecentProductClick?.(product); closeMobileMenu(); }} className="shrink-0 w-20 min-h-[44px] text-left rounded-xl bg-gray-800 hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white overflow-hidden" data-nav-action="recent-product" data-nav-target={product?.id} aria-label={`Termék megnyitása: ${product?.name ?? ''}`}>
                      <div className="w-20 h-20 bg-gray-700 rounded-t-xl overflow-hidden mb-1">
                        <img src={fixUrl(product?.imageUrl ?? product?.images?.[0])} alt={product?.name ?? ''} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <p className="text-[10px] text-white/90 truncate px-1 pb-1">{product?.name ?? ''}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto space-y-3 pb-[env(safe-area-inset-bottom,0)]" role="region" aria-label="Beállítások és elérhetőség">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between px-4 py-3.5 min-h-[44px] bg-gray-800 rounded-xl hover:bg-gray-700 transition-all border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={isDarkMode ? 'Világos mód bekapcsolása' : 'Sötét mód bekapcsolása'}>
                <div className="flex items-center gap-3">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}<span className="font-semibold text-white">{isDarkMode ? 'Világos mód' : 'Sötét mód'}</span></div>
                <div className={`w-10 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-primary-400' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isDarkMode ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} /></div>
              </button>
              <div className="flex gap-2">
                <a href="tel:+36123456789" className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] bg-gray-800 rounded-xl text-sm font-semibold text-white hover:bg-gray-700 transition-all border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Hívás"><Phone className="w-4 h-4" />Hívás</a>
                <a href="mailto:info@marketly.hu" className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] bg-gray-800 rounded-xl text-sm font-semibold text-white hover:bg-gray-700 transition-all border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="E-mail küldése"><Mail className="w-4 h-4" />Email</a>
              </div>
              <div className="flex justify-center gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-800 rounded-xl hover:bg-gray-700 transition-all border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Instagram"><Instagram className="w-5 h-5 text-white" /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-800 rounded-xl hover:bg-gray-700 transition-all border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Facebook"><Facebook className="w-5 h-5 text-white" /></a>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-800 rounded-xl hover:bg-gray-700 transition-all border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Térkép"><MapPin className="w-5 h-5 text-white" /></a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 rounded-xl p-2.5 text-center border border-gray-700"><p className="text-lg font-bold text-white">{productCount > 0 ? `${(productCount / 1000).toFixed(0)}K+` : '...'}</p><p className="text-[9px] text-white/70">Termék</p></div>
                <div className="bg-gray-800 rounded-xl p-2.5 text-center border border-gray-700"><p className="text-lg font-bold text-white">24/7</p><p className="text-[9px] text-white/70">AI Support</p></div>
                <div className="bg-gray-800 rounded-xl p-2.5 text-center border border-gray-700"><p className="text-lg font-bold text-white">4.9★</p><p className="text-[9px] text-white/70">Értékelés</p></div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
