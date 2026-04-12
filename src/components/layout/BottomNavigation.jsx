import {
  House,
  LayoutGrid,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  {
    id: 'home',
    label: 'Home',
    to: '/',
    icon: House,
    matches: (pathname) => pathname === '/',
  },
  {
    id: 'categories',
    label: 'Categories',
    to: '/menu',
    icon: LayoutGrid,
    matches: (pathname) => pathname === '/menu' || pathname.startsWith('/product/'),
  },
  {
    id: 'orders',
    label: 'Orders',
    to: '/track',
    icon: ReceiptText,
    matches: (pathname) => pathname === '/track' || pathname.startsWith('/track/') || pathname.startsWith('/order-success/'),
  },
  {
    id: 'cart',
    label: 'Cart',
    to: '/cart',
    icon: ShoppingBag,
    matches: (pathname) => pathname === '/cart' || pathname === '/checkout',
  },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();

  const accountLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'delivery'
        ? '/delivery'
        : '/profile'
    : '/auth';

  const profileItem = {
    id: 'profile',
    label: 'Profile',
    to: accountLink,
    icon: UserRound,
    matches: (pathname) =>
      pathname === '/profile' ||
      pathname === '/auth' ||
      pathname === '/my-subscription' ||
      pathname.startsWith('/profile/') ||
      pathname.startsWith('/my-subscription'),
  };

  return (
    <nav className="mobile-nav app-bottom-nav" aria-label="Primary app navigation">
      {[...navItems, profileItem].map((item) => {
        const Icon = item.icon;
        const isActive = item.matches(location.pathname);

        return (
          <Link
            className={`mobile-nav-link app-bottom-nav-link ${isActive ? 'active' : ''}`.trim()}
            key={item.id}
            to={item.to}
          >
            <span className="app-bottom-nav-icon-wrap">
              <Icon size={18} />
              {item.id === 'cart' && itemCount ? <span className="mobile-pill">{itemCount}</span> : null}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
