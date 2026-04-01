import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Star,
  ShoppingCart,
  Check,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';
import SiteLoader from '../components/SiteLoader';
import ProductSizeSelect from '../components/ProductSizeSelect';
import FavoriteButton from '../components/FavoriteButton';
import ProductFilterSidebar from '../components/ProductFilterSidebar';
import { buildCartLineId } from '../lib/cartLine';
import {
  canCallApi,
  listProducts,
  listCategories,
  fetchProductFilterOptions,
  STOREFRONT_PRODUCT_PAGE_SIZE,
} from '../services/productsApi';
import { filterVisibleCategories, REMOVED_CATEGORY_SLUGS } from '../lib/catalogPolicy';
import {
  labelForAge,
  labelForGender,
  labelForColor,
} from '../lib/productFilterConstants';

function parseComma(sp, key) {
  const v = sp.get(key);
  if (!v) return [];
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

export function filtersFromSearchParams(sp) {
  return {
    ages: parseComma(sp, 'ages'),
    genders: parseComma(sp, 'genders'),
    brands: parseComma(sp, 'brands'),
    colors: parseComma(sp, 'colors'),
    sizes: parseComma(sp, 'sizes'),
    minPrice: sp.get('min_price') || '',
    maxPrice: sp.get('max_price') || '',
    minRating: sp.get('min_rating') || '',
  };
}

function parsePage(sp) {
  const n = parseInt(sp.get('page') || '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/** @param {URLSearchParams} prev @param {ReturnType<typeof filtersFromSearchParams>} nextF @param {number|undefined} pageOverride */
function buildParamsPreservingCatalog(prev, nextF, pageOverride) {
  const p = new URLSearchParams();
  const q = prev.get('q');
  if (q) p.set('q', q);
  const cat = prev.get('category');
  if (cat) p.set('category', cat);
  if (nextF.ages.length) p.set('ages', nextF.ages.join(','));
  if (nextF.genders.length) p.set('genders', nextF.genders.join(','));
  if (nextF.brands.length) p.set('brands', nextF.brands.join(','));
  if (nextF.colors.length) p.set('colors', nextF.colors.join(','));
  if (nextF.sizes.length) p.set('sizes', nextF.sizes.join(','));
  if (String(nextF.minPrice || '').trim()) p.set('min_price', String(nextF.minPrice).trim());
  if (String(nextF.maxPrice || '').trim()) p.set('max_price', String(nextF.maxPrice).trim());
  if (String(nextF.minRating || '').trim()) p.set('min_rating', String(nextF.minRating).trim());
  const page =
    pageOverride !== undefined ? Math.max(1, Math.floor(Number(pageOverride) || 1)) : parsePage(prev);
  if (page > 1) p.set('page', String(page));
  return p;
}

function toggleList(list, id, on) {
  if (on) return list.includes(id) ? list : [...list, id];
  return list.filter((x) => x !== id);
}

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedToCart, setAddedToCart] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  const [facets, setFacets] = useState({ brands: [], sizes: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const gridAnchorRef = useRef(null);
  const { addToCart } = useCart();

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const currentPage = useMemo(() => parsePage(searchParams), [searchParams]);
  const totalPages = Math.max(1, Math.ceil(productCount / STOREFRONT_PRODUCT_PAGE_SIZE));
  const rangeStart = productCount === 0 ? 0 : (currentPage - 1) * STOREFRONT_PRODUCT_PAGE_SIZE + 1;
  const rangeEnd = productCount === 0 ? 0 : Math.min(currentPage * STOREFRONT_PRODUCT_PAGE_SIZE, productCount);

  const patchFilters = useCallback(
    (partial) => {
      setSearchParams((prev) => {
        const f = { ...filtersFromSearchParams(prev), ...partial };
        return buildParamsPreservingCatalog(prev, f, 1);
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setCatalogPage = useCallback(
    (pageNum) => {
      const n = Math.max(1, Math.floor(Number(pageNum) || 1));
      setSearchParams((prev) => {
        const f = filtersFromSearchParams(prev);
        return buildParamsPreservingCatalog(prev, f, n);
      }, { replace: true });
    },
    [setSearchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams();
      if (prev.get('q')) p.set('q', prev.get('q'));
      if (prev.get('category')) p.set('category', prev.get('category'));
      return p;
    }, { replace: true });
  }, [setSearchParams]);

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
    let cat = searchParams.get('category') || 'all';
    if (cat && cat !== 'all' && REMOVED_CATEGORY_SLUGS.has(cat)) {
      const p = new URLSearchParams(searchParams);
      p.delete('category');
      setSearchParams(p, { replace: true });
      cat = 'all';
    }
    setSearchQuery(q);
    setActiveCategory(cat === 'all' || !cat ? 'all' : cat);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    const catParam = searchParams.get('category') || 'all';
    const qParam = (searchParams.get('q') || '').trim();
    let cat = catParam === 'all' || !catParam ? 'all' : catParam;
    if (cat !== 'all' && REMOVED_CATEGORY_SLUGS.has(cat)) {
      cat = 'all';
    }
    const f = filtersFromSearchParams(searchParams);
    const page = parsePage(searchParams);

    (async () => {
      if (!canCallApi()) {
        setError('no-api');
        setLoading(false);
        setProducts([]);
        setProductCount(0);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [crows, proRes, facetData] = await Promise.all([
          listCategories(),
          listProducts({
            admin: false,
            category: cat === 'all' ? undefined : cat,
            search: qParam || undefined,
            ageGroups: f.ages,
            genders: f.genders,
            brands: f.brands,
            colors: f.colors,
            sizes: f.sizes,
            minPrice: f.minPrice,
            maxPrice: f.maxPrice,
            minRating: f.minRating,
            page,
          }),
          fetchProductFilterOptions({
            category: cat === 'all' ? undefined : cat,
            search: qParam || undefined,
          }).catch(() => ({ brands: [], sizes: [], colors: [] })),
        ]);
        if (cancelled) return;
        const vis = filterVisibleCategories(crows || []);
        setCategories([{ id: 'all', name: 'All' }, ...vis.map((c) => ({ id: c.slug, name: c.name }))]);
        setFacets(facetData);
        setProductCount(proRes.count || 0);
        const prows = proRes.results || [];
        setProducts(
          prows.map((p) => ({
            ...p,
            rating: p.rating != null ? Number(p.rating) : 4.5,
            badge: p.badge || '',
            sizeVariants: p.sizeVariants || p.size_variants || [],
          }))
        );
      } catch (e) {
        if (!cancelled && e?.code === 'INVALID_PAGE' && page > 1) {
          setCatalogPage(1);
          return;
        }
        if (!cancelled) {
          setError(e?.message || 'Failed to load');
          setProducts([]);
          setProductCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setCatalogPage]);

  const skipPageScrollRef = useRef(true);
  useEffect(() => {
    if (skipPageScrollRef.current) {
      skipPageScrollRef.current = false;
      return;
    }
    gridAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  const syncUrlFromFilters = (nextQ, nextCat) => {
    setSearchParams((prev) => {
      const f = filtersFromSearchParams(prev);
      const p = new URLSearchParams();
      const q = (nextQ ?? searchQuery).trim();
      const c = nextCat ?? activeCategory;
      if (q) p.set('q', q);
      if (c && c !== 'all') p.set('category', c);
      if (f.ages.length) p.set('ages', f.ages.join(','));
      if (f.genders.length) p.set('genders', f.genders.join(','));
      if (f.brands.length) p.set('brands', f.brands.join(','));
      if (f.colors.length) p.set('colors', f.colors.join(','));
      if (f.sizes.length) p.set('sizes', f.sizes.join(','));
      if (String(f.minPrice || '').trim()) p.set('min_price', String(f.minPrice).trim());
      if (String(f.maxPrice || '').trim()) p.set('max_price', String(f.maxPrice).trim());
      if (String(f.minRating || '').trim()) p.set('min_rating', String(f.minRating).trim());
      return p;
    }, { replace: true });
  };

  const selectedChips = useMemo(() => {
    const chips = [];
    filters.ages.forEach((id) => chips.push({ key: `age-${id}`, group: 'ages', id, label: labelForAge(id) }));
    filters.genders.forEach((id) =>
      chips.push({ key: `gender-${id}`, group: 'genders', id, label: labelForGender(id) })
    );
    filters.brands.forEach((id) => chips.push({ key: `brand-${id}`, group: 'brands', id, label: id }));
    filters.colors.forEach((id) =>
      chips.push({ key: `color-${id}`, group: 'colors', id, label: labelForColor(id) })
    );
    filters.sizes.forEach((id) => chips.push({ key: `size-${id}`, group: 'sizes', id, label: id }));
    if (String(filters.minPrice || '').trim()) {
      chips.push({
        key: 'minp',
        group: 'minPrice',
        id: '',
        label: `Min ₹${filters.minPrice}`,
      });
    }
    if (String(filters.maxPrice || '').trim()) {
      chips.push({
        key: 'maxp',
        group: 'maxPrice',
        id: '',
        label: `Max ₹${filters.maxPrice}`,
      });
    }
    if (String(filters.minRating || '').trim()) {
      chips.push({
        key: 'rating',
        group: 'minRating',
        id: '',
        label: `${filters.minRating}★ & up`,
      });
    }
    return chips;
  }, [filters]);

  const removeChip = (chip) => {
    if (chip.group === 'ages') patchFilters({ ages: filters.ages.filter((x) => x !== chip.id) });
    else if (chip.group === 'genders') patchFilters({ genders: filters.genders.filter((x) => x !== chip.id) });
    else if (chip.group === 'brands') patchFilters({ brands: filters.brands.filter((x) => x !== chip.id) });
    else if (chip.group === 'colors') patchFilters({ colors: filters.colors.filter((x) => x !== chip.id) });
    else if (chip.group === 'sizes') patchFilters({ sizes: filters.sizes.filter((x) => x !== chip.id) });
    else if (chip.group === 'minPrice') patchFilters({ minPrice: '' });
    else if (chip.group === 'maxPrice') patchFilters({ maxPrice: '' });
    else if (chip.group === 'minRating') patchFilters({ minRating: '' });
  };

  const sidebarProps = {
    facets,
    ages: filters.ages,
    genders: filters.genders,
    brands: filters.brands,
    colors: filters.colors,
    sizes: filters.sizes,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    onToggleAge: (id, on) => patchFilters({ ages: toggleList(filters.ages, id, on) }),
    onToggleGender: (id, on) => patchFilters({ genders: toggleList(filters.genders, id, on) }),
    onToggleBrand: (id, on) => patchFilters({ brands: toggleList(filters.brands, id, on) }),
    onToggleColor: (id, on) => patchFilters({ colors: toggleList(filters.colors, id, on) }),
    onToggleSize: (id, on) => patchFilters({ sizes: toggleList(filters.sizes, id, on) }),
    onPriceChange: (field, value) => {
      if (field === 'min') patchFilters({ minPrice: value });
      else patchFilters({ maxPrice: value });
    },
    onRatingChange: (value) => patchFilters({ minRating: value }),
    onClear: clearAllFilters,
  };

  if (error === 'no-api') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-stone-100 dark:bg-[#0c1210]">
        <div className="max-w-md text-center rounded-2xl border border-emerald-200/70 bg-white p-8 shadow-soft dark:border-emerald-800/40 dark:bg-stone-900/80">
          <p className="text-stone-900 dark:text-white font-bold mb-2">API not configured</p>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Set <code className="text-emerald-800 dark:text-emerald-300">VITE_API_URL</code> and run Django to browse products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24 lg:pb-16 dark:bg-[#0c1210] transition-colors">
      <SEOHead
        title="Products — GoldyMart"
        description="Browse with age, gender, brand, size, price & rating filters."
        keywords="online shopping, fashion filters, GoldyMart"
        url="https://www.heavytechmachinery.com/products"
      />

      <div className="border-b border-stone-200/80 bg-gradient-to-r from-emerald-100/90 via-stone-50 to-amber-50/80 dark:from-emerald-950/50 dark:via-stone-950 dark:to-stone-900 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">All products</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-xs sm:text-sm">
            <Link to="/" className="hover:text-emerald-800 dark:hover:text-emerald-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900 dark:text-white">Products</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-4 w-full min-w-0">
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-6 shadow-card backdrop-blur-xl mb-6 sm:mb-8 dark:bg-stone-900/90 dark:border-white/10 dark:shadow-2xl">
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              syncUrlFromFilters(searchQuery, activeCategory);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={20} />
              <input
                type="search"
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent outline-none dark:bg-stone-800/80 dark:border-white/10 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold hover:opacity-95 transition-opacity shrink-0 shadow-md shadow-emerald-900/20"
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
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-900/25'
                    : 'border border-stone-200 bg-stone-100 text-stone-700 hover:border-emerald-400/60 dark:bg-stone-800 dark:text-stone-300 dark:border-white/10 dark:hover:border-emerald-500/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {selectedChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0">Applied:</span>
            {selectedChips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => removeChip(c)}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-medium dark:bg-emerald-900/40 dark:text-emerald-100 border border-emerald-200/80 dark:border-emerald-700/50"
              >
                {c.label}
                <X size={14} className="opacity-70" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-stone-600 hover:text-emerald-800 dark:text-stone-400 dark:hover:text-emerald-300 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <aside className="hidden lg:block w-full lg:w-72 shrink-0 lg:sticky lg:top-24 self-start">
            <ProductFilterSidebar {...sidebarProps} />
          </aside>

          <div className="flex-1 min-w-0 w-full">
            {loading ? (
              <SiteLoader message="Loading catalogue from server…" />
            ) : error ? (
              <p className="text-center text-red-600 dark:text-red-400 py-16">{error}</p>
            ) : (
              <div ref={gridAnchorRef} className="scroll-mt-24 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50 transition-all duration-300 hover:border-emerald-400/70 hover:shadow-card dark:from-stone-800/90 dark:to-stone-900/90 dark:border-white/10 dark:hover:border-emerald-500/35"
                    >
                      <div className="relative aspect-[4/5] bg-stone-100 p-4 dark:bg-stone-950/50">
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
                          <span className="absolute top-3 left-3 text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-emerald-800 text-white px-2 py-1 rounded-lg shadow-sm">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="text-amber-400 fill-amber-400 w-3.5 h-3.5" />
                          <span className="text-xs text-stone-500 dark:text-stone-400">{product.rating}</span>
                          {product.brand ? (
                            <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 ml-auto truncate max-w-[45%]">
                              {product.brand}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-sm text-stone-900 line-clamp-2 min-h-[2.5rem] font-medium leading-snug dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1 capitalize">
                          {String(product.category || '').replace(/-/g, ' ')}
                        </p>
                        <div className="mt-auto pt-4 flex flex-col gap-2">
                          <span className="text-lg font-black text-stone-900 dark:text-white">{product.price}</span>
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

                {productCount > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-stone-200/90 dark:border-white/10">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Showing <span className="font-semibold text-stone-800 dark:text-stone-200">{rangeStart}</span>
                      –
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{rangeEnd}</span> of{' '}
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{productCount}</span>
                    </p>
                    {totalPages > 1 ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() => setCatalogPage(currentPage - 1)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-white text-stone-800 hover:border-emerald-400/70 disabled:opacity-40 disabled:pointer-events-none dark:bg-stone-800 dark:border-white/10 dark:text-white"
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>
                        <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 tabular-nums px-2">
                          Page {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentPage >= totalPages}
                          onClick={() => setCatalogPage(currentPage + 1)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-white text-stone-800 hover:border-emerald-400/70 disabled:opacity-40 disabled:pointer-events-none dark:bg-stone-800 dark:border-white/10 dark:text-white"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="rounded-2xl border border-stone-200/90 bg-white/80 py-20 text-center dark:border-white/10 dark:bg-stone-900/50">
                <p className="text-4xl mb-3">🔍</p>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">No products match</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">Try adjusting filters or search</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-emerald-700 font-semibold text-sm hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Bulk or B2B enquiry
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/30"
      >
        <SlidersHorizontal size={18} />
        Filters
        {selectedChips.length > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{selectedChips.length}</span>
        )}
      </button>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,22rem)] bg-stone-100 dark:bg-stone-950 shadow-2xl overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <ProductFilterSidebar
              {...sidebarProps}
              onCloseMobile={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
