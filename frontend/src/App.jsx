
import './styles/App.css'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './contexts/useAuth';

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

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

import BottomNav from './components/BottomNav.jsx';
import SidebarNav from './components/SidebarNav.jsx';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Wallets from './pages/Wallets.jsx';
import NotFound from './pages/NotFound';


// MARK: RouteLoader
const RouteLoader = ({ message }) => (
  <section className="">
    <div className="max-w-lg mx-auto">
      <div className="flex flex-col items-center justify-center gap-3 min-h-screen">
        <Spinner size="3" />
        <Heading size="6">{message}</Heading>
        <Text color="gray">Please wait...</Text>
      </div>
    </div>
  </section>
);


// MARK: PublicRoute
// Component for public routes (available only to unauthenticated users)
function PublicRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  console.log('🌐 PublicRoute:', { isLoggedIn, isLoading });

  if (isLoading) {
    console.log('⏳ PublicRoute: Loading...');
    return <RouteLoader message="Checking access" />;
  }

  if (isLoggedIn) {
    console.log('🔐 PublicRoute: Already authenticated, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ PublicRoute: Access allowed');
  return children;
}


// MARK: ProtectedRoute
// Component for protected routes
function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  console.log('🔒 ProtectedRoute:', { isLoggedIn, isLoading });

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Loading...');
    return <RouteLoader message="Verifying authentication" />;
  }

  if (!isLoggedIn) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted');
  return children;
}


// MARK: AppContent
import { useLocation } from 'react-router-dom';

function AppContent() {
  const { isLoggedIn, user, logout, login, isLoading } = useAuth();
  const location = useLocation();

  console.log('🎨 AppContent render:', { isLoggedIn, user, isLoading });

  if (isLoading) {
    console.log('⏳ AppContent: Checking authentication...');
    return <RouteLoader message="Loading application" />;
  }

  // Hide BottomNav and SidebarNav on /, /login, and /register, and NotFound pages
  const hideNavs = ["/", "/login", "/register", "/*"].includes(location.pathname);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} />

      <div className="md:flex">
        {isLoggedIn && !hideNavs && <SidebarNav />}

        <main className="grow">
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Home />}
            />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {isLoggedIn && !hideNavs && <BottomNav />}
    </>
  );
}

// MARK: App
function App() {
  console.log('🎨 App component render');

  return (

      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>

  );
}

export default App;

