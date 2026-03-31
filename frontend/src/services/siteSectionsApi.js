import { getDrfToken, fetchWithAuth, apiUrl, canCallApi } from './productsApi';

function parseList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

export function normalizeSiteSection(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || '',
    body: row.body || '',
    image: row.image || '',
    ctaLabel: row.ctaLabel ?? row.cta_label ?? '',
    ctaLink: row.ctaLink ?? row.cta_link ?? '',
    placement: row.placement || 'home',
    sortOrder: row.sortOrder ?? row.sort_order ?? 0,
    isActive: row.isActive !== false && row.is_active !== false,
    active: row.isActive !== false && row.is_active !== false,
  };
}

/** Public: active sections (optionally by placement). */
export async function listSiteSectionsPublic(opts = {}) {
  if (!canCallApi()) throw new Error('API URL not configured');
  const params = new URLSearchParams();
  if (opts.placement) params.set('placement', String(opts.placement).trim());
  const q = params.toString();
  const r = await fetch(apiUrl('/api/site-sections/', q));
  if (!r.ok) throw new Error(`Site sections failed (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizeSiteSection).filter((s) => s.active);
}

/** Admin: all sections (JWT). */
export async function listSiteSectionsAdmin(params = {}) {
  if (!canCallApi() || !getDrfToken()) throw new Error('API URL and JWT required');
  const search = new URLSearchParams();
  if (params.placement) search.set('placement', params.placement);
  const q = search.toString();
  const r = await fetchWithAuth(apiUrl('/api/site-sections/', q), { method: 'GET', auth: true });
  if (!r.ok) throw new Error(`Site sections failed (${r.status})`);
  const data = await r.json();
  return parseList(data).map(normalizeSiteSection);
}

export async function createSiteSection(body) {
  const r = await fetchWithAuth(apiUrl('/api/site-sections/'), {
    method: 'POST',
    auth: true,
    json: true,
    body: {
      title: body.title,
      body: body.body || '',
      image: body.image || '',
      ctaLabel: body.ctaLabel || '',
      ctaLink: body.ctaLink || '',
      placement: body.placement || 'home',
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive !== false && body.active !== false,
    },
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Create section failed (${r.status})`);
  }
  return normalizeSiteSection(await r.json());
}

export async function updateSiteSection(id, body) {
  const patch = {};
  if (body.title != null) patch.title = body.title;
  if (body.body != null) patch.body = body.body;
  if (body.image != null) patch.image = body.image;
  if (body.ctaLabel != null) patch.ctaLabel = body.ctaLabel;
  if (body.ctaLink != null) patch.ctaLink = body.ctaLink;
  if (body.placement != null) patch.placement = body.placement;
  if (body.sortOrder != null) patch.sortOrder = body.sortOrder;
  if (body.isActive != null) patch.isActive = body.isActive;
  if (body.active != null) patch.isActive = body.active;
  const r = await fetchWithAuth(apiUrl(`/api/site-sections/${id}/`), {
    method: 'PATCH',
    auth: true,
    json: true,
    body: patch,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Update section failed (${r.status})`);
  }
  return normalizeSiteSection(await r.json());
}

export async function deleteSiteSection(id) {
  const r = await fetchWithAuth(apiUrl(`/api/site-sections/${id}/`), {
    method: 'DELETE',
    auth: true,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Delete section failed (${r.status})`);
  }
}
