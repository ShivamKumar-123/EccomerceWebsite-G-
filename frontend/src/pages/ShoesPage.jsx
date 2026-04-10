import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Star,
  ShoppingCart,
  Check,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';
import SiteLoader from '../components/SiteLoader';
import ProductSizeSelect from '../components/ProductSizeSelect';
import FavoriteButton from '../components/FavoriteButton';
import LazyImage from '../components/LazyImage';
import ShoeFilterSidebar from '../components/ShoeFilterSidebar';
import { buildCartLineId, cartLineColorKey } from '../lib/cartLine';
import {
  canCallApi,
  listProducts,
  fetchShoeFilterOptions,
  STOREFRONT_PRODUCT_PAGE_SIZE,
} from '../services/productsApi';
import {
  labelShoeType,
  labelShoeAge,
  labelShoeGender,
  labelShoeColor,
  DISCOUNT_TIER_OPTIONS,
  SORT_OPTIONS,
} from '../lib/shoeConstants';
import { getProductPriceStack } from '../lib/productPricing';

function parseComma(sp, key) {
  const v = sp.get(key);
  if (!v) return [];
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

function filtersFromSP(sp) {
  return {
    types: parseComma(sp, 'types'),
    ages: parseComma(sp, 'ages'),
    genders: parseComma(sp, 'genders'),
    brands: parseComma(sp, 'brands'),
    colors: parseComma(sp, 'colors'),
    sizes: parseComma(sp, 'sizes'),
    discounts: parseComma(sp, 'discounts'),
    minPrice: sp.get('min_price') || '',
    maxPrice: sp.get('max_price') || '',
    minRating: sp.get('min_rating') || '',
    ordering: sp.get('ordering') || '',
    q: sp.get('q') || '',
  };
}

function parsePage(sp) {
  const n = parseInt(sp.get('page') || '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function buildParams(prev, nextF, pageOverride) {
  const p = new URLSearchParams();
  const q = String(nextF.q ?? prev.get('q') ?? '').trim();
  if (q) p.set('q', q);
  if (nextF.types.length) p.set('types', nextF.types.join(','));
  if (nextF.ages.length) p.set('ages', nextF.ages.join(','));
  if (nextF.genders.length) p.set('genders', nextF.genders.join(','));
  if (nextF.brands.length) p.set('brands', nextF.brands.join(','));
  if (nextF.colors.length) p.set('colors', nextF.colors.join(','));
  if (nextF.sizes.length) p.set('sizes', nextF.sizes.join(','));
  if (nextF.discounts.length) p.set('discounts', nextF.discounts.join(','));
  if (String(nextF.minPrice || '').trim()) p.set('min_price', String(nextF.minPrice).trim());
  if (String(nextF.maxPrice || '').trim()) p.set('max_price', String(nextF.maxPrice).trim());
  if (String(nextF.minRating || '').trim()) p.set('min_rating', String(nextF.minRating).trim());
  if (String(nextF.ordering || '').trim()) p.set('ordering', String(nextF.ordering).trim());
  const page = pageOverride !== undefined ? Math.max(1, Math.floor(Number(pageOverride) || 1)) : parsePage(prev);
  if (page > 1) p.set('page', String(page));
  return p;
}

function toggleList(list, id, on) {
  if (on) return list.includes(id) ? list : [...list, id];
  return list.filter((x) => x !== id);
}

const ShoesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [facets, setFacets] = useState({
    brands: [],
    sizes: [],
    colors: [],
    priceMin: null,
    priceMax: null,
    shoeTypes: [],
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [addedToCart, setAddedToCart] = useState(null);
  const [priceSlider, setPriceSlider] = useState({ min: 0, max: 20000 });
  const priceDebounceRef = useRef(null);
  const gridAnchorRef = useRef(null);
  const { addToCart } = useCart();

  const f = useMemo(() => filtersFromSP(searchParams), [searchParams]);
  const currentPage = useMemo(() => parsePage(searchParams), [searchParams]);
  const totalPages = Math.max(1, Math.ceil(productCount / STOREFRONT_PRODUCT_PAGE_SIZE));
  const rangeStart = productCount === 0 ? 0 : (currentPage - 1) * STOREFRONT_PRODUCT_PAGE_SIZE + 1;
  const rangeEnd = productCount === 0 ? 0 : Math.min(currentPage * STOREFRONT_PRODUCT_PAGE_SIZE, productCount);

  const bounds = useMemo(() => {
    const lo = facets.priceMin != null ? Math.floor(Number(facets.priceMin)) : 0;
    const hi = facets.priceMax != null ? Math.ceil(Number(facets.priceMax)) : 20000;
    return { min: lo, max: Math.max(lo + 1, hi) };
  }, [facets.priceMin, facets.priceMax]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const minP = f.minPrice ? Number(f.minPrice) : bounds.min;
    const maxP = f.maxPrice ? Number(f.maxPrice) : bounds.max;
    if (!f.minPrice && !f.maxPrice && bounds.max > bounds.min) {
      setPriceSlider({ min: bounds.min, max: bounds.max });
    } else if (Number.isFinite(minP) && Number.isFinite(maxP)) {
      setPriceSlider({
        min: Math.min(Math.max(minP, bounds.min), bounds.max),
        max: Math.min(Math.max(maxP, bounds.min), bounds.max),
      });
    }
  }, [bounds.min, bounds.max, f.minPrice, f.maxPrice, searchParams]);

  const patchFilters = useCallback(
    (partial) => {
      setSearchParams((prev) => {
        const cur = filtersFromSP(prev);
        const next = { ...cur, ...partial };
        return buildParams(prev, next, 1);
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setCatalogPage = useCallback(
    (pageNum) => {
      const n = Math.max(1, Math.floor(Number(pageNum) || 1));
      setSearchParams((prev) => buildParams(prev, filtersFromSP(prev), n), { replace: true });
    },
    [setSearchParams]
  );

  const clearAll = useCallback(() => {
    setSearchParams({}, { replace: true });
    setPriceSlider({ min: bounds.min, max: bounds.max });
  }, [setSearchParams, bounds.min, bounds.max]);

  const flushPriceToUrl = useCallback(
    (minV, maxV) => {
      const lo = Math.min(minV, maxV);
      const hi = Math.max(minV, maxV);
      patchFilters({
        minPrice: lo <= bounds.min ? '' : String(lo),
        maxPrice: hi >= bounds.max ? '' : String(hi),
      });
    },
    [patchFilters, bounds.min, bounds.max]
  );

  const onPriceSlider = useCallback(
    (minV, maxV) => {
      setPriceSlider({ min: minV, max: maxV });
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
      priceDebounceRef.current = setTimeout(() => flushPriceToUrl(minV, maxV), 380);
    },
    [flushPriceToUrl]
  );

  useEffect(() => {
    let cancelled = false;
    const page = parsePage(searchParams);
    const filt = filtersFromSP(searchParams);
    const qParam = (filt.q || '').trim();

    (async () => {
      if (!canCallApi()) {
        setError('no-api');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [proRes, opt] = await Promise.all([
          listProducts({
            footwear: true,
            categories: filt.types.length ? filt.types : undefined,
            search: qParam || undefined,
            ageGroups: filt.ages,
            genders: filt.genders,
            brands: filt.brands,
            colors: filt.colors,
            sizes: filt.sizes,
            minPrice: filt.minPrice,
            maxPrice: filt.maxPrice,
            minRating: filt.minRating,
            discounts: filt.discounts,
            ordering: filt.ordering || undefined,
            page,
          }),
          fetchShoeFilterOptions({ search: qParam || undefined }).catch(() => ({
            brands: [],
            sizes: [],
            colors: [],
            priceMin: null,
            priceMax: null,
            count: 0,
            shoeTypes: [],
          })),
        ]);
        if (cancelled) return;
        setFacets(opt);
        setProductCount(proRes.count || 0);
        const rows = proRes.results || [];
        if (page > 1 && rows.length === 0 && (proRes.count || 0) > 0) {
          setCatalogPage(1);
          return;
        }
        setProducts(rows);
      } catch (e) {
        if (!cancelled) {
          if (e?.code === 'INVALID_PAGE' && page > 1) {
            setCatalogPage(1);
            return;
          }
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

  const chips = useMemo(() => {
    const c = [];
    f.types.forEach((id) => c.push({ key: `t-${id}`, remove: () => patchFilters({ types: f.types.filter((x) => x !== id) }), label: labelShoeType(id) }));
    f.genders.forEach((id) =>
      c.push({ key: `g-${id}`, remove: () => patchFilters({ genders: f.genders.filter((x) => x !== id) }), label: labelShoeGender(id) })
    );
    f.ages.forEach((id) => c.push({ key: `a-${id}`, remove: () => patchFilters({ ages: f.ages.filter((x) => x !== id) }), label: labelShoeAge(id) }));
    f.brands.forEach((id) => c.push({ key: `b-${id}`, remove: () => patchFilters({ brands: f.brands.filter((x) => x !== id) }), label: id }));
    f.colors.forEach((id) =>
      c.push({ key: `c-${id}`, remove: () => patchFilters({ colors: f.colors.filter((x) => x !== id) }), label: labelShoeColor(id) })
    );
    f.sizes.forEach((id) => c.push({ key: `s-${id}`, remove: () => patchFilters({ sizes: f.sizes.filter((x) => x !== id) }), label: id }));
    f.discounts.forEach((id) => {
      const lab = DISCOUNT_TIER_OPTIONS.find((d) => d.id === id)?.label || id;
      c.push({ key: `d-${id}`, remove: () => patchFilters({ discounts: f.discounts.filter((x) => x !== id) }), label: lab });
    });
    if (String(f.minPrice || '').trim() || String(f.maxPrice || '').trim()) {
      c.push({
        key: 'price',
        remove: () => patchFilters({ minPrice: '', maxPrice: '' }),
        label: `₹${f.minPrice || bounds.min} – ₹${f.maxPrice || bounds.max}`,
      });
    }
    if (f.minRating) c.push({ key: 'r', remove: () => patchFilters({ minRating: '' }), label: `${f.minRating}★ & up` });
    if (f.ordering) {
      const lab = SORT_OPTIONS.find((s) => s.id === f.ordering)?.label || f.ordering;
      c.push({ key: 'sort', remove: () => patchFilters({ ordering: '' }), label: lab });
    }
    return c;
  }, [f, patchFilters, bounds.min, bounds.max]);

  const sidebarProps = {
    facets: { brands: facets.brands, sizes: facets.sizes, colors: facets.colors },
    bounds,
    types: f.types,
    genders: f.genders,
    ages: f.ages,
    brands: f.brands,
    colors: f.colors,
    sizes: f.sizes,
    discounts: f.discounts,
    minRating: f.minRating,
    ordering: f.ordering,
    priceSliderMin: priceSlider.min,
    priceSliderMax: priceSlider.max,
    onToggleType: (id, on) => patchFilters({ types: toggleList(f.types, id, on) }),
    onToggleGender: (id, on) => patchFilters({ genders: toggleList(f.genders, id, on) }),
    onToggleAge: (id, on) => patchFilters({ ages: toggleList(f.ages, id, on) }),
    onToggleBrand: (id, on) => patchFilters({ brands: toggleList(f.brands, id, on) }),
    onToggleColor: (id, on) => patchFilters({ colors: toggleList(f.colors, id, on) }),
    onToggleSize: (id, on) => patchFilters({ sizes: toggleList(f.sizes, id, on) }),
    onToggleDiscount: (id, on) => patchFilters({ discounts: toggleList(f.discounts, id, on) }),
    onPriceSlider,
    onRatingChange: (v) => patchFilters({ minRating: v }),
    onSortChange: (v) => patchFilters({ ordering: v }),
    onClear: clearAll,
  };

  const skipPageScrollRef = useRef(true);
  useEffect(() => {
    if (skipPageScrollRef.current) {
      skipPageScrollRef.current = false;
      return;
    }
    gridAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  if (error === 'no-api') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-transparent px-4 dark:bg-transparent">
        <p className="text-stone-600 dark:text-stone-400 text-sm text-center">Configure API URL and run Django to browse footwear.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24 transition-colors lg:pb-12 dark:bg-transparent">
      <SEOHead
        title="Footwear — Goldy Mart"
        description="Filter shoes by type, brand, size, price, color, discount & rating."
        keywords="shoes, sneakers, footwear, filters, Goldy Mart"
        url="https://www.goldymart.com/shoes"
      />

      <div className="relative overflow-hidden border-b border-stone-200/70 bg-gradient-to-br from-white/90 via-primary-50/50 to-amber-50/40 dark:border-white/10 dark:from-[#12162a]/90 dark:via-primary-950/30 dark:to-stone-950/90">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(251,191,36,0.1),transparent)]" />
        <div className="relative mx-auto w-full max-w-7xl min-w-0 px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-4xl md:text-[2.75rem]">Footwear</h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            <Link to="/" className="hover:text-primary-800 dark:hover:text-primary-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900 dark:text-white">Shoes</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-4 w-full min-w-0">
        <form
          className="mb-6 flex flex-col gap-3 rounded-3xl border border-stone-200/80 bg-white/85 p-4 shadow-modern backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/70 sm:flex-row sm:items-stretch"
          onSubmit={(e) => {
            e.preventDefault();
            setSearchParams((prev) => buildParams(prev, { ...filtersFromSP(prev), q: searchQuery.trim() }, 1), { replace: true });
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shoes, brands…"
              className="w-full rounded-full border border-stone-200 bg-stone-50/90 py-3 pl-11 pr-3 text-sm text-stone-900 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 dark:border-white/10 dark:bg-stone-800/80 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-700 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary-900/20 transition-all hover:brightness-105"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {loading ? (
              'Loading…'
            ) : (
              <>
                <span className="font-bold text-stone-900 dark:text-white">{productCount}</span> shoes match your filters
                {facets.count > 0 && productCount !== facets.count ? (
                  <span className="text-stone-500 dark:text-stone-500"> · {facets.count} in catalogue (unfiltered)</span>
                ) : null}
              </>
            )}
          </p>
          <Link to="/products" className="text-sm font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-400">
            All categories →
          </Link>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Applied:</span>
            {chips.map((ch) => (
              <button
                key={ch.key}
                type="button"
                onClick={ch.remove}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary-100 text-primary-900 text-xs font-medium dark:bg-primary-900/40 dark:text-primary-100 border border-primary-200/80 dark:border-primary-700/50"
              >
                {ch.label}
                <X size={14} className="opacity-70" />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-primary-700">
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <aside className="hidden lg:block w-full lg:w-80 shrink-0 lg:sticky lg:top-24 self-start">
            <ShoeFilterSidebar {...sidebarProps} />
          </aside>

          <div className="flex-1 min-w-0 w-full">
            {loading ? (
              <SiteLoader message="Loading footwear…" />
            ) : error ? (
              <p className="text-center text-red-600 py-12">{error}</p>
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
                      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary-400/60 hover:shadow-modern dark:border-white/10 dark:bg-stone-800/90"
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="relative block aspect-[3/4] w-full shrink-0 overflow-hidden bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:bg-stone-950/50"
                      >
                        <FavoriteButton
                          product={product}
                          className="absolute right-1.5 top-1.5 z-10 bg-white/95 dark:bg-stone-900/95"
                          size={18}
                        />
                        <LazyImage
                          src={product.image}
                          alt=""
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-2 top-2 z-[1] flex max-w-[min(100%,11rem)] flex-col gap-0.5">
                          {product.badge ? (
                            <span className="w-fit rounded-md bg-gradient-to-r from-primary-700 to-secondary-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                              {product.badge}
                            </span>
                          ) : null}
                          {offerPct > 0 ? (
                            <span className="w-fit rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                              Offer {offerPct}%
                            </span>
                          ) : null}
                          {salePct > 0 ? (
                            <span className="w-fit rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                              Sale {salePct}%
                            </span>
                          ) : null}
                          {offFromMrp > 0 && !offerPct && !salePct ? (
                            <span className="w-fit rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                              {offFromMrp}% off
                            </span>
                          ) : null}
                        </div>
                      </Link>
                      <div className="flex min-h-0 flex-1 flex-col p-3">
                        <Link
                          to={`/product/${product.id}`}
                          className="block shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                        >
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">
                            {labelShoeType(product.category)}
                          </p>
                          <div className="mb-0.5 mt-0.5 flex shrink-0 items-center gap-1">
                            <Star className="h-3 w-3 fill-secondary-400 text-secondary-400" />
                            <span className="text-[11px] text-stone-500">{product.rating}</span>
                            {product.brand ? (
                              <span className="ml-auto max-w-[40%] truncate text-[9px] text-stone-400">{product.brand}</span>
                            ) : null}
                          </div>
                          <h3 className="h-[2.5rem] overflow-hidden text-xs font-medium leading-snug text-stone-900 line-clamp-2 dark:text-white">
                            {product.name}
                          </h3>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 hover:text-primary-600 dark:text-primary-400">
                            View details
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                        <div className="min-h-0 flex-1" aria-hidden="true" />
                        <div className="flex shrink-0 flex-col gap-1.5 pt-2">
                          <div className="flex flex-col gap-0.5">
                            {showPromo && originalDisplay ? (
                              <p
                                className="text-xs font-semibold text-stone-500 dark:text-stone-400"
                                style={{
                                  textDecorationLine: 'line-through underline',
                                  textDecorationThickness: '1px',
                                  textUnderlineOffset: '2px',
                                }}
                              >
                                MRP {originalDisplay}
                              </p>
                            ) : null}
                            <p className="text-base font-black text-stone-900 dark:text-white">{finalDisplay}</p>
                          </div>
                          <ProductSizeSelect
                            product={product}
                            value={selectedSizes[product.id] || ''}
                            onChange={(v) => setSelectedSizes((s) => ({ ...s, [product.id]: v }))}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-black ${
                              addedToCart ===
                              buildCartLineId(
                                product.id,
                                selectedSizes[product.id] || null,
                                cartLineColorKey(product, null)
                              )
                                ? 'border border-primary-500/40 bg-primary-100 text-primary-800 dark:bg-primary-500/20'
                                : 'bg-cta text-cta-fg shadow-lg shadow-black/30 ring-1 ring-white/10 hover:bg-white/90'
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-stone-200 dark:border-white/10">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Showing {rangeStart}–{rangeEnd} of {productCount}
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() => setCatalogPage(currentPage - 1)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-white dark:bg-stone-800 dark:border-white/10 disabled:opacity-40"
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-xs font-semibold tabular-nums px-2">
                          Page {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentPage >= totalPages}
                          onClick={() => setCatalogPage(currentPage + 1)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 bg-white dark:bg-stone-800 dark:border-white/10 disabled:opacity-40"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!loading && products.length === 0 && (
                  <div className="text-center py-16 rounded-2xl border border-dashed border-stone-300 dark:border-white/20">
                    <p className="text-stone-600 dark:text-stone-400 mb-3">No shoes match these filters.</p>
                    <button type="button" onClick={clearAll} className="text-primary-700 font-bold text-sm dark:text-primary-400">
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-primary-700 text-white font-bold text-sm shadow-lg"
      >
        <SlidersHorizontal size={18} />
        Filters
        {chips.length > 0 && <span className="bg-white/20 px-2 rounded-full text-xs">{chips.length}</span>}
      </button>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,24rem)] bg-stone-100 dark:bg-stone-950 shadow-2xl overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ShoeFilterSidebar {...sidebarProps} onCloseMobile={() => setMobileFiltersOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoesPage;
