import { ArrowRight, BadgeCheck, MessageCircleMore, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SmartImage } from '../components/common/SmartImage';
import { ProductCard } from '../components/menu/ProductCard';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { createProductOrderMessage, createWhatsAppLink } from '../utils/whatsapp';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, settings } = useAppData();
  const { addToCart } = useCart();
  const product = products.find((entry) => entry.id === id);

  if (!product) {
    return (
      <PageTransition>
        <section className="section first-section">
          <div className="container">
            <EmptyState title="Product not found" description="This menu item may have been removed or is unavailable right now." />
          </div>
        </section>
      </PageTransition>
    );
  }

  const suggestions = products
    .filter((entry) => entry.category === product.category && entry.id !== product.id)
    .slice(0, 3);

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container detail-grid">
          <div className="detail-media">
            <SmartImage alt={product.name} className="detail-media-image" src={product.image} />
          </div>

          <div className="detail-copy">
            <span className="hero-chip">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="detail-price">{formatCurrency(product.price)}</p>
            <p>{product.description}</p>
            <div className="detail-list">
              <span>
                <BadgeCheck size={16} />
                {product.badge || 'Fresh daily'}
              </span>
              <span>
                <BadgeCheck size={16} />
                {product.isAvailable ? 'Available now' : 'Currently unavailable'}
              </span>
            </div>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => addToCart(product)} type="button">
                <ShoppingBag size={16} />
                Add to cart
              </button>
              <a
                className="btn btn-secondary"
                href={createWhatsAppLink(
                  settings?.whatsappNumber,
                  createProductOrderMessage(product.name, product.price),
                )}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircleMore size={16} />
                Order on WhatsApp
              </a>
            </div>
            <Link className="text-link" to="/menu">
              Back to menu
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {suggestions.length ? (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Suggested next</p>
                <h2>More from {product.category}</h2>
              </div>
            </div>
            <div className="grid cards-grid">
              {suggestions.map((item) => (
                <ProductCard key={item.id} product={item} whatsappNumber={settings?.whatsappNumber} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PageTransition>
  );
};
