import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';
import SiteLoader from '../components/SiteLoader';
import ProductSizeSelect from '../components/ProductSizeSelect';
import { buildCartLineId } from '../lib/cartLine';
import { canCallApi, listProducts, listCategories } from '../services/productsApi';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedToCart, setAddedToCart] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    const needSize = Array.isArray(product.sizeVariants) && product.sizeVariants.length > 0;
    const size = needSize ? selectedSizes[product.id] : undefined;
    if (needSize && !String(size || '').trim()) {
      alert('Please select a size.');
      return;
    }
    const ok = addToCart(product, { size: needSize ? size : undefined });
    if (!ok) {
      alert('Could not add to cart — this size may be out of stock.');
      return;
    }
    const lineKey = buildCartLineId(product.id, needSize ? size : null);
    setAddedToCart(lineKey);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'all';
    setSearchQuery(q);
    setActiveCategory(cat === 'all' || !cat ? 'all' : cat);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const catParam = searchParams.get('category') || 'all';
    const qParam = (searchParams.get('q') || '').trim();
    const cat = catParam === 'all' || !catParam ? 'all' : catParam;

    (async () => {
      if (!canCallApi()) {
        setError('no-api');
        setLoading(false);
        setProducts([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [crows, prows] = await Promise.all([
          listCategories(),
          listProducts({
            admin: false,
            category: cat === 'all' ? undefined : cat,
            search: qParam || undefined,
          }),
        ]);
        if (cancelled) return;
        setCategories([
          { id: 'all', name: 'All' },
          ...(crows || []).map((c) => ({ id: c.slug, name: c.name })),
        ]);
        setProducts(
          (prows || []).map((p) => ({
            ...p,
            rating: p.rating != null ? Number(p.rating) : 4.5,
            badge: p.badge || '',
            sizeVariants: p.sizeVariants || p.size_variants || [],
          }))
        );
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const syncUrlFromFilters = (nextQ, nextCat) => {
    const p = new URLSearchParams();
    const q = (nextQ ?? searchQuery).trim();
    const cat = nextCat ?? activeCategory;
    if (q) p.set('q', q);
    if (cat && cat !== 'all') p.set('category', cat);
    setSearchParams(p, { replace: true });
  };

  if (error === 'no-api') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-slate-100 dark:bg-[#0c0a14]">
        <div className="max-w-md text-center rounded-2xl border border-violet-300/60 bg-white p-8 shadow-lg dark:border-violet-500/30 dark:bg-slate-900/80">
          <p className="text-slate-900 dark:text-white font-bold mb-2">API not configured</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Set <code className="text-violet-700 dark:text-violet-300">VITE_API_URL</code> and run Django to browse products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16 dark:bg-[#0c0a14] transition-colors">
      <SEOHead
        title="Products — GoldyMart"
        description="Browse all categories — electronics, fashion, home, machinery & more."
        keywords="online shopping, products, GoldyMart"
        url="https://www.heavytechmachinery.com/products"
      />

      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-100/90 to-fuchsia-100/80 dark:from-violet-900/40 dark:to-fuchsia-900/30 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">All products</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-xs sm:text-sm">
            <Link to="/" className="hover:text-violet-700 dark:hover:text-violet-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-white">Products</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-4 w-full min-w-0">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 sm:p-6 shadow-xl backdrop-blur-xl mb-6 sm:mb-8 dark:bg-slate-900/90 dark:border-white/10 dark:shadow-2xl">
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              syncUrlFromFilters(searchQuery, activeCategory);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="search"
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none dark:bg-slate-800/80 dark:border-white/10 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:opacity-95 transition-opacity shrink-0"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  syncUrlFromFilters(searchQuery, cat.id);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                    : 'border border-slate-200 bg-slate-100 text-slate-700 hover:border-violet-400 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10 dark:hover:border-violet-500/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SiteLoader message="Loading catalogue from server…" />
        ) : error ? (
          <p className="text-center text-red-600 dark:text-red-400 py-16">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 transition-all duration-300 hover:border-violet-400 hover:shadow-lg dark:from-slate-800/90 dark:to-slate-900/90 dark:border-white/10 dark:hover:border-violet-500/40 dark:hover:shadow-xl dark:hover:shadow-violet-500/10"
              >
                <div className="relative aspect-[4/5] bg-slate-100 p-4 dark:bg-slate-950/50">
                  <img
                    src={product.image}
                    alt=""
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-2 py-1 rounded-lg">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="text-amber-400 fill-amber-400 w-3.5 h-3.5" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{product.rating}</span>
                  </div>
                  <h3 className="text-sm text-slate-900 line-clamp-2 min-h-[2.5rem] font-medium leading-snug dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-xs text-violet-600 dark:text-violet-400/80 mt-1 capitalize">{String(product.category || '').replace(/-/g, ' ')}</p>
                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{product.price}</span>
                    <ProductSizeSelect
                      product={product}
                      value={selectedSizes[product.id] || ''}
                      onChange={(v) => setSelectedSizes((s) => ({ ...s, [product.id]: v }))}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                        addedToCart === buildCartLineId(product.id, selectedSizes[product.id] || null)
                          ? 'border border-emerald-500/40 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 hover:from-amber-400 hover:to-orange-400'
                      }`}
                    >
                      {addedToCart === buildCartLineId(product.id, selectedSizes[product.id] || null) ? (
                        <>
                          <Check size={16} /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} /> Add to cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white/80 py-20 text-center dark:border-white/10 dark:bg-slate-900/50">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No products match</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Try another search or category</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-violet-600 font-semibold text-sm hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            Bulk or B2B enquiry
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
