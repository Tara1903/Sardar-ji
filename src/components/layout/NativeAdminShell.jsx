import { Bell, LogOut, PackageSearch } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrandLockup } from '../brand/BrandLockup';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { SeoMeta } from '../seo/SeoMeta';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { ADMIN_APP_NAV_ITEMS } from '../../data/nativeShellConfig';

const routeCopy = {
  '/admin/dashboard': {
    eyebrow: 'Ops overview',
    title: 'Run the kitchen, orders, and storefront from one app shell.',
  },
  '/admin/orders': {
    eyebrow: 'Orders',
    title: 'New orders and customer handoff stay front and center.',
  },
  '/admin/kitchen': {
    eyebrow: 'Kitchen',
    title: 'Big status actions keep prep moving with less friction.',
  },
  '/admin/products': {
    eyebrow: 'Catalog',
    title: 'Menu control, availability, and pricing without desktop clutter.',
  },
  '/admin/theme': {
    eyebrow: 'Theme',
    title: 'Storefront design settings stay accessible in the native shell.',
  },
};

export const NativeAdminShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    error,
    markOrdersSeen,
    metrics,
    newOrders,
    orders,
    unseenOrderCount,
  } = useAdmin();
  const meta = routeCopy[location.pathname] || routeCopy['/admin/dashboard'];
  const kitchenQueue = orders.filter((order) =>
    ['Order Placed', 'Preparing'].includes(order.status),
  ).length;
  const deliveryQueue = orders.filter((order) => order.status === 'Out for Delivery').length;

  return (
    <div className="native-role-shell native-admin-shell">
      <SeoMeta noIndex path={location.pathname} title="Admin App" />

      <header className="native-role-header native-admin-header">
        <div className="native-role-header-row">
          <BrandLockup
            className="native-role-brand"
            compact
            linkTo="/admin/dashboard"
            showTagline={false}
          />
          <div className="native-role-header-actions">
            <ThemeSwitcher compact label="Admin theme" />
            <button className="icon-btn" onClick={logout} type="button">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="native-role-copy">
          <p className="eyebrow">{meta.eyebrow}</p>
          <h1>{meta.title}</h1>
        </div>

        <div className="native-role-metrics">
          <article className="native-role-metric-card">
            <span>{metrics.activeOrders}</span>
            <small>Active</small>
          </article>
          <article className="native-role-metric-card">
            <span>{kitchenQueue}</span>
            <small>Kitchen</small>
          </article>
          <article className="native-role-metric-card">
            <span>{deliveryQueue}</span>
            <small>On route</small>
          </article>
          <article className="native-role-metric-card">
            <span>{metrics.liveProducts}</span>
            <small>Live items</small>
          </article>
        </div>

        {unseenOrderCount ? (
          <button
            className="native-role-alert"
            onClick={() => {
              markOrdersSeen();
              navigate('/admin/orders');
            }}
            type="button"
          >
            <Bell size={18} />
            <div>
              <strong>{unseenOrderCount} new orders need attention</strong>
              <span>
                {newOrders[0]?.customerName || 'A customer'} just placed{' '}
                {newOrders[0]?.orderNumber || 'a new order'}.
              </span>
            </div>
          </button>
        ) : (
          <div className="native-role-inline-card">
            <PackageSearch size={18} />
            <div>
              <strong>Everything is caught up right now</strong>
              <span>Jump between orders, kitchen, and catalog from the app nav below.</span>
            </div>
          </div>
        )}
      </header>

      {error ? <p className="error-text native-role-error">{error}</p> : null}

      <main className="native-role-content native-admin-content">
        <Outlet />
      </main>

      <nav className="native-role-tabbar" aria-label="Admin app sections">
        {ADMIN_APP_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isOrdersTab = item.to === '/admin/orders';

          return (
            <NavLink className="native-role-tab" key={item.id} to={item.to}>
              <span className="native-role-tab-icon">
                <Icon size={18} />
                {isOrdersTab && unseenOrderCount ? (
                  <span className="native-role-tab-badge">{unseenOrderCount}</span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
