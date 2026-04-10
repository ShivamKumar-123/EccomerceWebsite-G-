/**
 * Storefront product price display helpers (MRP vs sale, offer/sale %).
 */

export function inrToNum(s) {
  if (s == null || s === '') return 0;
  return parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
}

export function formatInrFromNumber(n) {
  if (!Number.isFinite(n) || n <= 0) return '';
  const rounded = Math.round(n);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

/**
 * Original (list) price on top when offer/sale is active or MRP > sale.
 * If there is no stored MRP but offer/sale % > 0, infers list from final price and max %.
 *
 * @returns {{ showPromo: boolean, originalDisplay: string | null, finalDisplay: string }}
 */
export function getProductPricingPresentation(product) {
  const finalDisplay = product?.price != null ? String(product.price) : '';
  const saleNum = inrToNum(finalDisplay);
  const mrpRaw = product?.originalPrice ?? product?.original_price;
  const mrpNum = inrToNum(mrpRaw);
  const offerPct = Math.min(100, Math.max(0, Number(product?.offerDiscountPercent) || 0));
  const salePct = Math.min(100, Math.max(0, Number(product?.saleDiscountPercent) || 0));
  const maxPct = Math.max(offerPct, salePct);
  const hasPctPromo = offerPct > 0 || salePct > 0;

  const explicitOriginal =
    mrpRaw != null && String(mrpRaw).trim() !== '' && mrpNum > saleNum;

  let originalDisplay = null;
  if (explicitOriginal) {
    const s = String(mrpRaw).trim();
    originalDisplay = s.includes('₹') ? s : formatInrFromNumber(mrpNum);
  } else if (hasPctPromo && maxPct > 0 && maxPct < 100 && saleNum > 0) {
    const derived = saleNum / (1 - maxPct / 100);
    if (Number.isFinite(derived) && derived > saleNum + 0.5) {
      originalDisplay = formatInrFromNumber(derived);
    }
  }

  const origNum = originalDisplay ? inrToNum(originalDisplay) : 0;
  const showPromo = Boolean(originalDisplay && origNum > saleNum);

  return { showPromo, originalDisplay, finalDisplay };
}

/**
 * Adds % off derived from list vs sale (for badges when no explicit offer/sale chips).
 */
export function getProductPriceStack(product) {
  const p = getProductPricingPresentation(product);
  const saleNum = inrToNum(p.finalDisplay);
  const listNum = p.showPromo ? inrToNum(p.originalDisplay) : 0;
  const offFromMrp =
    listNum > saleNum && listNum > 0
      ? Math.round((1 - saleNum / listNum) * 100)
      : 0;
  return { ...p, offFromMrp };
}
