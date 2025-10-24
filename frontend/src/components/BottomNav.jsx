import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardIcon, CardStackIcon } from '@radix-ui/react-icons';

import navItems from './navItems';


export default function BottomNav() {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-20 flex md:hidden
      backdrop-blur-md backdrop-saturate-150
      bg-[color-mix(in_srgb,var(--color-panel-solid)_80%,transparent)]
      border-t border-(--gray-a5)
    ">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex-1 flex flex-col items-center py-3 text-sm ${
            isActive(item.to) ? 'text-mint-600 font-bold' : 'text-gray-400'
          }`}
        >
          {item.icon}
          <span className="mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}