import { BellRing } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export const AdminPopupPage = () => {
  const { saveSettings, savingSettings, settingsDraft, updateStorefrontSection } = useAdmin();

  if (!settingsDraft) {
    return null;
  }

  const popup = settingsDraft.storefront?.popup || {};

  return (
    <section className="admin-page-grid">
      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Popup control</p>
            <h2>Offer popup content and timing</h2>
          </div>
          <BellRing size={18} />
        </div>

        <div className="admin-form-stack">
          <label className="availability-toggle admin-toggle-row">
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
            <span>Enable popup</span>
          </label>

          <label>
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

          <label>
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

          <label>
            Popup body
            <textarea
              onChange={(event) =>
                updateStorefrontSection('popup', (current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
              rows="3"
              value={popup.body || ''}
            />
          </label>

          <label>
            Popup note
            <textarea
              onChange={(event) =>
                updateStorefrontSection('popup', (current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              rows="3"
              value={popup.note || ''}
            />
          </label>

          <label>
            Popup delay in milliseconds
            <input
              min="0"
              onChange={(event) =>
                updateStorefrontSection('popup', (current) => ({
                  ...current,
                  delayMs: Number(event.target.value) || 0,
                }))
              }
              type="number"
              value={popup.delayMs || 0}
            />
          </label>

          <label>
            Primary button label
            <input
              onChange={(event) =>
                updateStorefrontSection('popup', (current) => ({
                  ...current,
                  primaryCta: event.target.value,
                }))
              }
              value={popup.primaryCta || ''}
            />
          </label>

          <label>
            Secondary button label
            <input
              onChange={(event) =>
                updateStorefrontSection('popup', (current) => ({
                  ...current,
                  secondaryCta: event.target.value,
                }))
              }
              value={popup.secondaryCta || ''}
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
            {savingSettings ? 'Saving...' : 'Save popup settings'}
          </button>
        </div>
      </article>

      <article className="panel-card admin-card-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>How the popup message reads</h2>
          </div>
        </div>

        <div className="admin-preview-copy">
          <p className="eyebrow">{popup.title || 'Popup title'}</p>
          <h3>{popup.subtitle || 'Popup subtitle'}</h3>
          <p>{popup.body || 'Popup body'}</p>
          <small>{popup.note || 'Popup note'}</small>
          <div className="admin-inline-actions">
            <span className="btn btn-primary">{popup.primaryCta || 'Primary action'}</span>
            <span className="btn btn-secondary">{popup.secondaryCta || 'Secondary action'}</span>
          </div>
        </div>
      </article>
    </section>
  );
};
