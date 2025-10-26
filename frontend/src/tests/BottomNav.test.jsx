import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from '../components/BottomNav.jsx';

vi.mock('../components/navItems', () => ({
  default: [
    { to: '/', label: 'Головна', icon: <span>Icon-Home</span> },
    { to: '/transactions', label: 'Транзакції', icon: <span>Icon-Cards</span> },
    { to: '/profile', label: 'Профіль', icon: <span>Icon-User</span> },
  ],
}));


const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <BottomNav />
    </MemoryRouter>
  );
};

// --- Тестовий набір ---
describe('BottomNav Component', () => {
  it('повинен рендерити всі посилання з navItems', () => {
    renderWithRouter();

    // Перевіряємо, чи відображаються всі мітки (labels)
    expect(screen.getByText('Головна')).toBeInTheDocument();
    expect(screen.getByText('Транзакції')).toBeInTheDocument();
    expect(screen.getByText('Профіль')).toBeInTheDocument();

    // Перевіряємо, чи відображаються наші імітовані іконки
    expect(screen.getByText('Icon-Home')).toBeInTheDocument();
    expect(screen.getByText('Icon-Cards')).toBeInTheDocument();
    expect(screen.getByText('Icon-User')).toBeInTheDocument();
  });

  it('повинен виділяти активне посилання (/)', () => {
    renderWithRouter('/');

    // Знаходимо батьківський тег <a> для тексту
    const homeLink = screen.getByText('Головна').closest('a');
    const transactionsLink = screen.getByText('Транзакції').closest('a');

    // Перевіряємо, що посилання "Головна" має активні класи
    expect(homeLink).toHaveClass('text-mint-600', 'font-bold');
    expect(homeLink).not.toHaveClass('text-gray-400');

    // Перевіряємо, що інше посилання має неактивні класи
    expect(transactionsLink).toHaveClass('text-gray-400');
    expect(transactionsLink).not.toHaveClass('text-mint-600');
  });

  it('повинен виділяти активне посилання (/transactions)', () => {
    renderWithRouter('/transactions');

    const homeLink = screen.getByText('Головна').closest('a');
    const transactionsLink = screen.getByText('Транзакції').closest('a');

    // Тепер посилання "Транзакції" має бути активним
    expect(transactionsLink).toHaveClass('text-mint-600', 'font-bold');
    expect(transactionsLink).not.toHaveClass('text-gray-400');

    // А посилання "Головна" - неактивним
    expect(homeLink).toHaveClass('text-gray-400');
    expect(homeLink).not.toHaveClass('text-mint-600');
  });

  it('повинен виділяти батьківське посилання для вкладених маршрутів', () => {
    // Цей тест перевіряє логіку `location.pathname.startsWith(\`${path}/\`)`
    renderWithRouter('/transactions/details/123-abc');

    const transactionsLink = screen.getByText('Транзакції').closest('a');
    const homeLink = screen.getByText('Головна').closest('a');

    // Посилання /transactions має бути активним, оскільки ми на /transactions/details...
    expect(transactionsLink).toHaveClass('text-mint-600', 'font-bold');
    
    // Посилання / не має бути активним
    expect(homeLink).toHaveClass('text-gray-400');
  });

  it('повинен мати правильні атрибути href у посиланнях', () => {
    renderWithRouter();

    // `react-router-dom` `Link` рендерить тег `<a>` з атрибутом `href`
    expect(screen.getByText('Головна').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Транзакції').closest('a')).toHaveAttribute('href', '/transactions');
    expect(screen.getByText('Профіль').closest('a')).toHaveAttribute('href', '/profile');
  });
});