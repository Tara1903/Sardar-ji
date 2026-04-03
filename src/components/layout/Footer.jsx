import { DEFAULT_PHONE_NUMBER, DEFAULT_WHATSAPP_NUMBER } from '../../utils/contact';
import { createWhatsAppLink } from '../../utils/whatsapp';

export const Footer = ({ settings }) => (
  <footer className="site-footer">
    <div className="container footer-grid">
      <div>
        <h3>{settings?.businessName || 'Sardar Ji Food Corner'}</h3>
        <p>{settings?.tagline || 'Swad Bhi, Budget Bhi'}</p>
        <p>Fresh veg meals, fast local delivery, and clear pricing for busy days.</p>
      </div>
      <div>
        <h4>Contact</h4>
        <p>{settings?.phoneNumber || DEFAULT_PHONE_NUMBER}</p>
        <p>{settings?.timings || 'Morning to Night'}</p>
        <a
          href={createWhatsAppLink(
            settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
            'Hello Sardar Ji Food Corner, I want to place an order.',
          )}
          rel="noreferrer"
          target="_blank"
        >
          WhatsApp Order
        </a>
      </div>
      <div>
        <h4>Location</h4>
        {settings?.mapsEmbedUrl ? (
          <iframe className="footer-map" loading="lazy" src={settings.mapsEmbedUrl} title="Sardar Ji map" />
        ) : (
          <div className="map-placeholder compact">
            <p>Business map or pickup landmark can be added from the admin settings.</p>
          </div>
        )}
      </div>
    </div>
  </footer>
);
