import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Shield, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canCallApi } from '../services/productsApi';
import { obtainJwtPair, persistJwtTokens } from '../services/authApi';
import ThemeToggle from '../components/ThemeToggle';

const AdminLoginPage = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { login, loginWithBackend, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.login-card',
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (canCallApi()) {
        const { access, refresh } = await obtainJwtPair(
          credentials.username.trim(),
          credentials.password
        );
        persistJwtTokens(access, refresh);
        loginWithBackend(credentials.username.trim(), credentials.username.trim());
        navigate('/admin/dashboard');
        return;
      }

      const result = login(credentials.username, credentials.password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const hasApi = Boolean(canCallApi());

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 p-4 [color-scheme:dark]"
    >
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-20 top-20 h-[28rem] w-[28rem] rounded-full bg-secondary-500/10 blur-[100px]" />
        <div className="absolute bottom-20 left-20 h-[24rem] w-[24rem] rounded-full bg-secondary-500/5 blur-[100px]" />
      </div>

      <div className="login-card relative w-full max-w-md rounded-3xl border border-white/10 bg-primary-900/95 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 text-primary-950 shadow-lg shadow-black/40">
            <Shield size={40} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Store Admin</h1>
          <p className="mt-2 text-sm text-primary-400">
            {hasApi ? (
              <span className="inline-flex flex-wrap items-center justify-center gap-1.5">
                <Server size={14} className="text-secondary-500" />
                Sign in with your admin account
              </span>
            ) : (
              'Set VITE_API_URL in .env.development and run the Django server.'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/15 bg-primary-950 py-3 pl-12 pr-4 text-white placeholder:text-primary-500 focus:border-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500/40"
                placeholder="Username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/15 bg-primary-950 py-3 pl-12 pr-12 text-white placeholder:text-primary-500 focus:border-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500/40"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cta py-4 font-bold text-cta-fg shadow-lg shadow-black/30 transition-all hover:scale-[1.01] hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Login to dashboard'}
          </button>
        </form>

        {!hasApi ? (
          <div className="mt-6 text-center text-xs text-primary-400">
            <p className="rounded-lg border border-secondary-500/30 bg-secondary-500/10 px-3 py-2 text-secondary-200">
              Create <code className="text-xs">frontend/.env.development</code> with{' '}
              <code className="text-xs">VITE_API_URL=http://127.0.0.1:8000</code>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminLoginPage;
