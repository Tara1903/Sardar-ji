import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { applyThemeToDocument, createAppConfig } from '../theme/theme';
import { applyProductAvailabilitySchedule } from '../utils/availability';
import { collectAddonShadowProductIds, normalizeProductAddonGroups } from '../utils/addons';
import { isNativeAppShell } from '../lib/nativeApp';

const AppDataContext = createContext(null);
const APP_DATA_CACHE_KEY = 'sjfc-app-data-cache-v1';

const canUseBrowser = () => typeof window !== 'undefined';

const readAppDataCache = () => {
  if (!canUseBrowser()) {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(APP_DATA_CACHE_KEY) || 'null');

    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.categories)) {
      return null;
    }

    return {
      products: parsed.products,
      categories: parsed.categories,
      settings: parsed.settings || null,
      updatedAt: parsed.updatedAt || '',
    };
  } catch {
    return null;
  }
};

const writeAppDataCache = (payload) => {
  if (!canUseBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      APP_DATA_CACHE_KEY,
      JSON.stringify({
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignore storage limits so catalog still renders.
  }
};

export const AppDataProvider = ({ children }) => {
  const cachedAppData = readAppDataCache();
  const [products, setProducts] = useState(cachedAppData?.products || []);
  const [categories, setCategories] = useState(cachedAppData?.categories || []);
  const [settings, setSettings] = useState(cachedAppData?.settings || null);
  const [loading, setLoading] = useState(!cachedAppData);
  const [error, setError] = useState('');
  const hasCachedAppData = Boolean(cachedAppData);

  const hydrateProducts = useCallback((productsResponse = [], settingsResponse = null) => {
    const scheduleMap = settingsResponse?.storefront?.productAvailabilitySchedules || {};
    const addonMap = settingsResponse?.storefront?.productAddonGroups || {};
    const shadowProductIds = new Set(collectAddonShadowProductIds(addonMap));

    return productsResponse
      .map((product) => ({
        ...applyProductAvailabilitySchedule(product, scheduleMap),
        addonGroups: normalizeProductAddonGroups(product, addonMap),
        isAddonShadow: shadowProductIds.has(product.id),
      }))
      .filter((product) => !product.isAddonShadow);
  }, []);

  const loadAppData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse, settingsResponse] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSettings(),
      ]);
      const nextProducts = hydrateProducts(productsResponse, settingsResponse);
      setProducts(nextProducts);
      setCategories(categoriesResponse);
      setSettings(settingsResponse);
      writeAppDataCache({
        products: nextProducts,
        categories: categoriesResponse,
        settings: settingsResponse,
      });
      setError('');
    } catch (loadError) {
      if (!hasCachedAppData) {
        setError(loadError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [hasCachedAppData, hydrateProducts]);

  useEffect(() => {
    void loadAppData();
  }, [loadAppData]);

  useEffect(() => {
    if (!canUseBrowser()) {
      return undefined;
    }

    const reloadOnReconnect = () => {
      void loadAppData();
    };

    window.addEventListener('online', reloadOnReconnect);
    return () => window.removeEventListener('online', reloadOnReconnect);
  }, [loadAppData]);

  useEffect(() => {
    if (!products.length) {
      return;
    }

    const imageUrls = products
      .slice(0, isNativeAppShell() ? 10 : 6)
      .map((product) => product.image)
      .filter(Boolean);

    imageUrls.forEach((url) => {
      const image = new Image();
      image.decoding = 'async';
      image.loading = 'eager';
      image.src = url;
    });
  }, [products]);

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
        const nextProducts = hydrateProducts(
          products.map((product) => ({
            ...product,
            isAvailable: product.baseIsAvailable ?? product.isAvailable,
          })),
          nextSettings,
        );
        setProducts(nextProducts);
        setSettings(nextSettings);
        writeAppDataCache({
          products: nextProducts,
          categories,
          settings: nextSettings,
        });
        setError('');
        return nextSettings;
      },
      setProducts,
      setCategories,
      setSettings,
    }),
    [categories, error, hydrateProducts, loading, products, settings],
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
