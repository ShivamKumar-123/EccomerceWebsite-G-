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
} from 'lucide-react';
import AdBanner from '../components/AdBanner';
import HomeSiteSections from '../components/HomeSiteSections';
import SiteLoader from '../components/SiteLoader';
import SEOHead from '../components/SEOHead';
import { useCart } from '../context/CartContext';
import ProductSizeSelect from '../components/ProductSizeSelect';
import { canCallApi, listProducts, listCategories } from '../services/productsApi';

const STORE = 'GoldyMart';

function CategoryIcon({ slug }) {
  const map = {
    electronics: '⚡',
    fashion: '👕',
    'home-kitchen': '🏠',
    beauty: '✨',
    sports: '🏃',
    books: '📚',
    'rice-mills': '🌾',
    'food-processing': '⚙️',
    agriculture: '🚜',
    'water-pumps': '💧',
    industrial: '🏭',
    'spare-parts': '🔧',
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
  const { addToCart } = useCart();

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
        const [prows, crows] = await Promise.all([
          listProducts({ admin: false }),
          listCategories(),
        ]);
        if (cancelled) return;
        setDealProducts(
          (prows || []).slice(0, 14).map((p) => ({
            ...p,
            sizeVariants: p.sizeVariants || p.size_variants || [],
          }))
        );
        setCategories((crows || []).slice(0, 10));
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
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-100 dark:bg-slate-950">
        <div className="max-w-lg text-center rounded-3xl border border-violet-300/60 bg-gradient-to-br from-violet-50 to-slate-100 p-10 shadow-xl dark:from-violet-900/40 dark:to-slate-900 dark:border-violet-500/30 dark:shadow-2xl">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Backend required</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            Add <code className="text-violet-700 dark:text-violet-300">VITE_API_URL=http://127.0.0.1:8000</code> to{' '}
            <code className="text-violet-700 dark:text-violet-300">frontend/.env.development</code>, run{' '}
            <code className="text-violet-700 dark:text-violet-300">python manage.py runserver</code>, then restart Vite.
          </p>
          <p className="text-xs text-slate-500">Products, orders & banners are stored in Django + SQLite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-[#0c0a14] dark:text-white transition-colors">
      <SEOHead
        title={`${STORE} — Shop electronics, fashion, home & more`}
        description="Premium online store — all categories, secure checkout, pan-India delivery."
        keywords="online shopping, electronics, fashion, home, GoldyMart"
        url="https://www.heavytechmachinery.com/"
      />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.18),transparent),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(236,72,153,0.12),transparent)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.45),transparent),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(236,72,153,0.2),transparent),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(34,211,238,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-70 dark:bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-60" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-14 sm:pb-20 w-full min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-10">
            <div className="max-w-2xl w-full min-w-0">
              <p className="inline-flex flex-wrap items-center gap-2 text-violet-700 dark:text-violet-200/90 text-xs sm:text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                Curated deals · Genuine brands · Fast dispatch
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
                Everything you love,
                <span className="block mt-1 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-600 dark:from-fuchsia-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  one premium store
                </span>
              </h1>
              <p className="mt-4 sm:mt-5 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Electronics, fashion, home, beauty & more — powered by a real backend. Your cart stays in-session;
                orders sync to the server at checkout.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white text-sm sm:text-base shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all"
                >
                  Shop all
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/track-order"
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl border border-slate-300 text-slate-800 text-sm sm:text-base font-semibold hover:bg-white/80 dark:border-white/20 dark:text-white dark:hover:bg-white/5 transition-colors"
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
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 min-w-[140px] shadow-sm dark:bg-white/5 dark:border-white/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/80 to-fuchsia-600/80 flex items-center justify-center">
                    <x.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{x.t}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{x.s}</p>
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
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Shop by category</h2>
            <Link to="/products" className="text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1">
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
                  className="group relative rounded-2xl p-5 bg-gradient-to-br from-white to-slate-100 border border-slate-200 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/15 transition-all duration-300 hover:-translate-y-1 dark:from-slate-800/90 dark:to-slate-900/90 dark:border-white/10 dark:hover:border-violet-500/50 dark:hover:shadow-violet-500/10"
                >
                  <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                    <CategoryIcon slug={c.slug} />
                  </div>
                  <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-300 transition-colors">
                    {c.name}
                  </p>
                  <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-400 group-hover:text-violet-600 dark:text-slate-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Deals */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-violet-100/80 p-5 sm:p-8 shadow-xl dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/50 dark:border-white/10 dark:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Trending now</h2>
            <Link to="/products" className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400 dark:hover:text-fuchsia-300">
              See more →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin snap-x">
            {dealProducts.length === 0 && !loading && (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-8 w-full text-center">No products yet — add some in Django admin or the store dashboard.</p>
            )}
            {dealProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[168px] sm:w-[188px] snap-start rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-violet-400 hover:shadow-lg transition-all group dark:bg-slate-800/80 dark:border-white/10 dark:hover:border-violet-500/40 dark:hover:shadow-xl"
              >
                <Link
                  to={`/products?category=${encodeURIComponent(product.category || 'all')}`}
                  className="block"
                >
                  <div className="aspect-square bg-slate-100 p-3 relative dark:bg-slate-900/50">
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-2 py-0.5 rounded-md">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-800 line-clamp-2 min-h-[2.5rem] font-medium leading-snug dark:text-slate-200">{product.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{product.rating}</span>
                    </div>
                    <p className="text-base font-black text-slate-900 mt-1 dark:text-white">{product.price}</p>
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
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 text-xs font-black hover:from-amber-400 hover:to-orange-400 transition-all"
                  >
                    <ShoppingCart size={14} />
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <HomeSiteSections />
      </div>
    </div>
  );
};

export default HomePage;
