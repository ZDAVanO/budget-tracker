import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Auth.css';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  console.log('🎨 Login page render', { formData: { ...formData, password: '***' } });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Login form change: ${name} =`, name === 'password' ? '***' : value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔐 Login: Спроба входу, username:', formData.username);

    try {
      const { response, data } = await api.auth.login(formData.username, formData.password);

      if (response.ok) {
        console.log('✅ Login: Вхід успішний, викликаємо onLoginSuccess');
        onLoginSuccess();
        navigate('/dashboard');
      } else {
        console.warn('⚠️ Login: Помилка входу', data);
        setError(data?.msg || 'Невірний логін або пароль');
      }
    } catch (err) {
      console.error('❌ Login: Виняток при вході', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>🔐 Вхід</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Ім'я користувача:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Ще не маєте акаунту?{' '}
            <Link 
              to="/register"
            >
              Зареєструватися
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
