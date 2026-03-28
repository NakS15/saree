import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import VendorLayout from './components/layout/VendorLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy-loaded pages
const HomePage       = lazy(() => import('./pages/HomePage'));
const ProductsPage   = lazy(() => import('./pages/ProductsPage'));
const ProductDetail  = lazy(() => import('./pages/ProductDetailPage'));
const CartPage       = lazy(() => import('./pages/CartPage'));
const CheckoutPage   = lazy(() => import('./pages/CheckoutPage'));
const WishlistPage   = lazy(() => import('./pages/WishlistPage'));
const OrdersPage     = lazy(() => import('./pages/OrdersPage'));
const OrderDetail    = lazy(() => import('./pages/OrderDetailPage'));
const ProfilePage    = lazy(() => import('./pages/ProfilePage'));
const LoginPage      = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPassword  = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmail    = lazy(() => import('./pages/auth/VerifyEmailPage'));
const CategoryPage   = lazy(() => import('./pages/CategoryPage'));
const VendorStore    = lazy(() => import('./pages/VendorStorePage'));
const NotFound       = lazy(() => import('./pages/NotFoundPage'));

// Vendor pages
const VendorDashboard  = lazy(() => import('./pages/vendor/DashboardPage'));
const VendorProducts   = lazy(() => import('./pages/vendor/ProductsPage'));
const VendorAddProduct = lazy(() => import('./pages/vendor/AddProductPage'));
const VendorOrders     = lazy(() => import('./pages/vendor/OrdersPage'));
const VendorAnalytics  = lazy(() => import('./pages/vendor/AnalyticsPage'));
const VendorKYC        = lazy(() => import('./pages/vendor/KYCPage'));
const VendorSettings   = lazy(() => import('./pages/vendor/SettingsPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const AdminUsers     = lazy(() => import('./pages/admin/UsersPage'));
const AdminVendors   = lazy(() => import('./pages/admin/VendorsPage'));
const AdminProducts  = lazy(() => import('./pages/admin/ProductsPage'));
const AdminOrders    = lazy(() => import('./pages/admin/OrdersPage'));
const AdminCategories= lazy(() => import('./pages/admin/CategoriesPage'));
const AdminCoupons   = lazy(() => import('./pages/admin/CouponsPage'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="light" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="vendor/:slug" element={<VendorStore />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="verify-email/:token" element={<VerifyEmail />} />

          {/* Customer protected routes */}
          <Route element={<ProtectedRoute roles={['customer', 'vendor', 'admin']} />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Vendor routes */}
        <Route path="/vendor" element={<ProtectedRoute roles={['vendor']} />}>
          <Route element={<VendorLayout />}>
            <Route index element={<Navigate to="/vendor/dashboard" replace />} />
            <Route path="dashboard"   element={<VendorDashboard />} />
            <Route path="products"    element={<VendorProducts />} />
            <Route path="products/add" element={<VendorAddProduct />} />
            <Route path="products/edit/:id" element={<VendorAddProduct />} />
            <Route path="orders"      element={<VendorOrders />} />
            <Route path="analytics"   element={<VendorAnalytics />} />
            <Route path="kyc"         element={<VendorKYC />} />
            <Route path="settings"    element={<VendorSettings />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="users"      element={<AdminUsers />} />
            <Route path="vendors"    element={<AdminVendors />} />
            <Route path="products"   element={<AdminProducts />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons"    element={<AdminCoupons />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
