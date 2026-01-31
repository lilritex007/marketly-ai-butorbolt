import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LiveSocialProof - Real-time social proof notifications
 * Shows viewer count, recent purchases, trending items
 */
const LiveSocialProof = ({ currentProduct, recentPurchases = [] }) => {
  const [viewerCount, setViewerCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Generate realistic viewer count
  useEffect(() => {
    const baseViewers = Math.floor(Math.random() * 30) + 15; // 15-45
    setViewerCount(baseViewers);

    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(10, Math.min(50, prev + change));
      });
    }, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [currentProduct]);

  // Show at most ONE notification per product view (after 5s), no repeated spam
  useEffect(() => {
    if (!currentProduct) {
      setShowNotification(false);
      setCurrentNotification(null);
      return;
    }

    const notifications = [
      {
        icon: ShoppingBag,
        text: `"${currentProduct.name}" népszerű választás`,
        time: '2 perce',
        color: 'text-green-600',
        bg: 'bg-green-50'
      },
      {
        icon: TrendingUp,
        text: `Ez a ${currentProduct.category} most népszerű`,
        time: 'épp most',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      },
      {
        icon: Users,
        text: `${Math.floor(Math.random() * 10) + 5} ember nézi most`,
        time: 'élő',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      }
    ];

    const random = notifications[Math.floor(Math.random() * notifications.length)];
    setCurrentNotification(random);

    // Single notification 5s after viewing this product; no interval
    const t = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }, 5000);

    return () => {
      clearTimeout(t);
      setShowNotification(false);
    };
  }, [currentProduct?.id]);

  return (
    <>
      {/* Floating Viewer Counter */}
      {currentProduct && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-[calc(10rem+44px)] md:bottom-40 left-4 md:left-6 z-40 bg-white rounded-full shadow-lg px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2"
        >
          <div className="relative">
            <Eye className="w-5 h-5 text-primary-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{viewerCount} ember</p>
            <p className="text-xs text-gray-500">nézi most</p>
          </div>
        </motion.div>
      )}

      {/* Notification Toasts */}
      <AnimatePresence>
        {showNotification && currentNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`
              fixed bottom-[calc(1.5rem+44px)] md:bottom-6 left-2 md:left-6 z-50
              max-w-[calc(100vw-1rem)] md:max-w-sm rounded-xl shadow-2xl p-3 md:p-4
              ${currentNotification.bg} border border-gray-200
              backdrop-blur-sm
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${currentNotification.color} bg-white/50`}>
                <currentNotification.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {currentNotification.text}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentNotification.time}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Bezárás"
              >
                ×
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-bl-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveSocialProof;
