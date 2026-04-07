import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Sparkles } from 'lucide-react';
import { isNativeAppShell } from '../../lib/nativeApp';
import { BUTTON_PRESS_VARIANTS, FLOATING_CART_VARIANTS } from '../../motion/variants';
import {
  APP_RELEASE,
  APP_UPDATE_LABEL,
  fetchLatestAppRelease,
  getAppDownloadUrl,
  isAppUpdateRequired,
} from '../../utils/appDownload';
import { trackAppDownloadClick } from '../../utils/analytics';

export const NativeAppUpdatePrompt = () => {
  const [appVersion, setAppVersion] = useState('');
  const [appBuild, setAppBuild] = useState(0);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState(APP_RELEASE);
  const [dismissed, setDismissed] = useState(false);

  const dismissKey = useMemo(
    () => `sjfc-app-update-dismissed:${releaseInfo.version}:${releaseInfo.build}`,
    [releaseInfo.build, releaseInfo.version],
  );

  useEffect(() => {
    if (!isNativeAppShell()) {
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    const loadVersion = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const [info, latestRelease] = await Promise.all([
          App.getInfo(),
          fetchLatestAppRelease({ signal: controller.signal }),
        ]);

        if (cancelled) {
          return;
        }

        const currentVersion = info.version || '0.0.0';
        const currentBuild = Number.parseInt(info.build || '0', 10) || 0;
        setAppVersion(currentVersion);
        setAppBuild(currentBuild);
        setReleaseInfo(latestRelease);
        setNeedsUpdate(isAppUpdateRequired(currentVersion, currentBuild, latestRelease));
      } catch {
        if (!cancelled) {
          setNeedsUpdate(false);
        }
      }
    };

    void loadVersion();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadVersion();
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setDismissed(window.localStorage.getItem(dismissKey) === 'true');
  }, [dismissKey]);

  const shouldShow = useMemo(
    () => isNativeAppShell() && needsUpdate && !dismissed,
    [dismissed, needsUpdate],
  );

  const handleDismiss = () => {
    setDismissed(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(dismissKey, 'true');
    }
  };

  const handleUpdate = () => {
    trackAppDownloadClick({ source: 'native-app-update-prompt' });
    window.location.assign(getAppDownloadUrl(releaseInfo));
  };

  return (
    <AnimatePresence>
      {shouldShow ? (
        <motion.aside
          animate="show"
          className="native-app-update-prompt"
          exit="exit"
          initial="hidden"
          variants={FLOATING_CART_VARIANTS}
        >
          <div className="native-app-update-copy">
            <span className="native-app-update-badge">
              <Sparkles size={15} />
              New app build available
            </span>
            <strong>
              Update from v{appVersion || 'older build'}{appBuild ? ` (${appBuild})` : ''} to v
              {releaseInfo.version}
            </strong>
            <p>
              Get the latest website design, features, and smoother native startup. Updated{' '}
              {releaseInfo.releaseDate}.
            </p>
          </div>

          <div className="native-app-update-actions">
            <motion.button
              animate="rest"
              className="btn btn-secondary"
              initial="rest"
              onClick={handleDismiss}
              type="button"
              variants={BUTTON_PRESS_VARIANTS}
              whileHover="hover"
              whileTap="tap"
            >
              Later
            </motion.button>
            <motion.button
              animate="rest"
              className="btn btn-primary"
              initial="rest"
              onClick={handleUpdate}
              type="button"
              variants={BUTTON_PRESS_VARIANTS}
              whileHover="hover"
              whileTap="tap"
            >
              <Download size={16} />
              {APP_UPDATE_LABEL}
            </motion.button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};
