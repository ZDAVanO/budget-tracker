

import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the AuthContext
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    isLoading: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
  }),
  AuthProvider: ({ children }) => children, // Just render children without provider
}));

test('renders Budget Tracker title on home page', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { level: 1, name: /Budget Tracker/i });
  expect(titleElement).toBeInTheDocument();
});