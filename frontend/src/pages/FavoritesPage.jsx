import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Trash2, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import PaginationBar from '../components/PaginationBar';
import LazyImage from '../components/LazyImage';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import ProductSizeSelect from '../components/ProductSizeSelect';
import FavoriteButton from '../components/FavoriteButton';

const FAVORITES_PAGE_SIZE = 8;

const FavoritesPage = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [listPage, setListPage] = useState(1);

  const favTotalPages = Math.max(1, Math.ceil(favorites.length / FAVORITES_PAGE_SIZE));
  const pagedFavorites = useMemo(() => {
    const start = (listPage - 1) * FAVORITES_PAGE_SIZE;
    return favorites.slice(start, start + FAVORITES_PAGE_SIZE);
  }, [favorites, listPage]);

  useEffect(() => {
    setListPage(1);
  }, [favorites.length]);

  useEffect(() => {
    if (listPage > favTotalPages) setListPage(favTotalPages);
  }, [listPage, favTotalPages]);

  return (
    <div className="min-h-screen bg-stone-100 pb-16 dark:bg-dark transition-colors">
      <SEOHead
        title="Favourites — Goldy Mart"
        description="Your saved products"
        keywords="wishlist, favourites, Goldy Mart"
        url="https://www.goldymart.com/favorites"
      />

      <div className="border-b border-stone-200/80 bg-gradient-to-r from-primary-100/90 via-stone-50 to-amber-50/80 dark:from-primary-950/50 dark:via-stone-950 dark:to-stone-900 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500 shrink-0" size={32} />
            Favourites
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm">
            <Link to="/" className="hover:text-primary-800 dark:hover:text-primary-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900 dark:text-white">Favourites</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-4 w-full min-w-0">
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-stone-200/90 bg-white dark:bg-stone-900/80 dark:border-white/10 py-20 text-center shadow-soft">
            <Heart className="mx-auto text-stone-300 dark:text-stone-600 mb-4" size={56} />
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-2">No favourites yet</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">Tap the heart on any product to save it here.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 text-white font-bold text-sm hover:opacity-95"
            >
              Browse products
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {pagedFavorites.map((product) => (
              <div
                key={product.id}
                className="group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50 shadow-soft dark:border-white/10 dark:from-stone-800/90 dark:to-stone-900/90"
              >
                <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-stone-100 dark:bg-stone-950/50">
                  <Link to={`/products?category=${encodeURIComponent(product.category || 'all')}`} className="block h-full">
                    <LazyImage
                      src={product.image}
                      alt=""
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute right-1.5 top-1.5 flex gap-0.5">
                    <FavoriteButton product={product} className="bg-white/90 shadow-sm dark:bg-stone-900/90" size={18} />
                    <button
                      type="button"
                      onClick={() => removeFavorite(product.id)}
                      className="inline-flex rounded-lg bg-white/90 p-1.5 text-stone-500 shadow-sm hover:text-red-600 dark:bg-stone-900/90"
                      aria-label="Remove from list"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col p-3">
                  <div className="mb-0.5 flex shrink-0 items-center gap-1">
                    <Star className="h-3 w-3 fill-secondary-400 text-secondary-400" />
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">{product.rating}</span>
                  </div>
                  <Link
                    to={`/products?category=${encodeURIComponent(product.category || 'all')}`}
                    className="block h-[2.5rem] overflow-hidden text-xs font-medium leading-snug text-stone-900 line-clamp-2 hover:text-primary-700 dark:text-white dark:hover:text-primary-400"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 shrink-0 text-[11px] capitalize text-primary-800 dark:text-primary-300">
                    {String(product.category || '').replace(/-/g, ' ')}
                  </p>
                  <div className="min-h-0 flex-1" aria-hidden="true" />
                  <div className="flex shrink-0 flex-col gap-1.5 pt-2">
                    <span className="text-base font-black text-stone-900 dark:text-white">{product.price}</span>
                    <ProductSizeSelect
                      product={product}
                      value={selectedSizes[product.id] || ''}
                      onChange={(v) => setSelectedSizes((s) => ({ ...s, [product.id]: v }))}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const needSize = Array.isArray(product.sizeVariants) && product.sizeVariants.length > 0;
                        const size = needSize ? selectedSizes[product.id] : undefined;
                        if (needSize && !String(size || '').trim()) {
                          alert('Please select a size.');
                          return;
                        }
                        const ok = addToCart(product, { size: needSize ? size : undefined });
                        if (!ok) alert('Could not add — size may be out of stock.');
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-secondary-600 to-secondary-800 py-2 text-[11px] font-bold text-white ring-1 ring-secondary-400/30 transition-all hover:brightness-105"
                    >
                      <ShoppingCart size={14} /> Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PaginationBar
            className="mt-8"
            currentPage={listPage}
            totalPages={favTotalPages}
            totalCount={favorites.length}
            pageSize={FAVORITES_PAGE_SIZE}
            onPageChange={setListPage}
          />
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
