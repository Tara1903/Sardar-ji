import { Clock3, FlameKindling, PackageCheck, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatDateTime } from '../../utils/format';

const kitchenStatuses = [
  {
    status: 'Order Placed',
    label: 'Mark preparing',
    nextStatus: 'Preparing',
    icon: FlameKindling,
  },
  {
    status: 'Preparing',
    label: 'Send to delivery',
    nextStatus: 'Out for Delivery',
    icon: Truck,
  },
  {
    status: 'Out for Delivery',
    label: 'Mark delivered',
    nextStatus: 'Delivered',
    icon: PackageCheck,
  },
];

export const AdminKitchenPage = () => {
  const { orders, saveOrderUpdate, updatingOrderId } = useAdmin();

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'Delivered'),
    [orders],
  );

  return (
    <section className="admin-kitchen-stack">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Kitchen prep screen</p>
          <h2>Big status buttons for fast order handling</h2>
        </div>
      </div>

      <div className="admin-kitchen-grid">
        {activeOrders.map((order) => {
          const currentAction = kitchenStatuses.find((entry) => entry.status === order.status);
          const ActionIcon = currentAction?.icon || Clock3;

          return (
            <article className="panel-card kitchen-order-card" key={order.id}>
              <div className="space-between">
                <div>
                  <p className="eyebrow">{order.orderNumber}</p>
                  <h3>{order.customerName}</h3>
                </div>
                <span className={`status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.status}
                </span>
              </div>

              <p>{order.items?.map((item) => `${item.name} x ${item.quantity}`).join(', ')}</p>
              <p>{order.address?.fullAddress}</p>
              <small>{formatDateTime(order.createdAt)}</small>

              <div className="kitchen-action-grid">
                {kitchenStatuses.map((entry) => {
                  const Icon = entry.icon;

                  return (
                    <button
                      className={`btn ${order.status === entry.status ? 'btn-primary' : 'btn-secondary'} kitchen-action-button`}
                      disabled={updatingOrderId === order.id}
                      key={`${order.id}-${entry.nextStatus}`}
                      onClick={() => saveOrderUpdate(order.id, { status: entry.nextStatus })}
                      type="button"
                    >
                      <Icon size={18} />
                      {entry.label}
                    </button>
                  );
                })}
              </div>

              {currentAction ? (
                <button
                  className="btn btn-primary full-width kitchen-primary-button"
                  disabled={updatingOrderId === order.id}
                  onClick={() => saveOrderUpdate(order.id, { status: currentAction.nextStatus })}
                  type="button"
                >
                  <ActionIcon size={20} />
                  {updatingOrderId === order.id ? 'Saving...' : currentAction.label}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};
