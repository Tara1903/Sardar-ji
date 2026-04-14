import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Smartphone, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { isNativeAppShell } from '../../lib/nativeApp';
import { BUTTON_PRESS_VARIANTS } from '../../motion/variants';
import {
  APP_DOWNLOAD_FILE_NAME,
  APP_DOWNLOAD_LABEL,
  APP_LATEST_VERSION,
  getAppDownloadUrl,
} from '../../utils/appDownload';
import { trackAppDownloadClick } from '../../utils/analytics';

const WEBSITE_DOWNLOAD_POPUP_KEY = 'sjfc-website-download-popup-v1';
const WEBSITE_DOWNLOAD_POPUP_DELAY_MS = 4200;

export const WebsiteDownloadPopup = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isNativeAppShell() || typeof window === 'undefined') {
      return undefined;
    }

    const blockedPaths = new Set(['/download-app', '/auth', '/checkout']);

    if (blockedPaths.has(location.pathname)) {
      setIsOpen(false);
      return undefined;
    }

    if (window.localStorage.getItem(WEBSITE_DOWNLOAD_POPUP_KEY) === 'seen') {
      setIsOpen(false);
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setIsOpen(true);
    }, WEBSITE_DOWNLOAD_POPUP_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [location.pathname]);

  const closePopup = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WEBSITE_DOWNLOAD_POPUP_KEY, 'seen');
    }

    setIsOpen(false);
  };

  const handleDownload = () => {
    trackAppDownloadClick({ source: 'website-download-popup' });
    closePopup();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="offer-popup-overlay mobile-popup-bottom-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={closePopup}
        >
          <motion.aside
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="offer-popup-sheet mobile-popup-sheet website-download-popup"
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              aria-label="Close app download popup"
              className="offer-popup-close"
              onClick={closePopup}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="website-download-popup-copy">
              <span className="website-download-popup-badge">
                <Smartphone size={15} />
                Mobile app available
              </span>
              <h3>Download the app for faster ordering</h3>
              <p>
                Install the Android app to get a more app-like menu flow, easier reordering, and
                quicker access to your cart and monthly plan.
              </p>
              <small>Signed APK • v{APP_LATEST_VERSION} • Pure veg ordering app</small>
            </div>

            <div className="offer-popup-actions">
              <motion.a
                className="btn btn-primary"
                download={APP_DOWNLOAD_FILE_NAME}
                href={getAppDownloadUrl()}
                initial="rest"
                onClick={handleDownload}
                rel="noreferrer"
                target="_blank"
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                <Download size={16} />
                {APP_DOWNLOAD_LABEL}
              </motion.a>
              <motion.div
                initial="rest"
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                <Link className="btn btn-secondary" onClick={closePopup} to="/download-app">
                  View details
                </Link>
              </motion.div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
