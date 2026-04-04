import { Bike, ChevronDown, LayoutDashboard, MapPin, Menu, ShoppingBag, Star, User, UserRound } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandLockup } from '../brand/BrandLockup';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { STORE_AVERAGE_RATING, STORE_CITY, STORE_ORDER_SOCIAL_PROOF } from '../../utils/catalog';
import { getAccountLink, getPanelLinks } from '../../utils/panelLinks';

export const Navbar = ({ businessName }) => {
  const [open, setOpen] = useState(false);
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const panelMenuRef = useRef(null);
  const accountLink = getAccountLink(user);
  const panelLinks = useMemo(() => getPanelLinks(user), [user]);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/track', label: 'Track order' },
  ];

  useEffect(() => {
    setOpen(false);
    setPanelMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!panelMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!panelMenuRef.current?.contains(event.target)) {
        setPanelMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [panelMenuOpen]);

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
          <div className="panel-menu desktop-only" ref={panelMenuRef}>
            <button
              aria-expanded={panelMenuOpen}
              className="btn btn-secondary panel-menu-trigger"
              onClick={() => setPanelMenuOpen((current) => !current)}
              type="button"
            >
              <UserRound size={16} />
              Panels
              <ChevronDown size={16} />
            </button>

            {panelMenuOpen ? (
              <div className="panel-menu-popover">
                <p className="panel-menu-heading">Choose your panel</p>
                {panelLinks.map((panelLink) => (
                  <Link
                    className="panel-menu-link"
                    key={panelLink.key}
                    onClick={() => setPanelMenuOpen(false)}
                    to={panelLink.to}
                  >
                    <div className="panel-menu-icon">
                      {panelLink.key === 'admin' ? (
                        <LayoutDashboard size={16} />
                      ) : panelLink.key === 'delivery' ? (
                        <Bike size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div>
                      <strong>{panelLink.label}</strong>
                      <span>{panelLink.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

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
            <Link className="btn btn-primary desktop-only" to={accountLink}>
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
          <div className="drawer-group">
            <p className="drawer-group-label">Panels</p>
            {panelLinks.map((panelLink) => (
              <NavLink
                className="drawer-link drawer-link-subtle"
                key={panelLink.key}
                onClick={() => setOpen(false)}
                to={panelLink.to}
              >
                <span>{panelLink.label}</span>
                <small>{panelLink.description}</small>
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};
