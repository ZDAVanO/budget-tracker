import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  console.log('🎨 Register page render', { 
    formData: { ...formData, password: '***', confirmPassword: '***' } 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Register form change: ${name} =`, 
      name === 'password' || name === 'confirmPassword' ? '***' : value
    );
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('📝 Register: Спроба реєстрації, username:', formData.username, 'email:', formData.email);

    // Валідація
    if (formData.password !== formData.confirmPassword) {
      console.warn('⚠️ Register: Паролі не співпадають');
      setError('Паролі не співпадають');
      return;
    }

    if (formData.password.length < 6) {
      console.warn('⚠️ Register: Пароль занадто короткий');
      setError('Пароль має містити мінімум 6 символів');
      return;
    }

    setIsLoading(true);

    try {
      const { response, data } = await api.auth.register(
        formData.username, 
        formData.email, 
        formData.password
      );

      if (response.ok) {
        console.log('✅ Register: Реєстрація успішна');
        setSuccess('Реєстрація успішна! Перенаправлення на сторінку входу...');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        
        setTimeout(() => {
          console.log('🔐 Register: Перенаправлення на Login');
          navigate('/login');
        }, 2000);
      } else {
        console.warn('⚠️ Register: Помилка реєстрації', data);
        setError(data?.msg || 'Помилка реєстрації');
      }
    } catch (err) {
      console.error('❌ Register: Виняток при реєстрації', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>📝 Реєстрація</h1>
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
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="email"
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
              autoComplete="new-password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Підтвердіть пароль:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="new-password"
              minLength="6"
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Вже маєте акаунт?{' '}
            <Link 
              to="/login"
            >
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
