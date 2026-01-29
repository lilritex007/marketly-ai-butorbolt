/**
 * Marketly AI Shop Loader
 * Dinamikusan betölti a React appot jsDelivr CDN-ről.
 * version.json alapján tölti be az index.js és index.css fájlokat (fix nevek, nincs hash).
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
    cdnBase: 'https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@df2e6ca/dist',
    features: { sessionSharing: false, stockCheck: false, expressCheckout: false }
  };
  console.log('✅ MARKETLY_CONFIG initialized:', window.MARKETLY_CONFIG);

  var CDN_BASE = window.MARKETLY_CONFIG.cdnBase;
  console.log('📦 CDN Base (jsDelivr):', CDN_BASE);

  function ensureRoot() {
    var root = document.getElementById('root');
    if (root) {
      console.log('✅ #root element found');
      return root;
    }
    var container = document.createElement('div');
    container.id = 'root';
    container.className = 'min-h-screen';
    var mainContent = document.querySelector('main') || document.querySelector('#content') || document.body;
    if (mainContent.firstChild) mainContent.insertBefore(container, mainContent.firstChild);
    else mainContent.appendChild(container);
    console.log('✅ #root element created');
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

    console.log('📥 Loading React bundle (version.json)...');
    fetch(CDN_BASE + '/version.json?t=' + Date.now())
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var ver = (data && data.buildTime) || Date.now();
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CDN_BASE + '/assets/index.css?v=' + ver;
        link.crossOrigin = 'anonymous';
        link.onload = function() { console.log('✅ CSS loaded successfully'); };
        document.head.appendChild(link);

        var script = document.createElement('script');
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        script.src = CDN_BASE + '/assets/index.js?v=' + ver;
        script.onload = function() {
          console.log('✅ React bundle loaded successfully!');
          hideLoadingOverlay();
        };
        script.onerror = function() {
          console.error('❌ Failed to load React bundle');
          showLoadError();
        };
        document.body.appendChild(script);
        console.log('📌 Script tag injected (index.js?v=' + ver + ')');
      })
      .catch(function() {
        var ver = Date.now();
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CDN_BASE + '/assets/index.css?v=' + ver;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        var script = document.createElement('script');
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        script.src = CDN_BASE + '/assets/index.js?v=' + ver;
        script.onload = function() { console.log('✅ React bundle loaded'); hideLoadingOverlay(); };
        script.onerror = showLoadError;
        document.body.appendChild(script);
        console.log('📌 Script tag injected (fallback)');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReactApp);
  } else {
    loadReactApp();
  }

  console.log('✅ AI Shop Loader initialized');
})();
