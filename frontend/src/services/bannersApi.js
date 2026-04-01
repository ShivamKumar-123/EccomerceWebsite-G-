import { getDrfToken, fetchWithAuth, apiUrl, canCallApi } from './productsApi';

function parseList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

/** Normalize API banner to UI shape (active + bgColor). */
export function normalizeBanner(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    image: row.image || '',
    link: row.link || '/products',
    bgColor: row.bgColor || row.bg_gradient || 'from-emerald-800 to-emerald-950',
    sortOrder: row.sortOrder ?? row.sort_order ?? 0,
    isActive: row.isActive !== false && row.is_active !== false,
    active: row.isActive !== false && row.is_active !== false,
  };
}

/** Public: active banners only (no auth). */
export async function listBannersPublic() {
  if (!canCallApi()) throw new Error('API URL not configured');
  const r = await fetch(apiUrl('/api/banners/'));
  if (!r.ok) throw new Error(`Banners failed (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizeBanner).filter((b) => b.active);
}

/** Admin: all banners (requires JWT). */
export async function listBannersAdmin() {
  const token = getDrfToken();
  if (!canCallApi() || !token) throw new Error('API URL and JWT required');
  const r = await fetchWithAuth(apiUrl('/api/banners/'), { method: 'GET', auth: true });
  if (!r.ok) throw new Error(`Banners failed (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizeBanner);
}

export async function createBanner(body) {
  const r = await fetchWithAuth(apiUrl('/api/banners/'), {
    method: 'POST',
    auth: true,
    json: true,
    body: {
      title: body.title,
      description: body.description || '',
      image: body.image || '',
      link: body.link || '/products',
      bgColor: body.bgColor || 'from-blue-600 to-indigo-700',
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive !== false && body.active !== false,
    },
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Create banner failed (${r.status})`);
  }
  return normalizeBanner(await r.json());
}

export async function updateBanner(id, body) {
  const r = await fetchWithAuth(apiUrl(`/api/banners/${id}/`), {
    method: 'PATCH',
    auth: true,
    json: true,
    body: {
      ...(body.title != null ? { title: body.title } : {}),
      ...(body.description != null ? { description: body.description } : {}),
      ...(body.image != null ? { image: body.image } : {}),
      ...(body.link != null ? { link: body.link } : {}),
      ...(body.bgColor != null ? { bgColor: body.bgColor } : {}),
      ...(body.sortOrder != null ? { sortOrder: body.sortOrder } : {}),
      ...(body.isActive != null ? { isActive: body.isActive } : {}),
      ...(body.active != null ? { isActive: body.active } : {}),
    },
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Update banner failed (${r.status})`);
  }
  return normalizeBanner(await r.json());
}

export async function deleteBanner(id) {
  const r = await fetchWithAuth(apiUrl(`/api/banners/${id}/`), {
    method: 'DELETE',
    auth: true,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Delete banner failed (${r.status})`);
  }
}
