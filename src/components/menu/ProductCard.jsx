import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock3, Minus, Plus, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { getFallbackImage } from '../../data/fallbackImages';
import { SmartImage } from '../common/SmartImage';
import { formatCurrency } from '../../utils/format';
import { createProductOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { STORE_AVERAGE_RATING } from '../../utils/catalog';
import { trackWhatsAppClick } from '../../utils/analytics';
import {
  BUTTON_PRESS_VARIANTS,
  CARD_IMAGE_VARIANTS,
  CARD_MOTION_VARIANTS,
  QUANTITY_SWAP_VARIANTS,
} from '../../motion/variants';

export const ProductCard = ({ product, whatsappNumber, variant = 'default', motionIndex = 0 }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const isCompact = variant === 'compact';
  const quantity = getItemQuantity(product.id);

  return (
    <motion.article
      animate="show"
      className={`product-card ${isCompact ? 'product-card-compact' : ''}`.trim()}
      custom={motionIndex}
      initial="hidden"
      layout
      variants={CARD_MOTION_VARIANTS}
      whileHover="hover"
      whileTap="tap"
    >
      <Link className="product-image-wrap" to={`/product/${product.id}`}>
        <motion.div initial="rest" variants={CARD_IMAGE_VARIANTS} whileHover="hover">
          <SmartImage
            alt={`${product.name} pure veg food delivery in Indore`}
            className="product-image"
            fallbackSrc={getFallbackImage(product.category)}
            src={product.image}
          />
        </motion.div>
        <div className="product-image-topbar">
          <span className="product-image-chip">
            <Star fill="currentColor" size={13} />
            {STORE_AVERAGE_RATING.toFixed(1)}
          </span>
          <span className="product-image-chip">
            <Clock3 size={13} />
            {product.price >= 150 ? '30-40 min' : '20-30 min'}
          </span>
        </div>
        {product.badge ? (
          <span className="product-badge">
            <Sparkles size={14} />
            {product.badge}
          </span>
        ) : null}
        <div className="product-image-bottomfade" />
      </Link>
      <div className="product-copy">
        <div className="space-between">
          <div>
            <p className="eyebrow">{product.category}</p>
            <h3>{product.name}</h3>
          </div>
          <strong>{formatCurrency(product.price)}</strong>
        </div>
        <div className="product-meta-row">
          <span className="product-rating">
            <Star fill="currentColor" size={14} />
            {STORE_AVERAGE_RATING.toFixed(1)}
          </span>
          <span>{product.badge || 'Fresh today'}</span>
        </div>
        <p>{product.description}</p>
      </div>
      <div className="product-actions">
        <AnimatePresence initial={false} mode="popLayout">
          {quantity > 0 ? (
            <motion.div
              animate="animate"
              className={`qty-control product-qty-control ${isCompact ? 'is-compact' : ''}`.trim()}
              exit="exit"
              initial="initial"
              key="qty"
              layout
              variants={QUANTITY_SWAP_VARIANTS}
            >
              <motion.button
                initial="rest"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                type="button"
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                <Minus size={16} />
              </motion.button>
              <span className="product-qty-value">Qty {quantity}</span>
              <motion.button
                initial="rest"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                type="button"
                variants={BUTTON_PRESS_VARIANTS}
                whileHover="hover"
                whileTap="tap"
              >
                <Plus size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              animate="animate"
              className="btn btn-primary product-add-button"
              exit="exit"
              initial="initial"
              key="add"
              layout
              onClick={() => addToCart(product)}
              type="button"
              variants={QUANTITY_SWAP_VARIANTS}
              whileTap={{ scale: 0.96 }}
            >
              <ShoppingBag size={16} />
              {isCompact ? '+ Add' : 'Add to cart'}
            </motion.button>
          )}
        </AnimatePresence>
        {isCompact ? null : (
          <motion.a
            className="btn btn-secondary"
            href={createWhatsAppLink(
              whatsappNumber,
              createProductOrderMessage(product.name, product.price),
            )}
            onClick={() =>
              trackWhatsAppClick({
                source: 'product-card',
                label: product.name,
                value: product.price,
              })
            }
            rel="noreferrer"
            target="_blank"
            initial="rest"
            variants={BUTTON_PRESS_VARIANTS}
            whileHover="hover"
            whileTap="tap"
          >
            Order on WhatsApp
          </motion.a>
        )}
      </div>
    </motion.article>
  );
};
