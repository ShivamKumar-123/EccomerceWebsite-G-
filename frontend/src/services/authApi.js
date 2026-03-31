import { canCallApi, apiUrl, getApiBase, setBackendConfig } from './productsApi';

/**
 * Obtain JWT pair from Django (SimpleJWT).
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ access: string, refresh: string }>}
 */
export async function obtainJwtPair(username, password) {
  if (!canCallApi()) {
    throw new Error('API not reachable. Run Django on port 8000 and use npm run dev (Vite proxies /api), or set VITE_API_URL in .env');
  }
  const r = await fetch(apiUrl('/api/auth/token/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) {
    let detail = 'Invalid credentials';
    try {
      const j = await r.json();
      detail = j.detail || j.non_field_errors?.[0] || JSON.stringify(j);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  const data = await r.json();
  if (!data.access) throw new Error('No access token in response');
  return { access: data.access, refresh: data.refresh || '' };
}

/** Persist tokens using the same rules as the rest of the app. */
export function persistJwtTokens(access, refresh) {
  if (!canCallApi()) return;
  const base = getApiBase() || (typeof window !== 'undefined' ? window.location.origin : '');
  setBackendConfig(base, access, refresh || undefined);
}
