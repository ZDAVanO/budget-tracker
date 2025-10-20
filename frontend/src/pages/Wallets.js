import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/Wallets.css';

function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '💳',
    initial_balance: '0',
    currency: 'UAH'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const dataToSend = {
        ...formData,
        initial_balance: parseFloat(formData.initial_balance)
      };

      if (editingWallet) {
        const { response } = await api.wallets.update(editingWallet.id, dataToSend);
        if (!response.ok) {
          setError('Помилка оновлення гаманця');
          return;
        }
      } else {
        const { response } = await api.wallets.create(dataToSend);
        if (!response.ok) {
          setError('Помилка створення гаманця');
          return;
        }
      }

      setFormData({
        name: '',
        description: '',
        icon: '💳',
        initial_balance: '0',
        currency: 'UAH'
      });
      setShowForm(false);
      setEditingWallet(null);
      loadWallets();
    } catch (error) {
      console.error('Error saving wallet:', error);
      setError('Помилка збереження');
    }
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      description: wallet.description || '',
      icon: wallet.icon || '💳',
      initial_balance: wallet.initial_balance.toString(),
      currency: wallet.currency
    });
    setShowForm(true);
  };

  const handleDelete = async (wallet) => {
    if (!window.confirm(`Видалити гаманець "${wallet.name}"?`)) {
      return;
    }

    try {
      const { response, data } = await api.wallets.delete(wallet.id);
      if (response.ok) {
        loadWallets();
      } else {
        alert(data?.msg || 'Помилка при видаленні гаманця');
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      alert('Помилка при видаленні гаманця');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingWallet(null);
    setFormData({
      name: '',
      description: '',
      icon: '💳',
      initial_balance: '0',
      currency: 'UAH'
    });
    setError('');
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);

  return (
    <div className="wallets-page">
      <div className="wallets-container">
        <div className="page-header">
          <h1>💳 Гаманці</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Закрити' : '➕ Додати гаманець'}
          </button>
        </div>

        {/* Загальний баланс */}
        <div className="total-balance-card">
          <div className="balance-icon">💰</div>
          <div className="balance-info">
            <div className="balance-label">Загальний баланс</div>
            <div className="balance-value">{totalBalance.toFixed(2)} грн</div>
          </div>
        </div>

        {showForm && (
          <div className="wallet-form">
            <h3>{editingWallet ? '✏️ Редагувати' : '➕ Додати'} гаманець</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Назва *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Наприклад: Готівка"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="icon">Іконка</label>
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="💳"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="initial_balance">Початковий баланс</label>
                  <input
                    type="number"
                    id="initial_balance"
                    name="initial_balance"
                    value={formData.initial_balance}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Валюта</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="UAH">UAH (₴)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Опис</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Додаткова інформація"
                />
              </div>

              {error && <div className="error-message">❌ {error}</div>}

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingWallet ? '💾 Зберегти' : '➕ Додати'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>
                  ❌ Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="loading">⏳ Завантаження...</div>
        ) : wallets.length === 0 ? (
          <div className="empty-state">
            <p>📭 У вас ще немає гаманців</p>
            <p>Створіть перший гаманець, щоб почати відстежувати свої фінанси</p>
          </div>
        ) : (
          <div className="wallets-grid">
            {wallets.map(wallet => (
              <div key={wallet.id} className="wallet-card">
                <div className="wallet-header">
                  <div className="wallet-icon">{wallet.icon}</div>
                  <div className="wallet-name">
                    <h3>{wallet.name}</h3>
                  </div>
                </div>

                <div className="wallet-balance">
                  <div className="balance-label">Баланс</div>
                  <div className={`balance-amount ${wallet.balance >= 0 ? 'positive' : 'negative'}`}>
                    {wallet.balance >= 0 ? '+' : ''}{wallet.balance.toFixed(2)} {wallet.currency}
                  </div>
                </div>

                {wallet.description && (
                  <p className="wallet-description">{wallet.description}</p>
                )}

                <div className="wallet-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(wallet)}
                    title="Редагувати"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(wallet)}
                    title="Видалити"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wallets;
