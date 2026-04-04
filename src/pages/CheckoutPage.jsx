import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  Gift,
  MailCheck,
  MapPin,
  MessageCircleMore,
  ShieldCheck,
} from 'lucide-react';
import { PromoBanner } from '../components/common/PromoBanner';
import { PageTransition } from '../components/common/PageTransition';
import { OtpCodeInput } from '../components/auth/OtpCodeInput';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { getCartOfferState } from '../utils/pricing';
import { formatCurrency } from '../utils/format';
import { api } from '../api/client';
import { createCartOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import { useCountdown } from '../hooks/useCountdown';
import { formatOtpDuration } from '../utils/otpState';
import { isValidPhoneNumber } from '../utils/validation';
import { useStoreDistance } from '../hooks/useStoreDistance';

const emptyAddress = {
  name: '',
  phoneNumber: '',
  fullAddress: '',
  landmark: '',
  pincode: '',
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user, token, refreshUser } = useAuth();
  const { products, settings } = useAppData();
  const { distanceKm, locationStatus, isLocating } = useStoreDistance();
  const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses?.[0]?.id || 'new');
  const [addressDraft, setAddressDraft] = useState(user?.addresses?.[0] || emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState('');
  const [cooldownEndsAt, setCooldownEndsAt] = useState('');
  const [otpVerifiedAt, setOtpVerifiedAt] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const otpRequestLockRef = useRef(false);
  const otpVerifyLockRef = useRef(false);
  const placeOrderLockRef = useRef(false);

  useEffect(() => {
    if (user?.addresses?.length && selectedAddressId !== 'new') {
      const selected = user.addresses.find((address) => address.id === selectedAddressId);
      if (selected) {
        setAddressDraft(selected);
      }
    }
  }, [selectedAddressId, user]);

  const cartOfferState = getCartOfferState(items, products, settings?.deliveryRules, 0, distanceKm);
  const chosenAddress = useMemo(
    () =>
      selectedAddressId === 'new'
        ? addressDraft
        : user?.addresses?.find((address) => address.id === selectedAddressId) || addressDraft,
    [addressDraft, selectedAddressId, user],
  );

  const otpSecondsRemaining = useCountdown(otpExpiresAt);
  const resendSecondsRemaining = useCountdown(cooldownEndsAt);
  const otpExpired = Boolean(otpExpiresAt) && otpSecondsRemaining <= 0;
  const otpStillTrusted =
    Boolean(otpVerifiedAt) && Date.now() - new Date(otpVerifiedAt).getTime() < 5 * 60 * 1000;
  const checkoutMessage = [
    createCartOrderMessage(cartOfferState.displayItems, cartOfferState),
    chosenAddress.name ? `Name: ${chosenAddress.name}` : '',
    chosenAddress.phoneNumber ? `Phone: ${chosenAddress.phoneNumber}` : '',
    chosenAddress.fullAddress ? `Address: ${chosenAddress.fullAddress}` : '',
    chosenAddress.landmark ? `Landmark: ${chosenAddress.landmark}` : '',
    chosenAddress.pincode ? `Pincode: ${chosenAddress.pincode}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const sendOrderOtp = async () => {
    if (otpRequestLockRef.current) {
      return;
    }

    otpRequestLockRef.current = true;
    setSendingOtp(true);
    try {
      const response = await api.requestOrderOtp({ email: user.email });
      setOtpExpiresAt(response.expiresAt);
      setCooldownEndsAt(response.cooldownEndsAt);
      setOtpVerifiedAt('');
      setOtpCode('');
      setInfo(response.message);
      setError('');
    } catch (otpError) {
      setError('');
      setInfo(
        `${otpError.message} You can still place the order directly because you are already logged in.`,
      );
    } finally {
      otpRequestLockRef.current = false;
      setSendingOtp(false);
    }
  };

  const verifyOrderOtp = async () => {
    if (otpVerifyLockRef.current) {
      return;
    }

    if (otpExpired) {
      setError('The code expired. Send a new code to continue.');
      return;
    }

    if (String(otpCode || '').trim().length < 6) {
      setError('Enter the full verification code from your email.');
      return;
    }

    otpVerifyLockRef.current = true;
    setVerifyingOtp(true);
    try {
      const response = await api.verifyOrderOtp({
        email: user.email,
        otp: otpCode,
      });
      setOtpVerifiedAt(response.verifiedAt);
      setInfo('Verification complete. You can place the order now.');
      setError('');
    } catch (otpError) {
      setError(otpError.message);
    } finally {
      otpVerifyLockRef.current = false;
      setVerifyingOtp(false);
    }
  };

  const validateOrder = () => {
    if (!items.length) {
      navigate('/menu');
      return 'Your cart is empty. Add items before checkout.';
    }

    const requiredFields = ['name', 'phoneNumber', 'fullAddress', 'pincode'];
    const missingField = requiredFields.find((field) => !chosenAddress[field]);

    if (missingField) {
      return 'Please complete the delivery address before placing the order.';
    }

    if (!isValidPhoneNumber(chosenAddress.phoneNumber)) {
      return 'Enter a valid delivery phone number.';
    }

    if (cartOfferState.notDeliverable) {
      return 'This address is outside our current 10 km delivery zone.';
    }

    return '';
  };

  const handlePlaceOrder = async () => {
    if (placeOrderLockRef.current) {
      return;
    }

    const validationError = validateOrder();

    if (validationError) {
      setError(validationError);
      return;
    }

    placeOrderLockRef.current = true;
    setPlacingOrder(true);
    try {
      const order = await api.placeOrder(
        {
          items: cartOfferState.orderItems,
          address: chosenAddress,
          paymentMethod,
          pricing: {
            subtotal: cartOfferState.subtotal,
            deliveryFee: cartOfferState.deliveryFee,
            handlingFee: cartOfferState.handlingFee,
            discount: cartOfferState.discount,
            total: cartOfferState.total,
            distanceKm: cartOfferState.distanceKm,
          },
          note: '',
        },
        token,
      );
      clearCart();
      await refreshUser();
      navigate(`/order-success/${order.id}`);
    } catch (placeError) {
      setError(placeError.message);
    } finally {
      placeOrderLockRef.current = false;
      setPlacingOrder(false);
    }
  };

  return (
    <PageTransition>
      <section className="section first-section">
        <div className="container checkout-layout">
          <div className="checkout-main">
            <PromoBanner
              description={
                cartOfferState.notDeliverable
                  ? cartOfferState.deliveryMessage
                  : cartOfferState.freebieUnlocked
                    ? 'Your order includes the complimentary mango juice already.'
                    : cartOfferState.deliveryMessage
              }
              eyebrow="Checkout offer"
              title={cartOfferState.offerMessage}
              tone={
                cartOfferState.notDeliverable
                  ? 'danger'
                  : cartOfferState.freebieUnlocked || cartOfferState.deliveryFee === 0
                    ? 'success'
                    : 'warning'
              }
            />

            <div className="panel-card">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Delivery address</p>
                  <h2>Choose or add an address</h2>
                </div>
              </div>

              {user?.addresses?.length ? (
                <div className="address-list">
                  {user.addresses.map((address) => (
                    <button
                      className={`address-card ${selectedAddressId === address.id ? 'active' : ''}`}
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      type="button"
                    >
                      <MapPin size={16} />
                      <div>
                        <strong>{address.name}</strong>
                        <span>{address.fullAddress}</span>
                      </div>
                    </button>
                  ))}
                  <button
                    className={`address-card ${selectedAddressId === 'new' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedAddressId('new');
                      setAddressDraft(emptyAddress);
                    }}
                    type="button"
                  >
                    <MapPin size={16} />
                    <div>
                      <strong>Add new address</strong>
                      <span>Save another delivery location</span>
                    </div>
                  </button>
                </div>
              ) : null}

              {selectedAddressId === 'new' || !user?.addresses?.length ? (
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      onChange={(event) =>
                        setAddressDraft((current) => ({ ...current, name: event.target.value }))
                      }
                      value={addressDraft.name}
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      onChange={(event) =>
                        setAddressDraft((current) => ({
                          ...current,
                          phoneNumber: event.target.value,
                        }))
                      }
                      value={addressDraft.phoneNumber}
                    />
                  </label>
                  <label className="full-width">
                    Full address
                    <textarea
                      onChange={(event) =>
                        setAddressDraft((current) => ({
                          ...current,
                          fullAddress: event.target.value,
                        }))
                      }
                      rows="3"
                      value={addressDraft.fullAddress}
                    />
                  </label>
                  <label>
                    Landmark
                    <input
                      onChange={(event) =>
                        setAddressDraft((current) => ({
                          ...current,
                          landmark: event.target.value,
                        }))
                      }
                      value={addressDraft.landmark}
                    />
                  </label>
                  <label>
                    Pincode
                    <input
                      onChange={(event) =>
                        setAddressDraft((current) => ({
                          ...current,
                          pincode: event.target.value,
                        }))
                      }
                      value={addressDraft.pincode}
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="panel-card">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Payment</p>
                  <h2>Choose how you want to pay</h2>
                </div>
              </div>

              <div className="payment-options">
                <button
                  className={`address-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                  type="button"
                >
                  <div>
                    <strong>Cash on Delivery</strong>
                    <span>Default payment mode for local orders</span>
                  </div>
                </button>
                <button
                  className={`address-card ${paymentMethod === 'ONLINE' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('ONLINE')}
                  type="button"
                >
                  <div>
                    <strong>Online ready</strong>
                    <span>Razorpay / UPI architecture is prepared for integration</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="panel-card">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Optional email confirmation</p>
                  <h2>Place your order directly or verify by email</h2>
                </div>
                <MailCheck size={18} />
              </div>

              <p>
                Your account is already signed in, so checkout is no longer blocked by email OTP.
                If you want an extra confirmation code before placing the order, we can still send one to{' '}
                <strong>{user.email}</strong>.
              </p>

              <OtpCodeInput
                autoFocus={Boolean(otpExpiresAt)}
                disabled={sendingOtp || verifyingOtp}
                onChange={setOtpCode}
                value={otpCode}
              />

              <div className="otp-status-row">
                <span>
                  <Clock3 size={15} />
                  {otpStillTrusted
                    ? 'Code verified for this checkout'
                    : otpExpiresAt
                      ? otpExpired
                        ? 'Code expired'
                        : `Expires in ${formatOtpDuration(otpSecondsRemaining)}`
                      : 'Email code is optional'}
                </span>
                <button
                  className="text-button"
                  disabled={sendingOtp || resendSecondsRemaining > 0}
                  onClick={sendOrderOtp}
                  type="button"
                >
                  {sendingOtp
                    ? 'Sending...'
                    : resendSecondsRemaining > 0
                      ? `Resend in ${formatOtpDuration(resendSecondsRemaining)}`
                      : otpExpiresAt
                        ? 'Send new code'
                        : 'Send email code'}
                </button>
              </div>

              <div className="checkout-verification-actions">
                <button className="btn btn-primary" disabled={verifyingOtp} onClick={verifyOrderOtp} type="button">
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
                <a
                  className="btn btn-secondary"
                  href={createWhatsAppLink(settings?.whatsappNumber, checkoutMessage)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircleMore size={16} />
                  Continue with WhatsApp Order
                </a>
              </div>

              <div className="helper-note">
                <ShieldCheck size={16} />
                <span>
                  No dead ends here: place the order directly, or use WhatsApp if you want a manual fallback.
                </span>
              </div>
            </div>
          </div>

          <aside className="summary-card sticky">
            <h3>Order summary</h3>
            <div className="order-mini-list">
              {cartOfferState.displayItems.map((item) => (
                <div className="summary-line" key={item.id}>
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <strong>{item.isFreebie ? 'FREE' : formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatCurrency(cartOfferState.subtotal)}</strong>
            </div>
            <div className="summary-line delivery-distance-line">
              <span>
                <MapPin size={14} />
                {isLocating ? 'Checking distance...' : locationStatus}
              </span>
              <strong>{distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'Manual'}</strong>
            </div>
            <div className="summary-line">
              <span>{cartOfferState.deliveryFeeLabel}</span>
              <strong>{cartOfferState.deliveryFee ? formatCurrency(cartOfferState.deliveryFee) : 'FREE'}</strong>
            </div>
            {cartOfferState.deliveryDiscount > 0 ? (
              <div className="summary-line summary-line-discount">
                <span>Delivery discount</span>
                <strong>-{formatCurrency(cartOfferState.deliveryDiscount)}</strong>
              </div>
            ) : null}
            {cartOfferState.freebieItem ? (
              <div className="summary-line summary-line-freebie">
                <span>
                  <Gift size={14} />
                  {cartOfferState.freebieItem.name}
                </span>
                <strong>FREE</strong>
              </div>
            ) : null}
            <div className="summary-line total">
              <span>Total</span>
              <strong>{formatCurrency(cartOfferState.total)}</strong>
            </div>
            {cartOfferState.deliveryDiscount > 0 ? (
              <p className="hint subtle-copy">
                Original delivery {formatCurrency(cartOfferState.baseDeliveryFee)} reduced to{' '}
                {cartOfferState.deliveryFee ? formatCurrency(cartOfferState.deliveryFee) : 'FREE'}.
              </p>
            ) : null}
            <div className="eta-box">
              <Clock3 size={16} />
              Estimated delivery: {settings?.deliveryRules?.estimatedDeliveryMinutes || 35} minutes
            </div>
            {info ? <p className="success-text">{info}</p> : null}
            {error ? <p className="error-text">{error}</p> : null}
            <button
              className="btn btn-primary full-width"
              disabled={placingOrder || cartOfferState.notDeliverable}
              onClick={handlePlaceOrder}
              type="button"
            >
              {placingOrder
                ? 'Placing order...'
                : cartOfferState.notDeliverable
                  ? 'Outside delivery zone'
                  : 'Place order'}
            </button>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
};
