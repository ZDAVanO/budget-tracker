import React from 'react';
import { Link, useNavigate } from 'react-router';
import './Header.css';

function Header({ isLoggedIn, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // console.log('🎨 Header render:', { isLoggedIn, user });

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            💰 Budget Tracker
          </Link>
        </div>
        
        <nav className="nav">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                📊 Dashboard
              </Link>
              <Link to="/transactions">
                📝 Транзакції
              </Link>
              <Link to="/wallets">
                💳 Гаманці
              </Link>
              <Link to="/categories">
                📂 Категорії
              </Link>
              <span className="user-info">👤 {user}</span>
              <button onClick={handleLogout} className="btn-logout">
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Вхід
              </Link>
              <Link to="/register">
                Реєстрація
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
