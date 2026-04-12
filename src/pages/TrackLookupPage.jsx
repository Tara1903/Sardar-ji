import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, MapPin, ReceiptText, Search, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { BUTTON_PRESS_VARIANTS } from '../motion/variants';
import { formatCurrency, formatDateOnly, formatDateTime } from '../utils/format';
import { triggerNativeHaptic } from '../lib/nativeFeatures';

const ACTIVE_STATUSES = new Set(['Pending', 'Confirmed', 'Preparing', 'Ready', 'On the way', 'Out for Delivery']);

export const TrackLookupPage = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { addItemsToCart } = useCart();
  const { products } = useAppData();
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);

      try {
        const response = await api.getOrders(token);

        if (!cancelled) {
          setOrders(response);
          setError('');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.has(order.status)),
    [orders],
  );
  const pastOrders = useMemo(
    () => orders.filter((order) => !ACTIVE_STATUSES.has(order.status)),
    [orders],
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!orderId.trim()) {
      return;
    }

    navigate(`/track/${orderId.trim()}`);
  };

  const handleReorder = (order) => {
    const nextItems = (order.items || [])
      .filter((item) => !item.isFreebie)
      .map((item) => {
        const matchedProduct = products.find((product) => product.id === item.id || product.name === item.name);

        return {
          ...(matchedProduct || item),
          ...item,
          image: matchedProduct?.image || item.image,
          category: matchedProduct?.category || item.category,
          quantity: item.quantity || 1,
        };
      });

    if (!nextItems.length) {
      navigate('/menu');
      return;
    }

    addItemsToCart(nextItems, { replace: true });
    void triggerNativeHaptic('success');
    navigate('/cart');
  };

  if (loading) {
    return <Loader message="Loading your orders..." />;
  }

  return (
    <PageTransition>
      <SeoMeta noIndex path="/track" title="Orders" />
      <section className="section first-section">
        <div className="container orders-hub-shell">
          <div className="orders-hub-overview">
            <div className="panel-card orders-hub-hero">
              <p className="eyebrow">Orders</p>
              <h1>Track active meals and reorder past favorites fast</h1>
              <p className="section-heading-note">
                This screen is designed like an app orders tab: active orders first, past orders next, and manual tracking still available.
              </p>
              <div className="orders-hub-meta">
                <span className="hero-chip">
                  <ReceiptText size={14} />
                  {orders.length} total orders
                </span>
                <span className="hero-chip">
                  <Clock3 size={14} />
                  {activeOrders.length} active now
                </span>
              </div>
            </div>

            <PromoBanner
              actions={
                <Link className="btn btn-primary" to="/menu">
                  Browse menu
                </Link>
              }
              className="orders-hub-side-banner"
              description={
                activeOrders.length
                  ? 'Open any active order below for its full timeline and delivery status.'
                  : 'No live order? Reorder a past favorite or browse the menu again.'
              }
              eyebrow="Quick action"
              title={activeOrders.length ? `${activeOrders.length} live order${activeOrders.length > 1 ? 's' : ''}` : 'No active order right now'}
              tone={activeOrders.length ? 'accent' : 'warning'}
            />
          </div>

          <div className="panel-card manual-track-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Manual tracking</p>
                <h2>Have an order ID?</h2>
              </div>
            </div>
            <form className="track-lookup-form" onSubmit={handleSubmit}>
              <label className="search-bar">
                <Search size={18} />
                <input
                  onChange={(event) => setOrderId(event.target.value)}
                  placeholder="Paste your order ID"
                  value={orderId}
                />
              </label>
              <button className="btn btn-primary" type="submit">
                Track order
              </button>
            </form>
            {!isAuthenticated ? (
              <p className="hint subtle-copy">Login to see your live order list, reorder history, and faster status tracking.</p>
            ) : null}
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          {isAuthenticated ? (
            <>
              <section className="app-section-block">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Active orders</p>
                    <h2>What’s moving right now</h2>
                  </div>
                </div>

                {activeOrders.length ? (
                  <div className="orders-active-grid">
                    {activeOrders.map((order, index) => (
                      <motion.article
                        animate={{ opacity: 1, y: 0 }}
                        className="panel-card order-hub-card"
                        initial={{ opacity: 0, y: 12 }}
                        key={order.id}
                        transition={{ delay: index * 0.04, duration: 0.22 }}
                      >
                        <div className="order-hub-card-head">
                          <div>
                            <p className="eyebrow">Active order</p>
                            <h3>{order.orderNumber}</h3>
                          </div>
                          <span className="status-pill">{order.status}</span>
                        </div>
                        <div className="order-hub-info">
                          <span>
                            <Clock3 size={14} />
                            {order.estimatedDeliveryAt
                              ? `ETA ${formatDateTime(order.estimatedDeliveryAt)}`
                              : 'ETA updating soon'}
                          </span>
                          <span>
                            <MapPin size={14} />
                            {order.address?.landmark || order.address?.fullAddress || 'Address confirmed'}
                          </span>
                        </div>
                        <div className="order-hub-items">
                          {(order.items || []).slice(0, 3).map((item) => (
                            <span key={`${order.id}-${item.lineId || item.id}`}>
                              {item.quantity} x {item.name}
                            </span>
                          ))}
                        </div>
                        <div className="order-hub-actions">
                          <Link className="btn btn-primary" to={`/track/${order.id}`}>
                            Track live
                          </Link>
                          <button className="btn btn-secondary" onClick={() => handleReorder(order)} type="button">
                            Reorder
                          </button>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    action={
                      <Link className="btn btn-primary" to="/menu">
                        Order now
                      </Link>
                    }
                    description="Once you place an order, live tracking will appear here first."
                    title="No active orders"
                  />
                )}
              </section>

              <section className="app-section-block">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Past orders</p>
                    <h2>Reorder familiar meals quickly</h2>
                  </div>
                </div>

                {pastOrders.length ? (
                  <div className="orders-history-list">
                    {pastOrders.map((order, index) => (
                      <motion.article
                        animate={{ opacity: 1, y: 0 }}
                        className="panel-card order-history-row"
                        initial={{ opacity: 0, y: 10 }}
                        key={order.id}
                        transition={{ delay: index * 0.03, duration: 0.18 }}
                      >
                        <div className="order-history-main">
                          <strong>{order.orderNumber}</strong>
                          <span>{formatDateOnly(order.createdAt)}</span>
                        </div>
                        <div className="order-history-main">
                          <strong>{formatCurrency(order.total)}</strong>
                          <span>{order.status}</span>
                        </div>
                        <div className="order-hub-actions">
                          <Link className="btn btn-secondary" to={`/track/${order.id}`}>
                            Details
                          </Link>
                          <motion.button
                            animate="rest"
                            className="btn btn-primary"
                            initial="rest"
                            onClick={() => handleReorder(order)}
                            type="button"
                            variants={BUTTON_PRESS_VARIANTS}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <ShoppingBag size={16} />
                            Reorder
                          </motion.button>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    action={
                      <Link className="btn btn-primary" to="/menu">
                        Browse food
                      </Link>
                    }
                    description="Your completed orders will stay here for quick repeat ordering."
                    title="No past orders yet"
                  />
                )}
              </section>
            </>
          ) : (
            <EmptyState
              action={
                <Link className="btn btn-primary" to="/auth?redirect=%2Ftrack">
                  Login for your orders
                </Link>
              }
              description="Login unlocks your live order tab, reorder shortcuts, and faster tracking."
              title="Track manually or login for the full orders view"
            />
          )}
        </div>
      </section>
    </PageTransition>
  );
};
