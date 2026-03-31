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
    window.addEventListener('heavytech-ads-updated', onUpd);
    return () => window.removeEventListener('heavytech-ads-updated', onUpd);
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
      className="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200 dark:shadow-xl dark:shadow-slate-900/10 dark:ring-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative bg-gradient-to-r ${ad.bgColor || 'from-violet-600 to-indigo-800'} py-10 sm:py-14 lg:py-16`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative w-full min-w-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center lg:text-left text-white flex-1">
              <div className="inline-block bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide">
                Featured
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 drop-shadow-sm">{ad.title}</h3>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-5 max-w-xl leading-relaxed">{ad.description}</p>
              {isInternal ? (
                <Link
                  to={link}
                  className="inline-flex items-center gap-2 bg-white text-violet-700 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-violet-50 transition-colors"
                >
                  Shop now
                </Link>
              ) : (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-violet-700 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-violet-50 transition-colors"
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
                  className="w-full h-44 sm:h-52 lg:h-56 object-cover rounded-2xl shadow-2xl ring-2 ring-white/20"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white z-10"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentAd((p) => (p + 1) % ads.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white z-10"
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
                    idx === currentAd ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'
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
