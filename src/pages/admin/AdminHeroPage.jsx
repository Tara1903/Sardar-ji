import { ImagePlus } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export const AdminHeroPage = () => {
  const {
    saveSettings,
    savingSettings,
    settingsDraft,
    updateStorefrontSection,
    uploadAsset,
  } = useAdmin();

  if (!settingsDraft) {
    return null;
  }

  const hero = settingsDraft.storefront?.hero || {};

  const handleUpload = async (file) => {
    if (!file) {
      return;
    }

    const upload = await uploadAsset(file);
    updateStorefrontSection('hero', (current) => ({
      ...current,
      backgroundImage: upload.url,
    }));
  };

  return (
    <section className="admin-page-grid">
      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Hero section</p>
            <h2>Control the first screen people see</h2>
          </div>
        </div>

        <div className="admin-form-stack">
          <label>
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

          <label>
            Subtext
            <textarea
              onChange={(event) =>
                updateStorefrontSection('hero', (current) => ({
                  ...current,
                  subtext: event.target.value,
                }))
              }
              rows="4"
              value={hero.subtext || ''}
            />
          </label>

          <label>
            Offer badge text
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

          <label>
            Primary button label
            <input
              onChange={(event) =>
                updateStorefrontSection('hero', (current) => ({
                  ...current,
                  primaryCta: event.target.value,
                }))
              }
              value={hero.primaryCta || ''}
            />
          </label>

          <label>
            Secondary button label
            <input
              onChange={(event) =>
                updateStorefrontSection('hero', (current) => ({
                  ...current,
                  secondaryCta: event.target.value,
                }))
              }
              value={hero.secondaryCta || ''}
            />
          </label>

          <label>
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

          <label>
            Upload background image
            <input
              accept="image/*"
              onChange={(event) => handleUpload(event.target.files?.[0])}
              type="file"
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
            {savingSettings ? 'Saving...' : 'Save hero section'}
          </button>
        </div>
      </article>

      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>Hero background and copy</h2>
          </div>
          <ImagePlus size={18} />
        </div>

        {hero.backgroundImage ? (
          <div className="image-preview wide admin-preview-frame">
            <img alt="Hero preview" src={hero.backgroundImage} />
          </div>
        ) : null}

        <div className="admin-preview-copy">
          <span className="offer-badge">{hero.offerText || 'Offer text'}</span>
          <h3>{hero.headline || 'Headline preview'}</h3>
          <p>{hero.subtext || 'Subtext preview'}</p>
          <div className="admin-inline-actions">
            <span className="btn btn-primary">{hero.primaryCta || 'Primary button'}</span>
            <span className="btn btn-secondary">{hero.secondaryCta || 'Secondary button'}</span>
          </div>
        </div>
      </article>
    </section>
  );
};
