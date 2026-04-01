import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Sparkles,
  Zap,
  Shield,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdBanner from '../components/AdBanner';
import HomeSiteSections from '../components/HomeSiteSections';
import SiteLoader from '../components/SiteLoader';
import SEOHead from '../components/SEOHead';
import { useCart } from '../context/CartContext';
import ProductSizeSelect from '../components/ProductSizeSelect';
import FavoriteButton from '../components/FavoriteButton';
import { canCallApi, listProducts, listCategories } from '../services/productsApi';
import { filterVisibleCategories, REMOVED_CATEGORY_SLUGS } from '../lib/catalogPolicy';

const STORE = 'GoldyMart';

/** Products per page in Trending (matches max columns on large screens). */
const TRENDING_PER_PAGE = 6;

function CategoryIcon({ slug }) {
  const map = {
    electronics: '⚡',
    fashion: '👕',
    'home-kitchen': '🏠',
    beauty: '✨',
    sports: '🏃',
    books: '📚',
    clothes: '👔',
  };
  return <span className="text-2xl">{map[slug] || '🛒'}</span>;
}

const HomePage = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [trendingPage, setTrendingPage] = useState(0);
  const { addToCart } = useCart();

  const trendingTotalPages = Math.max(1, Math.ceil(dealProducts.length / TRENDING_PER_PAGE));
  const trendingSlice = dealProducts.slice(
    trendingPage * TRENDING_PER_PAGE,
    trendingPage * TRENDING_PER_PAGE + TRENDING_PER_PAGE
  );

  useEffect(() => {
    setTrendingPage((p) => Math.min(p, Math.max(0, trendingTotalPages - 1)));
  }, [trendingTotalPages]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canCallApi()) {
        setError('no-api');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [proRes, crows] = await Promise.all([
          listProducts({ admin: false, page: 1, pageSize: 40 }),
          listCategories(),
        ]);
        if (cancelled) return;
        const visibleP = (proRes.results || []).filter(
          (p) => !REMOVED_CATEGORY_SLUGS.has(String(p.category || '').trim())
        );
        setDealProducts(
          visibleP.slice(0, 14).map((p) => ({
            ...p,
            sizeVariants: p.sizeVariants || p.size_variants || [],
          }))
        );
        setCategories(filterVisibleCategories(crows || []).slice(0, 10));
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load');
          setDealProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error === 'no-api') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-stone-100 dark:bg-stone-950">
        <div className="max-w-lg text-center rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50/60 p-10 shadow-card dark:from-emerald-950/50 dark:via-stone-900 dark:to-stone-950 dark:border-emerald-800/40 dark:shadow-2xl">
          <h1 className="text-2xl font-black text-stone-900 dark:text-white mb-3">Backend required</h1>
          <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-6">
            Add <code className="text-emerald-800 dark:text-emerald-300">VITE_API_URL=http://127.0.0.1:8000</code> to{' '}
            <code className="text-emerald-800 dark:text-emerald-300">frontend/.env.development</code>, run{' '}
            <code className="text-emerald-800 dark:text-emerald-300">python manage.py runserver</code>, then restart Vite.
          </p>
          <p className="text-xs text-stone-500">Products, orders & banners are stored in Django + SQLite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-100 text-stone-900 dark:bg-[#0c1210] dark:text-white transition-colors">
      <SEOHead
        title={`${STORE} — Shop electronics, fashion, home & more`}
        description="Premium online store — all categories, secure checkout, pan-India delivery."
        keywords="online shopping, electronics, fashion, home, GoldyMart"
        url="https://www.heavytechmachinery.com/"
      />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(22,101,52,0.14),transparent),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(202,138,4,0.08),transparent)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(22,101,52,0.35),transparent),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(202,138,4,0.12),transparent),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(52,211,153,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-70 dark:bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-60" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-14 sm:pb-20 w-full min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-10">
            <div className="max-w-2xl w-full min-w-0">
              <p className="inline-flex flex-wrap items-center gap-2 text-emerald-800 dark:text-emerald-200/90 text-xs sm:text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Curated deals · Genuine brands · Fast dispatch
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.06] text-stone-900 dark:text-white">
                Everything you love,
                <span className="block mt-1 bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-amber-400 bg-clip-text text-transparent">
                  one premium store
                </span>
              </h1>
              <p className="mt-4 sm:mt-5 text-stone-600 dark:text-stone-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Electronics, fashion, home, beauty & more — powered by a real backend. Your cart stays in-session;
                orders sync to the server at checkout.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 font-bold text-white text-sm sm:text-base shadow-lg shadow-emerald-900/25 hover:shadow-emerald-900/40 hover:scale-[1.02] transition-all"
                >
                  Shop all
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/track-order"
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl border-2 border-stone-300/90 text-stone-800 text-sm sm:text-base font-semibold hover:bg-white/90 hover:border-emerald-200 dark:border-white/20 dark:text-white dark:hover:bg-white/5 transition-colors"
                >
                  Track order
                </Link>
              </div>
            </div>
            <div className="flex gap-4 lg:gap-6 flex-wrap lg:justify-end">
              {[
                { icon: Zap, t: 'Flash deals', s: 'Daily price drops' },
                { icon: Shield, t: 'Secure pay', s: 'UPI & bank' },
                { icon: Truck, t: 'Delivery', s: 'Across India' },
              ].map((x) => (
                <div
                  key={x.t}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white/95 backdrop-blur-md px-4 py-3 min-w-[140px] shadow-soft dark:bg-white/5 dark:border-white/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-600 flex items-center justify-center shadow-sm">
                    <x.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-900 dark:text-white">{x.t}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{x.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-4 pb-12 sm:pb-16 space-y-10 sm:space-y-12 w-full min-w-0">
        <AdBanner />

        {/* Categories */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">Shop by category</h2>
            <Link to="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <SiteLoader message="Loading categories…" className="py-10" />
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 text-center py-8">{error}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to={`/products?category=${encodeURIComponent(c.slug)}`}
                  className="group relative rounded-2xl p-5 bg-gradient-to-br from-white to-stone-50 border border-stone-200/90 hover:border-emerald-400/70 card-hover hover:shadow-card dark:from-stone-800/90 dark:to-stone-900/90 dark:border-white/10 dark:hover:border-emerald-500/40"
                >
                  <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                    <CategoryIcon slug={c.slug} />
                  </div>
                  <p className="font-bold text-stone-900 text-sm leading-tight group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300 transition-colors">
                    {c.name}
                  </p>
                  <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-stone-400 group-hover:text-emerald-700 dark:text-stone-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Deals */}
        <section className="rounded-3xl border border-stone-200/90 bg-gradient-to-br from-white via-stone-50 to-emerald-50/50 p-5 sm:p-8 shadow-card dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/30 dark:border-white/10 dark:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">Trending now</h2>
            <Link to="/products" className="text-sm font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
              See more →
            </Link>
          </div>
          <div className="space-y-5">
            {dealProducts.length === 0 && !loading && (
              <p className="text-stone-500 dark:text-stone-400 text-sm py-8 w-full text-center">No products yet — add some in Django admin or the store dashboard.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {trendingSlice.map((product) => (
              <div
                key={product.id}
                className="min-w-0 rounded-2xl border border-stone-200/90 bg-white overflow-hidden hover:border-emerald-400/70 hover:shadow-card transition-all group dark:bg-stone-800/80 dark:border-white/10 dark:hover:border-emerald-500/35"
              >
                <Link
                  to={`/products?category=${encodeURIComponent(product.category || 'all')}`}
                  className="block"
                >
                  <div className="aspect-square bg-stone-100 p-3 relative dark:bg-stone-900/50">
                    <FavoriteButton
                      product={product}
                      className="absolute top-2 right-2 z-10 bg-white/95 dark:bg-stone-900/95 shadow-sm"
                      size={20}
                    />
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-amber-500 to-emerald-800 text-white px-2 py-0.5 rounded-md shadow-sm">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-stone-800 line-clamp-2 min-h-[2.5rem] font-medium leading-snug dark:text-stone-200">{product.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-stone-500 dark:text-stone-400">{product.rating}</span>
                    </div>
                    <p className="text-base font-black text-stone-900 mt-1 dark:text-white">{product.price}</p>
                  </div>
                </Link>
                <div className="px-3 pb-3 space-y-2">
                  <ProductSizeSelect
                    product={product}
                    value={selectedSizes[product.id] || ''}
                    onChange={(v) => setSelectedSizes((s) => ({ ...s, [product.id]: v }))}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const needSize =
                        Array.isArray(product.sizeVariants) && product.sizeVariants.length > 0;
                      const size = needSize ? selectedSizes[product.id] : undefined;
                      if (needSize && !String(size || '').trim()) {
                        alert('Please select a size.');
                        return;
                      }
                      const ok = addToCart(product, { size: needSize ? size : undefined });
                      if (!ok) alert('Could not add — size may be out of stock.');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 text-xs font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-sm"
                  >
                    <ShoppingCart size={14} />
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
            </div>

            {dealProducts.length > TRENDING_PER_PAGE && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <p className="text-xs text-stone-600 dark:text-stone-400 text-center sm:text-left">
                  Page{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{trendingPage + 1}</span> of{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{trendingTotalPages}</span>
                  <span className="text-stone-500 dark:text-stone-500">
                    {' '}
                    · {dealProducts.length} picks
                  </span>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={trendingPage <= 0}
                    onClick={() => setTrendingPage((p) => Math.max(0, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-white text-stone-800 hover:border-emerald-400/70 disabled:opacity-40 disabled:pointer-events-none dark:bg-stone-800 dark:border-white/10 dark:text-white"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={trendingPage >= trendingTotalPages - 1}
                    onClick={() => setTrendingPage((p) => Math.min(trendingTotalPages - 1, p + 1))}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-white text-stone-800 hover:border-emerald-400/70 disabled:opacity-40 disabled:pointer-events-none dark:bg-stone-800 dark:border-white/10 dark:text-white"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <HomeSiteSections />
      </div>
    </div>
  );
};

export default HomePage;
