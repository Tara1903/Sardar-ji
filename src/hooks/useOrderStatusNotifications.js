import { useEffect } from 'react';

const storageKey = (orderId) => `sjfc-order-status-${orderId}`;

export const useOrderStatusNotifications = (order) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !order?.id || !order?.status) {
      return;
    }

    const previousStatus = window.localStorage.getItem(storageKey(order.id));

    if (!previousStatus) {
      window.localStorage.setItem(storageKey(order.id), order.status);
      return;
    }

    if (previousStatus === order.status) {
      return;
    }

    window.localStorage.setItem(storageKey(order.id), order.status);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sardar Ji Food Corner', {
        body: `Order ${order.orderNumber || ''} is now ${order.status}.`.trim(),
      });
    }
  }, [order]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);
};
