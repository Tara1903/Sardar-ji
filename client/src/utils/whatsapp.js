export const createWhatsAppLink = (phoneNumber, message) => {
  const cleanPhone = `${phoneNumber || '919999999999'}`.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const createProductOrderMessage = (itemName, price) =>
  `I want to order ${itemName} - ₹${price}`;
