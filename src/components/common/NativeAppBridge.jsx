import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isNativeAppShell, NATIVE_BACK_EVENT, NATIVE_BOOT_METRIC_EVENT } from '../../lib/nativeApp';
import { trackEvent } from '../../utils/analytics';

const APP_HOSTS = new Set([
  'www.sardarjifoodcorner.shop',
  'sardarjifoodcorner.shop',
  'localhost',
]);

const parseDeepLinkPath = (rawUrl = '') => {
  if (!rawUrl) {
    return '';
  }

  if (rawUrl.startsWith('/')) {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol === 'sjfc:') {
      const nativePath = `/${[parsed.hostname, parsed.pathname].filter(Boolean).join('/')}`
        .replace(/\/{2,}/g, '/')
        .replace(/\/$/, '') || '/';
      return `${nativePath}${parsed.search}${parsed.hash}`;
    }

    if (!APP_HOSTS.has(parsed.hostname)) {
      return '';
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
  } catch {
    return '';
  }
};

export const NativeAppBridge = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNativeAppShell()) {
      return undefined;
    }

    let appUrlOpenListener = null;
    let notificationActionListener = null;

    const handleDeepLink = (targetPath) => {
      if (!targetPath) {
        return;
      }

      const currentPath = `${location.pathname}${location.search}${location.hash}`;

      if (currentPath === targetPath) {
        return;
      }

      navigate(targetPath);
    };

    const setupAppUrlOpen = async () => {
      try {
        const { App } = await import('@capacitor/app');
        appUrlOpenListener = await App.addListener('appUrlOpen', ({ url }) => {
          handleDeepLink(parseDeepLinkPath(url));
        });
      } catch {
        // Ignore native deep-link listener failures without breaking app use.
      }
    };

    const setupLocalNotificationRouting = async () => {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        notificationActionListener = await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (event) => {
            const targetUrl =
              event?.notification?.extra?.url ||
              (event?.notification?.extra?.orderId
                ? `/track/${event.notification.extra.orderId}`
                : '');

            handleDeepLink(parseDeepLinkPath(targetUrl));
          },
        );
      } catch {
        // Ignore notification click routing on unsupported shells.
      }
    };

    const handleNativeBack = (event) => {
      if (!event?.detail) {
        return;
      }

      const pathname = location.pathname;

      if (pathname.startsWith('/checkout')) {
        event.preventDefault();
        navigate('/cart');
        return;
      }

      if (pathname.startsWith('/cart')) {
        event.preventDefault();
        navigate('/menu');
        return;
      }

      if (pathname.startsWith('/track/')) {
        event.preventDefault();
        navigate('/profile');
        return;
      }

      if (pathname.startsWith('/my-subscription')) {
        event.preventDefault();
        navigate('/profile');
        return;
      }

      if (pathname.startsWith('/profile')) {
        event.preventDefault();
        navigate('/');
      }
    };

    const handleBootMetric = (event) => {
      if (!event?.detail?.bootDurationMs) {
        return;
      }

      trackEvent('native_app_ready', {
        boot_ms: Number(event.detail.bootDurationMs || 0),
      });
    };

    void setupAppUrlOpen();
    void setupLocalNotificationRouting();
    window.addEventListener(NATIVE_BACK_EVENT, handleNativeBack);
    window.addEventListener(NATIVE_BOOT_METRIC_EVENT, handleBootMetric, { once: true });

    return () => {
      window.removeEventListener(NATIVE_BACK_EVENT, handleNativeBack);
      window.removeEventListener(NATIVE_BOOT_METRIC_EVENT, handleBootMetric);
      appUrlOpenListener?.remove?.();
      notificationActionListener?.remove?.();
    };
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
};
