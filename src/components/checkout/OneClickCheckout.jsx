import React, { useState } from 'react';
import { Zap, CreditCard, Truck, Shield, Check, ChevronRight, Apple, Smartphone, Lock, MapPin, User, Mail } from 'lucide-react';

/**
 * OneClickCheckout - Express checkout for returning customers
 * Sleek, trustworthy design with saved payment methods
 */
const OneClickCheckout = ({ 
  product,
  savedAddress,
  savedPayment,
  userEmail,
  userName,
  onCheckout,
  onClose 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('saved');
  const [step, setStep] = useState('confirm'); // 'confirm' | 'processing' | 'success'

  const paymentMethods = [
    { id: 'saved', label: 'Mentett kártya', icon: CreditCard, detail: '•••• 4242', badge: 'Gyors' },
    { id: 'apple', label: 'Apple Pay', icon: Apple, detail: 'Egy érintéssel', badge: null },
    { id: 'google', label: 'Google Pay', icon: Smartphone, detail: 'Egy érintéssel', badge: null },
  ];

  const handleCheckout = async () => {
    setStep('processing');
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep('success');
    setIsProcessing(false);
    
    // Call parent callback
    setTimeout(() => {
      onCheckout?.({ product, payment: selectedPayment });
    }, 1500);
  };

  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sikeres rendelés!</h3>
        <p className="text-gray-600 mb-4">Visszaigazolást küldtünk emailben.</p>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p>Rendelésszám: <span className="font-mono font-bold">#MKT-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span></p>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Feldolgozás...</h3>
        <p className="text-gray-600">Kérjük várj, a fizetés folyamatban.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-600 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Gyors vásárlás</h3>
            <p className="text-white/80 text-sm">Egy kattintással kész</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Product Summary */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
            {product?.image && (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">{product?.name || 'Termék'}</h4>
            <p className="text-xs text-gray-500">{product?.category}</p>
            <p className="font-bold text-primary-600 mt-1">{product?.price?.toLocaleString()} Ft</p>
          </div>
        </div>

        {/* Saved Info */}
        <div className="space-y-2">
          {/* Delivery Address */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Szállítási cím</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {savedAddress || '1234 Budapest, Példa utca 12.'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Mail className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {userEmail || 'pelda@email.com'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Fizetési mód</p>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                  ${selectedPayment === method.id 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center
                  ${selectedPayment === method.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  <method.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{method.label}</span>
                    {method.badge && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{method.detail}</p>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedPayment === method.id 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-300'
                  }
                `}>
                  {selectedPayment === method.id && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 py-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            Biztonságos
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            SSL titkosítás
          </span>
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-primary-500" />
            Gyors szállítás
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          <Zap className="w-5 h-5" />
          Megrendelem - {product?.price?.toLocaleString()} Ft
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Mégse, vissza a termékhez
        </button>
      </div>
    </div>
  );
};

export default OneClickCheckout;
