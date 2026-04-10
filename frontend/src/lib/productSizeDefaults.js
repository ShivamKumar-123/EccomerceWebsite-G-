/**
 * Default size rows when API/DB has none — mirrors backend effective_size_variants_for_product.
 * Keeps storefront dropdowns + cart behaviour consistent for fashion / footwear.
 */

export const SHOE_CATEGORY_SLUGS = new Set([
  'sneakers',
  'sports-shoes',
  'casual-shoes',
  'formal-shoes',
  'boots',
  'sandals',
]);

const DEFAULT_APPAREL = [
  { size: 'S', stock: 10 },
  { size: 'M', stock: 20 },
  { size: 'L', stock: 18 },
  { size: 'XL', stock: 14 },
  { size: 'XXL', stock: 8 },
];

const DEFAULT_SHOE = [
  { size: 'UK 7', stock: 6 },
  { size: 'UK 8', stock: 10 },
  { size: 'UK 9', stock: 12 },
  { size: 'UK 10', stock: 10 },
  { size: 'UK 11', stock: 5 },
];

const FOOTWEAR_HINTS = [
  'shoe',
  'sneaker',
  'boot',
  'sandal',
  'slide',
  'loafer',
  'trainer',
  'footwear',
  'cleat',
];

export function normalizeSizeVariantsList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const v of list) {
    if (!v || typeof v !== 'object') continue;
    const size = String(v.size || '').trim();
    if (!size) continue;
    out.push({ size, stock: Math.max(0, Number(v.stock) || 0) });
  }
  return out;
}

/**
 * @param {{ category?: string, name?: string, sizeVariants?: unknown, size_variants?: unknown }} product
 * @returns {{ size: string, stock: number }[]}
 */
export function effectiveSizeVariantsForProduct(product) {
  const raw = product?.sizeVariants ?? product?.size_variants;
  const normalized = normalizeSizeVariantsList(Array.isArray(raw) ? raw : []);
  if (normalized.length > 0) return normalized;

  const slug = String(product?.category || '')
    .trim()
    .toLowerCase();
  const name = String(product?.name || '').toLowerCase();
  const footwearByName = FOOTWEAR_HINTS.some((h) => name.includes(h));

  if (SHOE_CATEGORY_SLUGS.has(slug)) {
    return DEFAULT_SHOE.map((x) => ({ ...x }));
  }
  if (slug === 'fashion' || slug === 'clothes') {
    return (footwearByName ? DEFAULT_SHOE : DEFAULT_APPAREL).map((x) => ({ ...x }));
  }
  return [];
}
