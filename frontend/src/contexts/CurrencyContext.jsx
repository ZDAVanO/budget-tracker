import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useLocalStorage } from '../utils/useLocalStorage';

const CurrencyContext = createContext(null);

const DEFAULT_RATES = {
  base: 'USD',
  // rates represent how many units of currency per 1 USD (USD pivot)
  rates: {
    USD: 1.0,
    UAH: 42.05,
    EUR: 0.8602, // ~0.93 EUR per USD based on sample
  },
  supported: ['USD', 'EUR', 'UAH',],
};

const STORAGE_KEY_BASE = 'bt-base-currency';

export function CurrencyProvider({ children }) {
  const [baseCurrency, setBaseCurrency] = useLocalStorage(STORAGE_KEY_BASE, 'USD');
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { response, data } = await api.rates.get();
        if (mounted && response?.ok && data?.rates) {
          setRates({
            base: data.base || 'USD',
            rates: data.rates,
            supported: data.supported || Object.keys(data.rates),
          });
        }
      } catch (err) {
        console.warn('Failed to fetch rates, falling back to defaults', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
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

  const currencySymbol = (code) => {
    switch ((code || '').toUpperCase()) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'UAH': return '₴';
      default: return code?.toUpperCase() || '';
    }
  };

  const format = (amount, code) => {
    const value = Number(amount || 0);
    const sym = currencySymbol(code);
    // Simple format: 2 decimals with symbol/code
    return `${value.toFixed(2)} ${sym || (code || '').toUpperCase()}`.trim();
  };

  const value = {
    baseCurrency,
    setBaseCurrency,
    rates,
    loading,
    error,
    convert,
    format,
    supported: rates?.supported || DEFAULT_RATES.supported,
    currencySymbol,
  };

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
