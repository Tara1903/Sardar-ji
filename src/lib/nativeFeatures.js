import { Capacitor } from '@capacitor/core';
import { isNativeAppShell } from './nativeApp';

const canUseBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
const NATIVE_PLUGIN_CACHE = new Map();

const loadNativePlugin = async (modulePath, exportName) => {
  const cacheKey = `${modulePath}:${exportName}`;

  if (NATIVE_PLUGIN_CACHE.has(cacheKey)) {
    return NATIVE_PLUGIN_CACHE.get(cacheKey);
  }

  try {
    const module = await import(modulePath);
    const plugin = module?.[exportName] || null;
    NATIVE_PLUGIN_CACHE.set(cacheKey, plugin);
    return plugin;
  } catch {
    NATIVE_PLUGIN_CACHE.set(cacheKey, null);
    return null;
  }
};

const canUseNavigatorVibration = () => canUseBrowser() && typeof navigator?.vibrate === 'function';

export const isNativeMobileShell = () => isNativeAppShell() && Capacitor.getPlatform() === 'android';

export const triggerNativeHaptic = async (kind = 'light') => {
  if (isNativeAppShell()) {
    const Haptics = await loadNativePlugin('@capacitor/haptics', 'Haptics');
    const ImpactStyle = await loadNativePlugin('@capacitor/haptics', 'ImpactStyle');
    const NotificationType = await loadNativePlugin('@capacitor/haptics', 'NotificationType');

    if (Haptics) {
      try {
        if (kind === 'success' || kind === 'warning' || kind === 'error') {
          await Haptics.notification({
            type:
              kind === 'error'
                ? NotificationType?.Error
                : kind === 'warning'
                  ? NotificationType?.Warning
                  : NotificationType?.Success,
          });
          return true;
        }

        await Haptics.impact({
          style:
            kind === 'heavy'
              ? ImpactStyle?.Heavy
              : kind === 'medium'
                ? ImpactStyle?.Medium
                : ImpactStyle?.Light,
        });
        return true;
      } catch {
        // Fall through to browser vibration when available.
      }
    }
  }

  if (canUseNavigatorVibration()) {
    navigator.vibrate(kind === 'heavy' ? 28 : kind === 'medium' ? 18 : 10);
    return true;
  }

  return false;
};

export const requestNativeNotificationPermission = async () => {
  if (!isNativeAppShell()) {
    return 'unsupported';
  }

  const LocalNotifications = await loadNativePlugin(
    '@capacitor/local-notifications',
    'LocalNotifications',
  );

  if (!LocalNotifications) {
    return 'unsupported';
  }

  try {
    const current = await LocalNotifications.checkPermissions();

    if (current.display === 'granted') {
      return 'granted';
    }

    const requested = await LocalNotifications.requestPermissions();
    return requested.display || 'denied';
  } catch {
    return 'denied';
  }
};

export const showNativeLocalNotification = async ({
  id,
  title,
  body,
  extra = {},
}) => {
  if (!isNativeAppShell()) {
    return false;
  }

  const LocalNotifications = await loadNativePlugin(
    '@capacitor/local-notifications',
    'LocalNotifications',
  );

  if (!LocalNotifications) {
    return false;
  }

  const permission = await requestNativeNotificationPermission();

  if (permission !== 'granted') {
    return false;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id:
            Number.parseInt(String(id || Date.now()).replace(/\D/g, '').slice(-8), 10) ||
            Date.now() % 100000000,
          title: String(title || 'Sardar Ji Food Corner'),
          body: String(body || ''),
          schedule: { at: new Date(Date.now() + 350) },
          smallIcon: 'ic_launcher_foreground',
          iconColor: '#FF6B00',
          extra,
        },
      ],
    });

    return true;
  } catch {
    return false;
  }
};

export const shareNativeContent = async ({ title = '', text = '', url = '' }) => {
  const sharePayload = {
    title: String(title || '').trim(),
    text: String(text || '').trim(),
    url: String(url || '').trim(),
  };

  if (isNativeAppShell()) {
    const Share = await loadNativePlugin('@capacitor/share', 'Share');

    if (Share) {
      try {
        await Share.share({
          title: sharePayload.title,
          text: sharePayload.text,
          url: sharePayload.url,
          dialogTitle: sharePayload.title || 'Share',
        });
        return true;
      } catch {
        return false;
      }
    }
  }

  if (canUseBrowser() && navigator.share) {
    try {
      await navigator.share(sharePayload);
      return true;
    } catch {
      return false;
    }
  }

  if (canUseBrowser() && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(
        [sharePayload.title, sharePayload.text, sharePayload.url].filter(Boolean).join('\n'),
      );
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

export const getNativeCurrentLocation = async () => {
  if (!isNativeAppShell()) {
    return null;
  }

  const Geolocation = await loadNativePlugin('@capacitor/geolocation', 'Geolocation');

  if (!Geolocation) {
    return null;
  }

  try {
    const permissionState = await Geolocation.checkPermissions();
    const isGranted =
      permissionState.location === 'granted' || permissionState.coarseLocation === 'granted';

    if (!isGranted) {
      const requested = await Geolocation.requestPermissions();
      const granted =
        requested.location === 'granted' || requested.coarseLocation === 'granted';

      if (!granted) {
        throw new Error('Location permission not granted');
      }
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 2 * 60 * 1000,
    });

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch {
    return null;
  }
};
