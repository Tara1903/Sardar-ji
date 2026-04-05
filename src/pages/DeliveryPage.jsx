import { useEffect, useMemo, useState } from 'react';
import { Clock3, LogOut, MapPinned, PackageOpen } from 'lucide-react';
import { api } from '../api/client';
import { DeliveryOrderCard } from '../components/delivery/DeliveryOrderCard';
import { BrandLockup } from '../components/brand/BrandLockup';
import { Loader } from '../components/common/Loader';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/format';

export const DeliveryPage = () => {
  const { token, logout, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [lastLocationPing, setLastLocationPing] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    loadOrders();
    const intervalId = window.setInterval(loadOrders, 4000);
    return () => window.clearInterval(intervalId);
  }, [token]);

  useEffect(() => {
    if (!trackingOrderId) {
      return undefined;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return undefined;
    }

    const sendLocation = () => {
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

    sendLocation();
    const intervalId = window.setInterval(sendLocation, 4000);
    return () => window.clearInterval(intervalId);
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

  if (loading) {
    return <Loader message="Loading delivery assignments..." />;
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
        <button className="btn btn-secondary" onClick={logout} type="button">
          <LogOut size={16} />
          Logout
        </button>
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
