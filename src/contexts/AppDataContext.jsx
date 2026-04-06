import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { applyThemeToDocument, createAppConfig } from '../theme/theme';
import { applyProductAvailabilitySchedule } from '../utils/availability';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppData = async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse, settingsResponse] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSettings(),
      ]);
      const scheduleMap = settingsResponse?.storefront?.productAvailabilitySchedules || {};
      setProducts(productsResponse.map((product) => applyProductAvailabilitySchedule(product, scheduleMap)));
      setCategories(categoriesResponse);
      setSettings(settingsResponse);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  useEffect(() => {
    applyThemeToDocument(settings?.storefront?.theme);
  }, [settings]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const favicon = document.querySelector("link[rel='icon']");
    const nextLogoUrl =
      settings?.storefront?.logoLightUrl ||
      (settings?.storefront?.logoUrl && settings.storefront.logoUrl !== '/brand-logo.png'
        ? settings.storefront.logoUrl
        : '/brand-logo-light.png');

    if (favicon) {
      favicon.setAttribute('href', nextLogoUrl);
      favicon.setAttribute('type', nextLogoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png');
    }
  }, [settings]);

  const value = useMemo(
    () => ({
      appConfig: createAppConfig({ categories, products, settings }),
      products,
      categories,
      settings,
      loading,
      error,
      refreshCatalog: loadAppData,
      refreshSettings: async () => {
        const nextSettings = await api.getSettings();
        setProducts((current) =>
          current.map((product) =>
            applyProductAvailabilitySchedule(
              {
                ...product,
                isAvailable: product.baseIsAvailable ?? product.isAvailable,
              },
              nextSettings?.storefront?.productAvailabilitySchedules || {},
            ),
          ),
        );
        setSettings(nextSettings);
        return nextSettings;
      },
      setProducts,
      setCategories,
      setSettings,
    }),
    [categories, error, loading, products, settings],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return context;
};
