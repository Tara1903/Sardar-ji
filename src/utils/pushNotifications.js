const canUseBrowser = () => typeof window !== 'undefined';

export const canUseWebPushNotifications = () =>
  canUseBrowser() &&
  window.isSecureContext &&
  'serviceWorker' in navigator &&
  'Notification' in window &&
  'PushManager' in window;

export const urlBase64ToUint8Array = (base64String = '') => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

export const normalizePushSubscriptionPayload = (subscription) => {
  const raw =
    typeof subscription?.toJSON === 'function'
      ? subscription.toJSON()
      : subscription || {};

  return {
    endpoint: raw.endpoint || '',
    expirationTime: raw.expirationTime ?? null,
    keys: {
      auth: raw.keys?.auth || '',
      p256dh: raw.keys?.p256dh || '',
    },
    userAgent: canUseBrowser() ? navigator.userAgent : '',
    platform: canUseBrowser() ? navigator.platform || '' : '',
  };
};

export const isPushSubscriptionPayloadValid = (payload = {}) =>
  Boolean(payload.endpoint && payload.keys?.auth && payload.keys?.p256dh);
