export const defaultDeliveryRules = {
  freeDeliveryThreshold: 299,
  deliveryFeeBelowThreshold: 30,
  handlingFeeBelowThreshold: 9,
  estimatedDeliveryMinutes: 35,
};

export const computeCartPricing = (items = [], rules = defaultDeliveryRules, discount = 0) => {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const qualifiesForFreeDelivery = subtotal >= rules.freeDeliveryThreshold;
  const deliveryFee = qualifiesForFreeDelivery ? 0 : rules.deliveryFeeBelowThreshold;
  const handlingFee = qualifiesForFreeDelivery ? 0 : rules.handlingFeeBelowThreshold;
  const total = Math.max(0, subtotal + deliveryFee + handlingFee - discount);

  return {
    subtotal,
    deliveryFee,
    handlingFee,
    discount,
    total,
    qualifiesForFreeDelivery,
  };
};
