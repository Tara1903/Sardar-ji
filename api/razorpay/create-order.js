import { createRazorpayOrder, getRazorpayConfig } from '../_lib/razorpay.js';
import {
  buildFoodOrderPaymentIntent,
  buildSubscriptionPaymentIntent,
} from '../_lib/payment-intents.js';
import {
  getBearerToken,
  readJsonBody,
  requireAuthenticatedUser,
  sendJson,
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
    const { keyId } = getRazorpayConfig();
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

    const order = await createRazorpayOrder({
      amount: paymentIntent.amount,
      receipt: `${purpose === 'food-order' ? 'food' : 'plan'}-${Date.now()}`,
      notes: {
        purpose,
        user_id: user.id,
        customer_email: user.email || '',
        customer_name: body.customerName || user.user_metadata?.name || '',
        customer_phone: body.phoneNumber || user.user_metadata?.phoneNumber || '',
        ...paymentIntent.notes,
      },
    });

    return sendJson(res, 200, {
      keyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      amount: paymentIntent.amount,
      business: {
        name: 'Sardar Ji Food Corner',
        description:
          purpose === 'monthly-subscription'
            ? 'Monthly Thali subscription'
            : 'Food delivery order',
        image: body.logoUrl || '',
        themeColor: '#17743a',
      },
      prefill: {
        name: body.customerName || user.user_metadata?.name || '',
        email: user.email || '',
        contact: normalizePhone(body.phoneNumber || user.user_metadata?.phoneNumber || ''),
      },
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      message: error.message || 'Unable to create the Razorpay order.',
    });
  }
}
