import { useEffect, useState } from 'react';
import { Clock3, MapPinned } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { PromoBanner } from '../components/common/PromoBanner';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { TrackingMap } from '../components/order/TrackingMap';
import { SeoMeta } from '../components/seo/SeoMeta';
import { formatDateTime, formatEtaLabel } from '../utils/format';

export const TrackOrderPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTracking = async () => {
      try {
        const response = await api.getTracking(orderId);
        setOrder(response);
        setError('');
      } catch (trackingError) {
        setError(trackingError.message);
      }
    };

    loadTracking();
    const intervalId = window.setInterval(loadTracking, 4000);
    return () => window.clearInterval(intervalId);
  }, [orderId]);

  if (error) {
    return (
      <PageTransition>
        <SeoMeta noIndex path={`/track/${orderId || ''}`} title="Tracking Unavailable" />
        <section className="section first-section">
          <div className="container">
            <EmptyState title="Tracking unavailable" description={error} />
          </div>
        </section>
      </PageTransition>
    );
  }

  if (!order) {
    return <Loader message="Fetching live order updates..." />;
  }

  return (
    <PageTransition>
      <SeoMeta noIndex path={`/track/${orderId}`} title={`Track Order ${order.orderNumber}`} />
      <section className="section first-section">
        <div className="container tracking-layout">
          <div className="panel-card">
            {location.state?.justPlaced ? (
              <PromoBanner
                className="tracking-success-banner"
                description={`Order ${location.state.orderNumber || ''} is now being tracked live.`.trim()}
                eyebrow="Order live"
                title="Your order has been placed successfully"
                tone="success"
              />
            ) : null}
            <p className="eyebrow">Tracking #{order.orderNumber}</p>
            <h1>{order.status}</h1>
            <div className="order-meta-grid">
              <div>
                <Clock3 size={16} />
                <span>
                  ETA: {formatEtaLabel(order.estimatedDeliveryAt)} ({formatDateTime(order.estimatedDeliveryAt)})
                </span>
              </div>
              <div>
                <MapPinned size={16} />
                <span>Live updates every 4 seconds</span>
              </div>
            </div>
            <OrderTimeline currentStatus={order.status} timeline={order.tracking?.timeline} />
          </div>
          <div className="panel-card tracking-panel">
            <TrackingMap location={order.tracking?.currentLocation} />
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
