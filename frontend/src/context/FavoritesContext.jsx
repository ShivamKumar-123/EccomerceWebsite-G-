import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const FavoritesContext = createContext();

const FAV_KEY = 'heavytech_favorites';

function readFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('readFavorites', e);
  }
  return [];
}

function writeFavorites(rows) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(rows));
  } catch (e) {
    console.error('writeFavorites', e);
  }
}

function snapshotFromProduct(product) {
  if (!product?.id) return null;
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    badge: product.badge,
    rating: product.rating != null ? Number(product.rating) : 4.5,
    sizeVariants: product.sizeVariants || product.size_variants || [],
  };
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readFavorites());

  useEffect(() => {
    writeFavorites(favorites);
    window.dispatchEvent(new Event('heavytech-favorites-updated'));
  }, [favorites]);

  const toggleFavorite = useCallback((product) => {
    const snap = snapshotFromProduct(product);
    if (!snap) return;
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === snap.id);
      if (exists) return prev.filter((p) => p.id !== snap.id);
      return [...prev, snap];
    });
  }, []);

  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isFavorite = useCallback(
    (productId) => favorites.some((p) => p.id === productId),
    [favorites]
  );

  const value = useMemo(
    () => ({
      favorites,
      favoritesCount: favorites.length,
      toggleFavorite,
      removeFavorite,
      isFavorite,
    }),
    [favorites, toggleFavorite, removeFavorite, isFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
