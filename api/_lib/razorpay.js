import crypto from 'node:crypto';
import { getEnv } from './server.js';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getRazorpayConfig = () => {
  const keyId = getEnv('RAZORPAY_KEY_ID');
  const keySecret = getEnv('RAZORPAY_KEY_SECRET');

  if (!keyId || !keySecret) {
    throw createHttpError(
      'Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel.',
      503,
    );
  }

  return {
    keyId,
    keySecret,
  };
};

const razorpayRequest = async (path, { method = 'GET', body } = {}) => {
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createHttpError(
      payload?.error?.description || payload?.error?.reason || 'Unable to reach Razorpay.',
      response.status || 500,
    );
  }

  return payload;
};

export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  if (!Number.isInteger(amount) || amount < 100) {
    throw createHttpError('The payment amount must be at least ₹1.00.', 400);
  }

  return razorpayRequest('/orders', {
    method: 'POST',
    body: {
      amount,
      currency: 'INR',
      receipt: String(receipt || `sjfc-${Date.now()}`).slice(0, 40),
      notes,
    },
  });
};

export const getRazorpayPayment = async (paymentId) => razorpayRequest(`/payments/${paymentId}`);

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const { keySecret } = getRazorpayConfig();
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

export const verifyRazorpayWebhookSignature = ({ body, signature, secret }) => {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expectedSignature === signature;
};
