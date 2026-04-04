import { Bike, Brush, LayoutDashboard, ShoppingBasket, Sparkles, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

const emptyReview = () => ({
  id: `review-${Date.now()}`,
  author: '',
  quote: '',
  rating: 5,
});

export const AdminDashboardPage = () => {
  const {
    customers,
    metrics,
    orders,
    saveSettings,
    savingSettings,
    settingsDraft,
    setSettingsDraft,
    uploadAsset,
  } = useAdmin();
  const [uploadingField, setUploadingField] = useState('');

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

  const storefront = settingsDraft.storefront || {};
  const hero = storefront.hero || {};
  const popup = storefront.popup || {};
  const theme = storefront.theme || {};
  const reviews = storefront.reviews || [];

  const updateStorefrontSection = (section, updater) => {
    setSettingsDraft((current) => ({
      ...current,
      storefront: {
        ...(current.storefront || {}),
        [section]:
          typeof updater === 'function'
            ? updater(current.storefront?.[section] || (section === 'reviews' ? [] : {}))
            : updater,
      },
    }));
  };

  const handleAssetUpload = async (file, onComplete, key) => {
    if (!file) {
      return;
    }

    setUploadingField(key);
    try {
      const upload = await uploadAsset(file);
      onComplete(upload.url);
    } finally {
      setUploadingField('');
    }
  };

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

      <section className="admin-design-grid">
        <div className="admin-column-stack">
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
            </div>

            <div className="form-grid admin-tight-grid">
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
            </div>

            <button
              className="btn btn-primary"
              disabled={savingSettings}
              onClick={() => saveSettings(settingsDraft)}
              type="button"
            >
              {savingSettings ? 'Saving...' : 'Save business settings'}
            </button>
          </div>

          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Theme control</p>
                <h2>Primary colors and storefront feel</h2>
              </div>
              <Brush size={18} />
            </div>

            <div className="form-grid">
              {[
                ['primary', 'Primary color'],
                ['secondary', 'Secondary color'],
                ['highlight', 'Highlight color'],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    onChange={(event) =>
                      updateStorefrontSection('theme', (current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    type="color"
                    value={theme[key] || '#000000'}
                  />
                </label>
              ))}
            </div>

            <button
              className="btn btn-primary"
              disabled={savingSettings}
              onClick={() => saveSettings(settingsDraft)}
              type="button"
            >
              {savingSettings ? 'Saving...' : 'Save theme'}
            </button>
          </div>
        </div>

        <div className="admin-column-stack">
          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Hero control</p>
                <h2>Headline, offer, and hero image</h2>
              </div>
            </div>

            <div className="form-grid">
              <label className="full-width">
                Headline
                <input
                  onChange={(event) =>
                    updateStorefrontSection('hero', (current) => ({
                      ...current,
                      headline: event.target.value,
                    }))
                  }
                  value={hero.headline || ''}
                />
              </label>
              <label className="full-width">
                Subtext
                <textarea
                  onChange={(event) =>
                    updateStorefrontSection('hero', (current) => ({
                      ...current,
                      subtext: event.target.value,
                    }))
                  }
                  rows="3"
                  value={hero.subtext || ''}
                />
              </label>
              <label className="full-width">
                Offer text
                <input
                  onChange={(event) =>
                    updateStorefrontSection('hero', (current) => ({
                      ...current,
                      offerText: event.target.value,
                    }))
                  }
                  value={hero.offerText || ''}
                />
              </label>
              <label className="full-width">
                Background image URL
                <input
                  onChange={(event) =>
                    updateStorefrontSection('hero', (current) => ({
                      ...current,
                      backgroundImage: event.target.value,
                    }))
                  }
                  value={hero.backgroundImage || ''}
                />
              </label>
              <label className="full-width">
                Upload background image
                <input
                  accept="image/*"
                  onChange={(event) =>
                    handleAssetUpload(
                      event.target.files?.[0],
                      (url) =>
                        updateStorefrontSection('hero', (current) => ({
                          ...current,
                          backgroundImage: url,
                        })),
                      'hero',
                    )
                  }
                  type="file"
                />
              </label>
            </div>

            {hero.backgroundImage ? (
              <div className="image-preview wide">
                <img alt="Hero preview" src={hero.backgroundImage} />
              </div>
            ) : null}

            <button
              className="btn btn-primary"
              disabled={savingSettings || uploadingField === 'hero'}
              onClick={() => saveSettings(settingsDraft)}
              type="button"
            >
              {savingSettings || uploadingField === 'hero' ? 'Saving...' : 'Save hero'}
            </button>
          </div>

          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Popup control</p>
                <h2>Turn the offer popup on or off</h2>
              </div>
              <Sparkles size={18} />
            </div>

            <div className="form-grid">
              <label className="availability-toggle full-width">
                <input
                  checked={popup.enabled !== false}
                  onChange={(event) =>
                    updateStorefrontSection('popup', (current) => ({
                      ...current,
                      enabled: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Enable special offer popup
              </label>
              <label className="full-width">
                Popup title
                <input
                  onChange={(event) =>
                    updateStorefrontSection('popup', (current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  value={popup.title || ''}
                />
              </label>
              <label className="full-width">
                Popup subtitle
                <input
                  onChange={(event) =>
                    updateStorefrontSection('popup', (current) => ({
                      ...current,
                      subtitle: event.target.value,
                    }))
                  }
                  value={popup.subtitle || ''}
                />
              </label>
              <label className="full-width">
                Popup body
                <textarea
                  onChange={(event) =>
                    updateStorefrontSection('popup', (current) => ({
                      ...current,
                      body: event.target.value,
                    }))
                  }
                  rows="2"
                  value={popup.body || ''}
                />
              </label>
            </div>

            <button
              className="btn btn-primary"
              disabled={savingSettings}
              onClick={() => saveSettings(settingsDraft)}
              type="button"
            >
              {savingSettings ? 'Saving...' : 'Save popup'}
            </button>
          </div>
        </div>
      </section>

      <section className="admin-two-column">
        <div className="panel-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Review control</p>
              <h2>Customer reviews shown on the homepage</h2>
            </div>
          </div>

          <div className="stack-list">
            {reviews.map((review, index) => (
              <div className="offer-editor" key={review.id}>
                <input
                  onChange={(event) =>
                    updateStorefrontSection('reviews', (current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, author: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Customer name"
                  value={review.author}
                />
                <textarea
                  onChange={(event) =>
                    updateStorefrontSection('reviews', (current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, quote: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Review text"
                  rows="3"
                  value={review.quote}
                />
                <div className="row-actions">
                  <input
                    max="5"
                    min="1"
                    onChange={(event) =>
                      updateStorefrontSection('reviews', (current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, rating: Number(event.target.value) || 5 }
                            : item,
                        ),
                      )
                    }
                    type="number"
                    value={review.rating}
                  />
                  <button
                    className="btn btn-tertiary"
                    onClick={() =>
                      updateStorefrontSection('reviews', (current) =>
                        current.filter((item) => item.id !== review.id),
                      )
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="row-actions">
            <button
              className="btn btn-secondary"
              onClick={() =>
                updateStorefrontSection('reviews', (current) => [...current, emptyReview()])
              }
              type="button"
            >
              Add review
            </button>
            <button
              className="btn btn-primary"
              disabled={savingSettings}
              onClick={() => saveSettings(settingsDraft)}
              type="button"
            >
              {savingSettings ? 'Saving...' : 'Save reviews'}
            </button>
          </div>
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
