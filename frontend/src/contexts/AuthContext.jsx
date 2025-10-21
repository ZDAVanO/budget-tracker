import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🎨 AuthProvider render:', { isLoggedIn, user, isLoading });

  // Перевірка аутентифікації при завантаженні
  useEffect(() => {
    console.log('🔍 AuthProvider: useEffect - перевірка аутентифікації при завантаженні');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 AuthProvider: checkAuth() - початок перевірки');
    try {
      // Передаємо logout як onLogout у checkAuth
      const { response, data } = await api.auth.checkAuth(logout);

      if (response.ok) {
        console.log('✅ AuthProvider: Користувач авторизований', data);
        setUser(data.username);
        setIsLoggedIn(true);
      } else {
        console.log('⚠️ AuthProvider: Користувач не авторизований');
        setIsLoggedIn(false);
        setUser(null);
      }

    } catch (err) {
      console.error('❌ AuthProvider: Помилка перевірки аутентифікації', err);
      setIsLoggedIn(false);
      setUser(null);

    } finally {
      setIsLoading(false);
      console.log('🔍 AuthProvider: checkAuth() - завершено');
    }
  };

  const login = async () => {
    console.log('🔐 AuthProvider: login() - оновлення стану після входу');
    await checkAuth();
  };

  const logout = async () => {
    console.log('🚪 AuthProvider: logout() - початок виходу');
    try {
      await api.auth.logout();
      setIsLoggedIn(false);
      setUser(null);
      console.log('✅ AuthProvider: Вихід успішний');
      
    } catch (err) {
      console.error('❌ AuthProvider: Помилка виходу', err);
    }
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  console.log('📦 AuthProvider: value', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
