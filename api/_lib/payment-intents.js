import { defaultDeliveryRules, getCartOfferState } from '../../src/utils/pricing.js';
import { MONTHLY_SUBSCRIPTION_PRICE } from '../../src/utils/subscription.js';
import { getSupabaseRows } from './supabase.js';
import { compactFoodPaymentPayload, encodePaymentStateNotes } from './payment-state.js';

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeProduct = (row = {}) => ({
  id: row.id,
  name: row.name || '',
  slug: row.slug || '',
  price: Number(row.price || 0),
  description: row.description || '',
  image: row.image_url || '',
  badge: row.badge || '',
  isAvailable: row.is_available !== false,
  isVeg: row.is_veg !== false,
  category: row.categories?.name || '',
  categorySlug: row.categories?.slug || '',
});

const fetchStoreSettings = async (token) => {
  const rows = await getSupabaseRows({
    path: '/app_settings?id=eq.1&select=delivery_rules&limit=1',
    token,
  });

  return rows?.[0]?.delivery_rules || defaultDeliveryRules;
};

const fetchProducts = async (token) => {
  const rows = await getSupabaseRows({
    path: '/products?select=id,name,slug,price,description,image_url,badge,is_available,is_veg,categories(name,slug)',
    token,
  });

  return (rows || []).map(normalizeProduct);
};

const fetchActiveCoupon = async ({ token, userId, couponCode }) => {
  if (!couponCode) {
    return null;
  }

  const rows = await getSupabaseRows({
    path:
      `/reward_coupons?user_id=eq.${encodeURIComponent(userId)}` +
      `&code=eq.${encodeURIComponent(couponCode)}` +
      '&status=eq.active&select=id,amount,expires_at&limit=1',
    token,
  });

  const coupon = rows?.[0] || null;

  if (!coupon) {
    throw createHttpError('Referral coupon is invalid or expired.', 400);
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= Date.now()) {
    throw createHttpError('Referral coupon is invalid or expired.', 400);
  }

  return coupon;
};

const normalizeFoodAddress = (address = {}) => ({
  name: String(address.name || '').trim(),
  phoneNumber: String(address.phoneNumber || '').trim(),
  fullAddress: String(address.fullAddress || '').trim(),
  landmark: String(address.landmark || '').trim(),
  pincode: String(address.pincode || '').trim(),
});

const normalizeFoodItems = ({ requestedItems = [], products = [] }) => {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return (requestedItems || []).map((item) => {
    const id = String(item?.id || '').trim();
    const product = productMap.get(id);

    if (!id || !product) {
      throw createHttpError('One or more items in your cart are no longer available.', 400);
    }

    if (!product.isAvailable && !item?.isFreebie && !item?.isAddonLine) {
      throw createHttpError(`${product.name} is currently unavailable.`, 400);
    }

    return {
      ...product,
      lineId: String(item?.lineId || id).trim(),
      name: String(item?.name || product.name || '').trim(),
      quantity: Math.max(1, Number.parseInt(item?.quantity || 1, 10) || 1),
      isFreebie: Boolean(item?.isFreebie),
      isAddonLine: Boolean(item?.isAddonLine),
      parentLineId: String(item?.parentLineId || '').trim(),
      parentProductId: String(item?.parentProductId || '').trim(),
      groupId: String(item?.groupId || '').trim(),
      groupTitle: String(item?.groupTitle || '').trim(),
      addonSummary: String(item?.addonSummary || '').trim(),
      basePrice: Number(item?.basePrice ?? item?.price ?? product.price ?? 0),
      price: Number(item?.price ?? product.price ?? 0),
    };
  });
};

export const buildFoodOrderPaymentIntent = async ({
  authUser,
  authToken,
  payload,
  customerName,
  phoneNumber,
}) => {
  const requestedItems = payload?.items || [];
  const couponCode = String(payload?.couponCode || '').trim();
  const distanceKm =
    payload?.pricing?.distanceKm === null || payload?.pricing?.distanceKm === undefined
      ? null
      : Number(payload.pricing.distanceKm);

  if (!requestedItems.length) {
    throw createHttpError('Add at least one item before starting payment.', 400);
  }

  const [deliveryRules, products, coupon] = await Promise.all([
    fetchStoreSettings(authToken),
    fetchProducts(authToken),
    fetchActiveCoupon({
      token: authToken,
      userId: authUser.id,
      couponCode,
    }),
  ]);

  const normalizedItems = normalizeFoodItems({
    requestedItems,
    products,
  });
  const cartOfferState = getCartOfferState(
    normalizedItems,
    products,
    deliveryRules,
    Number(coupon?.amount || 0),
    distanceKm,
  );

  if (!cartOfferState.baseItems.length || cartOfferState.total <= 0) {
    throw createHttpError('Unable to prepare payment for an empty cart.', 400);
  }

  if (cartOfferState.notDeliverable) {
    throw createHttpError('This address is outside our current delivery zone.', 400);
  }

  const canonicalPayload = {
    address: normalizeFoodAddress({
      ...payload?.address,
      name: payload?.address?.name || customerName || authUser.user_metadata?.name || '',
      phoneNumber:
        payload?.address?.phoneNumber || phoneNumber || authUser.user_metadata?.phoneNumber || '',
    }),
    items: cartOfferState.orderItems.map((item) => ({
      id: item.id,
      lineId: item.lineId || item.id,
      quantity: item.quantity,
      price: Number(item.price || 0),
      basePrice: Number(item.basePrice ?? item.price ?? 0),
      name: item.name || '',
      isFreebie: Boolean(item.isFreebie),
      isAddonLine: Boolean(item.isAddonLine),
      parentLineId: item.parentLineId || '',
      parentProductId: item.parentProductId || '',
      groupId: item.groupId || '',
      groupTitle: item.groupTitle || '',
      addonSummary: item.addonSummary || '',
    })),
    couponCode: couponCode || '',
    pricing: {
      distanceKm: cartOfferState.distanceKm,
    },
    note: '',
  };
  const amount = Math.round(cartOfferState.total * 100);

  return {
    amount,
    pricing: cartOfferState,
    canonicalPayload,
    notes: encodePaymentStateNotes({
      purpose: 'food-order',
      userId: authUser.id,
      authToken,
      amount,
      foodPayload: compactFoodPaymentPayload(canonicalPayload),
    }),
  };
};

export const buildSubscriptionPaymentIntent = ({ authUser, authToken }) => {
  const amount = Math.round(MONTHLY_SUBSCRIPTION_PRICE * 100);

  return {
    amount,
    notes: encodePaymentStateNotes({
      purpose: 'monthly-subscription',
      userId: authUser.id,
      authToken,
      amount,
      foodPayload: null,
    }),
  };
};
