import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CheckCircle2, Truck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const toastIcon = {
  admin: BellRing,
  customer: Truck,
  success: CheckCircle2,
};

export const NotificationCenter = () => {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="notification-stack" aria-live="polite" aria-relevant="additions text">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toastIcon[toast.kind] || BellRing;

          return (
            <motion.aside
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`notification-toast notification-toast--${toast.kind || 'info'}`}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              key={toast.id}
              role="status"
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="notification-toast__icon">
                <Icon size={18} />
              </div>
              <div className="notification-toast__copy">
                <strong>{toast.title}</strong>
                <p>{toast.message}</p>
              </div>
              <div className="notification-toast__actions">
                {toast.actionTo ? (
                  <Link className="btn btn-primary" onClick={() => dismissToast(toast.id)} to={toast.actionTo}>
                    {toast.actionLabel || 'Open'}
                  </Link>
                ) : null}
                <button
                  aria-label="Dismiss notification"
                  className="notification-toast__close"
                  onClick={() => dismissToast(toast.id)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.aside>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
