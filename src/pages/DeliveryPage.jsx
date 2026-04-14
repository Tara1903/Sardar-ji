import { useEffect, useMemo, useState } from 'react';
import { Clock3, LogOut, MapPinned, PackageOpen } from 'lucide-react';
import { api } from '../api/client';
import { DeliveryOrderCard } from '../components/delivery/DeliveryOrderCard';
import { BrandLockup } from '../components/brand/BrandLockup';
import { Loader } from '../components/common/Loader';
import { ThemeSwitcher } from '../components/common/ThemeSwitcher';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAuth } from '../contexts/AuthContext';
import { DELIVERY_APP_FILTERS } from '../data/nativeShellConfig';
import { isNativeAppShell } from '../lib/nativeApp';
import { formatDateTime } from '../utils/format';

export const DeliveryPage = () => {
  const { token, logout, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [lastLocationPing, setLastLocationPing] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');
  const nativeAppShell = isNativeAppShell();

  const loadOrders = async () => {
    try {
      const response = await api.getOrders(token);
      setOrders(response);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId = 0;
    const canPoll = () =>
      typeof document === 'undefined' ||
      (document.visibilityState === 'visible' && navigator.onLine !== false);

    const stopPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = 0;
      }
    };

    const startPolling = () => {
      stopPolling();
      if (!canPoll()) {
        return;
      }

      void loadOrders();
      intervalId = window.setInterval(() => {
        if (canPoll()) {
          void loadOrders();
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
      stopPolling();
      window.removeEventListener('online', handleResume);
      document.removeEventListener('visibilitychange', handleResume);
    };
  }, [token]);

  useEffect(() => {
    if (!trackingOrderId) {
      return undefined;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return undefined;
    }

    let intervalId = 0;
    const canTrack = () =>
      typeof document === 'undefined' ||
      (document.visibilityState === 'visible' && navigator.onLine !== false);

    const sendLocation = () => {
      if (!canTrack()) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.updateDeliveryLocation(
              {
                orderId: trackingOrderId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              token,
            );
            setLastLocationPing(new Date().toISOString());
            setError('');
          } catch (locationError) {
            setError(locationError.message);
          }
        },
        (geolocationError) => setError(geolocationError.message),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        },
      );
    };

    const stopTracking = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = 0;
      }
    };

    const startTracking = () => {
      stopTracking();
      if (!canTrack()) {
        return;
      }

      sendLocation();
      intervalId = window.setInterval(sendLocation, 4000);
    };

    const handleResume = () => {
      startTracking();
    };

    startTracking();
    window.addEventListener('online', handleResume);
    document.addEventListener('visibilitychange', handleResume);

    return () => {
      stopTracking();
      window.removeEventListener('online', handleResume);
      document.removeEventListener('visibilitychange', handleResume);
    };
  }, [token, trackingOrderId]);

  const handleStatusChange = async (orderId, status) => {
    await api.updateOrderStatus(orderId, { status }, token);

    if (status === 'Out for Delivery') {
      setTrackingOrderId(orderId);
    }

    if (status === 'Delivered' && trackingOrderId === orderId) {
      setTrackingOrderId('');
    }

    await loadOrders();
  };

  const completedToday = useMemo(
    () =>
      orders.filter((order) => {
        if (order.status !== 'Delivered') {
          return false;
        }

        const today = new Date().toDateString();
        return new Date(order.updatedAt).toDateString() === today;
      }).length,
    [orders],
  );
  const filteredOrders = useMemo(() => {
    const matcher = DELIVERY_APP_FILTERS.find((entry) => entry.id === activeFilter)?.matcher;

    if (!matcher) {
      return orders;
    }

    return orders.filter(matcher);
  }, [activeFilter, orders]);

  if (loading) {
    return <Loader message="Loading delivery assignments..." />;
  }

  if (nativeAppShell) {
    return (
      <div className="native-role-shell native-delivery-shell">
        <SeoMeta noIndex path="/delivery" title="Delivery App" />

        <header className="native-role-header native-delivery-header">
          <div className="native-role-header-row">
            <BrandLockup className="native-role-brand" compact linkTo="/" showTagline={false} />
            <div className="native-role-header-actions">
              <ThemeSwitcher compact label="Delivery theme" />
              <button className="icon-btn" onClick={logout} type="button">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="native-role-copy">
            <p className="eyebrow">Delivery tasks</p>
            <h1>Welcome back, {user.name}. Your active route and customer actions are ready.</h1>
          </div>

          <div className="native-role-metrics">
            <article className="native-role-metric-card">
              <span>{orders.length}</span>
              <small>Assigned</small>
            </article>
            <article className="native-role-metric-card">
              <span>{trackingOrderId ? 'Live' : 'Idle'}</span>
              <small>GPS</small>
            </article>
            <article className="native-role-metric-card">
              <span>{completedToday}</span>
              <small>Done today</small>
            </article>
            <article className="native-role-metric-card">
              <span>{lastLocationPing ? formatDateTime(lastLocationPing) : 'Waiting'}</span>
              <small>Last ping</small>
            </article>
          </div>

          <div className="native-delivery-filter-row" role="tablist" aria-label="Delivery queues">
            {DELIVERY_APP_FILTERS.map((filter) => (
              <button
                className={`quick-chip ${activeFilter === filter.id ? 'active' : ''}`.trim()}
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </header>

        {error ? <p className="error-text native-role-error">{error}</p> : null}

        <main className="native-role-content native-delivery-content">
          <section className="native-delivery-grid">
            {filteredOrders.map((order) => (
              <DeliveryOrderCard
                key={order.id}
                onStartTracking={setTrackingOrderId}
                onStatusChange={handleStatusChange}
                order={order}
                trackingOrderId={trackingOrderId}
                variant="app"
              />
            ))}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="panel-page">
      <SeoMeta noIndex path="/delivery" title="Delivery Panel" />
      <header className="panel-header">
        <div>
          <BrandLockup className="panel-brand" compact linkTo="/" showTagline={false} />
          <p className="eyebrow">Delivery panel</p>
          <h1>Welcome, {user.name}</h1>
          <p>Assigned orders, customer addresses, and live GPS sharing in one place.</p>
        </div>
        <div className="panel-header-actions">
          <ThemeSwitcher compact label="Delivery theme" />
          <button className="btn btn-secondary" onClick={logout} type="button">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="panel-content">
        <section className="metrics-grid admin-metrics-grid">
          <article className="panel-card">
            <PackageOpen size={18} />
            <strong>{orders.length}</strong>
            <span>Assigned orders</span>
          </article>
          <article className="panel-card">
            <MapPinned size={18} />
            <strong>{trackingOrderId ? 'Live' : 'Idle'}</strong>
            <span>GPS sharing</span>
          </article>
          <article className="panel-card">
            <PackageOpen size={18} />
            <strong>{completedToday}</strong>
            <span>Completed today</span>
          </article>
          <article className="panel-card">
            <Clock3 size={18} />
            <strong>{lastLocationPing ? formatDateTime(lastLocationPing) : 'Waiting'}</strong>
            <span>Last location sync</span>
          </article>
        </section>

        {error ? <p className="error-text spaced">{error}</p> : null}

        <section className="delivery-grid">
          {orders.map((order) => (
            <DeliveryOrderCard
              key={order.id}
              onStartTracking={setTrackingOrderId}
              onStatusChange={handleStatusChange}
              order={order}
              trackingOrderId={trackingOrderId}
            />
          ))}
        </section>
      </main>
    </div>
  );
};
