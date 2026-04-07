import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleMore, X } from 'lucide-react';
import { createWhatsAppLink, createGeneralOrderMessage } from '../../utils/whatsapp';
import { createPopupStorageKey } from '../../theme/theme';

export const SpecialOfferPopup = ({ config, enabled = false, phoneNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupConfig = config || {};
  const popupStorageKey = createPopupStorageKey(popupConfig);

  useEffect(() => {
    if (!enabled || popupConfig.enabled === false || typeof window === 'undefined') {
      return undefined;
    }

    if (window.localStorage.getItem(popupStorageKey)) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setIsOpen(true);
    }, Number(popupConfig.delayMs) > 0 ? Number(popupConfig.delayMs) : 5000);

    return () => window.clearTimeout(timerId);
  }, [enabled, popupConfig.delayMs, popupConfig.enabled, popupStorageKey]);

  const closePopup = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(popupStorageKey, 'seen');
    }

    setIsOpen(false);
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
            animate={{ opacity: 1, y: 0 }}
            className="offer-popup-sheet mobile-popup-sheet"
            exit={{ opacity: 0, y: 32 }}
            initial={{ opacity: 0, y: 48 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <button
              aria-label="Close offer popup"
              className="offer-popup-close"
              onClick={closePopup}
              type="button"
            >
              <X size={18} />
            </button>

            <p className="eyebrow">{popupConfig.title || '🔥 Special Offer'}</p>
            <h3>{popupConfig.subtitle || '₹299 = Free Delivery (≤5km)'}</h3>
            <p>{popupConfig.body || '₹499 = FREE Delivery + FREE Mango Juice 🥭'}</p>
            <p className="spaced">
              {popupConfig.note ||
                'Stay above the threshold that fits your order and we apply the best reward automatically.'}
            </p>

            <div className="offer-popup-actions">
              <a
                className="btn btn-primary"
                href={createWhatsAppLink(phoneNumber, createGeneralOrderMessage())}
                onClick={closePopup}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircleMore size={16} />
                {popupConfig.primaryCta || 'Order Now'}
              </a>
              <button className="btn btn-secondary" onClick={closePopup} type="button">
                {popupConfig.secondaryCta || 'Maybe Later'}
              </button>
            </div>

            <small>{popupConfig.body || '₹499 = FREE Delivery + FREE Mango Juice 🥭'}</small>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
