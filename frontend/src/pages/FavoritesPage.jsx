import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Trash2, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import ProductSizeSelect from '../components/ProductSizeSelect';
import FavoriteButton from '../components/FavoriteButton';

const FavoritesPage = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});

  return (
    <div className="min-h-screen bg-stone-100 pb-16 dark:bg-[#0c1210] transition-colors">
      <SEOHead
        title="Favourites — GoldyMart"
        description="Your saved products"
        keywords="wishlist, favourites, GoldyMart"
        url="https://www.heavytechmachinery.com/favorites"
      />

      <div className="border-b border-stone-200/80 bg-gradient-to-r from-emerald-100/90 via-stone-50 to-amber-50/80 dark:from-emerald-950/50 dark:via-stone-950 dark:to-stone-900 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500 shrink-0" size={32} />
            Favourites
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm">
            <Link to="/" className="hover:text-emerald-800 dark:hover:text-emerald-300">
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold text-sm hover:opacity-95"
            >
              Browse products
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50 dark:from-stone-800/90 dark:to-stone-900/90 dark:border-white/10 shadow-soft"
              >
                <div className="relative aspect-[4/5] bg-stone-100 p-4 dark:bg-stone-950/50">
                  <Link to={`/products?category=${encodeURIComponent(product.category || 'all')}`} className="block h-full">
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <FavoriteButton product={product} className="bg-white/90 dark:bg-stone-900/90 shadow-sm" size={20} />
                    <button
                      type="button"
                      onClick={() => removeFavorite(product.id)}
                      className="inline-flex p-2 rounded-xl bg-white/90 dark:bg-stone-900/90 text-stone-500 hover:text-red-600 shadow-sm"
                      aria-label="Remove from list"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="text-amber-400 fill-amber-400 w-3.5 h-3.5" />
                    <span className="text-xs text-stone-500 dark:text-stone-400">{product.rating}</span>
                  </div>
                  <Link
                    to={`/products?category=${encodeURIComponent(product.category || 'all')}`}
                    className="text-sm text-stone-900 line-clamp-2 min-h-[2.5rem] font-medium leading-snug dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1 capitalize">
                    {String(product.category || '').replace(/-/g, ' ')}
                  </p>
                  <span className="text-lg font-black text-stone-900 dark:text-white mt-2">{product.price}</span>
                  <div className="mt-auto pt-4 flex flex-col gap-2">
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
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 hover:from-amber-400 hover:to-amber-500 transition-all"
                    >
                      <ShoppingCart size={16} /> Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
