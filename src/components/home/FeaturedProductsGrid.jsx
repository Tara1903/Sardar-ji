import { Link } from 'react-router-dom';
import { ProductCard } from '../menu/ProductCard';
import { SkeletonGrid } from '../common/Loader';

export const FeaturedProductsGrid = ({
  description = '',
  eyebrow = '',
  loading = false,
  products = [],
  title,
  viewAllTo = '/menu',
  whatsappNumber,
}) => (
  <section className="app-featured-products-section">
    <div className="section-heading compact">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="section-heading-note">{description}</p> : null}
      </div>
      <Link className="text-link" to={viewAllTo}>
        View all
      </Link>
    </div>

    {loading ? (
      <SkeletonGrid count={4} />
    ) : (
      <div className="app-featured-grid">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            motionIndex={index}
            product={product}
            whatsappNumber={whatsappNumber}
          />
        ))}
      </div>
    )}
  </section>
);
