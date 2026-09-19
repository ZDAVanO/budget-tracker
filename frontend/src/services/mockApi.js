import {
  DEFAULT_USER,
  DEFAULT_CATEGORIES,
  DEFAULT_WALLETS,
  generateSampleTransactions
} from './mockData';

const STORAGE_KEYS = {
  USER: 'budget_tracker_user',
  CATEGORIES: 'budget_tracker_categories',
  WALLETS: 'budget_tracker_wallets',
  TRANSACTIONS: 'budget_tracker_transactions',
  IS_LOGGED_IN: 'budget_tracker_logged_in'
};

const DEFAULT_RATES = {
  USD: 1.0,
  UAH: 42.0,
  EUR: 0.93,
  GBP: 0.79
};

let cachedRates = { ...DEFAULT_RATES };
let lastRatesFetch = 0;

const fetchLiveRates = async () => {
  const now = Date.now();
  if (now - lastRatesFetch < 60 * 60 * 1000 && Object.keys(cachedRates).length > 4) {
    return cachedRates;
  }

  const primaryUrl = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
  const fallbackUrl = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';

  try {
    const res = await fetch(primaryUrl).catch(() => fetch(fallbackUrl));
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.usd) {
        const rates = { USD: 1.0 };
        Object.entries(data.usd).forEach(([key, val]) => {
          rates[key.toUpperCase()] = Number(val);
        });
        cachedRates = rates;
        lastRatesFetch = now;
        return cachedRates;
      }
    }
  } catch (error) {
    console.warn('Demo mode: Failed to fetch live currency rates, using defaults', error);
  }
  return cachedRates;
};

const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
  const from = (fromCurrency || 'USD').toUpperCase();
  const to = (toCurrency || 'USD').toUpperCase();
  if (from === to) return Number(amount) || 0;

  const fromRate = rates[from] || DEFAULT_RATES[from] || 1;
  const toRate = rates[to] || DEFAULT_RATES[to] || 1;

  const inUsd = (Number(amount) || 0) / fromRate;
  return inUsd * toRate;
};

// Storage Helpers
const getStorageItem = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Failed to read from localStorage:', key, e);
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to write to localStorage:', key, e);
  }
};

// Initialize Mock Data if empty
export const initDemoStorage = (forceReset = false) => {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    setStorageItem(STORAGE_KEYS.USER, DEFAULT_USER);
    setStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
    setStorageItem(STORAGE_KEYS.TRANSACTIONS, generateSampleTransactions());
    setStorageItem(STORAGE_KEYS.IS_LOGGED_IN, true);
    console.log('✨ Demo Mode storage initialized with fresh sample data.');
  }
};

// Ensure storage is ready
initDemoStorage();

const makeResponse = (data, status = 200, ok = true) => ({
  response: {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => data
  },
  data
});

const calculateWalletBalance = (walletId, transactions) => {
  const walletTx = transactions.filter(t => Number(t.wallet_id) === Number(walletId));
  const income = walletTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const expense = walletTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  return Number((income - expense).toFixed(2));
};

export const mockApi = {
  // MARK: Auth
  auth: {
    login: async (username) => {
      const user = {
        id: 1,
        username: username || DEFAULT_USER.username,
        email: DEFAULT_USER.email
      };
      setStorageItem(STORAGE_KEYS.USER, user);
      setStorageItem(STORAGE_KEYS.IS_LOGGED_IN, true);
      return makeResponse({ user });
    },

    register: async (username, email) => {
      const user = {
        id: 1,
        username: username || DEFAULT_USER.username,
        email: email || DEFAULT_USER.email
      };
      setStorageItem(STORAGE_KEYS.USER, user);
      setStorageItem(STORAGE_KEYS.IS_LOGGED_IN, true);
      return makeResponse({
        message: 'Registered successfully in Demo Mode',
        user
      }, 201);
    },

    logout: async () => {
      setStorageItem(STORAGE_KEYS.IS_LOGGED_IN, false);
      return makeResponse({ message: 'Demo logout successful' });
    },

    checkAuth: async () => {
      initDemoStorage();
      const isLoggedIn = getStorageItem(STORAGE_KEYS.IS_LOGGED_IN, true);
      if (!isLoggedIn) {
        return makeResponse({ error: 'Unauthorized' }, 401, false);
      }
      const user = getStorageItem(STORAGE_KEYS.USER, DEFAULT_USER);
      return makeResponse({
        username: user.username,
        email: user.email,
        id: user.id
      });
    },

    refreshToken: async () => {
      return makeResponse({ message: 'Demo token refreshed' });
    }
  },

  // MARK: Categories
  categories: {
    getAll: async (type = null) => {
      initDemoStorage();
      const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const filtered = type ? categories.filter(c => c.type === type || c.type === 'both') : categories;
      return makeResponse(filtered);
    },

    create: async (categoryData) => {
      const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const maxId = categories.reduce((max, c) => Math.max(max, c.id || 0), 0);
      const newCategory = {
        id: maxId + 1,
        name: categoryData.name,
        icon: categoryData.icon || '📂',
        type: categoryData.type || 'expense',
        description: categoryData.description || '',
        user_id: 1
      };
      categories.push(newCategory);
      setStorageItem(STORAGE_KEYS.CATEGORIES, categories);
      return makeResponse(newCategory, 201);
    },

    update: async (categoryId, categoryData) => {
      const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const index = categories.findIndex(c => Number(c.id) === Number(categoryId));
      if (index === -1) {
        return makeResponse({ error: 'Category not found' }, 404, false);
      }
      categories[index] = { ...categories[index], ...categoryData };
      setStorageItem(STORAGE_KEYS.CATEGORIES, categories);
      return makeResponse(categories[index]);
    },

    delete: async (categoryId) => {
      let categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      categories = categories.filter(c => Number(c.id) !== Number(categoryId));
      setStorageItem(STORAGE_KEYS.CATEGORIES, categories);
      return makeResponse({ message: 'Category deleted successfully' });
    }
  },

  // MARK: Wallets
  wallets: {
    getAll: async () => {
      initDemoStorage();
      const wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
      const transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);

      const walletsWithBalance = wallets.map(w => ({
        ...w,
        balance: calculateWalletBalance(w.id, transactions)
      }));

      return makeResponse(walletsWithBalance);
    },

    create: async (walletData) => {
      const wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
      const transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);
      const maxId = wallets.reduce((max, w) => Math.max(max, w.id || 0), 0);

      const newWallet = {
        id: maxId + 1,
        name: walletData.name,
        description: walletData.description || '',
        icon: walletData.icon || '💳',
        currency: walletData.currency || 'USD',
        user_id: 1,
        balance: 0
      };
      wallets.push(newWallet);
      setStorageItem(STORAGE_KEYS.WALLETS, wallets);

      // If initial balance is set, add adjustment transaction
      const initialBalance = parseFloat(walletData.initial_balance || 0);
      if (initialBalance !== 0) {
        const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
        const adjustCategory = categories.find(c => c.name === 'Adjust Balance') || categories[0];
        const maxTxId = transactions.reduce((max, t) => Math.max(max, t.id || 0), 0);

        const adjTx = {
          id: maxTxId + 1,
          amount: Math.abs(initialBalance),
          date: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          title: 'Adjust Balance',
          description: 'Initial balance adjustment',
          type: initialBalance >= 0 ? 'income' : 'expense',
          category_id: adjustCategory.id,
          wallet_id: newWallet.id,
          user_id: 1
        };
        transactions.push(adjTx);
        setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);
        newWallet.balance = initialBalance;
      }

      return makeResponse(newWallet, 201);
    },

    update: async (walletId, walletData) => {
      const wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
      const transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);
      const index = wallets.findIndex(w => Number(w.id) === Number(walletId));

      if (index === -1) {
        return makeResponse({ error: 'Wallet not found' }, 404, false);
      }

      wallets[index] = { ...wallets[index], ...walletData };
      setStorageItem(STORAGE_KEYS.WALLETS, wallets);

      // Handle adjustment if passed
      if (walletData.adjustment !== undefined && Number(walletData.adjustment) !== 0) {
        const adjAmount = Number(walletData.adjustment);
        const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
        const adjustCategory = categories.find(c => c.name === 'Adjust Balance') || categories[0];
        const maxTxId = transactions.reduce((max, t) => Math.max(max, t.id || 0), 0);

        transactions.push({
          id: maxTxId + 1,
          amount: Math.abs(adjAmount),
          date: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          title: 'Adjust Balance',
          description: 'Balance adjustment',
          type: adjAmount >= 0 ? 'income' : 'expense',
          category_id: adjustCategory.id,
          wallet_id: Number(walletId),
          user_id: 1
        });
        setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);
      }

      const updatedWallet = {
        ...wallets[index],
        balance: calculateWalletBalance(walletId, transactions)
      };

      return makeResponse(updatedWallet);
    },

    delete: async (walletId) => {
      let wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
      let transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);

      wallets = wallets.filter(w => Number(w.id) !== Number(walletId));
      transactions = transactions.filter(t => Number(t.wallet_id) !== Number(walletId));

      setStorageItem(STORAGE_KEYS.WALLETS, wallets);
      setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);

      return makeResponse({ message: 'Wallet deleted successfully' });
    }
  },

  // MARK: Transactions
  transactions: {
    getAll: async (filters = {}) => {
      initDemoStorage();
      const transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);
      const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);

      const categoryMap = new Map(categories.map(c => [Number(c.id), c]));
      const walletMap = new Map(wallets.map(w => [Number(w.id), w]));

      let result = transactions.map(t => ({
        ...t,
        category: categoryMap.get(Number(t.category_id)) || null,
        wallet: walletMap.get(Number(t.wallet_id)) || null
      }));

      if (filters.category_id) {
        result = result.filter(t => Number(t.category_id) === Number(filters.category_id));
      }
      if (filters.wallet_id) {
        result = result.filter(t => Number(t.wallet_id) === Number(filters.wallet_id));
      }
      if (filters.type) {
        result = result.filter(t => t.type === filters.type);
      }
      if (filters.start_date) {
        const start = new Date(filters.start_date).getTime();
        result = result.filter(t => new Date(t.date).getTime() >= start);
      }
      if (filters.end_date) {
        const end = new Date(filters.end_date).getTime();
        result = result.filter(t => new Date(t.date).getTime() <= end);
      }

      // Sort by date desc
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return makeResponse(result);
    },

    create: async (transactionData) => {
      const transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);
      const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);

      const maxId = transactions.reduce((max, t) => Math.max(max, t.id || 0), 0);
      const now = new Date().toISOString();

      const newTx = {
        id: maxId + 1,
        amount: parseFloat(transactionData.amount),
        date: transactionData.date || now,
        modified_at: now,
        title: transactionData.title || '',
        description: transactionData.description || '',
        type: transactionData.type,
        category_id: Number(transactionData.category_id),
        wallet_id: Number(transactionData.wallet_id),
        user_id: 1
      };

      transactions.push(newTx);
      setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);

      const populated = {
        ...newTx,
        category: categories.find(c => Number(c.id) === newTx.category_id) || null,
        wallet: wallets.find(w => Number(w.id) === newTx.wallet_id) || null
      };

      return makeResponse(populated, 201);
    },

    update: async (transactionId, transactionData) => {
      const transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);
      const categories = getStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);

      const index = transactions.findIndex(t => Number(t.id) === Number(transactionId));
      if (index === -1) {
        return makeResponse({ error: 'Transaction not found' }, 404, false);
      }

      const updatedTx = {
        ...transactions[index],
        ...transactionData,
        amount: parseFloat(transactionData.amount ?? transactions[index].amount),
        category_id: Number(transactionData.category_id ?? transactions[index].category_id),
        wallet_id: Number(transactionData.wallet_id ?? transactions[index].wallet_id),
        modified_at: new Date().toISOString()
      };

      transactions[index] = updatedTx;
      setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);

      const populated = {
        ...updatedTx,
        category: categories.find(c => Number(c.id) === updatedTx.category_id) || null,
        wallet: wallets.find(w => Number(w.id) === updatedTx.wallet_id) || null
      };

      return makeResponse(populated);
    },

    delete: async (transactionId) => {
      let transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);
      transactions = transactions.filter(t => Number(t.id) !== Number(transactionId));
      setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);
      return makeResponse({ message: 'Transaction deleted successfully' });
    }
  },

  // MARK: Statistics
  statistics: {
    get: async (filters = {}) => {
      initDemoStorage();
      const transactions = getStorageItem(STORAGE_KEYS.TRANSACTIONS, []);
      const wallets = getStorageItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
      const rates = await fetchLiveRates();

      const walletMap = new Map(wallets.map(w => [Number(w.id), w]));
      const baseCurrency = (filters.base_currency || 'USD').toUpperCase();

      let filtered = transactions;
      if (filters.start_date) {
        const start = new Date(filters.start_date).getTime();
        filtered = filtered.filter(t => new Date(t.date).getTime() >= start);
      }
      if (filters.end_date) {
        const end = new Date(filters.end_date).getTime();
        filtered = filtered.filter(t => new Date(t.date).getTime() <= end);
      }

      let totalExpenses = 0.0;
      let totalIncomes = 0.0;

      filtered.forEach(t => {
        const wallet = walletMap.get(Number(t.wallet_id));
        const walletCurrency = wallet ? wallet.currency : 'USD';
        const converted = convertAmount(t.amount, walletCurrency, baseCurrency, rates);

        if (t.type === 'expense') {
          totalExpenses += converted;
        } else if (t.type === 'income') {
          totalIncomes += converted;
        }
      });

      const balance = totalIncomes - totalExpenses;

      return makeResponse({
        total_expenses: Number(totalExpenses.toFixed(2)),
        total_incomes: Number(totalIncomes.toFixed(2)),
        balance: Number(balance.toFixed(2)),
        base_currency: baseCurrency
      });
    }
  },

  // MARK: Rates
  rates: {
    get: async () => {
      const rates = await fetchLiveRates();
      return makeResponse({
        base: 'USD',
        schema: 'UNITS_PER_USD',
        source: 'demo-live',
        last_updated: Date.now() / 1000,
        rates,
        supported: Object.keys(rates).sort()
      });
    }
  },

  // MARK: Helper to reset demo data
  resetDemoData: () => {
    initDemoStorage(true);
    console.log('🔄 Demo data reset to initial default state.');
  }
};

export default mockApi;
