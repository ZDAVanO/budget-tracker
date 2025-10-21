// Централізований API сервіс з детальним логуванням

const API_BASE_URL = 'http://localhost:5000/api';

// Утиліта для логування запитів та відповідей
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

// Базова функція для виконання запитів з автоматичним refresh токена
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

    // Якщо токен протух (401) і це не refresh-запит — пробуємо оновити токен і повторити запит
    if (response.status === 401 && retry && endpoint !== '/refresh') {
      console.warn('⚠️ API: 401 Unauthorized, пробуємо refresh токена...');
      const refreshResult = await api.auth.refreshToken();
      if (refreshResult.response.ok) {
        // Повторюємо оригінальний запит (тільки 1 раз)
        return await fetchWithLogging(endpoint, options, false, onLogout);
      } else {
        // Refresh не вдався — викликаємо onLogout, якщо передано
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

// API методи
const api = {
  // Аутентифікація
  auth: {
    login: async (username, password) => {
      console.log('🔐 Спроба входу користувача:', username);
      const { response, data } = await fetchWithLogging('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      console.log('🔐 Результат входу:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    register: async (username, email, password) => {
      console.log('📝 Спроба реєстрації користувача:', username, email);
      const { response, data } = await fetchWithLogging('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      console.log('📝 Результат реєстрації:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    logout: async () => {
      console.log('🚪 Вихід користувача');
      const { response, data } = await fetchWithLogging('/logout', {
        method: 'POST'
      });
      console.log('🚪 Результат виходу:', response.ok ? 'Успішно' : 'Помилка');
      return { response, data };
    },

    checkAuth: async (onLogout) => {
      // Додаємо onLogout для автоматичного виходу при невдалому refresh
      console.log('api.js checkAuth');
      const { response, data } = await fetchWithLogging('/protected', {
        method: 'GET'
      }, true, onLogout);
      console.log('api.js Статус аутентифікації:', response.ok ? 'Авторизовано' : 'Не авторизовано', data);
      return { response, data };
    },

    refreshToken: async () => {
      console.log('🔄 Оновлення токену');
      const { response, data } = await fetchWithLogging('/refresh', {
        method: 'POST'
      });
      console.log('🔄 Результат оновлення токену:', response.ok ? 'Успішно' : 'Помилка');
      return { response, data };
    }
  },

  // Тестові ендпоінти
  test: {
    ping: async () => {
      console.log('🏓 Ping до backend');
      const { response, data } = await fetchWithLogging('/ping', {
        method: 'GET'
      });
      console.log('🏓 Pong від backend:', data);
      return { response, data };
    },

    echo: async (message) => {
      console.log('📡 Відправка echo повідомлення:', message);
      const { response, data } = await fetchWithLogging('/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: message })
      });
      console.log('📡 Echo відповідь:', data);
      return { response, data };
    }
  },

  // Категорії
  categories: {
    getAll: async (type = null) => {
      console.log('📂 Отримання категорій, тип:', type);
      const endpoint = type ? `/categories?type=${type}` : '/categories';
      const { response, data } = await fetchWithLogging(endpoint, {
        method: 'GET'
      });
      console.log('📂 Отримано категорій:', data?.length || 0);
      return { response, data };
    },

    create: async (categoryData) => {
      console.log('➕ Створення категорії:', categoryData);
      const { response, data } = await fetchWithLogging('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      console.log('➕ Результат створення категорії:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    update: async (categoryId, categoryData) => {
      console.log('✏️ Оновлення категорії:', categoryId, categoryData);
      const { response, data } = await fetchWithLogging(`/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      console.log('✏️ Результат оновлення категорії:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    delete: async (categoryId) => {
      console.log('🗑️ Видалення категорії:', categoryId);
      const { response, data } = await fetchWithLogging(`/categories/${categoryId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Результат видалення категорії:', response.ok ? 'Успішно' : 'Помилка');
      return { response, data };
    }
  },

  // Витрати
  expenses: {
    getAll: async (filters = {}) => {
      console.log('💸 Отримання витрат з фільтрами:', filters);
      const params = new URLSearchParams();
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const endpoint = params.toString() ? `/expenses?${params}` : '/expenses';
      const { response, data } = await fetchWithLogging(endpoint, {
        method: 'GET'
      });
      console.log('💸 Отримано витрат:', data?.length || 0);
      return { response, data };
    },

    create: async (expenseData) => {
      console.log('➕ Створення витрати:', expenseData);
      const { response, data } = await fetchWithLogging('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      console.log('➕ Результат створення витрати:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    update: async (expenseId, expenseData) => {
      console.log('✏️ Оновлення витрати:', expenseId, expenseData);
      const { response, data } = await fetchWithLogging(`/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      console.log('✏️ Результат оновлення витрати:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    delete: async (expenseId) => {
      console.log('🗑️ Видалення витрати:', expenseId);
      const { response, data } = await fetchWithLogging(`/expenses/${expenseId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Результат видалення витрати:', response.ok ? 'Успішно' : 'Помилка');
      return { response, data };
    }
  },

  // Доходи
  incomes: {
    getAll: async (filters = {}) => {
      console.log('💰 Отримання доходів з фільтрами:', filters);
      const params = new URLSearchParams();
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const endpoint = params.toString() ? `/incomes?${params}` : '/incomes';
      const { response, data } = await fetchWithLogging(endpoint, {
        method: 'GET'
      });
      console.log('💰 Отримано доходів:', data?.length || 0);
      return { response, data };
    },

    create: async (incomeData) => {
      console.log('➕ Створення доходу:', incomeData);
      const { response, data } = await fetchWithLogging('/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData)
      });
      console.log('➕ Результат створення доходу:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    update: async (incomeId, incomeData) => {
      console.log('✏️ Оновлення доходу:', incomeId, incomeData);
      const { response, data } = await fetchWithLogging(`/incomes/${incomeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData)
      });
      console.log('✏️ Результат оновлення доходу:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    delete: async (incomeId) => {
      console.log('🗑️ Видалення доходу:', incomeId);
      const { response, data } = await fetchWithLogging(`/incomes/${incomeId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Результат видалення доходу:', response.ok ? 'Успішно' : 'Помилка');
      return { response, data };
    }
  },

  // Статистика
  statistics: {
    get: async (filters = {}) => {
      console.log('📊 Отримання статистики з фільтрами:', filters);
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const endpoint = params.toString() ? `/statistics?${params}` : '/statistics';
      const { response, data } = await fetchWithLogging(endpoint, {
        method: 'GET'
      });
      console.log('📊 Отримано статистику:', data);
      return { response, data };
    }
  },

  // Гаманці
  wallets: {
    getAll: async () => {
      console.log('💳 Отримання гаманців');
      const { response, data } = await fetchWithLogging('/wallets', {
        method: 'GET'
      });
      console.log('💳 Отримано гаманців:', data?.length || 0);
      return { response, data };
    },

    create: async (walletData) => {
      console.log('➕ Створення гаманця:', walletData);
      const { response, data } = await fetchWithLogging('/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletData)
      });
      console.log('➕ Результат створення гаманця:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    update: async (walletId, walletData) => {
      console.log('✏️ Оновлення гаманця:', walletId, walletData);
      const { response, data } = await fetchWithLogging(`/wallets/${walletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletData)
      });
      console.log('✏️ Результат оновлення гаманця:', response.ok ? 'Успішно' : 'Помилка', data);
      return { response, data };
    },

    delete: async (walletId) => {
      console.log('🗑️ Видалення гаманця:', walletId);
      const { response, data} = await fetchWithLogging(`/wallets/${walletId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Результат видалення гаманця:', response.ok ? 'Успішно' : 'Помилка');
      return { response, data };
    }
  },

  // Транзакції (об'єднані доходи + витрати)
  transactions: {
    getAll: async (filters = {}) => {
      console.log('📝 Отримання транзакцій з фільтрами:', filters);
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
      console.log('📝 Отримано транзакцій:', data?.length || 0);
      return { response, data };
    }
  }
};

export default api;
