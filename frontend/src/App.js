
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  Box,
  Button,
  Callout,
  Container,
  Flex,
  Heading,
  Section,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

import Header from './components/header/Header.js';
import Footer from './components/footer/Footer.js';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Wallets from './pages/Wallets';

const RouteLoader = ({ message }) => (
  <Section size="3">
    <Container size="3">
      <Flex align="center" justify="center" direction="column" gap="3" style={{ minHeight: '55vh' }}>
        <Spinner size="3" />
        <Heading size="6">{message}</Heading>
        <Text color="gray">Будь ласка, зачекайте...</Text>
      </Flex>
    </Container>
  </Section>
);

// Компонент для публічних роутів (доступні тільки неавторизованим)
function PublicRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  console.log('🌐 PublicRoute:', { isLoggedIn, isLoading });

  if (isLoading) {
    console.log('⏳ PublicRoute: Завантаження...');
    return <RouteLoader message="Перевірка доступу" />;
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
    return <RouteLoader message="Перевірка автентифікації" />;
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
    return <RouteLoader message="Завантаження застосунку" />;
  }

  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} />

      <Box as="main" flexGrow={1} pb={{ initial: '6', md: '8' }}>
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
              <Section size="3">
                <Container size="2">
                  <Callout.Root>
                    <Callout.Icon>
                      <ArrowLeftIcon />
                    </Callout.Icon>
                    <Callout.Text>
                      <Flex direction="column" gap="3">
                        <Heading size="7">404 • Сторінку не знайдено</Heading>
                        <Text color="gray" size="3">
                          Здається, ви опинилися на невідомій сторінці. Спробуйте повернутися на головну.
                        </Text>
                        <Flex>
                          <Button asChild>
                            <a href="/">На головну</a>
                          </Button>
                        </Flex>
                      </Flex>
                    </Callout.Text>
                  </Callout.Root>
                </Container>
              </Section>
            }
          />
        </Routes>
      </Box>

      <Footer />
    </Flex>
  );
}

function App() {
  console.log('🎨 App component render');

  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </Flex>
  );
}

export default App;
