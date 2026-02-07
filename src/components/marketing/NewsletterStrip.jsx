import React, { useState } from 'react';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import { isValidEmail } from '../../utils/helpers';

export default function NewsletterStrip() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 800);
  };

  return (
    <section className="py-8 sm:py-10 lg:py-12 bg-gradient-to-r from-primary-500 via-secondary-600 to-secondary-700 text-white border-t border-primary-400/30" aria-labelledby="newsletter-heading">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
            </div>
            <div>
              <h2 id="newsletter-heading" className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" aria-hidden />
                10% kedvezmény az első rendelésre
              </h2>
              <p className="text-white/90 text-sm sm:text-base mt-0.5">Iratkozz fel hírlevelünkre, és kapsz egy egyszeri kuponkódot.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 lg:max-w-md">
            <label htmlFor="newsletter-email" className="sr-only">E-mail cím</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder="email@pelda.hu"
              className="flex-1 min-h-[44px] px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 placeholder:text-white/60 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:border-white"
              required
              disabled={status === 'loading' || status === 'success'}
              aria-invalid={status === 'error'}
            />
            {status === 'error' && (
              <p className="text-white/90 text-sm -mt-1 w-full" role="alert">Kérjük, érvényes e-mail címet adj meg.</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="min-h-[44px] px-5 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-600 disabled:opacity-70"
            >
              {status === 'loading' && 'Küldés...'}
              {status === 'success' && 'Köszönjük!'}
              {(status === 'idle' || status === 'error') && (<>Iratkozz fel <ArrowRight className="w-4 h-4" aria-hidden /></>)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
