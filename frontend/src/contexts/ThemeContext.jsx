import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { Theme, ThemePanel } from '@radix-ui/themes';
import detectDarkMode from '../utils/detectDarkMode';
import { useLocalStorage } from '../utils/useLocalStorage';

const ThemeModeContext = createContext(null);

const STORAGE_KEY = 'bt-theme-appearance';

function resolveSystemAppearance() {
  if (typeof window === 'undefined') return 'light';
  return detectDarkMode();
}

function useSystemAppearance() {
  const [systemAppearance, setSystemAppearance] = useState(resolveSystemAppearance());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const updateAppearance = (e) => setSystemAppearance(e.matches ? 'dark' : 'light');

    setSystemAppearance(mql.matches ? 'dark' : 'light');

    mql.addEventListener?.('change', updateAppearance) || mql.addListener?.(updateAppearance);

    return () => {
      mql.removeEventListener?.('change', updateAppearance) || mql.removeListener?.(updateAppearance);
    };
  }, []);

  return systemAppearance;
}

export function ThemeModeProvider({ children }) {
  const [storedAppearance, setStoredAppearance] = useLocalStorage(STORAGE_KEY, 'system');
  const systemAppearance = useSystemAppearance();

  const effectiveAppearance =
    storedAppearance === 'system' ? systemAppearance : storedAppearance || systemAppearance;

  const toggleAppearance = useCallback(() => {
    setStoredAppearance((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'dark';
      return systemAppearance === 'dark' ? 'light' : 'dark';
    });
  }, [setStoredAppearance, systemAppearance]);

  const contextValue = useMemo(
    () => ({
      appearance: storedAppearance,
      effectiveAppearance,
      toggleAppearance,
      setAppearance: setStoredAppearance,
    }),
    [storedAppearance, effectiveAppearance, toggleAppearance, setStoredAppearance]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <Theme
        appearance={effectiveAppearance}
        accentColor="mint"
        grayColor="slate"
        radius="large"
      >
        {children}
        {/* <ThemePanel /> */}
      </Theme>
    </ThemeModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used within a ThemeModeProvider');
  return context;
}
