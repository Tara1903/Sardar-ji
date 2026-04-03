import { Menu, ShoppingBag, User, UtensilsCrossed } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar = ({ businessName }) => {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/track/demo', label: 'Track order' },
  ];

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link className="brand-mark" to="/">
          <span className="brand-icon">
            <UtensilsCrossed size={20} />
          </span>
          <div>
            <strong>{businessName || 'Sardar Ji Food Corner'}</strong>
            <span>Swad Bhi, Budget Bhi</span>
          </div>
        </Link>

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
          <Link className="icon-btn" to={user ? (user.role === 'customer' ? '/profile' : `/${user.role}`) : '/auth'}>
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
          <NavLink className="drawer-link" onClick={() => setOpen(false)} to={user ? '/profile' : '/auth'}>
            {user ? 'Profile' : 'Login'}
          </NavLink>
        </div>
      ) : null}
    </header>
  );
};
