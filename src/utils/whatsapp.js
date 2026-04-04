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

export const createCartOrderMessage = (items = [], pricing) => {
  const lines = [
    'Hello Sardar Ji Food Corner, I want to place this order:',
    ...items.map((item) =>
      item.isFreebie
        ? `- ${item.name} x ${item.quantity} (FREE)`
        : `- ${item.name} x ${item.quantity} - ${formatCurrency(item.price * item.quantity)}`,
    ),
    `Subtotal: ${formatCurrency(pricing.subtotal)}`,
    `${pricing.deliveryFeeLabel}: ${pricing.deliveryFee ? formatCurrency(pricing.deliveryFee) : 'FREE'}`,
  ];

  if (pricing.deliveryDiscount > 0) {
    lines.push(`Delivery discount applied: -${formatCurrency(pricing.deliveryDiscount)}`);
  }

  if (pricing.distanceKm !== null && pricing.distanceKm !== undefined) {
    lines.push(`Distance from store: ${pricing.distanceKm.toFixed(1)} km`);
  }

  lines.push(`Total: ${formatCurrency(pricing.total)}`);
  lines.push(pricing.offerMessage);

  return lines.join('\n');
};
