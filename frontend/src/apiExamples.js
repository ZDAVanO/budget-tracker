// Приклади використання API сервісу

import api from './services/api';

/* ========================================
   АУТЕНТИФІКАЦІЯ
======================================== */

// 1. Вхід користувача
async function loginExample() {
  console.log('=== ПРИКЛАД: Вхід користувача ===');
  
  const { response, data } = await api.auth.login('john', 'password123');
  
  if (response.ok) {
    console.log('✅ Успішний вхід!', data);
    // data містить: { msg: "Login successful" }
  } else {
    console.log('❌ Помилка входу:', data);
    // data містить: { msg: "Invalid credentials" }
  }
}

// 2. Реєстрація користувача
async function registerExample() {
  console.log('=== ПРИКЛАД: Реєстрація користувача ===');
  
  const { response, data } = await api.auth.register(
    'john', 
    'john@example.com', 
    'password123'
  );
  
  if (response.ok) {
    console.log('✅ Успішна реєстрація!', data);
    // data містить: { msg: "User created" }
  } else {
    console.log('❌ Помилка реєстрації:', data);
    // data може містити: { msg: "Username already exists" }
  }
}

// 3. Вихід користувача
async function logoutExample() {
  console.log('=== ПРИКЛАД: Вихід користувача ===');
  
  const { response, data } = await api.auth.logout();
  
  if (response.ok) {
    console.log('✅ Успішний вихід!', data);
    // data містить: { msg: "Logout successful" }
  }
}

// 4. Перевірка аутентифікації
async function checkAuthExample() {
  console.log('=== ПРИКЛАД: Перевірка аутентифікації ===');
  
  const { response, data } = await api.auth.checkAuth();
  
  if (response.ok) {
    console.log('✅ Користувач авторизований!', data);
    // data містить: { username: "john" }
  } else {
    console.log('⚠️ Користувач не авторизований');
  }
}

// 5. Оновлення токена
async function refreshTokenExample() {
  console.log('=== ПРИКЛАД: Оновлення токена ===');
  
  const { response, data } = await api.auth.refreshToken();
  
  if (response.ok) {
    console.log('✅ Токен оновлено!', data);
  } else {
    console.log('❌ Помилка оновлення токена');
  }
}

/* ========================================
   ТЕСТОВІ ЕНДПОІНТИ
======================================== */

// 6. Ping запит
async function pingExample() {
  console.log('=== ПРИКЛАД: Ping ===');
  
  const { response, data } = await api.test.ping();
  
  if (response.ok) {
    console.log('✅ Pong!', data);
    // data містить: { message: "pong" }
  }
}

// 7. Echo запит
async function echoExample() {
  console.log('=== ПРИКЛАД: Echo ===');
  
  const message = 'Hello from frontend!';
  const { response, data } = await api.test.echo(message);
  
  if (response.ok) {
    console.log('✅ Echo відповідь:', data);
    // data містить: { status: "ok", received: {...} }
  }
}

/* ========================================
   ОБРОБКА ПОМИЛОК
======================================== */

// 8. Try-Catch обробка
async function errorHandlingExample() {
  console.log('=== ПРИКЛАД: Обробка помилок ===');
  
  try {
    const { response, data } = await api.auth.login('wrong', 'credentials');
    
    if (!response.ok) {
      // Обробка помилки від сервера
      console.error('Сервер повернув помилку:', data.msg);
      throw new Error(data.msg || 'Login failed');
    }
    
    console.log('Успіх!', data);
  } catch (error) {
    // Обробка мережевих помилок або виключень
    console.error('Виняток:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('Можливо backend не запущено');
    }
  }
}

/* ========================================
   ВИКОРИСТАННЯ В КОМПОНЕНТАХ
======================================== */

// 9. Використання в React компоненті
function LoginComponent() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { response, data } = await api.auth.login(username, password);

      if (response.ok) {
        console.log('✅ Вхід успішний!');
        // Перенаправити на dashboard
        window.location.href = '/dashboard';
      } else {
        console.warn('⚠️ Помилка входу');
        setError(data.msg || 'Невірний логін або пароль');
      }
    } catch (err) {
      console.error('❌ Виняток при вході:', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input 
        type="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Вхід...' : 'Увійти'}
      </button>
    </form>
  );
}

/* ========================================
   ПОСЛІДОВНІ ЗАПИТИ
======================================== */

// 10. Виконання кількох запитів послідовно
async function multipleRequestsExample() {
  console.log('=== ПРИКЛАД: Послідовні запити ===');
  
  try {
    // Крок 1: Вхід
    console.log('1️⃣ Вхід користувача...');
    const loginResult = await api.auth.login('john', 'password123');
    
    if (!loginResult.response.ok) {
      throw new Error('Login failed');
    }
    
    // Крок 2: Перевірка аутентифікації
    console.log('2️⃣ Перевірка аутентифікації...');
    const authResult = await api.auth.checkAuth();
    
    if (authResult.response.ok) {
      console.log('3️⃣ Користувач:', authResult.data.username);
    }
    
    // Крок 3: Ping тест
    console.log('4️⃣ Тест з\'єднання...');
    const pingResult = await api.test.ping();
    console.log('5️⃣ Результат:', pingResult.data.message);
    
    console.log('✅ Всі запити виконано успішно!');
  } catch (error) {
    console.error('❌ Помилка:', error.message);
  }
}

/* ========================================
   ПАРАЛЕЛЬНІ ЗАПИТИ
======================================== */

// 11. Виконання кількох запитів паралельно
async function parallelRequestsExample() {
  console.log('=== ПРИКЛАД: Паралельні запити ===');
  
  try {
    // Виконуємо два запити одночасно
    const [pingResult, echoResult] = await Promise.all([
      api.test.ping(),
      api.test.echo('Parallel test')
    ]);
    
    console.log('Ping:', pingResult.data);
    console.log('Echo:', echoResult.data);
    
    console.log('✅ Обидва запити виконано!');
  } catch (error) {
    console.error('❌ Помилка:', error.message);
  }
}

/* ========================================
   КАСТОМНІ ЗАПИТИ
======================================== */

// 12. Розширення API сервісу
// Додайте це в api.js для нових ендпоінтів:

/*
const api = {
  // ... існуючий код ...
  
  // Новий модуль для транзакцій (приклад для майбутнього)
  transactions: {
    getAll: async () => {
      console.log('📊 Отримання всіх транзакцій');
      const { response, data } = await fetchWithLogging('/transactions', {
        method: 'GET'
      });
      return { response, data };
    },
    
    create: async (amount, category, description) => {
      console.log('➕ Створення транзакції:', { amount, category });
      const { response, data } = await fetchWithLogging('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, description })
      });
      return { response, data };
    }
  }
};
*/

/* ========================================
   ПРИКЛАДИ ЛОГІВ
======================================== */

// Очікувані логи в консолі при виклику api.auth.login():

/*
🔐 Спроба входу користувача: john
🚀 API REQUEST: {
  timestamp: "2025-10-17T10:30:45.123Z",
  method: "POST",
  endpoint: "http://localhost:5000/api/login",
  data: { username: "john", password: "password123" }
}
✅ API RESPONSE: {
  timestamp: "2025-10-17T10:30:45.456Z",
  method: "POST",
  endpoint: "http://localhost:5000/api/login",
  status: 200,
  statusText: "OK",
  data: { msg: "Login successful" }
}
🔐 Результат входу: Успішно { msg: "Login successful" }
*/

/* ========================================
   ЕКСПОРТ ПРИКЛАДІВ
======================================== */

export {
  loginExample,
  registerExample,
  logoutExample,
  checkAuthExample,
  refreshTokenExample,
  pingExample,
  echoExample,
  errorHandlingExample,
  multipleRequestsExample,
  parallelRequestsExample
};

// Для тестування в консолі браузера:
// 1. Відкрийте консоль (F12)
// 2. Вставте код з цього файлу
// 3. Викличте функції: loginExample(), pingExample() і т.д.
