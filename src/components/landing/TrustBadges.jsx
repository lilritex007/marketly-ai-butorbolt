import React from 'react';
import { Shield, Truck, RefreshCw, CreditCard, Award, HeadphonesIcon, Lock, BadgeCheck, Clock, Star } from 'lucide-react';

/**
 * TrustBadges - Footer trust indicators
 * Clean, professional design to build customer confidence
 */
const TrustBadges = ({ variant = 'full' }) => {
  const badges = [
    {
      icon: Shield,
      title: 'Biztonságos vásárlás',
      description: 'SSL titkosítás',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Truck,
      title: 'Ingyenes szállítás',
      description: '30.000 Ft felett',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: RefreshCw,
      title: '14 nap visszaküldés',
      description: 'Kérdés nélkül',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: CreditCard,
      title: 'Biztonságos fizetés',
      description: 'Visa, Mastercard, PayPal',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      icon: HeadphonesIcon,
      title: 'Ügyfélszolgálat',
      description: 'H-P 8:00-18:00',
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    },
    {
      icon: Award,
      title: 'Minőségi garancia',
      description: '2 év jótállás',
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    }
  ];

  // Compact inline variant
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-4 sm:gap-6 py-3 flex-wrap">
        {badges.slice(0, 4).map((badge, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-gray-600">
            <badge.icon className={`w-4 h-4 ${badge.color}`} />
            <span className="text-xs sm:text-sm font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  // Mini icon-only variant
  if (variant === 'mini') {
    return (
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {badges.slice(0, 4).map((badge, idx) => (
          <div 
            key={idx} 
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${badge.bg} flex items-center justify-center`}
            title={badge.title}
          >
            <badge.icon className={`w-5 h-5 ${badge.color}`} />
          </div>
        ))}
      </div>
    );
  }

  // Full variant - detailed footer section
  return (
    <div className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Main badges grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {badges.map((badge, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className={`w-12 h-12 ${badge.bg} rounded-xl flex items-center justify-center mb-3`}>
                <badge.icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-0.5">{badge.title}</h4>
              <p className="text-xs text-gray-500">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Payment methods & certifications */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-200">
          {/* Payment icons */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 mr-2">Fizetési módok:</span>
            <div className="flex items-center gap-2">
              {['Visa', 'MC', 'PayPal', 'GPay', 'Apple'].map((method, idx) => (
                <div 
                  key={idx}
                  className="h-8 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-green-600">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs font-medium">Verified Merchant</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs font-medium">4.9/5 Értékelés</span>
            </div>
          </div>
        </div>

        {/* Additional guarantees */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Gyors szállítás 2-5 munkanap
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Adatvédelmi nyilatkozat betartása
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Eredetiség garancia
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HeadphonesIcon className="w-3.5 h-3.5" />
              Magyar nyelvű támogatás
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
