import {
  effectiveSizeVariantsForProduct,
  normalizeSizeVariantsList,
} from '../lib/productSizeDefaults';

const LS_API = 'goldymart_api_url';
/** Stored value is JWT access token (legacy key name). */
const LS_TOKEN = 'goldymart_drf_token';
const SS_TOKEN = 'goldymart_drf_token_session';
const LS_REFRESH = 'goldymart_jwt_refresh';
const SS_REFRESH = 'goldymart_jwt_refresh_session';

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
 * @param {object} p
 * @param {{ storefront?: boolean }} [options] storefront=false (admin): no default sizes; only normalise saved rows.
 */
function mapProductRow(p, options = {}) {
  const storefront = options.storefront !== false;
  const row = {
    ...p,
    rating: p.rating != null ? Number(p.rating) : 4.5,
    sizeVariants: p.sizeVariants || p.size_variants || [],
    ageGroups: p.ageGroups || p.age_groups || [],
    genders: p.genders || [],
    brand: p.brand || '',
    colors: p.colors || [],
    originalPrice: p.originalPrice ?? p.original_price ?? null,
    offerDiscountPercent:
      Number(p.offerDiscountPercent ?? p.offer_discount_percent ?? 0) || 0,
    saleDiscountPercent:
      Number(p.saleDiscountPercent ?? p.sale_discount_percent ?? 0) || 0,
    discountPercent:
      Number(p.discountPercent ?? p.saleDiscountPercent ?? p.sale_discount_percent ?? 0) || 0,
    createdAt: p.createdAt || p.created_at || null,
  };
  const fromApi = Array.isArray(row.images)
    ? row.images.map((x) => String(x).trim()).filter(Boolean)
    : [];
  const primary = row.image != null ? String(row.image).trim() : '';
  const images = fromApi.length ? fromApi : primary ? [primary] : [];
  row.images = images;
  row.image = images[0] || primary || '';
  row.sizeVariants = storefront
    ? effectiveSizeVariantsForProduct(row)
    : normalizeSizeVariantsList(row.sizeVariants);
  return row;
}

/**
 * Storefront page size (must match backend ProductPagination.page_size for guests).
 */
export const STOREFRONT_PRODUCT_PAGE_SIZE = 12;

/**
 * @param {{
 *   admin?: boolean,
 *   category?: string,
 *   search?: string,
 *   ageGroups?: string[],
 *   genders?: string[],
 *   brands?: string[],
 *   colors?: string[],
 *   sizes?: string[],
 *   minPrice?: string|number,
 *   maxPrice?: string|number,
 *   minRating?: string|number,
 *   page?: number,
 *   pageSize?: string|number,
 *   footwear?: boolean,
 *   categories?: string[],
 *   discounts?: string[]|number[],
 *   ordering?: string,
 * }} opts
 * @returns {Promise<{ results: object[], count: number, next: string|null, previous: string|null }>}
 */
export async function listProducts(opts = {}) {
  if (!canCallApi()) throw new Error('API URL not configured (set VITE_API_URL or use npm run dev with proxy)');
  const params = new URLSearchParams();
  if (opts.footwear) {
    params.set('footwear', '1');
  }
  if (opts.category && opts.category !== 'all') {
    params.set('category', String(opts.category).trim());
  }
  const join = (arr) => (Array.isArray(arr) && arr.length ? arr.join(',') : '');
  const cats = join(opts.categories);
  if (cats) params.set('categories', cats);
  if (opts.search && String(opts.search).trim()) {
    params.set('search', String(opts.search).trim());
  }
  const ag = join(opts.ageGroups);
  if (ag) params.set('age_groups', ag);
  const g = join(opts.genders);
  if (g) params.set('genders', g);
  const b = join(opts.brands);
  if (b) params.set('brands', b);
  const c = join(opts.colors);
  if (c) params.set('colors', c);
  const sz = join(opts.sizes);
  if (sz) params.set('sizes', sz);
  if (opts.minPrice != null && String(opts.minPrice).trim() !== '') {
    params.set('min_price', String(opts.minPrice).trim());
  }
  if (opts.maxPrice != null && String(opts.maxPrice).trim() !== '') {
    params.set('max_price', String(opts.maxPrice).trim());
  }
  if (opts.minRating != null && String(opts.minRating).trim() !== '') {
    params.set('min_rating', String(opts.minRating).trim());
  }
  const discs = join(
    Array.isArray(opts.discounts)
      ? opts.discounts.map((d) => String(d).trim()).filter(Boolean)
      : []
  );
  if (discs) params.set('discounts', discs);
  if (opts.ordering != null && String(opts.ordering).trim() !== '') {
    params.set('ordering', String(opts.ordering).trim());
  }
  if (opts.page != null) {
    const pg = Number(opts.page);
    if (Number.isFinite(pg) && pg >= 1) params.set('page', String(Math.floor(pg)));
  }
  if (opts.pageSize != null && String(opts.pageSize).trim() !== '') {
    params.set('page_size', String(opts.pageSize).trim());
  }
  const q = params.toString();
  const url = apiUrl('/api/products/', q);
  const sendAuth = Boolean(opts.admin && getDrfToken());
  const r = await fetchWithAuth(url, {
    method: 'GET',
    auth: sendAuth,
  });
  if (!r.ok) {
    if (r.status === 404) {
      const err = new Error('PAGE_NOT_FOUND');
      err.code = 'INVALID_PAGE';
      throw err;
    }
    throw new Error(`Failed to load products (${r.status})`);
  }
  const data = await r.json();
  const rowOpts = { storefront: !opts.admin };
  if (Array.isArray(data)) {
    const results = data.map((p) => mapProductRow(p, rowOpts));
    return { results, count: results.length, next: null, previous: null };
  }
  const rawResults = data.results || [];
  return {
    results: rawResults.map((p) => mapProductRow(p, rowOpts)),
    count: typeof data.count === 'number' ? data.count : rawResults.length,
    next: data.next || null,
    previous: data.previous || null,
  };
}

/**
 * Single product for detail page (guest: active only; admin optional).
 * @param {string|number} id
 * @param {{ admin?: boolean }} [opts]
 */
export async function fetchProductById(id, opts = {}) {
  if (!canCallApi()) throw new Error('API URL not configured (set VITE_API_URL or use npm run dev with proxy)');
  const admin = opts.admin === true;
  const r = await fetchWithAuth(apiUrl(`/api/products/${encodeURIComponent(id)}/`), {
    method: 'GET',
    auth: admin,
  });
  if (r.status === 404) {
    const err = new Error('Product not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (!r.ok) throw new Error(`Failed to load product (${r.status})`);
  const p = await r.json();
  return mapProductRow(p, { storefront: !admin });
}

/** Load every product page for the admin panel (JWT required). */
export async function listAllAdminProducts() {
  const all = [];
  let page = 1;
  const pageSize = 500;
  for (;;) {
    const { results, count } = await listProducts({ admin: true, page, pageSize });
    all.push(...results);
    if (results.length === 0 || all.length >= count) break;
    page += 1;
    if (page > 200) break;
  }
  return all;
}

/**
 * Distinct brands, sizes, colors for sidebar (same category + search as listing, no facet filters).
 */
export async function fetchProductFilterOptions({ category, search } = {}) {
  if (!canCallApi()) throw new Error('API URL not configured');
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', String(category).trim());
  if (search && String(search).trim()) params.set('search', String(search).trim());
  const qs = params.toString();
  const r = await fetch(apiUrl('/api/products/filter-options/', qs));
  if (!r.ok) throw new Error(`Filter options failed (${r.status})`);
  const data = await r.json();
  return {
    brands: Array.isArray(data.brands) ? data.brands : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
  };
}

/** Facets + price range for footwear listing (ignores facet filters). */
export async function fetchShoeFilterOptions({ search } = {}) {
  if (!canCallApi()) throw new Error('API URL not configured');
  const params = new URLSearchParams();
  params.set('footwear', '1');
  if (search && String(search).trim()) params.set('search', String(search).trim());
  const qs = params.toString();
  const r = await fetch(apiUrl('/api/products/filter-options/', qs));
  if (!r.ok) throw new Error(`Shoe filter options failed (${r.status})`);
  const data = await r.json();
  return {
    brands: Array.isArray(data.brands) ? data.brands : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    priceMin: data.price_min != null ? Number(data.price_min) : null,
    priceMax: data.price_max != null ? Number(data.price_max) : null,
    count: typeof data.count === 'number' ? data.count : 0,
    shoeTypes: Array.isArray(data.shoe_types) ? data.shoe_types : [],
  };
}

/** @returns {Promise<Array<{ id: number, name: string, slug: string }>>} */
export async function listCategories() {
  if (!canCallApi()) return [];
  try {
    const r = await fetch(apiUrl('/api/categories/'));
    if (!r.ok) {
      if (import.meta.env.DEV) console.warn(`[categories] ${r.status}`);
      return [];
    }
    const data = await r.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[categories] fetch failed', e);
    return [];
  }
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
