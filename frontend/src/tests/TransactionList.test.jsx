// src/components/TransactionList.test.jsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TransactionList from '../components/TransactionList';

// Моки даних
const mockTransactions = [
  {
    id: 1, type: 'expense', amount: 100, date: '2025-10-26T10:00:00Z', title: 'Groceries',
    category: { name: 'Food', icon: '🍔' }, wallet: { name: 'Cash', currency: 'USD' }
  },
  {
    id: 2, type: 'income', amount: 500, date: '2025-10-26T12:00:00Z', title: 'Freelance',
    category: { name: 'Work', icon: '💻' }, wallet: { name: 'Bank', currency: 'USD' }
  },
  {
    id: 3, type: 'expense', amount: 25, date: '2025-10-25T18:00:00Z', title: 'Coffee',
    category: { name: 'Food', icon: '☕' }, wallet: { name: 'Cash', currency: 'USD' }
  },
];

const mockOnEdit = vi.fn();

describe('TransactionList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Мокаємо 'today' для консистентних заголовків
    vi.setSystemTime(new Date('2025-10-26T14:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('повинен показувати "No transactions yet", коли список порожній', () => {
    render(<TransactionList transactions={[]} onEdit={mockOnEdit} isLoading={false} />);
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('повинен рендерити та групувати транзакції по днях', () => {
    render(<TransactionList transactions={mockTransactions} onEdit={mockOnEdit} isLoading={false} />);

    // Перевіряємо заголовки груп
    expect(screen.getByText(/today, october 26/i)).toBeInTheDocument();
    expect(screen.getByText(/saturday, october 25/i)).toBeInTheDocument();

    // Перевіряємо елементи
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Freelance')).toBeInTheDocument();
    expect(screen.getByText('Coffee')).toBeInTheDocument();

    // Перевіряємо суми
    expect(screen.getByText('-100.00 USD')).toBeInTheDocument();
    expect(screen.getByText('+500.00 USD')).toBeInTheDocument();
    expect(screen.getByText('-25.00 USD')).toBeInTheDocument();
  });

  it('повинен викликати onEdit при кліку на транзакцію', async () => {
    const user = userEvent.setup();
    render(<TransactionList transactions={mockTransactions} onEdit={mockOnEdit} isLoading={false} />);

    // Клікаємо на "Groceries"
    await user.click(screen.getByText('Groceries'));

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTransactions[0]);
  });
});