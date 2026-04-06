import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/format';
import { getCartOfferState } from '../../utils/pricing';

const HIDDEN_PATHS = ['/cart', '/checkout'];

export const FloatingCartBar = () => {
  const location = useLocation();
  const { products, settings } = useAppData();
  const { itemCount, items } = useCart();

  const isHidden =
    itemCount === 0 ||
    HIDDEN_PATHS.some((path) => location.pathname.startsWith(path)) ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery');

  const cartState = getCartOfferState(items, products, settings?.deliveryRules);

  return (
    <AnimatePresence>
      {!isHidden ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="floating-cart-bar"
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        >
          <div className="floating-cart-bar-copy">
            <span className="floating-cart-badge">
              <ShoppingBag size={15} />
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            <strong>{formatCurrency(cartState.total)}</strong>
            <p>{cartState.offerMessage}</p>
          </div>
          <Link className="btn btn-primary floating-cart-bar-action" to="/cart">
            View Cart
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
