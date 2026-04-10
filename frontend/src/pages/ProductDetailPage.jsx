import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingCart, Star } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SiteLoader from '../components/SiteLoader';
import LazyImage from '../components/LazyImage';
import FavoriteButton from '../components/FavoriteButton';
import ProductSizeSelect from '../components/ProductSizeSelect';
import { useCart } from '../context/CartContext';
import { normalizeProductColorSlugs } from '../lib/cartLine';
import { labelForColor, swatchStyleForColor } from '../lib/productFilterConstants';
import { getProductPriceStack } from '../lib/productPricing';
import { canCallApi, fetchProductById } from '../services/productsApi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [added, setAdded] = useState(false);

  const load = useCallback(async () => {
    if (!id || !canCallApi()) {
      setError(!canCallApi() ? 'no-api' : 'invalid');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const p = await fetchProductById(id);
      setProduct(p);
      setActiveImg(0);
      setSize('');
      const slugs = normalizeProductColorSlugs(p);
      setColor(slugs[0] || '');
      setAdded(false);
    } catch (e) {
      setProduct(null);
      setError(e?.code === 'NOT_FOUND' ? 'notfound' : e?.message || 'load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    if (!product) return;
    const slugs = normalizeProductColorSlugs(product);
    if (slugs.length > 1 && !slugs.includes(String(color || '').toLowerCase())) {
      alert('Please select a color.');
      return;
    }
    const ok = addToCart(product, { size: size || undefined, color: color || undefined });
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert('Choose a size if required, or check stock.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <SiteLoader message="Loading product…" />
      </div>
    );
  }

  if (error === 'notfound' || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <SEOHead title="Product not found" />
        <h1 className="text-xl font-bold text-stone-900 dark:text-white">Product not found</h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          This item may have been removed or the link is incorrect.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
      </div>
    );
  }

  if (error === 'no-api') {
    return (
      <p className="px-4 py-16 text-center text-red-600 dark:text-red-400">
        API is not configured. Set VITE_API_URL or run the dev server with a proxy.
      </p>
    );
  }

  const imgs =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const mainSrc = imgs[activeImg] || product.image || '';
  const stack = getProductPriceStack(product);
  const colorSlugs = normalizeProductColorSlugs(product);

  return (
    <>
      <SEOHead title={product.name} description={product.name} image={mainSrc} />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-primary-700 dark:text-stone-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <div className="space-y-3 lg:col-span-4">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:max-w-xs lg:mx-0 lg:max-w-[320px] dark:border-white/10 dark:bg-stone-900">
              {mainSrc ? (
                <LazyImage src={mainSrc} alt="" priority className="h-full w-full object-cover object-center" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-400">No image</div>
              )}
              <FavoriteButton
                product={product}
                className="absolute right-3 top-3 bg-white/95 shadow-md dark:bg-stone-900/95"
                size={22}
              />
            </div>
            {imgs.length > 1 ? (
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {imgs.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-16 ${
                      i === activeImg
                        ? 'border-primary-600 ring-2 ring-primary-500/30'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <LazyImage src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col lg:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">
              <Link to={`/products?category=${encodeURIComponent(product.category || 'all')}`}>
                {String(product.category || '').replace(/-/g, ' ')}
              </Link>
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-stone-900 dark:text-white sm:text-3xl">
              {product.name}
            </h1>
            {product.brand ? (
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{product.brand}</p>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating || 4)
                        ? 'fill-secondary-400 text-secondary-400'
                        : 'text-stone-300 dark:text-stone-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-stone-500">({product.rating ?? '4.0'})</span>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              {stack.showPromo && stack.originalDisplay ? (
                <p
                  className="text-sm font-semibold text-stone-500 dark:text-stone-400"
                  style={{
                    textDecorationLine: 'line-through underline',
                    textDecorationThickness: '1px',
                    textUnderlineOffset: '3px',
                  }}
                >
                  MRP {stack.originalDisplay}
                </p>
              ) : null}
              <p className="text-3xl font-black text-stone-900 dark:text-white">{stack.finalDisplay}</p>
            </div>

            {(product.offerDiscountPercent > 0 || product.saleDiscountPercent > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {product.offerDiscountPercent > 0 ? (
                  <span className="rounded-md bg-amber-600 px-2 py-0.5 text-xs font-black text-white">
                    Offer {product.offerDiscountPercent}%
                  </span>
                ) : null}
                {product.saleDiscountPercent > 0 ? (
                  <span className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-black text-white">
                    Sale {product.saleDiscountPercent}%
                  </span>
                ) : null}
              </div>
            )}

            <div className="mt-8 space-y-4 border-t border-stone-200 pt-6 dark:border-white/10">
              {colorSlugs.length > 0 ? (
                <div>
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Color
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {colorSlugs.map((slug) => {
                      const selected = String(color).toLowerCase() === String(slug).toLowerCase();
                      const sw = swatchStyleForColor(slug);
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => setColor(slug)}
                          title={labelForColor(slug)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl p-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                            selected
                              ? 'ring-2 ring-primary-600 ring-offset-2 ring-offset-[#F8F7F5] dark:ring-offset-stone-900'
                              : 'opacity-90 hover:opacity-100'
                          }`}
                        >
                          <span
                            className="h-11 w-11 rounded-full border-2 border-stone-300 shadow-inner dark:border-stone-500"
                            style={sw}
                          />
                          <span className="max-w-[5rem] text-center text-[10px] font-semibold capitalize text-stone-600 dark:text-stone-300">
                            {labelForColor(slug)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase text-stone-500">Size</span>
                <ProductSizeSelect product={product} value={size} onChange={setSize} />
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className={`flex w-full max-w-md items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black transition-all ${
                  added
                    ? 'border border-secondary-500/50 bg-secondary-500/15 text-secondary-800 dark:text-secondary-300'
                    : 'bg-cta text-cta-fg shadow-lg shadow-black/20 ring-1 ring-white/10 hover:brightness-105 dark:shadow-black/40'
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" /> Add to cart
                  </>
                )}
              </button>
              <Link
                to="/cart"
                className="block text-center text-sm font-semibold text-primary-700 hover:underline dark:text-primary-400"
              >
                View cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
