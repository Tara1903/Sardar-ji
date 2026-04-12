import { Link } from 'react-router-dom';
import { ProductCard } from '../menu/ProductCard';

export const HorizontalProductRow = ({
  description = '',
  eyebrow = '',
  products = [],
  title,
  viewAllTo = '/menu',
  whatsappNumber,
}) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className="app-product-row">
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

      <div className="app-product-track">
        {products.map((product, index) => (
          <div className="app-product-track-item" key={product.id}>
            <ProductCard
              motionIndex={index}
              product={product}
              variant="compact"
              whatsappNumber={whatsappNumber}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
