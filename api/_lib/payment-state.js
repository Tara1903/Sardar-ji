import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { getEnv } from './server.js';

const STATE_VERSION = '1';
const NOTE_CHUNK_PREFIX = 'sjfc_state_';
const NOTE_CHUNK_COUNT_KEY = 'sjfc_state_chunks';
const NOTE_VERSION_KEY = 'sjfc_state_version';
const NOTE_MAX_VALUE_LENGTH = 240;
const MAX_NOTE_CHUNKS = 8;
const MAX_STATE_AGE_MS = 24 * 60 * 60 * 1000;

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getPaymentStateSecret = () => {
  const secret = getEnv('PAYMENT_STATE_SECRET', 'RAZORPAY_KEY_SECRET');

  if (!secret) {
    throw createHttpError('Payment state secret is not configured.', 503);
  }

  return crypto.createHash('sha256').update(secret).digest();
};

const splitIntoChunks = (value = '') => {
  const chunks = [];

  for (let index = 0; index < value.length; index += NOTE_MAX_VALUE_LENGTH) {
    chunks.push(value.slice(index, index + NOTE_MAX_VALUE_LENGTH));
  }

  if (!chunks.length) {
    chunks.push('');
  }

  if (chunks.length > MAX_NOTE_CHUNKS) {
    throw createHttpError(
      'This payment request is too large to prepare safely. Please reduce the cart size and try again.',
      400,
    );
  }

  return chunks;
};

const sanitizeCompactAddress = (address = {}) => ({
  n: String(address.name || '').trim(),
  ph: String(address.phoneNumber || '').trim(),
  f: String(address.fullAddress || '').trim(),
  l: String(address.landmark || '').trim(),
  p: String(address.pincode || '').trim(),
});

const expandCompactAddress = (address = {}) => ({
  name: String(address.n || '').trim(),
  phoneNumber: String(address.ph || '').trim(),
  fullAddress: String(address.f || '').trim(),
  landmark: String(address.l || '').trim(),
  pincode: String(address.p || '').trim(),
});

export const compactFoodPaymentPayload = (payload = {}) => ({
  a: sanitizeCompactAddress(payload.address),
  i: (payload.items || []).map((item) => [
    String(item.id || '').trim(),
    Math.max(1, Number.parseInt(item.quantity || 1, 10) || 1),
    item.isFreebie ? 1 : 0,
  ]),
  c: String(payload.couponCode || '').trim(),
  d:
    payload.pricing?.distanceKm === null || payload.pricing?.distanceKm === undefined
      ? null
      : Number(payload.pricing.distanceKm),
});

export const expandFoodPaymentPayload = (payload = {}) => ({
  address: expandCompactAddress(payload.a),
  items: (payload.i || [])
    .map(([id, quantity, isFreebie]) => ({
      id: String(id || '').trim(),
      quantity: Math.max(1, Number.parseInt(quantity || 1, 10) || 1),
      isFreebie: Boolean(isFreebie),
    }))
    .filter((item) => item.id),
  couponCode: String(payload.c || '').trim(),
  pricing: {
    distanceKm: payload.d === null || payload.d === undefined ? null : Number(payload.d),
  },
  note: '',
});

export const encodePaymentStateNotes = ({
  purpose,
  userId,
  authToken,
  amount,
  foodPayload = null,
}) => {
  if (!purpose || !userId || !authToken) {
    throw createHttpError('Payment state is incomplete.', 400);
  }

  const key = getPaymentStateSecret();
  const iv = crypto.randomBytes(12);
  const state = {
    v: STATE_VERSION,
    p: String(purpose || '').trim(),
    u: String(userId || '').trim(),
    t: String(authToken || '').trim(),
    am: Math.max(0, Number.parseInt(amount || 0, 10) || 0),
    iat: Date.now(),
    f: foodPayload || null,
  };
  const compressed = zlib.deflateRawSync(Buffer.from(JSON.stringify(state), 'utf8'));
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const tag = cipher.getAuthTag();
  const encoded = Buffer.concat([iv, tag, encrypted]).toString('base64url');
  const chunks = splitIntoChunks(encoded);

  return chunks.reduce(
    (notes, chunk, index) => ({
      ...notes,
      [NOTE_VERSION_KEY]: STATE_VERSION,
      [NOTE_CHUNK_COUNT_KEY]: String(chunks.length),
      [`${NOTE_CHUNK_PREFIX}${index + 1}`]: chunk,
    }),
    {},
  );
};

export const decodePaymentStateNotes = (notes = {}) => {
  const chunkCount = Number.parseInt(notes?.[NOTE_CHUNK_COUNT_KEY] || '0', 10);

  if (!chunkCount) {
    return null;
  }

  const encoded = Array.from({ length: chunkCount }, (_, index) => notes?.[`${NOTE_CHUNK_PREFIX}${index + 1}`] || '')
    .join('')
    .trim();

  if (!encoded) {
    return null;
  }

  const binary = Buffer.from(encoded, 'base64url');

  if (binary.length <= 28) {
    return null;
  }

  const iv = binary.subarray(0, 12);
  const tag = binary.subarray(12, 28);
  const encrypted = binary.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getPaymentStateSecret(), iv);
  decipher.setAuthTag(tag);
  const decompressed = zlib.inflateRawSync(
    Buffer.concat([decipher.update(encrypted), decipher.final()]),
  ).toString('utf8');
  const state = JSON.parse(decompressed || '{}');

  if (!state?.p || !state?.u || !state?.t) {
    return null;
  }

  return state;
};

export const isPaymentStateFresh = (state = {}) =>
  Number.isFinite(state?.iat) && Date.now() - Number(state.iat) <= MAX_STATE_AGE_MS;
