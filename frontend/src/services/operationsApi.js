import { getDrfToken, fetchWithAuth, apiUrl, canCallApi } from './productsApi';

function parseList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

/** Normalize API order row to app shape (camelCase + numbers). */
export function normalizeOrder(row) {
  if (!row) return null;
  const id = String(row.id);
  return {
    id,
    userId: row.userId ?? row.user_id ?? null,
    status: row.status,
    paymentStatus: row.paymentStatus ?? row.payment_status ?? 'not_uploaded',
    total: Number(row.total),
    deliveryFee: Number(row.deliveryFee ?? row.delivery_fee ?? 0),
    deliveryOptionId: row.deliveryOptionId ?? row.delivery_option_id ?? '',
    deliveryLabel: row.deliveryLabel ?? row.delivery_label ?? '',
    deliveryDescription: row.deliveryDescription ?? row.delivery_description ?? '',
    deliveryEtaDays: Number(row.deliveryEtaDays ?? row.delivery_eta_days ?? 7),
    trackingNumber: row.trackingNumber ?? row.tracking_number ?? '',
    carrier: row.carrier ?? '',
    items: Array.isArray(row.items) ? row.items : [],
    customerInfo: row.customerInfo ?? row.customer_info ?? {},
    paymentScreenshot: row.paymentScreenshot ?? row.payment_screenshot ?? '',
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  };
}

export function normalizeDeliveryOption(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name || ''),
    description: String(row.description || ''),
    fee: Math.max(0, Number(row.fee) || 0),
    etaDays: Math.max(1, Number(row.etaDays ?? row.eta_days) || 7),
    active: row.active !== false,
  };
}

export async function listOrdersAdmin() {
  const token = getDrfToken();
  if (!canCallApi() || !token) throw new Error('API URL and JWT access token required');
  const r = await fetchWithAuth(apiUrl('/api/orders/'), { method: 'GET', auth: true });
  if (!r.ok) throw new Error(`Orders list failed (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizeOrder);
}

export async function listOrdersByUserId(userId) {
  if (!canCallApi() || !userId) return [];
  const q = new URLSearchParams({ user_id: String(userId) }).toString();
  const r = await fetch(apiUrl('/api/orders/', q));
  if (!r.ok) return [];
  const data = await r.json();
  return parseList(data).map(normalizeOrder);
}

export async function lookupOrder(q) {
  if (!canCallApi() || !q || String(q).length < 2) return null;
  const qs = new URLSearchParams({ q: String(q).trim() }).toString();
  const r = await fetch(apiUrl('/api/orders/lookup/', qs));
  if (!r.ok) return null;
  const data = await r.json();
  return normalizeOrder(data);
}

export async function createOrderApi(body) {
  if (!canCallApi()) throw new Error('API URL not configured');
  const r = await fetchWithAuth(apiUrl('/api/orders/'), {
    method: 'POST',
    json: true,
    body,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Create order failed (${r.status})`);
  }
  const data = await r.json();
  return normalizeOrder(data);
}

export async function patchOrderApi(orderId, patch) {
  const token = getDrfToken();
  if (!canCallApi() || !token) throw new Error('API URL and JWT access token required');
  const r = await fetchWithAuth(apiUrl(`/api/orders/${orderId}/`), {
    method: 'PATCH',
    auth: true,
    json: true,
    body: patch,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Update order failed (${r.status})`);
  }
  const data = await r.json();
  return normalizeOrder(data);
}

export async function deleteOrderApi(orderId) {
  const token = getDrfToken();
  if (!canCallApi() || !token) throw new Error('API URL and JWT access token required');
  const r = await fetchWithAuth(apiUrl(`/api/orders/${orderId}/`), {
    method: 'DELETE',
    auth: true,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Delete order failed (${r.status})`);
  }
}

export async function listDeliveryOptions() {
  if (!canCallApi()) return null;
  const r = await fetch(apiUrl('/api/delivery-options/'));
  if (!r.ok) throw new Error(`Delivery options failed (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizeDeliveryOption);
}

export async function listDeliveryOptionsAdmin() {
  const token = getDrfToken();
  if (!canCallApi() || !token) throw new Error('API URL and JWT access token required');
  const r = await fetchWithAuth(apiUrl('/api/delivery-options/'), {
    method: 'GET',
    auth: true,
  });
  if (!r.ok) throw new Error(`Delivery options failed (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizeDeliveryOption);
}

export async function bulkReplaceDeliveryOptions(options) {
  const token = getDrfToken();
  if (!canCallApi() || !token) throw new Error('API URL and JWT access token required');
  const payload = options.map((o) => ({
    id: o.id,
    name: o.name,
    description: o.description,
    fee: o.fee,
    etaDays: o.etaDays,
    active: o.active,
  }));
  const r = await fetchWithAuth(apiUrl('/api/delivery-options/bulk/'), {
    method: 'PUT',
    auth: true,
    json: true,
    body: payload,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Save delivery options failed (${r.status})`);
  }
  const data = await r.json();
  return Array.isArray(data) ? data.map(normalizeDeliveryOption) : [];
}

export function ordersApiEnabled() {
  return canCallApi();
}
