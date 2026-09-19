import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import "@radix-ui/themes/styles.css";
import './styles/index.css';
import App from './App.jsx';

import { ThemeModeProvider } from './contexts/ThemeContext.jsx';
import { CurrencyProvider } from './contexts/CurrencyContext.jsx';

const RouterComponent = import.meta.env.VITE_DEMO_MODE === 'true' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ThemeModeProvider>
      <CurrencyProvider>
        <RouterComponent>
          <App />
        </RouterComponent>
      </CurrencyProvider>
    </ThemeModeProvider>
  // </StrictMode>
);
