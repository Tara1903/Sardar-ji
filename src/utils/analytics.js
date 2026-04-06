const canUseBrowser = () => typeof window !== 'undefined';

export const trackEvent = (name, params = {}) => {
  if (!canUseBrowser()) {
    return;
  }

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  } else {
    window.dataLayer.push({
      event: name,
      ...params,
    });
  }

  window.dispatchEvent(
    new CustomEvent('sjfc:analytics', {
      detail: {
        name,
        params,
      },
    }),
  );
};

export const trackAddToCart = (product, quantity = 1) =>
  trackEvent('add_to_cart', {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    price: Number(product.price || 0),
    quantity,
  });

export const trackBeginCheckout = (pricing) =>
  trackEvent('begin_checkout', {
    value: Number(pricing?.total || 0),
    currency: 'INR',
    items_count: Number(pricing?.baseItems?.length || pricing?.displayItems?.length || 0),
  });

export const trackPaymentSuccess = ({ value, purpose, paymentId }) =>
  trackEvent('payment_success', {
    value: Number(value || 0),
    currency: 'INR',
    purpose,
    payment_id: paymentId || '',
  });

export const trackSubscriptionPurchase = ({ value, planName }) =>
  trackEvent('subscription_purchase', {
    value: Number(value || 0),
    currency: 'INR',
    plan_name: planName || 'Monthly Thali',
  });

export const trackWhatsAppClick = ({ source, label, value = 0 }) =>
  trackEvent('whatsapp_click', {
    source,
    label,
    value: Number(value || 0),
  });

export const trackReviewIntent = ({ orderId, source }) =>
  trackEvent('review_intent', {
    order_id: orderId || '',
    source: source || 'website',
  });
