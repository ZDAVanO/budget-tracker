import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🎨 AuthProvider render:', { isLoggedIn, user, isLoading });

  // Check authentication on load
  useEffect(() => {
    console.log('🔍 AuthProvider: useEffect - checking authentication on mount');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 AuthProvider: checkAuth() - starting verification');
    try {
      // Pass logout as onLogout in checkAuth
      const { response, data } = await api.auth.checkAuth(logout);

      if (response.ok) {
        console.log('✅ AuthProvider: User authenticated', data);
        setUser(data.username);
        setIsLoggedIn(true);
      } else {
        console.log('⚠️ AuthProvider: User not authenticated');
        setIsLoggedIn(false);
        setUser(null);
      }

    } catch (err) {
      console.error('❌ AuthProvider: Authentication verification error', err);
      setIsLoggedIn(false);
      setUser(null);

    } finally {
      setIsLoading(false);
      console.log('🔍 AuthProvider: checkAuth() - finished');
    }
  };

  const login = async () => {
    console.log('🔐 AuthProvider: login() - updating state after login');
    await checkAuth();
  };

  const logout = async () => {
    console.log('🚪 AuthProvider: logout() - starting logout');
    try {
      await api.auth.logout();
      setIsLoggedIn(false);
      setUser(null);
      console.log('✅ AuthProvider: Logout successful');
      
    } catch (err) {
      console.error('❌ AuthProvider: Logout error', err);
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
