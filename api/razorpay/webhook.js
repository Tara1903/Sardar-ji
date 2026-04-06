import { getEnv, sendJson } from '../_lib/server.js';
import { verifyRazorpayWebhookSignature } from '../_lib/razorpay.js';

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

    return sendJson(res, 200, {
      received: true,
      event: payload?.event || '',
    });
  } catch (error) {
    return sendJson(res, 500, {
      message: error.message || 'Unable to process the Razorpay webhook.',
    });
  }
}
