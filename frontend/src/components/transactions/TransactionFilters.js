import React from 'react';
import './TransactionFilters.css';

function TransactionFilters({ filters, onFilterChange, categories, wallets = [] }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onFilterChange({
      category_id: '',
      wallet_id: '',
      type: '',
      start_date: '',
      end_date: ''
    });
  };

  const hasActiveFilters = filters.category_id || filters.wallet_id || filters.type || filters.start_date || filters.end_date;

  return (
    <div className="transaction-filters">
      <h4>🔍 Фільтри</h4>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="type">Тип</label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">Всі транзакції</option>
            <option value="income">💰 Доходи</option>
            <option value="expense">💸 Витрати</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category_id">Категорія</label>
          <select
            id="category_id"
            name="category_id"
            value={filters.category_id}
            onChange={handleChange}
          >
            <option value="">Всі категорії</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="wallet_id">Гаманець</label>
          <select
            id="wallet_id"
            name="wallet_id"
            value={filters.wallet_id}
            onChange={handleChange}
          >
            <option value="">Всі гаманці</option>
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.icon} {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start_date">Від дати</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={filters.start_date}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end_date">До дати</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={filters.end_date}
            onChange={handleChange}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={handleReset} className="btn-reset-filters">
          ❌ Скинути фільтри
        </button>
      )}
    </div>
  );
}

export default TransactionFilters;
