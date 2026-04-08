import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from '../api/client';
import { createTokenSupabaseClient } from '../lib/supabase';
import { publicEnvFlags, publicEnv } from '../lib/env';
import { isNativeAppShell } from '../lib/nativeApp';
import {
  ADMIN_NEW_ORDER_EVENT,
  buildOrderStatusNotification,
  normalizeRealtimeOrderPreview,
} from '../utils/orderNotifications';
import {
  canUseWebPushNotifications,
  isPushSubscriptionPayloadValid,
  normalizePushSubscriptionPayload,
  urlBase64ToUint8Array,
} from '../utils/pushNotifications';
import { useAuth } from './AuthContext';
import {
  requestNativeNotificationPermission,
  showNativeLocalNotification,
} from '../lib/nativeFeatures';

const NotificationContext = createContext(null);
const MAX_TOASTS = 4;
const TOAST_DURATION_MS = 5200;

const canUseBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const readStatusCache = (userId = '') => {
  if (!canUseBrowser()) {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(`sjfc-order-status-cache:${userId}`) || '{}');
  } catch {
    return {};
  }
};

const writeStatusCache = (userId, cache) => {
  if (!canUseBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(`sjfc-order-status-cache:${userId}`, JSON.stringify(cache));
  } catch {
    // Ignore local storage errors so notifications never block the UI.
  }
};

const getNotificationPermission = () =>
  typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';

const createToastRecord = (payload) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  createdAt: Date.now(),
  ...payload,
});

export const NotificationProvider = ({ children }) => {
  const { token, user, refreshUser } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [pushPermission, setPushPermission] = useState(getNotificationPermission);
  const toastTimersRef = useRef(new Map());
  const orderStatusCacheRef = useRef(readStatusCache(user?.id));
  const audioContextRef = useRef(null);
  const alertsUnlockedRef = useRef(false);

  const dismissToast = useCallback((toastId) => {
    const timer = toastTimersRef.current.get(toastId);

    if (timer) {
      window.clearTimeout(timer);
      toastTimersRef.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const enqueueToast = useCallback(
    (payload) => {
      const toast = createToastRecord(payload);
      setToasts((current) => [toast, ...current].slice(0, MAX_TOASTS));
      const timeoutId = window.setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
      toastTimersRef.current.set(toast.id, timeoutId);
    },
    [dismissToast],
  );

  useEffect(
    () => () => {
      toastTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      toastTimersRef.current.clear();
    },
    [],
  );

  const primeAdminAudio = useCallback(async () => {
    if (!canUseBrowser() || alertsUnlockedRef.current) {
      return;
    }

    alertsUnlockedRef.current = true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (AudioContextClass) {
      audioContextRef.current = audioContextRef.current || new AudioContextClass();

      if (audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
        } catch {
          // Ignore browser audio resume failures.
        }
      }
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(' ');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore synthesis warm-up failures.
      }
    }
  }, []);

  const playAdminBeep = useCallback(() => {
    const audioContext = audioContextRef.current;

    if (!audioContext || audioContext.state === 'closed') {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const currentTime = audioContext.currentTime;

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, currentTime);
    gainNode.gain.setValueAtTime(0.0001, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.09, currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.24);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.26);
  }, []);

  const speakAdminAnnouncement = useCallback((message) => {
    if (!canUseBrowser() || !('speechSynthesis' in window) || !alertsUnlockedRef.current) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = 'en-IN';
      speech.rate = 1;
      window.speechSynthesis.speak(speech);
    } catch {
      // Ignore browser speech support issues.
    }
  }, []);

  const ensurePushSubscription = useCallback(
    async ({ requestPermission = false } = {}) => {
      if (
        !token ||
        user?.role !== 'customer' ||
        isNativeAppShell() ||
        !publicEnvFlags.hasWebPushPublicKey ||
        !canUseWebPushNotifications()
      ) {
        return false;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      let permission = getNotificationPermission();

      if (permission === 'default' && requestPermission) {
        permission = await Notification.requestPermission();
      }

      setPushPermission(permission);

      if (permission !== 'granted') {
        return false;
      }

      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicEnv.webPushPublicKey),
        }));

      const payload = normalizePushSubscriptionPayload(subscription);

      if (!isPushSubscriptionPayloadValid(payload)) {
        return false;
      }

      await api.savePushSubscription(payload, token);
      await refreshUser().catch(() => null);
      return true;
    },
    [refreshUser, token, user?.role],
  );

  useEffect(() => {
    if (!token || !user) {
      return undefined;
    }

    const handleFirstInteraction = () => {
      if (user.role === 'admin') {
        void primeAdminAudio();
      }

      if (user.role === 'customer') {
        if (isNativeAppShell()) {
          void requestNativeNotificationPermission();
        }
        void ensurePushSubscription({ requestPermission: true });
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [ensurePushSubscription, primeAdminAudio, token, user]);

  useEffect(() => {
    if (!token || user?.role !== 'customer') {
      return;
    }

    if (isNativeAppShell()) {
      void requestNativeNotificationPermission();
    }

    void ensurePushSubscription({ requestPermission: false });
  }, [ensurePushSubscription, token, user?.role]);

  useEffect(() => {
    if (!token || user?.role !== 'customer') {
      return undefined;
    }

    orderStatusCacheRef.current = readStatusCache(user.id);

    let isMounted = true;
    const supabase = createTokenSupabaseClient(token);

    if (!supabase) {
      return undefined;
    }

    void supabase.realtime.setAuth(token);

    const bootstrapStatuses = async () => {
      try {
        const orders = await api.getOrders(token);

        if (!isMounted) {
          return;
        }

        const nextStatusMap = Object.fromEntries(orders.map((order) => [order.id, order.status]));
        const previousStatusMap = orderStatusCacheRef.current || {};

        if (isNativeAppShell()) {
          orders.forEach((order) => {
            const previousStatus = previousStatusMap[order.id];

            if (!previousStatus || previousStatus === order.status) {
              return;
            }

            const notification = buildOrderStatusNotification(order);

            if (!notification) {
              return;
            }

            void showNativeLocalNotification({
              id: Number(String(order.id).replace(/\D/g, '').slice(-8)) || undefined,
              title: notification.title,
              body: notification.message,
              extra: {
                orderId: order.id,
                url: notification.url,
              },
            });
          });
        }

        orderStatusCacheRef.current = nextStatusMap;
        writeStatusCache(user.id, orderStatusCacheRef.current);
      } catch {
        // Ignore bootstrap failures and keep realtime notifications working.
      }
    };

    void bootstrapStatuses();

    const channel = supabase
      .channel(`customer-order-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const nextOrder = normalizeRealtimeOrderPreview(payload.new);
          const previousStatus = orderStatusCacheRef.current[nextOrder.id] || '';

          orderStatusCacheRef.current = {
            ...orderStatusCacheRef.current,
            [nextOrder.id]: nextOrder.status,
          };
          writeStatusCache(user.id, orderStatusCacheRef.current);

          if (!previousStatus || previousStatus === nextOrder.status) {
            return;
          }

          const notification = buildOrderStatusNotification(nextOrder);

          if (!notification) {
            return;
          }

          enqueueToast({
            kind: 'customer',
            title: notification.title,
            message: notification.message,
            actionLabel: 'Track order',
            actionTo: notification.url,
          });

          if (
            isNativeAppShell()
          ) {
            void showNativeLocalNotification({
              id: Number(String(nextOrder.id).replace(/\D/g, '').slice(-8)) || undefined,
              title: notification.title,
              body: notification.message,
              extra: {
                orderId: nextOrder.id,
                url: notification.url,
              },
            });
          } else if (
            typeof document !== 'undefined' &&
            document.visibilityState === 'hidden' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            new Notification('Sardar Ji Food Corner', {
              body: notification.message,
              icon: '/brand-logo-light.png',
            });
          }
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [enqueueToast, token, user?.id, user?.role]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      return undefined;
    }

    const supabase = createTokenSupabaseClient(token);

    if (!supabase) {
      return undefined;
    }

    void supabase.realtime.setAuth(token);

    const channel = supabase
      .channel(`admin-order-alerts-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = normalizeRealtimeOrderPreview(payload.new);

          enqueueToast({
            kind: 'admin',
            title: 'New order received',
            message: `${order.customerName} placed ${order.orderNumber || 'a new order'}.`,
            actionLabel: 'Open orders',
            actionTo: '/admin/orders',
          });
          playAdminBeep();
          speakAdminAnnouncement('New order received');
          window.dispatchEvent(
            new CustomEvent(ADMIN_NEW_ORDER_EVENT, {
              detail: order,
            }),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enqueueToast, playAdminBeep, speakAdminAnnouncement, token, user?.id, user?.role]);

  const value = useMemo(
    () => ({
      dismissToast,
      enqueueToast,
      ensurePushSubscription,
      pushPermission,
      toasts,
    }),
    [dismissToast, enqueueToast, ensurePushSubscription, pushPermission, toasts],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }

  return context;
};
