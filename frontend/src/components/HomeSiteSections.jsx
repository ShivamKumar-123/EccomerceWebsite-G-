import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { canCallApi } from '../services/productsApi';
import { listSiteSectionsPublic } from '../services/siteSectionsApi';

/**
 * Renders admin-managed content blocks for the home page (placement: home).
 */
export default function HomeSiteSections() {
  const [sections, setSections] = useState([]);

  const load = useCallback(async () => {
    if (!canCallApi()) {
      setSections([]);
      return;
    }
    try {
      const rows = await listSiteSectionsPublic({ placement: 'home' });
      rows.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setSections(rows);
    } catch (e) {
      console.error('HomeSiteSections: failed to load', e);
      setSections([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onUpd = () => load();
    window.addEventListener('heavytech-sections-updated', onUpd);
    return () => window.removeEventListener('heavytech-sections-updated', onUpd);
  }, [load]);

  if (sections.length === 0) return null;

  return (
    <section className="space-y-6" aria-label="Featured content">
      {sections.map((s) => (
        <article
          key={s.id}
          className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 sm:p-8 shadow-lg dark:border-white/10 dark:from-slate-900/90 dark:to-slate-900/60"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            {s.image ? (
              <div className="w-full shrink-0 overflow-hidden rounded-2xl lg:w-[min(100%,320px)]">
                <img src={s.image} alt="" className="h-48 w-full object-cover sm:h-56 lg:h-full lg:min-h-[200px]" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 text-center lg:text-left">
              <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">{s.title}</h2>
              {s.body ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                  {s.body}
                </p>
              ) : null}
              {s.ctaLabel && s.ctaLink ? (
                <div className="mt-5">
                  {String(s.ctaLink).startsWith('/') ? (
                    <Link
                      to={s.ctaLink}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
                    >
                      {s.ctaLabel}
                    </Link>
                  ) : (
                    <a
                      href={s.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
                    >
                      {s.ctaLabel}
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
