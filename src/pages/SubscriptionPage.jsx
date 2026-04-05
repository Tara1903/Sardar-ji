import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, CheckCircle2, MessageCircleMore, Sparkles } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Loader } from '../components/common/Loader';
import { PageTransition } from '../components/common/PageTransition';
import { PromoBanner } from '../components/common/PromoBanner';
import { SubscriptionActivatedPopup } from '../components/subscription/SubscriptionActivatedPopup';
import { useAppData } from '../contexts/AppDataContext';
import { formatCurrency, formatDateOnly } from '../utils/format';
import {
  MONTHLY_SUBSCRIPTION_BENEFITS,
  MONTHLY_SUBSCRIPTION_DESCRIPTION,
  MONTHLY_SUBSCRIPTION_DURATION_DAYS,
  MONTHLY_SUBSCRIPTION_PLAN_NAME,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../utils/subscription';
import { createSubscriptionPaymentMessage, createWhatsAppLink } from '../utils/whatsapp';
import { useAuth } from '../contexts/AuthContext';

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, user } = useAuth();
  const { settings } = useAppData();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(3);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const paymentSectionRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const redirectIntervalRef = useRef(null);

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

  useEffect(
    () => () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      if (redirectIntervalRef.current) {
        window.clearInterval(redirectIntervalRef.current);
      }
    },
    [],
  );

  const isActive = subscription?.status === 'active' && subscription?.daysLeft > 0;
  const shouldOpenCheckout = searchParams.get('checkout') === '1';
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

  useEffect(() => {
    if (!loading && shouldOpenCheckout && !isActive) {
      paymentSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [isActive, loading, shouldOpenCheckout]);

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

  const handleOpenPlan = () => {
    navigate('/my-subscription', { replace: true });
  };

  const handleSubscribe = async () => {
    if (!paymentConfirmed) {
      setError('Confirm that the payment is completed before activating the monthly plan.');
      return;
    }

    setSubscribing(true);
    try {
      const response = await api.subscribeToMonthlyPlan(token);
      setSubscription(response);
      setError('');
      setShowSuccessPopup(true);
      setRedirectSeconds(3);
      if (redirectIntervalRef.current) {
        window.clearInterval(redirectIntervalRef.current);
      }
      redirectIntervalRef.current = window.setInterval(() => {
        setRedirectSeconds((current) => (current > 1 ? current - 1 : current));
      }, 1000);
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = window.setTimeout(() => {
        if (redirectIntervalRef.current) {
          window.clearInterval(redirectIntervalRef.current);
        }
        handleOpenPlan();
      }, 2800);
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
        <SubscriptionActivatedPopup
          onOpenPlan={handleOpenPlan}
          open={showSuccessPopup}
          redirectSeconds={redirectSeconds}
        />
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
                {isActive ? (
                  <Link className="btn btn-primary" to="/profile">
                    View active plan
                  </Link>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      paymentSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }}
                    type="button"
                  >
                    Buy Monthly Plan
                  </button>
                )}
                <Link className="btn btn-secondary" to="/menu">
                  Continue ordering
                </Link>
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </div>

            {!isActive ? (
              <div className="panel-card subscription-detail-card" ref={paymentSectionRef}>
                <div className="space-between">
                  <div>
                    <p className="eyebrow">Payment & activation</p>
                    <h3>Complete payment to activate your plan</h3>
                  </div>
                  <Sparkles size={18} />
                </div>

                <div className="payment-options">
                  <button
                    className={`address-card ${paymentMethod === 'ONLINE' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('ONLINE')}
                    type="button"
                  >
                    <div>
                      <strong>Online / UPI payment</strong>
                      <span>Use payment details from the store, then activate your plan here.</span>
                    </div>
                  </button>
                  <button
                    className={`address-card ${paymentMethod === 'WHATSAPP' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('WHATSAPP')}
                    type="button"
                  >
                    <div>
                      <strong>WhatsApp payment help</strong>
                      <span>Ask the store team for payment details before activating the plan.</span>
                    </div>
                  </button>
                </div>

                <div className="subscription-detail-list">
                  <div className="summary-line">
                    <span>Plan</span>
                    <strong>{MONTHLY_SUBSCRIPTION_PLAN_NAME}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Amount to pay</span>
                    <strong>{formatCurrency(MONTHLY_SUBSCRIPTION_PRICE)}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Activation</span>
                    <strong>Starts only after payment completion</strong>
                  </div>
                </div>

                <label className="subscription-checkbox">
                  <input
                    checked={paymentConfirmed}
                    onChange={(event) => setPaymentConfirmed(event.target.checked)}
                    type="checkbox"
                  />
                  <span>I have completed the payment for this monthly plan.</span>
                </label>

                <div className="subscription-action-row">
                  <a
                    className="btn btn-secondary"
                    href={createWhatsAppLink(
                      settings?.whatsappNumber,
                      createSubscriptionPaymentMessage(
                        MONTHLY_SUBSCRIPTION_PLAN_NAME,
                        MONTHLY_SUBSCRIPTION_PRICE,
                        user?.name,
                      ),
                    )}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircleMore size={16} />
                    {paymentMethod === 'WHATSAPP' ? 'Get payment details' : 'Need payment help?'}
                  </a>
                  <button
                    className="btn btn-primary"
                    disabled={subscribing || !paymentConfirmed}
                    onClick={handleSubscribe}
                    type="button"
                  >
                    {subscribing ? 'Activating plan...' : 'Payment done, activate plan'}
                  </button>
                </div>
              </div>
            ) : null}
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
