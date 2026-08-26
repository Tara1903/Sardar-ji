import {
  buildFoodOrderPaymentIntent,
  buildSubscriptionPaymentIntent,
} from '../_lib/payment-intents.js';
import {
  getBearerToken,
  readJsonBody,
  requireAuthenticatedUser,
  sendJson,
  getEnv,
} from '../_lib/server.js';

const normalizePhone = (value = '') => String(value).replace(/\D/g, '').slice(-10);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method not allowed.' });
  }

  try {
    const user = await requireAuthenticatedUser(req);
    const token = getBearerToken(req);
    const body = await readJsonBody(req);
    const purpose = body.purpose === 'monthly-subscription' ? 'monthly-subscription' : 'food-order';
    
    const paymentIntent =
      purpose === 'food-order'
        ? await buildFoodOrderPaymentIntent({
            authUser: user,
            authToken: token,
            payload: body.payload,
            customerName: body.customerName,
            phoneNumber: body.phoneNumber,
          })
        : buildSubscriptionPaymentIntent({
            authUser: user,
            authToken: token,
          });

    const starpayApiUrl = getEnv('STARPAY_API_URL') || 'https://payment-gateway-web-kappa.vercel.app';
    const starpayApiKey = getEnv('STARPAY_INTERNAL_API_KEY');
    const siteUrl = getEnv('NEXT_PUBLIC_SITE_URL', 'VITE_SITE_URL') || 'https://sardar-ji.vercel.app';

    if (!starpayApiKey) {
      throw new Error('STARPAY_INTERNAL_API_KEY is not configured on the server.');
    }

    const amountInRupees = paymentIntent.amount / 100;
    const customerName = body.customerName || user.user_metadata?.name || 'Customer';
    const customerPhone = normalizePhone(body.phoneNumber || user.user_metadata?.phoneNumber || '');
    const customerEmail = user.email || '';

    // The paymentIntent.notes string is a base64 encoded JSON string that we must pass to StarPay
    // so it gets passed back to our webhook!
    const metadata = {
      purpose,
      user_id: user.id,
      notes: paymentIntent.notes,
    };

    const starpayRes = await fetch(`${starpayApiUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': starpayApiKey,
      },
      body: JSON.stringify({
        amount: amountInRupees,
        description: purpose === 'monthly-subscription' ? 'Monthly Thali Subscription' : 'Food delivery order',
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        metadata: metadata,
        returnUrl: `${siteUrl}/order-success`,
        webhookUrl: `${siteUrl}/api/starpay/webhook`,
      }),
    });

    const result = await starpayRes.json();

    if (!starpayRes.ok || !result.success) {
      console.error('StarPay error:', result);
      throw new Error(result?.error || 'Failed to create StarPay order');
    }

    return sendJson(res, 200, {
      checkoutUrl: result.data.checkoutUrl,
      orderId: result.data.orderId,
      amount: paymentIntent.amount,
      purpose,
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      message: error.message || 'Unable to create the StarPay order.',
    });
  }
}
