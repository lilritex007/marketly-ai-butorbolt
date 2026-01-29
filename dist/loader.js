/**
 * Marketly AI Shop Loader
 * Dinamikusan betölti a React appot a Railway backend-ről.
 * FIX URL - minden deploy után azonnal él, nincs CDN cache!
 */
(function() {
  'use strict';

  console.log('🚀 AI Shop Loader starting...');

  // Railway backend URL - ez fix, deploy után azonnal frissül
  var BACKEND_URL = 'https://marketly-ai-butorbolt-production.up.railway.app';

  window.MARKETLY_CONFIG = {
    apiBase: BACKEND_URL + '/api',
    productBaseUrl: '/termek',
    cartUrl: '/cart',
    checkoutUrl: '/checkout',
    mode: 'unas-integrated',
    distBase: BACKEND_URL + '/dist', // Frontend fájlok a backend-ről
    features: { sessionSharing: false, stockCheck: false, expressCheckout: false }
  };
  console.log('✅ MARKETLY_CONFIG initialized');

  var DIST_BASE = window.MARKETLY_CONFIG.distBase;

  function ensureRoot() {
    var root = document.getElementById('root');
    if (root) return root;
    var container = document.createElement('div');
    container.id = 'root';
    container.className = 'min-h-screen';
    var mainContent = document.querySelector('main') || document.querySelector('#content') || document.body;
    if (mainContent.firstChild) mainContent.insertBefore(container, mainContent.firstChild);
    else mainContent.appendChild(container);
    return container;
  }

  function hideLoadingOverlay() {
    setTimeout(function() {
      var overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s';
        setTimeout(function() { overlay.remove(); }, 500);
      }
    }, 500);
  }

  function showLoadError() {
    var overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.innerHTML = '<div style="text-align:center;max-width:400px;"><h2 style="color:#ef4444;margin-bottom:10px;">❌ Betöltési hiba</h2><p style="color:#6b7280;">A React app nem töltődött be. Frissítsd az oldalt!</p><button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">🔄 Újratöltés</button></div>';
    }
  }

  function loadReactApp() {
    ensureRoot();

    // Cache bust with timestamp to always get fresh files
    var cacheBust = Date.now();

    // Load CSS
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = DIST_BASE + '/assets/index.css?t=' + cacheBust;
    document.head.appendChild(link);

    // Preload vendor bundle
    var vendorPreload = document.createElement('link');
    vendorPreload.rel = 'modulepreload';
    vendorPreload.href = DIST_BASE + '/assets/vendor.js?t=' + cacheBust;
    document.head.appendChild(vendorPreload);

    // Load main React bundle
    var script = document.createElement('script');
    script.type = 'module';
    script.src = DIST_BASE + '/assets/index.js?t=' + cacheBust;
    script.onload = function() {
      console.log('✅ React app loaded');
      hideLoadingOverlay();
    };
    script.onerror = function() {
      console.error('❌ Failed to load React app');
      showLoadError();
    };
    document.body.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReactApp);
  } else {
    loadReactApp();
  }
})();
