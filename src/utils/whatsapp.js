import { DEFAULT_WHATSAPP_NUMBER, normalizeWhatsappNumber } from './contact';

export const createWhatsAppLink = (phoneNumber, message) => {
  const cleanPhone = normalizeWhatsappNumber(phoneNumber || DEFAULT_WHATSAPP_NUMBER);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const createProductOrderMessage = (itemName, price) =>
  `I want to order ${itemName} - ₹${price}`;
