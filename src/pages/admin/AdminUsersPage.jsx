import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatDateOnly, formatDateTime } from '../../utils/format';

export const AdminUsersPage = () => {
  const { orders, users } = useAdmin();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('');

  const orderCounts = useMemo(
    () =>
      orders.reduce((accumulator, order) => {
        accumulator[order.userId] = (accumulator[order.userId] || 0) + 1;
        return accumulator;
      }, {}),
    [orders],
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (roleFilter !== 'all' && user.role !== roleFilter) {
          return false;
        }

        if (!search) {
          return true;
        }

        return `${user.name} ${user.email} ${user.phoneNumber}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [roleFilter, search, users],
  );

  useEffect(() => {
    if (!filteredUsers.length) {
      setSelectedUserId('');
      return;
    }

    if (!selectedUserId || !filteredUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser = filteredUsers.find((user) => user.id === selectedUserId) || filteredUsers[0];
  const userOrders = orders.filter((order) => order.userId === selectedUser?.id).slice(0, 5);

  return (
    <section className="admin-two-column">
      <div className="panel-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">User management</p>
            <h2>Search and filter registered users</h2>
          </div>
        </div>

        <label className="search-bar compact">
          <Search size={16} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or phone"
            value={search}
          />
        </label>

        <div className="chip-row">
          {['all', 'admin', 'customer', 'delivery'].map((role) => (
            <button
              className={`filter-chip ${roleFilter === role ? 'active' : ''}`}
              key={role}
              onClick={() => setRoleFilter(role)}
              type="button"
            >
              {role}
            </button>
          ))}
        </div>

        <div className="stack-list admin-list-scroll">
          {filteredUsers.map((user) => (
            <button
              className={`user-row-card ${selectedUserId === user.id ? 'active' : ''}`}
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              type="button"
            >
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>
              <div>
                <strong>{user.role}</strong>
                <p>{orderCounts[user.id] || 0} orders</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-card">
        {selectedUser ? (
          <>
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">User details</p>
                <h2>{selectedUser.name}</h2>
              </div>
            </div>

            <div className="user-detail-grid">
              <div>
                <span>Email</span>
                <strong>{selectedUser.email}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{selectedUser.phoneNumber || 'Not added yet'}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{selectedUser.role}</strong>
              </div>
              <div>
                <span>Orders</span>
                <strong>{orderCounts[selectedUser.id] || 0}</strong>
              </div>
              <div>
                <span>Joined</span>
                <strong>{formatDateOnly(selectedUser.createdAt)}</strong>
              </div>
              <div>
                <span>Referral code</span>
                <strong>{selectedUser.referralCode || 'Not generated'}</strong>
              </div>
            </div>

            <div className="panel-card subtle-card">
              <p className="eyebrow">Recent activity</p>
              <div className="stack-list">
                {userOrders.length ? (
                  userOrders.map((order) => (
                    <div className="order-row" key={order.id}>
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <p>{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div>
                        <strong>{order.status}</strong>
                        <p>{order.address.fullAddress}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No orders yet for this user.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Select a user to view more details.</p>
        )}
      </div>
    </section>
  );
};
