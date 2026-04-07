import { ChevronDown, MapPin, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { BrandLockup } from '../brand/BrandLockup';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

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
      <div className="container nav-shell premium-nav-shell">
        <div className="premium-nav-top">
          <div className="header-brand-block">
            <BrandLockup
              compact
              tagline="Swad Bhi, Budget Bhi"
              title={businessName || 'Sardar Ji Food Corner'}
            />
            <button className="location-pill" type="button">
              <MapPin size={14} />
              <span>Indore</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <Link className="nav-search-trigger mobile-header-search mobile-only" to="/menu">
            <Search size={15} />
            <span>Search Paneer, Thali...</span>
          </Link>

          <div className="nav-actions">
            <ThemeSwitcher className="desktop-only" label="Site theme" />
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
            <button
              className="icon-btn mobile-only"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((current) => !current)}
              type="button"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        <div className="premium-nav-bottom">
          <Link className="nav-search-trigger header-search-trigger" to="/menu">
            <Search size={16} />
            Search thali, paneer, snacks...
          </Link>

          <nav className="desktop-nav premium-desktop-nav">
            {navItems.map((item) => (
              <NavLink className="nav-link" key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {open ? (
        <div className="mobile-drawer">
          <div className="mobile-drawer-theme">
            <ThemeSwitcher label="Site theme" />
          </div>
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
