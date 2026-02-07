import React from "react";
import { Sofa, BedDouble, Briefcase, Sparkles, ArrowRight } from "lucide-react";

const COLLECTIONS = [
  { id: "nappali", title: "Modern nappali", subtitle: "Kanapék, asztalok", gradient: "from-amber-400 via-orange-500 to-primary-600", icon: Sofa, categoryHint: "Kanapék" },
  { id: "halo", title: "Minimalista háló", subtitle: "Ágyak, éjjeliszékrények", gradient: "from-slate-500 via-secondary-600 to-teal-700", icon: BedDouble, categoryHint: "Ágyak" },
  { id: "iroda", title: "Irodai bútor", subtitle: "Íróasztalok, székek", gradient: "from-blue-500 via-indigo-600 to-secondary-700", icon: Briefcase, categoryHint: "Asztalok" },
  { id: "akcio", title: "Akciós kedvencek", subtitle: "Legjobb árak most", gradient: "from-rose-500 via-pink-500 to-amber-500", icon: Sparkles, categoryHint: null },
];

export default function InspirationSection({ onExplore, onCategorySelect }) {
  const handleClick = (col) => {
    if (col.categoryHint && onCategorySelect) onCategorySelect(col.categoryHint);
    onExplore?.();
  };

  return (
    <section className="py-10 sm:py-12 lg:py-16 xl:py-20 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100" aria-labelledby="inspiration-heading">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 id="inspiration-heading" className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2">Fedezd fel a stílusokat</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">Gondosan válogatott kollekciók a tökéletes otthonhoz</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {COLLECTIONS.map((col) => (
            <button key={col.id} type="button" onClick={() => handleClick(col)}
              className="group relative rounded-2xl overflow-hidden bg-gray-100 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
              aria-label={col.title + " – böngészés"}>
              <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <col.icon className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 text-white/80" aria-hidden />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0.5">{col.title}</h3>
                <p className="text-sm text-white/90 mb-3">{col.subtitle}</p>
                <span className="inline-flex items-center gap-2 text-white font-semibold text-sm">Böngészés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
