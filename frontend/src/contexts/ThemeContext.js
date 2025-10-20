import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { Theme } from '@radix-ui/themes';
import detectDarkMode from '../utils/detectDarkMode';
import { useLocalStorage } from '../utils/useLocalSorage';

const ThemeModeContext = createContext(null);

const STORAGE_KEY = 'bt-theme-appearance';

function resolveSystemAppearance() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return detectDarkMode();
}

export function ThemeModeProvider({ children }) {
  const [appearance, setAppearance] = useLocalStorage(STORAGE_KEY, resolveSystemAppearance());

  const effectiveAppearance = appearance || resolveSystemAppearance();

  const toggleAppearance = useCallback(() => {
    setAppearance((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setAppearance]);

  const contextValue = useMemo(
    () => ({ appearance: effectiveAppearance, toggleAppearance, setAppearance }),
    [effectiveAppearance, setAppearance, toggleAppearance]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <Theme
        appearance={effectiveAppearance}
        accentColor="mint"
        grayColor="slate"
        radius="large"
        scaling="95%"
      >
        {children}
      </Theme>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }

  return context;
}
