import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleMore, X } from 'lucide-react';
import { createWhatsAppLink, createGeneralOrderMessage } from '../../utils/whatsapp';
import {
  SPECIAL_OFFER_POPUP_STORAGE_KEY,
  SPECIAL_OFFER_TITLE,
} from '../../utils/storefront';

export const SpecialOfferPopup = ({ enabled = false, phoneNumber }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    if (window.localStorage.getItem(SPECIAL_OFFER_POPUP_STORAGE_KEY)) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => window.clearTimeout(timerId);
  }, [enabled]);

  const closePopup = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SPECIAL_OFFER_POPUP_STORAGE_KEY, 'seen');
    }

    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="offer-popup-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={closePopup}
        >
          <motion.aside
            animate={{ opacity: 1, y: 0 }}
            className="offer-popup-sheet"
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

            <p className="eyebrow">🔥 Special Offer</p>
            <h3>₹299 = Free Delivery (≤5km)</h3>
            <p>
              ₹499 = FREE Delivery + FREE Mango Juice 🥭
            </p>
            <p className="spaced">
              Stay above the threshold that fits your order and we apply the best reward automatically.
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
                Order Now
              </a>
              <button className="btn btn-secondary" onClick={closePopup} type="button">
                Maybe Later
              </button>
            </div>

            <small>{SPECIAL_OFFER_TITLE}</small>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
