const OTP_REQUEST_STORE_KEY = 'sjfc-otp-requests';

export const OTP_VALIDITY_MS = 5 * 60 * 1000;
export const OTP_COOLDOWN_MS = 60 * 1000;

const normalizeEmailKey = (value = '') => String(value).trim().toLowerCase();

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const toTimestamp = (value) => {
  const timestamp = new Date(value || '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const readStore = () => {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(OTP_REQUEST_STORE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(OTP_REQUEST_STORE_KEY, JSON.stringify(store));
};

const pruneStore = (store) => {
  const now = Date.now();

  return Object.fromEntries(
    Object.entries(store).filter(([, value]) => toTimestamp(value?.expiresAt) > now),
  );
};

const getStoreKey = (scope, email) => `${scope}:${normalizeEmailKey(email)}`;

export const formatOtpDuration = (seconds = 0) => {
  const safeSeconds = Math.max(1, Math.ceil(seconds));

  if (safeSeconds < 60) {
    return `${safeSeconds} second${safeSeconds === 1 ? '' : 's'}`;
  }

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (!remainingSeconds) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  return `${minutes} minute${minutes === 1 ? '' : 's'} ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`;
};

export const getOtpRequestState = (scope, email) => {
  const normalizedEmail = normalizeEmailKey(email);

  if (!normalizedEmail) {
    return null;
  }

  const store = pruneStore(readStore());
  writeStore(store);

  const entry = store[getStoreKey(scope, normalizedEmail)];

  if (!entry) {
    return null;
  }

  const now = Date.now();
  const expiresAt = toTimestamp(entry.expiresAt);
  const cooldownEndsAt = toTimestamp(entry.cooldownEndsAt);

  if (!expiresAt || expiresAt <= now) {
    delete store[getStoreKey(scope, normalizedEmail)];
    writeStore(store);
    return null;
  }

  return {
    ...entry,
    email: normalizedEmail,
    validRemainingSeconds: Math.max(0, Math.ceil((expiresAt - now) / 1000)),
    cooldownRemainingSeconds: Math.max(0, Math.ceil((cooldownEndsAt - now) / 1000)),
  };
};

export const storeOtpRequest = (scope, email) => {
  const normalizedEmail = normalizeEmailKey(email);

  if (!normalizedEmail) {
    return null;
  }

  const now = Date.now();
  const entry = {
    email: normalizedEmail,
    requestedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OTP_VALIDITY_MS).toISOString(),
    cooldownEndsAt: new Date(now + OTP_COOLDOWN_MS).toISOString(),
  };

  const store = pruneStore(readStore());
  store[getStoreKey(scope, normalizedEmail)] = entry;
  writeStore(store);

  return getOtpRequestState(scope, normalizedEmail);
};

export const clearOtpRequest = (scope, email) => {
  const normalizedEmail = normalizeEmailKey(email);

  if (!normalizedEmail) {
    return;
  }

  const store = pruneStore(readStore());
  delete store[getStoreKey(scope, normalizedEmail)];
  writeStore(store);
};
