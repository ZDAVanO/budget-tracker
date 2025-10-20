import './styles/App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';


import Header from './components/header/Header.js';
import Footer from './components/footer/Footer.js';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Wallets from './pages/Wallets';




// Компонент для публічних роутів (доступні тільки неавторизованим)
function PublicRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  
  console.log('🌐 PublicRoute:', { isLoggedIn, isLoading });

  if (isLoading) {
    console.log('⏳ PublicRoute: Завантаження...');
    return <div className="loading-page">⏳ Завантаження...</div>;
  }

  if (isLoggedIn) {
    console.log('🔐 PublicRoute: Вже авторизовано, перенаправлення на /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ PublicRoute: Доступ дозволено');
  return children;
}


// Компонент для захищених роутів
function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  
  console.log('🔒 ProtectedRoute:', { isLoggedIn, isLoading });

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Завантаження...');
    return <div className="loading-page">⏳ Завантаження...</div>;
  }

  if (!isLoggedIn) {
    console.log('🚫 ProtectedRoute: Не авторизовано, перенаправлення на /login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: Доступ дозволено');
  return children;
}




function AppContent() {
  const { isLoggedIn, user, logout, login, isLoading } = useAuth();

  console.log('🎨 AppContent render:', { isLoggedIn, user, isLoading });

  if (isLoading) {
    console.log('⏳ AppContent: Перевірка аутентифікації...');
    return (
      <div className="loading-page">
        <div className="loading-spinner">⏳</div>
        <p>Завантаження...</p>
      </div>
    );
  }

  return (

    // <Layout isLoggedIn={isLoggedIn} user={user} onLogout={logout}>
    <div className="layout">

      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} />

      <div className="main-content">

      <Routes>

        {/* Головна сторінка */}
        <Route path="/" element={<Home />} />

        {/* Публічні роути (тільки для неавторизованих) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login onLoginSuccess={login} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Захищені роути (тільки для авторизованих) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/wallets" 
          element={
            <ProtectedRoute>
              <Wallets />
            </ProtectedRoute>
          } 
        />

        {/* 404 - сторінка не знайдена */}
        <Route 
          path="*" 
          element={
            <div className="not-found-page">
              <h1>404</h1>
              <p>Сторінку не знайдено</p>
              <a href="/">Повернутися на головну</a>
            </div>
          } 
        />

      </Routes>


      </div>

      <Footer />
    </div>
    // </Layout>



  );
}

function App() {
  console.log('🎨 App component render');

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
