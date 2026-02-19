import React, { useState, useEffect } from 'react';
import { X, Mail, Gift, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SmartNewsletterPopup - Intelligent newsletter popup
 * Shows based on exit intent, time on site, and scroll depth
 */
const SmartNewsletterPopup = ({ onSubscribe }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user already dismissed or subscribed
    const dismissed = localStorage.getItem('newsletter_dismissed');
    const subscribed = localStorage.getItem('newsletter_subscribed');
    
    if (dismissed || subscribed) {
      return;
    }

    let timeOnSiteTimeout;
    let scrollDepthTriggered = false;
    let exitIntentTriggered = false;

    // Strategy 1: Time on site (30 seconds)
    timeOnSiteTimeout = setTimeout(() => {
      if (!scrollDepthTriggered && !exitIntentTriggered) {
        setIsVisible(true);
      }
    }, 30000);

    // Strategy 2: Scroll depth (70%)
    const handleScroll = () => {
      if (scrollDepthTriggered) return;

      const scrolled = window.pageYOffset;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrolled / height) * 100;

      if (scrollPercent > 70) {
        scrollDepthTriggered = true;
        clearTimeout(timeOnSiteTimeout);
        setIsVisible(true);
      }
    };

    // Strategy 3: Exit intent (mouse leaving viewport)
    const handleMouseLeave = (e) => {
      if (exitIntentTriggered) return;
      
      if (e.clientY <= 0) {
        exitIntentTriggered = true;
        clearTimeout(timeOnSiteTimeout);
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeOnSiteTimeout);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter_dismissed', Date.now().toString());
    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('newsletter_dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Kérlek adj meg egy érvényes email címet.');
      return;
    }

    try {
      // Here you would send to your newsletter service
      if (onSubscribe) {
        await onSubscribe(email);
      }

      setIsSubmitted(true);
      localStorage.setItem('newsletter_subscribed', 'true');

      // Close after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);

    } catch (err) {
      setError('Hiba történt. Próbáld újra később!');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 lg:top-[60px] bg-black/50 backdrop-blur-sm z-[9999]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary-500 to-secondary-700 p-8 text-white">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                    <Gift className="w-8 h-8" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">
                  {isSubmitted ? 'Köszönjük!' : '10% KEDVEZMÉNY'}
                </h2>
                <p className="text-white/90 text-center text-sm">
                  {isSubmitted 
                    ? 'Feliratkoztál a hírlevelünkre!' 
                    : 'Iratkozz fel és kapd meg első vásárlásodhoz!'
                  }
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Benefits */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span>Exkluzív ajánlatok</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span>Korai hozzáférés új termékekhez</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span>Lakberendezési tippek</span>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Add meg az email címed"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                          required
                        />
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      Feliratkozom!
                    </button>

                    {/* Privacy Notice */}
                    <p className="text-xs text-gray-500 text-center">
                      Adataid biztonságban vannak. Bármikor leiratkozhatsz.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <p className="text-gray-700 mb-2">
                      <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Nézd meg az email fiókod a kedvezmény kódért!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SmartNewsletterPopup;
