import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, MapPinned } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageTransition } from '../components/common/PageTransition';
import { Loader } from '../components/common/Loader';
import { formatCurrency, formatDateTime } from '../utils/format';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.getTracking(orderId).then(setOrder);
  }, [orderId]);

  if (!order) {
    return <Loader message="Loading your order confirmation..." />;
  }

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container center-stack success-shell">
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
              <span>ETA: {formatDateTime(order.estimatedDeliveryAt)}</span>
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
