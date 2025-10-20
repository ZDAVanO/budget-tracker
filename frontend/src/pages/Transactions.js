import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import '../styles/Transactions.css';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [filters, setFilters] = useState({ 
    category_id: '', 
    wallet_id: '',
    type: '', // 'expense', 'income', або ''
    start_date: '', 
    end_date: '' 
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadTransactions(),
      loadCategories(),
      loadWallets()
    ]);
    setIsLoading(false);
  };

  const loadTransactions = async () => {
    try {
      const { response, data } = await api.transactions.getAll(filters);
      if (response.ok) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    }
  };

  const loadWallets = async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data);
      }
    } catch (error) {
      console.error('❌ Error loading wallets:', error);
    }
  };

  const handleTransactionSuccess = () => {
    setShowForm(false);
    setEditingTransaction(null);
    loadTransactions();
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Видалити транзакцію "${transaction.title}"?`)) {
      return;
    }

    try {
      const { response } = transaction.type === 'expense' 
        ? await api.expenses.delete(transaction.id)
        : await api.incomes.delete(transaction.id);

      if (response.ok) {
        loadTransactions();
      } else {
        alert('Помилка при видаленні транзакції');
      }
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      alert('Помилка при видаленні транзакції');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const stats = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc.totalExpenses += t.amount;
    } else {
      acc.totalIncomes += t.amount;
    }
    return acc;
  }, { totalExpenses: 0, totalIncomes: 0 });

  const balance = stats.totalIncomes - stats.totalExpenses;

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <div className="page-header">
          <h1>📝 Всі транзакції</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Закрити' : '➕ Додати транзакцію'}
          </button>
        </div>

        {/* Статистика */}
        <div className="stats-summary">
          <div className="stat-card income">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-label">Доходи</div>
              <div className="stat-value">+{stats.totalIncomes.toFixed(2)} грн</div>
            </div>
          </div>

          <div className="stat-card expense">
            <div className="stat-icon">💸</div>
            <div className="stat-info">
              <div className="stat-label">Витрати</div>
              <div className="stat-value">-{stats.totalExpenses.toFixed(2)} грн</div>
            </div>
          </div>

          <div className={`stat-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            <div className="stat-icon">💵</div>
            <div className="stat-info">
              <div className="stat-label">Баланс</div>
              <div className="stat-value">
                {balance >= 0 ? '+' : ''}{balance.toFixed(2)} грн
              </div>
            </div>
          </div>
        </div>

        {/* Форма створення/редагування */}
        {showForm && (
          <TransactionForm
            onSuccess={handleTransactionSuccess}
            editData={editingTransaction}
            onCancel={handleCancelForm}
          />
        )}

        {/* Фільтри */}
        <TransactionFilters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          wallets={wallets}
        />

        {/* Список транзакцій */}
        <div className="transactions-list-container">
          <h3>📋 Транзакції ({transactions.length})</h3>
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default Transactions;
