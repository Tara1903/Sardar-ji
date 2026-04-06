import { Link } from 'react-router-dom';
import { MapPin, MessageCircleMore, Star } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { createGeneralOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { SITE_LOCATION_LABEL } from '../../seo/siteSeo';
import { resolveStoreTimings } from '../../utils/storefront';

export const LocalSeoSection = () => {
  const { settings } = useAppData();
  const googleBusiness = settings?.storefront?.googleBusinessProfile || {};
  const reviewUrl = googleBusiness.reviewUrl;

  return (
    <section className="section local-seo-section">
      <div className="container">
        <div className="panel-card local-seo-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Why choose our tiffin service in Indore?</p>
              <h2>Affordable tiffin near you with pure veg meals and a monthly thali plan</h2>
            </div>
          </div>

          <div className="local-seo-grid">
            <div>
              <p>
                Sardar Ji Food Corner serves customers looking for a dependable tiffin service in
                Indore, a monthly thali plan in Indore, and fast food delivery in Indore for office,
                hostel, and home.
              </p>
              <p>
                {SITE_LOCATION_LABEL}. That helps nearby customers discover an affordable tiffin near
                me, place orders quickly, and return for daily homestyle veg food.
              </p>
              <p>Active hours: {resolveStoreTimings(settings?.timings)}</p>
            </div>

            <div className="local-seo-points">
              <div className="local-seo-point">
                <Star size={16} />
                <span>Pure veg home-style food prepared for repeat daily ordering</span>
              </div>
              <div className="local-seo-point">
                <MapPin size={16} />
                <span>Strong Indore location signals near Palm n Dine Market</span>
              </div>
              <div className="local-seo-point">
                <MessageCircleMore size={16} />
                <span>Fast ordering via website, cart, checkout, and WhatsApp fallback</span>
              </div>
            </div>
          </div>

          <div className="local-seo-links">
            <Link className="btn btn-primary" to="/monthly-thali-plan-indore">
              Explore Monthly Thali Plan
            </Link>
            <Link className="btn btn-secondary" to="/tiffin-service-indore">
              Read about Tiffin Service
            </Link>
            <Link className="btn btn-secondary" to="/office-lunch-delivery-indore">
              Office lunch delivery
            </Link>
            <Link className="btn btn-secondary" to="/daily-thali-near-silicon-road">
              Daily thali near Silicon Road
            </Link>
            <a
              className="text-link"
              href={createWhatsAppLink(settings?.whatsappNumber, createGeneralOrderMessage())}
              rel="noreferrer"
              target="_blank"
            >
              Order on WhatsApp
            </a>
            {reviewUrl ? (
              <a className="text-link" href={reviewUrl} rel="noreferrer" target="_blank">
                Leave a Google review
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
