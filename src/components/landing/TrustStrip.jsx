import React from 'react';
import { Shield, Truck, RefreshCw, Award, Users } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Shield, label: 'Biztonságos fizetés', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Truck, label: 'Ingyenes szállítás 50e Ft felett', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: RefreshCw, label: '30 nap visszaküldés', color: 'text-primary-600', bg: 'bg-primary-50' },
  { icon: Award, label: '2 év garancia', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Users, label: '50.000+ elégedett vásárló', color: 'text-secondary-600', bg: 'bg-secondary-50' },
];

export default function TrustStrip() {
  return (
    <div
      className="bg-white border-y border-gray-100/90 py-4 sm:py-5"
      role="region"
      aria-label="Bizalmi információk"
    >
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10 lg:gap-x-12">
          {TRUST_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 group"
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <item.icon className={`w-5 h-5 ${item.color}`} aria-hidden />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
