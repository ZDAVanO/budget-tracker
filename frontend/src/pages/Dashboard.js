import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import api from '../services/api';
import '../styles/Dashboard.css';

function Dashboard({ user }) {
  const [statistics, setStatistics] = useState({ total_expenses: 0, total_incomes: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🎨 Dashboard render, user:', user);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadStatistics(),
          loadRecentTransactions(),
          loadWallets()
        ]);
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadStatistics = async () => {
    try {
      const { response, data } = await api.statistics.get();
      if (response.ok) {
        setStatistics(data);
      }
    } catch (err) {
      console.error('Помилка завантаження статистики:', err);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const { response, data } = await api.transactions.getAll();
      if (response.ok) {
        setRecentTransactions((data || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Помилка завантаження транзакцій:', err);
    }
  };

  const loadWallets = async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data || []);
      }
    } catch (err) {
      console.error('Помилка завантаження гаманців:', err);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>📊 Dashboard</h1>
        <p className="welcome-message">Вітаємо, <strong>{user}</strong>! 👋</p>

        {/* Статистика */}
        <div className="statistics-section">
          <div className="stat-card stat-expense">
            <div className="stat-icon">💸</div>
            <div className="stat-content">
              <div className="stat-label">Витрати</div>
              <div className="stat-value">{formatAmount(statistics.total_expenses)} ₴</div>
            </div>
          </div>
          <div className="stat-card stat-income">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Доходи</div>
              <div className="stat-value">{formatAmount(statistics.total_incomes)} ₴</div>
            </div>
          </div>
          <div className="stat-card stat-balance">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Баланс</div>
              <div className={`stat-value ${statistics.balance >= 0 ? 'positive' : 'negative'}`}>
                {formatAmount(statistics.balance)} ₴
              </div>
            </div>
          </div>
        </div>

        {/* Останні транзакції */}
        <div className="recent-section">
          <div className="section-header">
            <h2>📝 Останні транзакції</h2>
            <Link to="/transactions" className="view-all-link">Переглянути всі →</Link>
          </div>
          {isLoading ? (
            <p>Завантаження...</p>
          ) : recentTransactions.length === 0 ? (
            <p className="no-data">Немає транзакцій</p>
          ) : (
            <div className="transactions-preview">
              {recentTransactions.map((transaction) => (
                <div key={`${transaction.type}-${transaction.id}`} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-info">
                    <div className="transaction-category">
                      {transaction.category ? transaction.category.name : 'Без категорії'}
                    </div>
                    <div className="transaction-description">{transaction.description || transaction.title}</div>
                  </div>
                  <div className="transaction-amount">
                    {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)} ₴
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Гаманці */}
        <div className="wallets-section">
          <div className="section-header">
            <h2>💳 Гаманці</h2>
            <Link to="/wallets" className="view-all-link">Керувати →</Link>
          </div>
          {wallets.length === 0 ? (
            <p className="no-data">Немає гаманців. <Link to="/wallets">Додайте перший гаманець</Link></p>
          ) : (
            <div className="wallets-grid">
              {wallets.slice(0, 3).map((wallet) => (
                <div key={wallet.id} className="wallet-card">
                  <div className="wallet-name">{wallet.name}</div>
                  <div className="wallet-balance">{formatAmount(wallet.balance || 0)} ₴</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Швидкі посилання */}
        <div className="quick-links">
          <Link to="/transactions" className="quick-link">
            <span className="link-icon">📝</span>
            <span className="link-text">Транзакції</span>
          </Link>
          <Link to="/categories" className="quick-link">
            <span className="link-icon">🏷️</span>
            <span className="link-text">Категорії</span>
          </Link>
          <Link to="/wallets" className="quick-link">
            <span className="link-icon">💳</span>
            <span className="link-text">Гаманці</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
