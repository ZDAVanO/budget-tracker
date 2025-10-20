import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>💰 Budget Tracker</h1>
        <p className="subtitle">Керуйте своїми фінансами легко та ефективно</p>
        <div className="cta-buttons">
          <Link 
            to="/login" 
            className="btn btn-primary"
          >
            Увійти
          </Link>
          <Link 
            to="/register" 
            className="btn btn-secondary"
          >
            Зареєструватися
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Функціональність</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Відстежування витрат</h3>
            <p>Контролюйте всі свої витрати в одному місці</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Категорії</h3>
            <p>Організуйте витрати за категоріями</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Звіти</h3>
            <p>Аналізуйте свої фінанси з детальними звітами</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
