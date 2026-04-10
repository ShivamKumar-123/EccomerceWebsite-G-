import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { canCallApi } from '../services/productsApi';
import * as ops from '../services/operationsApi';
import { buildCartLineId, stockForLine, normalizeCartArray } from '../lib/cartLine';
import { effectiveSizeVariantsForProduct } from '../lib/productSizeDefaults';

const CartContext = createContext();

const CART_KEY = 'goldymart_cart';

function cartStorage() {
  return typeof sessionStorage !== 'undefined' ? sessionStorage : localStorage;
}

function readCartFromStorage() {
  try {
    const raw = cartStorage().getItem(CART_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading cart:', e);
  }
  return [];
}

function writeCartToStorage(data) {
  try {
    cartStorage().setItem(CART_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => normalizeCartArray(readCartFromStorage()));
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    writeCartToStorage(cartItems);
  }, [cartItems]);

  const refreshOrders = useCallback(async () => {
    if (!canCallApi()) {
      setOrders([]);
      return;
    }
    try {
      const cur = localStorage.getItem('goldymart_current_user');
      const uid = cur ? JSON.parse(cur).id : null;
      if (uid) {
        const list = await ops.listOrdersByUserId(uid);
        setOrders(list);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('refreshOrders API:', e);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    const onAuth = () => {
      refreshOrders();
    };
    window.addEventListener('goldymart-auth-changed', onAuth);
    return () => window.removeEventListener('goldymart-auth-changed', onAuth);
  }, [refreshOrders]);

  useEffect(() => {
    const onLogout = () => {
      setCartItems([]);
      writeCartToStorage([]);
    };
    window.addEventListener('goldymart-logout-cart', onLogout);
    return () => window.removeEventListener('goldymart-logout-cart', onLogout);
  }, []);

  /**
   * @param {object} product
   * @param {{ size?: string, quantity?: number, color?: string }} [opts]
   * @returns {boolean} false if size required but missing, or no stock
   */
  const addToCart = (product, opts = {}) => {
    const { size, quantity = 1, color } = opts;
    const variants = effectiveSizeVariantsForProduct(product);
    const needSize = variants.length > 0;
    const chosen = needSize ? String(size || '').trim() : '';

    if (needSize && !chosen) return false;

    const rawCols = Array.isArray(product.colors) ? product.colors : [];
    const colorSlugs = [
      ...new Set(
        rawCols
          .map((c) => String(c || '').trim().toLowerCase().replace(/\s+/g, '_'))
          .filter(Boolean)
      ),
    ];
    const multiColor = colorSlugs.length > 1;
    const fromOpt = String(color || '').trim().toLowerCase().replace(/\s+/g, '_');
    const chosenColor = multiColor
      ? fromOpt && colorSlugs.includes(fromOpt)
        ? fromOpt
        : colorSlugs[0]
      : colorSlugs[0]
        ? colorSlugs[0]
        : '';

    const colorForLineId = multiColor ? chosenColor : null;
    const selectedColorForItem = colorSlugs.length ? (multiColor ? chosenColor : colorSlugs[0]) : null;

    const maxStock = stockForLine({
      ...product,
      sizeVariants: variants,
      selectedSize: needSize ? chosen : null,
    });
    if (maxStock <= 0) return false;

    setCartItems((prev) => {
      const lineId = buildCartLineId(product.id, needSize ? chosen : null, colorForLineId);
      const existingItem = prev.find((item) => item.lineId === lineId);
      const baseQty = existingItem?.quantity || 0;
      const addQ = Math.min(quantity, maxStock - baseQty);
      if (addQ <= 0) return prev;

      let newCart;
      if (existingItem) {
        newCart = prev.map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: Math.min(item.quantity + addQ, maxStock) }
            : item
        );
      } else {
        newCart = [
          ...prev,
          {
            ...product,
            sizeVariants: variants,
            lineId,
            selectedSize: needSize ? chosen : null,
            selectedColor: selectedColorForItem,
            quantity: addQ,
          },
        ];
      }
      writeCartToStorage(newCart);
      return newCart;
    });
    return true;
  };

  const removeFromCart = (lineId) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.lineId !== lineId);
      writeCartToStorage(newCart);
      return newCart;
    });
  };

  const updateQuantity = (lineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setCartItems((prev) => {
      const item = prev.find((i) => i.lineId === lineId);
      if (!item) return prev;
      const maxStock = stockForLine(item);
      const q = maxStock > 0 ? Math.min(quantity, maxStock) : quantity;
      const newCart = prev.map((i) => (i.lineId === lineId ? { ...i, quantity: q } : i));
      writeCartToStorage(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    writeCartToStorage([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseInt(String(item.price || '0').replace(/[₹,]/g, ''), 10);
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const createOrder = () => {
    console.warn('createOrder: use checkout + createOrderApi');
    return null;
  };

  const updateOrderStatus = () => {};

  const deleteOrder = () => {};

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        refreshOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
