// src/components/SidebarNav.test.jsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';

// Мокаємо navItems
vi.mock('../components/navItems', () => ({
  default: [
    { to: '/dashboard', label: 'Dashboard', icon: <span>DashIcon</span> },
    { to: '/transactions', label: 'Transactions', icon: <span>TransIcon</span> },
  ],
}));

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SidebarNav />
    </MemoryRouter>
  );
};

describe('SidebarNav Component', () => {
  it('повинен рендерити всі посилання з navItems', () => {
    renderWithRouter();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('DashIcon')).toBeInTheDocument();
  });

  it('повинен виділяти активне посилання (/)', () => {
    renderWithRouter('/dashboard');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const transactionsLink = screen.getByText('Transactions').closest('a');

    // Radix <Button asChild> додає класи до `<a>`
    // Перевіряємо наявність класів, які вказують на 'solid' variant
    expect(dashboardLink).toHaveClass('rt-variant-solid');
    expect(dashboardLink).not.toHaveClass('rt-variant-soft');

    expect(transactionsLink).toHaveClass('rt-variant-soft');
  });

  it('повинен виділяти батьківське посилання для вкладених маршрутів', () => {
    renderWithRouter('/transactions/details/123');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const transactionsLink = screen.getByText('Transactions').closest('a');

    expect(transactionsLink).toHaveClass('rt-variant-solid');
    expect(dashboardLink).toHaveClass('rt-variant-soft');
  });
});