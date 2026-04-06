import {
  getRazorpayConfig,
  getRazorpayPayment,
  verifyRazorpaySignature,
} from '../_lib/razorpay.js';
import {
  finalizeFoodOrderPayment,
  finalizeSubscriptionPayment,
} from '../_lib/payment-finalizer.js';
import { readJsonBody, requireAuthenticatedUser, sendJson } from '../_lib/server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method not allowed.' });
  }

  try {
    const authUser = await requireAuthenticatedUser(req);
    const body = await readJsonBody(req);
    const razorpayPaymentId = String(body.razorpayPaymentId || '').trim();
    const razorpayOrderId = String(body.razorpayOrderId || '').trim();
    const razorpaySignature = String(body.razorpaySignature || '').trim();
    const expectedAmount = Number(body.amount || 0);
    const authorization = req.headers.authorization || req.headers.Authorization || '';
    const token = authorization.toLowerCase().startsWith('bearer ')
      ? authorization.slice(7).trim()
      : '';

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return sendJson(res, 400, { message: 'Payment verification details are incomplete.' });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return sendJson(res, 400, { message: 'Razorpay signature verification failed.' });
    }

    const payment = await getRazorpayPayment(razorpayPaymentId);

    if (payment.order_id !== razorpayOrderId) {
      return sendJson(res, 400, { message: 'Payment order ID mismatch.' });
    }

    if (Number.isInteger(expectedAmount) && expectedAmount > 0 && payment.amount !== expectedAmount) {
      return sendJson(res, 400, { message: 'Paid amount does not match the order amount.' });
    }

    if (!['authorized', 'captured'].includes(payment.status)) {
      return sendJson(res, 400, {
        message: 'The payment is not completed yet. Please try again after the payment succeeds.',
      });
    }

    let fulfillment = null;
    const purpose = body.purpose === 'monthly-subscription' ? 'monthly-subscription' : body.purpose === 'food-order' ? 'food-order' : '';

    if (purpose === 'food-order' && body.payload && token) {
      fulfillment = await finalizeFoodOrderPayment({
        authUser,
        payment,
        payload: body.payload,
        token,
      });
    }

    if (purpose === 'monthly-subscription' && token) {
      fulfillment = await finalizeSubscriptionPayment({
        authUser,
        payment,
        token,
      });
    }

    return sendJson(res, 200, {
      verified: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      status: payment.status,
      amount: payment.amount,
      method: payment.method || '',
      purpose,
      order: fulfillment?.order || null,
      subscription: fulfillment?.subscription || null,
      alreadyProcessed: Boolean(fulfillment?.alreadyProcessed),
      keyId: getRazorpayConfig().keyId,
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      message: error.message || 'Unable to verify the Razorpay payment.',
    });
  }
}
