import React from "react";
import { Sofa, BedDouble, Briefcase, Sparkles, ArrowRight } from "lucide-react";

const COLLECTIONS = [
  { id: "nappali", title: "Modern nappali", subtitle: "Kanapék, asztalok", gradient: "from-amber-500 via-orange-500 to-primary-600", icon: Sofa, categoryHint: "Kanapék" },
  { id: "halo", title: "Minimalista háló", subtitle: "Ágyak, éjjeliszékrények", gradient: "from-slate-600 via-secondary-600 to-teal-700", icon: BedDouble, categoryHint: "Ágyak" },
  { id: "iroda", title: "Irodai bútor", subtitle: "Íróasztalok, székek", gradient: "from-blue-600 via-indigo-600 to-secondary-700", icon: Briefcase, categoryHint: "Asztalok" },
  { id: "akcio", title: "Akciós kedvencek", subtitle: "Legjobb árak most", gradient: "from-rose-500 via-pink-500 to-amber-500", icon: Sparkles, categoryHint: null },
];

export default function InspirationSection({ onExplore, onCategorySelect }) {
  const handleClick = (col) => {
    if (col.categoryHint && onCategorySelect) onCategorySelect(col.categoryHint);
    onExplore?.();
  };

  return (
    <section
      className="py-14 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-gray-50/80 to-white border-t border-gray-100/80"
      aria-labelledby="inspiration-heading"
    >
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
          <h2 id="inspiration-heading" className="text-3xl sm:text-4xl lg:text-5xl xl:text-[2.75rem] font-bold text-gray-900 tracking-tight mb-3">
            Fedezd fel a stílusokat
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-xl mx-auto">
            Gondosan válogatott kollekciók a tökéletes otthonhoz
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => handleClick(col)}
              className="group relative rounded-2xl overflow-hidden bg-gray-100 min-h-[200px] sm:min-h-[220px] lg:min-h-[240px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
              aria-label={col.title + " – böngészés"}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient} opacity-95 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7">
                <col.icon className="absolute top-5 right-5 w-12 h-12 sm:w-14 sm:h-14 text-white/90" aria-hidden />
                <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold text-white mb-1 drop-shadow-sm">{col.title}</h3>
                <p className="text-sm text-white/95 mb-4">{col.subtitle}</p>
                <span className="inline-flex items-center gap-2 text-white font-semibold text-sm">
                  Böngészés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
