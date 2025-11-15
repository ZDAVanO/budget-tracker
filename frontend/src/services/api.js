// MARK: Constants
const API_BASE_URL = 'http://localhost:5000/api';

// MARK: Logging Utilities
const logRequest = (method, endpoint, data = null) => {
  console.log('🚀 API REQUEST:', {
    timestamp: new Date().toISOString(),
    method,
    endpoint: `${API_BASE_URL}${endpoint}`,
    data
  });
};

const logResponse = (method, endpoint, response, data) => {
  console.log('✅ API RESPONSE:', {
    timestamp: new Date().toISOString(),
    method,
    endpoint: `${API_BASE_URL}${endpoint}`,
    status: response.status,
    statusText: response.statusText,
    data
  });
};

const logError = (method, endpoint, error) => {
  console.error('❌ API ERROR:', {
    timestamp: new Date().toISOString(),
    method,
    endpoint: `${API_BASE_URL}${endpoint}`,
    error: error.message,
    stack: error.stack
  });
};

// MARK: Fetch with Logging
// Base function for making requests with automatic token refresh
const fetchWithLogging = async (endpoint, options = {}, retry = true, onLogout = null) => {
  const method = options.method || 'GET';
  const requestData = options.body ? JSON.parse(options.body) : null;

  logRequest(method, endpoint, requestData);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include'
    });

    const data = await response.json().catch(() => null);
    logResponse(method, endpoint, response, data);

    // If token expired (401) and this is not a refresh request — try to refresh token and retry
    if (response.status === 401 && retry && endpoint !== '/refresh') {
      console.warn('⚠️ API: 401 Unauthorized, trying to refresh token...');
      const refreshResult = await api.auth.refreshToken();
      if (refreshResult.response.ok) {
        // Retry original request (only once)
        return await fetchWithLogging(endpoint, options, false, onLogout);
      } else {
        // Refresh failed — call onLogout if provided
        if (typeof onLogout === 'function') {
          onLogout();
        }
        return { response, data };
      }
    }

    if (!response.ok) {
      console.warn('⚠️ API Warning: Response not OK', {
        status: response.status,
        data
      });
    }

    return { response, data };
  } catch (error) {
    logError(method, endpoint, error);
    throw error;
  }
};

const api = {
  // MARK: Authentication
  auth: {
    login: async (username, password) => {
      // Log only user action, not result (fetchWithLogging logs response)
      console.log('🔐 User login attempt:', username);
      return await fetchWithLogging('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    },

    register: async (username, email, password) => {
      console.log('📝 User registration attempt:', username, email);
      return await fetchWithLogging('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
    },

    logout: async () => {
      console.log('🚪 User logout');
      return await fetchWithLogging('/logout', {
        method: 'POST'
      });
    },

    checkAuth: async (onLogout) => {
      // Log only user action
      console.log('api.js checkAuth');
      return await fetchWithLogging('/protected', {
        method: 'GET'
      }, true, onLogout);
    },

    refreshToken: async () => {
      console.log('🔄 Refreshing token');
      return await fetchWithLogging('/refresh', {
        method: 'POST'
      });
    }
  },

  // MARK: Categories
  categories: {
    getAll: async (type = null) => {
      console.log('📂 Fetching categories, type:', type);
      const endpoint = type ? `/categories?type=${type}` : '/categories';
      return await fetchWithLogging(endpoint, {
        method: 'GET'
      });
    },

    create: async (categoryData) => {
      console.log('➕ Creating category:', categoryData);
      return await fetchWithLogging('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
    },

    update: async (categoryId, categoryData) => {
      console.log('✏️ Updating category:', categoryId, categoryData);
      return await fetchWithLogging(`/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
    },

    delete: async (categoryId) => {
      console.log('🗑️ Deleting category:', categoryId);
      return await fetchWithLogging(`/categories/${categoryId}`, {
        method: 'DELETE'
      });
    }
  },

  // MARK: Transactions
  transactions: {
    getAll: async (filters = {}) => {
      console.log('� Fetching transactions with filters:', filters);
      const params = new URLSearchParams();
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.wallet_id) params.append('wallet_id', filters.wallet_id);
      if (filters.type) params.append('type', filters.type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const endpoint = params.toString() ? `/transactions?${params}` : '/transactions';
      return await fetchWithLogging(endpoint, {
        method: 'GET'
      });
    },

    create: async (transactionData) => {
      console.log('➕ Creating transaction:', transactionData);
      return await fetchWithLogging('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
    },

    update: async (transactionId, transactionData) => {
      console.log('✏️ Updating transaction:', transactionId, transactionData);
      return await fetchWithLogging(`/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
    },

    delete: async (transactionId) => {
      console.log('🗑️ Deleting transaction:', transactionId);
      return await fetchWithLogging(`/transactions/${transactionId}`, {
        method: 'DELETE'
      });
    }
  },

  // MARK: Statistics
  statistics: {
    get: async (filters = {}) => {
      console.log('📊 Fetching statistics with filters:', filters);
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.base_currency) params.append('base_currency', filters.base_currency);

      const endpoint = params.toString() ? `/statistics?${params}` : '/statistics';
      return await fetchWithLogging(endpoint, {
        method: 'GET'
      });
    }
  },

  // MARK: Rates
  rates: {
    get: async () => {
      console.log('💱 Fetching rates');
      return await fetchWithLogging('/rates', {
        method: 'GET'
      }, false);
    }
  },

  // MARK: Wallets
  wallets: {
    getAll: async () => {
      console.log('💳 Fetching wallets');
      return await fetchWithLogging('/wallets', {
        method: 'GET'
      });
    },

    create: async (walletData) => {
      console.log('➕ Creating wallet:', walletData);
      return await fetchWithLogging('/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletData)
      });
    },

    update: async (walletId, walletData) => {
      console.log('✏️ Updating wallet:', walletId, walletData);
      const payload = { ...walletData };
      if (payload.initial_balance !== undefined) {
        payload.adjustment = payload.initial_balance;
        delete payload.initial_balance;
      }
      return await fetchWithLogging(`/wallets/${walletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },

    delete: async (walletId) => {
      console.log('🗑️ Deleting wallet:', walletId);
      return await fetchWithLogging(`/wallets/${walletId}`, {
        method: 'DELETE'
      });
    }
  }
};

export default api;
