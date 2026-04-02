const DEFAULT_DELIVERY_RULES = {
  freeDeliveryThreshold: 299,
  deliveryFeeBelowThreshold: 30,
  handlingFeeBelowThreshold: 9,
  estimatedDeliveryMinutes: 35,
};

const computeOrderTotals = (items = [], rules = DEFAULT_DELIVERY_RULES, discount = 0) => {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const qualifiesForFreeDelivery = subtotal >= rules.freeDeliveryThreshold;
  const deliveryFee = qualifiesForFreeDelivery ? 0 : rules.deliveryFeeBelowThreshold;
  const handlingFee = qualifiesForFreeDelivery ? 0 : rules.handlingFeeBelowThreshold;
  const safeDiscount = Math.max(0, discount);
  const total = Math.max(0, subtotal + deliveryFee + handlingFee - safeDiscount);

  return {
    subtotal,
    deliveryFee,
    handlingFee,
    discount: safeDiscount,
    total,
    qualifiesForFreeDelivery,
  };
};

module.exports = {
  DEFAULT_DELIVERY_RULES,
  computeOrderTotals,
};
