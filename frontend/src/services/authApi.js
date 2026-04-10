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
  const tokenUrl = apiUrl('/api/auth/token/');
  let r;
  try {
    r = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch (e) {
    const base = getApiBase();
    const hint = base
      ? `Browser is calling ${base} (saved in Settings / localStorage). If that server is down, clear “Backend API” in Admin → Settings or remove key goldymart_api_url from localStorage.`
      : `With npm run dev, requests go to this site’s /api → Vite proxies to http://127.0.0.1:8000 (see vite.config.js / VITE_DJANGO_PROXY_TARGET).`;
    throw new Error(
      `Cannot reach Django (${tokenUrl}). ${hint} Start API: cd backend && python manage.py runserver`
    );
  }
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
