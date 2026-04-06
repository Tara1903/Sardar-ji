const CHECKOUT_RECOVERY_KEY = 'sjfc-checkout-recovery';
const CHECKOUT_RECOVERY_MAX_AGE_MS = 1000 * 60 * 60 * 24;

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const saveCheckoutRecovery = (payload) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    CHECKOUT_RECOVERY_KEY,
    JSON.stringify({
      savedAt: new Date().toISOString(),
      ...payload,
    }),
  );
};

export const readCheckoutRecovery = () => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHECKOUT_RECOVERY_KEY) || 'null');

    if (!parsed?.savedAt) {
      return null;
    }

    if (Date.now() - new Date(parsed.savedAt).getTime() > CHECKOUT_RECOVERY_MAX_AGE_MS) {
      window.localStorage.removeItem(CHECKOUT_RECOVERY_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearCheckoutRecovery = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CHECKOUT_RECOVERY_KEY);
};
