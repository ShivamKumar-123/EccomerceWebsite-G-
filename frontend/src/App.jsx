import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ServicesPage from './pages/ServicesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      <AuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Guest Routes - Only accessible when NOT logged in */}
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                
                {/* Public storefront (catalogue + cart + checkout use Django API) */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
                <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
                <Route path="/track-order" element={<Layout><TrackOrderPage /></Layout>} />
                <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

                <Route path="/services" element={<ProtectedRoute><Layout><ServicesPage /></Layout></ProtectedRoute>} />
                <Route path="/blog" element={<ProtectedRoute><Layout><BlogPage /></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
              </Routes>
            </Router>
          </CartProvider>
        </UserAuthProvider>
      </AuthProvider>
    </>
  );
}

export default App;
