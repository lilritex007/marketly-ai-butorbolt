import React, { useState } from 'react';
import { FileText, Ruler, Star, MessageCircle, Truck, Shield, HelpCircle, ChevronDown, ChevronUp, Check } from 'lucide-react';

/**
 * ProductTabs - Tabbed content for product details
 * Features: Description, Specs, Reviews, Q&A, Shipping, Warranty
 */
const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const tabs = [
    { id: 'description', label: 'Leírás', icon: FileText },
    { id: 'specs', label: 'Adatok', icon: Ruler },
    { id: 'reviews', label: 'Vélemények', icon: Star, badge: '24' },
    { id: 'faq', label: 'Kérdések', icon: HelpCircle },
    { id: 'shipping', label: 'Szállítás', icon: Truck },
  ];

  // Parse specs from product params
  const specs = product?.params 
    ? product.params.split(',').map(p => {
        const [name, value] = p.split(':').map(s => s.trim());
        return { name, value: value || name };
      }).filter(s => s.name)
    : [];

  // Simulated reviews
  const reviews = [
    { id: 1, author: 'Kovács Anna', rating: 5, date: '2025-01-15', text: 'Nagyon szép termék, pont ilyen kellett! A minőség kiváló, gyors szállítás.', verified: true },
    { id: 2, author: 'Nagy Péter', rating: 4, date: '2025-01-10', text: 'Jó ár-érték arány. Egy csillagot levonok mert kicsit nehéz volt összerakni.', verified: true },
    { id: 3, author: 'Szabó Éva', rating: 5, date: '2025-01-05', text: 'Gyönyörű! Nagyon elégedett vagyok, ajánlom mindenkinek.', verified: false },
  ];

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // FAQ items
  const faqItems = [
    { q: 'Mennyi idő alatt érkezik meg?', a: 'A standard szállítási idő 2-5 munkanap, expressz szállítással 1-2 nap.' },
    { q: 'Milyen garanciát kapok?', a: 'Minden termékünkre 2 év gyártói garancia vonatkozik. Ezen felül 14 napos elállási jog.' },
    { q: 'Személyesen is átvehető?', a: 'Igen, budapesti üzleteinkben személyesen is átvehető ingyenesen.' },
    { q: 'Hogyan kell összeszerelni?', a: 'A termékhez részletes magyar nyelvű összeszerelési útmutató tartozik. Igény esetén szakemberünk is segít.' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Tab buttons - UNIFIED TYPOGRAPHY */}
      <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2.5 px-5 sm:px-6 py-4 font-medium text-base whitespace-nowrap border-b-2 transition-all
              ${activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`px-2 py-0.5 text-sm rounded-full ${
                activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content - UNIFIED TYPOGRAPHY */}
      <div className="p-5 sm:p-6 lg:p-8">
        {/* Description */}
        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-700">
            <p className="text-base sm:text-lg leading-relaxed">
              {product?.description || 'Nincs részletes leírás ehhez a termékhez.'}
            </p>
            
            {/* Features list */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Prémium minőségű anyagok', 'Könnyű összeszerelés', 'Modern dizájn', 'Tartós kivitelezés'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-green-700">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specifications */}
        {activeTab === 'specs' && (
          <div>
            {specs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-base">{spec.name}</span>
                    <span className="font-medium text-gray-900 text-base">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-base">Nincs elérhető műszaki adat.</p>
            )}
          </div>
        )}

        {/* Reviews - UNIFIED TYPOGRAPHY */}
        {activeTab === 'reviews' && (
          <div>
            {/* Summary */}
            <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl mb-6">
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-amber-600">{avgRating.toFixed(1)}</p>
                <div className="flex justify-center mt-2">
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${star <= avgRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{reviews.length} vélemény</p>
              </div>
              <div className="flex-1">
                {[5,4,3,2,1].map(rating => {
                  const count = reviews.filter(r => r.rating === rating).length;
                  const percent = (count / reviews.length) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm text-gray-500 w-4">{rating}</span>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-sm text-gray-400 w-6">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-base">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-base flex items-center gap-2">
                          {review.author}
                          {review.verified && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">✓ Ellenőrzött</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400">{new Date(review.date).toLocaleDateString('hu-HU')}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-base">{review.text}</p>
                </div>
              ))}
            </div>

            {/* Write review button */}
            <button className="w-full mt-5 py-3.5 border-2 border-dashed border-gray-200 text-gray-500 font-medium text-base rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors">
              + Vélemény írása
            </button>
          </div>
        )}

        {/* FAQ - UNIFIED TYPOGRAPHY */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div 
                key={idx}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 text-base">{item.q}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4 text-gray-600 text-base animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}

            {/* Ask question */}
            <button className="w-full mt-3 py-3.5 border-2 border-dashed border-gray-200 text-gray-500 font-medium text-base rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Kérdés feltevése
            </button>
          </div>
        )}

        {/* Shipping - UNIFIED TYPOGRAPHY */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-lg">Ingyenes szállítás 50.000 Ft felett</p>
                <p className="text-green-700 text-base">Standard szállítás: 2-5 munkanap</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-blue-800 text-lg">2 év garancia</p>
                <p className="text-blue-700 text-base">Teljes körű gyártói garancia minden termékre</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-gray-900">2-5</p>
                <p className="text-sm text-gray-500">munkanap</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-gray-900">14</p>
                <p className="text-sm text-gray-500">nap elállás</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
