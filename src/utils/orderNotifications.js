export const ADMIN_NEW_ORDER_EVENT = 'sjfc:admin-order-insert';

export const ORDER_STATUS_NOTIFICATION_MESSAGES = Object.freeze({
  Preparing: 'Your order is being prepared 👨‍🍳',
  'Out for Delivery': 'Your order is nearby 🚚',
  Delivered: 'Your order has been delivered 🎉',
});

const ORDER_STATUS_ALIASES = Object.freeze({
  preparing: 'Preparing',
  ready: 'Preparing',
  nearby: 'Out for Delivery',
  out_for_delivery: 'Out for Delivery',
  'out for delivery': 'Out for Delivery',
  delivered: 'Delivered',
});

export const normalizeOrderStatusNotificationStatus = (status = '') => {
  const rawStatus = String(status || '').trim();

  if (!rawStatus) {
    return '';
  }

  return (
    ORDER_STATUS_ALIASES[rawStatus.toLowerCase().replace(/[\s-]+/g, '_')] ||
    ORDER_STATUS_ALIASES[rawStatus.toLowerCase()] ||
    rawStatus
  );
};

export const getOrderStatusNotificationMessage = (status = '') =>
  ORDER_STATUS_NOTIFICATION_MESSAGES[normalizeOrderStatusNotificationStatus(status)] || null;

export const buildOrderStatusNotification = ({ orderId = '', orderNumber = '', status = '' } = {}) => {
  const normalizedStatus = normalizeOrderStatusNotificationStatus(status);
  const message = getOrderStatusNotificationMessage(normalizedStatus);

  if (!message) {
    return null;
  }

  return {
    title: normalizedStatus === 'Delivered' ? 'Order delivered' : 'Order update',
    message,
    orderId,
    orderNumber,
    status: normalizedStatus,
    url: orderId ? `/track/${orderId}` : '/profile',
  };
};

export const buildAdminNewOrderAlert = ({
  orderId = '',
  orderNumber = '',
  customerName = 'A customer',
} = {}) => ({
  title: 'New order received',
  message: `${customerName} placed ${orderNumber || 'a new order'}.`,
  orderId,
  orderNumber,
  url: '/admin/orders',
});

export const normalizeRealtimeOrderPreview = (row = {}) => ({
  id: row.id || '',
  orderNumber: row.order_number || row.orderNumber || '',
  userId: row.user_id || row.userId || '',
  customerName: row.customer_name || row.customerName || 'A customer',
  status: row.status || 'Order Placed',
  total: Number(row.total || 0),
  createdAt: row.created_at || row.createdAt || new Date().toISOString(),
});
