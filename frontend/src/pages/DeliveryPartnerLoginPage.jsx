import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { canCallApi } from '../services/productsApi';
import {
  getPartnerAccessToken,
  loginDeliveryPartner,
  fetchPartnerAccount,
} from '../services/deliveryPartnerApi';
import ThemeToggle from '../components/ThemeToggle';

export default function DeliveryPartnerLoginPage() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/delivery-dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getPartnerAccessToken()) {
        if (!cancelled) setChecking(false);
        return;
      }
      try {
        const acc = await fetchPartnerAccount();
        if (!cancelled && acc.is_delivery_partner) {
          navigate(from, { replace: true });
          return;
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!canCallApi()) {
      setError('API not reachable. Run Django and use dev proxy or set VITE_API_URL.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginDeliveryPartner(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 dark:bg-dark">
        <p className="text-sm text-stone-600 dark:text-stone-400">Loading…</p>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-900 via-primary-950 to-stone-950 p-4"
    >
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <SEOHead
        title="Partner login — Goldy Mart"
        description="Delivery partner sign-in"
        url="https://www.goldymart.com/partner-login"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-stone-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-600 text-white shadow-lg">
            <Truck size={32} />
          </div>
          <h1 className="text-2xl font-black text-white">Delivery partner</h1>
          <p className="mt-2 text-sm text-stone-400">Sign in with the email and password sent after approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-300">Email (username)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full rounded-xl border border-white/10 bg-stone-950 py-3 pl-11 pr-4 text-white placeholder:text-stone-600 focus:border-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500/30"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full rounded-xl border border-white/10 bg-stone-950 py-3 pl-11 pr-12 text-white placeholder:text-stone-600 focus:border-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-secondary-600 to-secondary-800 py-3.5 font-bold text-white shadow-lg transition-all hover:brightness-105 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Open delivery dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500">
          <Link to="/delivery-partner" className="text-secondary-400 hover:underline">
            Apply to become a partner
          </Link>
          <span className="mx-2 text-stone-600">·</span>
          <Link to="/" className="text-stone-400 hover:text-white">
            Store home
          </Link>
        </p>
      </div>
    </div>
  );
}
