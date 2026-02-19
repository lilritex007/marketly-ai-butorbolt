/**
 * Kategória képek – Unsplash stock photos, kategóriához kapcsolódó
 * Shared between CategoryPage, ModernHero quick categories, stb.
 */
export const CATEGORY_IMAGES = {
  Kanapé: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  Kanapék: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  Fotel: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  Fotelek: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  Nappali: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
  Ágy: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
  Ágyak: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
  Hálószoba: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
  Matrac: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  Matracok: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  Asztal: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&q=80',
  Asztalok: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&q=80',
  Szék: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80',
  Székek: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80',
  Iroda: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
  Szekrény: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80',
  Szekrények: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80',
  Lámpa: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  Lámpák: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  Kert: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
  Gyerek: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  Gyerekszoba: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  Komód: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80',
  Gardrób: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80',
  Étkező: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
};

export const getCategoryImage = (name) => {
  if (!name) return CATEGORY_IMAGES.default;
  const n = String(name).toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key === 'default') continue;
    if (n.includes(key.toLowerCase())) return url;
  }
  return CATEGORY_IMAGES.default;
};
