/**
 * Marketly AI Shop Loader
 * Dinamikusan betölti a React appot jsDelivr CDN-ről
 */

(function() {
  'use strict';
  
  console.log('🚀 AI Shop Loader starting...');

  // Config inicializálás (mivel tinyMCE elrontja a script tageket)
  window.MARKETLY_CONFIG = {
    apiBase: 'https://marketly-ai-butorbolt-production.up.railway.app/api',  // Railway Backend API
    productBaseUrl: '/termek',
    cartUrl: '/cart',
    checkoutUrl: '/checkout',
    mode: 'unas-integrated',
    cdnBase: 'https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist',
    features: {
      sessionSharing: false,
      stockCheck: false,
      expressCheckout: false
    }
  };
  console.log('✅ MARKETLY_CONFIG initialized:', window.MARKETLY_CONFIG);

  const CDN_BASE = window.MARKETLY_CONFIG.cdnBase;
  console.log('📦 CDN Base (jsDelivr):', CDN_BASE);

  // CSS betöltése dinamikusan
  const loadCSS = () => {
    // Ellenőrizzük hogy a CSS már be van-e töltve
    const existingLink = document.querySelector('link[href*="index-Cxl7vB80.css"]');
    if (existingLink) {
      console.log('✅ CSS already loaded');
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${CDN_BASE}/assets/index-Cxl7vB80.css`;
    link.crossOrigin = 'anonymous';
    
    link.onload = () => {
      console.log('✅ CSS loaded successfully');
    };
    
    link.onerror = () => {
      console.error('❌ Failed to load CSS');
    };
    
    document.head.appendChild(link);
    console.log('📦 CSS link injected');
  };

  // Ellenőrizzük hogy a root elem létezik-e
  const checkRoot = () => {
    const root = document.getElementById('root');
    if (!root) {
      console.error('❌ #root element not found!');
      return false;
    }
    console.log('✅ #root element found');
    return true;
  };

  // React bundle betöltése - use current build directly (NO DETECTION)
  const loadReactApp = async () => {
    if (!checkRoot()) return;

    // Először töltsük be a CSS-t
    loadCSS();

    console.log('📥 Loading React bundle...');
    
    // ALWAYS use current build bundle directly (updated: 2025-01-27)
    // DO NOT try to detect from index.html - CDN cache issues!
    const currentBundle = 'index-D2KXc36-.js';
    const bundlePath = `/assets/${currentBundle}`;
    console.log('🔍 Using CURRENT bundle (no detection):', currentBundle);
    
    const script = document.createElement('script');
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    // Cache-busting to ensure latest version
    const cacheBuster = '?v=' + Date.now();
    script.src = `${CDN_BASE}${bundlePath}${cacheBuster}`;
    
    script.onload = () => {
      console.log('✅ React bundle loaded successfully!');
      
      // Távolítsuk el a loading overlay-t
      setTimeout(() => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.5s';
          setTimeout(() => overlay.remove(), 500);
        }
      }, 500);
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load React bundle:', error);
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.innerHTML = `
          <div style="text-align:center;max-width:400px;">
            <h2 style="color:#ef4444;margin-bottom:10px;">❌ Betöltési hiba</h2>
            <p style="color:#6b7280;">A React app nem töltődött be. Frissítsd az oldalt!</p>
            <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">
              🔄 Újratöltés
            </button>
          </div>
        `;
      }
    };
    
    document.body.appendChild(script);
    console.log('📌 Script tag injected');
  };

  // Várjunk míg a DOM teljesen betöltődik
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReactApp);
  } else {
    loadReactApp();
  }

  console.log('✅ AI Shop Loader initialized');
})();
