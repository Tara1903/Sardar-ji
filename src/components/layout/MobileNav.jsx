import { House, Search, ShoppingBag, Truck, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export const MobileNav = () => {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const accountLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'delivery'
        ? '/delivery'
        : '/profile'
    : '/auth';

  return (
    <nav className="mobile-nav">
      <NavLink className="mobile-nav-link" to="/">
        <House size={18} />
        Home
      </NavLink>
      <NavLink className="mobile-nav-link" to="/menu">
        <Search size={18} />
        Menu
      </NavLink>
      <NavLink className="mobile-nav-link" to="/cart">
        <ShoppingBag size={18} />
        Cart
        {itemCount ? <span className="mobile-pill">{itemCount}</span> : null}
      </NavLink>
      <NavLink className="mobile-nav-link" to="/track">
        <Truck size={18} />
        Orders
      </NavLink>
      <NavLink className="mobile-nav-link" to={accountLink}>
        <UserRound size={18} />
        {user ? 'Profile' : 'Login'}
      </NavLink>
    </nav>
  );
};
