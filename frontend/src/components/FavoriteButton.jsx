import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

/**
 * @param {{ product: object, className?: string, size?: number }} props
 */
export default function FavoriteButton({ product, className = '', size = 22 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const on = product?.id != null && isFavorite(product.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product);
      }}
      className={`inline-flex items-center justify-center rounded-xl p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        on
          ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/40'
          : 'text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:text-stone-500 dark:hover:bg-white/10'
      } ${className}`}
      aria-label={on ? 'Remove from favourites' : 'Add to favourites'}
      title={on ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Heart
        size={size}
        className={on ? 'fill-red-500 text-red-500' : ''}
        strokeWidth={2}
      />
    </button>
  );
}
