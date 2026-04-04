import { ExternalLink, MapPin } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import {
  STORE_ADDRESS,
  STORE_ADDRESS_SHORT,
  STORE_MAP_EMBED_URL,
  STORE_MAP_URL,
} from '../../utils/storefront';

export const VisitUsSection = () => {
  const { settings } = useAppData();
  const businessName = settings?.businessName || 'Sardar Ji Food Corner';

  return (
    <section className="section visit-section">
      <div className="container visit-grid">
        <div className="visit-copy">
          <p className="eyebrow">Visit Us</p>
          <h2>Visit us for hot meals, quick pickup, and fresh daily cooking</h2>
          <p>
            Find Sardar Ji Food Corner at Palm n Dine Market and stop by for thalis, parathas, snacks, and beverages.
          </p>

          <div className="visit-address-card">
            <MapPin size={18} />
            <div>
              <strong>{businessName}</strong>
              <p>{STORE_ADDRESS_SHORT}</p>
              <small>{STORE_ADDRESS}</small>
            </div>
          </div>

          <a className="btn btn-secondary" href={STORE_MAP_URL} rel="noreferrer" target="_blank">
            <ExternalLink size={16} />
            Open in Google Maps
          </a>
        </div>

        <div className="visit-map-frame">
          <iframe
            className="visit-map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={settings?.mapsEmbedUrl || STORE_MAP_EMBED_URL}
            title={`Visit ${businessName}`}
          />
        </div>
      </div>
    </section>
  );
};
