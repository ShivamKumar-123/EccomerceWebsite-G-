import { canCallApi, getDrfToken } from '../../services/productsApi';
import {
  bulkReplaceDeliveryOptions,
  listDeliveryOptions,
  listDeliveryOptionsAdmin,
} from '../../services/operationsApi';

export const DEFAULT_DELIVERY_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Pan-India road freight, 5–7 business days',
    fee: 0,
    etaDays: 7,
    active: true,
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Priority dispatch, 2–3 business days',
    fee: 499,
    etaDays: 3,
    active: true,
  },
  {
    id: 'pickup',
    name: 'Warehouse Pickup',
    description: 'Collect from warehouse (no shipping charge)',
    fee: 0,
    etaDays: 1,
    active: true,
  },
];

function normalize(list) {
  if (!Array.isArray(list) || list.length === 0) return [...DEFAULT_DELIVERY_OPTIONS];
  return list.map((o) => ({
    id: String(o.id),
    name: String(o.name || 'Option'),
    description: String(o.description || ''),
    fee: Math.max(0, Number(o.fee) || 0),
    etaDays: Math.max(1, Number(o.etaDays) || 7),
    active: o.active !== false,
  }));
}

let apiDeliveryCache = null;

export function setDeliveryApiCache(list) {
  apiDeliveryCache = list && list.length ? normalize(list) : null;
}

export async function prefetchDeliveryOptions() {
  if (!canCallApi()) return null;
  try {
    const rows = await listDeliveryOptions();
    if (rows && rows.length) {
      setDeliveryApiCache(rows);
      return getDeliveryOptions();
    }
  } catch (e) {
    console.error('prefetchDeliveryOptions:', e);
  }
  return null;
}

export async function fetchDeliveryOptionsForAdmin() {
  if (!canCallApi() || !getDrfToken()) return null;
  const rows = await listDeliveryOptionsAdmin();
  setDeliveryApiCache(rows);
  return normalize(rows);
}

export function getDeliveryOptions() {
  if (!canCallApi()) {
    return [...DEFAULT_DELIVERY_OPTIONS];
  }
  if (apiDeliveryCache && apiDeliveryCache.length) return apiDeliveryCache;
  return [...DEFAULT_DELIVERY_OPTIONS];
}

export function getActiveDeliveryOptions() {
  return getDeliveryOptions().filter((o) => o.active);
}

export async function saveDeliveryOptions(options) {
  if (!canCallApi() || !getDrfToken()) {
    throw new Error('Start Django + Vite (or set VITE_API_URL) and log in as admin to save delivery options on the server.');
  }
  const norm = normalize(options);
  const rows = await bulkReplaceDeliveryOptions(norm);
  setDeliveryApiCache(rows);
  window.dispatchEvent(new Event('goldymart-delivery-updated'));
}

export function getDeliveryOptionById(id) {
  return getDeliveryOptions().find((o) => o.id === id) || getActiveDeliveryOptions()[0];
}
