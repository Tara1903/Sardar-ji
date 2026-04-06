import { Brush } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const themeFields = [
  ['primary', 'Primary color'],
  ['secondary', 'Secondary color'],
  ['highlight', 'Highlight color'],
  ['background', 'Background color'],
  ['card', 'Card color'],
];

export const AdminThemePage = () => {
  const { saveSettings, savingSettings, settingsDraft, updateStorefrontSection, uploadAsset } = useAdmin();

  if (!settingsDraft) {
    return null;
  }

  const theme = settingsDraft.storefront?.theme || {};
  const hasThemeSpecificLogos =
    Boolean(settingsDraft.storefront?.logoLightUrl) || Boolean(settingsDraft.storefront?.logoDarkUrl);
  const sharedLogoUrl =
    settingsDraft.storefront?.logoUrl && settingsDraft.storefront.logoUrl !== '/brand-logo.png'
      ? settingsDraft.storefront.logoUrl
      : '/brand-logo-light.png';
  const logoUrl = sharedLogoUrl;
  const logoLightUrl = hasThemeSpecificLogos
    ? settingsDraft.storefront?.logoLightUrl || sharedLogoUrl
    : '/brand-logo-light.png';
  const logoDarkUrl = hasThemeSpecificLogos
    ? settingsDraft.storefront?.logoDarkUrl || sharedLogoUrl
    : '/brand-logo-dark.png';

  const handleLogoUpload = async (key, file) => {
    if (!file) {
      return;
    }

    const upload = await uploadAsset(file);
    updateStorefrontSection(key, upload.url);
  };

  return (
    <section className="admin-page-grid">
      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Theme settings</p>
            <h2>Update colors across the website</h2>
          </div>
          <Brush size={18} />
        </div>

        <div className="admin-form-stack">
          <label>
            Shared logo image URL
            <input
              onChange={(event) => updateStorefrontSection('logoUrl', event.target.value)}
              value={logoUrl}
            />
          </label>

          <label>
            Light theme logo URL
            <input
              onChange={(event) => updateStorefrontSection('logoLightUrl', event.target.value)}
              value={logoLightUrl}
            />
          </label>

          <label>
            Upload light theme logo
            <input
              accept="image/*"
              onChange={(event) => handleLogoUpload('logoLightUrl', event.target.files?.[0])}
              type="file"
            />
          </label>

          <label>
            Dark theme logo URL
            <input
              onChange={(event) => updateStorefrontSection('logoDarkUrl', event.target.value)}
              value={logoDarkUrl}
            />
          </label>

          <label>
            Upload dark theme logo
            <input
              accept="image/*"
              onChange={(event) => handleLogoUpload('logoDarkUrl', event.target.files?.[0])}
              type="file"
            />
          </label>

          {themeFields.map(([key, label]) => (
            <label key={key}>
              {label}
              <div className="admin-color-input">
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
                <input
                  onChange={(event) =>
                    updateStorefrontSection('theme', (current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  value={theme[key] || ''}
                />
              </div>
            </label>
          ))}
        </div>

        <div className="admin-button-stack">
          <button
            className="btn btn-primary"
            disabled={savingSettings}
            onClick={() => saveSettings(settingsDraft)}
            type="button"
          >
            {savingSettings ? 'Saving...' : 'Save theme settings'}
          </button>
        </div>
      </article>

      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Preview palette</p>
            <h2>Logo and palette preview</h2>
          </div>
        </div>

        <div className="image-preview wide admin-preview-frame admin-logo-preview">
          <img alt="Light theme logo preview" src={logoLightUrl} />
        </div>

        <div className="image-preview wide admin-preview-frame admin-logo-preview dark-preview">
          <img alt="Dark theme logo preview" src={logoDarkUrl} />
        </div>

        <div className="admin-theme-preview">
          {themeFields.map(([key, label]) => (
            <div className="admin-theme-chip" key={key}>
              <span className="admin-theme-swatch" style={{ background: theme[key] || '#000000' }} />
              <div>
                <strong>{label}</strong>
                <p>{theme[key] || '#000000'}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};
