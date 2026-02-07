import React from 'react';
import { Shield, Truck, RefreshCw, Award, Users } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Shield, label: 'Biztonságos fizetés', color: 'text-blue-600' },
  { icon: Truck, label: 'Ingyenes szállítás 50e Ft felett', color: 'text-emerald-600' },
  { icon: RefreshCw, label: '30 nap visszaküldés', color: 'text-primary-600' },
  { icon: Award, label: '2 év garancia', color: 'text-amber-600' },
  { icon: Users, label: '50.000+ elégedett vásárló', color: 'text-secondary-600' },
];

export default function TrustStrip() {
  return (
    <div className="bg-white border-t-2 border-gray-100 border-b border-gray-100 shadow-sm" role="region" aria-label="Bizalmi információk">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8 lg:gap-x-10">
          {TRUST_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
              <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} aria-hidden />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
