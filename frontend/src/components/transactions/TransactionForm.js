import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './TransactionForm.css';

function TransactionForm({ onSuccess, editData = null, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    category_id: '',
    wallet_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isExpense = formData.type === 'expense';

  const loadCategories = async () => {
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Помилка завантаження категорій:', err);
    }
  };

  const loadWallets = async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data || []);
        const defaultWallet = data.find(w => w.is_default);
        if (defaultWallet && !editData) {
          setFormData(prev => ({ ...prev, wallet_id: defaultWallet.id }));
        }
      }
    } catch (err) {
      console.error('Помилка завантаження гаманців:', err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadWallets();
    
    if (editData) {
      setFormData({
        type: editData.type || 'expense',
        amount: editData.amount || '',
        date: editData.date ? editData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        title: editData.title || '',
        description: editData.description || '',
        category_id: editData.category_id || '',
        wallet_id: editData.wallet_id || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Конвертуємо дату в ISO формат
      const dateTime = new Date(formData.date + 'T12:00:00').toISOString();
      
      const dataToSend = {
        amount: parseFloat(formData.amount),
        date: dateTime,
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        wallet_id: formData.wallet_id ? parseInt(formData.wallet_id) : null
      };

      let result;
      const isExpenseType = formData.type === 'expense';
      
      if (editData) {
        // Оновлення існуючого запису
        if (isExpenseType) {
          result = await api.expenses.update(editData.id, dataToSend);
        } else {
          result = await api.incomes.update(editData.id, dataToSend);
        }
      } else {
        // Створення нового запису
        if (isExpenseType) {
          result = await api.expenses.create(dataToSend);
        } else {
          result = await api.incomes.create(dataToSend);
        }
      }

      if (result.response.ok) {
        // Очищаємо форму
        setFormData({
          type: 'expense',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          title: '',
          description: '',
          category_id: '',
          wallet_id: wallets.find(w => w.is_default)?.id || ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.data?.msg || 'Помилка збереження');
      }
    } catch (err) {
      console.error('Помилка:', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.type === formData.type || cat.type === 'both'
  );

  return (
    <div className="transaction-form">
      <h3>{editData ? '✏️ Редагувати' : '➕ Додати'} транзакцію</h3>
      
      <form onSubmit={handleSubmit}>
        {!editData && (
          <div className="form-group">
            <label>Тип транзакції *</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                disabled={isLoading}
              >
                💸 Витрата
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                disabled={isLoading}
              >
                💰 Дохід
              </button>
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Сума *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              disabled={isLoading}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Дата *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title">Назва *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder={isExpense ? 'Наприклад: Покупки в супермаркеті' : 'Наприклад: Зарплата'}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Категорія</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Без категорії</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="wallet_id">Гаманець</label>
          <select
            id="wallet_id"
            name="wallet_id"
            value={formData.wallet_id}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Без гаманця</option>
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.icon} {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Опис</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            rows="3"
            placeholder="Додаткова інформація (необов'язково)"
          />
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <div className="form-buttons">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Збереження...' : editData ? '💾 Зберегти' : '➕ Додати'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              ❌ Скасувати
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
