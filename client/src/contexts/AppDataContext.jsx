import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

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
      setProducts(productsResponse);
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

  const value = useMemo(
    () => ({
      products,
      categories,
      settings,
      loading,
      error,
      refreshCatalog: loadAppData,
      refreshSettings: async () => setSettings(await api.getSettings()),
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
