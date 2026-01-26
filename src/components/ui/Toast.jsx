import React, { useEffect } from 'react';
import { X, Check, AlertCircle, Info, Heart } from 'lucide-react';

/**
 * Toast notification component with auto-dismiss
 */
export const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    wishlist: <Heart className="w-5 h-5 fill-current" />
  };

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    wishlist: 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
  };

  return (
    <div className={`${styles[type]} rounded-xl shadow-2xl p-4 pr-12 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in-right relative`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="font-medium text-sm">{message}</p>
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Toast Container - manages multiple toasts
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[70] flex flex-col gap-3 pointer-events-none">
      <style>
        {`
          @keyframes slide-in-right {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out;
            pointer-events: auto;
          }
        `}
      </style>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};
