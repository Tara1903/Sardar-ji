import { MapPin, Menu, ShoppingBag, Star, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { BrandLockup } from '../brand/BrandLockup';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { STORE_AVERAGE_RATING, STORE_CITY, STORE_ORDER_SOCIAL_PROOF } from '../../utils/catalog';

export const Navbar = ({ businessName }) => {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const accountLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'delivery'
        ? '/delivery'
        : '/profile'
    : '/auth';

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/my-subscription', label: 'Monthly Plan' },
    { to: '/track', label: 'Track order' },
  ];

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <div className="header-brand-block">
          <BrandLockup
            compact
            tagline="Swad Bhi, Budget Bhi"
            title={businessName || 'Sardar Ji Food Corner'}
          />
          <div className="header-brand-meta">
            <span>
              <MapPin size={13} />
              {STORE_CITY}
            </span>
            <span>
              <Star fill="currentColor" size={13} />
              {STORE_AVERAGE_RATING.toFixed(1)} | {STORE_ORDER_SOCIAL_PROOF}
            </span>
          </div>
        </div>

        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink className="nav-link" key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="icon-btn" to="/cart">
            <ShoppingBag size={18} />
            {itemCount ? <span className="cart-count">{itemCount}</span> : null}
          </Link>
          <Link className="icon-btn" to={accountLink}>
            <User size={18} />
          </Link>
          {user ? (
            <button className="btn btn-secondary desktop-only" onClick={logout} type="button">
              Logout
            </button>
          ) : (
            <Link className="btn btn-primary desktop-only" to="/auth">
              Login
            </Link>
          )}
          <button className="icon-btn mobile-only" onClick={() => setOpen((current) => !current)} type="button">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="mobile-drawer">
          {navItems.map((item) => (
            <NavLink className="drawer-link" key={item.to} onClick={() => setOpen(false)} to={item.to}>
              {item.label}
            </NavLink>
          ))}
          <NavLink className="drawer-link" onClick={() => setOpen(false)} to="/cart">
            Cart
          </NavLink>
          <NavLink className="drawer-link" onClick={() => setOpen(false)} to={accountLink}>
            {user ? 'Profile' : 'Login'}
          </NavLink>
        </div>
      ) : null}
    </header>
  );
};
