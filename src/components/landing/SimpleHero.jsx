import React from 'react';

/**
 * Radically Simple Hero
 * One message, two buttons, done.
 */
export const SimpleHero = ({ onTryAI, onExplore }) => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
          Találd meg az ideális bútort
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          AI-alapú keresés, tervezés, vásárlás – egy helyen.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={onTryAI}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            Kezdés
          </button>
          <button
            type="button"
            onClick={onExplore}
            className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:border-gray-300 hover:-translate-y-1 transition-all duration-200"
          >
            Termékek
          </button>
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;
