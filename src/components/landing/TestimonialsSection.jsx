import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  { quote: 'Gyors szállítás, minőségi bútorok. Az AI képes kereső segített megtalálni a tökéletes kanapét.', name: 'Kata M.', role: 'Budapest', rating: 5 },
  { quote: 'Egyszerűen használható oldal, átlátható árak. A szobatervező funkció ötletes.', name: 'Péter T.', role: 'Debrecen', rating: 5 },
  { quote: 'Először rendeltem bútort online – nem csalódtam. Az ügyfélszolgálat is gyorsan válaszolt.', name: 'Anna K.', role: 'Szeged', rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <section className="py-10 sm:py-12 lg:py-16 bg-white border-t border-gray-100" aria-labelledby="testimonials-heading">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 id="testimonials-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Mit mondanak rólunk</h2>
          <p className="text-base sm:text-lg text-gray-600">50.000+ elégedett vásárló</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all">
              <Quote className="w-8 h-8 text-primary-200 mb-3" aria-hidden />
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <p className="text-gray-700 text-sm sm:text-base mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
