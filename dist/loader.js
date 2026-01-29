/**
 * Marketly AI Shop Loader
 * Dinamikusan betölti a React appot jsDelivr CDN-ről.
 */
(function() {
  'use strict';

  console.log('🚀 AI Shop Loader starting...');

  window.MARKETLY_CONFIG = {
    apiBase: 'https://marketly-ai-butorbolt-production.up.railway.app/api',
    productBaseUrl: '/termek',
    cartUrl: '/cart',
    checkoutUrl: '/checkout',
    mode: 'unas-integrated',
    cdnBase: 'https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist',
    features: { sessionSharing: false, stockCheck: false, expressCheckout: false }
  };
  console.log('✅ MARKETLY_CONFIG initialized');

  var CDN_BASE = window.MARKETLY_CONFIG.cdnBase;

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

    fetch(CDN_BASE + '/version.json?t=' + Date.now())
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var ver = (data && data.buildTime) || Date.now();
        
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CDN_BASE + '/assets/index.css?v=' + ver;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);

        var vendorPreload = document.createElement('link');
        vendorPreload.rel = 'modulepreload';
        vendorPreload.href = CDN_BASE + '/assets/vendor.js?v=' + ver;
        vendorPreload.crossOrigin = 'anonymous';
        document.head.appendChild(vendorPreload);

        var script = document.createElement('script');
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        script.src = CDN_BASE + '/assets/index.js?v=' + ver;
        script.onload = function() {
          console.log('✅ React app loaded');
          hideLoadingOverlay();
        };
        script.onerror = function() {
          console.error('❌ Failed to load React app');
          showLoadError();
        };
        document.body.appendChild(script);
      })
      .catch(function() {
        var ver = Date.now();
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CDN_BASE + '/assets/index.css?v=' + ver;
        document.head.appendChild(link);
        var script = document.createElement('script');
        script.type = 'module';
        script.src = CDN_BASE + '/assets/index.js?v=' + ver;
        script.onload = hideLoadingOverlay;
        script.onerror = showLoadError;
        document.body.appendChild(script);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReactApp);
  } else {
    loadReactApp();
  }
})();
