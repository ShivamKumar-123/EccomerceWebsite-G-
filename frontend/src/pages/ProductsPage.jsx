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
import LazyImage from '../components/LazyImage';
import ProductFilterSidebar from '../components/ProductFilterSidebar';
import { buildCartLineId, cartLineColorKey } from '../lib/cartLine';
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
import { getProductPriceStack } from '../lib/productPricing';

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
    const lineKey = buildCartLineId(
      product.id,
      needSize ? size : null,
      cartLineColorKey(product, null)
    );
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
        setProducts(prows);
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
      <div className="flex min-h-[60vh] items-center justify-center bg-transparent px-4">
        <div className="max-w-md rounded-3xl border border-white/10 bg-primary-900/95 p-8 text-center shadow-modern backdrop-blur-sm">
          <p className="mb-2 font-bold text-white">API not configured</p>
          <p className="text-sm text-primary-400">
            Set <code className="text-secondary-400">VITE_API_URL</code> and run Django to browse products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24 transition-colors lg:pb-16">
      <SEOHead
        title="Products — Goldy Mart"
        description="Browse with age, gender, brand, size, price & rating filters."
        keywords="online shopping, fashion filters, Goldy Mart"
        url="https://www.goldymart.com/products"
      />

      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(184,116,68,0.14), transparent), radial-gradient(ellipse 60% 50% at 0% 0%, rgba(184,116,68,0.08), transparent)',
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl min-w-0 px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">All products</h1>
          <p className="mt-2 text-xs text-primary-400 sm:text-sm">
            <Link to="/" className="hover:text-secondary-400">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Products</span>
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-4 w-full min-w-0 max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-white/10 bg-primary-900/85 p-4 shadow-modern backdrop-blur-xl sm:mb-8 sm:p-6">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
            onSubmit={(e) => {
              e.preventDefault();
              syncUrlFromFilters(searchQuery, activeCategory);
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
              <input
                type="search"
                placeholder="Search products, brands…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-primary-950 py-3.5 pl-12 pr-4 text-white outline-none placeholder:text-primary-500 focus:border-secondary-500/50 focus:ring-4 focus:ring-secondary-500/15"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-full bg-cta px-8 py-3.5 font-bold text-cta-fg shadow-lg shadow-black/30 transition-all hover:bg-white/90"
            >
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  syncUrlFromFilters(searchQuery, cat.id);
                }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-secondary-500 to-secondary-700 text-primary-950 shadow-md shadow-black/30 ring-2 ring-secondary-400/40'
                    : 'border border-white/15 bg-primary-950 text-primary-400 hover:border-secondary-500/40 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {selectedChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="shrink-0 text-xs font-semibold text-primary-400">Applied:</span>
            {selectedChips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => removeChip(c)}
                className="inline-flex items-center gap-1 rounded-full border border-secondary-500/35 bg-primary-900/60 py-1 pl-2.5 pr-1.5 text-xs font-medium text-white"
              >
                {c.label}
                <X size={14} className="opacity-70" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-1 text-xs font-bold text-primary-400 hover:text-secondary-400"
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
                <div className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    const stack = getProductPriceStack(product);
                    const { showPromo, originalDisplay, finalDisplay, offFromMrp } = stack;
                    const offerPct = Number(product.offerDiscountPercent) || 0;
                    const salePct = Number(product.saleDiscountPercent) || 0;
                    return (
                    <div
                      key={product.id}
                      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-primary-900 to-primary-950 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-500/40 hover:shadow-modern"
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="relative block aspect-[3/4] w-full shrink-0 overflow-hidden bg-primary-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
                      >
                        <FavoriteButton
                          product={product}
                          className="absolute right-1.5 top-1.5 z-10 bg-primary-900/95 shadow-sm ring-1 ring-white/10"
                          size={18}
                        />
                        <LazyImage
                          src={product.image}
                          alt=""
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-2 top-2 z-[1] flex max-w-[min(100%,11rem)] flex-col gap-0.5">
                          {product.badge ? (
                            <span className="w-fit rounded-md bg-gradient-to-r from-secondary-600 to-secondary-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-primary-950 shadow-sm">
                              {product.badge}
                            </span>
                          ) : null}
                          {offerPct > 0 ? (
                            <span className="w-fit rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                              Offer {offerPct}%
                            </span>
                          ) : null}
                          {salePct > 0 ? (
                            <span className="w-fit rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                              Sale {salePct}%
                            </span>
                          ) : null}
                          {offFromMrp > 0 && !offerPct && !salePct ? (
                            <span className="w-fit rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                              {offFromMrp}% off
                            </span>
                          ) : null}
                        </div>
                      </Link>
                      <div className="flex min-h-0 flex-1 flex-col p-3">
                        <Link
                          to={`/product/${product.id}`}
                          className="block shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500/50"
                        >
                          <div className="mb-0.5 flex shrink-0 items-center gap-1">
                            <Star className="h-3 w-3 fill-secondary-400 text-secondary-400" />
                            <span className="text-[11px] text-primary-400">
                              ({product.rating ?? '4.0'})
                            </span>
                            {product.brand ? (
                              <span className="ml-auto max-w-[45%] truncate text-[9px] font-semibold text-primary-500">
                                {product.brand}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="line-clamp-2 h-[2.5rem] shrink-0 overflow-hidden text-xs font-medium leading-snug text-white">
                            {product.name}
                          </h3>
                          <p className="mt-0.5 shrink-0 text-[11px] font-semibold capitalize text-secondary-400">
                            {String(product.category || '').replace(/-/g, ' ')}
                          </p>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-secondary-300 hover:text-white">
                            View details
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                        <div className="min-h-0 flex-1" aria-hidden="true" />
                        <div className="flex shrink-0 flex-col gap-1.5 pt-3">
                          <div className="flex flex-col gap-0.5">
                            {showPromo && originalDisplay ? (
                              <span
                                className="text-xs font-semibold text-primary-400/90"
                                style={{
                                  textDecorationLine: 'line-through underline',
                                  textDecorationThickness: '1px',
                                  textUnderlineOffset: '2px',
                                }}
                              >
                                MRP {originalDisplay}
                              </span>
                            ) : null}
                            <span className="text-base font-black leading-tight text-white">{finalDisplay}</span>
                          </div>
                          <ProductSizeSelect
                            product={product}
                            value={selectedSizes[product.id] || ''}
                            onChange={(v) => setSelectedSizes((s) => ({ ...s, [product.id]: v }))}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-black transition-all ${
                              addedToCart ===
                              buildCartLineId(
                                product.id,
                                selectedSizes[product.id] || null,
                                cartLineColorKey(product, null)
                              )
                                ? 'border border-secondary-500/50 bg-secondary-500/15 text-secondary-300'
                                : 'bg-cta text-cta-fg shadow-md shadow-black/30 ring-1 ring-white/10 hover:bg-white/90'
                            }`}
                          >
                            {addedToCart ===
                            buildCartLineId(
                              product.id,
                              selectedSizes[product.id] || null,
                              cartLineColorKey(product, null)
                            ) ? (
                              <>
                                <Check size={14} /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={14} /> Add to cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {productCount > 0 && (
                  <div className="flex flex-col gap-3 border-t border-white/10 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-primary-400">
                      Showing <span className="font-semibold text-white">{rangeStart}</span>
                      –
                      <span className="font-semibold text-white">{rangeEnd}</span> of{' '}
                      <span className="font-semibold text-white">{productCount}</span>
                    </p>
                    {totalPages > 1 ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() => setCatalogPage(currentPage - 1)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-primary-950 px-3 py-2 text-xs font-bold text-white hover:border-secondary-500/50 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums text-primary-400">
                          Page {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentPage >= totalPages}
                          onClick={() => setCatalogPage(currentPage + 1)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-primary-950 px-3 py-2 text-xs font-bold text-white hover:border-secondary-500/50 disabled:pointer-events-none disabled:opacity-40"
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
              <div className="rounded-3xl border border-white/10 bg-primary-900/85 py-20 text-center shadow-modern backdrop-blur-sm">
                <p className="mb-3 text-4xl">🔍</p>
                <h3 className="mb-2 text-lg font-bold text-white">No products match</h3>
                <p className="mb-4 text-sm text-primary-400">Try adjusting filters or search</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm font-bold text-secondary-400 hover:text-secondary-300"
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-400 hover:text-secondary-300"
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
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-cta-fg shadow-modern shadow-black/40 lg:hidden"
      >
        <SlidersHorizontal size={18} />
        Filters
        {selectedChips.length > 0 && (
          <span className="rounded-full bg-primary-950 px-2 py-0.5 text-xs text-white ring-1 ring-white/20">{selectedChips.length}</span>
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
          <div className="absolute bottom-0 right-0 top-0 w-[min(100%,22rem)] overflow-y-auto overflow-x-hidden bg-primary-950 p-3 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
