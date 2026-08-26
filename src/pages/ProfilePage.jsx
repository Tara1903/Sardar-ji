import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  LogOut,
  Mail,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
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
import { triggerNativeHaptic } from '../lib/nativeFeatures';

const ACTIVE_ORDER_STATUSES = new Set([
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'On the way',
  'Out for Delivery',
]);

const readProfileCache = (userId) => {
  if (typeof window === 'undefined' || !userId) {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(`sjfc-profile-cache:${userId}`) || 'null');
  } catch {
    return null;
  }
};

const writeProfileCache = (userId, payload) => {
  if (typeof window === 'undefined' || !userId) {
    return;
  }

  try {
    window.localStorage.setItem(
      `sjfc-profile-cache:${userId}`,
      JSON.stringify({
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignore storage limits so profile stays usable.
  }
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, logout, refreshUser } = useAuth();
  const { appConfig, products } = useAppData();
  const { addItemsToCart } = useCart();
  const cachedProfile = readProfileCache(user?.id);
  const [orders, setOrders] = useState(cachedProfile?.orders || []);
  const [progress, setProgress] = useState(cachedProfile?.progress || null);
  const [subscription, setSubscription] = useState(cachedProfile?.subscription || null);
  const [rewardCoupons, setRewardCoupons] = useState(cachedProfile?.rewardCoupons || []);
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!cachedProfile);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [ordersResponse, referralResponse, subscriptionResponse, couponsResponse] = await Promise.allSettled([
          api.getOrders(token),
          api.getReferralProgress(token),
          api.getMySubscription(token),
          api.getRewardCoupons(token),
        ]);
        const nextProfileState = {
          orders: ordersResponse.status === 'fulfilled' ? ordersResponse.value : [],
          progress: referralResponse.status === 'fulfilled' ? referralResponse.value : null,
          subscription: subscriptionResponse.status === 'fulfilled' ? subscriptionResponse.value : null,
          rewardCoupons: couponsResponse.status === 'fulfilled' ? couponsResponse.value : [],
        };

        setOrders(nextProfileState.orders);
        setProgress(nextProfileState.progress);
        setSubscription(nextProfileState.subscription);
        setRewardCoupons(nextProfileState.rewardCoupons);
        writeProfileCache(user?.id, nextProfileState);
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
  const activeOrder = orders.find((order) => ACTIVE_ORDER_STATUSES.has(order.status));
  const latestDeliveredOrder = orders.find((order) => order.status === 'Delivered');
  const totalSpend = orders.reduce((total, order) => total + (Number(order.total) || 0), 0);
  const premiumCopy = appConfig?.copy || {};

  const handleReorder = (order) => {
    const nextItems = (order.items || [])
      .filter((item) => !item.isFreebie)
      .map((item) => {
        const matchedProduct = products.find((product) => product.id === item.id || product.name === item.name);

        return {
          ...(matchedProduct || item),
          ...item,
          image: matchedProduct?.image || item.image,
          category: matchedProduct?.category || item.category,
          quantity: item.quantity || 1,
        };
      });

    if (!nextItems.length) {
      navigate('/menu');
      return;
    }

    addItemsToCart(nextItems, { replace: true });
    void triggerNativeHaptic('success');
    navigate('/cart');
  };

  return (
    <PageTransition>
      <SeoMeta noIndex path="/profile" title="Customer Profile" />
      <section className="section first-section">
        <motion.div
          animate="show"
          className="container profile-layout profile-hub-layout"
          initial="hidden"
          variants={CONTENT_STACK_VARIANTS}
        >
          <motion.div className="panel-card profile-hub-hero" variants={SURFACE_REVEAL_VARIANTS}>
            <div className="profile-hub-hero-main">
              <div className="profile-avatar profile-hub-avatar">{initials(user.name)}</div>
              <div className="profile-hub-copy">
                <p className="eyebrow">{premiumCopy.profileLabel || 'Membership and account'}</p>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
              </div>
              <Link className="icon-btn profile-hub-settings" to="/settings">
                <Settings size={18} />
              </Link>
            </div>
            <div className="profile-summary-pills">
              <span className="profile-summary-pill">{orders.length} orders</span>
              <span className="profile-summary-pill">{formatCurrency(totalSpend)} spent</span>
              <span className={`profile-summary-pill ${activeSubscription ? 'is-success' : ''}`}>
                {activeSubscription ? `${subscription.daysLeft} days left` : 'Plan inactive'}
              </span>
            </div>
          </motion.div>

          <motion.div className="profile-hub-stats" variants={CONTENT_FADE_VARIANTS}>
            <article className="panel-card profile-stat-card">
              <span>Wallet</span>
              <strong>{formatCurrency(walletBalance)}</strong>
              <p>{activeCoupons.length} active reward coupons</p>
            </article>
            <article className="panel-card profile-stat-card">
              <span>Plan</span>
              <strong>{subscription?.planName || 'Monthly Thali'}</strong>
              <p>{activeSubscription ? `${subscription.daysLeft} days remaining` : 'Start your first monthly plan'}</p>
            </article>
            <article className="panel-card profile-stat-card">
              <span>Rewards earned</span>
              <strong>{formatCurrency(lifetimeRewards)}</strong>
              <p>{formatCurrency(usedRewards)} already redeemed</p>
            </article>
          </motion.div>

          <motion.div className="profile-hub-grid" variants={CONTENT_FADE_VARIANTS}>
            <motion.section className="panel-card profile-hub-section" variants={SURFACE_REVEAL_VARIANTS}>
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Quick access</p>
                  <h2>Everything important in one tap</h2>
                </div>
              </div>
              <div className="profile-action-list">
                {activeOrder ? (
                  <Link className="profile-action-row" to={`/track/${activeOrder.id}`}>
                    <div>
                      <strong>Track current order</strong>
                      <p>{activeOrder.orderNumber} is {activeOrder.status}</p>
                    </div>
                    <ReceiptText size={18} />
                  </Link>
                ) : null}
                <Link className="profile-action-row" to="/my-subscription">
                  <div>
                    <strong>Manage subscription</strong>
                    <p>
                      {activeSubscription
                        ? `Valid till ${formatDateOnly(subscription.endDate)}`
                        : 'Pause, resume, or start a monthly plan'}
                    </p>
                  </div>
                  <ShieldCheck size={18} />
                </Link>
                <Link className="profile-action-row" to="/settings">
                  <div>
                    <strong>Open settings</strong>
                    <p>Theme, notifications, profile comfort, and support.</p>
                  </div>
                  <Settings size={18} />
                </Link>
                <a
                  className="profile-action-row"
                  href="mailto:support@sardarjifoodcorner.shop?subject=Sardar%20Ji%20Support"
                >
                  <div>
                    <strong>Support</strong>
                    <p>Reach the team directly if you need help with an order.</p>
                  </div>
                  <Mail size={18} />
                </a>
              </div>
            </motion.section>

            <motion.section className="panel-card profile-hub-section" variants={SURFACE_REVEAL_VARIANTS}>
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Referral progress</p>
                  <h2>Rewards that keep stacking</h2>
                </div>
              </div>
              <ReferralProgress progress={progress} />
              {!user.referralApplied ? (
                <div className="profile-referral-apply">
                  <div className="profile-referral-copy">
                    <Gift size={18} />
                    <div>
                      <strong>Apply a referral code</strong>
                      <p>Unlock progress from a friend’s invite and move faster toward rewards.</p>
                    </div>
                  </div>
                  <div className="inline-form">
                    <input
                      onChange={(event) => setReferralCode(event.target.value)}
                      placeholder="Enter referral code"
                      value={referralCode}
                    />
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
                </div>
              ) : null}
            </motion.section>
          </motion.div>

          {latestDeliveredOrder ? (
            <motion.div variants={SURFACE_REVEAL_VARIANTS}>
              <ReviewRequestCard
                orderId={latestDeliveredOrder.id}
                reviewUrl={STORE_GOOGLE_REVIEW_URL}
                source="profile"
              />
            </motion.div>
          ) : null}

          <motion.div className="panel-card profile-feature-card profile-orders-section" variants={SURFACE_REVEAL_VARIANTS}>
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Recent orders</p>
                <h2>Your latest meals</h2>
              </div>
              <Link className="text-link" to="/menu">
                <ShoppingBag size={16} />
                Browse menu
              </Link>
            </div>
            <div className="orders-list">
              {orders.slice(0, 6).map((order, index) => (
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

          <motion.div className="profile-hub-footer" variants={SURFACE_REVEAL_VARIANTS}>
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
              <LogOut size={16} />
              Log out
            </motion.button>
          </motion.div>
        </motion.div>
      </section>
    </PageTransition>
  );
};
