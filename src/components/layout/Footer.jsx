import { Instagram, MapPin, MessageCircleMore, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_PHONE_NUMBER, DEFAULT_WHATSAPP_NUMBER } from '../../utils/contact';
import { createGeneralOrderMessage, createWhatsAppLink } from '../../utils/whatsapp';
import { BrandLockup } from '../brand/BrandLockup';
import {
  STORE_ADDRESS,
  STORE_ADDRESS_SHORT,
  STORE_GOOGLE_PHOTOS_URL,
  STORE_GOOGLE_POSTS_URL,
  STORE_GOOGLE_REVIEW_URL,
  STORE_MAP_URL,
  resolveStoreTimings,
} from '../../utils/storefront';
import { trackWhatsAppClick } from '../../utils/analytics';
import { isNativeAppShell } from '../../lib/nativeApp';

export const Footer = ({ settings }) => {
  const hideDownloadAppLink = isNativeAppShell();
  const googleBusiness = settings?.storefront?.googleBusinessProfile || {};
  const menuUrl = googleBusiness.menuUrl || '/menu';
  const orderUrl = googleBusiness.orderUrl || '/checkout';
  const photosUrl = googleBusiness.photosUrl || STORE_GOOGLE_PHOTOS_URL;
  const postsUrl = googleBusiness.postsUrl || STORE_GOOGLE_POSTS_URL;
  const reviewUrl = googleBusiness.reviewUrl || STORE_GOOGLE_REVIEW_URL;

  return (
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
          {!hideDownloadAppLink ? <Link to="/download-app">Download App</Link> : null}
          <Link to="/tiffin-service-indore">Tiffin Service</Link>
          <Link to="/punjabi-food-restaurant-indore">Punjabi Food</Link>
          <Link to="/veg-tiffin-service-indore">Veg Tiffin</Link>
          <Link to="/office-lunch-delivery-indore">Office Lunch</Link>
          <Link to="/daily-thali-near-silicon-road">Daily Thali</Link>
          <Link to="/cart">Cart</Link>
        </div>
      </div>

      <div>
        <h4>Google Business</h4>
        <div className="footer-links">
          <a href={menuUrl} rel="noreferrer" target="_blank">
            Menu link
          </a>
          <a href={orderUrl} rel="noreferrer" target="_blank">
            Order link
          </a>
          <a href={photosUrl} rel="noreferrer" target="_blank">
            Photos
          </a>
          <a href={postsUrl} rel="noreferrer" target="_blank">
            Posts
          </a>
          <a href={reviewUrl} rel="noreferrer" target="_blank">
            Leave a review
          </a>
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
            onClick={() =>
              trackWhatsAppClick({
                source: 'footer',
                label: 'general-order',
              })
            }
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
          onClick={() =>
            trackWhatsAppClick({
              source: 'footer-cta',
              label: 'general-order',
            })
          }
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
};
