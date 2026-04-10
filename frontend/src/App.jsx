import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute, GuestRoute, PartnerRoute, PartnerGuestRoute } from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import LoadingScreen from './components/LoadingScreen';
import SiteLoader from './components/SiteLoader';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const ShoesPage = lazy(() => import('./pages/ShoesPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const DeliveryPartnerPage = lazy(() => import('./pages/DeliveryPartnerPage'));
const DeliveryPartnerLoginPage = lazy(() => import('./pages/DeliveryPartnerLoginPage'));
const DeliveryPartnerDashboard = lazy(() => import('./pages/DeliveryPartnerDashboard'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-background px-4 dark:bg-dark">
      <SiteLoader message="Loading page…" />
    </div>
  );
}

function SuspenseWrap({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      <AuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <FavoritesProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<GuestRoute><SuspenseWrap><LoginPage /></SuspenseWrap></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><SuspenseWrap><SignupPage /></SuspenseWrap></GuestRoute>} />

                <Route path="/admin" element={<SuspenseWrap><AdminLoginPage /></SuspenseWrap>} />
                <Route path="/admin/dashboard" element={<AdminRoute><SuspenseWrap><AdminDashboard /></SuspenseWrap></AdminRoute>} />

                <Route path="/" element={<Layout><SuspenseWrap><HomePage /></SuspenseWrap></Layout>} />
                <Route path="/products" element={<Layout><SuspenseWrap><ProductsPage /></SuspenseWrap></Layout>} />
                <Route path="/product/:id" element={<Layout><SuspenseWrap><ProductDetailPage /></SuspenseWrap></Layout>} />
                <Route path="/shoes" element={<Layout><SuspenseWrap><ShoesPage /></SuspenseWrap></Layout>} />
                <Route path="/cart" element={<Layout><SuspenseWrap><CartPage /></SuspenseWrap></Layout>} />
                <Route path="/favorites" element={<Layout><SuspenseWrap><FavoritesPage /></SuspenseWrap></Layout>} />
                <Route path="/checkout" element={<Layout><SuspenseWrap><CheckoutPage /></SuspenseWrap></Layout>} />
                <Route path="/track-order" element={<Layout><SuspenseWrap><TrackOrderPage /></SuspenseWrap></Layout>} />
                <Route path="/about" element={<Layout><SuspenseWrap><AboutPage /></SuspenseWrap></Layout>} />
                <Route path="/contact" element={<Layout><SuspenseWrap><ContactPage /></SuspenseWrap></Layout>} />
                <Route path="/delivery-partner" element={<Layout><SuspenseWrap><DeliveryPartnerPage /></SuspenseWrap></Layout>} />
                <Route
                  path="/partner-login"
                  element={
                    <SuspenseWrap>
                      <PartnerGuestRoute>
                        <DeliveryPartnerLoginPage />
                      </PartnerGuestRoute>
                    </SuspenseWrap>
                  }
                />
                <Route
                  path="/delivery-dashboard"
                  element={
                    <SuspenseWrap>
                      <PartnerRoute>
                        <DeliveryPartnerDashboard />
                      </PartnerRoute>
                    </SuspenseWrap>
                  }
                />

                <Route path="/services" element={<ProtectedRoute><Layout><SuspenseWrap><ServicesPage /></SuspenseWrap></Layout></ProtectedRoute>} />
                <Route path="/blog" element={<ProtectedRoute><Layout><SuspenseWrap><BlogPage /></SuspenseWrap></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Layout><SuspenseWrap><ProfilePage /></SuspenseWrap></Layout></ProtectedRoute>} />
              </Routes>
            </Router>
            </FavoritesProvider>
          </CartProvider>
        </UserAuthProvider>
      </AuthProvider>
    </>
  );
}

export default App;
