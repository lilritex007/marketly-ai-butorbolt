import React from 'react';
import { Shield, Truck, RefreshCw, CreditCard, Award, Clock, Phone, Lock, CheckCircle, Star, Heart, Headphones } from 'lucide-react';

/**
 * TrustBadges - Trust signals and guarantees
 * Multiple variants for different placements
 */
const TrustBadges = ({ 
  variant = 'footer', // 'footer' | 'product' | 'checkout' | 'mini' | 'horizontal'
  className = ''
}) => {
  const badges = [
    {
      icon: Truck,
      title: 'Ingyenes szállítás',
      description: '50.000 Ft felett',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: RefreshCw,
      title: '30 napos visszaküldés',
      description: 'Kérdés nélkül',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Shield,
      title: 'Biztonságos fizetés',
      description: 'SSL titkosítás',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Award,
      title: '2 év garancia',
      description: 'Minden termékre',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Headphones,
      title: 'Ügyfélszolgálat',
      description: 'H-P 8:00-18:00',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      icon: Heart,
      title: '50.000+ elégedett vásárló',
      description: '4.9/5 értékelés',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  // Mini variant - icons only, horizontal
  if (variant === 'mini') {
    return (
      <div className={`flex items-center justify-center gap-4 ${className}`}>
        {badges.slice(0, 4).map((badge, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-1.5 text-gray-600"
            title={badge.title}
          >
            <badge.icon className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">{badge.title.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant - single row with all info
  if (variant === 'horizontal') {
    return (
      <div className={`bg-gray-50 border-y border-gray-200 py-4 ${className}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
            {badges.slice(0, 4).map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0">
                <div className={`w-10 h-10 ${badge.bgColor} rounded-xl flex items-center justify-center`}>
                  <badge.icon className={`w-5 h-5 ${badge.color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm whitespace-nowrap">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Product variant - compact badges for product page
  if (variant === 'product') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {badges.slice(0, 4).map((badge, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl"
          >
            <badge.icon className={`w-5 h-5 ${badge.color} shrink-0`} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{badge.title}</p>
              <p className="text-[10px] text-gray-500 truncate">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Checkout variant - reassurance badges
  if (variant === 'checkout') {
    const checkoutBadges = [
      { icon: Lock, text: 'Biztonságos fizetés', color: 'text-green-600' },
      { icon: Shield, text: 'Adatvédelem', color: 'text-blue-600' },
      { icon: RefreshCw, text: 'Pénzvisszafizetés', color: 'text-purple-600' },
    ];

    return (
      <div className={`flex items-center justify-center gap-6 py-3 ${className}`}>
        {checkoutBadges.map((badge, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <badge.icon className={`w-4 h-4 ${badge.color}`} />
            <span className="text-xs text-gray-600 font-medium">{badge.text}</span>
          </div>
        ))}
      </div>
    );
  }

  // Footer variant - full display
  return (
    <div className={`bg-gradient-to-b from-gray-50 to-gray-100 py-10 sm:py-12 ${className}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Miért válassz minket?
          </h3>
          <p className="text-sm text-gray-600">
            Több mint 50.000 elégedett vásárló bízik bennünk
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${badge.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <badge.icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{badge.title}</h4>
              <p className="text-xs text-gray-500">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Payment Methods & Security */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Fizetési módok:</span>
              <div className="flex items-center gap-2">
                {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((method, idx) => (
                  <div 
                    key={idx}
                    className="h-8 px-3 bg-white rounded-lg border border-gray-200 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-gray-700">{method}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">256-bit SSL titkosítás</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        {/* Trust Rating */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            <strong className="text-gray-900">4.9/5</strong> értékelés 12.000+ vélemény alapján
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
