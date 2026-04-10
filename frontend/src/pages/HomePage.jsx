import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Zap,
  Shield,
  Truck,
  TrendingUp,
  Heart,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import AdBanner from '../components/AdBanner';
import HomeSiteSections from '../components/HomeSiteSections';
import SiteLoader from '../components/SiteLoader';
import SEOHead from '../components/SEOHead';
import PaginationBar from '../components/PaginationBar';
import LazyImage from '../components/LazyImage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductSizeSelect from '../components/ProductSizeSelect';
import FavoriteButton from '../components/FavoriteButton';
import { canCallApi, listProducts, listCategories } from '../services/productsApi';
import { filterVisibleCategories, REMOVED_CATEGORY_SLUGS } from '../lib/catalogPolicy';
import { getProductPriceStack } from '../lib/productPricing';

const STORE = 'Goldy Mart';
const TRENDING_PER_PAGE = 6;

const CATEGORY_ICONS = {
  electronics: { icon: '⚡', color: 'from-secondary-500/20 to-secondary-600/10', accent: 'text-secondary-500 dark:text-secondary-400' },
  fashion:     { icon: '👗', color: 'from-rose-500/15 to-rose-600/10', accent: 'text-rose-500 dark:text-rose-400' },
  'home-kitchen': { icon: '🏠', color: 'from-amber-500/15 to-orange-500/10', accent: 'text-amber-600 dark:text-amber-400' },
  beauty:      { icon: '✨', color: 'from-fuchsia-500/15 to-rose-500/10', accent: 'text-fuchsia-600 dark:text-fuchsia-400' },
  sports:      { icon: '🏃', color: 'from-emerald-600/15 to-emerald-500/10', accent: 'text-emerald-600 dark:text-emerald-400' },
  books:       { icon: '📚', color: 'from-amber-600/15 to-secondary-500/10', accent: 'text-amber-600 dark:text-secondary-400' },
  clothes:     { icon: '👔', color: 'from-lime-600/15 to-lime-500/10', accent: 'text-lime-600 dark:text-lime-400' },
  shoes:       { icon: '👟', color: 'from-orange-500/15 to-red-500/10', accent: 'text-orange-600 dark:text-orange-400' },
};

function CategoryCard({ cat }) {
  const meta = CATEGORY_ICONS[cat.slug] || { icon: '🛒', color: 'from-stone-500/15 to-stone-400/10', accent: 'text-stone-500' };
  return (
    <Link
      to={`/products?category=${encodeURIComponent(cat.slug)}`}
      className="group relative overflow-hidden rounded-[1.35rem] border border-stone-200/60 bg-white/80 p-5 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50 hover:shadow-modern dark:border-white/10 dark:bg-stone-900/50 dark:hover:border-primary-500/40"
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${meta.color} opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70`} />
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative flex flex-col">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 text-2xl shadow-inner ring-1 ring-stone-200/80 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md dark:from-white/10 dark:to-white/5 dark:ring-white/10">
          {meta.icon}
        </div>
        <p className="font-display text-[15px] font-bold leading-snug text-stone-900 dark:text-white">
          {cat.name}
        </p>
        <span className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${meta.accent}`}>
          Shop now
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function ProductCard({ product, selectedSize, onSizeChange, onAddToCart }) {
  const stack = getProductPriceStack(product);
  const { showPromo, originalDisplay, finalDisplay, offFromMrp } = stack;
  const offerPct = Number(product.offerDiscountPercent) || 0;
  const salePct = Number(product.saleDiscountPercent) || 0;

  return (
    <div className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white/95 card-premium shadow-soft backdrop-blur-sm hover:border-secondary-500/45 hover:shadow-[0_10px_32px_-8px_rgba(184,116,68,0.22)] dark:border-white/10 dark:bg-stone-800/70 dark:hover:border-secondary-500/40">
      <Link
        to={`/product/${product.id}`}
        className="flex min-h-0 flex-1 flex-col rounded-t-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900"
      >
        {/* Image — shorter than square so row feels lighter */}
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-stone-50 dark:bg-stone-900/60">
          <FavoriteButton
            product={product}
            className="absolute right-2 top-2 z-10 rounded-full bg-white/95 shadow-sm dark:bg-stone-900/95"
            size={16}
          />
          <LazyImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.05]"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-0.5">
            {product.badge && (
              <span className="rounded-md bg-gradient-to-r from-primary-700 to-secondary-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                {product.badge}
              </span>
            )}
            {offerPct > 0 && (
              <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                Offer {offerPct}%
              </span>
            )}
            {salePct > 0 && (
              <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                Sale {salePct}%
              </span>
            )}
            {offFromMrp > 0 && !offerPct && !salePct && (
              <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                -{offFromMrp}%
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2.5 pb-1 pt-1.5">
          <p className="h-[2.125rem] overflow-hidden text-[11px] font-medium leading-snug text-stone-700 line-clamp-2 dark:text-stone-200">
            {product.name}
          </p>
          <div className="mt-1 flex shrink-0 items-center gap-0.5">
            <div className="flex items-center gap-px">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${i < Math.round(product.rating || 4) ? 'fill-secondary-400 text-secondary-400' : 'text-stone-300 dark:text-stone-600'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">({product.rating || '4.0'})</span>
          </div>
          <div className="mt-0.5 flex shrink-0 flex-col gap-0.5">
            {showPromo && originalDisplay ? (
              <p
                className="text-[10px] font-semibold text-stone-400"
                style={{
                  textDecorationLine: 'line-through underline',
                  textDecorationThickness: '1px',
                  textUnderlineOffset: '2px',
                }}
              >
                MRP {originalDisplay}
              </p>
            ) : null}
            <p className="text-sm font-black leading-tight text-stone-900 dark:text-white">{finalDisplay}</p>
          </div>
          <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-primary-700 dark:text-primary-400">
            View details
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>

      <div className="mt-auto flex flex-col gap-1.5 px-2.5 pb-2 pt-1">
        <ProductSizeSelect product={product} value={selectedSize || ''} onChange={onSizeChange} />
        <button
          type="button"
          onClick={onAddToCart}
          className="flex w-full shrink-0 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-secondary-600 to-secondary-800 py-2 text-[10px] font-extrabold text-white shadow-md shadow-primary-900/25 ring-1 ring-secondary-400/25 transition-all hover:brightness-105 active:scale-[0.98]"
        >
          <ShoppingCart size={12} />
          Add to cart
        </button>
      </div>
    </div>
  );
}

const HomePage = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [trendingPage, setTrendingPage] = useState(1);
  const [trendingTotalCount, setTrendingTotalCount] = useState(0);
  const [trendingRefreshing, setTrendingRefreshing] = useState(false);
  const [backendHint, setBackendHint] = useState(null);
  const categoriesFetchedRef = useRef(false);
  const { addToCart } = useCart();
  const { isAuthenticated: isStoreAdmin } = useAuth();

  const trendingTotalPages = Math.max(1, Math.ceil(trendingTotalCount / TRENDING_PER_PAGE) || 1);

  useEffect(() => {
    if (trendingPage > trendingTotalPages) setTrendingPage(trendingTotalPages);
  }, [trendingPage, trendingTotalPages]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canCallApi()) {
        setError('no-api');
        setLoading(false);
        return;
      }
      if (trendingPage === 1) setLoading(true);
      else setTrendingRefreshing(true);
      setError(null);
      if (trendingPage === 1) setBackendHint(null);
      try {
        if (trendingPage === 1 && !categoriesFetchedRef.current) {
          const settled = await Promise.allSettled([
            listProducts({ admin: false, page: 1, pageSize: TRENDING_PER_PAGE }),
            listCategories(),
          ]);
          if (cancelled) return;
          const proRes =
            settled[0].status === 'fulfilled'
              ? settled[0].value
              : { results: [], count: 0 };
          const crows = settled[1].status === 'fulfilled' ? settled[1].value : [];
          if (settled[0].status === 'rejected' || settled[1].status === 'rejected') {
            setBackendHint(
              'Catalog API unavailable. Start Django (e.g. python manage.py runserver on port 8000) and refresh. With Vite dev, leave VITE_API_URL empty so /api is proxied to Django.'
            );
          }
          const visibleP = (proRes.results || []).filter(
            (p) => !REMOVED_CATEGORY_SLUGS.has(String(p.category || '').trim())
          );
          setDealProducts(visibleP);
          setTrendingTotalCount(typeof proRes.count === 'number' ? proRes.count : visibleP.length);
          setCategories(filterVisibleCategories(crows || []).slice(0, 10));
          categoriesFetchedRef.current = true;
        } else {
          const proRes = await listProducts({
            admin: false,
            page: trendingPage,
            pageSize: TRENDING_PER_PAGE,
          });
          if (cancelled) return;
          const visibleP = (proRes.results || []).filter(
            (p) => !REMOVED_CATEGORY_SLUGS.has(String(p.category || '').trim())
          );
          setDealProducts(visibleP);
          setTrendingTotalCount(typeof proRes.count === 'number' ? proRes.count : visibleP.length);
        }
      } catch (e) {
        if (!cancelled) {
          setBackendHint(e?.message || 'Failed to load home data.');
          setDealProducts([]);
          setTrendingTotalCount(0);
          if (trendingPage === 1 && !categoriesFetchedRef.current) setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTrendingRefreshing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trendingPage]);

  const handleAddToCart = (product) => {
    const needSize = Array.isArray(product.sizeVariants) && product.sizeVariants.length > 0;
    const size = needSize ? selectedSizes[product.id] : undefined;
    if (needSize && !String(size || '').trim()) { alert('Please select a size.'); return; }
    const ok = addToCart(product, { size: needSize ? size : undefined });
    if (!ok) alert('Could not add — size may be out of stock.');
  };

  if (error === 'no-api') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg text-center rounded-3xl border border-primary-200/70 bg-gradient-to-br from-primary-50 via-stone-50 to-amber-50/60 p-10 shadow-card dark:from-primary-950/50 dark:via-stone-900 dark:to-stone-950 dark:border-primary-800/40">
          <h1 className="text-2xl font-black text-stone-900 dark:text-white mb-3">Backend required</h1>
          <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-6">
            Add <code className="text-primary-800 dark:text-primary-300">VITE_API_URL=http://127.0.0.1:8000</code> to{' '}
            <code className="text-primary-800 dark:text-primary-300">frontend/.env.development</code>, run{' '}
            <code className="text-primary-800 dark:text-primary-300">python manage.py runserver</code>, then restart Vite.
          </p>
          <p className="text-xs text-stone-500">Products, orders & banners are stored in Django + SQLite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors dark:bg-transparent dark:text-[#F8F7F5]">
      <SEOHead
        title={`${STORE} — Shop electronics, fashion, home & more`}
        description="Premium online store — all categories, secure checkout, pan-India delivery."
        keywords="online shopping, electronics, fashion, home, Goldy Mart"
        url="https://www.goldymart.com/"
      />

      {/* ── Hero — bento + bold type ── */}
      <section className="relative overflow-hidden bg-background pb-6 pt-6 sm:pb-10 sm:pt-10 lg:pb-16 lg:pt-14 dark:bg-transparent">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[min(100vw,28rem)] w-[min(100%,40rem)] -translate-x-1/4 rounded-full bg-primary-500/12 blur-[100px] dark:bg-primary-500/20" />
          <div className="absolute bottom-0 right-0 h-[min(100vw,22rem)] w-[min(100%,32rem)] rounded-full bg-secondary-400/12 blur-[90px] dark:bg-amber-500/12" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.35] dark:opacity-[0.15]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Copy */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-800 shadow-sm backdrop-blur-md dark:border-primary-500/25 dark:bg-primary-950/35 dark:text-primary-100 sm:text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary-500" />
                </span>
                New arrivals weekly
              </div>

              <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-stone-900 dark:text-white sm:text-5xl xl:text-[3.5rem]">
                Style that fits
                <span className="mt-1 block bg-gradient-to-r from-secondary-600 via-secondary-500 to-amber-600 bg-clip-text text-transparent">
                  your everyday
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
                One destination for electronics, fashion, home & beauty — fast checkout, real inventory, delivery you can track.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-8 py-4 text-sm font-extrabold text-cta-fg shadow-modern shadow-black/15 transition-all hover:scale-[1.02] hover:bg-primary-100 active:scale-[0.98] dark:shadow-black/30 dark:hover:bg-white/90"
                >
                  Start shopping
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/shoes"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-stone-200/90 bg-white/90 px-8 py-4 text-sm font-bold text-stone-800 shadow-soft backdrop-blur-sm transition-all hover:border-primary-300 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Footwear edit
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-stone-600 dark:text-stone-400">
                {['Secure UPI & cards', 'Pan-India shipping', 'GST-ready invoices'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} />
                    {t}
                  </span>
                ))}
              </div>

              {isStoreAdmin ? (
                <p className="mt-6 text-xs text-stone-500 dark:text-stone-500 sm:text-sm">
                  <span className="font-semibold text-stone-700 dark:text-stone-400">Store admin</span>{' '}
                  <Link
                    to="/admin/dashboard"
                    className="font-bold text-primary-600 underline decoration-primary-400/40 underline-offset-4 hover:text-primary-500 dark:text-primary-400"
                  >
                    Open dashboard
                  </Link>
                </p>
              ) : null}
            </div>

            {/* Bento */}
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-2 group relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-primary-600/15 p-6 shadow-modern backdrop-blur-xl dark:border-white/10 dark:from-amber-500/10 dark:via-stone-900/80 dark:to-primary-950/50 sm:p-8">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/25 blur-3xl transition-opacity group-hover:opacity-90" />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-900/20">
                        <Zap className="h-7 w-7 text-white" strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="font-display text-lg font-extrabold text-stone-900 dark:text-white sm:text-xl">Flash deals</p>
                        <p className="mt-1 max-w-xs text-sm text-stone-600 dark:text-stone-400">Price drops on trending picks — refreshed often.</p>
                      </div>
                    </div>
                    <Link
                      to="/products"
                      className="inline-flex shrink-0 items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-xs font-bold text-white transition-transform hover:scale-105 dark:bg-white dark:text-stone-900"
                    >
                      View deals
                    </Link>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/75 p-5 shadow-soft backdrop-blur-xl transition-all hover:border-primary-300/50 hover:shadow-modern dark:border-white/10 dark:bg-stone-900/60 dark:hover:border-secondary-500/30 sm:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary-500/8 to-secondary-600/12 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 shadow-md">
                      <Shield className="h-5 w-5 text-white" strokeWidth={2.2} />
                    </div>
                    <p className="font-display font-bold text-stone-900 dark:text-white">Safe checkout</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">Encrypted payments & trusted gateways.</p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/75 p-5 shadow-soft backdrop-blur-xl transition-all hover:border-primary-300/50 hover:shadow-modern dark:border-white/10 dark:bg-stone-900/60 dark:hover:border-secondary-500/30 sm:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/8 to-secondary-600/12 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-secondary-700 shadow-md">
                      <Truck className="h-5 w-5 text-white" strokeWidth={2.2} />
                    </div>
                    <p className="font-display font-bold text-stone-900 dark:text-white">Fast delivery</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">Dispatch updates & order tracking.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent dark:from-surface" />
      </section>

      {/* ─────────────────────────────────────
          MAIN CONTENT
      ───────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl space-y-14 px-4 pb-20 pt-2 sm:space-y-20 sm:px-6 sm:pb-24 lg:px-8">

        {backendHint && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-soft backdrop-blur-sm dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100"
          >
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{backendHint}</span>
          </div>
        )}

        <AdBanner />

        {/* Categories */}
        <section className="rounded-[1.75rem] border border-stone-200/60 bg-white/50 p-6 shadow-modern backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/40 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">01 — Browse</span>
              <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-4xl">
                Shop by category
              </h2>
              <p className="mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">Jump straight into what you need — filters work on every listing.</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 self-start rounded-full border border-primary-200/80 bg-primary-50 px-4 py-2 text-sm font-bold text-primary-800 transition-colors hover:bg-primary-100 dark:border-primary-500/30 dark:bg-primary-950/50 dark:text-primary-200 dark:hover:bg-primary-900/40 sm:self-auto"
            >
              Full catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <SiteLoader message="Loading categories…" className="py-10" />
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-500 dark:text-red-400">{error}</p>
          ) : categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
              No categories yet — start Django and seed categories.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
              {categories.map((c) => (
                <CategoryCard key={c.slug} cat={c} />
              ))}
            </div>
          )}
        </section>

        {/* Trending */}
        <section className="rounded-[1.75rem] border border-stone-200/60 bg-gradient-to-b from-white/70 to-stone-50/50 p-6 shadow-modern backdrop-blur-xl dark:border-white/10 dark:from-stone-900/50 dark:to-stone-950/50 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-start gap-3">
              <div className="hidden rounded-2xl bg-gradient-to-br from-secondary-600 to-secondary-800 p-3 text-white shadow-lg sm:block">
                <TrendingUp className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">02 — Trending</span>
                <h2 className="font-display mt-2 flex flex-wrap items-center gap-2 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-4xl">
                  Popular right now
                  <TrendingUp className="h-7 w-7 text-primary-500 sm:hidden" />
                </h2>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Hand-picked from the catalogue — sizes & cart ready.</p>
              </div>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02] dark:bg-white dark:text-stone-900 sm:self-auto"
            >
              See everything
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading && dealProducts.length === 0 ? (
            <SiteLoader message="Loading trending products…" className="py-12" />
          ) : dealProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200/90 py-16 text-center dark:border-white/15">
              <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="text-sm text-stone-500 dark:text-stone-400">Add products in Django admin to fill this row.</p>
            </div>
          ) : (
            <div className="relative">
              {trendingRefreshing ? (
                <div className="pointer-events-none absolute inset-0 z-[1] flex items-start justify-center rounded-2xl bg-white/60 pt-8 backdrop-blur-[2px] dark:bg-stone-950/50">
                  <SiteLoader message="Loading products…" className="py-4" />
                </div>
              ) : null}
              <div
                className={`grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6 ${trendingRefreshing ? 'opacity-60' : ''}`}
              >
                {dealProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selectedSize={selectedSizes[product.id]}
                    onSizeChange={(v) => setSelectedSizes((s) => ({ ...s, [product.id]: v }))}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            </div>
          )}

          <PaginationBar
            className="mt-8"
            currentPage={trendingPage}
            totalPages={trendingTotalPages}
            totalCount={trendingTotalCount}
            pageSize={TRENDING_PER_PAGE}
            onPageChange={setTrendingPage}
          />
        </section>

        {/* Trust band */}
        <section className="relative overflow-hidden rounded-[1.75rem] border border-secondary-500/25 bg-gradient-to-br from-primary-950 via-primary-900 to-secondary-950 p-[1px] shadow-modern">
          <div className="relative rounded-[1.7rem] bg-gradient-to-br from-primary-900/95 via-primary-800/95 to-primary-950 px-6 py-10 sm:px-12 sm:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(184,116,68,0.22),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />
            <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
              {[
                { icon: Tag, title: 'Sharp pricing', desc: 'Deals and offers on brands you already like.' },
                { icon: Truck, title: 'Nationwide reach', desc: 'Reliable shipping with tracking on orders.' },
                { icon: Heart, title: 'Built for shoppers', desc: 'Wishlist, sizes, and a cart that remembers you.' },
              ].map((x) => (
                <div key={x.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <x.icon className="h-6 w-6 text-secondary-300" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{x.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-primary-100/70">{x.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Site sections from Django */}
        <HomeSiteSections />
      </div>
    </div>
  );
};

export default HomePage;
