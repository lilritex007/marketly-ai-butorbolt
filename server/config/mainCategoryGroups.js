/**
 * Otthon / bútor / lakberendezés shop: a navban nem a path első szegmense a "fő kategória",
 * hanem ezek a csoportok. Több raw fő kategória (path első szegmens) egy megjelenített fő alá tartozik.
 *
 * Példa: "Bútor" és "Bútorok" → egy "Bútor" fő; "Otthon", "Lakberendezés" → "Otthon és lakberendezés".
 * A key a megjelenített fő kategória neve, az érték a path első szegmenseinek listája (case-sensitive egyezés).
 */
export const MAIN_CATEGORY_GROUPS = {
  'Bútor': ['Bútor', 'Bútorok'],
  'Otthon és lakberendezés': ['Otthon', 'Lakberendezés', 'Otthon és lakberendezés'],
  'Kert és Barkács': ['Kert', 'Barkács', 'Kert és barkács', 'Kert és Barkács', 'Otthon és kert'],
};

/**
 * Adott raw (path első szegmens) kategória melyik megjelenített fő alá tartozik.
 * Ha nincs a csoportokban, maga a raw név lesz a megjelenített fő.
 */
export function getDisplayMainName(rawFirstSegment) {
  if (!rawFirstSegment || typeof rawFirstSegment !== 'string') return rawFirstSegment;
  const trimmed = rawFirstSegment.trim();
  for (const [displayName, rawNames] of Object.entries(MAIN_CATEGORY_GROUPS)) {
    if (rawNames.some((r) => String(r).trim() === trimmed)) return displayName;
  }
  return trimmed;
}
