import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, MailCheck, MapPin, MessageCircleMore, ShieldCheck } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { computeCartPricing } from '../utils/pricing';
import { formatCurrency } from '../utils/format';
import { api } from '../api/client';
import { createWhatsAppLink } from '../utils/whatsapp';
import { isValidPhoneNumber } from '../utils/validation';

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
  const { settings } = useAppData();
  const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses?.[0]?.id || 'new');
  const [addressDraft, setAddressDraft] = useState(user?.addresses?.[0] || emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState('');
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

  const totals = computeCartPricing(items, settings?.deliveryRules);
  const chosenAddress = useMemo(
    () =>
      selectedAddressId === 'new'
        ? addressDraft
        : user?.addresses?.find((address) => address.id === selectedAddressId) || addressDraft,
    [addressDraft, selectedAddressId, user],
  );

  const otpExpired = Boolean(otpExpiresAt) && new Date(otpExpiresAt).getTime() <= Date.now();
  const otpStillTrusted =
    Boolean(otpVerifiedAt) && Date.now() - new Date(otpVerifiedAt).getTime() < 5 * 60 * 1000;
  const checkoutMessage = `I want to place an order from checkout. Total: ${formatCurrency(totals.total)}`;

  const sendOrderOtp = async () => {
    if (otpRequestLockRef.current) {
      return;
    }

    otpRequestLockRef.current = true;
    setSendingOtp(true);
    try {
      const response = await api.requestOrderOtp({ email: user.email });
      setOtpExpiresAt(response.expiresAt);
      setOtpVerifiedAt('');
      setOtpCode('');
      setInfo(response.message);
      setError('');
    } catch (otpError) {
      setError(otpError.message);
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

    if (!otpCode.trim()) {
      setError('Enter the verification code from your email.');
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
      setInfo('Email verification complete. You can place the order now.');
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

    if (!otpStillTrusted) {
      return 'Verify the checkout OTP before placing the order.';
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
          items,
          address: chosenAddress,
          paymentMethod,
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
                  <p className="eyebrow">Email verification</p>
                  <h2>Confirm this checkout with OTP</h2>
                </div>
                <MailCheck size={18} />
              </div>

              <p>We send a 5-minute order confirmation code to {user.email}.</p>

              <div className="otp-grid">
                <button className="btn btn-secondary" disabled={sendingOtp} onClick={sendOrderOtp} type="button">
                  {sendingOtp ? 'Sending...' : otpExpiresAt ? 'Send new code' : 'Send OTP'}
                </button>
                <label className="full-width">
                  OTP code
                  <input
                    onChange={(event) => setOtpCode(event.target.value)}
                    placeholder="Enter the code from your email"
                    value={otpCode}
                  />
                </label>
                <button
                  className="btn btn-primary"
                  disabled={verifyingOtp}
                  onClick={verifyOrderOtp}
                  type="button"
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              <div className="helper-note">
                <ShieldCheck size={16} />
                <span>{otpStillTrusted ? 'OTP verified for this checkout.' : 'Order placement stays locked until OTP is verified.'}</span>
              </div>
            </div>
          </div>

          <aside className="summary-card sticky">
            <h3>Order summary</h3>
            <div className="order-mini-list">
              {items.map((item) => (
                <div className="summary-line" key={item.id}>
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>
            <div className="summary-line">
              <span>Delivery fee</span>
              <strong>{formatCurrency(totals.deliveryFee)}</strong>
            </div>
            <div className="summary-line">
              <span>Handling fee</span>
              <strong>{formatCurrency(totals.handlingFee)}</strong>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <strong>{formatCurrency(totals.total)}</strong>
            </div>
            <div className="eta-box">
              <Clock3 size={16} />
              Estimated delivery: {settings?.deliveryRules?.estimatedDeliveryMinutes || 35} minutes
            </div>
            <a
              className="btn btn-secondary full-width"
              href={createWhatsAppLink(settings?.whatsappNumber, checkoutMessage)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircleMore size={16} />
              Confirm on WhatsApp
            </a>
            {info ? <p className="success-text">{info}</p> : null}
            {error ? <p className="error-text">{error}</p> : null}
            <button className="btn btn-primary full-width" disabled={placingOrder} onClick={handlePlaceOrder} type="button">
              {placingOrder ? 'Placing order...' : 'Place order'}
            </button>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
};
