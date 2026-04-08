import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { getSupabaseBrowserClient } from '../lib/supabase';

const AuthContext = createContext(null);
const STORAGE_KEY = 'sardar-ji-session';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.token || '');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.user || null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const syncSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.me(token);
        setUser(response.user);
      } catch (_error) {
        setToken('');
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    syncSession();
  }, [token]);

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: nextToken,
        user: nextUser,
      }),
    );
  }, []);

  const authenticateCredentials = useCallback(async (payload) => api.login(payload), []);

  const login = useCallback(async (payload) => {
    const response = await authenticateCredentials(payload);
    persistSession(response.token, response.user);
    return response.user;
  }, [authenticateCredentials, persistSession]);

  const acceptAuthSession = useCallback((response) => {
    if (!response?.token || !response?.user) {
      throw new Error('A valid authenticated session is required.');
    }

    persistSession(response.token, response.user);
    return response.user;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const response = await api.register(payload);
    persistSession(response.token, response.user);
    return response.user;
  }, [persistSession]);

  const logout = useCallback(() => {
    const activeToken = token;
    const pushSubscriptions = user?.pushSubscriptions || [];
    const nativePushTokens = user?.nativePushTokens || [];
    const supabase = getSupabaseBrowserClient();

    if (activeToken) {
      const cleanupRequests = [
        ...pushSubscriptions
          .map((subscription) => subscription?.endpoint)
          .filter(Boolean)
          .map((endpoint) => api.removePushSubscription(endpoint, activeToken)),
        ...nativePushTokens
          .map((entry) => entry?.token)
          .filter(Boolean)
          .map((nativeToken) => api.removeNativePushToken(nativeToken, activeToken)),
      ];

      if (cleanupRequests.length) {
        Promise.allSettled(cleanupRequests).catch(() => {});
      }
    }

    supabase?.auth.signOut().catch(() => {});
    setToken('');
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [token, user]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }
    const response = await api.me(token);
    setUser(response.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: response.user }));
    return response.user;
  }, [token]);

  const updateAddresses = useCallback(async (addresses) => {
    const response = await api.updateAddresses(addresses, token);
    setUser(response.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: response.user }));
    return response.user;
  }, [token]);

  const updateSubscriptionPreferences = useCallback(async (payload) => {
    const response = await api.updateSubscriptionPreferences(payload, token);
    setUser(response.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: response.user }));
    return response.user;
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(user && token),
      authenticateCredentials,
      login,
      register,
      acceptAuthSession,
      logout,
      refreshUser,
      updateAddresses,
      updateSubscriptionPreferences,
    }),
    [
      acceptAuthSession,
      authenticateCredentials,
      loading,
      login,
      logout,
      refreshUser,
      register,
      token,
      updateAddresses,
      updateSubscriptionPreferences,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
