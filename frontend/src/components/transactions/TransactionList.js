import React from 'react';
import './TransactionList.css';

function TransactionList({ transactions, onEdit, onDelete, isLoading }) {
  const emptyMessage = '📭 Транзакцій поки що немає';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="transaction-list-loading">
        <div className="loading-spinner">⏳</div>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map(transaction => {
        const isExpense = transaction.type === 'expense';
        const icon = isExpense ? '💸' : '💰';
        
        return (
          <div key={`${transaction.type}-${transaction.id}`} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-main">
              <div className="transaction-icon">
                {transaction.category?.icon || icon}
              </div>
              
              <div className="transaction-info">
                <div className="transaction-title">{transaction.title}</div>
                <div className="transaction-meta">
                  <span className="transaction-date">{formatDate(transaction.date)}</span>
                  {transaction.category && (
                    <>
                      <span className="separator">•</span>
                      <span className="transaction-category">{transaction.category.name}</span>
                    </>
                  )}
                  {transaction.wallet && (
                    <>
                      <span className="separator">•</span>
                      <span className="transaction-wallet">{transaction.wallet.icon} {transaction.wallet.name}</span>
                    </>
                  )}
                </div>
                {transaction.description && (
                  <div className="transaction-description">{transaction.description}</div>
                )}
              </div>
            </div>

            <div className="transaction-actions">
              <div className={`transaction-amount ${transaction.type}`}>
                {isExpense ? '-' : '+'} {formatAmount(transaction.amount)} ₴
              </div>
              
              <div className="transaction-buttons">
                <button
                  onClick={() => onEdit(transaction)}
                  className="btn-icon btn-edit"
                  title="Редагувати"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(transaction)}
                  className="btn-icon btn-delete"
                  title="Видалити"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TransactionList;
