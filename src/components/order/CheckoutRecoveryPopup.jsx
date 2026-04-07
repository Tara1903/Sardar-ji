import { MessageCircleMore, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackWhatsAppClick } from '../../utils/analytics';

export const CheckoutRecoveryPopup = ({ onDismiss, recovery }) => {
  if (!recovery) {
    return null;
  }

  return (
    <div className="checkout-recovery-popup mobile-popup-base mobile-popup-bottom mobile-popup-nav-clear" role="status">
      <div className="checkout-recovery-copy">
        <p className="eyebrow">Checkout saved</p>
        <strong>Finish your order from where you left off</strong>
        <p>
          {recovery.itemCount} item{recovery.itemCount === 1 ? '' : 's'} waiting • {recovery.totalLabel}
        </p>
      </div>

      <div className="checkout-recovery-actions">
        <a
          className="btn btn-secondary"
          href={recovery.whatsappLink}
          onClick={() =>
            trackWhatsAppClick({
              source: 'checkout-recovery',
              label: 'recover-order',
            })
          }
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircleMore size={16} />
          Recover on WhatsApp
        </a>
        <Link className="btn btn-primary" onClick={onDismiss} to="/checkout">
          <ShoppingBag size={16} />
          Resume checkout
        </Link>
        <button className="btn btn-tertiary" onClick={onDismiss} type="button">
          Dismiss
        </button>
      </div>
    </div>
  );
};
