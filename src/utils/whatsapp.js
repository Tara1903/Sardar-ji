import { DEFAULT_WHATSAPP_NUMBER, normalizeWhatsappNumber } from './contact';
import { formatCurrency } from './format';
import { SPECIAL_OFFER_TITLE } from './storefront';

export const createWhatsAppLink = (phoneNumber, message) => {
  const cleanPhone = normalizeWhatsappNumber(phoneNumber || DEFAULT_WHATSAPP_NUMBER);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const createProductOrderMessage = (itemName, price) =>
  `I want to order ${itemName} - ₹${price}`;

export const createGeneralOrderMessage = () =>
  `Hello Sardar Ji Food Corner, I want to place an order. Please share today's best options and the ${SPECIAL_OFFER_TITLE} details.`;

export const createSubscriptionPaymentMessage = (planName, price, customerName = '') => {
  const lines = [
    'Hello Sardar Ji Food Corner, I want to subscribe to the monthly plan.',
    `Plan: ${planName}`,
    `Amount: ₹${price}`,
  ];

  if (customerName) {
    lines.push(`Customer: ${customerName}`);
  }

  lines.push('Please share the payment details so I can complete the subscription.');

  return lines.join('\n');
};

export const createCartOrderMessage = (items = [], pricing) => {
  const formatItemLine = (item) => {
    const addonText = item.addonSummary ? ` [${item.addonSummary}]` : '';

    if (item.isFreebie) {
      return `- ${item.name}${addonText} x ${item.quantity} (FREE)`;
    }

    return `- ${item.name}${addonText} x ${item.quantity} - ${formatCurrency(item.price * item.quantity)}`;
  };

  const lines = [
    'Hello Sardar Ji Food Corner, I want to place this order:',
    ...items.map(formatItemLine),
    `Subtotal: ${formatCurrency(pricing.subtotal)}`,
    `${pricing.deliveryFeeLabel}: ${pricing.deliveryFee ? formatCurrency(pricing.deliveryFee) : 'FREE'}`,
  ];

  if (pricing.deliveryDiscount > 0) {
    lines.push(`Delivery discount applied: -${formatCurrency(pricing.deliveryDiscount)}`);
  }

  if (pricing.discount > 0) {
    lines.push(`Referral coupon applied: -${formatCurrency(pricing.discount)}`);
  }

  if (pricing.distanceKm !== null && pricing.distanceKm !== undefined) {
    lines.push(`Distance from store: ${pricing.distanceKm.toFixed(1)} km`);
  }

  lines.push(`Total: ${formatCurrency(pricing.total)}`);
  lines.push(pricing.offerMessage);

  return lines.join('\n');
};

export const createOrderStatusMessage = (order, nextStatus) => {
  const lines = [
    'Hello from Sardar Ji Food Corner.',
    order?.customerName ? `Order for: ${order.customerName}` : '',
    order?.orderNumber ? `Order ID: ${order.orderNumber}` : '',
    nextStatus ? `Status update: ${nextStatus}` : '',
    'You can track your order live on our website or reply here if you need help.',
  ];

  return lines.filter(Boolean).join('\n');
};
