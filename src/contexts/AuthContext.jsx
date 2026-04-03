import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

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

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: nextToken,
        user: nextUser,
      }),
    );
  };

  const login = async (payload) => {
    const response = await api.login(payload);
    persistSession(response.token, response.user);
    return response.user;
  };

  const acceptAuthSession = (response) => {
    if (!response?.token || !response?.user) {
      throw new Error('A valid authenticated session is required.');
    }

    persistSession(response.token, response.user);
    return response.user;
  };

  const register = async (payload) => {
    const response = await api.register(payload);
    persistSession(response.token, response.user);
    return response.user;
  };

  const logout = () => {
    import('../lib/supabase')
      .then(({ getSupabaseBrowserClient }) => {
        const supabase = getSupabaseBrowserClient();
        return supabase?.auth.signOut();
      })
      .catch(() => {});
    setToken('');
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refreshUser = async () => {
    if (!token) {
      return null;
    }
    const response = await api.me(token);
    setUser(response.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: response.user }));
    return response.user;
  };

  const updateAddresses = async (addresses) => {
    const response = await api.updateAddresses(addresses, token);
    setUser(response.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: response.user }));
    return response.user;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      acceptAuthSession,
      logout,
      refreshUser,
      updateAddresses,
    }),
    [loading, token, user],
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
