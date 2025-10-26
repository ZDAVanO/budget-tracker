import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import Header from '../components/Header';

// Мокаємо компонент кнопки теми, щоб він не заважав
vi.mock('../components/ThemeToggleButton', () => ({
  default: () => <button>ThemeToggle</button>,
}));

// Створюємо хелпер для рендера з роутером
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <Theme> {/* 👈 ОБГОРТКА ПОЧАЛАСЬ */}
          <Routes>
            <Route path="/*" element={ui} />
          </Routes>
        </Theme> {/* 👈 ОБГОРТКА ЗАКІНЧИЛАСЬ */}
      </MemoryRouter>
    ),
  };
}

describe('Header Component', () => {
  const mockOnLogout = vi.fn();

  // --- Стан "Не залогінений" ---
  describe('Logged Out State', () => {
    it('повинен рендерити логотип та назву', () => {
      renderWithRouter(<Header isLoggedIn={false} />);
      expect(screen.getByText('Budget Tracker')).toBeInTheDocument();
      expect(screen.getByLabelText('coin')).toBeInTheDocument();
    });

    it('повинен показувати кнопки Login та Register', () => {
      renderWithRouter(<Header isLoggedIn={false} />);
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /register/i })
      ).toBeInTheDocument();
    });

    it('не повинен показувати аватар користувача', () => {
      renderWithRouter(<Header isLoggedIn={false} />);
      expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
      expect(screen.queryByText('T')).not.toBeInTheDocument(); // Fallback
    });
  });

  // --- Стан "Залогінений" ---
  describe('Logged In State', () => {
    beforeEach(() => {
      mockOnLogout.mockClear();
    });

    it("повинен показувати ім'я користувача та аватар", () => {
      renderWithRouter(
        <Header isLoggedIn={true} user="TestUser" onLogout={mockOnLogout} />
      );

      expect(screen.getByText('TestUser')).toBeInTheDocument();
    //   expect(screen.getByText('T')).toBeInTheDocument(); // Fallback avatar
      expect(
        screen.queryByRole('link', { name: /login/i })
      ).not.toBeInTheDocument();
    });
  });
});