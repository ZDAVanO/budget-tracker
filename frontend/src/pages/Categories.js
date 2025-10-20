import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📌',
    type: 'both'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingCategory) {
        const { response } = await api.categories.update(editingCategory.id, formData);
        if (!response.ok) {
          setError('Помилка оновлення категорії');
          return;
        }
      } else {
        const { response } = await api.categories.create(formData);
        if (!response.ok) {
          setError('Помилка створення категорії');
          return;
        }
      }

      setFormData({ name: '', description: '', icon: '📌', type: 'both' });
      setShowForm(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Помилка збереження');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📌',
      type: category.type
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (category.is_default) {
      alert('Неможливо видалити стандартну категорію');
      return;
    }

    if (!window.confirm(`Видалити категорію "${category.name}"?`)) {
      return;
    }

    try {
      const { response } = await api.categories.delete(category.id);
      if (response.ok) {
        loadCategories();
      } else {
        alert('Помилка при видаленні категорії');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Помилка при видаленні категорії');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '📌', type: 'both' });
    setError('');
  };

  const userCategories = categories.filter(cat => !cat.is_default);
  const defaultCategories = categories.filter(cat => cat.is_default);

  return (
    <div className="categories-page">
      <div className="categories-container">
        <div className="page-header">
          <h1>📂 Категорії</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Закрити' : '➕ Додати категорію'}
          </button>
        </div>

        {showForm && (
          <div className="category-form">
            <h3>{editingCategory ? '✏️ Редагувати' : '➕ Додати'} категорію</h3>
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
                    placeholder="Наприклад: Транспорт"
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
                    placeholder="📌"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="type">Тип *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="both">Для всіх</option>
                  <option value="expense">Тільки витрати</option>
                  <option value="income">Тільки доходи</option>
                </select>
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
                  {editingCategory ? '💾 Зберегти' : '➕ Додати'}
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
        ) : (
          <>
            {userCategories.length > 0 && (
              <div className="categories-section">
                <h2>👤 Мої категорії ({userCategories.length})</h2>
                <div className="categories-grid">
                  {userCategories.map(category => (
                    <div key={category.id} className="category-card">
                      <div className="category-icon">{category.icon}</div>
                      <div className="category-info">
                        <h3>{category.name}</h3>
                        <p className="category-type">
                          {category.type === 'both' ? '💰💸 Всі' : category.type === 'expense' ? '💸 Витрати' : '💰 Доходи'}
                        </p>
                        {category.description && (
                          <p className="category-description">{category.description}</p>
                        )}
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(category)}
                          title="Редагувати"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(category)}
                          title="Видалити"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="categories-section">
              <h2>🔧 Стандартні категорії ({defaultCategories.length})</h2>
              <div className="categories-grid">
                {defaultCategories.map(category => (
                  <div key={category.id} className="category-card default">
                    <div className="category-icon">{category.icon}</div>
                    <div className="category-info">
                      <h3>{category.name}</h3>
                      <p className="category-type">
                        {category.type === 'both' ? '💰💸 Всі' : category.type === 'expense' ? '💸 Витрати' : '💰 Доходи'}
                      </p>
                      {category.description && (
                        <p className="category-description">{category.description}</p>
                      )}
                    </div>
                    <div className="default-badge">Стандартна</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Categories;
