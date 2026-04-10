import { obtainJwtPair } from './authApi';
import { fetchWithAuth, apiUrl, canCallApi, getDrfToken } from './productsApi';
import { normalizeOrder } from './operationsApi';

const SS_PARTNER_ACCESS = 'goldymart_partner_access';
const SS_PARTNER_REFRESH = 'goldymart_partner_refresh';

/** Must match backend cap on proof_images count. */
export const MAX_DELIVERY_PROOF_FILES = 10;

function parseList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

export function getPartnerAccessToken() {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(SS_PARTNER_ACCESS);
}

export function getPartnerRefreshToken() {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(SS_PARTNER_REFRESH);
}

export function persistPartnerTokens(access, refresh) {
  if (typeof sessionStorage === 'undefined') return;
  if (access) sessionStorage.setItem(SS_PARTNER_ACCESS, access);
  if (refresh) sessionStorage.setItem(SS_PARTNER_REFRESH, refresh);
}

export function clearPartnerTokens() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(SS_PARTNER_ACCESS);
  sessionStorage.removeItem(SS_PARTNER_REFRESH);
}

async function tryRefreshPartnerAccess() {
  const refresh = getPartnerRefreshToken();
  if (!refresh || !canCallApi()) return null;
  const r = await fetch(apiUrl('/api/auth/token/refresh/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const access = data.access;
  if (access) persistPartnerTokens(access, refresh);
  return access || null;
}

/**
 * @param {string} url
 * @param {{ method?: string, json?: boolean, body?: unknown } & RequestInit} options
 */
export async function fetchPartnerAuth(url, options = {}) {
  const { json = false, body, ...rest } = options;
  let access = getPartnerAccessToken();
  if (!access) throw new Error('Not signed in as delivery partner');

  const run = async (token) => {
    const h = new Headers(rest.headers || {});
    h.set('Authorization', `Bearer ${token}`);
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const outBody =
      json && body !== undefined && typeof body !== 'string' && !isFormData
        ? JSON.stringify(body)
        : body;
    if (json && body !== undefined && !isFormData) {
      h.set('Content-Type', 'application/json');
    }
    return fetch(url, { ...rest, headers: h, body: outBody });
  };

  let res = await run(access);
  if (res.status === 401) {
    const next = await tryRefreshPartnerAccess();
    if (next) res = await run(next);
  }
  return res;
}

/** Django JWT: username is the partner email. */
export async function loginDeliveryPartner(email, password) {
  const trimmed = String(email || '').trim();
  const { access, refresh } = await obtainJwtPair(trimmed, password);
  persistPartnerTokens(access, refresh);
  const acc = await fetchPartnerAccount();
  if (!acc.is_delivery_partner) {
    clearPartnerTokens();
    throw new Error('This account is not a delivery partner.');
  }
  return acc;
}

export function logoutDeliveryPartner() {
  clearPartnerTokens();
}

/** @param {Record<string, unknown>} row */
export function normalizePartnerStats(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    totalOrders: Number(row.total_orders ?? row.totalOrders ?? 0),
    delivered: Number(row.delivered ?? 0),
    inTransit: Number(row.in_transit ?? row.inTransit ?? 0),
    pending: Number(row.pending ?? 0),
    cancelled: Number(row.cancelled ?? 0),
    revenueTotal: Number(row.revenue_total ?? row.revenueTotal ?? 0),
    successRatePercent: Number(row.success_rate_percent ?? row.successRatePercent ?? 0),
    hourlyToday: Array.isArray(row.hourly_today)
      ? row.hourly_today.map((n) => Number(n) || 0)
      : Array.isArray(row.hourlyToday)
        ? row.hourlyToday.map((n) => Number(n) || 0)
        : Array(24).fill(0),
    ordersToday: Number(row.orders_today ?? row.ordersToday ?? 0),
    categories: Array.isArray(row.categories) ? row.categories : [],
    activities: Array.isArray(row.activities) ? row.activities : [],
  };
}

export async function fetchPartnerOrders() {
  const r = await fetchPartnerAuth(apiUrl('/api/delivery-partner/orders/'), { method: 'GET' });
  if (!r.ok) {
    if (r.status === 401) clearPartnerTokens();
    throw new Error(`Failed to load orders (${r.status})`);
  }
  const data = await r.json();
  return (Array.isArray(data) ? data : []).map((row) => normalizeOrder(row));
}

/**
 * Partner confirms delivery for an assigned order (backend: status must be shipped).
 * Requires at least two proof images (same field name as multipart: proof_images).
 * @param {string} orderId UUID
 * @param {File[]} files
 */
export async function markPartnerOrderDelivered(orderId, files) {
  const id = encodeURIComponent(String(orderId || '').trim());
  if (!id) throw new Error('Order id required');
  const list = Array.isArray(files) ? files.filter(Boolean) : [];
  if (list.length < 2) {
    throw new Error('Please select at least two delivery proof photos.');
  }
  if (list.length > MAX_DELIVERY_PROOF_FILES) {
    throw new Error(`At most ${MAX_DELIVERY_PROOF_FILES} images allowed.`);
  }
  const fd = new FormData();
  for (const f of list) {
    fd.append('proof_images', f);
  }
  const r = await fetchPartnerAuth(
    apiUrl(`/api/delivery-partner/orders/${id}/mark-delivered/`),
    { method: 'POST', body: fd }
  );
  const text = await r.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }
  if (!r.ok) {
    if (r.status === 401) clearPartnerTokens();
    const msg =
      typeof data?.detail === 'string'
        ? data.detail
        : typeof data === 'object' && data
          ? JSON.stringify(data)
          : text;
    throw new Error(msg || `Confirm failed (${r.status})`);
  }
  return normalizeOrder(data);
}

export async function fetchPartnerStats() {
  const r = await fetchPartnerAuth(apiUrl('/api/delivery-partner/stats/'), { method: 'GET' });
  if (!r.ok) {
    if (r.status === 401) clearPartnerTokens();
    throw new Error(`Failed to load stats (${r.status})`);
  }
  const data = await r.json();
  return normalizePartnerStats(data);
}

export async function listStaffDeliveryPartnerUsers() {
  if (!canCallApi() || !getDrfToken()) throw new Error('API URL and JWT required');
  const r = await fetchWithAuth(apiUrl('/api/staff/delivery-partner-users/'), {
    method: 'GET',
    auth: true,
  });
  if (!r.ok) throw new Error(`Failed to load delivery partners (${r.status})`);
  const data = await r.json();
  return (Array.isArray(data) ? data : []).map((u) => ({
    id: u.id,
    email: u.email ?? '',
    fullName: (u.full_name ?? u.fullName ?? '').trim() || u.email || String(u.id),
  }));
}

export async function fetchPartnerAccount() {
  if (!getPartnerAccessToken()) {
    return { is_delivery_partner: false };
  }
  const r = await fetchPartnerAuth(apiUrl('/api/delivery-partner-account/'), { method: 'GET' });
  if (!r.ok) {
    if (r.status === 401) clearPartnerTokens();
    return { is_delivery_partner: false };
  }
  return r.json();
}

/** @param {Record<string, any>} row */
export function normalizePartnerApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name ?? row.fullName,
    age: Number(row.age),
    email: row.email,
    phone: row.phone,
    licenseNumber: row.license_number ?? row.licenseNumber,
    licenseImageFrontUrl: row.license_image_front_url ?? row.licenseImageFrontUrl,
    licenseImageBackUrl: row.license_image_back_url ?? row.licenseImageBackUrl,
    aadharNumber: row.aadhar_number ?? row.aadharNumber,
    aadharImageFrontUrl: row.aadhar_image_front_url ?? row.aadharImageFrontUrl,
    aadharImageBackUrl: row.aadhar_image_back_url ?? row.aadharImageBackUrl,
    panNumber: row.pan_number ?? row.panNumber,
    panImageFrontUrl: row.pan_image_front_url ?? row.panImageFrontUrl,
    panImageBackUrl: row.pan_image_back_url ?? row.panImageBackUrl,
    city: row.city,
    district: row.district,
    state: row.state,
    status: row.status,
    adminNote: row.admin_note ?? row.adminNote ?? '',
    reviewedAt: row.reviewed_at ?? row.reviewedAt,
    passwordSentAt: row.password_sent_at ?? row.passwordSentAt,
    linkedUserId: row.linked_user_id ?? row.linkedUserId,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

/**
 * Public: multipart form (field names must match Django model).
 * @param {FormData} formData
 */
export async function submitDeliveryPartnerApplication(formData) {
  if (!canCallApi()) throw new Error('API URL not configured');
  const r = await fetch(apiUrl('/api/delivery-partner-applications/'), {
    method: 'POST',
    body: formData,
  });
  const text = await r.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }
  if (!r.ok) {
    const msg =
      typeof data === 'object' && data
        ? Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' ') || data.detail
        : text;
    throw new Error(msg || `Submit failed (${r.status})`);
  }
  return data;
}

export async function listDeliveryPartnerApplications() {
  if (!canCallApi() || !getDrfToken()) throw new Error('API URL and JWT required');
  const r = await fetchWithAuth(apiUrl('/api/delivery-partner-applications/'), {
    method: 'GET',
    auth: true,
  });
  if (!r.ok) throw new Error(`Failed to load applications (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizePartnerApplication);
}

/**
 * @param {number|string} id
 * @param {{ password?: string }} [opts] If password omitted, server generates and emails it.
 */
export async function approveDeliveryPartnerApplication(id, opts = {}) {
  if (!canCallApi() || !getDrfToken()) throw new Error('API URL and JWT required');
  const body = {};
  if (opts.password && String(opts.password).trim()) {
    body.password = String(opts.password).trim();
  }
  const r = await fetchWithAuth(
    apiUrl(`/api/delivery-partner-applications/${encodeURIComponent(id)}/approve/`),
    { method: 'POST', auth: true, json: true, body }
  );
  const text = await r.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }
  if (!r.ok) throw new Error(data.detail || text || `Approve failed (${r.status})`);
  return data;
}

/**
 * @param {number|string} id
 * @param {{ adminNote?: string }} [opts]
 */
export async function rejectDeliveryPartnerApplication(id, opts = {}) {
  if (!canCallApi() || !getDrfToken()) throw new Error('API URL and JWT required');
  const r = await fetchWithAuth(
    apiUrl(`/api/delivery-partner-applications/${encodeURIComponent(id)}/reject/`),
    {
      method: 'POST',
      auth: true,
      json: true,
      body: { admin_note: opts.adminNote || '' },
    }
  );
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Reject failed (${r.status})`);
  }
  return r.json();
}
