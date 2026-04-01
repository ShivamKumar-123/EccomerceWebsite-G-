/** Category slugs removed from the storefront (still filtered client-side if old API data exists). */
export const REMOVED_CATEGORY_SLUGS = new Set([
  'agriculture',
  'food-processing',
  'industrial',
  'rice-mills',
  'spare-parts',
  'water-pumps',
]);

export function filterVisibleCategories(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter((c) => c?.slug && !REMOVED_CATEGORY_SLUGS.has(String(c.slug).trim()));
}
