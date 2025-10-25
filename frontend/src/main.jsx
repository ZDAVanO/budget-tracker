import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "@radix-ui/themes/styles.css";
import './styles/index.css'
import App from './App.jsx'


// import { Theme, ThemePanel } from "@radix-ui/themes";
import { ThemeModeProvider } from './contexts/ThemeContext.jsx';
import { CurrencyProvider } from './contexts/CurrencyContext.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ThemeModeProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </ThemeModeProvider>
  // </StrictMode>
)
