import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  Gift,
  MapPin,
  MessageCircleMore,
  Navigation,
} from 'lucide-react';
import { PromoBanner } from '../components/common/PromoBanner';
import { PageTransition } from '../components/common/PageTransition';
import { OrderPlacedPopup } from '../components/order/OrderPlacedPopup';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { getCartOfferState } from '../utils/pricing';
import { formatCurrency } from '../utils/format';
import { openRazorpayCheckout } from '../utils/razorpay';
import { createCartOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import { api } from '../api/client';
import { isValidPhoneNumber } from '../utils/validation';
import { useStoreDistance } from '../hooks/useStoreDistance';
import { clearCheckoutRecovery, saveCheckoutRecovery } from '../utils/cartRecovery';
import { trackBeginCheckout, trackPaymentSuccess } from '../utils/analytics';
import { getUserLocation } from '../utils/location';
import { showNativeLocalNotification, triggerNativeHaptic } from '../lib/nativeFeatures';

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
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [redirectSeconds, setRedirectSeconds] = useState(4);
  const [rewardCoupons, setRewardCoupons] = useState([]);
  const [useRewardCoupon, setUseRewardCoupon] = useState(true);
  const [couponDraft, setCouponDraft] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');
  const [locationAssistMessage, setLocationAssistMessage] = useState('');
  const [locatingAddress, setLocatingAddress] = useState(false);
  const placeOrderLockRef = useRef(false);
  const redirectTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    if (user?.addresses?.length && selectedAddressId !== 'new') {
      const selected = user.addresses.find((address) => address.id === selectedAddressId);
      if (selected) {
        setAddressDraft(selected);
      }
    }
  }, [selectedAddressId, user]);

  useEffect(
    () => () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const loadRewardCoupons = async () => {
      try {
        const coupons = await api.getRewardCoupons(token);
        setRewardCoupons(coupons);
      } catch {
        setRewardCoupons([]);
      }
    };

    loadRewardCoupons();
  }, [token]);

  useEffect(() => {
    if (!items.length || placedOrder) {
      clearCheckoutRecovery();
      return;
    }

    saveCheckoutRecovery({
      itemCount: cartOfferState.baseItems.length,
      totalLabel: formatCurrency(cartOfferState.total),
      whatsappLink: createWhatsAppLink(settings?.whatsappNumber, checkoutMessage),
    });
  }, [cartOfferState.baseItems.length, cartOfferState.total, checkoutMessage, items.length, placedOrder, settings?.whatsappNumber]);

  const activeRewardCoupons = useMemo(
    () =>
      rewardCoupons
        .filter(
          (coupon) =>
            coupon.status === 'active' &&
            (!coupon.expiresAt || new Date(coupon.expiresAt).getTime() > Date.now()),
        )
        .sort((left, right) => right.amount - left.amount),
    [rewardCoupons],
  );
  const selectedRewardCoupon = useMemo(() => {
    if (appliedCouponCode) {
      return (
        activeRewardCoupons.find(
          (coupon) => coupon.code.trim().toUpperCase() === appliedCouponCode.trim().toUpperCase(),
        ) || null
      );
    }

    return useRewardCoupon ? activeRewardCoupons[0] || null : null;
  }, [activeRewardCoupons, appliedCouponCode, useRewardCoupon]);
  const cartOfferState = getCartOfferState(
    items,
    products,
    settings?.deliveryRules,
    selectedRewardCoupon?.amount || 0,
    distanceKm,
  );
  const chosenAddress = useMemo(
    () =>
      selectedAddressId === 'new'
        ? addressDraft
        : user?.addresses?.find((address) => address.id === selectedAddressId) || addressDraft,
    [addressDraft, selectedAddressId, user],
  );
  const storefrontLogoUrl = useMemo(() => {
    const logoUrl = settings?.storefront?.logoUrl || '/brand-logo.png';

    try {
      return new URL(logoUrl, window.location.origin).toString();
    } catch {
      return '';
    }
  }, [settings]);

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

  const handleApplyCoupon = () => {
    const normalizedDraft = couponDraft.trim().toUpperCase();

    if (!normalizedDraft) {
      setCouponFeedback('Enter your coupon code to apply it.');
      return;
    }

    const matchedCoupon = activeRewardCoupons.find(
      (coupon) => coupon.code.trim().toUpperCase() === normalizedDraft,
    );

    if (!matchedCoupon) {
      setCouponFeedback('This coupon is not active on your account right now.');
      return;
    }

    setAppliedCouponCode(matchedCoupon.code);
    setUseRewardCoupon(false);
    setCouponDraft(matchedCoupon.code);
    setCouponFeedback(`${matchedCoupon.code} applied successfully.`);
  };

  const handleUseBestCoupon = () => {
    if (!activeRewardCoupons.length) {
      return;
    }

    setAppliedCouponCode('');
    setCouponDraft(activeRewardCoupons[0].code);
    setUseRewardCoupon(true);
    setCouponFeedback(`${activeRewardCoupons[0].code} is now applied as your best coupon.`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode('');
    setCouponDraft('');
    setUseRewardCoupon(false);
    setCouponFeedback('Coupon removed from this order.');
  };

  const openTracking = (order) => {
    if (!order?.id) {
      return;
    }

    navigate(`/track/${order.id}`, {
      replace: true,
      state: {
        justPlaced: true,
        orderNumber: order.orderNumber,
      },
    });
  };

  const finalizeOrderPlacement = async (options = {}) => {
    const order =
      options.fulfilledOrder ||
      (await api.placeOrder(
      {
        items: cartOfferState.orderItems,
        address: chosenAddress,
        paymentMethod: options.paymentMethod || paymentMethod,
        pricing: {
          subtotal: cartOfferState.subtotal,
          deliveryFee: cartOfferState.deliveryFee,
          handlingFee: cartOfferState.handlingFee,
          discount: cartOfferState.discount,
          total: cartOfferState.total,
          distanceKm: cartOfferState.distanceKm,
        },
        couponCode: selectedRewardCoupon?.code || '',
        note: options.note || '',
      },
      token,
    ));

    setError('');
    setPlacedOrder(order);
    setRedirectSeconds(4);
    clearCart();
    refreshUser().catch(() => {});
    void triggerNativeHaptic('success');
    void showNativeLocalNotification({
      id: Number(String(order.id).replace(/\D/g, '').slice(-8)) || undefined,
      title: 'Order placed successfully',
      body: `${order.orderNumber || 'Your order'} is confirmed. We will keep you updated live.`,
      extra: {
        orderId: order.id,
        url: `/track/${order.id}`,
      },
    });
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = window.setInterval(() => {
      setRedirectSeconds((current) => (current > 1 ? current - 1 : current));
    }, 1000);
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
    }
    redirectTimeoutRef.current = window.setTimeout(() => {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
      openTracking(order);
    }, 3600);
    clearCheckoutRecovery();

    return order;
  };

  const handleUseCurrentLocation = async () => {
    setLocatingAddress(true);
    setLocationAssistMessage('');

    try {
      const location = await getUserLocation();

      setAddressDraft((current) => ({
        ...current,
        name: current.name || user?.name || '',
        phoneNumber: current.phoneNumber || user?.phoneNumber || '',
        fullAddress:
          current.fullAddress || 'Pinned near your current location. Add flat / area details here.',
        landmark:
          current.landmark ||
          `Current location pinned (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})`,
      }));
      setSelectedAddressId('new');
      setLocationAssistMessage(
        'Current location pinned. Add your flat, block, or nearby landmark before placing the order.',
      );
      void triggerNativeHaptic('light');
    } catch (locationError) {
      setLocationAssistMessage(locationError.message || 'Unable to fetch your current location.');
    } finally {
      setLocatingAddress(false);
    }
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
    let verifiedPayment = null;
    trackBeginCheckout(cartOfferState);

    try {
      if (paymentMethod === 'ONLINE') {
        const amountInPaise = Math.round(cartOfferState.total * 100);
        const paymentOrder = await api.createRazorpayOrder(
          {
            purpose: 'food-order',
            amount: amountInPaise,
            customerName: chosenAddress.name || user?.name || '',
            phoneNumber: chosenAddress.phoneNumber || user?.phoneNumber || '',
            logoUrl: storefrontLogoUrl,
          },
          token,
        );

        const checkoutResponse = await openRazorpayCheckout({
          amount: paymentOrder.order.amount,
          business: paymentOrder.business,
          keyId: paymentOrder.keyId,
          order: paymentOrder.order,
          prefill: paymentOrder.prefill,
        });

        verifiedPayment = await api.verifyRazorpayPayment(
          {
            amount: amountInPaise,
            razorpayPaymentId: checkoutResponse.razorpay_payment_id,
            razorpayOrderId: checkoutResponse.razorpay_order_id,
            razorpaySignature: checkoutResponse.razorpay_signature,
            purpose: 'food-order',
            payload: {
              items: cartOfferState.orderItems,
              address: chosenAddress,
              couponCode: selectedRewardCoupon?.code || '',
              pricing: {
                distanceKm: cartOfferState.distanceKm,
              },
              note: '',
            },
          },
          token,
        );
      }

      const paymentNote = verifiedPayment
        ? `Razorpay payment verified. Payment ID: ${verifiedPayment.paymentId}. Razorpay order ID: ${verifiedPayment.orderId}. Status: ${verifiedPayment.status}.`
        : '';
      const fulfilledOrder = paymentMethod === 'ONLINE' ? verifiedPayment?.order || null : null;

      await finalizeOrderPlacement({
        paymentMethod,
        note: paymentNote,
        fulfilledOrder,
      });

      if (verifiedPayment?.paymentId) {
        trackPaymentSuccess({
          paymentId: verifiedPayment.paymentId,
          purpose: 'food-order',
          value: cartOfferState.total,
        });
      }
    } catch (placeError) {
      if (verifiedPayment?.paymentId) {
        setError(
          `${placeError.message} Payment ID: ${verifiedPayment.paymentId}. If money was deducted, please contact support on WhatsApp so we can confirm the order manually.`,
        );
      } else {
        setError(placeError.message);
      }
    } finally {
      placeOrderLockRef.current = false;
      setPlacingOrder(false);
    }
  };

  return (
    <PageTransition>
      <SeoMeta noIndex path="/checkout" title="Checkout" />
      <section className="section first-section">
        <OrderPlacedPopup
          onTrackNow={() => openTracking(placedOrder)}
          open={Boolean(placedOrder)}
          orderNumber={placedOrder?.orderNumber}
          redirectSeconds={redirectSeconds}
          totalLabel={placedOrder ? formatCurrency(placedOrder.total) : ''}
        />
        <div className="container checkout-layout">
          <div className="checkout-main">
            <div className="panel-card checkout-page-intro">
              <p className="eyebrow">Checkout flow</p>
              <h1>Confirm your address, payment, and reward</h1>
              <p>
                Everything below updates live as you choose your address, coupon, and payment mode. Once
                you confirm, we immediately move you into order tracking.
              </p>
              <div className="checkout-page-intro-chips">
                <span className="hero-chip">{cartOfferState.baseItems.length} dishes in this order</span>
                <span className="hero-chip">
                  {paymentMethod === 'ONLINE' ? 'Online payment enabled' : 'Cash on delivery ready'}
                </span>
              </div>
            </div>

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

            <div className="panel-card compact-panel">
              <div className="space-between">
                <div>
                  <p className="eyebrow">Coupon code</p>
                  <h3>{selectedRewardCoupon ? `${selectedRewardCoupon.code} applied` : 'Add your coupon'}</h3>
                </div>
                {activeRewardCoupons.length ? (
                  <button className="btn btn-secondary" onClick={handleUseBestCoupon} type="button">
                    Use best coupon
                  </button>
                ) : null}
              </div>
              <p>
                {selectedRewardCoupon
                  ? `This order is using ${selectedRewardCoupon.code} for a ${formatCurrency(selectedRewardCoupon.amount)} discount.`
                  : activeRewardCoupons.length
                    ? 'Type your coupon code below or tap one of your available coupons.'
                    : 'Referral reward coupons will appear here after they are generated on your account.'}
              </p>
              <div className="coupon-input-row">
                <input
                  className="coupon-input"
                  onChange={(event) => setCouponDraft(event.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  value={couponDraft}
                />
                <button className="btn btn-primary coupon-action-button" onClick={handleApplyCoupon} type="button">
                  Apply coupon
                </button>
                {selectedRewardCoupon ? (
                  <button className="btn btn-secondary coupon-action-button" onClick={handleRemoveCoupon} type="button">
                    Remove
                  </button>
                ) : null}
              </div>
              {activeRewardCoupons.length ? (
                <div className="coupon-chip-list">
                  {activeRewardCoupons.map((coupon) => (
                    <button
                      className={`coupon-chip ${
                        selectedRewardCoupon?.code === coupon.code ? 'active' : ''
                      }`}
                      key={coupon.id}
                      onClick={() => {
                        setCouponDraft(coupon.code);
                        setAppliedCouponCode(coupon.code);
                        setUseRewardCoupon(false);
                        setCouponFeedback(`${coupon.code} applied successfully.`);
                      }}
                      type="button"
                    >
                      <span>{coupon.code}</span>
                      <strong>{formatCurrency(coupon.amount)}</strong>
                    </button>
                  ))}
                </div>
              ) : null}
              {couponFeedback ? <p className="hint subtle-copy">{couponFeedback}</p> : null}
            </div>

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
                  <div className="full-width native-address-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={handleUseCurrentLocation}
                      type="button"
                    >
                      <Navigation size={16} />
                      {locatingAddress ? 'Pinning current location...' : 'Use current location'}
                    </button>
                    {locationAssistMessage ? <p className="hint subtle-copy">{locationAssistMessage}</p> : null}
                  </div>
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
                    <strong>Razorpay / UPI / Cards</strong>
                    <span>Pay securely with Razorpay before we confirm your order.</span>
                  </div>
                </button>
              </div>
              {paymentMethod === 'ONLINE' ? (
                <p className="hint subtle-copy">
                  Online payments open Razorpay checkout for UPI, cards, wallets and netbanking.
                </p>
              ) : null}
            </div>
          </div>

          <aside className="summary-card sticky checkout-summary-card">
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
            {selectedRewardCoupon ? (
              <div className="summary-line summary-line-discount">
                <span>Referral coupon ({selectedRewardCoupon.code})</span>
                <strong>-{formatCurrency(cartOfferState.discount)}</strong>
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
            {error ? <p className="error-text">{error}</p> : null}
            <button
              className="btn btn-primary full-width"
              disabled={placingOrder || cartOfferState.notDeliverable || Boolean(placedOrder)}
              onClick={handlePlaceOrder}
              type="button"
            >
              {placingOrder
                ? paymentMethod === 'ONLINE'
                  ? 'Processing payment...'
                  : 'Placing order...'
                : cartOfferState.notDeliverable
                  ? 'Outside delivery zone'
                  : paymentMethod === 'ONLINE'
                    ? `Pay ${formatCurrency(cartOfferState.total)} with Razorpay`
                    : 'Place order'}
            </button>
            <a
              className="btn btn-secondary full-width"
              href={createWhatsAppLink(settings?.whatsappNumber, checkoutMessage)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircleMore size={16} />
              Continue with WhatsApp Order
            </a>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
};
