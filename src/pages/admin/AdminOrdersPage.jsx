import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

const ORDER_STATUSES = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

export const AdminOrdersPage = () => {
  const { deliveryUsers, markOrdersSeen, newOrders, orders, saveOrderUpdate, updatingOrderId } = useAdmin();
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDrafts, setOrderDrafts] = useState({});

  useEffect(() => {
    markOrdersSeen();
  }, [markOrdersSeen]);

  const updateOrderDraft = (orderId, key, value) => {
    setOrderDrafts((current) => {
      const fallback = orders.find((order) => order.id === orderId);

      return {
        ...current,
        [orderId]: {
          status: current[orderId]?.status || fallback?.status || 'Order Placed',
          assignedDeliveryBoyId:
            current[orderId]?.assignedDeliveryBoyId || fallback?.assignedDeliveryBoyId || '',
          [key]: value,
        },
      };
    });
  };

  const filteredOrders = orders.filter((order) =>
    `${order.orderNumber} ${order.customerName} ${order.customerPhone}`
      .toLowerCase()
      .includes(orderSearch.toLowerCase()),
  );

  return (
    <section className="panel-card">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Order management</p>
          <h2>Update status and assign delivery partners</h2>
        </div>
      </div>

      {newOrders.length ? (
        <p className="success-text admin-inline-alert">
          {newOrders.length} new customer {newOrders.length === 1 ? 'order has' : 'orders have'} just arrived.
        </p>
      ) : null}

      <label className="search-bar compact">
        <Search size={16} />
        <input
          onChange={(event) => setOrderSearch(event.target.value)}
          placeholder="Search by order ID, customer, or phone"
          value={orderSearch}
        />
      </label>

      <div className="orders-list admin-list-scroll">
        {filteredOrders.map((order) => {
          const draft = orderDrafts[order.id] || {
            status: order.status,
            assignedDeliveryBoyId: order.assignedDeliveryBoyId || '',
          };

          return (
            <div className="admin-list-card admin-order-card" key={order.id}>
              <div className="admin-order-summary">
                <strong>{order.orderNumber}</strong>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="admin-card-copy">
                <p>
                  {order.customerName} • {formatDateTime(order.createdAt)}
                </p>
                <span>{order.address.fullAddress}</span>
              </div>
              <div className="admin-form-stack">
                <label>
                  Order status
                  <select
                    onChange={(event) => updateOrderDraft(order.id, 'status', event.target.value)}
                    value={draft.status}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Delivery partner
                  <select
                    onChange={(event) =>
                      updateOrderDraft(order.id, 'assignedDeliveryBoyId', event.target.value)
                    }
                    value={draft.assignedDeliveryBoyId}
                  >
                    <option value="">Assign delivery boy</option>
                    {deliveryUsers.map((deliveryUser) => (
                      <option key={deliveryUser.id} value={deliveryUser.id}>
                        {deliveryUser.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                className="btn btn-primary"
                disabled={updatingOrderId === order.id}
                onClick={() => saveOrderUpdate(order.id, draft)}
                type="button"
              >
                {updatingOrderId === order.id ? 'Saving...' : 'Save order update'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
