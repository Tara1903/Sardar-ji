import { Link } from 'react-router-dom';
import { Gift, MapPin, MessageCircleMore, Minus, Plus, Trash2 } from 'lucide-react';
import { PromoBanner } from '../components/common/PromoBanner';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SmartImage } from '../components/common/SmartImage';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useCart } from '../contexts/CartContext';
import { useAppData } from '../contexts/AppDataContext';
import { getCartOfferState } from '../utils/pricing';
import { formatCurrency } from '../utils/format';
import { createCartOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import { useStoreDistance } from '../hooks/useStoreDistance';

export const CartPage = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { settings, products } = useAppData();
  const { distanceKm, locationStatus, isLocating } = useStoreDistance();
  const cartOfferState = getCartOfferState(
    items,
    products,
    settings?.deliveryRules,
    0,
    distanceKm,
  );

  if (!items.length) {
    return (
      <PageTransition>
        <SeoMeta noIndex path="/cart" title="Cart" />
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
      <SeoMeta noIndex path="/cart" title="Cart" />
      <section className="section first-section">
        <div className="container cart-layout">
          <div className="cart-list">
            <div className="panel-card cart-page-intro">
              <p className="eyebrow">Cart review</p>
              <h1>Almost there, your order looks good</h1>
              <p>
                Review items, update quantities, and head to checkout when you are ready. Your best
                delivery reward is already being tracked below.
              </p>
              <div className="cart-page-intro-chips">
                <span className="hero-chip">{items.length} dishes selected</span>
                <span className="hero-chip">{cartOfferState.offerMessage}</span>
              </div>
            </div>

            <PromoBanner
              description={
                cartOfferState.notDeliverable
                  ? cartOfferState.deliveryMessage
                  : cartOfferState.freebieUnlocked
                    ? 'The complimentary mango juice is now included in your order summary.'
                    : cartOfferState.deliveryMessage
              }
              eyebrow="Cart offer"
              title={cartOfferState.offerMessage}
              tone={
                cartOfferState.notDeliverable
                  ? 'danger'
                  : cartOfferState.freebieUnlocked || cartOfferState.deliveryFee === 0
                    ? 'success'
                    : 'warning'
              }
            />

            {cartOfferState.displayItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <SmartImage alt={item.name} className="cart-item-image" src={item.image} />
                <div className="cart-copy">
                  <div className="space-between">
                    <div>
                      <p className="eyebrow">{item.category}</p>
                      <h3>
                        {item.name}
                        {item.isFreebie ? (
                          <span className="freebie-inline-pill">
                            <Gift size={14} />
                            FREE
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <strong>{item.isFreebie ? 'FREE' : formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                  <p>{item.description}</p>
                  {item.isFreebie ? (
                    <div className="freebie-lock-row">
                      <Gift size={16} />
                      <span>Unlocked automatically with your ₹499+ order.</span>
                    </div>
                  ) : (
                    <div className="space-between cart-item-footer">
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
                  )}
                </div>
              </article>
            ))}
          </div>

          <aside className="summary-card sticky cart-summary-card">
            <div className="space-between">
              <h3>Bill summary</h3>
              <button className="btn btn-tertiary" onClick={clearCart} type="button">
                Clear cart
              </button>
            </div>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatCurrency(cartOfferState.subtotal)}</strong>
            </div>
            <div className="summary-line delivery-distance-line">
              <span>
                <MapPin size={14} />
                {isLocating ? 'Checking distance...' : locationStatus}
              </span>
              <strong>{distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'Manual'}</strong>
            </div>
            <div className="summary-line">
              <span>{cartOfferState.deliveryFeeLabel}</span>
              <strong>{cartOfferState.deliveryFee ? formatCurrency(cartOfferState.deliveryFee) : 'FREE'}</strong>
            </div>
            {cartOfferState.deliveryDiscount > 0 ? (
              <div className="summary-line summary-line-discount">
                <span>Delivery discount</span>
                <strong>-{formatCurrency(cartOfferState.deliveryDiscount)}</strong>
              </div>
            ) : null}
            {cartOfferState.freebieItem ? (
              <div className="summary-line summary-line-freebie">
                <span>{cartOfferState.freebieItem.name}</span>
                <strong>FREE</strong>
              </div>
            ) : null}
            <div className="summary-line total">
              <span>Total</span>
              <strong>{formatCurrency(cartOfferState.total)}</strong>
            </div>
            <p
              className={`hint cart-offer-hint ${
                cartOfferState.notDeliverable
                  ? 'is-danger'
                  : cartOfferState.freebieUnlocked || cartOfferState.deliveryFee === 0
                    ? 'is-success'
                    : 'is-warning'
              }`}
            >
              {cartOfferState.offerMessage}
            </p>
            {cartOfferState.deliveryDiscount > 0 ? (
              <p className="hint subtle-copy">
                Original delivery {formatCurrency(cartOfferState.baseDeliveryFee)} reduced to{' '}
                {cartOfferState.deliveryFee ? formatCurrency(cartOfferState.deliveryFee) : 'FREE'}.
              </p>
            ) : null}
            <a
              className="btn btn-secondary full-width"
              href={createWhatsAppLink(
                settings?.whatsappNumber,
                createCartOrderMessage(cartOfferState.displayItems, cartOfferState),
              )}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircleMore size={16} />
              Order on WhatsApp
            </a>
            <Link
              aria-disabled={cartOfferState.notDeliverable}
              className={`btn btn-primary full-width ${cartOfferState.notDeliverable ? 'is-disabled' : ''}`}
              onClick={(event) => {
                if (cartOfferState.notDeliverable) {
                  event.preventDefault();
                }
              }}
              to="/checkout"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
};
