import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "@radix-ui/themes/styles.css";
import './styles/index.css'
import App from './App.jsx'


// import { Theme, ThemePanel } from "@radix-ui/themes";
import { ThemeModeProvider } from './contexts/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    
  // </StrictMode>,

  // <Theme radius="large" scaling="95%" appearance="dark">
  //   <App />
  //   <ThemePanel />
  // </Theme>

  <ThemeModeProvider>
    <App />
  </ThemeModeProvider>
)
