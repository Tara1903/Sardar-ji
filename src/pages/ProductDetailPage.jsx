import { ArrowRight, BadgeCheck, MessageCircleMore, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SmartImage } from '../components/common/SmartImage';
import { FrequentlyBoughtTogether } from '../components/menu/FrequentlyBoughtTogether';
import { ProductCard } from '../components/menu/ProductCard';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { createProductOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import { createBreadcrumbSchema } from '../seo/siteSeo';
import { trackWhatsAppClick } from '../utils/analytics';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, settings } = useAppData();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const product = products.find((entry) => entry.id === id);
  const quantity = getItemQuantity(id);

  if (!product) {
    return (
      <PageTransition>
        <SeoMeta noIndex path={`/product/${id || ''}`} title="Product Not Found" />
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
  const frequentlyBoughtItems = products
    .filter((entry) => entry.id !== product.id && entry.isAvailable)
    .sort((left, right) => {
      const leftScore = Number(left.category === product.category) + Number(/lassi|chaach|beverage/i.test(left.category));
      const rightScore = Number(right.category === product.category) + Number(/lassi|chaach|beverage/i.test(right.category));
      return rightScore - leftScore;
    })
    .slice(0, 2);

  return (
    <PageTransition>
      <SeoMeta
        description={`${product.name} from Sardar Ji Food Corner. Pure veg food delivery in Indore with fresh daily ordering and quick checkout.`}
        includeLocalBusiness
        keywords={[
          `${product.name} Indore`,
          `${product.category} in Indore`,
          'pure veg food delivery Indore',
        ]}
        path={`/product/${product.id}`}
        schema={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Menu', path: '/menu' },
          { name: product.name, path: `/product/${product.id}` },
        ])}
        settings={settings}
        title={`${product.name} in Indore`}
      />
      <section className="section first-section">
        <div className="container detail-grid">
          <div className="detail-media">
            <SmartImage
              alt={`${product.name} home style thali and veg food in Indore`}
              className="detail-media-image"
              src={product.image}
            />
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
              {quantity > 0 ? (
                <div className="qty-control product-qty-control detail-qty-control">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} type="button">
                    <Minus size={16} />
                  </button>
                  <span className="product-qty-value">Qty {quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} type="button">
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => addToCart(product)} type="button">
                  <ShoppingBag size={16} />
                  Add to cart
                </button>
              )}
              <a
                className="btn btn-secondary"
                href={createWhatsAppLink(
                  settings?.whatsappNumber,
                  createProductOrderMessage(product.name, product.price),
                )}
                onClick={() =>
                  trackWhatsAppClick({
                    source: 'product-detail',
                    label: product.name,
                    value: product.price,
                  })
                }
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
            <FrequentlyBoughtTogether items={frequentlyBoughtItems} />
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
              {suggestions.map((item, index) => (
                <ProductCard
                  key={item.id}
                  motionIndex={index}
                  product={item}
                  whatsappNumber={settings?.whatsappNumber}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PageTransition>
  );
};
