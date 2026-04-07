import { Capacitor } from '@capacitor/core';

const NATIVE_READY_EVENT = 'sjfc:native-ready';
const NATIVE_HOST_NAME = 'localhost';
let hasInitialized = false;
let statusBarObserver = null;

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
  window.dispatchEvent(new CustomEvent(NATIVE_READY_EVENT));
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
  if (!canUseBrowser() || statusBarObserver) {
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
  try {
    await App.addListener('backButton', ({ canGoBack }) => {
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

export const initializeNativeAppShell = async () => {
  if (hasInitialized || !isNativeAppShell()) {
    return;
  }

  hasInitialized = true;
  document.documentElement.classList.add('native-app');

  const [{ SplashScreen }, { StatusBar, Style }, { App }] = await Promise.all([
    import('@capacitor/splash-screen'),
    import('@capacitor/status-bar'),
    import('@capacitor/app'),
  ]);

  bindConnectivityEvents();
  await applyStatusBarAppearance(StatusBar, Style);
  observeThemeForStatusBar(StatusBar, Style);
  await bindBackButton(App);
  await registerNativeServiceWorker();
  await waitForAppReady();
  setBootComplete();

  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // Ignore splash plugin timing differences during local web builds.
  }
};

export { NATIVE_READY_EVENT };
