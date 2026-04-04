import { CheckCircle2, Clock3, Radar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const OrderPlacedPopup = ({ open, orderNumber, redirectSeconds, totalLabel, onTrackNow }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        animate={{ opacity: 1 }}
        className="order-placed-popup-overlay"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="order-placed-popup-sheet"
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          role="dialog"
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className="order-placed-popup-badge">
            <CheckCircle2 size={18} />
            Your order is placed successfully
          </div>

          <h3>Your order has been confirmed</h3>
          <p>
            {orderNumber ? `Order ${orderNumber} has been confirmed.` : 'Your order has been confirmed.'}{' '}
            {totalLabel ? `Total: ${totalLabel}.` : ''} The kitchen has received it and we are preparing
            live tracking for you.
          </p>

          <div className="order-placed-popup-meta">
            <span>
              <Radar size={16} />
              Live order tracking starts automatically
            </span>
            <span>
              <Clock3 size={16} />
              Redirecting in {redirectSeconds || 4} seconds
            </span>
          </div>

          <div className="order-placed-popup-actions">
            <button className="btn btn-primary full-width" onClick={onTrackNow} type="button">
              Track order now
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
