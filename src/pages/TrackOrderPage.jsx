import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, MapPinned } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { PromoBanner } from '../components/common/PromoBanner';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { ReviewRequestCard } from '../components/order/ReviewRequestCard';
import { TrackingMap } from '../components/order/TrackingMap';
import { SeoMeta } from '../components/seo/SeoMeta';
import { CONTENT_FADE_VARIANTS, CONTENT_STACK_VARIANTS, SURFACE_REVEAL_VARIANTS } from '../motion/variants';
import { formatDateTime, formatEtaLabel } from '../utils/format';
import { STORE_GOOGLE_REVIEW_URL } from '../utils/storefront';

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
          <motion.div
            animate="show"
            className="panel-card tracking-main-panel"
            initial="hidden"
            variants={SURFACE_REVEAL_VARIANTS}
          >
            {location.state?.justPlaced ? (
              <PromoBanner
                className="tracking-success-banner"
                description={`Order ${location.state.orderNumber || ''} is now being tracked live.`.trim()}
                eyebrow="Order live"
                title="Your order has been placed successfully"
                tone="success"
              />
            ) : null}
            <motion.div
              animate="show"
              className="tracking-header-stack"
              initial="hidden"
              variants={CONTENT_STACK_VARIANTS}
            >
              <motion.div className="tracking-heading-row" variants={CONTENT_FADE_VARIANTS}>
                <div>
                  <p className="eyebrow">Tracking #{order.orderNumber}</p>
                  <h1>{order.status}</h1>
                </div>
                <div className="tracking-status-pills">
                  <span className="tracking-status-pill is-live">Live tracking</span>
                  <span className="tracking-status-pill">{order.orderNumber}</span>
                </div>
              </motion.div>
              <motion.div className="order-meta-grid" variants={CONTENT_FADE_VARIANTS}>
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
              </motion.div>
            </motion.div>
            <OrderTimeline currentStatus={order.status} timeline={order.tracking?.timeline} />
          </motion.div>
          <motion.div
            animate="show"
            className="panel-card tracking-panel"
            initial="hidden"
            variants={SURFACE_REVEAL_VARIANTS}
          >
            <div className="tracking-panel-copy">
              <p className="eyebrow">Delivery map</p>
              <h3>Watch your order get closer</h3>
              <p>The rider location refreshes automatically, so you know exactly when to head to the door.</p>
            </div>
            <TrackingMap location={order.tracking?.currentLocation} />
          </motion.div>
        </div>
        {order.status === 'Delivered' ? (
          <div className="container tracking-review-wrap">
            <motion.div animate="show" initial="hidden" variants={SURFACE_REVEAL_VARIANTS}>
              <ReviewRequestCard orderId={order.id} reviewUrl={STORE_GOOGLE_REVIEW_URL} source="tracking-page" />
            </motion.div>
          </div>
        ) : null}
      </section>
    </PageTransition>
  );
};
