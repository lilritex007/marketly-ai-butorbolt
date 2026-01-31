import React, { useState, useEffect } from 'react';
import { Box, Eye, Smartphone, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ARProductPreview - AR (Augmented Reality) product preview
 * Uses WebXR/AR Quick Look for supported devices
 */
const ARProductPreview = ({ product, onClose }) => {
  const [isARAvailable, setIsARAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    setIsLoading(true);
    
    try {
      // Check for AR support
      // WebXR (Android Chrome, Quest)
      if ('xr' in navigator) {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        setIsARAvailable(isSupported);
      }
      // AR Quick Look (iOS Safari)
      else if (isIOSSafari()) {
        setIsARAvailable(true);
      }
      // Fallback: no AR support
      else {
        setIsARAvailable(false);
        setError('Az eszközöd nem támogatja az AR megjelenítést.');
      }
    } catch (err) {
      setIsARAvailable(false);
      setError('Nem sikerült ellenőrizni az AR támogatást.');
    } finally {
      setIsLoading(false);
    }
  };

  const isIOSSafari = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
    return isIOS && isSafari;
  };

  const handleARLaunch = () => {
    if (!isARAvailable) return;

    // For iOS: AR Quick Look
    if (isIOSSafari()) {
      // You would need USDZ file format for iOS AR
      // Example: product.arModelUSDZ
      const usdzUrl = product.arModelUSDZ || generateMockUSDZ(product);
      
      const anchor = document.createElement('a');
      anchor.rel = 'ar';
      anchor.href = usdzUrl;
      anchor.appendChild(document.createElement('img'));
      anchor.click();
    }
    // For Android: WebXR
    else if ('xr' in navigator) {
      launchWebXR();
    }
  };

  const launchWebXR = async () => {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay']
      });
      
      // Here you would initialize the WebXR rendering
      // This is a simplified example
      // In production, use libraries like three.js or babylon.js
      
      // Placeholder for WebXR session handling
      session.addEventListener('end', () => {
        // Cleanup
      });
      
    } catch (err) {
      setError('Nem sikerült elindítani az AR nézetet.');
    }
  };

  const generateMockUSDZ = (product) => {
    // In production, you would have actual 3D models
    // This is a placeholder that links to a sample USDZ file
    // You can use services like Sketchfab, poly.google.com (deprecated), or custom 3D models
    return `https://developer.apple.com/augmented-reality/quick-look/models/biplane/toy_biplane.usdz`;
  };

  const openInARViewer = () => {
    // Alternative: Open in a web-based 3D viewer
    // Using model-viewer web component (Google)
    window.open(`https://arvr.google.com/scene-viewer?file=${product.arModel || ''}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Box className="w-6 h-6" />
              <h2 className="text-xl font-bold">AR Előnézet</h2>
            </div>
            <p className="text-white/90 text-sm">{product.name}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">AR képességek ellenőrzése...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium mb-2">{error}</p>
                    <p className="text-xs text-yellow-700">
                      Az AR funkció csak iOS Safari vagy Android Chrome böngészőben érhető el.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && isARAvailable && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Eye className="w-10 h-10 text-primary-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Nézd meg otthonodban!</h3>
                  <p className="text-sm text-gray-600">
                    Helyezd el virtuálisan a terméket a saját teremben AR segítségével.
                  </p>
                </div>

                <button
                  onClick={handleARLaunch}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-5 h-5" />
                  AR Indítása
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 font-bold text-xs">1</span>
                    <span>Engedélyezd a kamera hozzáférést</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 font-bold text-xs">2</span>
                    <span>Célozd meg a padlót a telefonoddal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 font-bold text-xs">3</span>
                    <span>Helyezd el és forgasd a terméket</span>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !isARAvailable && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-600 mb-2">AR nem elérhető ezen az eszközön</p>
                  <p className="text-sm text-gray-500">
                    Próbáld meg iOS Safari vagy Android Chrome böngészőből!
                  </p>
                </div>
                <button
                  onClick={openInARViewer}
                  className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                >
                  Megnyitás web AR nézetben →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ARProductPreview;
