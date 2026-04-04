import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { buildPanelAuthLink } from '../../utils/panelLinks';
import { Loader } from './Loader';

export const ProtectedRoute = ({ children, roles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Checking your access..." />;
  }

  if (!isAuthenticated) {
    const panel = location.pathname.startsWith('/admin')
      ? 'admin'
      : location.pathname.startsWith('/delivery')
        ? 'delivery'
        : 'customer';
    return <Navigate to={buildPanelAuthLink(panel, location.pathname)} replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    const fallback =
      user.role === 'admin' ? '/admin/dashboard' : user.role === 'delivery' ? '/delivery' : '/';
    return <Navigate to={fallback} replace />;
  }

  return children;
};
