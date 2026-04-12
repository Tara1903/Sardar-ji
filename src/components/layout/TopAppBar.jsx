import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Search, ShoppingBag, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { BrandLockup } from '../brand/BrandLockup';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const TopAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const accountLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'delivery'
        ? '/delivery'
        : '/profile'
    : '/auth';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(location.pathname === '/menu' ? params.get('search') || '' : '');
  }, [location.pathname, location.search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextQuery = query.trim();
    navigate(nextQuery ? `/menu?search=${encodeURIComponent(nextQuery)}` : '/menu');
  };

  return (
    <header className="site-header app-topbar">
      <div className="container app-topbar-shell">
        <Link aria-label="Go to home" className="app-topbar-brand-link" to="/">
          <BrandLockup
            className="app-topbar-brand"
            compact
            linkTo={null}
            showTagline={false}
            title="Sardar Ji Food Corner"
          />
        </Link>

        <button className="app-location-pill" type="button">
          <MapPin size={15} />
          <span>
            <small>Deliver to</small>
            <strong>Indore</strong>
          </span>
        </button>

        <form className="app-topbar-search" onSubmit={handleSubmit} role="search">
          <Search size={17} />
          <input
            aria-label="Search menu"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search thali, paneer, snacks..."
            value={query}
          />
        </form>

        <div className="app-topbar-actions">
          <Link aria-label="Open monthly plan" className="icon-btn app-topbar-icon desktop-only" to="/my-subscription">
            <CalendarDays size={18} />
          </Link>
          <ThemeSwitcher className="app-topbar-theme desktop-only" compact label="Theme" />
          <Link aria-label="Open cart" className="icon-btn app-topbar-icon" to="/cart">
            <ShoppingBag size={18} />
            {itemCount ? <span className="cart-count">{itemCount}</span> : null}
          </Link>
          <Link aria-label={user ? 'Open profile' : 'Login'} className="icon-btn app-topbar-icon" to={accountLink}>
            <UserRound size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
};
