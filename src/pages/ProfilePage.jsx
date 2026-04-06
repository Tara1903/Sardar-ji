import { useEffect, useState } from 'react';
import { Gift, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PageTransition } from '../components/common/PageTransition';
import { Loader } from '../components/common/Loader';
import { ReferralProgress } from '../components/referral/ReferralProgress';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { ReviewRequestCard } from '../components/order/ReviewRequestCard';
import { formatCurrency, formatDateOnly, formatDateTime, initials } from '../utils/format';
import { STORE_GOOGLE_REVIEW_URL } from '../utils/storefront';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, logout, refreshUser } = useAuth();
  const { products } = useAppData();
  const { addItemsToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [progress, setProgress] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [rewardCoupons, setRewardCoupons] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [ordersResponse, referralResponse, subscriptionResponse, couponsResponse] = await Promise.allSettled([
          api.getOrders(token),
          api.getReferralProgress(token),
          api.getMySubscription(token),
          api.getRewardCoupons(token),
        ]);
        setOrders(ordersResponse.status === 'fulfilled' ? ordersResponse.value : []);
        setProgress(referralResponse.status === 'fulfilled' ? referralResponse.value : null);
        setSubscription(subscriptionResponse.status === 'fulfilled' ? subscriptionResponse.value : null);
        setRewardCoupons(couponsResponse.status === 'fulfilled' ? couponsResponse.value : []);
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

  const activeCoupons = rewardCoupons.filter(
    (coupon) => coupon.status === 'active' && (!coupon.expiresAt || new Date(coupon.expiresAt).getTime() > Date.now()),
  );
  const walletBalance = activeCoupons.reduce((total, coupon) => total + coupon.amount, 0);
  const lifetimeRewards = rewardCoupons.reduce((total, coupon) => total + coupon.amount, 0);
  const usedRewards = rewardCoupons
    .filter((coupon) => coupon.status === 'used')
    .reduce((total, coupon) => total + coupon.amount, 0);
  const activeSubscription = subscription?.status === 'active' && subscription?.daysLeft > 0;
  const latestDeliveredOrder = orders.find((order) => order.status === 'Delivered');

  const handleReorder = (order) => {
    const nextItems = (order.items || [])
      .filter((item) => !item.isFreebie)
      .map((item) => {
        const matchedProduct = products.find((product) => product.id === item.id || product.name === item.name);

        return {
          ...(matchedProduct || item),
          quantity: item.quantity || 1,
        };
      });

    if (!nextItems.length) {
      navigate('/menu');
      return;
    }

    addItemsToCart(nextItems, { replace: true });
    navigate('/cart');
  };

  return (
    <PageTransition>
      <SeoMeta noIndex path="/profile" title="Customer Profile" />
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

          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">My Subscription</p>
                <h3>Monthly plan status</h3>
              </div>
              <Link className="text-link" to="/my-subscription">
                View plan
              </Link>
            </div>
            <div className="summary-line">
              <span>Plan</span>
              <strong>{subscription?.planName || 'Monthly Thali'}</strong>
            </div>
            <div className="summary-line">
              <span>Status</span>
              <strong>{activeSubscription ? 'Active' : subscription ? 'Expired' : 'Not started'}</strong>
            </div>
            <div className="summary-line">
              <span>Days left</span>
              <strong>{activeSubscription ? `${subscription.daysLeft} days` : '0 days'}</strong>
            </div>
            <div className="summary-line">
              <span>Valid till</span>
              <strong>{subscription?.endDate ? formatDateOnly(subscription.endDate) : 'Start your plan'}</strong>
            </div>
          </div>

          {activeCoupons.length ? (
            <div className="panel-card">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Refer & earn wallet</p>
                  <h3>Rewards ready to use</h3>
                </div>
              </div>
              <div className="user-detail-grid">
                <div>
                  <span>Wallet balance</span>
                  <strong>{formatCurrency(walletBalance)}</strong>
                </div>
                <div>
                  <span>Lifetime earned</span>
                  <strong>{formatCurrency(lifetimeRewards)}</strong>
                </div>
                <div>
                  <span>Used rewards</span>
                  <strong>{formatCurrency(usedRewards)}</strong>
                </div>
                <div>
                  <span>Active coupons</span>
                  <strong>{activeCoupons.length}</strong>
                </div>
              </div>
              <div className="coupon-list">
                {activeCoupons.map((coupon) => (
                  <div className="coupon-row" key={coupon.id}>
                    <div>
                      <strong>{coupon.code}</strong>
                      <p>Expires {formatDateOnly(coupon.expiresAt)}</p>
                    </div>
                    <strong>{formatCurrency(coupon.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {latestDeliveredOrder ? (
            <ReviewRequestCard
              orderId={latestDeliveredOrder.id}
              reviewUrl={STORE_GOOGLE_REVIEW_URL}
              source="profile"
            />
          ) : null}

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
                  <div className="admin-button-stack">
                    <Link className="btn btn-secondary" to={`/track/${order.id}`}>
                      Track
                    </Link>
                    <button className="btn btn-primary" onClick={() => handleReorder(order)} type="button">
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
