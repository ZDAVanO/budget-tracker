/* global describe, it, expect */
import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../test-utils.jsx';

import SidebarNav from '../../components/SidebarNav.jsx';
import navItems from '../../components/navItems.jsx';

describe('SidebarNav', () => {
  it('renders links with correct hrefs', () => {
    render(<SidebarNav />, { route: '/dashboard' });

    navItems.forEach((item) => {
      const link = screen.getByRole('link', { name: new RegExp(item.label, 'i') });
      expect(link).toHaveAttribute('href', item.to);
    });
  });
});
