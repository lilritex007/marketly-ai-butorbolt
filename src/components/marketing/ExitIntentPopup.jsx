import React, { useState, useEffect } from 'react';
import { X, Gift, Timer, Sparkles, ArrowRight, Mail, Check } from 'lucide-react';

/**
 * ExitIntentPopup - Shows discount offer when user tries to leave
 * Also includes email capture for future marketing
 */
const ExitIntentPopup = ({ discountPercent = 10, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  // Exit intent detection
  useEffect(() => {
    // Check if already shown in this session
    if (sessionStorage.getItem('exitIntentShown')) {
      return;
    }

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Also show after 45 seconds of inactivity
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!hasShown) {
          setIsVisible(true);
          setHasShown(true);
          sessionStorage.setItem('exitIntentShown', 'true');
        }
      }, 45000);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('click', resetTimer);
    resetTimer();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('click', resetTimer);
      clearTimeout(inactivityTimer);
    };
  }, [hasShown]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // In real app: send to backend
      localStorage.setItem('subscribedEmail', email);
      setIsSubmitted(true);
      
      // Copy discount code
      navigator.clipboard?.writeText(`MARADJ${discountPercent}`);
      
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative top section */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-center relative overflow-hidden">
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-blob" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-blob animation-delay-2000" />
          </div>

          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Várj! Ne menj el!
            </h2>
            <p className="text-white/90 text-lg">
              Itt egy <span className="font-bold text-yellow-300">{discountPercent}% kedvezmény</span> neked!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!isSubmitted ? (
            <>
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-6 text-red-600">
                <Timer className="w-5 h-5 animate-pulse" />
                <span className="font-bold text-lg">
                  Az ajánlat lejár: {formatTime(countdown)}
                </span>
              </div>

              {/* Discount code */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-600 mb-1">Kuponkód:</p>
                <p className="text-2xl font-bold text-amber-600 tracking-wider">
                  MARADJ{discountPercent}
                </p>
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-center text-gray-600 text-sm">
                  Add meg az email címed és elküldjük a kuponkódot!
                </p>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelda@email.com"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Kedvezmény aktiválása
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* No thanks */}
              <button
                onClick={handleClose}
                className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Nem, köszönöm, inkább teljes árat fizetek
              </button>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Köszönjük!</h3>
              <p className="text-gray-600 mb-4">
                A kuponkód elmentve a vágólapra!
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-bold text-xl">MARADJ{discountPercent}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ExitIntentPopup;
