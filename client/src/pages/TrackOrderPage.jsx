import { useEffect, useState } from 'react';
import { Clock3, MapPinned } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { TrackingMap } from '../components/order/TrackingMap';
import { formatDateTime } from '../utils/format';

export const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId === 'demo') {
      setOrder({
        id: 'demo',
        orderNumber: 'SJDEMO',
        status: 'Preparing',
        estimatedDeliveryAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        tracking: {
          timeline: [
            { status: 'Order Placed', timestamp: new Date().toISOString() },
            { status: 'Preparing', timestamp: new Date().toISOString() },
          ],
          currentLocation: null,
        },
      });
      return;
    }

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
    const intervalId = window.setInterval(loadTracking, 8000);
    return () => window.clearInterval(intervalId);
  }, [orderId]);

  if (error) {
    return (
      <PageTransition>
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
      <section className="section first-section">
        <div className="container tracking-layout">
          <div className="panel-card">
            <p className="eyebrow">Tracking #{order.orderNumber}</p>
            <h1>{order.status}</h1>
            <div className="order-meta-grid">
              <div>
                <Clock3 size={16} />
                <span>ETA: {formatDateTime(order.estimatedDeliveryAt)}</span>
              </div>
              <div>
                <MapPinned size={16} />
                <span>Live updates every few seconds</span>
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
