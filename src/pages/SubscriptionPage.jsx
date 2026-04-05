import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Loader } from '../components/common/Loader';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { formatCurrency, formatDateOnly } from '../utils/format';
import {
  MONTHLY_SUBSCRIPTION_BENEFITS,
  MONTHLY_SUBSCRIPTION_DESCRIPTION,
  MONTHLY_SUBSCRIPTION_DURATION_DAYS,
  MONTHLY_SUBSCRIPTION_PLAN_NAME,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../utils/subscription';
import { useAuth } from '../contexts/AuthContext';

export const SubscriptionPage = () => {
  const { token } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await api.getMySubscription(token);
        setSubscription(response);
        setError('');
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [token]);

  const isActive = subscription?.status === 'active' && subscription?.daysLeft > 0;
  const statusTone = isActive ? 'success' : subscription ? 'warning' : 'accent';
  const statusTitle = isActive
    ? `${subscription.daysLeft} day${subscription.daysLeft === 1 ? '' : 's'} left on your plan`
    : subscription
      ? 'Your previous plan has expired'
      : 'Activate your Monthly Thali plan';
  const statusDescription = isActive
    ? `Your plan stays active till ${formatDateOnly(subscription.endDate)}.`
    : subscription
      ? `Renew to restart a fresh ${MONTHLY_SUBSCRIPTION_DURATION_DAYS}-day cycle.`
      : 'Subscribe once and track your validity directly from your account.';

  const detailRows = useMemo(
    () =>
      [
        ['Plan Name', MONTHLY_SUBSCRIPTION_PLAN_NAME],
        ['Status', isActive ? 'Active' : subscription ? 'Expired' : 'Not started'],
        ['Days Left', isActive ? `${subscription.daysLeft} days` : '0 days'],
        ['Start Date', subscription?.startDate ? formatDateOnly(subscription.startDate) : 'Not started'],
        ['End Date', subscription?.endDate ? formatDateOnly(subscription.endDate) : 'Not started'],
      ],
    [isActive, subscription],
  );

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const response = await api.subscribeToMonthlyPlan(token);
      setSubscription(response);
      setError('');
    } catch (subscribeError) {
      setError(subscribeError.message);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your monthly plan..." />;
  }

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container subscription-page-layout">
          <div className="subscription-page-main">
            <div className="panel-card subscription-plan-card">
              <div className="space-between">
                <div>
                  <p className="eyebrow">Monthly Plan</p>
                  <h1>{MONTHLY_SUBSCRIPTION_PLAN_NAME}</h1>
                  <p>{MONTHLY_SUBSCRIPTION_DESCRIPTION}</p>
                </div>
                <Sparkles size={20} />
              </div>

              <div className="subscription-price-row">
                <strong>{formatCurrency(MONTHLY_SUBSCRIPTION_PRICE)}</strong>
                <span>{MONTHLY_SUBSCRIPTION_DURATION_DAYS} days</span>
              </div>

              <div className="subscription-benefit-list">
                {MONTHLY_SUBSCRIPTION_BENEFITS.map((benefit) => (
                  <div className="subscription-benefit-row" key={benefit}>
                    <CheckCircle2 size={16} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="subscription-action-row">
                <button
                  className="btn btn-primary"
                  disabled={subscribing || isActive}
                  onClick={handleSubscribe}
                  type="button"
                >
                  {isActive ? 'Plan active' : subscribing ? 'Activating...' : 'Subscribe Now'}
                </button>
                <Link className="btn btn-secondary" to="/menu">
                  Continue ordering
                </Link>
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </div>
          </div>

          <aside className="subscription-page-side">
            <PromoBanner
              description={statusDescription}
              eyebrow="My Subscription"
              title={statusTitle}
              tone={statusTone}
            />

            <div className="panel-card subscription-detail-card">
              <div className="space-between">
                <div>
                  <p className="eyebrow">Plan details</p>
                  <h3>Your subscription summary</h3>
                </div>
                <CalendarClock size={18} />
              </div>

              <div className="subscription-detail-list">
                {detailRows.map(([label, value]) => (
                  <div className="summary-line" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
};
