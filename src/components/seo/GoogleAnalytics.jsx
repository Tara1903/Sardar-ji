import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { publicEnv } from '../../lib/env';

export const GoogleAnalytics = () => {
  const location = useLocation();
  const measurementId = publicEnv.googleAnalyticsId;

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') {
      return;
    }

    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }

    if (!document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
      window.gtag('js', new Date());
    }

    window.gtag('config', measurementId, {
      page_path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search, measurementId]);

  return null;
};
