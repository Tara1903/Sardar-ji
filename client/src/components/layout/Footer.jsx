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
        <p>{settings?.phoneNumber || '+91 99999 99999'}</p>
        <p>{settings?.timings || 'Morning to Night'}</p>
        <a href={`https://wa.me/${(settings?.whatsappNumber || '919999999999').replace(/\D/g, '')}`}>WhatsApp Order</a>
      </div>
      <div>
        <h4>Location</h4>
        {settings?.mapsEmbedUrl ? (
          <iframe className="footer-map" loading="lazy" src={settings.mapsEmbedUrl} title="Sardar Ji map" />
        ) : (
          <div className="map-placeholder compact">
            <p>Google Maps embed ready. Add your location link in admin settings.</p>
          </div>
        )}
      </div>
    </div>
  </footer>
);
