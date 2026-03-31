const LS_API = 'heavytech_api_url';
/** Stored value is JWT access token (legacy key name). */
const LS_TOKEN = 'heavytech_drf_token';
const SS_TOKEN = 'heavytech_drf_token_session';
const LS_REFRESH = 'heavytech_jwt_refresh';
const SS_REFRESH = 'heavytech_jwt_refresh_session';

function envAccess() {
  const a = import.meta.env.VITE_JWT_ACCESS || import.meta.env.VITE_DRF_TOKEN;
  return a ? String(a) : '';
}

function envRefresh() {
  const r = import.meta.env.VITE_JWT_REFRESH;
  return r ? String(r) : '';
}

/**
 * Backend origin without trailing slash, or '' in dev when using Vite proxy (same-origin /api).
 * Priority: VITE_API_URL → localStorage (admin Settings) → dev proxy (empty).
 */
export function getApiBase() {
  const env = import.meta.env.VITE_API_URL;
  const envTrim = env != null ? String(env).trim() : '';
  if (envTrim !== '') {
    return envTrim.replace(/\/$/, '');
  }
  if (typeof localStorage !== 'undefined') {
    const u = localStorage.getItem(LS_API);
    if (u && String(u).trim()) return String(u).trim().replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return '';
}

/**
 * True if the app can reach /api (explicit URL, saved URL, or Vite dev server + proxy).
 */
export function canCallApi() {
  if (getApiBase()) return true;
  if (import.meta.env.DEV) return true;
  return false;
}

/**
 * Full URL for an API path (e.g. '/api/products/'). Works with empty getApiBase() via current origin (dev proxy).
 */
export function apiUrl(path, queryString = '') {
  const p = path.startsWith('/') ? path : `/${path}`;
  const qs =
    !queryString
      ? ''
      : String(queryString).startsWith('?')
        ? String(queryString)
        : `?${queryString}`;
  const base = getApiBase();
  if (base) {
    return `${base.replace(/\/$/, '')}${p}${qs}`;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${p}${qs}`;
  }
  return `${p}${qs}`;
}

/** JWT access token (Bearer). Legacy name kept for minimal churn. */
export function getDrfToken() {
  const fromEnv = envAccess();
  if (fromEnv) return fromEnv;
  if (import.meta.env.VITE_API_URL && typeof sessionStorage !== 'undefined') {
    const s = sessionStorage.getItem(SS_TOKEN);
    if (s) return s;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LS_TOKEN);
  }
  return null;
}

export function getRefreshToken() {
  const fromEnv = envRefresh();
  if (fromEnv) return fromEnv;
  if (import.meta.env.VITE_API_URL && typeof sessionStorage !== 'undefined') {
    const s = sessionStorage.getItem(SS_REFRESH);
    if (s) return s;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LS_REFRESH);
  }
  return null;
}

function persistAccessToken(access) {
  if (envAccess()) return;
  if (import.meta.env.VITE_API_URL && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SS_TOKEN, access);
    return;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LS_TOKEN, access);
  }
}

async function tryRefreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh || !canCallApi()) return null;
  const r = await fetch(apiUrl('/api/auth/token/refresh/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const access = data.access;
  if (access) persistAccessToken(access);
  return access || null;
}

/**
 * Fetch with optional JWT Bearer auth; on 401 retries once after refresh.
 * @param {string} url
 * @param {{ method?: string, body?: unknown, auth?: boolean, json?: boolean, headers?: HeadersInit } & RequestInit} options
 */
export async function fetchWithAuth(url, options = {}) {
  const { auth = false, json = false, body, headers: inHeaders, ...rest } = options;

  const build = (access) => {
    const h = new Headers(inHeaders || {});
    if (json && body !== undefined) {
      h.set('Content-Type', 'application/json');
    }
    if (auth && access) {
      h.set('Authorization', `Bearer ${access}`);
    }
    const outBody =
      json && body !== undefined && typeof body !== 'string'
        ? JSON.stringify(body)
        : body;
    return { ...rest, headers: h, body: outBody };
  };

  let access = getDrfToken();
  let res = await fetch(url, build(access));

  if (res.status === 401 && auth) {
    const newAccess = await tryRefreshAccessToken();
    if (newAccess) {
      res = await fetch(url, build(newAccess));
    }
  }

  return res;
}

/**
 * @param {string} [apiUrl]
 * @param {string|null} [accessToken] JWT access
 * @param {string|null} [refreshToken] JWT refresh (optional)
 */
/** Remove stored JWT (admin logout); respects env-injected tokens (does not clear env). */
export function clearStoredJwtTokens() {
  if (typeof sessionStorage !== 'undefined') {
    if (!envAccess()) sessionStorage.removeItem(SS_TOKEN);
    if (!envRefresh()) sessionStorage.removeItem(SS_REFRESH);
  }
  if (typeof localStorage !== 'undefined') {
    if (!envAccess()) localStorage.removeItem(LS_TOKEN);
    if (!envRefresh()) localStorage.removeItem(LS_REFRESH);
  }
}

export function setBackendConfig(apiUrl, accessToken, refreshToken = undefined) {
  if (import.meta.env.VITE_API_URL) {
    if (typeof sessionStorage !== 'undefined') {
      if (accessToken === '' || accessToken === null) {
        sessionStorage.removeItem(SS_TOKEN);
      } else if (accessToken != null && !envAccess()) {
        sessionStorage.setItem(SS_TOKEN, String(accessToken).trim());
      }
      if (refreshToken !== undefined) {
        if (refreshToken === '' || refreshToken === null) {
          sessionStorage.removeItem(SS_REFRESH);
        } else if (!envRefresh()) {
          sessionStorage.setItem(SS_REFRESH, String(refreshToken).trim());
        }
      }
    }
    return;
  }
  if (typeof localStorage === 'undefined') return;
  if (apiUrl != null) localStorage.setItem(LS_API, String(apiUrl).trim());
  if (accessToken != null) localStorage.setItem(LS_TOKEN, String(accessToken).trim());
  if (refreshToken !== undefined) {
    if (refreshToken === '' || refreshToken === null) {
      localStorage.removeItem(LS_REFRESH);
    } else {
      localStorage.setItem(LS_REFRESH, String(refreshToken).trim());
    }
  }
}

export function getBackendConfig() {
  const envUrl = import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
    : '';
  const envTok = envAccess();
  const envRef = envRefresh();
  let lsUrl = '';
  let lsToken = '';
  let lsRefresh = '';
  if (typeof localStorage !== 'undefined') {
    lsUrl = localStorage.getItem(LS_API) || '';
    lsToken = localStorage.getItem(LS_TOKEN) || '';
    lsRefresh = localStorage.getItem(LS_REFRESH) || '';
  }
  let ssToken = '';
  let ssRefresh = '';
  if (typeof sessionStorage !== 'undefined') {
    ssToken = sessionStorage.getItem(SS_TOKEN) || '';
    ssRefresh = sessionStorage.getItem(SS_REFRESH) || '';
  }
  return {
    apiUrl: envUrl || lsUrl,
    token: envTok || ssToken || lsToken,
    refresh: envRef || ssRefresh || lsRefresh,
  };
}

/**
 * @param {{ admin?: boolean, category?: string, search?: string }} opts
 */
export async function listProducts(opts = {}) {
  if (!canCallApi()) throw new Error('API URL not configured (set VITE_API_URL or use npm run dev with proxy)');
  const params = new URLSearchParams();
  if (opts.category && opts.category !== 'all') {
    params.set('category', String(opts.category).trim());
  }
  if (opts.search && String(opts.search).trim()) {
    params.set('search', String(opts.search).trim());
  }
  const q = params.toString();
  const url = apiUrl('/api/products/', q);
  const sendAuth = Boolean(opts.admin && getDrfToken());
  const r = await fetchWithAuth(url, {
    method: 'GET',
    auth: sendAuth,
  });
  if (!r.ok) throw new Error(`Failed to load products (${r.status})`);
  const data = await r.json();
  const rows = Array.isArray(data) ? data : data.results || [];
  return rows.map((p) => ({
    ...p,
    rating: p.rating != null ? Number(p.rating) : 4.5,
    sizeVariants: p.sizeVariants || p.size_variants || [],
  }));
}

/** @returns {Promise<Array<{ id: number, name: string, slug: string }>>} */
export async function listCategories() {
  if (!canCallApi()) throw new Error('API URL not configured');
  const r = await fetch(apiUrl('/api/categories/'));
  if (!r.ok) throw new Error(`Categories failed (${r.status})`);
  const data = await r.json();
  return Array.isArray(data) ? data : data.results || [];
}

export async function createProduct(body) {
  const r = await fetchWithAuth(apiUrl('/api/products/'), {
    method: 'POST',
    auth: true,
    json: true,
    body,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Create failed (${r.status})`);
  }
  return r.json();
}

export async function updateProduct(id, body) {
  const r = await fetchWithAuth(apiUrl(`/api/products/${id}/`), {
    method: 'PATCH',
    auth: true,
    json: true,
    body,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Update failed (${r.status})`);
  }
  return r.json();
}

export async function deleteProduct(id) {
  const r = await fetchWithAuth(apiUrl(`/api/products/${id}/`), {
    method: 'DELETE',
    auth: true,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Delete failed (${r.status})`);
  }
}

export function canMutateProducts() {
  return Boolean(canCallApi() && getDrfToken());
}
