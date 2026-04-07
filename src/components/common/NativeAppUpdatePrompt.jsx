import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Sparkles } from 'lucide-react';
import { isNativeAppShell } from '../../lib/nativeApp';
import { BUTTON_PRESS_VARIANTS, FLOATING_CART_VARIANTS } from '../../motion/variants';
import {
  APP_LATEST_VERSION,
  APP_RELEASE_DATE,
  APP_UPDATE_LABEL,
  getAppDownloadUrl,
  isAppUpdateRequired,
} from '../../utils/appDownload';
import { trackAppDownloadClick } from '../../utils/analytics';

const DISMISS_KEY = `sjfc-app-update-dismissed:${APP_LATEST_VERSION}`;

export const NativeAppUpdatePrompt = () => {
  const [appVersion, setAppVersion] = useState('');
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(DISMISS_KEY) === 'true';
  });

  useEffect(() => {
    if (!isNativeAppShell()) {
      return undefined;
    }

    let cancelled = false;

    const loadVersion = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const info = await App.getInfo();

        if (cancelled) {
          return;
        }

        const currentVersion = info.version || '0.0.0';
        setAppVersion(currentVersion);
        setNeedsUpdate(isAppUpdateRequired(currentVersion));
      } catch {
        if (!cancelled) {
          setNeedsUpdate(false);
        }
      }
    };

    void loadVersion();

    return () => {
      cancelled = true;
    };
  }, []);

  const shouldShow = useMemo(
    () => isNativeAppShell() && needsUpdate && !dismissed,
    [dismissed, needsUpdate],
  );

  const handleDismiss = () => {
    setDismissed(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    }
  };

  const handleUpdate = () => {
    trackAppDownloadClick({ source: 'native-app-update-prompt' });
    window.location.assign(getAppDownloadUrl());
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
              Update from v{appVersion || 'older build'} to v{APP_LATEST_VERSION}
            </strong>
            <p>Get the latest design, features, and smoother app startup. Updated {APP_RELEASE_DATE}.</p>
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
