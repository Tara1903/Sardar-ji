import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isMonthlySubscriptionProduct } from '../utils/subscription';

const CartContext = createContext(null);
const CART_KEY = 'sardar-ji-cart';
const sanitizeCartItems = (items = []) => items.filter((item) => !isMonthlySubscriptionProduct(item));

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => sanitizeCartItems(JSON.parse(localStorage.getItem(CART_KEY) || '[]')));

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(sanitizeCartItems(items)));
  }, [items]);

  const addToCart = (product) => {
    if (isMonthlySubscriptionProduct(product)) {
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
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
      getItemQuantity,
    }),
    [items],
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
