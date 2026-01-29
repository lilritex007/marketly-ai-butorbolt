import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  CheckCircle2, XCircle, AlertCircle, Info, X, 
  ShoppingCart, Heart, Sparkles, Bell, Truck
} from 'lucide-react';

/**
 * Modern Toast Notification System
 * Beautiful, accessible notifications with icons and animations
 */

// Toast Context
const ToastContext = createContext(null);

// Toast Types with icons and colors
const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'text-emerald-900',
    message: 'text-emerald-700',
    progress: 'bg-emerald-500'
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
    progress: 'bg-red-500'
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'text-amber-900',
    message: 'text-amber-700',
    progress: 'bg-amber-500'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
    progress: 'bg-blue-500'
  },
  cart: {
    icon: ShoppingCart,
    bg: 'bg-indigo-50 border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    title: 'text-indigo-900',
    message: 'text-indigo-700',
    progress: 'bg-indigo-500'
  },
  wishlist: {
    icon: Heart,
    bg: 'bg-pink-50 border-pink-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    title: 'text-pink-900',
    message: 'text-pink-700',
    progress: 'bg-pink-500'
  },
  ai: {
    icon: Sparkles,
    bg: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'text-purple-900',
    message: 'text-purple-700',
    progress: 'bg-purple-500'
  },
  notification: {
    icon: Bell,
    bg: 'bg-gray-50 border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    title: 'text-gray-900',
    message: 'text-gray-700',
    progress: 'bg-gray-500'
  },
  shipping: {
    icon: Truck,
    bg: 'bg-teal-50 border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    title: 'text-teal-900',
    message: 'text-teal-700',
    progress: 'bg-teal-500'
  }
};

// Single Toast Component
const Toast = ({ id, type = 'info', title, message, duration = 4000, onClose, action }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = config.icon;

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));
    
    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose?.(id), 300);
  };

  return (
    <div
      className={`
        relative w-full max-w-sm overflow-hidden
        ${config.bg} border rounded-xl shadow-lg
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconBg} rounded-lg p-2 shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm ${config.title}`}>{title}</h4>
          )}
          {message && (
            <p className={`text-sm mt-0.5 ${config.message}`}>{message}</p>
          )}
          {action && (
            <button
              onClick={() => { action.onClick?.(); handleClose(); }}
              className={`mt-2 text-sm font-semibold ${config.iconColor} hover:underline`}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Bezárás"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-1 w-full bg-black/5">
          <div
            className={`h-full ${config.progress} transition-all ease-linear`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...options }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', title: 'Siker!', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', title: 'Hiba!', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', title: 'Figyelem!', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    cart: (message, options = {}) => addToast({ type: 'cart', title: 'Kosár', message, ...options }),
    wishlist: (message, options = {}) => addToast({ type: 'wishlist', title: 'Kedvencek', message, ...options }),
    ai: (message, options = {}) => addToast({ type: 'ai', title: 'AI Asszisztens', message, ...options }),
    notification: (message, options = {}) => addToast({ type: 'notification', message, ...options }),
    shipping: (message, options = {}) => addToast({ type: 'shipping', title: 'Szállítás', message, ...options }),
    custom: (options) => addToast(options),
    dismiss: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a mock toast for when provider is not available
    return {
      success: console.log,
      error: console.error,
      warning: console.warn,
      info: console.log,
      cart: console.log,
      wishlist: console.log,
      ai: console.log,
      notification: console.log,
      shipping: console.log,
      custom: console.log,
      dismiss: () => {}
    };
  }
  return context;
};

export default { Toast, ToastProvider, useToast };
