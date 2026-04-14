import {
  Brush,
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  PackageCheck,
  PackageSearch,
  UserRound,
} from 'lucide-react';

export const ADMIN_APP_NAV_ITEMS = [
  {
    id: 'dashboard',
    to: '/admin/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'orders',
    to: '/admin/orders',
    label: 'Orders',
    icon: ClipboardList,
  },
  {
    id: 'kitchen',
    to: '/admin/kitchen',
    label: 'Kitchen',
    icon: CookingPot,
  },
  {
    id: 'catalog',
    to: '/admin/products',
    label: 'Catalog',
    icon: PackageSearch,
  },
  {
    id: 'theme',
    to: '/admin/theme',
    label: 'Theme',
    icon: Brush,
  },
];

export const DELIVERY_APP_FILTERS = [
  {
    id: 'active',
    label: 'Active',
    matcher: (order) => order.status !== 'Delivered',
  },
  {
    id: 'pickup',
    label: 'Pickup',
    matcher: (order) => ['Order Placed', 'Preparing'].includes(order.status),
  },
  {
    id: 'route',
    label: 'On Route',
    matcher: (order) => order.status === 'Out for Delivery',
  },
  {
    id: 'done',
    label: 'Done',
    matcher: (order) => order.status === 'Delivered',
  },
];

export const DELIVERY_ACCOUNT_ACTIONS = [
  {
    id: 'tasks',
    label: 'Tasks',
    icon: PackageCheck,
  },
  {
    id: 'account',
    label: 'Account',
    icon: UserRound,
  },
];
