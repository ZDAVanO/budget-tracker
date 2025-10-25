import { DashboardIcon, CardStackIcon, MixIcon, IdCardIcon } from '@radix-ui/react-icons';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/transactions', label: 'Transactions', icon: <CardStackIcon /> },
  { to: '/wallets', label: 'Wallets', icon: <IdCardIcon /> },
  { to: '/categories', label: 'Categories', icon: <MixIcon /> },
];

export default navItems;
