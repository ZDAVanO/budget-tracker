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
      console.log('🔐 User login attempt:', username);
      const { response, data } = await fetchWithLogging('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      console.log('🔐 Login result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    register: async (username, email, password) => {
      console.log('📝 User registration attempt:', username, email);
      const { response, data } = await fetchWithLogging('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      console.log('📝 Registration result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    logout: async () => {
      console.log('🚪 User logout');
      const { response, data } = await fetchWithLogging('/logout', {
        method: 'POST'
      });
      console.log('🚪 Logout result:', response.ok ? 'Success' : 'Error');
      return { response, data };
    },

    checkAuth: async (onLogout) => {
      // Add onLogout for automatic logout on failed refresh
      console.log('api.js checkAuth');
      const { response, data } = await fetchWithLogging('/protected', {
        method: 'GET'
      }, true, onLogout);
      console.log('api.js Auth status:', response.ok ? 'Authorized' : 'Not authorized', data);
      return { response, data };
    },

    refreshToken: async () => {
      console.log('🔄 Refreshing token');
      const { response, data } = await fetchWithLogging('/refresh', {
        method: 'POST'
      });
      console.log('🔄 Token refresh result:', response.ok ? 'Success' : 'Error');
      return { response, data };
    }
  },

  // MARK: Categories
  categories: {
    getAll: async (type = null) => {
      console.log('📂 Fetching categories, type:', type);
      const endpoint = type ? `/categories?type=${type}` : '/categories';
      const { response, data } = await fetchWithLogging(endpoint, {
        method: 'GET'
      });
      console.log('📂 Categories fetched:', data?.length || 0);
      return { response, data };
    },

    create: async (categoryData) => {
      console.log('➕ Creating category:', categoryData);
      const { response, data } = await fetchWithLogging('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      console.log('➕ Category creation result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    update: async (categoryId, categoryData) => {
      console.log('✏️ Updating category:', categoryId, categoryData);
      const { response, data } = await fetchWithLogging(`/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      console.log('✏️ Category update result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    delete: async (categoryId) => {
      console.log('🗑️ Deleting category:', categoryId);
      const { response, data } = await fetchWithLogging(`/categories/${categoryId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Category deletion result:', response.ok ? 'Success' : 'Error');
      return { response, data };
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
      const { response, data } = await fetchWithLogging(endpoint, {
        method: 'GET'
      });
      console.log('� Transactions fetched:', data?.length || 0);
      return { response, data };
    },

    create: async (transactionData) => {
      console.log('➕ Creating transaction:', transactionData);
      const { response, data } = await fetchWithLogging('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      console.log('➕ Transaction creation result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    update: async (transactionId, transactionData) => {
      console.log('✏️ Updating transaction:', transactionId, transactionData);
      const { response, data } = await fetchWithLogging(`/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      console.log('✏️ Transaction update result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    delete: async (transactionId) => {
      console.log('🗑️ Deleting transaction:', transactionId);
      const { response, data } = await fetchWithLogging(`/transactions/${transactionId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Transaction deletion result:', response.ok ? 'Success' : 'Error');
      return { response, data };
    }
  },

  // MARK: Statistics
  statistics: {
    get: async (filters = {}) => {
      console.log('📊 Fetching statistics with filters:', filters);
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const endpoint = params.toString() ? `/statistics?${params}` : '/statistics';
      const { response, data } = await fetchWithLogging(endpoint, {
        method: 'GET'
      });
      console.log('📊 Statistics fetched:', data);
      return { response, data };
    }
  },

  // MARK: Wallets
  wallets: {
    getAll: async () => {
      console.log('💳 Fetching wallets');
      const { response, data } = await fetchWithLogging('/wallets', {
        method: 'GET'
      });
      console.log('💳 Wallets fetched:', data?.length || 0);
      return { response, data };
    },

    create: async (walletData) => {
      console.log('➕ Creating wallet:', walletData);
      const { response, data } = await fetchWithLogging('/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletData)
      });
      console.log('➕ Wallet creation result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    update: async (walletId, walletData) => {
      console.log('✏️ Updating wallet:', walletId, walletData);
      const { response, data } = await fetchWithLogging(`/wallets/${walletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletData)
      });
      console.log('✏️ Wallet update result:', response.ok ? 'Success' : 'Error', data);
      return { response, data };
    },

    delete: async (walletId) => {
      console.log('🗑️ Deleting wallet:', walletId);
      const { response, data} = await fetchWithLogging(`/wallets/${walletId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Wallet deletion result:', response.ok ? 'Success' : 'Error');
      return { response, data };
    }
  }
};

export default api;
