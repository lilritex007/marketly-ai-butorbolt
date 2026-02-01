import React, { useState } from 'react';
import { Bell, BellRing, Mail, Check, X, TrendingDown, Sparkles } from 'lucide-react';

/**
 * PriceAlert - "Értesíts ha lecsökken az ár" feature
 * Saves to localStorage, shows confirmation
 */
const PriceAlert = ({ product, variant = 'button' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlertSet, setIsAlertSet] = useState(() => {
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    return alerts.some(a => a.productId === product?.id);
  });

  if (!product) return null;

  const currentPrice = product.salePrice || product.price || 0;
  const suggestedPrice = Math.floor(currentPrice * 0.85); // 15% kedvezményes ár

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const alertData = {
      productId: product.id,
      productName: product.name,
      currentPrice,
      targetPrice: parseInt(targetPrice) || suggestedPrice,
      email,
      createdAt: Date.now()
    };

    // Save to localStorage
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    const filtered = alerts.filter(a => a.productId !== product.id);
    filtered.push(alertData);
    localStorage.setItem('priceAlerts', JSON.stringify(filtered));

    setIsSubmitted(true);
    setIsAlertSet(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
    }, 2000);
  };

  const removeAlert = () => {
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    const filtered = alerts.filter(a => a.productId !== product.id);
    localStorage.setItem('priceAlerts', JSON.stringify(filtered));
    setIsAlertSet(false);
  };

  const formatPrice = (p) => (p || 0).toLocaleString('hu-HU');

  // Button variant
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => isAlertSet ? removeAlert() : setIsOpen(true)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium
            ${isAlertSet 
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {isAlertSet ? (
            <>
              <BellRing className="w-4 h-4" />
              Értesítés beállítva
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              Árcsökkenés értesítő
            </>
          )}
        </button>

        {/* Modal */}
        {isOpen && (
          <PriceAlertModal
            product={product}
            currentPrice={currentPrice}
            suggestedPrice={suggestedPrice}
            email={email}
            setEmail={setEmail}
            targetPrice={targetPrice}
            setTargetPrice={setTargetPrice}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmit}
            onClose={() => setIsOpen(false)}
            formatPrice={formatPrice}
          />
        )}
      </>
    );
  }

  // Inline variant (for product cards)
  return (
    <button
      onClick={() => isAlertSet ? removeAlert() : setIsOpen(true)}
      className={`
        p-2 rounded-full transition-all
        ${isAlertSet 
          ? 'bg-amber-500 text-white' 
          : 'bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600'
        }
      `}
      title={isAlertSet ? 'Értesítés beállítva' : 'Árcsökkenés értesítő'}
    >
      {isAlertSet ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
    </button>
  );
};

// Modal component
const PriceAlertModal = ({
  product,
  currentPrice,
  suggestedPrice,
  email,
  setEmail,
  targetPrice,
  setTargetPrice,
  isSubmitted,
  onSubmit,
  onClose,
  formatPrice
}) => {
  return (
    <div 
      className="fixed inset-0 lg:top-[60px] z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Árcsökkenés értesítő</h3>
              <p className="text-white/80 text-sm">Szólunk, ha csökken az ár!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {!isSubmitted ? (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Product info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img 
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="w-16 h-16 object-contain bg-white rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</p>
                  <p className="text-lg font-bold text-primary-500">{formatPrice(currentPrice)} Ft</p>
                </div>
              </div>

              {/* Target price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Értesíts, ha az ár ez alá csökken:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder={suggestedPrice.toString()}
                    className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">Ft</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Javasolt ár: {formatPrice(suggestedPrice)} Ft ({Math.round((1 - suggestedPrice/currentPrice) * 100)}% kedvezmény)
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email cím:
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelda@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Értesítés beállítása
              </button>
            </form>
          ) : (
            /* Success */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Értesítés beállítva!</h4>
              <p className="text-gray-600 text-sm">
                Emailben értesítünk, ha {formatPrice(parseInt(targetPrice) || suggestedPrice)} Ft alá csökken az ár.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceAlert;
