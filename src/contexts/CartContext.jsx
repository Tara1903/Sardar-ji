import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isMonthlySubscriptionProduct } from '../utils/subscription';
import { trackAddToCart } from '../utils/analytics';

const CartContext = createContext(null);
const CART_KEY = 'sardar-ji-cart';
const sanitizeCartItems = (items = []) => items.filter((item) => !isMonthlySubscriptionProduct(item));
const normalizeCartItem = (item = {}) => ({
  ...item,
  quantity: Math.max(1, Number(item.quantity || 1)),
});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => sanitizeCartItems(JSON.parse(localStorage.getItem(CART_KEY) || '[]')));
  const [cartToast, setCartToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showCartToast = (payload) => {
    setCartToast({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...payload,
    });

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setCartToast(null);
    }, 2400);
  };

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(sanitizeCartItems(items)));
  }, [items]);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    },
    [],
  );

  const addToCart = (product) => {
    if (isMonthlySubscriptionProduct(product)) {
      return;
    }

    trackAddToCart(product, 1);
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
    showCartToast({
      title: `${product.name} added`,
      message: 'Ready in your cart whenever you want to check out.',
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity > (items.find((item) => item.id === id)?.quantity || 0)) {
      const item = items.find((entry) => entry.id === id);
      if (item) {
        trackAddToCart(item, 1);
      }
    }

    setItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const dismissCartToast = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setCartToast(null);
  };

  const replaceCart = (nextItems = []) => {
    setItems(sanitizeCartItems(nextItems).map(normalizeCartItem));
  };

  const addItemsToCart = (nextItems = [], { replace = false } = {}) => {
    setItems((current) => {
      const baseItems = replace ? [] : [...current];
      const merged = [...baseItems];

      sanitizeCartItems(nextItems).forEach((incomingItem) => {
        const normalizedItem = normalizeCartItem(incomingItem);
        const existingIndex = merged.findIndex((item) => item.id === normalizedItem.id);

        if (existingIndex >= 0) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            quantity: merged[existingIndex].quantity + normalizedItem.quantity,
          };
          return;
        }

        merged.push(normalizedItem);
      });

      return merged;
    });

    if (nextItems.length) {
      const firstItem = nextItems[0];
      const addedCount = sanitizeCartItems(nextItems).reduce(
        (total, item) => total + normalizeCartItem(item).quantity,
        0,
      );

      showCartToast({
        title:
          addedCount > 1
            ? `${addedCount} items added`
            : `${firstItem?.name || 'Item'} added`,
        message: replace ? 'Your cart has been refreshed.' : 'Cart updated successfully.',
      });
    }
  };

  const getItemQuantity = (id) => items.find((item) => item.id === id)?.quantity || 0;

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      replaceCart,
      addItemsToCart,
      getItemQuantity,
      cartToast,
      dismissCartToast,
    }),
    [cartToast, items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
};
