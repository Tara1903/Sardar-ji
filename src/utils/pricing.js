import { getFallbackImage } from '../data/fallbackImages';
import {
  DELIVERY_FEE_LABEL,
  FREEBIE_DESCRIPTION,
  FREEBIE_NAME,
  FREEBIE_SLUG,
  FREE_DELIVERY_THRESHOLD,
  SPECIAL_OFFER_THRESHOLD,
  SPECIAL_OFFER_UNLOCKED_MESSAGE,
} from './storefront';

export const defaultDeliveryRules = {
  perKmRate: 10,
  minDelivery: 20,
  maxDistance: 10,
  freeThreshold1: FREE_DELIVERY_THRESHOLD,
  freeDistanceLimit: 5,
  freeThreshold2: SPECIAL_OFFER_THRESHOLD,
  estimatedDeliveryMinutes: 35,
  deliveryFeeLabel: DELIVERY_FEE_LABEL,
  freeItemSlug: FREEBIE_SLUG,
  freeItemName: FREEBIE_NAME,
  freeItemDescription: FREEBIE_DESCRIPTION,
};

const getBaseItems = (items = []) => items.filter((item) => !item.isFreebie);
const roundPrice = (value) => Math.round(Number(value || 0));
const clampCurrency = (value) => Math.max(0, roundPrice(value));

const findFreebieProduct = (products = [], rules = defaultDeliveryRules) => {
  const targetSlug = String(rules.freeItemSlug || FREEBIE_SLUG).trim().toLowerCase();
  const targetName = String(rules.freeItemName || FREEBIE_NAME).trim().toLowerCase();

  return (
    products.find(
      (product) =>
        product.slug?.toLowerCase() === targetSlug || product.name?.trim().toLowerCase() === targetName,
    ) || null
  );
};

const buildFreebieItem = (products = [], rules = defaultDeliveryRules) => {
  const matchedProduct = findFreebieProduct(products, rules);

  return {
    id: matchedProduct?.id || `freebie-${rules.freeItemSlug || FREEBIE_SLUG}`,
    name: matchedProduct?.name || rules.freeItemName || FREEBIE_NAME,
    slug: matchedProduct?.slug || rules.freeItemSlug || FREEBIE_SLUG,
    price: 0,
    quantity: 1,
    description:
      matchedProduct?.description || rules.freeItemDescription || FREEBIE_DESCRIPTION,
    image: matchedProduct?.image || getFallbackImage('Beverages'),
    category: matchedProduct?.category || 'Beverages',
    badge: 'FREE',
    isAvailable: true,
    isVeg: true,
    isFreebie: true,
    hasBackendProduct: Boolean(matchedProduct?.id),
  };
};

export const computeCartPricing = (
  items = [],
  rules = defaultDeliveryRules,
  discount = 0,
  distanceKm = null,
) => {
  const mergedRules = {
    ...defaultDeliveryRules,
    ...(rules || {}),
  };
  const baseItems = getBaseItems(items);
  const subtotal = roundPrice(
    baseItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
  );
  const hasDistance = Number.isFinite(distanceKm);
  const distanceRounded = hasDistance ? Number(distanceKm.toFixed(1)) : null;
  const baseDeliveryFee = hasDistance
    ? clampCurrency(Math.max(mergedRules.minDelivery, distanceKm * mergedRules.perKmRate))
    : clampCurrency(mergedRules.minDelivery);
  const notDeliverable = hasDistance && distanceKm > mergedRules.maxDistance;
  const threshold1Unlocked = subtotal >= mergedRules.freeThreshold1;
  const threshold2Unlocked = subtotal >= mergedRules.freeThreshold2;

  let deliveryFee = baseDeliveryFee;
  let deliveryDiscount = 0;
  let deliveryMessage = `Standard ${mergedRules.deliveryFeeLabel.toLowerCase()} applied.`;
  let offerMessage = `Add ₹${Math.max(0, mergedRules.freeThreshold1 - subtotal)} more to unlock FREE delivery`;
  let offerTone = 'warning';

  if (notDeliverable) {
    deliveryFee = baseDeliveryFee;
    deliveryMessage = `We currently deliver within ${mergedRules.maxDistance} km of the store.`;
    offerMessage = `Currently not deliverable beyond ${mergedRules.maxDistance} km`;
    offerTone = 'danger';
  } else if (threshold2Unlocked) {
    deliveryDiscount = baseDeliveryFee;
    deliveryFee = 0;
    deliveryMessage = 'FREE delivery unlocked with complimentary Mango Juice.';
    offerMessage = SPECIAL_OFFER_UNLOCKED_MESSAGE;
    offerTone = 'success';
  } else if (threshold1Unlocked) {
    const amountAway = Math.max(0, mergedRules.freeThreshold2 - subtotal);

    if (hasDistance && distanceKm <= mergedRules.freeDistanceLimit) {
      deliveryDiscount = baseDeliveryFee;
      deliveryFee = 0;
      deliveryMessage = `FREE delivery unlocked within ${mergedRules.freeDistanceLimit} km.`;
    } else {
      deliveryFee = clampCurrency(baseDeliveryFee / 2);
      deliveryDiscount = clampCurrency(baseDeliveryFee - deliveryFee);
      deliveryMessage = '50% off delivery applied because your cart crossed ₹299.';
    }

    offerMessage = `Add ₹${amountAway} more to unlock FREE Delivery + FREE Mango Juice 🥭`;
    offerTone = deliveryFee === 0 ? 'success' : 'warning';
  }

  const total = clampCurrency(subtotal + deliveryFee - discount);

  return {
    subtotal,
    baseDeliveryFee,
    deliveryFee,
    handlingFee: 0,
    deliveryDiscount,
    deliveryFeeLabel: mergedRules.deliveryFeeLabel || DELIVERY_FEE_LABEL,
    discount,
    total,
    distanceKm: distanceRounded,
    hasDistance,
    notDeliverable,
    threshold1Unlocked,
    threshold2Unlocked,
    qualifiesForFreeDelivery: deliveryFee === 0 && !notDeliverable,
    freebieUnlocked: threshold2Unlocked && !notDeliverable,
    amountAwayFreeDelivery: Math.max(0, mergedRules.freeThreshold1 - subtotal),
    amountAwayFreebie: Math.max(0, mergedRules.freeThreshold2 - subtotal),
    unlockedMessage: SPECIAL_OFFER_UNLOCKED_MESSAGE,
    lockedMessage: offerMessage,
    offerMessage,
    offerTone,
    deliveryMessage,
    distanceMessage: hasDistance ? `You are ${distanceRounded.toFixed(1)} km away from our store` : 'Location not enabled',
  };
};

export const getCartOfferState = (
  items = [],
  products = [],
  rules = defaultDeliveryRules,
  discount = 0,
  distanceKm = null,
) => {
  const pricing = computeCartPricing(items, rules, discount, distanceKm);
  const baseItems = getBaseItems(items);
  const freebieItem = pricing.freebieUnlocked ? buildFreebieItem(products, rules) : null;
  const displayItems = freebieItem ? [...baseItems, freebieItem] : baseItems;
  const orderItems =
    freebieItem && freebieItem.hasBackendProduct
      ? [...baseItems, freebieItem]
      : baseItems;

  return {
    ...pricing,
    baseItems,
    displayItems,
    orderItems,
    freebieItem,
  };
};
