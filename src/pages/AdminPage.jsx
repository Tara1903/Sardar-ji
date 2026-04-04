import {
  Bell,
  Bike,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Shapes,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrandLockup } from '../components/brand/BrandLockup';
import { Loader } from '../components/common/Loader';
import { AdminProvider, useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview and settings',
  },
  {
    to: '/admin/products',
    label: 'Products',
    icon: PackageSearch,
    description: 'Menu items and images',
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: ClipboardList,
    description: 'Status and assignments',
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    icon: Shapes,
    description: 'Menu sections',
  },
  {
    to: '/admin/delivery',
    label: 'Delivery',
    icon: Bike,
    description: 'Partner accounts',
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: Users,
    description: 'Customer and role lookup',
  },
];

const routeMeta = {
  '/admin/dashboard': {
    eyebrow: 'Admin control room',
    title: 'Business snapshot',
    description: 'Monitor operations, offers, and storefront settings in one place.',
  },
  '/admin/products': {
    eyebrow: 'Menu management',
    title: 'Products and availability',
    description: 'Create, edit, and publish food items without breaking the live menu.',
  },
  '/admin/orders': {
    eyebrow: 'Fulfillment',
    title: 'Orders and delivery assignment',
    description: 'Move orders through the timeline and keep delivery tracking accurate.',
  },
  '/admin/categories': {
    eyebrow: 'Catalog structure',
    title: 'Categories and organization',
    description: 'Keep the menu easy to browse across categories and price points.',
  },
  '/admin/delivery': {
    eyebrow: 'Delivery management',
    title: 'Delivery partner accounts',
    description: 'Create delivery logins and monitor their workload at a glance.',
  },
  '/admin/users': {
    eyebrow: 'User directory',
    title: 'Customers and roles',
    description: 'Search registered users, review activity, and inspect account details.',
  },
};

const AdminShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { error, loading, markOrdersSeen, newOrders, unseenOrderCount } = useAdmin();
  const meta = routeMeta[location.pathname] || routeMeta['/admin/dashboard'];

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
      <div className="admin-shell">
        <aside className="panel-card admin-sidebar">
          <BrandLockup className="admin-brand" linkTo="/admin/dashboard" />
          <nav className="admin-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink className="admin-sidebar-link" key={item.to} to={item.to}>
                  <Icon size={18} />
                  <div>
                    <div className="admin-nav-label-row">
                      <strong>{item.label}</strong>
                      {item.to === '/admin/orders' && unseenOrderCount ? (
                        <span className="admin-notification-badge">{unseenOrderCount}</span>
                      ) : null}
                    </div>
                    <span>{item.description}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="admin-main">
          <header className="panel-card admin-topbar">
            <div>
              <p className="eyebrow">{meta.eyebrow}</p>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>

            <div className="admin-topbar-actions">
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
              <BrandLockup compact linkTo="/admin/dashboard" showTagline={false} />
              <button className="btn btn-secondary" onClick={logout} type="button">
                <LogOut size={16} />
                Logout
              </button>
            </div>

            <div className="admin-topbar-toolbar">
              <nav className="admin-quick-nav" aria-label="Admin sections">
                {navItems.map((item) => (
                  <NavLink className="admin-quick-nav-link" key={item.to} to={item.to}>
                    <span>{item.label}</span>
                    {item.to === '/admin/orders' && unseenOrderCount ? (
                      <span className="admin-notification-badge">{unseenOrderCount}</span>
                    ) : null}
                  </NavLink>
                ))}
              </nav>

              <label className="admin-route-select">
                <span>Jump to section</span>
                <select onChange={(event) => navigate(event.target.value)} value={location.pathname}>
                  {navItems.map((item) => (
                    <option key={item.to} value={item.to}>
                      {item.label}
                      {item.to === '/admin/orders' && unseenOrderCount ? ` (${unseenOrderCount} new)` : ''}
                    </option>
                  ))}
                </select>
              </label>
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
                <p>Open Orders to assign the kitchen status and delivery partner quickly.</p>
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
    <AdminShell />
  </AdminProvider>
);

export const AdminIndexRedirect = () => <Navigate replace to="/admin/dashboard" />;
