import { DashboardIcon, CardStackIcon } from '@radix-ui/react-icons';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/transactions', label: 'Transactions', icon: <CardStackIcon /> },
  { to: '/wallets', label: 'Wallets', icon: <DashboardIcon /> },
  { to: '/categories', label: 'Categories', icon: <DashboardIcon /> },
];

export default navItems;
