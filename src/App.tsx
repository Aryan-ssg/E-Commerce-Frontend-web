import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminLayout from './pages/admin/AdminLayout';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Catalog />} />
              <Route path="/categories" element={<Categories />} />
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute requireRoles={['ADMIN']}>
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="users" replace />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>
            </Routes>
</main>

          <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-brand text-xs font-bold text-white">
                    S
                  </span>
                  <span className="text-sm font-semibold text-text">Shop</span>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-secondary">
                  <a href="/" className="transition-colors hover:text-text">Products</a>
                  <a href="/categories" className="transition-colors hover:text-text">Categories</a>
                  <a href="/cart" className="transition-colors hover:text-text">Cart</a>
                  <a href="/orders" className="transition-colors hover:text-text">Orders</a>
                </nav>
                <p className="m-0 text-xs text-text-muted">
                  &copy; {new Date().getFullYear()} Shop &middot; Built with Spring Boot & React
                </p>
              </div>
            </div>
          </footer>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
