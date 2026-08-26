import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronLeft,
  LogOut,
  Mail,
  MoonStar,
  Palette,
  ShieldCheck,
  Smartphone,
  SunMedium,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  CONTENT_FADE_VARIANTS,
  CONTENT_STACK_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  SURFACE_REVEAL_VARIANTS,
} from '../motion/variants';

const SETTINGS_STORAGE_KEY = 'sjfc-customer-settings';

const readStoredPreferences = () => {
  if (typeof window === 'undefined') {
    return {
      orderUpdates: true,
      promoAlerts: false,
      liveTracking: true,
      emailReceipts: true,
    };
  }

  try {
    return {
      orderUpdates: true,
      promoAlerts: false,
      liveTracking: true,
      emailReceipts: true,
      ...(JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}') || {}),
    };
  } catch {
    return {
      orderUpdates: true,
      promoAlerts: false,
      liveTracking: true,
      emailReceipts: true,
    };
  }
};

const themeModes = [
  {
    value: 'light',
    label: 'Light',
    detail: 'Bright surfaces and warm contrast',
    icon: SunMedium,
  },
  {
    value: 'dark',
    label: 'Dark',
    detail: 'Low-light mode with glowing accents',
    icon: MoonStar,
  },
  {
    value: 'system',
    label: 'System',
    detail: 'Match the device automatically',
    icon: Smartphone,
  },
];

const preferenceRows = [
  {
    key: 'orderUpdates',
    title: 'Order updates',
    description: 'Real-time status, ETA, and dispatch alerts.',
    icon: Bell,
  },
  {
    key: 'promoAlerts',
    title: 'Special offers',
    description: 'Flash deals, reward drops, and loyalty nudges.',
    icon: Palette,
  },
  {
    key: 'liveTracking',
    title: 'Live tracking tips',
    description: 'Contextual nudges while your rider is on the way.',
    icon: ShieldCheck,
  },
  {
    key: 'emailReceipts',
    title: 'Email receipts',
    description: 'Order summaries and account confirmations.',
    icon: Mail,
  },
];

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { appConfig, settings } = useAppData();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState(() => readStoredPreferences());
  const premiumCopy = appConfig?.copy || {};

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore storage restrictions and keep settings usable.
    }
  }, [preferences]);

  const activeThemeLabel = useMemo(
    () => themeModes.find((option) => option.value === theme)?.label || resolvedTheme,
    [resolvedTheme, theme],
  );

  const togglePreference = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <PageTransition>
      <SeoMeta noIndex path="/settings" title="Settings" />
      <section className="section first-section">
        <motion.div
          animate="show"
          className="container settings-hub-layout"
          initial="hidden"
          variants={CONTENT_STACK_VARIANTS}
        >
          <motion.div className="panel-card settings-hub-hero" variants={SURFACE_REVEAL_VARIANTS}>
            <button className="icon-btn settings-back-button" onClick={() => navigate(-1)} type="button">
              <ChevronLeft size={18} />
            </button>
            <div className="settings-hub-copy">
              <p className="eyebrow">{premiumCopy.profileLabel || 'Customer settings'}</p>
              <h1>Control theme, alerts, and account comfort from one place.</h1>
              <p>
                This view keeps your Sardar Ji experience clean across light and dark mode while
                leaving the core ordering flow fast.
              </p>
            </div>
            <div className="settings-hub-summary">
              <span className="hero-chip">
                <Palette size={14} />
                {activeThemeLabel}
              </span>
              <span className="hero-chip">
                <Bell size={14} />
                {preferences.orderUpdates ? 'Tracking alerts on' : 'Tracking alerts off'}
              </span>
            </div>
          </motion.div>

          <motion.div className="settings-hub-grid" variants={CONTENT_FADE_VARIANTS}>
            <motion.section className="panel-card settings-hub-section" variants={SURFACE_REVEAL_VARIANTS}>
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Appearance</p>
                  <h2>Choose your theme</h2>
                </div>
              </div>
              <div className="settings-theme-grid">
                {themeModes.map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.value;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={`settings-theme-option ${isActive ? 'is-active' : ''}`.trim()}
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      type="button"
                    >
                      <span className="settings-theme-icon">
                        <Icon size={18} />
                      </span>
                      <strong>{option.label}</strong>
                      <small>{option.detail}</small>
                    </button>
                  );
                })}
              </div>
            </motion.section>

            <motion.section className="panel-card settings-hub-section" variants={SURFACE_REVEAL_VARIANTS}>
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Notifications</p>
                  <h2>Keep the useful alerts</h2>
                </div>
              </div>
              <div className="settings-toggle-stack">
                {preferenceRows.map((row, index) => {
                  const Icon = row.icon;
                  const isEnabled = preferences[row.key];

                  return (
                    <motion.button
                      className="settings-toggle-row"
                      custom={index}
                      key={row.key}
                      onClick={() => togglePreference(row.key)}
                      type="button"
                      variants={STAGGER_ITEM_VARIANTS}
                    >
                      <div className="settings-toggle-copy">
                        <span className="settings-toggle-icon">
                          <Icon size={17} />
                        </span>
                        <div>
                          <strong>{row.title}</strong>
                          <p>{row.description}</p>
                        </div>
                      </div>
                      <span className={`settings-switch ${isEnabled ? 'is-on' : ''}`.trim()}>
                        <span />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>

            <motion.section className="panel-card settings-hub-section" variants={SURFACE_REVEAL_VARIANTS}>
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Account</p>
                  <h2>Profile and support</h2>
                </div>
              </div>
              <div className="settings-account-card">
                <div className="profile-avatar settings-account-avatar">
                  {(user?.name || 'SJ')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div>
                  <strong>{user?.name || 'Guest customer'}</strong>
                  <p>{user?.email || 'Sign in to manage your account details.'}</p>
                </div>
              </div>
              <div className="settings-link-list">
                <Link className="settings-link-row" to="/profile">
                  <span>Open profile</span>
                  <small>Orders, rewards, and plan status</small>
                </Link>
                <Link className="settings-link-row" to="/my-subscription">
                  <span>Manage subscription</span>
                  <small>Pause, resume, and review monthly meals</small>
                </Link>
                <a
                  className="settings-link-row"
                  href={`mailto:support@sardarjifoodcorner.shop?subject=${encodeURIComponent('Sardar Ji support request')}`}
                >
                  <span>Contact support</span>
                  <small>{settings?.whatsappNumber || 'Email the Sardar Ji team directly'}</small>
                </a>
              </div>
            </motion.section>
          </motion.div>

          <motion.div className="settings-hub-footer" variants={SURFACE_REVEAL_VARIANTS}>
            <button className="btn btn-secondary" onClick={logout} type="button">
              <LogOut size={16} />
              Log out
            </button>
          </motion.div>
        </motion.div>
      </section>
    </PageTransition>
  );
};
