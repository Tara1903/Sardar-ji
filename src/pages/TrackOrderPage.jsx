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
import { useAppData } from '../contexts/AppDataContext';
import { CONTENT_FADE_VARIANTS, CONTENT_STACK_VARIANTS, SURFACE_REVEAL_VARIANTS } from '../motion/variants';
import { formatCurrency, formatDateTime, formatEtaLabel } from '../utils/format';
import { STORE_GOOGLE_REVIEW_URL } from '../utils/storefront';

const readTrackingCache = (orderId) => {
  if (typeof window === 'undefined' || !orderId) {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(`sjfc-tracking-cache:${orderId}`) || 'null');
  } catch {
    return null;
  }
};

const writeTrackingCache = (orderId, payload) => {
  if (typeof window === 'undefined' || !orderId) {
    return;
  }

  try {
    window.localStorage.setItem(
      `sjfc-tracking-cache:${orderId}`,
      JSON.stringify({
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignore storage failures so tracking continues.
  }
};

export const TrackOrderPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { appConfig } = useAppData();
  const cachedTracking = readTrackingCache(orderId);
  const [order, setOrder] = useState(cachedTracking || null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let intervalId = 0;

    const loadTracking = async () => {
      try {
        const response = await api.getTracking(orderId);
        if (!isMounted) {
          return;
        }
        setOrder(response);
        writeTrackingCache(orderId, response);
        setError('');
      } catch (trackingError) {
        if (isMounted && !cachedTracking) {
          setError(trackingError.message);
        }
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = 0;
      }
    };

    const canPoll = () =>
      typeof document === 'undefined' ||
      (document.visibilityState === 'visible' && navigator.onLine !== false);

    const startPolling = () => {
      stopPolling();
      if (!canPoll()) {
        return;
      }

      void loadTracking();
      intervalId = window.setInterval(() => {
        if (canPoll()) {
          void loadTracking();
        }
      }, 4000);
    };

    const handleResume = () => {
      startPolling();
    };

    startPolling();
    window.addEventListener('online', handleResume);
    document.addEventListener('visibilitychange', handleResume);

    return () => {
      isMounted = false;
      stopPolling();
      window.removeEventListener('online', handleResume);
      document.removeEventListener('visibilitychange', handleResume);
    };
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

  const orderItems = order.items || [];
  const deliveryAddress =
    order.address?.fullAddress ||
    'Delivery address syncs as soon as the order detail payload is available.';
  const driverName = order.assignedDeliveryBoyName || 'Delivery partner';
  const premiumCopy = appConfig?.copy || {};
  const etaLabel = formatEtaLabel(order.estimatedDeliveryAt);
  const etaHeadline =
    etaLabel === 'Arriving soon'
      ? 'Arriving shortly'
      : etaLabel === 'ETA updating'
        ? 'Delivery ETA updating'
        : `Arriving in ${etaLabel}`;

  return (
    <PageTransition>
      <SeoMeta noIndex path={`/track/${orderId}`} title={`Track Order ${order.orderNumber}`} />
      <section className="section first-section">
        <div className="container tracking-layout tracking-saffron-stack">
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
            className="panel-card tracking-saffron-hero"
            initial="hidden"
            variants={SURFACE_REVEAL_VARIANTS}
          >
            <div className="tracking-saffron-map">
              <TrackingMap location={order.tracking?.currentLocation} />
            </div>
            <motion.div
              animate="show"
              className="tracking-saffron-summary"
              initial="hidden"
              variants={CONTENT_STACK_VARIANTS}
            >
              <motion.div className="tracking-saffron-headline" variants={CONTENT_FADE_VARIANTS}>
                <div>
                  <p className="eyebrow">
                    {premiumCopy.trackingLabel || 'Live route'} • Order #{order.orderNumber}
                  </p>
                  <h1>{etaHeadline}</h1>
                  <p>{order.status} and refreshing live every few seconds.</p>
                </div>
                <div className="tracking-status-pills">
                  <span className="tracking-status-pill is-live">Live tracking</span>
                  <span className="tracking-status-pill">{order.status}</span>
                  {order.total ? (
                    <span className="tracking-status-pill">{formatCurrency(order.total)}</span>
                  ) : null}
                </div>
              </motion.div>

              <motion.div className="tracking-saffron-meta" variants={CONTENT_FADE_VARIANTS}>
                <div>
                  <Clock3 size={16} />
                  <span>{formatDateTime(order.estimatedDeliveryAt)}</span>
                </div>
                <div>
                  <MapPinned size={16} />
                  <span>{deliveryAddress}</span>
                </div>
              </motion.div>

              <motion.div className="tracking-live-rail" variants={CONTENT_FADE_VARIANTS}>
                <div>
                  <span>Refresh cadence</span>
                  <strong>Every 4 seconds</strong>
                </div>
                <div>
                  <span>Milestone flow</span>
                  <strong>Prep, dispatch, doorstep</strong>
                </div>
                <div>
                  <span>Delivery mode</span>
                  <strong>{order.paymentMethod || 'Standard order'}</strong>
                </div>
              </motion.div>

              <motion.div className="tracking-driver-card" variants={CONTENT_FADE_VARIANTS}>
                <div className="tracking-driver-avatar">
                  {(driverName || 'SJ')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div>
                  <strong>{driverName}</strong>
                  <p>{order.status === 'Delivered' ? 'Completed successfully' : 'Following the quickest route to you'}</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="tracking-saffron-grid">
            <motion.div
              animate="show"
              className="panel-card tracking-main-panel"
              initial="hidden"
              variants={SURFACE_REVEAL_VARIANTS}
            >
              <div className="tracking-panel-copy">
                <p className="eyebrow">Order progress</p>
                <h3>Watch each milestone clear</h3>
                <p>Preparation, dispatch, and last-mile updates stay in one timeline.</p>
              </div>
              <OrderTimeline currentStatus={order.status} timeline={order.tracking?.timeline} />
            </motion.div>

            <motion.div
              animate="show"
              className="panel-card tracking-panel tracking-order-summary-panel"
              initial="hidden"
              variants={SURFACE_REVEAL_VARIANTS}
            >
              <div className="tracking-panel-copy">
                <p className="eyebrow">Order summary</p>
                <h3>{orderItems.length} item{orderItems.length === 1 ? '' : 's'} in this delivery</h3>
                <p>Total payable {order.total ? `• ${formatCurrency(order.total)}` : ''}</p>
              </div>
              <div className="tracking-order-summary-list">
                {orderItems.slice(0, 5).map((item) => (
                  <div className="tracking-order-summary-row" key={`${order.id}-${item.id}-${item.name}`}>
                    <div>
                      <strong>{item.quantity}x {item.name}</strong>
                      {item.addonSummary ? <p>{item.addonSummary}</p> : null}
                    </div>
                    <span>{item.price ? formatCurrency(item.price * item.quantity) : ''}</span>
                  </div>
                ))}
                {!orderItems.length ? (
                  <div className="tracking-order-summary-row">
                    <div>
                      <strong>Order contents updating</strong>
                      <p>Live tracking is available even when the item payload arrives separately.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
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
