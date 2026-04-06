const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

const loadScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Razorpay), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Unable to load Razorpay.'));
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async ({
  amount,
  business,
  keyId,
  order,
  prefill,
}) => {
  const Razorpay = await loadScript();

  if (!Razorpay) {
    throw new Error('Razorpay is unavailable on this device.');
  }

  return new Promise((resolve, reject) => {
    const instance = new Razorpay({
      key: keyId,
      amount,
      currency: order.currency,
      name: business.name,
      description: business.description,
      image: business.image || undefined,
      order_id: order.id,
      prefill,
      theme: {
        color: business.themeColor || '#17743a',
      },
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled before completion.')),
      },
      retry: {
        enabled: true,
        max_count: 1,
      },
      handler: (response) => resolve(response),
    });

    instance.on('payment.failed', (event) => {
      reject(new Error(event?.error?.description || 'Payment failed. Please try again.'));
    });

    instance.open();
  });
};
