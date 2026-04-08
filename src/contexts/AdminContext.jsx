import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { ADMIN_NEW_ORDER_EVENT, buildOrderStatusNotification } from '../utils/orderNotifications';
import { useAppData } from './AppDataContext';
import { useAuth } from './AuthContext';

const AdminContext = createContext(null);
const ADMIN_LAST_SEEN_ORDER_KEY = 'sjfc-admin-last-seen-order-at';

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readLastSeenOrderAt = () => {
  if (!canUseStorage()) {
    return '';
  }

  return window.localStorage.getItem(ADMIN_LAST_SEEN_ORDER_KEY) || '';
};

const writeLastSeenOrderAt = (value) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ADMIN_LAST_SEEN_ORDER_KEY, value || '');
};

export const AdminProvider = ({ children }) => {
  const { token } = useAuth();
  const { products, categories, settings, refreshCatalog, setSettings } = useAppData();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [lastSeenOrderAt, setLastSeenOrderAt] = useState(() => readLastSeenOrderAt());
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [creatingDelivery, setCreatingDelivery] = useState(false);

  const refreshAdminData = useCallback(async ({ silent = false } = {}) => {
    if (!token) {
      return;
    }

    if (!silent) {
      setLoading(true);
    }

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
      if (!silent) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    refreshAdminData();
  }, [refreshAdminData, token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let intervalId = 0;

    const canPoll = () =>
      typeof document === 'undefined' ||
      (document.visibilityState === 'visible' && navigator.onLine !== false);

    const stopPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = 0;
      }
    };

    const startPolling = () => {
      stopPolling();
      if (!canPoll()) {
        return;
      }

      intervalId = window.setInterval(() => {
        if (canPoll()) {
          void refreshAdminData({ silent: true });
        }
      }, 15000);
    };

    const handleResume = () => {
      startPolling();
      if (canPoll()) {
        void refreshAdminData({ silent: true });
      }
    };

    startPolling();
    window.addEventListener('online', handleResume);
    document.addEventListener('visibilitychange', handleResume);

    return () => {
      stopPolling();
      window.removeEventListener('online', handleResume);
      document.removeEventListener('visibilitychange', handleResume);
    };
  }, [refreshAdminData, token]);

  useEffect(() => {
    if (settings) {
      setSettingsDraft(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  useEffect(() => {
    if (!orders.length) {
      setNewOrders([]);
      return;
    }

    const latestOrderCreatedAt = orders[0]?.createdAt || '';

    if (!lastSeenOrderAt) {
      setLastSeenOrderAt(latestOrderCreatedAt);
      writeLastSeenOrderAt(latestOrderCreatedAt);
      setNewOrders([]);
      return;
    }

    const lastSeenTimestamp = new Date(lastSeenOrderAt).getTime();
    const unseenOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt || '').getTime();
      return Number.isFinite(createdAt) && createdAt > lastSeenTimestamp;
    });

    setNewOrders(unseenOrders);
  }, [lastSeenOrderAt, orders]);

  useEffect(() => {
    const handleRealtimeOrder = (event) => {
      const nextOrder = event.detail;

      if (!nextOrder?.id) {
        return;
      }

      setOrders((current) => [nextOrder, ...current.filter((order) => order.id !== nextOrder.id)]);
    };

    window.addEventListener(ADMIN_NEW_ORDER_EVENT, handleRealtimeOrder);

    return () => window.removeEventListener(ADMIN_NEW_ORDER_EVENT, handleRealtimeOrder);
  }, []);

  const deliveryUsers = useMemo(() => users.filter((user) => user.role === 'delivery'), [users]);
  const customers = useMemo(() => users.filter((user) => user.role === 'customer'), [users]);
  const admins = useMemo(() => users.filter((user) => user.role === 'admin'), [users]);
  const unseenOrderCount = newOrders.length;

  const markOrdersSeen = useCallback(
    (seenAt = orders[0]?.createdAt || new Date().toISOString()) => {
      setLastSeenOrderAt(seenAt);
      writeLastSeenOrderAt(seenAt);
      setNewOrders([]);
    },
    [orders],
  );

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
        availabilitySchedule: formState.availabilitySchedule,
      };

      let savedProduct;

      if (editingProduct?.id) {
        savedProduct = await api.updateProduct(editingProduct.id, payload, token);
      } else {
        savedProduct = await api.createProduct(payload, token);
      }

      const nextScheduleMap = {
        ...(settings?.storefront?.productAvailabilitySchedules || {}),
      };

      if (formState.availabilitySchedule?.enabled) {
        nextScheduleMap[savedProduct.id] = formState.availabilitySchedule;
      } else {
        delete nextScheduleMap[savedProduct.id];
      }

      if (JSON.stringify(nextScheduleMap) !== JSON.stringify(settings?.storefront?.productAvailabilitySchedules || {})) {
        const nextSettings = await api.updateSettings(
          {
            storefront: {
              ...(settings?.storefront || {}),
              productAvailabilitySchedules: nextScheduleMap,
            },
          },
          token,
        );
        setSettings(nextSettings);
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
      const currentOrder = orders.find((order) => order.id === orderId);
      const updatedOrder = await api.updateOrderStatus(orderId, payload, token);
      const nextNotification = buildOrderStatusNotification({
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: payload.status,
      });

      if (
        nextNotification &&
        currentOrder?.status &&
        currentOrder.status !== payload.status
      ) {
        api
          .sendOrderNotification(
            {
              orderId: updatedOrder.id,
              userId: updatedOrder.userId,
              status: payload.status,
              message: nextNotification.message,
            },
            token,
          )
          .catch(() => {});
      }

      await refreshAdminData({ silent: true });
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
      await refreshAdminData({ silent: true });
      setError('');
      return response;
    } catch (deliveryError) {
      setError(deliveryError.message);
      throw deliveryError;
    } finally {
      setCreatingDelivery(false);
    }
  };

  const updateSettingsDraftValue = useCallback((updater) => {
    setSettingsDraft((current) => (typeof updater === 'function' ? updater(current) : updater));
  }, []);

  const updateStorefrontSection = useCallback((section, updater) => {
    setSettingsDraft((current) => ({
      ...current,
      storefront: {
        ...(current?.storefront || {}),
        [section]:
          typeof updater === 'function'
            ? updater(current?.storefront?.[section] || {})
            : updater,
      },
    }));
  }, []);

  const updateStorefrontReviewList = useCallback((updater) => {
    setSettingsDraft((current) => ({
      ...current,
      storefront: {
        ...(current?.storefront || {}),
        reviews:
          typeof updater === 'function'
            ? updater(current?.storefront?.reviews || [])
            : updater,
      },
    }));
  }, []);

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
      markOrdersSeen,
      metrics,
      newOrders,
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
      updateSettingsDraftValue,
      updateStorefrontReviewList,
      updateStorefrontSection,
      unseenOrderCount,
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
      markOrdersSeen,
      metrics,
      newOrders,
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
      updateSettingsDraftValue,
      updateStorefrontReviewList,
      updateStorefrontSection,
      unseenOrderCount,
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
