import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardIcon, CardStackIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';

import navItems from './navItems';


export default function SidebarNav() {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav
      className="
      hidden md:flex flex-col gap-2
      sticky top-16 self-start
      h-[calc(100vh-4rem)]
      w-1/5 min-w-52 max-w-64
      pt-4 px-4
      bg-(--color-panel-solid)
      border-r border-(--gray-a5)
      overflow-y-auto
    "
    >
      {navItems.map((item) => (
        <Button
          key={item.to}
          asChild
          variant={isActive(item.to) ? 'solid' : 'soft'}
          color={isActive(item.to) ? 'mint' : 'gray'}
          size="3"
          className="justify-start!"
        >
          <Link to={item.to} className="flex flex-row items-center gap-3 w-full">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
}