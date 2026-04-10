import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

function isValidShopperEmail(raw) {
  const s = String(raw || '').trim();
  if (!s) return false;
  const ats = s.match(/@/g);
  if (!ats || ats.length !== 1) return false;
  const [local, domain] = s.split('@');
  if (!local || !domain) return false;
  if (domain.includes('@')) return false;
  return /^[^\s]+$/.test(s);
}

const LoginPage = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useUserAuth();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.login-card',
        { opacity: 0, y: 36, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.login-bg-blob',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', stagger: 0.12 }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleEmailBlur = () => {
    setFormData((prev) => ({ ...prev, email: prev.email.trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const email = formData.email.trim();
    if (!email || !formData.password) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    if (!isValidShopperEmail(email)) {
      setError('Invalid email. Use a single address (one @).');
      setIsLoading(false);
      return;
    }

    const result = await login(email, formData.password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div
      ref={pageRef}
      className="relative isolate flex min-h-screen min-h-[100dvh] items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-12 [color-scheme:dark] sm:py-16"
    >
      <style>{`
        @keyframes login-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -6%) scale(1.08); }
        }
        @keyframes login-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, 8%) scale(1.06); }
        }
        @keyframes login-blob-3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-45%, -5%) scale(1.12); }
        }
        @keyframes login-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* Base */}
      <div className="fixed inset-0 bg-[#030306]" />

      {/* Mesh / aurora */}
      <div
        className="login-bg-blob pointer-events-none fixed -left-[20%] top-[-15%] h-[55vh] w-[55vh] rounded-full opacity-90 blur-[100px] sm:h-[70vh] sm:w-[70vh]"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.45), transparent 55%)',
          animation: 'login-blob-1 14s ease-in-out infinite',
        }}
      />
      <div
        className="login-bg-blob pointer-events-none fixed -right-[15%] bottom-[-20%] h-[50vh] w-[50vh] rounded-full opacity-80 blur-[90px] sm:h-[65vh] sm:w-[65vh]"
        style={{
          background: 'radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.4), transparent 50%)',
          animation: 'login-blob-2 18s ease-in-out infinite',
        }}
      />
      <div
        className="login-bg-blob pointer-events-none fixed left-1/2 top-1/2 h-[40vh] w-[min(90vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25), transparent 65%)',
          animation: 'login-blob-3 20s ease-in-out infinite',
        }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="login-card relative z-10 w-full max-w-[440px]">
        {/* Brand strip */}
        <Link
          to="/"
          className="group mb-8 flex flex-col items-center gap-5 sm:mb-10"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 opacity-60 blur-lg transition-opacity group-hover:opacity-90" />
            <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-black shadow-2xl ring-1 ring-white/20">
              <Sparkles className="h-9 w-9 text-amber-300" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
              Goldy Mart
            </h1>
            <p className="mt-2 bg-gradient-to-r from-amber-200/90 via-white to-cyan-200/80 bg-clip-text text-sm font-medium text-transparent">
              Premium picks. One account.
            </p>
          </div>
        </Link>

        {/* Gradient border shell */}
        <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-400/30 via-fuchsia-500/25 to-cyan-400/30 p-[1px] shadow-[0_0_60px_-12px_rgba(251,191,36,0.35)]">
          <div className="rounded-[calc(1.5rem-1px)] bg-zinc-950/90 px-6 py-8 shadow-inner backdrop-blur-2xl sm:px-8 sm:py-10">
            <div className="mb-6 flex items-center gap-2 sm:mb-8">
              <Zap className="h-5 w-5 text-amber-400" fill="currentColor" fillOpacity={0.2} />
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Sign in</h2>
            </div>

            {error ? (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-200 backdrop-blur-sm"
              >
                {error}
              </div>
            ) : null}

            <form noValidate onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-xs font-semibold tracking-wide text-zinc-400">
                  Email
                </label>
                <div className="group flex h-14 items-center gap-4 rounded-xl border border-white/10 bg-black/40 px-4 transition-all duration-300 focus-within:border-amber-400/40 focus-within:bg-black/60 focus-within:shadow-[0_0_24px_-4px_rgba(251,191,36,0.25)]">
                  <Mail className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-focus-within:text-amber-400/90" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent py-1 pl-3 pr-2 text-[15px] leading-normal text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-xs font-semibold tracking-wide text-zinc-400">
                  Password
                </label>
                <div className="group flex h-14 items-center gap-4 rounded-xl border border-white/10 bg-black/40 px-4 transition-all duration-300 focus-within:border-fuchsia-400/40 focus-within:bg-black/60 focus-within:shadow-[0_0_24px_-4px_rgba(192,132,252,0.2)]">
                  <Lock className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-focus-within:text-fuchsia-300/90" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent py-1 pl-3 pr-1 text-[15px] leading-normal text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative mt-2 h-14 w-full overflow-hidden rounded-xl font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400"
                  style={{
                    backgroundSize: '200% auto',
                    animation: isLoading ? 'none' : 'login-shimmer 3s linear infinite',
                  }}
                />
                <span className="relative flex items-center justify-center gap-2 text-[15px] tracking-wide">
                  {isLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                  ) : (
                    <>
                      Enter store
                      <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">or</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <Link
              to="/signup"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-cyan-400/35 hover:bg-cyan-500/10 hover:text-cyan-100"
            >
              New here? Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
          <Link to="/admin" className="text-zinc-500 transition-colors hover:text-amber-300/90">
            Admin
          </Link>
          <Link to="/" className="font-medium text-zinc-400 transition-colors hover:text-white">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
