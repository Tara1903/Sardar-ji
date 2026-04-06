import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
import {
  BUTTON_PRESS_VARIANTS,
  CONTENT_FADE_VARIANTS,
  CONTENT_STACK_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  SURFACE_REVEAL_VARIANTS,
} from '../motion/variants';
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
  const totalSpend = orders.reduce((total, order) => total + (Number(order.total) || 0), 0);

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
        <motion.div animate="show" className="container profile-layout profile-layout-premium" initial="hidden" variants={CONTENT_STACK_VARIANTS}>
          <motion.div className="profile-header panel-card profile-header-premium" variants={SURFACE_REVEAL_VARIANTS}>
            <div className="profile-header-main">
              <div className="profile-avatar">{initials(user.name)}</div>
              <div className="profile-header-copy">
                <p className="eyebrow">Customer profile</p>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="profile-summary-pills">
              <span className="profile-summary-pill">{orders.length} orders</span>
              <span className="profile-summary-pill">{formatCurrency(totalSpend)} spent</span>
              <span className={`profile-summary-pill ${activeSubscription ? 'is-success' : ''}`}>
                {activeSubscription ? `${subscription.daysLeft} days left` : 'Plan inactive'}
              </span>
            </div>
            <motion.button
              animate="rest"
              className="btn btn-secondary"
              initial="rest"
              onClick={logout}
              type="button"
              variants={BUTTON_PRESS_VARIANTS}
              whileHover="hover"
              whileTap="tap"
            >
              Logout
            </motion.button>
          </motion.div>

          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <ReferralProgress progress={progress} />
          </motion.div>

          <motion.div className="panel-card profile-feature-card" variants={SURFACE_REVEAL_VARIANTS}>
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">My Subscription</p>
                <h3>Monthly plan status</h3>
              </div>
              <Link className="text-link" to="/my-subscription">
                View plan
              </Link>
            </div>
            <div className="user-detail-grid">
              <div>
                <span>Plan</span>
                <strong>{subscription?.planName || 'Monthly Thali'}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{activeSubscription ? 'Active' : subscription ? 'Expired' : 'Not started'}</strong>
              </div>
              <div>
                <span>Days left</span>
                <strong>{activeSubscription ? `${subscription.daysLeft} days` : '0 days'}</strong>
              </div>
              <div>
                <span>Valid till</span>
                <strong>{subscription?.endDate ? formatDateOnly(subscription.endDate) : 'Start your plan'}</strong>
              </div>
            </div>
          </motion.div>

          {activeCoupons.length ? (
            <motion.div className="panel-card profile-feature-card" variants={SURFACE_REVEAL_VARIANTS}>
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
                {activeCoupons.map((coupon, index) => (
                  <motion.div
                    className="coupon-row profile-coupon-row"
                    custom={index}
                    key={coupon.id}
                    variants={STAGGER_ITEM_VARIANTS}
                  >
                    <div>
                      <strong>{coupon.code}</strong>
                      <p>Expires {formatDateOnly(coupon.expiresAt)}</p>
                    </div>
                    <strong>{formatCurrency(coupon.amount)}</strong>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : null}

          {latestDeliveredOrder ? (
            <motion.div variants={SURFACE_REVEAL_VARIANTS}>
              <ReviewRequestCard
                orderId={latestDeliveredOrder.id}
                reviewUrl={STORE_GOOGLE_REVIEW_URL}
                source="profile"
              />
            </motion.div>
          ) : null}

          {!user.referralApplied ? (
            <motion.div className="panel-card profile-feature-card" variants={SURFACE_REVEAL_VARIANTS}>
              <div className="space-between">
                <div>
                  <p className="eyebrow">Apply a referral</p>
                  <h3>Unlock progress from a friend’s code</h3>
                </div>
                <Gift size={18} />
              </div>
              <div className="inline-form">
                <input onChange={(event) => setReferralCode(event.target.value)} placeholder="Enter referral code" value={referralCode} />
                <motion.button
                  animate="rest"
                  className="btn btn-primary"
                  initial="rest"
                  onClick={handleApplyReferral}
                  type="button"
                  variants={BUTTON_PRESS_VARIANTS}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Apply
                </motion.button>
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </motion.div>
          ) : null}

          <motion.div className="panel-card profile-feature-card" variants={SURFACE_REVEAL_VARIANTS}>
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
              {orders.map((order, index) => (
                <motion.div
                  className="order-row profile-order-row"
                  custom={index}
                  key={order.id}
                  variants={STAGGER_ITEM_VARIANTS}
                >
                  <div className="profile-order-copy">
                    <strong>{order.orderNumber}</strong>
                    <p>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="profile-order-copy">
                    <strong>{formatCurrency(order.total)}</strong>
                    <p>{order.status}</p>
                  </div>
                  <div className="admin-button-stack">
                    <Link className="btn btn-secondary" to={`/track/${order.id}`}>
                      Track
                    </Link>
                    <motion.button
                      animate="rest"
                      className="btn btn-primary"
                      initial="rest"
                      onClick={() => handleReorder(order)}
                      type="button"
                      variants={BUTTON_PRESS_VARIANTS}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Reorder
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>
    </PageTransition>
  );
};
