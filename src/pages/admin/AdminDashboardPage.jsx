import { Bike, LayoutDashboard, MapPin, ShoppingBasket, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatDateTime } from '../../utils/format';
import { publicEnv, publicEnvFlags } from '../../lib/env';

const visibilitySummary = [
  ['hero', 'Hero'],
  ['categories', 'Categories'],
  ['reviews', 'Reviews'],
  ['popup', 'Popup'],
  ['visit', 'Visit us'],
];

export const AdminDashboardPage = () => {
  const {
    customers,
    metrics,
    orders,
    saveSettings,
    savingSettings,
    settingsDraft,
    updateSettingsDraftValue,
  } = useAdmin();

  const recentOrders = orders.slice(0, 5);

  const referralLeaders = useMemo(
    () =>
      [...customers]
        .sort(
          (left, right) =>
            (right.successfulReferrals?.length || 0) - (left.successfulReferrals?.length || 0),
        )
        .slice(0, 4),
    [customers],
  );

  if (!settingsDraft) {
    return null;
  }

  const sections = settingsDraft.storefront?.sections || {};
  const googleBusiness = settingsDraft.storefront?.googleBusinessProfile || {};
  const hasGa = publicEnvFlags.hasGoogleAnalytics;
  const hasSearchConsole = Boolean(publicEnv.googleSiteVerification);

  return (
    <section className="admin-dashboard-stack">
      <div className="metrics-grid admin-metrics-grid">
        <article className="panel-card admin-stat-card">
          <LayoutDashboard size={18} />
          <strong>{metrics.liveProducts}</strong>
          <span>Live products</span>
        </article>
        <article className="panel-card admin-stat-card">
          <ShoppingBasket size={18} />
          <strong>{metrics.totalOrders}</strong>
          <span>Total orders</span>
        </article>
        <article className="panel-card admin-stat-card">
          <Bike size={18} />
          <strong>{metrics.deliveryPartners}</strong>
          <span>Delivery partners</span>
        </article>
        <article className="panel-card admin-stat-card">
          <Users size={18} />
          <strong>{metrics.customers}</strong>
          <span>Customers</span>
        </article>
      </div>

      <div className="admin-page-grid">
        <article className="panel-card admin-card-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Business profile</p>
              <h2>Core details shown across the website</h2>
            </div>
          </div>

          <div className="admin-form-stack">
            <label>
              Business name
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    businessName: event.target.value,
                  }))
                }
                value={settingsDraft.businessName || ''}
              />
            </label>

            <label>
              Tagline
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    tagline: event.target.value,
                  }))
                }
                value={settingsDraft.tagline || ''}
              />
            </label>

            <label>
              Phone number
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
                value={settingsDraft.phoneNumber || ''}
              />
            </label>

            <label>
              WhatsApp number
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    whatsappNumber: event.target.value,
                  }))
                }
                value={settingsDraft.whatsappNumber || ''}
              />
            </label>

            <label>
              Timings
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    timings: event.target.value,
                  }))
                }
                value={settingsDraft.timings || ''}
              />
            </label>

            <label>
              Maps embed URL
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    mapsEmbedUrl: event.target.value,
                  }))
                }
                value={settingsDraft.mapsEmbedUrl || ''}
              />
            </label>
          </div>

          <div className="admin-button-stack">
            <button
              className="btn btn-primary"
              disabled={savingSettings}
              onClick={() => saveSettings(settingsDraft)}
              type="button"
            >
              {savingSettings ? 'Saving...' : 'Save business profile'}
            </button>
          </div>
        </article>

        <article className="panel-card admin-card-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Live website status</p>
              <h2>Visible sections and current storefront state</h2>
            </div>
          </div>

          <div className="stack-list">
            {visibilitySummary.map(([key, label]) => (
              <div className="admin-status-row" key={key}>
                <span>{label}</span>
                <strong>{sections[key] === false ? 'Hidden' : 'Visible'}</strong>
              </div>
            ))}
          </div>

          <div className="admin-preview-copy is-compact">
            <span className="offer-badge">{settingsDraft.storefront?.hero?.offerText || 'Offer text'}</span>
            <h3>{settingsDraft.storefront?.hero?.headline || 'Headline preview'}</h3>
            <p>{settingsDraft.storefront?.hero?.subtext || 'Subtext preview'}</p>
          </div>
        </article>
      </div>

      <div className="admin-page-grid">
        <article className="panel-card admin-card-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Recent orders</p>
              <h2>Latest order activity</h2>
            </div>
          </div>

          <div className="stack-list">
            {recentOrders.map((order) => (
              <div className="admin-list-card" key={order.id}>
                <div className="admin-order-summary">
                  <strong>{order.orderNumber}</strong>
                  <span>{order.status}</span>
                </div>
                <p>{order.customerName}</p>
                <small>{formatDateTime(order.createdAt)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card admin-card-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Referral leaders</p>
              <h2>Customers with the most referrals</h2>
            </div>
          </div>

          <div className="stack-list">
            {referralLeaders.map((customer) => (
              <div className="admin-list-card" key={customer.id}>
                <div className="admin-order-summary">
                  <strong>{customer.name}</strong>
                  <span>{customer.successfulReferrals?.length || 0} referrals</span>
                </div>
                <p>{customer.email}</p>
                <small>{customer.referralCode}</small>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Map and address</p>
            <h2>Location block used by the website</h2>
          </div>
          <MapPin size={18} />
        </div>

        <div className="admin-form-stack">
          <label>
            Map embed URL
            <input
              onChange={(event) =>
                updateSettingsDraftValue((current) => ({
                  ...current,
                  mapsEmbedUrl: event.target.value,
                }))
              }
              value={settingsDraft.mapsEmbedUrl || ''}
            />
          </label>
        </div>
      </article>

      <div className="admin-page-grid">
        <article className="panel-card admin-card-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Google Business Profile</p>
              <h2>Local discovery links used across the website</h2>
            </div>
          </div>

          <div className="admin-form-stack">
            <label>
              Menu link
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    storefront: {
                      ...(current?.storefront || {}),
                      googleBusinessProfile: {
                        ...(current?.storefront?.googleBusinessProfile || {}),
                        menuUrl: event.target.value,
                      },
                    },
                  }))
                }
                value={googleBusiness.menuUrl || ''}
              />
            </label>

            <label>
              Order link
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    storefront: {
                      ...(current?.storefront || {}),
                      googleBusinessProfile: {
                        ...(current?.storefront?.googleBusinessProfile || {}),
                        orderUrl: event.target.value,
                      },
                    },
                  }))
                }
                value={googleBusiness.orderUrl || ''}
              />
            </label>

            <label>
              Photos link
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    storefront: {
                      ...(current?.storefront || {}),
                      googleBusinessProfile: {
                        ...(current?.storefront?.googleBusinessProfile || {}),
                        photosUrl: event.target.value,
                      },
                    },
                  }))
                }
                value={googleBusiness.photosUrl || ''}
              />
            </label>

            <label>
              Posts link
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    storefront: {
                      ...(current?.storefront || {}),
                      googleBusinessProfile: {
                        ...(current?.storefront?.googleBusinessProfile || {}),
                        postsUrl: event.target.value,
                      },
                    },
                  }))
                }
                value={googleBusiness.postsUrl || ''}
              />
            </label>

            <label>
              Review collection link
              <input
                onChange={(event) =>
                  updateSettingsDraftValue((current) => ({
                    ...current,
                    storefront: {
                      ...(current?.storefront || {}),
                      googleBusinessProfile: {
                        ...(current?.storefront?.googleBusinessProfile || {}),
                        reviewUrl: event.target.value,
                      },
                    },
                  }))
                }
                value={googleBusiness.reviewUrl || ''}
              />
            </label>
          </div>

          <div className="admin-button-stack">
            <button
              className="btn btn-primary"
              disabled={savingSettings}
              onClick={() => saveSettings(settingsDraft)}
              type="button"
            >
              {savingSettings ? 'Saving...' : 'Save Google Business links'}
            </button>
          </div>
        </article>

        <article className="panel-card admin-card-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">SEO dashboards</p>
              <h2>Search Console and GA4 readiness</h2>
            </div>
          </div>

          <div className="stack-list">
            <div className="admin-status-row">
              <span>Google Analytics</span>
              <strong>{hasGa ? 'Connected' : 'Env missing'}</strong>
            </div>
            <div className="admin-status-row">
              <span>Search Console verification</span>
              <strong>{hasSearchConsole ? 'Configured' : 'Env missing'}</strong>
            </div>
          </div>

          <div className="admin-button-stack">
            <a className="btn btn-secondary" href="https://analytics.google.com/" rel="noreferrer" target="_blank">
              Open GA4 dashboard
            </a>
            <a className="btn btn-secondary" href="https://search.google.com/search-console" rel="noreferrer" target="_blank">
              Open Search Console
            </a>
          </div>
          {!hasGa || !hasSearchConsole ? (
            <p className="hint">
              Add <code>VITE_GA_MEASUREMENT_ID</code> and <code>VITE_GOOGLE_SITE_VERIFICATION</code> in
              Vercel to complete live SEO tracking.
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
};
