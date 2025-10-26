/* global describe, it, expect */
import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../test-utils.jsx';

import BottomNav from '../../components/BottomNav.jsx';
import navItems from '../../components/navItems.jsx';

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(<BottomNav />, { route: '/dashboard' });
    navItems.forEach((item) => {
      expect(screen.getByRole('link', { name: new RegExp(item.label, 'i') })).toBeInTheDocument();
    });
  });

  it('highlights the active route', () => {
    const activePath = '/transactions';
    render(<BottomNav />, { route: activePath });

    const activeLink = screen.getByRole('link', { name: /Transactions/i });
    expect(activeLink).toHaveClass('text-mint-600');
    expect(activeLink).toHaveClass('font-bold');

    const inactiveLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(inactiveLink).toHaveClass('text-gray-400');
  });
});
