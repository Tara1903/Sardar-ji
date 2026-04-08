import { callSupabaseRpc, getSupabaseRows } from './supabase.js';
import {
  decodePaymentStateNotes,
  expandFoodPaymentPayload,
  isPaymentStateFresh,
} from './payment-state.js';
import { getEnv } from './server.js';

const buildPaymentNote = (baseNote = '', payment) => {
  const paymentSummary = `Razorpay payment verified. Payment ID: ${payment.id}. Razorpay order ID: ${payment.order_id}. Status: ${payment.status}. Method: ${payment.method || 'online'}.`;

  return [String(baseNote || '').trim(), paymentSummary].filter(Boolean).join('\n');
};

const findExistingOrder = async ({ token, userId, paymentId }) => {
  const encodedPaymentId = encodeURIComponent(`*${paymentId}*`);
  const rows = await getSupabaseRows({
    path: `/orders?user_id=eq.${encodeURIComponent(userId)}&note=ilike.${encodedPaymentId}&select=*&order=created_at.desc&limit=1`,
    token,
  });

  return Array.isArray(rows) && rows.length ? rows[0] : null;
};

const getOrderById = async ({ token, orderId }) => {
  const rows = await getSupabaseRows({
    path: `/orders?id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`,
    token,
  });

  return Array.isArray(rows) && rows.length ? rows[0] : null;
};

const createDeferredFulfillmentError = (message) => {
  const error = new Error(message);
  error.statusCode = 202;
  error.deferred = true;
  return error;
};

const getServiceRoleToken = () => getEnv('SUPABASE_SERVICE_ROLE_KEY');

const resolveFulfillmentContext = ({ notes = {} }) => {
  const serviceRoleToken = getServiceRoleToken();
  const paymentState = decodePaymentStateNotes(notes) || null;

  if (serviceRoleToken && paymentState?.u) {
    return {
      authUser: { id: paymentState.u },
      token: serviceRoleToken,
      headers: {
        apikey: serviceRoleToken,
      },
      paymentState,
      credentialType: 'service_role',
    };
  }

  if (!paymentState?.u || !paymentState?.t) {
    throw createDeferredFulfillmentError(
      'No secure fulfillment state is available yet. Client verification remains the fallback path.',
    );
  }

  if (!isPaymentStateFresh(paymentState)) {
    throw createDeferredFulfillmentError(
      'The secure fulfillment state expired before the webhook could finalize the payment.',
    );
  }

  return {
    authUser: { id: paymentState.u },
    token: paymentState.t,
    headers: {},
    paymentState,
    credentialType: 'user_token',
  };
};

export const getWebhookFulfillmentInput = ({ notes = {}, payment }) => {
  const context = resolveFulfillmentContext({ notes });

  if (payment && Number.isInteger(context.paymentState?.am) && context.paymentState.am > 0) {
    if (Number(payment.amount || 0) !== Number(context.paymentState.am || 0)) {
      const error = new Error('Paid amount does not match the secure payment intent.');
      error.statusCode = 400;
      throw error;
    }
  }

  return context;
};

export const finalizeFoodOrderPayment = async ({
  authUser,
  payment,
  payload,
  token,
  headers = {},
}) => {
  const existingOrder = await findExistingOrder({
    token,
    userId: authUser.id,
    paymentId: payment.id,
  });

  if (existingOrder) {
    return {
      alreadyProcessed: true,
      order: existingOrder,
    };
  }

  const result = await callSupabaseRpc({
    fn: 'place_order',
    token,
    headers,
    body: {
      p_user_id: authUser.id,
      p_address: payload.address,
      p_payment_method: 'ONLINE',
      p_items: payload.items,
      p_note: buildPaymentNote(payload.note, payment),
      p_coupon_code: payload.couponCode || null,
      p_distance_km:
        payload.pricing?.distanceKm === null || payload.pricing?.distanceKm === undefined
          ? null
          : Number(payload.pricing.distanceKm),
    },
  });

  const orderId = result?.id || result?.orderId || '';

  if (!orderId) {
    const error = new Error('Payment was verified but the order could not be created.');
    error.statusCode = 500;
    throw error;
  }

  const createdOrder = await getOrderById({
    token,
    orderId,
  });

  return {
    alreadyProcessed: false,
    order: createdOrder || result,
  };
};

export const finalizeSubscriptionPayment = async ({ authUser, payment, token, headers = {} }) => {
  const subscription = await callSupabaseRpc({
    fn: 'subscribe_monthly_plan',
    token,
    headers,
    body: {
      p_user_id: authUser.id,
    },
  });

  return {
    alreadyProcessed: false,
    subscription,
    paymentMeta: {
      paymentId: payment.id,
      orderId: payment.order_id,
    },
  };
};

export const buildFoodOrderPayloadFromPaymentState = (paymentState) =>
  expandFoodPaymentPayload(paymentState?.f || {});
