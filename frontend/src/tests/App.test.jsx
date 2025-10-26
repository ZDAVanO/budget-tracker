// src/tests/App.test.jsx

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import App from '../App.jsx';

// ---- Mocks ----

// 1. Мокаємо хук аутентифікації (useAuth)
// Це дозволить нам "казати" тестам, чи залогінений юзер
import * as useAuthModule from '../contexts/useAuth.js';
const mockUseAuth = vi.spyOn(useAuthModule, 'default');

// 2. Мокаємо всі сторінки (Pages)
// Нам не потрібно тестувати вміст сторінок,
// лише перевірити, що App відрендерив *правильну* сторінку.
vi.mock('../pages/Home', () => ({ default: () => <div>Home Page</div> }));
vi.mock('../pages/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('../pages/Register', () => ({ default: () => <div>Register Page</div> }));
vi.mock('../pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../pages/Transactions', () => ({ default: () => <div>Transactions Page</div> }));
vi.mock('../pages/Categories', () => ({ default: () => <div>Categories Page</div> }));
vi.mock('../pages/Wallets', () => ({ default: () => <div>Wallets Page</div> }));
vi.mock('../pages/Settings', () => ({ default: () => <div>Settings Page</div> }));
vi.mock('../pages/Spending', () => ({ default: () => <div>Spending Page</div> }));
vi.mock('../pages/NotFound', () => ({ default: () => <div>NotFound Page</div> }));

// 3. Мокаємо компоненти навігації (Header, Navs)
vi.mock('../components/Header.jsx', () => ({ default: () => <div>Header Component</div> }));
vi.mock('../components/Footer.jsx', () => ({ default: () => <div>Footer Component</div> }));
vi.mock('../components/BottomNav.jsx', () => ({ default: () => <div>BottomNav Component</div> }));
vi.mock('../components/SidebarNav.jsx', () => ({ default: () => <div>SidebarNav Component</div> }));

// ---- Test Helper ----

// Створюємо хелпер, який рендерить App з потрібним роутом
// та потрібним станом аутентифікації
const renderApp = (route, authState) => {
  // Встановлюємо, що поверне наш "замоканий" useAuth()
  mockUseAuth.mockReturnValue(authState);
  
  return render(
    // MemoryRouter потрібен для тестування роутингу
    <MemoryRouter initialEntries={[route]}>
      {/* Theme потрібен для Radix компонентів */}
      <Theme>
        <App />
      </Theme>
    </MemoryRouter>
  );
};

// ---- Tests ----

// Очищуємо моки перед кожним тестом
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});


describe('App Routing and Authentication', () => {

  // --- Стан завантаження ---
  it('повинен показувати спіннер, поки йде завантаження', () => {
    renderApp('/', { isLoggedIn: false, isLoading: true, user: null });
    // Перевіряємо текст з компонента RouteLoader
    expect(screen.getByText('Loading application')).toBeInTheDocument();
  });


  // --- Сценарії для "Гостя" (Не залогінений) ---
  describe('Guest (Logged Out) Scenarios', () => {
    const authState = { isLoggedIn: false, isLoading: false, user: null };

    it('повинен рендерити Home Page на /', () => {
      renderApp('/', authState);
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('повинен рендерити Login Page на /login', () => {
      renderApp('/login', authState);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('повинен рендерити Register Page на /register', () => {
      renderApp('/register', authState);
      expect(screen.getByText('Register Page')).toBeInTheDocument();
    });

    it('повинен редіректити гостя з /dashboard на /login', () => {
      renderApp('/dashboard', authState);
      // Користувач хотів на /dashboard, але його перекинуло на...
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      // ... і сторінка дашборду не відрендерилась
      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });

    it('повинен редіректити гостя з /transactions на /login', () => {
      renderApp('/transactions', authState);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Transactions Page')).not.toBeInTheDocument();
    });
  });


  // --- Сценарії для "Юзера" (Залогінений) ---
  describe('User (Logged In) Scenarios', () => {
    const authState = { isLoggedIn: true, isLoading: false, user: { name: 'Test User' } };

    it('повинен редіректити залогіненого юзера з / на /dashboard', () => {
      renderApp('/', authState);
      // Користувач хотів на /, але його перекинуло на...
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
    });

    it('повинен редіректити залогіненого юзера з /login на /dashboard', () => {
      renderApp('/login', authState);
      // Користувач хотів на /login (PublicRoute), але його перекинуло на...
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('повинен показувати захищену сторінку /dashboard', () => {
      renderApp('/dashboard', authState);
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('повинен показувати захищену сторінку /transactions', () => {
      renderApp('/transactions', authState);
      expect(screen.getByText('Transactions Page')).toBeInTheDocument();
    });

    it('повинен рендерити навігацію (Header, Sidebar, BottomNav)', () => {
      renderApp('/dashboard', authState);
      expect(screen.getByText('Header Component')).toBeInTheDocument();
      expect(screen.getByText('SidebarNav Component')).toBeInTheDocument();
      expect(screen.getByText('BottomNav Component')).toBeInTheDocument();
    });
  });


  // --- Загальні сценарії ---
  describe('General Scenarios', () => {
    it('повинен рендерити NotFound Page для неіснуючого роута (для гостя)', () => {
      renderApp('/some/bad/route', { isLoggedIn: false, isLoading: false, user: null });
      expect(screen.getByText('NotFound Page')).toBeInTheDocument();
    });

    it('повинен рендерити NotFound Page для неіснуючого роута (для юзера)', () => {
      renderApp('/some/bad/route', { isLoggedIn: true, isLoading: false, user: { name: 'Test' } });
      expect(screen.getByText('NotFound Page')).toBeInTheDocument();
    });
  });

});