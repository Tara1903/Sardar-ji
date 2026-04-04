import { LayoutTemplate } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const sectionFields = [
  ['hero', 'Hero section'],
  ['categories', 'Categories section'],
  ['reviews', 'Reviews section'],
  ['popup', 'Popup'],
  ['visit', 'Visit us section'],
];

export const AdminSectionsPage = () => {
  const { saveSettings, savingSettings, settingsDraft, updateStorefrontSection } = useAdmin();

  if (!settingsDraft) {
    return null;
  }

  const sections = settingsDraft.storefront?.sections || {};

  return (
    <section className="admin-page-grid">
      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Section visibility</p>
            <h2>Choose what appears on the website</h2>
          </div>
          <LayoutTemplate size={18} />
        </div>

        <div className="stack-list">
          {sectionFields.map(([key, label]) => (
            <label className="availability-toggle admin-toggle-row" key={key}>
              <input
                checked={sections[key] !== false}
                onChange={(event) =>
                  updateStorefrontSection('sections', (current) => ({
                    ...current,
                    [key]: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>{label}</span>
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
            {savingSettings ? 'Saving...' : 'Save visibility settings'}
          </button>
        </div>
      </article>
    </section>
  );
};
