import { Capacitor } from '@capacitor/core';

export const initializeNativeAppShell = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const [{ SplashScreen }, { StatusBar }] = await Promise.all([
    import('@capacitor/splash-screen'),
    import('@capacitor/status-bar'),
  ]);

  try {
    await StatusBar.hide();
  } catch {
    // Ignore native status bar availability errors outside supported shells.
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // Ignore splash plugin timing differences during local web builds.
  }
};
