import { Capacitor } from '@capacitor/core';

const NATIVE_READY_EVENT = 'sjfc:native-ready';
const NATIVE_BACK_EVENT = 'sjfc:native-back';
const NATIVE_BOOT_METRIC_EVENT = 'sjfc:native-boot-metric';
const NATIVE_HOST_NAME = 'localhost';
const NATIVE_BOOT_FALLBACK_MS = 4200;
let hasInitialized = false;
let statusBarObserver = null;
let nativeBootStartedAt = 0;

const canUseBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const isNativeBootEnvironment = () => {
  if (!canUseBrowser()) {
    return false;
  }

  return (
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === NATIVE_HOST_NAME &&
      (!window.location.port || window.location.port === '80'))
  );
};

export const isNativeAppShell = () =>
  Capacitor.isNativePlatform() || isNativeBootEnvironment();

const toggleConnectivityClasses = () => {
  if (!canUseBrowser()) {
    return;
  }

  document.documentElement.classList.toggle('native-offline', !navigator.onLine);
};

const setBootComplete = () => {
  if (!canUseBrowser()) {
    return;
  }

  const root = document.documentElement;
  root.classList.add('native-ready');
  root.classList.remove('app-booting');
  window.dispatchEvent(
    new CustomEvent(NATIVE_BOOT_METRIC_EVENT, {
      detail: {
        bootDurationMs: nativeBootStartedAt ? Date.now() - nativeBootStartedAt : 0,
      },
    }),
  );
  window.dispatchEvent(new CustomEvent(NATIVE_READY_EVENT));
};

const hideSplashScreen = async (SplashScreen) => {
  if (!SplashScreen?.hide) {
    return;
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // Ignore splash plugin timing differences during local web builds.
  }
};

const finalizeNativeBoot = async (SplashScreen) => {
  setBootComplete();
  await hideSplashScreen(SplashScreen);
};

const loadNativeModule = async (path) => {
  try {
    return await import(path);
  } catch {
    return {};
  }
};

const waitForAppReady = async () => {
  if (!canUseBrowser()) {
    return;
  }

  const nextPaint = () =>
    new Promise((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    });

  await nextPaint();

  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready.catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, 650)),
    ]);
  } else {
    await new Promise((resolve) => window.setTimeout(resolve, 320));
  }
};

const applyStatusBarAppearance = async (StatusBar, Style) => {
  if (!StatusBar || !Style) {
    return;
  }

  const isDarkTheme = document.documentElement.classList.contains('dark');

  try {
    await StatusBar.show();
  } catch {
    // Ignore native status bar availability differences between environments.
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // Ignore native status bar availability differences between environments.
  }

  try {
    await StatusBar.setStyle({ style: isDarkTheme ? Style.Light : Style.Dark });
  } catch {
    // Ignore style application errors on unsupported shells.
  }

  try {
    await StatusBar.setBackgroundColor({ color: isDarkTheme ? '#101713' : '#F7F8EF' });
  } catch {
    // Ignore background color support differences between Android versions.
  }
};

const observeThemeForStatusBar = (StatusBar, Style) => {
  if (!canUseBrowser() || statusBarObserver || !StatusBar || !Style || typeof MutationObserver === 'undefined') {
    return;
  }

  statusBarObserver = new MutationObserver(() => {
    void applyStatusBarAppearance(StatusBar, Style);
  });

  statusBarObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
};

const registerNativeServiceWorker = async () => {
  if (!canUseBrowser() || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register('/native-sw.js', { scope: '/' });
  } catch {
    // Ignore registration failures so startup is never blocked.
  }
};

const bindConnectivityEvents = () => {
  if (!canUseBrowser()) {
    return;
  }

  toggleConnectivityClasses();
  window.addEventListener('online', toggleConnectivityClasses);
  window.addEventListener('offline', toggleConnectivityClasses);
};

const bindBackButton = async (App) => {
  if (!App?.addListener) {
    return;
  }

  try {
    await App.addListener('backButton', ({ canGoBack }) => {
      if (canUseBrowser()) {
        const backEvent = new CustomEvent(NATIVE_BACK_EVENT, {
          cancelable: true,
          detail: {
            canGoBack,
            pathname: window.location.pathname,
          },
        });

        const shouldContinue = window.dispatchEvent(backEvent);

        if (!shouldContinue || backEvent.defaultPrevented) {
          return;
        }
      }

      if (canGoBack || window.history.length > 1) {
        window.history.back();
        return;
      }

      App.minimizeApp?.();
    });
  } catch {
    // Ignore back button support on unsupported native shells.
  }
};

const bindAppResume = async (App, StatusBar, Style) => {
  if (!App?.addListener) {
    return;
  }

  try {
    await App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        return;
      }

      toggleConnectivityClasses();
      void applyStatusBarAppearance(StatusBar, Style);
    });
  } catch {
    // Ignore resume support on unsupported native shells.
  }
};

export const initializeNativeAppShell = async () => {
  if (hasInitialized || !isNativeAppShell()) {
    return;
  }

  hasInitialized = true;
  nativeBootStartedAt = Date.now();
  document.documentElement.classList.add('native-app');
  let SplashScreen = null;
  let fallbackTimeout = 0;

  if (canUseBrowser()) {
    fallbackTimeout = window.setTimeout(() => {
      void finalizeNativeBoot(SplashScreen);
    }, NATIVE_BOOT_FALLBACK_MS);
  }

  try {
    const [splashScreenModule, statusBarModule, appModule] = await Promise.all([
      loadNativeModule('@capacitor/splash-screen'),
      loadNativeModule('@capacitor/status-bar'),
      loadNativeModule('@capacitor/app'),
    ]);

    SplashScreen = splashScreenModule.SplashScreen || null;
    const StatusBar = statusBarModule.StatusBar || null;
    const Style = statusBarModule.Style || null;
    const App = appModule.App || null;

    bindConnectivityEvents();
    await applyStatusBarAppearance(StatusBar, Style);
    observeThemeForStatusBar(StatusBar, Style);
    await bindBackButton(App);
    await bindAppResume(App, StatusBar, Style);
    await registerNativeServiceWorker();
    await waitForAppReady();
  } catch {
    // Never leave the native shell stuck behind the boot overlay.
  } finally {
    if (fallbackTimeout) {
      window.clearTimeout(fallbackTimeout);
    }

    await finalizeNativeBoot(SplashScreen);
  }
};

export { NATIVE_BACK_EVENT, NATIVE_BOOT_METRIC_EVENT, NATIVE_READY_EVENT };
