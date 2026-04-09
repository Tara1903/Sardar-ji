import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isMonthlySubscriptionProduct } from '../utils/subscription';
import { trackAddToCart } from '../utils/analytics';
import { triggerNativeHaptic } from '../lib/nativeFeatures';
import {
  buildConfiguredCartItem,
  getProductCartLines,
  getProductCartQuantity,
  normalizeCartItem,
} from '../utils/addons';

const CartContext = createContext(null);
const CART_KEY = 'sardar-ji-cart';

const sanitizeCartItems = (items = []) => items.filter((item) => !isMonthlySubscriptionProduct(item));

const normalizeIncomingCartItems = (items = []) =>
  sanitizeCartItems(items)
    .map(normalizeCartItem)
    .filter((item) => item.id && item.lineId);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() =>
    normalizeIncomingCartItems(JSON.parse(localStorage.getItem(CART_KEY) || '[]')),
  );
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
    localStorage.setItem(CART_KEY, JSON.stringify(normalizeIncomingCartItems(items)));
  }, [items]);

  useEffect(() => {
    const syncCart = (event) => {
      if (event.key !== CART_KEY || !event.newValue) {
        return;
      }

      try {
        setItems(normalizeIncomingCartItems(JSON.parse(event.newValue)));
      } catch {
        // Ignore malformed cart snapshots from older sessions.
      }
    };

    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    },
    [],
  );

  const mergeCartItem = (incomingItem) => {
    const normalizedItem = normalizeCartItem(incomingItem);

    if (isMonthlySubscriptionProduct(normalizedItem)) {
      return;
    }

    trackAddToCart(normalizedItem, normalizedItem.quantity || 1);
    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.lineId === normalizedItem.lineId);

      if (existingIndex >= 0) {
        const nextItems = [...current];
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: nextItems[existingIndex].quantity + normalizedItem.quantity,
        };
        return nextItems;
      }

      return [...current, normalizedItem];
    });

    void triggerNativeHaptic('light');
    showCartToast({
      title: `${normalizedItem.name} added`,
      message:
        normalizedItem.addonSummary
          ? `${normalizedItem.addonSummary} is ready in your cart.`
          : 'Ready in your cart whenever you want to check out.',
    });
  };

  const addToCart = (product, options = {}) => {
    if (isMonthlySubscriptionProduct(product)) {
      return;
    }

    if (options.lineItem) {
      mergeCartItem(options.lineItem);
      return;
    }

    const cartItem = buildConfiguredCartItem({
      product,
      addonGroups: product?.addonGroups || [],
      selection: options.selection || {},
      quantity: options.quantity || 1,
    });

    mergeCartItem(cartItem);
  };

  const updateQuantity = (lineId, quantity) => {
    const existingItem = items.find((item) => item.lineId === lineId);

    if (quantity > Number(existingItem?.quantity || 0) && existingItem) {
      trackAddToCart(existingItem, 1);
    }

    setItems((current) =>
      current
        .map((item) => (item.lineId === lineId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
    void triggerNativeHaptic(quantity > 0 ? 'light' : 'medium');
  };

  const removeFromCart = (lineId) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
    void triggerNativeHaptic('medium');
  };

  const clearCart = () => setItems([]);

  const dismissCartToast = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setCartToast(null);
  };

  const replaceCart = (nextItems = []) => {
    setItems(normalizeIncomingCartItems(nextItems));
  };

  const addItemsToCart = (nextItems = [], { replace = false } = {}) => {
    const normalizedIncomingItems = normalizeIncomingCartItems(nextItems);

    setItems((current) => {
      const merged = replace ? [] : [...current];

      normalizedIncomingItems.forEach((incomingItem) => {
        const existingIndex = merged.findIndex((item) => item.lineId === incomingItem.lineId);

        if (existingIndex >= 0) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            quantity: merged[existingIndex].quantity + incomingItem.quantity,
          };
          return;
        }

        merged.push(incomingItem);
      });

      return merged;
    });

    if (normalizedIncomingItems.length) {
      const firstItem = normalizedIncomingItems[0];
      const addedCount = normalizedIncomingItems.reduce((total, item) => total + item.quantity, 0);

      showCartToast({
        title:
          addedCount > 1 ? `${addedCount} items added` : `${firstItem?.name || 'Item'} added`,
        message: replace ? 'Your cart has been refreshed.' : 'Cart updated successfully.',
      });
    }
  };

  const getItemQuantity = (productId) => getProductCartQuantity(items, productId);
  const getLineQuantity = (lineId) => items.find((item) => item.lineId === lineId)?.quantity || 0;
  const getProductLines = (productId) => getProductCartLines(items, productId);

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
      getLineQuantity,
      getProductLines,
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
