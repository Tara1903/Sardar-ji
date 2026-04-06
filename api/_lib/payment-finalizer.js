import { callSupabaseRpc, getSupabaseRows } from './supabase.js';

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

export const finalizeFoodOrderPayment = async ({ authUser, payment, payload, token }) => {
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

export const finalizeSubscriptionPayment = async ({ authUser, payment, token }) => {
  const subscription = await callSupabaseRpc({
    fn: 'subscribe_monthly_plan',
    token,
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
