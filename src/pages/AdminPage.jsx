import {
  Bike,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Shapes,
  Users,
} from 'lucide-react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
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
  const { logout } = useAuth();
  const { error, loading } = useAdmin();
  const meta = routeMeta[location.pathname] || routeMeta['/admin/dashboard'];

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
                    <strong>{item.label}</strong>
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
              <BrandLockup compact linkTo="/admin/dashboard" showTagline={false} />
              <button className="btn btn-secondary" onClick={logout} type="button">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </header>

          {error ? <p className="error-text admin-banner">{error}</p> : null}

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
