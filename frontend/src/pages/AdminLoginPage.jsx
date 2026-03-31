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
      className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4 relative"
    >
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[28rem] h-[28rem] bg-fuchsia-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-[24rem] h-[24rem] bg-cyan-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="login-card relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl shadow-violet-900/40 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Admin</h1>
          <p className="text-gray-600 mt-2 text-sm">
            {hasApi ? (
              <span className="inline-flex items-center gap-1.5 justify-center flex-wrap">
                <Server size={14} className="text-violet-600" />
                Django superuser (same as{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">init_admin</code>)
              </span>
            ) : (
              'Set VITE_API_URL in .env.development and run the Django server.'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Login to dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2 text-gray-500 text-xs">
          {hasApi ? (
            <p>
              Default: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">admin / admin123</span> after{' '}
              <span className="font-mono">python manage.py init_admin</span>
            </p>
          ) : (
            <p className="text-amber-700 bg-amber-50 rounded-lg py-2 px-3">
              Create <code className="text-xs">frontend/.env.development</code> with{' '}
              <code className="text-xs">VITE_API_URL=http://127.0.0.1:8000</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
