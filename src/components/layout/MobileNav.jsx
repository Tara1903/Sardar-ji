import { House, Search, ShoppingBag, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export const MobileNav = () => {
  const { itemCount } = useCart();
  const { user } = useAuth();

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
      <NavLink className="mobile-nav-link" to={user ? '/profile' : '/auth'}>
        <UserRound size={18} />
        {user ? 'Profile' : 'Login'}
      </NavLink>
    </nav>
  );
};
