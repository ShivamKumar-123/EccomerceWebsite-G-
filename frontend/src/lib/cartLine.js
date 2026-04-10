export function normalizeProductColorSlugs(product) {
  const raw = Array.isArray(product?.colors) ? product.colors : [];
  return [
    ...new Set(
      raw
        .map((c) => String(c || '').trim().toLowerCase().replace(/\s+/g, '_'))
        .filter(Boolean)
    ),
  ];
}

/** When product has multiple colors, pick segment for line id (listing uses default first). */
export function cartLineColorKey(product, selectedColor) {
  const slugs = normalizeProductColorSlugs(product);
  if (slugs.length <= 1) return null;
  const c = String(selectedColor || '').trim().toLowerCase().replace(/\s+/g, '_');
  return slugs.includes(c) ? c : slugs[0];
}

/**
 * Stable cart row id: product id + optional size + optional color (only when multi-color SKU).
 * Color segment avoids merging different color lines for the same size.
 */
export function buildCartLineId(productId, selectedSize, selectedColor) {
  let id = String(productId);
  const s = selectedSize != null && String(selectedSize).trim();
  if (s) id += `__${s}`;
  const c = selectedColor != null && String(selectedColor).trim().toLowerCase();
  if (c) id += `__c_${c.replace(/[^\w-]/g, '_')}`;
  return id;
}

export function stockForLine(item) {
  const sv = item.sizeVariants;
  const sz = item.selectedSize;
  if (Array.isArray(sv) && sv.length && sz) {
    const v = sv.find((x) => String(x.size).trim() === String(sz).trim());
    if (v) return Math.max(0, Number(v.stock) || 0);
  }
  return Math.max(0, Number(item.stock) || 0);
}

export function migrateCartItem(item) {
  if (!item || typeof item !== 'object') return item;
  const lineId =
    item.lineId ||
    buildCartLineId(item.id, item.selectedSize ?? null, item.selectedColor ?? null);
  return {
    ...item,
    lineId,
    selectedSize: item.selectedSize ?? null,
    selectedColor: item.selectedColor ?? null,
  };
}

export function normalizeCartArray(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(migrateCartItem);
}
