/** Stable cart row id: product id + optional size (API ids are numeric). */
export function buildCartLineId(productId, selectedSize) {
  const s = selectedSize && String(selectedSize).trim();
  return s ? `${productId}__${s}` : String(productId);
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
  const lineId = item.lineId || buildCartLineId(item.id, item.selectedSize);
  return { ...item, lineId, selectedSize: item.selectedSize ?? null };
}

export function normalizeCartArray(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(migrateCartItem);
}
