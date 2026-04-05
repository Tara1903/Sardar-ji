import { CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const SubscriptionActivatedPopup = ({ open, redirectSeconds, onOpenPlan }) => (
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
            Monthly plan activated successfully
          </div>

          <h3>Your Monthly Thali plan is now active</h3>
          <p>
            Your subscription has been activated and the remaining days are now tracked inside your account.
          </p>

          <div className="order-placed-popup-meta">
            <span>
              <Sparkles size={16} />
              Monthly meals are ready to track from your profile
            </span>
            <span>
              <Clock3 size={16} />
              Opening your active plan in {redirectSeconds || 3} seconds
            </span>
          </div>

          <div className="order-placed-popup-actions">
            <button className="btn btn-primary full-width" onClick={onOpenPlan} type="button">
              Open my plan
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
