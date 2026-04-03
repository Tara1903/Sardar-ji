import { useEffect, useState } from 'react';
import { Gift, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { PageTransition } from '../components/common/PageTransition';
import { Loader } from '../components/common/Loader';
import { ReferralProgress } from '../components/referral/ReferralProgress';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime, initials } from '../utils/format';

export const ProfilePage = () => {
  const { user, token, logout, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [progress, setProgress] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [ordersResponse, referralResponse] = await Promise.all([
          api.getOrders(token),
          api.getReferralProgress(token),
        ]);
        setOrders(ordersResponse);
        setProgress(referralResponse);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleApplyReferral = async () => {
    try {
      const response = await api.applyReferral(referralCode, token);
      setProgress(response);
      await refreshUser();
      setReferralCode('');
      setError('');
    } catch (referralError) {
      setError(referralError.message);
    }
  };

  if (loading) {
    return <Loader message="Loading your profile..." />;
  }

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container profile-layout">
          <div className="profile-header panel-card">
            <div className="profile-avatar">{initials(user.name)}</div>
            <div>
              <p className="eyebrow">Customer profile</p>
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
            <button className="btn btn-secondary" onClick={logout} type="button">
              Logout
            </button>
          </div>

          <ReferralProgress progress={progress} />

          {!user.referralApplied ? (
            <div className="panel-card">
              <div className="space-between">
                <div>
                  <p className="eyebrow">Apply a referral</p>
                  <h3>Unlock progress from a friend’s code</h3>
                </div>
                <Gift size={18} />
              </div>
              <div className="inline-form">
                <input onChange={(event) => setReferralCode(event.target.value)} placeholder="Enter referral code" value={referralCode} />
                <button className="btn btn-primary" onClick={handleApplyReferral} type="button">
                  Apply
                </button>
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </div>
          ) : null}

          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Recent orders</p>
                <h2>Your latest meals</h2>
              </div>
              <Link className="text-link" to="/menu">
                <ShoppingBag size={16} />
                Reorder
              </Link>
            </div>
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-row" key={order.id}>
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <p>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div>
                    <strong>{formatCurrency(order.total)}</strong>
                    <p>{order.status}</p>
                  </div>
                  <Link className="btn btn-secondary" to={`/track/${order.id}`}>
                    Track
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
