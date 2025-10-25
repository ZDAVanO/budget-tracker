import { DashboardIcon, CardStackIcon, MixIcon, IdCardIcon, PieChartIcon } from '@radix-ui/react-icons';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/transactions', label: 'Transactions', icon: <CardStackIcon /> },
  { to: '/spending', label: 'Spending', icon: <PieChartIcon /> },
  { to: '/categories', label: 'Categories', icon: <MixIcon /> },
  { to: '/wallets', label: 'Wallets', icon: <IdCardIcon /> },
];

export default navItems;
