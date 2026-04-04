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
  const { saveSettings, savingSettings, settingsDraft, updateStorefrontSection } = useAdmin();

  if (!settingsDraft) {
    return null;
  }

  const theme = settingsDraft.storefront?.theme || {};

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
            <h2>Quick check before publishing</h2>
          </div>
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
