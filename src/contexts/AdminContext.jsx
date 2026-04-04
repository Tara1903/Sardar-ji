import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAppData } from './AppDataContext';
import { useAuth } from './AuthContext';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const { token } = useAuth();
  const { products, categories, settings, refreshCatalog, setSettings } = useAppData();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [creatingDelivery, setCreatingDelivery] = useState(false);

  const refreshAdminData = async () => {
    setLoading(true);
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        api.getOrders(token),
        api.getUsers(null, token),
      ]);
      setOrders(ordersResponse);
      setUsers(usersResponse);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    refreshAdminData();
  }, [token]);

  useEffect(() => {
    if (settings) {
      setSettingsDraft(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  const deliveryUsers = useMemo(() => users.filter((user) => user.role === 'delivery'), [users]);
  const customers = useMemo(() => users.filter((user) => user.role === 'customer'), [users]);
  const admins = useMemo(() => users.filter((user) => user.role === 'admin'), [users]);

  const metrics = useMemo(
    () => ({
      liveProducts: products.length,
      totalOrders: orders.length,
      activeOrders: orders.filter((order) => order.status !== 'Delivered').length,
      deliveryPartners: deliveryUsers.length,
      customers: customers.length,
    }),
    [customers.length, deliveryUsers.length, orders, products.length],
  );

  const saveProduct = async (formState, editingProduct) => {
    setSavingProduct(true);
    try {
      let imageUrl = formState.image;

      if (formState.imageFile) {
        const upload = await api.uploadImage(formState.imageFile, token);
        imageUrl = upload.url;
      }

      const payload = {
        name: formState.name,
        price: Number(formState.price),
        description: formState.description,
        category: formState.category,
        badge: formState.badge,
        isAvailable: Boolean(formState.isAvailable),
        image: imageUrl || '',
      };

      if (editingProduct?.id) {
        await api.updateProduct(editingProduct.id, payload, token);
      } else {
        await api.createProduct(payload, token);
      }

      await refreshCatalog();
      setError('');
    } catch (saveError) {
      setError(saveError.message);
      throw saveError;
    } finally {
      setSavingProduct(false);
    }
  };

  const removeProduct = async (productId) => {
    await api.deleteProduct(productId, token);
    await refreshCatalog();
  };

  const saveCategory = async (payload) => {
    setCreatingCategory(true);
    try {
      await api.createCategory(payload, token);
      await refreshCatalog();
      setError('');
    } catch (categoryError) {
      setError(categoryError.message);
      throw categoryError;
    } finally {
      setCreatingCategory(false);
    }
  };

  const updateCategory = async (categoryId, payload) => {
    setCreatingCategory(true);
    try {
      await api.updateCategory(categoryId, payload, token);
      await refreshCatalog();
      setError('');
    } catch (categoryError) {
      setError(categoryError.message);
      throw categoryError;
    } finally {
      setCreatingCategory(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    setCreatingCategory(true);
    try {
      await api.deleteCategory(categoryId, token);
      await refreshCatalog();
      setError('');
    } catch (categoryError) {
      setError(categoryError.message);
      throw categoryError;
    } finally {
      setCreatingCategory(false);
    }
  };

  const saveSettings = async (nextSettingsDraft) => {
    setSavingSettings(true);
    try {
      const nextSettings = await api.updateSettings(nextSettingsDraft, token);
      setSettings(nextSettings);
      setError('');
      return nextSettings;
    } catch (settingsError) {
      setError(settingsError.message);
      throw settingsError;
    } finally {
      setSavingSettings(false);
    }
  };

  const saveOrderUpdate = async (orderId, payload) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, payload, token);
      await refreshAdminData();
      setError('');
    } catch (orderError) {
      setError(orderError.message);
      throw orderError;
    } finally {
      setUpdatingOrderId('');
    }
  };

  const saveDeliveryPartner = async (payload) => {
    setCreatingDelivery(true);
    try {
      const response = await api.createDeliveryPartner(payload, token);
      await refreshAdminData();
      setError('');
      return response;
    } catch (deliveryError) {
      setError(deliveryError.message);
      throw deliveryError;
    } finally {
      setCreatingDelivery(false);
    }
  };

  const uploadAsset = async (file) => api.uploadImage(file, token);

  const value = useMemo(
    () => ({
      admins,
      categories,
      creatingCategory,
      creatingDelivery,
      customers,
      deleteCategory,
      deliveryUsers,
      error,
      loading,
      metrics,
      orders,
      products,
      refreshAdminData,
      removeProduct,
      saveCategory,
      saveDeliveryPartner,
      saveOrderUpdate,
      saveProduct,
      saveSettings,
      savingProduct,
      savingSettings,
      settingsDraft,
      setError,
      setSettingsDraft,
      updateCategory,
      updatingOrderId,
      uploadAsset,
      users,
    }),
    [
      admins,
      categories,
      creatingCategory,
      creatingDelivery,
      customers,
      deleteCategory,
      deliveryUsers,
      error,
      loading,
      metrics,
      orders,
      products,
      savingProduct,
      savingSettings,
      settingsDraft,
      updateCategory,
      updatingOrderId,
      uploadAsset,
      users,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider');
  }

  return context;
};
