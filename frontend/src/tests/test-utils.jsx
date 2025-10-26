/* eslint-disable react-refresh/only-export-components */
/* global vi */
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi as vitestVi } from 'vitest';

import { ThemeModeProvider } from '../contexts/ThemeContext.jsx';
import { CurrencyProvider } from '../contexts/CurrencyContext.jsx';
import AuthContext from '../contexts/AuthContext.jsx';

// Custom render that wraps UI with common providers
function Providers({ children, route = '/' , authValue }) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <ThemeModeProvider>
        <CurrencyProvider>
          <AuthContext.Provider value={authValue || {
            isLoggedIn: false,
            isLoading: false,
            user: null,
            login: (vitestVi || vi).fn(),
            logout: (vitestVi || vi).fn(),
            checkAuth: (vitestVi || vi).fn(),
          }}>
            {children}
          </AuthContext.Provider>
        </CurrencyProvider>
      </ThemeModeProvider>
    </MemoryRouter>
  );
}

export function render(ui, { route = '/', authValue, ...options } = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <Providers route={route} authValue={authValue}>{children}</Providers>,
    ...options,
  });
}

// Re-export everything
export * from '@testing-library/react';

// default export
export default { render };
