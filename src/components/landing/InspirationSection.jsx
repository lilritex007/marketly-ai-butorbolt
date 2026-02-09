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
      className="py-20 bg-white border-t border-gray-100"
      aria-labelledby="inspiration-heading"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12">
          <h2 id="inspiration-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
            Fedezd fel a stílusokat
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Gondosan válogatott kollekciók
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => handleClick(col)}
              className="group relative rounded-xl overflow-hidden bg-gray-100 h-[240px] text-left shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
              aria-label={col.title + " – böngészés"}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <col.icon className="absolute top-5 right-5 w-12 h-12 text-white/80" aria-hidden />
                <h3 className="text-2xl font-bold text-white mb-1">{col.title}</h3>
                <p className="text-sm text-white/90 mb-3">{col.subtitle}</p>
                <span className="inline-flex items-center gap-2 text-white font-semibold text-sm">
                  Böngészés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
