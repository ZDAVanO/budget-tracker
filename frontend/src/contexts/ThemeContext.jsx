import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { Theme, ThemePanel } from '@radix-ui/themes';
import detectDarkMode from '../utils/detectDarkMode';
import { useLocalStorage } from '../utils/useLocalStorage';

const ThemeModeContext = createContext(null);

const STORAGE_KEY = 'bt-theme-appearance';

function resolveSystemAppearance() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return detectDarkMode();
}

export function ThemeModeProvider({ children }) {
  // storedAppearance is the user's explicit choice and can be
  // 'light' | 'dark' | 'system' (or other values in future)
  const [storedAppearance, setStoredAppearance] = useLocalStorage(
    STORAGE_KEY,
    'system'
  );

  // Keep track of the system preference so we can react to changes
  const [systemAppearance, setSystemAppearance] = useState(resolveSystemAppearance());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemAppearance(e.matches ? 'dark' : 'light');

    // ensure initial value is in sync
    setSystemAppearance(mql.matches ? 'dark' : 'light');

    // prefer addEventListener/removeEventListener when available
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else if (mql.addListener) {
      mql.addListener(onChange);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else if (mql.removeListener) {
        mql.removeListener(onChange);
      }
    };
  }, []);

  // effectiveAppearance is what we pass to the Theme component and
  // will always be either 'light' or 'dark'. If the user selected
  // 'system' we resolve it to the current systemAppearance.
  const effectiveAppearance =
    storedAppearance === 'system' ? systemAppearance : storedAppearance || systemAppearance;

  const toggleAppearance = useCallback(() => {
    setStoredAppearance((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'dark';
      // if previously 'system' (or any other), toggle to opposite of system
      return systemAppearance === 'dark' ? 'light' : 'dark';
    });
  }, [setStoredAppearance, systemAppearance]);

  const contextValue = useMemo(
    () => ({ appearance: storedAppearance, effectiveAppearance, toggleAppearance, setAppearance: setStoredAppearance }),
    [storedAppearance, effectiveAppearance, toggleAppearance, setStoredAppearance]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <Theme
        appearance={effectiveAppearance}
        accentColor="mint"
        grayColor="slate"
        radius="large"
        // scaling="95%"
      >
        {children}
        {/* <ThemePanel /> */}
      </Theme>
    </ThemeModeContext.Provider>
  );
}

// Allow exporting hooks/helpers from this file alongside the provider.
// The react-refresh rule 'only-export-components' would otherwise warn in dev.
// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }

  return context;
}
