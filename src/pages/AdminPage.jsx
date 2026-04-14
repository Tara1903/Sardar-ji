import {
  Bell,
  Bike,
  Brush,
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  MessageSquareQuote,
  PackageSearch,
  PanelTop,
  Shapes,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrandLockup } from '../components/brand/BrandLockup';
import { Loader } from '../components/common/Loader';
import { ThemeSwitcher } from '../components/common/ThemeSwitcher';
import { NativeAdminShell } from '../components/layout/NativeAdminShell';
import { SeoMeta } from '../components/seo/SeoMeta';
import { AdminProvider, useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { isNativeAppShell } from '../lib/nativeApp';

const navGroups = [
  {
    label: 'Overview',
    items: [
      {
        to: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Overview and business details',
      },
    ],
  },
  {
    label: 'Storefront',
    items: [
      {
        to: '/admin/hero',
        label: 'Hero Section',
        icon: PanelTop,
        description: 'Headline, CTAs, and hero image',
      },
      {
        to: '/admin/offers',
        label: 'Offers',
        icon: Sparkles,
        description: 'Banner copy and offer cards',
      },
      {
        to: '/admin/popup',
        label: 'Popup',
        icon: Bell,
        description: 'Popup visibility, content, and delay',
      },
      {
        to: '/admin/reviews',
        label: 'Reviews',
        icon: MessageSquareQuote,
        description: 'Customer quotes and ratings',
      },
      {
        to: '/admin/theme',
        label: 'Theme Settings',
        icon: Brush,
        description: 'Colors applied across the website',
      },
      {
        to: '/admin/sections',
        label: 'Section Visibility',
        icon: LayoutTemplate,
        description: 'Show or hide major homepage sections',
      },
    ],
  },
  {
    label: 'Catalog',
    items: [
      {
        to: '/admin/categories',
        label: 'Categories',
        icon: Shapes,
        description: 'Category names, images, and structure',
      },
      {
        to: '/admin/products',
        label: 'Menu Items',
        icon: PackageSearch,
        description: 'Menu cards, pricing, and availability',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        to: '/admin/orders',
        label: 'Orders',
        icon: ClipboardList,
        description: 'Statuses and delivery assignment',
      },
      {
        to: '/admin/kitchen',
        label: 'Kitchen',
        icon: CookingPot,
        description: 'Fast prep screen with big status buttons',
      },
      {
        to: '/admin/delivery',
        label: 'Delivery',
        icon: Bike,
        description: 'Delivery partner accounts',
      },
      {
        to: '/admin/users',
        label: 'Users',
        icon: Users,
        description: 'Customers and role management',
      },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

const routeMeta = {
  '/admin/dashboard': {
    eyebrow: 'Admin control room',
    title: 'Business snapshot',
    description: 'Keep the storefront, catalog, and operations aligned from one clean panel.',
  },
  '/admin/hero': {
    eyebrow: 'Storefront editing',
    title: 'Hero section control',
    description: 'Update the first screen customers see without touching code.',
  },
  '/admin/offers': {
    eyebrow: 'Storefront editing',
    title: 'Offer messaging',
    description: 'Manage homepage and menu offer copy in one place.',
  },
  '/admin/popup': {
    eyebrow: 'Storefront editing',
    title: 'Popup control',
    description: 'Choose if the popup shows, what it says, and how long it waits.',
  },
  '/admin/reviews': {
    eyebrow: 'Storefront editing',
    title: 'Reviews and trust',
    description: 'Add, edit, or remove review cards shown to customers.',
  },
  '/admin/theme': {
    eyebrow: 'Storefront editing',
    title: 'Theme settings',
    description: 'Adjust the website color palette with instant visual consistency.',
  },
  '/admin/sections': {
    eyebrow: 'Storefront editing',
    title: 'Section visibility',
    description: 'Turn major homepage sections on or off without breaking the layout.',
  },
  '/admin/products': {
    eyebrow: 'Catalog management',
    title: 'Products and availability',
    description: 'Create, edit, and publish menu items in a mobile-friendly workflow.',
  },
  '/admin/orders': {
    eyebrow: 'Operations',
    title: 'Orders and delivery assignment',
    description: 'Move orders forward quickly and keep delivery tracking accurate.',
  },
  '/admin/categories': {
    eyebrow: 'Catalog management',
    title: 'Categories and organization',
    description: 'Keep menu sections easy to scan with clean names and images.',
  },
  '/admin/kitchen': {
    eyebrow: 'Operations',
    title: 'Kitchen prep screen',
    description: 'Move active orders from placed to preparing to delivery with one tap.',
  },
  '/admin/delivery': {
    eyebrow: 'Operations',
    title: 'Delivery partner accounts',
    description: 'Create delivery logins and review current delivery workload.',
  },
  '/admin/users': {
    eyebrow: 'Operations',
    title: 'Customers and roles',
    description: 'Search registered users, filter by role, and inspect account details.',
  },
};

const WebAdminShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { error, loading, markOrdersSeen, newOrders, unseenOrderCount } = useAdmin();
  const meta = routeMeta[location.pathname] || routeMeta['/admin/dashboard'];

  const activeGroup = useMemo(
    () =>
      navGroups.find((group) => group.items.some((item) => item.to === location.pathname)) || navGroups[0],
    [location.pathname],
  );

  useEffect(() => {
    if (location.pathname === '/admin/orders') {
      markOrdersSeen();
    }
  }, [location.pathname, markOrdersSeen]);

  if (loading) {
    return <Loader message="Loading admin control room..." />;
  }

  return (
    <div className="panel-page">
      <SeoMeta noIndex path={location.pathname} title={`Admin - ${meta.title}`} />
      <div className="admin-shell">
        <div className="admin-main">
          <header className="panel-card admin-topbar">
            <div className="admin-topbar-head">
              <div className="admin-topbar-copy">
                <BrandLockup className="admin-brand" compact={false} linkTo="/admin/dashboard" />
                <p className="eyebrow">{meta.eyebrow}</p>
                <h1>{meta.title}</h1>
                <p>{meta.description}</p>
              </div>

              <div className="admin-topbar-actions">
                <ThemeSwitcher label="Admin theme" />
                {unseenOrderCount ? (
                  <button
                    className="admin-notice-pill"
                    onClick={() => {
                      markOrdersSeen();
                      navigate('/admin/orders');
                    }}
                    type="button"
                  >
                    <Bell size={16} />
                    {unseenOrderCount} new {unseenOrderCount === 1 ? 'order' : 'orders'}
                  </button>
                ) : null}
                <button className="btn btn-secondary" onClick={logout} type="button">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

            <div className="admin-topbar-toolbar">
              <label className="admin-route-select">
                <span>Jump to section</span>
                <select onChange={(event) => navigate(event.target.value)} value={location.pathname}>
                  {navGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.items.map((item) => (
                        <option key={item.to} value={item.to}>
                          {item.label}
                          {item.to === '/admin/orders' && unseenOrderCount
                            ? ` (${unseenOrderCount} new)`
                            : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <div className="admin-nav-group-label" aria-hidden="true">
                {activeGroup.label}
              </div>

              <nav className="admin-quick-nav" aria-label="Admin sections">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink className="admin-quick-nav-link" key={item.to} to={item.to}>
                      <span className="admin-quick-nav-icon">
                        <Icon size={16} />
                      </span>
                      <span className="admin-quick-nav-copy">
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                      {item.to === '/admin/orders' && unseenOrderCount ? (
                        <span className="admin-notification-badge">{unseenOrderCount}</span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </header>

          {error ? <p className="error-text admin-banner">{error}</p> : null}
          {unseenOrderCount && location.pathname !== '/admin/orders' ? (
            <div className="panel-card admin-live-notice">
              <div>
                <p className="eyebrow">New order alert</p>
                <strong>
                  {newOrders[0]?.customerName || 'A customer'} just placed{' '}
                  {newOrders[0]?.orderNumber ? `order ${newOrders[0].orderNumber}` : 'a new order'}.
                </strong>
                <p>Open Orders to update the kitchen status and assign delivery quickly.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  markOrdersSeen();
                  navigate('/admin/orders');
                }}
                type="button"
              >
                View orders
              </button>
            </div>
          ) : null}

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export const AdminPage = () => (
  <AdminProvider>
    {isNativeAppShell() ? <NativeAdminShell /> : <WebAdminShell />}
  </AdminProvider>
);

export const AdminIndexRedirect = () => <Navigate replace to="/admin/dashboard" />;
