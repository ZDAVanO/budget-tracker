import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from '../services/api';
import { useLocalStorage } from '../utils/useLocalStorage';

const CurrencyContext = createContext(null);

// Fallback rates for offline/first load (USD pivot)
const DEFAULT_RATES = {
  base: 'USD',
  rates: {
    USD: 1.0,
    EUR: 0.93,
    UAH: 42.0,
    GBP: 0.79,
    
  },
  supported: ['USD', 'EUR', 'UAH', 'GBP'],
};

// Symbol map for many common currencies (for fallback and display)
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  UAH: '₴',
  GBP: '£',
  RUB: '₽',
  PLN: 'zł',
  CZK: 'Kč',
  CHF: '₣',
  JPY: '¥',
  CNY: '¥',
  HKD: 'HK$',
  AUD: 'A$',
  CAD: 'C$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  INR: '₹',
  KZT: '₸',
  TRY: '₺',
  GEL: '₾',
  HUF: 'Ft',
  SGD: 'S$',
  AED: 'د.إ',
  BTC: '₿',
  ETH: 'Ξ',
  
};

const STORAGE_KEY_BASE = 'bt-base-currency';

export function CurrencyProvider({ children }) {
  const [baseCurrency, setBaseCurrency] = useLocalStorage(STORAGE_KEY_BASE, 'USD');
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.rates.get()
      .then(({ response, data }) => {
        if (mounted && response?.ok && data?.rates) {
          setRates({
            base: data.base || 'USD',
            rates: data.rates,
            supported: data.supported || Object.keys(data.rates),
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch rates, falling back to defaults', err);
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const convert = useMemo(() => {
    const map = rates?.rates || DEFAULT_RATES.rates;
    // rates map: units per 1 USD; use USD as pivot
    return (amount, from = 'USD', to = baseCurrency || 'USD') => {
      if (amount == null) return 0;
      const fromCur = (from || 'USD').toUpperCase();
      const toCur = (to || 'USD').toUpperCase();
      if (fromCur === toCur) return Number(amount);
      if (!map[fromCur] || !map[toCur]) return Number(amount);
      const inUSD = Number(amount) / map[fromCur];
      return inUSD * map[toCur];
    };
  }, [rates, baseCurrency]);

  const currencySymbol = useCallback((code) => {
    const up = (code || '').toUpperCase();
    return CURRENCY_SYMBOLS[up] || up;
  }, []);

  const format = useCallback((amount, code) => {
    const value = Number(amount || 0);
    const sym = currencySymbol(code);
    return `${value.toFixed(2)} ${sym || (code || '').toUpperCase()}`.trim();
  }, [currencySymbol]);

  const value = useMemo(() => ({
    baseCurrency,
    setBaseCurrency,
    rates,
    loading,
    error,
    convert,
    format,
    supported: rates?.supported || DEFAULT_RATES.supported,
    currencySymbol,
  }), [baseCurrency, setBaseCurrency, rates, loading, error, convert, format, currencySymbol]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export default CurrencyContext;

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
