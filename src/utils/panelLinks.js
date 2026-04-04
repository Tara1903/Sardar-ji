const PANEL_ROUTE_BY_ROLE = {
  customer: '/profile',
  admin: '/admin/dashboard',
  delivery: '/delivery',
};

export const getFallbackRoute = (user) =>
  user?.role === 'admin' ? PANEL_ROUTE_BY_ROLE.admin : user?.role === 'delivery' ? PANEL_ROUTE_BY_ROLE.delivery : '/';

export const normalizePanel = (value = '') => {
  const panel = String(value || '').trim().toLowerCase();
  return panel === 'admin' || panel === 'delivery' || panel === 'customer' ? panel : '';
};

export const buildPanelAuthLink = (panel, redirectPath = '') => {
  const normalizedPanel = normalizePanel(panel) || 'customer';
  const searchParams = new URLSearchParams({
    panel: normalizedPanel,
  });

  if (redirectPath) {
    searchParams.set('redirect', redirectPath);
  }

  return `/auth?${searchParams.toString()}`;
};

export const getPanelRoute = (panel) => PANEL_ROUTE_BY_ROLE[normalizePanel(panel) || 'customer'] || '/';

export const getPanelDestination = (panel, user) => {
  const normalizedPanel = normalizePanel(panel) || 'customer';
  const destination = getPanelRoute(normalizedPanel);

  if (user?.role === normalizedPanel) {
    return destination;
  }

  return buildPanelAuthLink(normalizedPanel, destination);
};

export const getAccountLink = (user) => {
  if (!user) {
    return buildPanelAuthLink('customer', '/profile');
  }

  return getPanelRoute(user.role);
};

export const getPanelLinks = (user) => [
  {
    key: 'customer',
    label: user?.role === 'customer' ? 'Customer account' : 'Customer login',
    description: 'Orders, checkout, saved addresses',
    to: getPanelDestination('customer', user),
  },
  {
    key: 'admin',
    label: user?.role === 'admin' ? 'Admin dashboard' : 'Admin panel',
    description: 'Products, orders, categories, users',
    to: getPanelDestination('admin', user),
  },
  {
    key: 'delivery',
    label: user?.role === 'delivery' ? 'Delivery dashboard' : 'Delivery panel',
    description: 'Assigned orders and live location',
    to: getPanelDestination('delivery', user),
  },
];
