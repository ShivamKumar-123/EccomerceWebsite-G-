import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { canCallApi } from '../services/productsApi';
import { listBannersPublic } from '../services/bannersApi';

const AdBanner = () => {
  const [currentAd, setCurrentAd] = useState(0);
  const [ads, setAds] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!canCallApi()) {
      setAds([]);
      setError('no-api');
      return;
    }
    try {
      const rows = await listBannersPublic();
      setAds(rows.filter((a) => a.active !== false));
      setError(null);
    } catch (e) {
      console.error('AdBanner:', e);
      setAds([]);
      setError('load');
    }
  }, []);

  useEffect(() => {
    load();
    const onUpd = () => load();
    window.addEventListener('goldymart-ads-updated', onUpd);
    return () => window.removeEventListener('goldymart-ads-updated', onUpd);
  }, [load]);

  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [ads.length, isPaused]);

  if (error === 'no-api') {
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 dark:bg-amber-950/40 dark:border-amber-800 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
        Start Django and set <code className="text-xs font-mono">VITE_API_URL</code> in{' '}
        <code className="text-xs font-mono">.env.development</code> to load hero banners from the API.
      </div>
    );
  }

  if (ads.length === 0) return null;

  const ad = ads[currentAd];
  const link = ad.link || '/products';
  const isInternal = typeof link === 'string' && link.startsWith('/');

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-card ring-1 ring-stone-200/90 dark:shadow-xl dark:shadow-stone-900/20 dark:ring-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative bg-gradient-to-r ${ad.bgColor || 'from-primary-800 to-primary-950'} py-10 sm:py-14 lg:py-16`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative w-full min-w-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center lg:text-left flex-1 w-full min-w-0 rounded-2xl border border-stone-200/90 bg-white/92 p-6 sm:p-8 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-stone-950/80 dark:shadow-stone-950/40">
              <div className="inline-block bg-primary-100 text-primary-900 px-3 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide dark:bg-white/15 dark:text-white">
                Featured
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 text-stone-900 dark:text-white drop-shadow-none">
                {ad.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base lg:text-lg mb-5 max-w-xl leading-relaxed dark:text-stone-200">
                {ad.description}
              </p>
              {isInternal ? (
                <Link
                  to={link}
                  className="inline-flex items-center gap-2 bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/20 hover:bg-primary-600 transition-colors dark:bg-white dark:text-primary-900 dark:shadow-black/20 dark:hover:bg-primary-50"
                >
                  Shop now
                </Link>
              ) : (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-primary-600 transition-colors dark:bg-white dark:text-primary-900 dark:hover:bg-primary-50"
                >
                  Shop now
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
            {ad.image && (
              <div className="w-full lg:w-[38%] max-w-md">
                <img
                  src={ad.image}
                  alt=""
                  className="w-full h-44 sm:h-52 lg:h-56 object-cover rounded-2xl shadow-2xl ring-2 ring-stone-200/90 dark:ring-white/20"
                />
              </div>
            )}
          </div>
        </div>

        {ads.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentAd((p) => (p - 1 + ads.length) % ads.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 bg-white/95 text-stone-800 shadow-md border border-stone-200/90 hover:bg-stone-50 dark:bg-stone-900/80 dark:text-white dark:border-white/15 dark:hover:bg-stone-800"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentAd((p) => (p + 1) % ads.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 bg-white/95 text-stone-800 shadow-md border border-stone-200/90 hover:bg-stone-50 dark:bg-stone-900/80 dark:text-white dark:border-white/15 dark:hover:bg-stone-800"
              aria-label="Next"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentAd(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentAd
                      ? 'bg-stone-900 w-8 dark:bg-white'
                      : 'bg-stone-900/35 w-2 hover:bg-stone-900/55 dark:bg-white/40 dark:hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
