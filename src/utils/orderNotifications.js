export const ADMIN_NEW_ORDER_EVENT = 'sjfc:admin-order-insert';

export const ORDER_STATUS_NOTIFICATION_MESSAGES = Object.freeze({
  Preparing: 'Your order is being prepared 👨‍🍳',
  'Out for Delivery': 'Your order is nearby 🚚',
  Delivered: 'Your order has been delivered 🎉',
});

export const getOrderStatusNotificationMessage = (status = '') =>
  ORDER_STATUS_NOTIFICATION_MESSAGES[String(status || '').trim()] || null;

export const buildOrderStatusNotification = ({ orderId = '', orderNumber = '', status = '' } = {}) => {
  const message = getOrderStatusNotificationMessage(status);

  if (!message) {
    return null;
  }

  return {
    title: status === 'Delivered' ? 'Order delivered' : 'Order update',
    message,
    orderId,
    orderNumber,
    status,
    url: orderId ? `/track/${orderId}` : '/profile',
  };
};

export const normalizeRealtimeOrderPreview = (row = {}) => ({
  id: row.id || '',
  orderNumber: row.order_number || row.orderNumber || '',
  userId: row.user_id || row.userId || '',
  customerName: row.customer_name || row.customerName || 'A customer',
  status: row.status || 'Order Placed',
  total: Number(row.total || 0),
  createdAt: row.created_at || row.createdAt || new Date().toISOString(),
});
