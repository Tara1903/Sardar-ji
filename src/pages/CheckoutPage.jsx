import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  Gift,
  MapPin,
  MessageCircleMore,
} from 'lucide-react';
import { PromoBanner } from '../components/common/PromoBanner';
import { PageTransition } from '../components/common/PageTransition';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { getCartOfferState } from '../utils/pricing';
import { formatCurrency } from '../utils/format';
import { createCartOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import { api } from '../api/client';
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
  const [error, setError] = useState('');
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
