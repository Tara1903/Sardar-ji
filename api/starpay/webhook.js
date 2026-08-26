import crypto from 'crypto';
import { getEnv, sendJson } from '../_lib/server.js';
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

const verifyStarPayWebhookSignature = ({ body, signature, secret }) => {
  if (!signature || !secret) return false;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method not allowed.' });
  }

  // The webhook uses the INTERNAL_API_KEY to sign
  const webhookSecret = getEnv('STARPAY_INTERNAL_API_KEY');

  if (!webhookSecret) {
    return sendJson(res, 503, {
      message: 'StarPay webhook secret is not configured.',
    });
  }

  try {
    const signature = req.headers['x-signature'] || req.headers['X-Signature'] || '';
    const rawBody = await readRawBody(req);
    
    const isValid = verifyStarPayWebhookSignature({
      body: rawBody,
      signature,
      secret: webhookSecret,
    });

    if (!isValid) {
      return sendJson(res, 400, {
        message: 'StarPay webhook signature verification failed.',
      });
    }

    const payload = JSON.parse(rawBody || '{}');
    const event = String(payload?.event || '').trim();
    
    if (event !== 'payment.success') {
      return sendJson(res, 200, {
        received: true,
        ignored: true,
        event,
      });
    }

    const data = payload.data || {};
    const notes = data.metadata || {};
    
    // We construct a mock payment object matching the structure payment-finalizer expects
    const payment = {
      id: data.transactionId || payload.orderId,
      order_id: payload.orderId,
      status: 'captured',
      amount: Math.round(Number(data.amount) * 100) || 0, // finalizer expects paise/cents usually
      method: 'upi',
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
      message: error.message || 'Unable to process the StarPay webhook.',
    });
  }
}
