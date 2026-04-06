import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartActionToast = ({ toast, onDismiss }) => (
  <AnimatePresence>
    {toast ? (
      <motion.aside
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="cart-action-toast"
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        role="status"
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="cart-action-toast__icon">
          <CheckCircle2 size={18} />
        </div>
        <div className="cart-action-toast__copy">
          <strong>{toast.title}</strong>
          <p>{toast.message}</p>
        </div>
        <div className="cart-action-toast__actions">
          <Link className="btn btn-primary" onClick={onDismiss} to="/cart">
            <ShoppingBag size={16} />
            View cart
          </Link>
          <button
            aria-label="Dismiss cart message"
            className="cart-action-toast__close"
            onClick={onDismiss}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </motion.aside>
    ) : null}
  </AnimatePresence>
);
