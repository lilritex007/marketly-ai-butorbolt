/**
 * Kollekciók konfiguráció – Fedezd fel a stílusokat szekció
 * - title, subtitle: egyedi kurált nevek (nem kategória nevek)
 * - categories: API betöltés (technikai)
 * - styleKeywords: kliens szűrés
 * - categoryHint: belső használat, nem jelenik meg
 * - relatedCategories: kategóriák, amikre a user kiléphet a kollekcióból
 */
import { Sofa, BedDouble, Briefcase, Sparkles, Lamp, Armchair, Grid3X3, Home, Palette, Star, Zap, Heart } from 'lucide-react';

export const COLLECTIONS = [
  { id: 'modern-nappali', slug: 'modern-nappali', title: 'Modern nappali', subtitle: 'Kanapék, asztalok', gradient: 'from-amber-500 via-orange-500 to-primary-600', icon: Sofa, categories: ['Bútor'], styleKeywords: ['modern', 'kanapé', 'nappali'], categoryHint: 'Bútor', relatedCategories: ['Bútor', 'Otthon és lakberendezés'] },
  { id: 'minimalista-halo', slug: 'minimalista-halo', title: 'Minimalista háló', subtitle: 'Ágyak, éjjeliszékrények', gradient: 'from-slate-600 via-secondary-600 to-teal-700', icon: BedDouble, categories: ['Bútor'], styleKeywords: ['minimal', 'egyszerű', 'ágy', 'háló'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'irodai-butor', slug: 'irodai-butor', title: 'Irodai bútor', subtitle: 'Íróasztalok, székek', gradient: 'from-blue-600 via-indigo-600 to-secondary-700', icon: Briefcase, categories: ['Bútor'], styleKeywords: ['iroda', 'home office', 'asztal', 'szék'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'akcios-kedvencek', slug: 'akcios-kedvencek', title: 'Akciós kedvencek', subtitle: 'Legjobb árak most', gradient: 'from-rose-500 via-pink-500 to-amber-500', icon: Sparkles, categories: [], styleKeywords: [], categoryHint: null, isSale: true, relatedCategories: ['Bútor', 'Otthon és lakberendezés', 'Kert és Barkács'] },
  { id: 'skandinav-stilus', slug: 'skandinav-stilus', title: 'Skandináv stílus', subtitle: 'Természetes, világos bútorok', gradient: 'from-slate-400 via-gray-300 to-amber-100', icon: Palette, categories: ['Bútor'], styleKeywords: ['skandináv', 'nordic', 'természetes', 'világos'], categoryHint: 'Bútor', relatedCategories: ['Bútor', 'Otthon és lakberendezés'] },
  { id: 'industrial', slug: 'industrial', title: 'Ipari stílus', subtitle: 'Fém, fa, nyers anyagok', gradient: 'from-stone-600 via-neutral-600 to-stone-800', icon: Grid3X3, categories: ['Bútor'], styleKeywords: ['ipari', 'industrial', 'fém', 'nyers'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'fotelek-otelek', slug: 'fotelek-otelek', title: 'Fotelek & Ötlécek', subtitle: 'Kényelmes ülőbútorok', gradient: 'from-violet-600 via-purple-600 to-indigo-700', icon: Armchair, categories: ['Bútor'], styleKeywords: ['fotel', 'ötléc', 'ülés'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'vilagos-lampak', slug: 'vilagos-lampak', title: 'Világos lámpák', subtitle: 'Lámpák és világítás', gradient: 'from-yellow-500 via-amber-500 to-orange-600', icon: Lamp, categories: ['Otthon és lakberendezés'], styleKeywords: ['lámpa', 'világítás'], categoryHint: 'Otthon és lakberendezés', relatedCategories: ['Otthon és lakberendezés', 'Bútor'] },
  { id: 'otthon-lakberendezes', slug: 'otthon-lakberendezes', title: 'Otthon & Lakberendezés', subtitle: 'Díszek, kiegészítők', gradient: 'from-secondary-500 via-teal-600 to-cyan-700', icon: Home, categories: ['Otthon és lakberendezés'], styleKeywords: ['lakás', 'lakberendezés', 'dísz'], categoryHint: 'Otthon és lakberendezés', relatedCategories: ['Otthon és lakberendezés', 'Bútor'] },
  { id: 'szekrenyek-tarolas', slug: 'szekrenyek-tarolas', title: 'Szekrények & Tárolás', subtitle: 'Szekrények, polcok', gradient: 'from-emerald-600 via-teal-600 to-cyan-700', icon: Grid3X3, categories: ['Bútor'], styleKeywords: ['szekrény', 'tárolás', 'polc'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'bohó-romantikus', slug: 'boho-romantikus', title: 'Bohó & Romantikus', subtitle: 'Pamut, növényi minták', gradient: 'from-rose-400 via-pink-400 to-amber-300', icon: Heart, categories: ['Bútor'], styleKeywords: ['bohó', 'boho', 'romantikus', 'pamut'], categoryHint: 'Bútor', relatedCategories: ['Bútor', 'Otthon és lakberendezés'] },
  { id: 'klasszikus-elegans', slug: 'klasszikus-elegans', title: 'Klasszikus elegáns', subtitle: 'Időtlen bútorok', gradient: 'from-amber-800 via-yellow-700 to-amber-900', icon: Star, categories: ['Bútor'], styleKeywords: ['klasszikus', 'elegáns', 'antik'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'kis-alakzatok', slug: 'kis-alakzatok', title: 'Kis alakzatok', subtitle: 'Kompadok, puffok', gradient: 'from-primary-500 via-secondary-500 to-teal-600', icon: Sofa, categories: ['Bútor'], styleKeywords: ['kompad', 'puff', 'ülés'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'kerti-barkacs', slug: 'kerti-barkacs', title: 'Kert & Barkács', subtitle: 'Kerti bútorok', gradient: 'from-green-600 via-emerald-600 to-teal-700', icon: Home, categories: ['Kert és Barkács'], styleKeywords: ['kert', 'kerti'], categoryHint: 'Kert és Barkács', relatedCategories: ['Kert és Barkács', 'Bútor'] },
  { id: 'uj-érkezesek', slug: 'uj-erkezesek', title: 'Új érkezések', subtitle: 'Friss a polcon', gradient: 'from-primary-400 via-secondary-500 to-teal-600', icon: Zap, categories: [], styleKeywords: [], categoryHint: null, isNew: true, relatedCategories: ['Bútor', 'Otthon és lakberendezés', 'Kert és Barkács'] },
];

/** Kategória nevű kollekció ID (ha van categoryHint) */
export const getCollectionBySlug = (slug) => COLLECTIONS.find((c) => c.slug === slug);
export const getCollectionById = (id) => COLLECTIONS.find((c) => c.id === id);
