import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { SmartImage } from '../common/SmartImage';
import { formatCurrency } from '../../utils/format';
import { createProductOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { STORE_AVERAGE_RATING } from '../../utils/catalog';

export const ProductCard = ({ product, whatsappNumber, variant = 'default' }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const isCompact = variant === 'compact';
  const quantity = getItemQuantity(product.id);

  return (
    <motion.article
      className={`product-card ${isCompact ? 'product-card-compact' : ''}`.trim()}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link className="product-image-wrap" to={`/product/${product.id}`}>
        <SmartImage
          alt={`${product.name} pure veg food delivery in Indore`}
          className="product-image"
          src={product.image}
        />
        {product.badge ? (
          <span className="product-badge">
            <Star size={14} />
            {product.badge}
          </span>
        ) : null}
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
        {quantity > 0 ? (
          <div className={`qty-control product-qty-control ${isCompact ? 'is-compact' : ''}`.trim()}>
            <button onClick={() => updateQuantity(product.id, quantity - 1)} type="button">
              <Minus size={16} />
            </button>
            <span className="product-qty-value">Qty {quantity}</span>
            <button onClick={() => updateQuantity(product.id, quantity + 1)} type="button">
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <motion.button
            className="btn btn-primary"
            onClick={() => addToCart(product)}
            type="button"
            whileTap={{ scale: 0.96 }}
          >
            <ShoppingBag size={16} />
            {isCompact ? '+ Add' : 'Add to cart'}
          </motion.button>
        )}
        {isCompact ? null : (
          <a
            className="btn btn-secondary"
            href={createWhatsAppLink(
              whatsappNumber,
              createProductOrderMessage(product.name, product.price),
            )}
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
