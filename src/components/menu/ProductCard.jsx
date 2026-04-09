import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock3, Minus, Plus, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useProductCustomizer } from '../../contexts/ProductCustomizerContext';
import { getFallbackImage } from '../../data/fallbackImages';
import { SmartImage } from '../common/SmartImage';
import { formatCurrency } from '../../utils/format';
import { hasAddonGroups } from '../../utils/addons';
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
  const { addToCart, updateQuantity, getItemQuantity, getProductLines } = useCart();
  const { openCustomizer } = useProductCustomizer();
  const isCompact = variant === 'compact';
  const quantity = getItemQuantity(product.id);
  const customizable = hasAddonGroups(product);
  const configuredLines = getProductLines(product.id);
  const configuredLineCount = configuredLines.length;

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
        <motion.div
          className="product-image-motion"
          initial="rest"
          variants={CARD_IMAGE_VARIANTS}
          whileHover="hover"
        >
          <SmartImage
            alt={`${product.name} pure veg food delivery in Indore`}
            className="product-image"
            fallbackSrc={getFallbackImage(product.category)}
            sizes={
              isCompact
                ? '(max-width: 768px) 88vw, (max-width: 1180px) 42vw, 24vw'
                : '(max-width: 768px) 92vw, (max-width: 1180px) 42vw, 28vw'
            }
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
          {quantity > 0 && !customizable ? (
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
              onClick={() => {
                if (customizable) {
                  openCustomizer(product);
                  return;
                }

                addToCart(product);
              }}
              type="button"
              variants={QUANTITY_SWAP_VARIANTS}
              whileTap={{ scale: 0.96 }}
            >
              <ShoppingBag size={16} />
              {customizable
                ? quantity > 0
                  ? `Customize${isCompact ? '' : ` • ${quantity} in cart`}`
                  : isCompact
                    ? 'Options'
                    : 'Choose add-ons'
                : isCompact
                  ? '+ Add'
                  : 'Add to cart'}
            </motion.button>
          )}
        </AnimatePresence>
        {customizable && configuredLineCount ? (
          <span className="product-addon-meta">
            {configuredLineCount} {configuredLineCount === 1 ? 'configuration' : 'configurations'} in cart
          </span>
        ) : null}
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
