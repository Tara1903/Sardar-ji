import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, MapPin } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { computeCartPricing } from '../utils/pricing';
import { formatCurrency } from '../utils/format';
import { api } from '../api/client';

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
  const [error, setError] = useState('');

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

  const handlePlaceOrder = async () => {
    if (!items.length) {
      navigate('/menu');
      return;
    }

    const requiredFields = ['name', 'phoneNumber', 'fullAddress', 'pincode'];
    const missingField = requiredFields.find((field) => !chosenAddress[field]);
    if (missingField) {
      setError('Please complete the delivery address before placing the order.');
      return;
    }

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
                    <input onChange={(event) => setAddressDraft((current) => ({ ...current, name: event.target.value }))} value={addressDraft.name} />
                  </label>
                  <label>
                    Phone number
                    <input onChange={(event) => setAddressDraft((current) => ({ ...current, phoneNumber: event.target.value }))} value={addressDraft.phoneNumber} />
                  </label>
                  <label className="full-width">
                    Full address
                    <textarea onChange={(event) => setAddressDraft((current) => ({ ...current, fullAddress: event.target.value }))} rows="3" value={addressDraft.fullAddress} />
                  </label>
                  <label>
                    Landmark
                    <input onChange={(event) => setAddressDraft((current) => ({ ...current, landmark: event.target.value }))} value={addressDraft.landmark} />
                  </label>
                  <label>
                    Pincode
                    <input onChange={(event) => setAddressDraft((current) => ({ ...current, pincode: event.target.value }))} value={addressDraft.pincode} />
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
