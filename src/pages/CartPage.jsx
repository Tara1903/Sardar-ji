import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SmartImage } from '../components/common/SmartImage';
import { useCart } from '../contexts/CartContext';
import { useAppData } from '../contexts/AppDataContext';
import { computeCartPricing } from '../utils/pricing';
import { formatCurrency } from '../utils/format';

export const CartPage = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { settings } = useAppData();
  const totals = computeCartPricing(items, settings?.deliveryRules);

  if (!items.length) {
    return (
      <PageTransition>
        <section className="section first-section">
          <div className="container">
            <EmptyState
              title="Your cart is empty"
              description="Add a thali, paratha, or snack to start your order."
              action={
                <Link className="btn btn-primary" to="/menu">
                  Browse menu
                </Link>
              }
            />
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <SmartImage alt={item.name} className="cart-item-image" src={item.image} />
                <div className="cart-copy">
                  <div className="space-between">
                    <div>
                      <p className="eyebrow">{item.category}</p>
                      <h3>{item.name}</h3>
                    </div>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                  <p>{item.description}</p>
                  <div className="space-between">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button className="icon-btn" onClick={() => removeFromCart(item.id)} type="button">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="summary-card sticky">
            <div className="space-between">
              <h3>Bill summary</h3>
              <button className="btn btn-tertiary" onClick={clearCart} type="button">
                Clear cart
              </button>
            </div>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>
            <div className="summary-line">
              <span>Delivery fee</span>
              <strong>{formatCurrency(totals.deliveryFee)}</strong>
            </div>
            <div className="summary-line">
              <span>Handling</span>
              <strong>{formatCurrency(totals.handlingFee)}</strong>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <strong>{formatCurrency(totals.total)}</strong>
            </div>
            <p className="hint">
              {totals.qualifiesForFreeDelivery
                ? 'You unlocked FREE delivery on this order.'
                : `Add ${formatCurrency((settings?.deliveryRules?.freeDeliveryThreshold || 299) - totals.subtotal)} more for FREE delivery.`}
            </p>
            <Link className="btn btn-primary full-width" to="/checkout">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
};
