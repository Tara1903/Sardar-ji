import { Instagram, MapPin, MessageCircleMore, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_PHONE_NUMBER, DEFAULT_WHATSAPP_NUMBER } from '../../utils/contact';
import { createGeneralOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { BrandLockup } from '../brand/BrandLockup';
import {
  STORE_ADDRESS,
  STORE_ADDRESS_SHORT,
  STORE_MAP_URL,
  resolveStoreTimings,
} from '../../utils/storefront';

export const Footer = ({ settings }) => (
  <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-branding">
        <BrandLockup
          className="footer-brand"
          linkTo="/"
          tagline={settings?.tagline || 'Swad Bhi, Budget Bhi'}
          title={settings?.businessName || 'Sardar Ji Food Corner'}
        />
        <p>{settings?.tagline || 'Swad Bhi, Budget Bhi'}</p>
        <p>
          Fresh veg meals, quick WhatsApp ordering, and a premium local food experience built for
          repeat customers.
        </p>
      </div>

      <div>
        <h4>Contact</h4>
        <div className="footer-contact-list">
          <p>
            <PhoneCall size={16} />
            <span>{settings?.phoneNumber || DEFAULT_PHONE_NUMBER}</span>
          </p>
          <p>
            <MapPin size={16} />
            <span>{STORE_ADDRESS_SHORT}</span>
          </p>
          <p>{resolveStoreTimings(settings?.timings)}</p>
          <a href={STORE_MAP_URL} rel="noreferrer" target="_blank">
            Open in Google Maps
          </a>
        </div>
      </div>

      <div>
        <h4>Quick Links</h4>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/monthly-thali-plan-indore">Monthly Plan</Link>
          <Link to="/tiffin-service-indore">Tiffin Service</Link>
          <Link to="/cart">Cart</Link>
        </div>
      </div>

      <div>
        <h4>Connect</h4>
        <div className="footer-socials">
          <a
            aria-label="Order on WhatsApp"
            href={createWhatsAppLink(
              settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
              createGeneralOrderMessage(),
            )}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircleMore size={18} />
            WhatsApp
          </a>
          <a aria-label="Instagram" href="https://www.instagram.com/" rel="noreferrer" target="_blank">
            <Instagram size={18} />
            Instagram
          </a>
        </div>

        <a
          className="btn btn-primary footer-cta"
          href={createWhatsAppLink(
            settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
            createGeneralOrderMessage(),
          )}
          rel="noreferrer"
          target="_blank"
        >
          Order Now on WhatsApp
        </a>
        <p className="footer-note">{STORE_ADDRESS}</p>
      </div>
    </div>
  </footer>
);
