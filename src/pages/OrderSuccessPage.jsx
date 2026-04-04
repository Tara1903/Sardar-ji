import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, MapPinned, Radar } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime, formatEtaLabel } from '../utils/format';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [redirectSeconds, setRedirectSeconds] = useState(4);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await api.getOrder(orderId, token);
        setOrder(response);
        setError('');
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadOrder();
  }, [orderId, token]);

  useEffect(() => {
    if (!order?.id) {
      return undefined;
    }

    setRedirectSeconds(4);
    const intervalId = window.setInterval(() => {
      setRedirectSeconds((current) => (current > 1 ? current - 1 : current));
    }, 1000);
    const timeoutId = window.setTimeout(() => {
      navigate(`/track/${order.id}`, {
        replace: true,
        state: {
          justPlaced: true,
          orderNumber: order.orderNumber,
        },
      });
    }, 3600);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [navigate, order]);

  if (error) {
    return (
      <PageTransition>
        <section className="section first-section">
          <div className="container">
            <EmptyState description={error} title="Order confirmation unavailable" />
          </div>
        </section>
      </PageTransition>
    );
  }

  if (!order) {
    return <Loader message="Loading your order confirmation..." />;
  }

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container center-stack success-shell">
          <div className="success-popup">
            <div className="success-popup-icon">
              <Radar size={18} />
            </div>
            <div>
              <strong>Order placed successfully</strong>
              <p>Opening live tracking automatically in {redirectSeconds} seconds.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(`/track/${order.id}`, {
                  replace: true,
                  state: {
                    justPlaced: true,
                    orderNumber: order.orderNumber,
                  },
                })
              }
              type="button"
            >
              Track now
            </button>
          </div>

          <div className="success-mark">
            <CheckCircle2 size={72} />
          </div>
          <p className="eyebrow">Order confirmed</p>
          <h1>Thank you, your meal is on the way.</h1>
          <p>Your order has been received by Sardar Ji Food Corner.</p>

          <div className="success-grid">
            <div className="panel-card">
              <h3>Order details</h3>
              <p>Order ID: {order.orderNumber}</p>
              <p>Total: {formatCurrency(order.total)}</p>
              <p>Payment: {order.paymentMethod}</p>
              <div className="order-mini-list">
                {order.items.map((item, index) => (
                  <div className="summary-line" key={`${order.id}-${item.id || index}`}>
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <strong>{item.isFreebie ? 'FREE' : formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel-card">
              <h3>Delivery address</h3>
              <p>{order.address.fullAddress}</p>
              <p>{order.address.landmark}</p>
              <p>{order.address.pincode}</p>
            </div>
          </div>

          <div className="order-meta-grid wide">
            <div>
              <Clock3 size={16} />
              <span>
                ETA: {formatEtaLabel(order.estimatedDeliveryAt)} ({formatDateTime(order.estimatedDeliveryAt)})
              </span>
            </div>
            <div>
              <MapPinned size={16} />
              <span>Status: {order.status}</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link className="btn btn-primary" to={`/track/${order.id}`}>
              Track order
            </Link>
            <Link className="btn btn-secondary" to="/menu">
              Order something else
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
