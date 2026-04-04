import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

const ensureOfferCards = (offers = []) => {
  const seeded = [...offers];

  while (seeded.length < 3) {
    seeded.push({
      id: `offer-${Date.now()}-${seeded.length}`,
      title: '',
      description: '',
    });
  }

  return seeded;
};

export const AdminOffersPage = () => {
  const {
    saveSettings,
    savingSettings,
    settingsDraft,
    updateSettingsDraftValue,
    updateStorefrontSection,
  } = useAdmin();

  const offerCards = useMemo(() => ensureOfferCards(settingsDraft?.offers || []), [settingsDraft?.offers]);

  if (!settingsDraft) {
    return null;
  }

  const storefrontOffers = settingsDraft.storefront?.offers || {};

  const updateOfferCard = (index, key, value) => {
    updateSettingsDraftValue((current) => {
      const nextOffers = ensureOfferCards(current?.offers || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      );

      return {
        ...current,
        offers: nextOffers,
      };
    });
  };

  const addOfferCard = () => {
    updateSettingsDraftValue((current) => ({
      ...current,
      offers: [
        ...(current?.offers || []),
        {
          id: `offer-${Date.now()}`,
          title: '',
          description: '',
        },
      ],
    }));
  };

  const removeOfferCard = (id) => {
    updateSettingsDraftValue((current) => ({
      ...current,
      offers: (current?.offers || []).filter((item) => item.id !== id),
    }));
  };

  return (
    <section className="admin-page-grid">
      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Offer messaging</p>
            <h2>Banner text and delivery communication</h2>
          </div>
          <Sparkles size={18} />
        </div>

        <div className="admin-form-stack">
          <label>
            Menu banner eyebrow
            <input
              onChange={(event) =>
                updateStorefrontSection('offers', (current) => ({
                  ...current,
                  bannerEyebrow: event.target.value,
                }))
              }
              value={storefrontOffers.bannerEyebrow || ''}
            />
          </label>

          <label>
            Menu banner title
            <input
              onChange={(event) =>
                updateStorefrontSection('offers', (current) => ({
                  ...current,
                  bannerTitle: event.target.value,
                }))
              }
              value={storefrontOffers.bannerTitle || ''}
            />
          </label>

          <label>
            Menu banner description
            <textarea
              onChange={(event) =>
                updateStorefrontSection('offers', (current) => ({
                  ...current,
                  bannerDescription: event.target.value,
                }))
              }
              rows="3"
              value={storefrontOffers.bannerDescription || ''}
            />
          </label>

          <label>
            Home offers title
            <input
              onChange={(event) =>
                updateStorefrontSection('offers', (current) => ({
                  ...current,
                  spotlightTitle: event.target.value,
                }))
              }
              value={storefrontOffers.spotlightTitle || ''}
            />
          </label>

          <label>
            Delivery message
            <textarea
              onChange={(event) =>
                updateStorefrontSection('offers', (current) => ({
                  ...current,
                  deliveryMessage: event.target.value,
                }))
              }
              rows="3"
              value={storefrontOffers.deliveryMessage || ''}
            />
          </label>
        </div>
      </article>

      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Offer cards</p>
            <h2>Homepage and menu reassurance blocks</h2>
          </div>
        </div>

        <div className="stack-list">
          {offerCards.map((offer, index) => (
            <div className="admin-list-card" key={offer.id || `${index}`}>
              <div className="admin-form-stack">
                <label>
                  Offer title
                  <input
                    onChange={(event) => updateOfferCard(index, 'title', event.target.value)}
                    value={offer.title || ''}
                  />
                </label>

                <label>
                  Offer description
                  <textarea
                    onChange={(event) => updateOfferCard(index, 'description', event.target.value)}
                    rows="3"
                    value={offer.description || ''}
                  />
                </label>
              </div>

              <button className="btn btn-secondary" onClick={() => removeOfferCard(offer.id)} type="button">
                Remove this offer
              </button>
            </div>
          ))}
        </div>

        <div className="admin-button-stack">
          <button className="btn btn-secondary" onClick={addOfferCard} type="button">
            Add offer card
          </button>
          <button
            className="btn btn-primary"
            disabled={savingSettings}
            onClick={() => saveSettings(settingsDraft)}
            type="button"
          >
            {savingSettings ? 'Saving...' : 'Save offers'}
          </button>
        </div>
      </article>
    </section>
  );
};
