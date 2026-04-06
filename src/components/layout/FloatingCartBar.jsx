import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/format';
import { getCartOfferState } from '../../utils/pricing';
import { BUTTON_PRESS_VARIANTS, FLOATING_CART_BADGE_VARIANTS, FLOATING_CART_VARIANTS } from '../../motion/variants';

const HIDDEN_PATHS = ['/cart', '/checkout'];
const MotionLink = motion(Link);

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
          animate="show"
          className="floating-cart-bar"
          exit="exit"
          initial="hidden"
          layout
          variants={FLOATING_CART_VARIANTS}
        >
          <div className="floating-cart-bar-copy">
            <AnimatePresence mode="popLayout">
              <motion.span
                animate="animate"
                className="floating-cart-badge"
                exit="exit"
                initial="initial"
                key={itemCount}
                variants={FLOATING_CART_BADGE_VARIANTS}
              >
                <ShoppingBag size={15} />
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </motion.span>
            </AnimatePresence>
            <strong>{formatCurrency(cartState.total)}</strong>
            <p>{cartState.offerMessage}</p>
          </div>
          <MotionLink
            className="btn btn-primary floating-cart-bar-action"
            initial="rest"
            to="/cart"
            variants={BUTTON_PRESS_VARIANTS}
            whileHover="hover"
            whileTap="tap"
          >
            View Cart
            <ArrowRight size={16} />
          </MotionLink>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
