/**
 * Kollekciók konfiguráció – Fedezd fel a stílusokat szekció
 * - title, subtitle: egyedi kurált nevek (nem kategória nevek)
 * - categories: API betöltés (technikai)
 * - styleKeywords: kliens szűrés
 * - categoryHint: belső használat, nem jelenik meg
 * - relatedCategories: kategóriák, amikre a user kiléphet a kollekcióból
 */
import { Sofa, BedDouble, Briefcase, Sparkles, Lamp, Armchair, Grid3X3, Home, Palette, Star, Zap, Heart } from 'lucide-react';

const COLLECTION_IMAGES = {
  'modern-nappali': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'minimalista-halo': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
  'irodai-butor': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
  'akcios-kedvencek': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
  'skandinav-stilus': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
  'industrial': 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80',
  'fotelek-otelek': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'vilagos-lampak': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
  'otthon-lakberendezes': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'szekrenyek-tarolas': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
  'bohó-romantikus': 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80',
  'boho-romantikus': 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80',
  'klasszikus-elegans': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
  'kis-alakzatok': 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80',
  'kerti-barkacs': 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
  'uj-erkezesek': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
};

export const COLLECTIONS = [
  { id: 'modern-nappali', slug: 'modern-nappali', title: 'Modern nappali', subtitle: 'Kanapék, asztalok', gradient: 'from-amber-500/85 via-orange-500/85 to-primary-600/90', image: COLLECTION_IMAGES['modern-nappali'], icon: Sofa, categories: ['Bútor'], styleKeywords: ['modern', 'kanapé', 'nappali'], categoryHint: 'Bútor', relatedCategories: ['Bútor', 'Otthon és lakberendezés'] },
  { id: 'minimalista-halo', slug: 'minimalista-halo', title: 'Minimalista háló', subtitle: 'Ágyak, éjjeliszékrények', gradient: 'from-slate-600/85 via-secondary-600/85 to-teal-700/90', image: COLLECTION_IMAGES['minimalista-halo'], icon: BedDouble, categories: ['Bútor'], styleKeywords: ['minimal', 'egyszerű', 'ágy', 'háló'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'irodai-butor', slug: 'irodai-butor', title: 'Irodai bútor', subtitle: 'Íróasztalok, székek', gradient: 'from-blue-600/85 via-indigo-600/85 to-secondary-700/90', image: COLLECTION_IMAGES['irodai-butor'], icon: Briefcase, categories: ['Bútor'], styleKeywords: ['iroda', 'home office', 'asztal', 'szék'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'akcios-kedvencek', slug: 'akcios-kedvencek', title: 'Akciós kedvencek', subtitle: 'Legjobb árak most', gradient: 'from-rose-500/85 via-pink-500/85 to-amber-500/90', image: COLLECTION_IMAGES['akcios-kedvencek'], icon: Sparkles, categories: [], styleKeywords: [], categoryHint: null, isSale: true, relatedCategories: ['Bútor', 'Otthon és lakberendezés', 'Kert és Barkács'] },
  { id: 'skandinav-stilus', slug: 'skandinav-stilus', title: 'Skandináv stílus', subtitle: 'Természetes, világos bútorok', gradient: 'from-slate-400/75 via-gray-300/75 to-amber-100/85', image: COLLECTION_IMAGES['skandinav-stilus'], icon: Palette, categories: ['Bútor'], styleKeywords: ['skandináv', 'nordic', 'természetes', 'világos'], categoryHint: 'Bútor', relatedCategories: ['Bútor', 'Otthon és lakberendezés'] },
  { id: 'industrial', slug: 'industrial', title: 'Ipari stílus', subtitle: 'Fém, fa, nyers anyagok', gradient: 'from-stone-600/85 via-neutral-600/85 to-stone-800/90', image: COLLECTION_IMAGES['industrial'], icon: Grid3X3, categories: ['Bútor'], styleKeywords: ['ipari', 'industrial', 'fém', 'nyers'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'fotelek-otelek', slug: 'fotelek-otelek', title: 'Fotelek & Ötlécek', subtitle: 'Kényelmes ülőbútorok', gradient: 'from-violet-600/85 via-purple-600/85 to-indigo-700/90', image: COLLECTION_IMAGES['fotelek-otelek'], icon: Armchair, categories: ['Bútor'], styleKeywords: ['fotel', 'ötléc', 'ülés'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'vilagos-lampak', slug: 'vilagos-lampak', title: 'Világos lámpák', subtitle: 'Lámpák és világítás', gradient: 'from-yellow-500/85 via-amber-500/85 to-orange-600/90', image: COLLECTION_IMAGES['vilagos-lampak'], icon: Lamp, categories: ['Otthon és lakberendezés'], styleKeywords: ['lámpa', 'világítás'], categoryHint: 'Otthon és lakberendezés', relatedCategories: ['Otthon és lakberendezés', 'Bútor'] },
  { id: 'otthon-lakberendezes', slug: 'otthon-lakberendezes', title: 'Otthon & Lakberendezés', subtitle: 'Díszek, kiegészítők', gradient: 'from-secondary-500/85 via-teal-600/85 to-cyan-700/90', image: COLLECTION_IMAGES['otthon-lakberendezes'], icon: Home, categories: ['Otthon és lakberendezés'], styleKeywords: ['lakás', 'lakberendezés', 'dísz'], categoryHint: 'Otthon és lakberendezés', relatedCategories: ['Otthon és lakberendezés', 'Bútor'] },
  { id: 'szekrenyek-tarolas', slug: 'szekrenyek-tarolas', title: 'Szekrények & Tárolás', subtitle: 'Szekrények, polcok', gradient: 'from-emerald-600/85 via-teal-600/85 to-cyan-700/90', image: COLLECTION_IMAGES['szekrenyek-tarolas'], icon: Grid3X3, categories: ['Bútor'], styleKeywords: ['szekrény', 'tárolás', 'polc'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'bohó-romantikus', slug: 'boho-romantikus', title: 'Bohó & Romantikus', subtitle: 'Pamut, növényi minták', gradient: 'from-rose-400/80 via-pink-400/80 to-amber-300/85', image: COLLECTION_IMAGES['boho-romantikus'], icon: Heart, categories: ['Bútor'], styleKeywords: ['bohó', 'boho', 'romantikus', 'pamut'], categoryHint: 'Bútor', relatedCategories: ['Bútor', 'Otthon és lakberendezés'] },
  { id: 'klasszikus-elegans', slug: 'klasszikus-elegans', title: 'Klasszikus elegáns', subtitle: 'Időtlen bútorok', gradient: 'from-amber-800/85 via-yellow-700/85 to-amber-900/90', image: COLLECTION_IMAGES['klasszikus-elegans'], icon: Star, categories: ['Bútor'], styleKeywords: ['klasszikus', 'elegáns', 'antik'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'kis-alakzatok', slug: 'kis-alakzatok', title: 'Kis alakzatok', subtitle: 'Kompadok, puffok', gradient: 'from-primary-500/85 via-secondary-500/85 to-teal-600/90', image: COLLECTION_IMAGES['kis-alakzatok'], icon: Sofa, categories: ['Bútor'], styleKeywords: ['kompad', 'puff', 'ülés'], categoryHint: 'Bútor', relatedCategories: ['Bútor'] },
  { id: 'kerti-barkacs', slug: 'kerti-barkacs', title: 'Kert & Barkács', subtitle: 'Kerti bútorok', gradient: 'from-green-600/85 via-emerald-600/85 to-teal-700/90', image: COLLECTION_IMAGES['kerti-barkacs'], icon: Home, categories: ['Kert és Barkács'], styleKeywords: ['kert', 'kerti'], categoryHint: 'Kert és Barkács', relatedCategories: ['Kert és Barkács', 'Bútor'] },
  { id: 'uj-érkezesek', slug: 'uj-erkezesek', title: 'Új érkezések', subtitle: 'Friss a polcon', gradient: 'from-primary-400/85 via-secondary-500/85 to-teal-600/90', image: COLLECTION_IMAGES['uj-erkezesek'], icon: Zap, categories: [], styleKeywords: [], categoryHint: null, isNew: true, relatedCategories: ['Bútor', 'Otthon és lakberendezés', 'Kert és Barkács'] },
];

/** Kategória nevű kollekció ID (ha van categoryHint) */
export const getCollectionBySlug = (slug) => COLLECTIONS.find((c) => c.slug === slug);
export const getCollectionById = (id) => COLLECTIONS.find((c) => c.id === id);
