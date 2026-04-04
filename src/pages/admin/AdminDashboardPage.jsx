import { Bike, LayoutDashboard, ShoppingBasket, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

export const AdminDashboardPage = () => {
  const {
    customers,
    metrics,
    orders,
    saveSettings,
    savingSettings,
    settingsDraft,
    setSettingsDraft,
  } = useAdmin();

  const referralLeaders = useMemo(
    () =>
      [...customers]
        .sort(
          (left, right) =>
            (right.successfulReferrals?.length || 0) - (left.successfulReferrals?.length || 0),
        )
        .slice(0, 5),
    [customers],
  );

  const recentOrders = orders.slice(0, 5);

  if (!settingsDraft) {
    return null;
  }

  return (
    <>
      <section className="metrics-grid admin-metrics-grid">
        <article className="panel-card">
          <LayoutDashboard size={18} />
          <strong>{metrics.liveProducts}</strong>
          <span>Live products</span>
        </article>
        <article className="panel-card">
          <ShoppingBasket size={18} />
          <strong>{metrics.totalOrders}</strong>
          <span>Total orders</span>
        </article>
        <article className="panel-card">
          <Bike size={18} />
          <strong>{metrics.deliveryPartners}</strong>
          <span>Delivery partners</span>
        </article>
        <article className="panel-card">
          <Users size={18} />
          <strong>{metrics.customers}</strong>
          <span>Customers</span>
        </article>
      </section>

      <section className="admin-two-column">
        <div className="panel-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Business settings</p>
              <h2>Offers, delivery rules, and footer info</h2>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Business name
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({ ...current, businessName: event.target.value }))
                }
                value={settingsDraft.businessName}
              />
            </label>
            <label>
              Tagline
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({ ...current, tagline: event.target.value }))
                }
                value={settingsDraft.tagline}
              />
            </label>
            <label>
              Phone number
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({ ...current, phoneNumber: event.target.value }))
                }
                value={settingsDraft.phoneNumber}
              />
            </label>
            <label>
              WhatsApp number
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    whatsappNumber: event.target.value,
                  }))
                }
                value={settingsDraft.whatsappNumber}
              />
            </label>
            <label>
              Timings
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({ ...current, timings: event.target.value }))
                }
                value={settingsDraft.timings}
              />
            </label>
            <label>
              Map embed URL
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    mapsEmbedUrl: event.target.value,
                  }))
                }
                value={settingsDraft.mapsEmbedUrl}
              />
            </label>
            <label>
              Rate per km
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    deliveryRules: {
                      ...current.deliveryRules,
                      perKmRate: Number(event.target.value),
                    },
                  }))
                }
                type="number"
                value={settingsDraft.deliveryRules.perKmRate || ''}
              />
            </label>
            <label>
              Minimum delivery charge
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    deliveryRules: {
                      ...current.deliveryRules,
                      minDelivery: Number(event.target.value),
                    },
                  }))
                }
                type="number"
                value={settingsDraft.deliveryRules.minDelivery || ''}
              />
            </label>
            <label>
              Max delivery distance (km)
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    deliveryRules: {
                      ...current.deliveryRules,
                      maxDistance: Number(event.target.value),
                    },
                  }))
                }
                type="number"
                value={settingsDraft.deliveryRules.maxDistance || ''}
              />
            </label>
            <label>
              Free delivery threshold
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    deliveryRules: {
                      ...current.deliveryRules,
                      freeThreshold1: Number(event.target.value),
                    },
                  }))
                }
                type="number"
                value={settingsDraft.deliveryRules.freeThreshold1 || ''}
              />
            </label>
            <label>
              Free delivery limit (km)
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    deliveryRules: {
                      ...current.deliveryRules,
                      freeDistanceLimit: Number(event.target.value),
                    },
                  }))
                }
                type="number"
                value={settingsDraft.deliveryRules.freeDistanceLimit || ''}
              />
            </label>
            <label>
              Free delivery + juice threshold
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    deliveryRules: {
                      ...current.deliveryRules,
                      freeThreshold2: Number(event.target.value),
                    },
                  }))
                }
                type="number"
                value={settingsDraft.deliveryRules.freeThreshold2 || ''}
              />
            </label>
            <label>
              ETA in minutes
              <input
                onChange={(event) =>
                  setSettingsDraft((current) => ({
                    ...current,
                    deliveryRules: {
                      ...current.deliveryRules,
                      estimatedDeliveryMinutes: Number(event.target.value),
                    },
                  }))
                }
                type="number"
                value={settingsDraft.deliveryRules.estimatedDeliveryMinutes || ''}
              />
            </label>
          </div>

          <p className="hint">
            Delivery is distance-based: free within 5 km above ₹299, 50% off above ₹299 outside 5 km, and free delivery plus Mango Juice above ₹499.
          </p>

          <div className="stack-list">
            {(settingsDraft.offers || []).map((offer, index) => (
              <div className="offer-editor" key={offer.id}>
                <input
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      offers: current.offers.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, title: event.target.value } : item,
                      ),
                    }))
                  }
                  value={offer.title}
                />
                <textarea
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      offers: current.offers.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, description: event.target.value } : item,
                      ),
                    }))
                  }
                  rows="2"
                  value={offer.description}
                />
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            disabled={savingSettings}
            onClick={() => saveSettings(settingsDraft)}
            type="button"
          >
            {savingSettings ? 'Saving...' : 'Save settings'}
          </button>
        </div>

        <div className="admin-column-stack">
          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Recent orders</p>
                <h2>Latest activity</h2>
              </div>
            </div>
            <div className="orders-list admin-list-scroll">
              {recentOrders.map((order) => (
                <div className="order-row" key={order.id}>
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <p>{order.customerName}</p>
                  </div>
                  <div>
                    <strong>{formatCurrency(order.total)}</strong>
                    <p>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className={`status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Referral rewards</p>
                <h2>Top community advocates</h2>
              </div>
            </div>
            <div className="stack-list">
              {referralLeaders.map((customer) => (
                <div className="order-row" key={customer.id}>
                  <div>
                    <strong>{customer.name}</strong>
                    <p>{customer.email}</p>
                  </div>
                  <div>
                    <strong>{customer.referralCode}</strong>
                    <p>{customer.successfulReferrals?.length || 0} successful referrals</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
