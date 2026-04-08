import { getEnv, sendJson } from '../_lib/server.js';
import {
  ensureCapturedPayment,
  getRazorpayOrder,
  getRazorpayPayment,
  verifyRazorpayWebhookSignature,
} from '../_lib/razorpay.js';
import {
  buildFoodOrderPayloadFromPaymentState,
  finalizeFoodOrderPayment,
  finalizeSubscriptionPayment,
  getWebhookFulfillmentInput,
} from '../_lib/payment-finalizer.js';

const readRawBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method not allowed.' });
  }

  const webhookSecret = getEnv('RAZORPAY_WEBHOOK_SECRET');

  if (!webhookSecret) {
    return sendJson(res, 503, {
      message: 'Razorpay webhook secret is not configured.',
    });
  }

  try {
    const signature =
      req.headers['x-razorpay-signature'] ||
      req.headers['X-Razorpay-Signature'] ||
      '';
    const rawBody = await readRawBody(req);
    const isValid = verifyRazorpayWebhookSignature({
      body: rawBody,
      signature,
      secret: webhookSecret,
    });

    if (!isValid) {
      return sendJson(res, 400, {
        message: 'Razorpay webhook signature verification failed.',
      });
    }

    const payload = JSON.parse(rawBody || '{}');
    const event = String(payload?.event || '').trim();
    const paymentEntity =
      payload?.payload?.payment?.entity ||
      payload?.payload?.payment?.payment ||
      payload?.payload?.order?.entity?.payment ||
      null;
    const paymentId = String(paymentEntity?.id || '').trim();

    if (!paymentId || !['payment.authorized', 'payment.captured', 'order.paid'].includes(event)) {
      return sendJson(res, 200, {
        received: true,
        ignored: true,
        event,
      });
    }

    let payment = await getRazorpayPayment(paymentId);

    if (event === 'payment.authorized') {
      payment = await ensureCapturedPayment(payment);
    }

    if (payment.status !== 'captured') {
      return sendJson(res, 200, {
        received: true,
        event,
        deferred: true,
        reason: 'payment_not_captured_yet',
      });
    }

    const order = await getRazorpayOrder(payment.order_id);
    const notes = {
      ...(order?.notes || {}),
      ...(payment?.notes || {}),
    };

    try {
      const fulfillmentInput = getWebhookFulfillmentInput({
        notes,
        payment,
      });
      let fulfillment = null;

      if (fulfillmentInput.paymentState?.p === 'food-order') {
        fulfillment = await finalizeFoodOrderPayment({
          authUser: fulfillmentInput.authUser,
          payment,
          payload: buildFoodOrderPayloadFromPaymentState(fulfillmentInput.paymentState),
          token: fulfillmentInput.token,
          headers: fulfillmentInput.headers,
        });
      } else if (fulfillmentInput.paymentState?.p === 'monthly-subscription') {
        fulfillment = await finalizeSubscriptionPayment({
          authUser: fulfillmentInput.authUser,
          payment,
          token: fulfillmentInput.token,
          headers: fulfillmentInput.headers,
        });
      }

      return sendJson(res, 200, {
        received: true,
        event,
        captured: true,
        fulfilled: true,
        alreadyProcessed: Boolean(fulfillment?.alreadyProcessed),
        orderId: fulfillment?.order?.id || '',
        subscriptionId: fulfillment?.subscription?.id || '',
      });
    } catch (error) {
      if (error?.deferred) {
        return sendJson(res, 200, {
          received: true,
          event,
          captured: true,
          fulfilled: false,
          deferred: true,
          message: error.message,
        });
      }

      throw error;
    }
  } catch (error) {
    return sendJson(res, 500, {
      message: error.message || 'Unable to process the Razorpay webhook.',
    });
  }
}
