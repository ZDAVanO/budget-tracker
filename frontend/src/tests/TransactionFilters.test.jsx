import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionFilters from '../components/TransactionFilters';

const mockCategories = [
  { id: '1', name: 'Food', icon: '🍔' },
  { id: '2', name: 'Salary', icon: '💰' },
];

const mockWallets = [
  { id: '10', name: 'Cash', currency: 'USD', icon: '💵' },
  { id: '11', name: 'Bank', currency: 'USD', icon: '🏦' },
];

describe('TransactionFilters Component', () => {
  const mockOnFilterChange = vi.fn();
  const defaultFilters = {
    type: ['expense', 'income'],
    category_id: [],
    wallet_id: [],
    start_date: '',
    end_date: '',
  };

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('повинен відкривати Popover при кліку на кнопку "Filters"', async () => {
    const user = userEvent.setup();
    render(
      <TransactionFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
        wallets={mockWallets}
      />
    );

    // Спочатку контент невидимий
    expect(screen.queryByText('Type')).not.toBeInTheDocument();

    // Клікаємо на тригер
    await user.click(screen.getByRole('button', { name: /filters/i }));

    // Тепер контент видимий
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Wallets')).toBeInTheDocument();
  });

  it('повинен викликати onFilterChange при зміні типу', async () => {
    const user = userEvent.setup();
    render(
      <TransactionFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
        wallets={mockWallets}
      />
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));
    
    // Клікаємо на "Expense"
    await user.click(screen.getByRole('radio', { name: /expense/i }));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      type: ['expense'],
    });
  });

  it('повинен викликати onFilterChange при виборі категорії', async () => {
    const user = userEvent.setup();
    render(
      <TransactionFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
        wallets={mockWallets}
      />
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    // Клікаємо на чекбокс "Food"
    await user.click(screen.getByLabelText(/food/i));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      category_id: ['1'], // ID 'Food' з моку
    });
  });

  it('повинен викликати onFilterChange при скиданні фільтрів', async () => {
    const user = userEvent.setup();
    // Використовуємо фільтри, які не є дефолтними
    const activeFilters = { ...defaultFilters, start_date: '2025-01-01' };
    
    render(
      <TransactionFilters
        filters={activeFilters}
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
        wallets={mockWallets}
      />
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    // Кнопка Reset має бути видима
    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);

    // Очікуємо, що onFilterChange викликається з дефолтними значеннями
    expect(mockOnFilterChange).toHaveBeenCalledWith(defaultFilters);
  });
});