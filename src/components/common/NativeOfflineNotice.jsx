import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { isNativeAppShell } from '../../lib/nativeApp';
import { FLOATING_CART_VARIANTS } from '../../motion/variants';

export const NativeOfflineNotice = () => {
  const [isVisible, setIsVisible] = useState(
    isNativeAppShell() && typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  useEffect(() => {
    if (!isNativeAppShell()) {
      return undefined;
    }

    const sync = () => setIsVisible(!navigator.onLine);

    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);

    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          animate="show"
          className="native-offline-banner"
          exit="exit"
          initial="hidden"
          variants={FLOATING_CART_VARIANTS}
        >
          <WifiOff size={18} />
          <div>
            <strong>You’re offline</strong>
            <span>Saved app screens stay available. Reconnect to place fresh orders.</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
