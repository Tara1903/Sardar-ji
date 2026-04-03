import { Bike, ClipboardList, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatDateTime } from '../../utils/format';
import {
  generateTemporaryPassword,
  isStrongPassword,
  isValidEmail,
  isValidPhoneNumber,
} from '../../utils/validation';

const createEmptyDeliveryForm = () => ({
  name: '',
  email: '',
  phoneNumber: '',
  password: generateTemporaryPassword(),
});

export const AdminDeliveryPage = () => {
  const { creatingDelivery, deliveryUsers, orders, saveDeliveryPartner } = useAdmin();
  const [formState, setFormState] = useState(createEmptyDeliveryForm());
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [localError, setLocalError] = useState('');

  const deliveryStats = useMemo(
    () =>
      deliveryUsers.map((deliveryUser) => {
        const assignedOrders = orders.filter(
          (order) => order.assignedDeliveryBoyId === deliveryUser.id && order.status !== 'Delivered',
        );
        const completedOrders = orders.filter(
          (order) => order.assignedDeliveryBoyId === deliveryUser.id && order.status === 'Delivered',
        );

        return {
          ...deliveryUser,
          assignedCount: assignedOrders.length,
          completedCount: completedOrders.length,
        };
      }),
    [deliveryUsers, orders],
  );

  const handleCreatePartner = async () => {
    if (!formState.name.trim()) {
      setLocalError('Enter the delivery partner name.');
      return;
    }

    if (!isValidEmail(formState.email)) {
      setLocalError('Enter a valid email address.');
      return;
    }

    if (!isValidPhoneNumber(formState.phoneNumber)) {
      setLocalError('Enter a valid 10-digit phone number.');
      return;
    }

    if (!isStrongPassword(formState.password)) {
      setLocalError('Use a stronger password with at least 8 characters and 1 number.');
      return;
    }

    const response = await saveDeliveryPartner(formState);
    setCreatedCredentials(response.credentials);
    setFormState(createEmptyDeliveryForm());
    setLocalError('');
  };

  return (
    <section className="admin-two-column">
      <div className="panel-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Delivery accounts</p>
            <h2>Create delivery partner login</h2>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Full name
            <input
              onChange={(event) =>
                setFormState((current) => ({ ...current, name: event.target.value }))
              }
              value={formState.name}
            />
          </label>
          <label>
            Phone number
            <input
              onChange={(event) =>
                setFormState((current) => ({ ...current, phoneNumber: event.target.value }))
              }
              value={formState.phoneNumber}
            />
          </label>
          <label className="full-width">
            Email
            <input
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
              type="email"
              value={formState.email}
            />
          </label>
          <label className="full-width">
            Temporary password
            <input
              onChange={(event) =>
                setFormState((current) => ({ ...current, password: event.target.value }))
              }
              type="text"
              value={formState.password}
            />
          </label>
        </div>

        <div className="row-actions">
          <button
            className="btn btn-primary"
            disabled={creatingDelivery}
            onClick={handleCreatePartner}
            type="button"
          >
            {creatingDelivery ? 'Creating...' : 'Create delivery partner'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              setFormState((current) => ({ ...current, password: generateTemporaryPassword() }))
            }
            type="button"
          >
            Regenerate password
          </button>
        </div>

        {localError ? <p className="error-text">{localError}</p> : null}

        {createdCredentials ? (
          <div className="credentials-card">
            <div className="space-between">
              <div>
                <p className="eyebrow">Saved credentials</p>
                <h3>Share these securely</h3>
              </div>
              <ShieldCheck size={18} />
            </div>
            <p>Email: {createdCredentials.email}</p>
            <p>Password: {createdCredentials.password}</p>
          </div>
        ) : null}
      </div>

      <div className="panel-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Delivery team</p>
            <h2>Live partner overview</h2>
          </div>
        </div>

        <div className="stack-list admin-list-scroll">
          {deliveryStats.map((deliveryUser) => (
            <div className="delivery-stats-row" key={deliveryUser.id}>
              <div>
                <strong>{deliveryUser.name}</strong>
                <p>{deliveryUser.email}</p>
                <span>{deliveryUser.phoneNumber || 'Phone not added yet'}</span>
              </div>
              <div className="delivery-stats-meta">
                <span>
                  <Bike size={14} />
                  {deliveryUser.assignedCount} active
                </span>
                <span>
                  <ClipboardList size={14} />
                  {deliveryUser.completedCount} completed
                </span>
                <span>Joined {formatDateTime(deliveryUser.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
