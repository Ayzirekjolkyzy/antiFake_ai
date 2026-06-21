import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';

import DashboardPage from './pages/admin/DashboardPage';
import VerificationsPage from './pages/admin/verifications/VerificationsPage';
import BrandsPage from './pages/admin/brands/BrandsPage';
import ProductsPage from './pages/admin/products/ProductsPage';
import UsersPage from './pages/admin/users/UsersPage';
import ImagesPage from './pages/admin/images/ImagesPage';

import UserHomePage from './pages/user/HomePage';
import UserProductsPage from './pages/user/ProductsPage';
import UserVerifyPage from './pages/user/VerifyPage';
import UserHistoryPage from './pages/user/HistoryPage';
import UserProfilePage from './pages/user/ProfilePage';

function getRole(user) {
  const role =
    user?.role ||
    user?.roles?.[0] ||
    user?.authorities?.[0]?.authority ||
    user?.authorities?.[0];

  return role;
}

function isAdmin(user) {
  const role = getRole(user);
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
}

function RequireAuth() {
  const { isAuth } = useAuth();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const { user, isAuth } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin(user) ? <Outlet /> : <Navigate to="/" replace />;
}

function RequireUser() {
  const { user, isAuth } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return !isAdmin(user) ? <Outlet /> : <Navigate to="/admin" replace />;
}

function LoginRedirect() {
  const { user } = useAuth();
  return isAdmin(user) ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { isAuth } = useAuth();

  return (
    <Routes>
      {/* AUTH */}
      <Route
        path="/login"
        element={isAuth ? <LoginRedirect /> : <LoginPage mode="user" />}
      />

      <Route
        path="/admin-login"
        element={isAuth ? <LoginRedirect /> : <LoginPage mode="admin" />}
      />

      <Route
        path="/register"
        element={isAuth ? <LoginRedirect /> : <RegisterPage />}
      />

      {/* PUBLIC USER PAGES */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<UserHomePage />} />
        <Route path="/products" element={<UserProductsPage />} />
      </Route>

      {/* PROTECTED USER PAGES */}
      <Route element={<RequireUser />}>
        <Route element={<UserLayout />}>
          <Route path="/verify" element={<UserVerifyPage />} />
          <Route path="/history" element={<UserHistoryPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>
      </Route>

      {/* PROTECTED ADMIN PAGES */}
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/verifications" element={<VerificationsPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/brands" element={<BrandsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/images" element={<ImagesPage />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastProvider />
      </BrowserRouter>
    </AuthProvider>
  );
}