import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const OtpSuccessPopup = ({ open, title, message, onClose }) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="otp-success-popup"
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          role="status"
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className="otp-success-popup__icon">
            <CheckCircle2 size={20} />
          </div>
          <div className="otp-success-popup__content">
            <strong>{title}</strong>
            <p>{message}</p>
          </div>
          <button
            aria-label="Close OTP confirmation"
            className="otp-success-popup__close"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
