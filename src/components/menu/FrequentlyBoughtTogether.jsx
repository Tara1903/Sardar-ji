import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../contexts/CartContext';

export const FrequentlyBoughtTogether = ({ items = [] }) => {
  const { addItemsToCart } = useCart();

  if (!items.length) {
    return null;
  }

  const comboTotal = items.reduce((total, item) => total + Number(item.price || 0), 0);

  return (
    <div className="panel-card frequently-bought-card">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Frequently bought together</p>
          <h3>Make it a stronger order</h3>
        </div>
        <Sparkles size={18} />
      </div>

      <div className="frequently-bought-list">
        {items.map((item) => (
          <Link className="frequently-bought-item" key={item.id} to={`/product/${item.id}`}>
            <div>
              <strong>{item.name}</strong>
              <p>{item.category}</p>
            </div>
            <span>{formatCurrency(item.price)}</span>
          </Link>
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={() =>
          addItemsToCart(
            items.map((item) => ({
              ...item,
              quantity: 1,
            })),
          )
        }
        type="button"
      >
        <Plus size={16} />
        Add all for {formatCurrency(comboTotal)}
      </button>
    </div>
  );
};
