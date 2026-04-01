/**
 * Categories where standard admin delivery options are not shown at checkout.
 * (Empty after deprecated machinery categories were removed from the catalogue.)
 */
export const CATEGORIES_WITHOUT_DELIVERY_OPTIONS = new Set([]);

export function itemCategorySlug(item) {
  const c = item?.category;
  return String(c || '')
    .trim()
    .toLowerCase();
}

/** True if any cart line is in an excluded category (whole checkout uses freight-on-request). */
export function cartItemsSkipDeliveryOptions(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return false;
  return cartItems.some((item) => CATEGORIES_WITHOUT_DELIVERY_OPTIONS.has(itemCategorySlug(item)));
}

export const FREIGHT_ON_REQUEST_DELIVERY = {
  id: 'freight-on-request',
  name: 'Freight — quote on request',
  description:
    'Standard courier options are not used for this order. Our team will contact you with shipping cost and dispatch details after confirmation.',
  fee: 0,
  etaDays: 0,
};
