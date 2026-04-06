import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock3, Minus, Plus, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { SmartImage } from '../common/SmartImage';
import { formatCurrency } from '../../utils/format';
import { createProductOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { STORE_AVERAGE_RATING } from '../../utils/catalog';
import { trackWhatsAppClick } from '../../utils/analytics';

export const ProductCard = ({ product, whatsappNumber, variant = 'default' }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const isCompact = variant === 'compact';
  const quantity = getItemQuantity(product.id);

  return (
    <motion.article
      layout
      className={`product-card ${isCompact ? 'product-card-compact' : ''}`.trim()}
      transition={{ duration: 0.24 }}
      whileHover={{ y: -8, scale: 1.012 }}
      whileTap={{ scale: 0.992 }}
    >
      <Link className="product-image-wrap" to={`/product/${product.id}`}>
        <SmartImage
          alt={`${product.name} pure veg food delivery in Indore`}
          className="product-image"
          src={product.image}
        />
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
              animate={{ opacity: 1, scale: 1 }}
              className={`qty-control product-qty-control ${isCompact ? 'is-compact' : ''}`.trim()}
              exit={{ opacity: 0, scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.88 }}
              key="qty"
              layout
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                type="button"
                whileTap={{ scale: 0.92 }}
              >
                <Minus size={16} />
              </motion.button>
              <span className="product-qty-value">Qty {quantity}</span>
              <motion.button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                type="button"
                whileTap={{ scale: 0.92 }}
              >
                <Plus size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              animate={{ opacity: 1, scale: 1 }}
              className="btn btn-primary product-add-button"
              exit={{ opacity: 0, scale: 0.94 }}
              initial={{ opacity: 0, scale: 0.94 }}
              key="add"
              layout
              onClick={() => addToCart(product)}
              type="button"
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag size={16} />
              {isCompact ? '+ Add' : 'Add to cart'}
            </motion.button>
          )}
        </AnimatePresence>
        {isCompact ? null : (
          <a
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
          >
            Order on WhatsApp
          </a>
        )}
      </div>
    </motion.article>
  );
};
