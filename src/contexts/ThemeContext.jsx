import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = 'theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';
const THEME_VALUES = ['light', 'dark', 'system'];

const normalizeTheme = (value) => (THEME_VALUES.includes(value) ? value : 'system');

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }

  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
};

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY) || 'system');
  } catch {
    return 'system';
  }
};

const applyResolvedTheme = (resolvedTheme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const isDark = resolvedTheme === 'dark';

  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';

  const metaThemeColor = document.querySelector("meta[name='theme-color']");

  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#101713' : '#e23744');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const initialTheme = getStoredTheme();
    return initialTheme === 'system' ? getSystemTheme() : initialTheme;
  });

  useEffect(() => {
    const nextResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(nextResolvedTheme);
    applyResolvedTheme(nextResolvedTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);

    const handleSystemThemeChange = () => {
      if (theme !== 'system') {
        return;
      }

      const nextResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(nextResolvedTheme);
      applyResolvedTheme(nextResolvedTheme);
    };

    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      setTheme(normalizeTheme(event.newValue || 'system'));
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    window.addEventListener('storage', handleStorage);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }

      window.removeEventListener('storage', handleStorage);
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => setTheme(normalizeTheme(nextTheme)),
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
};
