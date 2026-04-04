import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { SmartImage } from '../common/SmartImage';
import { formatCurrency } from '../../utils/format';
import { createProductOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';

export const ProductCard = ({ product, whatsappNumber }) => {
  const { addToCart } = useCart();

  return (
    <motion.article
      className="product-card"
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link className="product-image-wrap" to={`/product/${product.id}`}>
        <SmartImage alt={product.name} className="product-image" src={product.image} />
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
        <p>{product.description}</p>
      </div>
      <div className="product-actions">
        <button className="btn btn-primary" onClick={() => addToCart(product)} type="button">
          <ShoppingBag size={16} />
          Add to cart
        </button>
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
      </div>
    </motion.article>
  );
};
