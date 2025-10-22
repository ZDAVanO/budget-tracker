import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  DropdownMenu,
  IconButton,
  Tooltip,
  Separator,
  Text,
  Heading,
} from '@radix-ui/themes';
import { ExitIcon, DashboardIcon, CardStackIcon } from '@radix-ui/react-icons';

import ThemeToggleButton from './ThemeToggleButton';

// const navItems = [
//   { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
//   { to: '/transactions', label: 'Transactions', icon: <CardStackIcon /> },
//   { to: '/wallets', label: 'Wallets', icon: <DashboardIcon /> },
//   { to: '/categories', label: 'Categories', icon: <DashboardIcon /> },
// ];

function Header({ isLoggedIn, user, onLogout }) {
  const navigate = useNavigate();
  // const location = useLocation();


  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // const isActive = (path) => {
  //   if (path === '/') {
  //     return location.pathname === '/';
  //   }
  //   return location.pathname === path || location.pathname.startsWith(`${path}/`);
  // };

  return (
    <header className="sticky top-0 z-50 h-16">
      <div
        className="backdrop-blur-md backdrop-saturate-150 bg-[color-mix(in_srgb,var(--color-panel-solid)_80%,transparent)] border-b border-(--gray-a5) h-full"
      >
        <div className="w-full px-4 h-full">
          <div className="flex items-center justify-between gap-4 flex-wrap h-full">
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-inherit no-underline"
              >
                <span className="text-2xl font-bold text-mint-600">
                  <span role="img" aria-label="coin">💰</span>
                </span>
                <Heading className="" size="5">Budget Tracker</Heading>
              </Link>

              <ThemeToggleButton />
            </div>

            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <div className="flex items-center gap-3 cursor-pointer">
                      <Text size="3" color="gray">
                        {user}
                      </Text>
                      <Avatar
                        // radius="full"
                        fallback={user ? user[0]?.toUpperCase() : 'U'}
                        color="mint"
                      />
                    </div>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" variant="soft">
                    <DropdownMenu.Label>{user}</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={() => navigate('/dashboard')}>
                      Go to Dashboard
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item color="red" onClick={handleLogout}>
                      <div className="flex items-center gap-2">
                        <ExitIcon />
                        Logout
                      </div>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="soft" color="gray" size="2">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="2">
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
