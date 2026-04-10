import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, UserPlus, Sparkles, Zap } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

const SignupPage = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useUserAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.signup-card',
        { opacity: 0, y: 36, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.signup-bg-blob',
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

  const trimBlur = (field) => () => {
    setFormData((prev) => ({ ...prev, [field]: String(prev[field] || '').trim() }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Fill all required fields.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Invalid email.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    const result = await signup({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Signup failed');
    }

    setIsLoading(false);
  };

  const fieldWrap = (focusClass, shadowClass) =>
    `group flex min-h-[3.5rem] items-center gap-4 rounded-xl border border-white/10 bg-black/40 px-4 py-2 transition-all duration-300 focus-within:bg-black/60 ${focusClass} ${shadowClass}`;

  return (
    <div
      ref={pageRef}
      className="relative isolate flex min-h-screen min-h-[100dvh] items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-10 [color-scheme:dark] sm:py-14"
    >
      <style>{`
        @keyframes signup-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -6%) scale(1.08); }
        }
        @keyframes signup-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, 8%) scale(1.06); }
        }
        @keyframes signup-blob-3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-45%, -5%) scale(1.12); }
        }
        @keyframes signup-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <div className="fixed inset-0 bg-[#030306]" />

      <div
        className="signup-bg-blob pointer-events-none fixed -left-[20%] top-[-15%] h-[55vh] w-[55vh] rounded-full opacity-90 blur-[100px] sm:h-[70vh] sm:w-[70vh]"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.45), transparent 55%)',
          animation: 'signup-blob-1 14s ease-in-out infinite',
        }}
      />
      <div
        className="signup-bg-blob pointer-events-none fixed -right-[15%] bottom-[-20%] h-[50vh] w-[50vh] rounded-full opacity-80 blur-[90px] sm:h-[65vh] sm:w-[65vh]"
        style={{
          background: 'radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.4), transparent 50%)',
          animation: 'signup-blob-2 18s ease-in-out infinite',
        }}
      />
      <div
        className="signup-bg-blob pointer-events-none fixed left-1/2 top-1/2 h-[40vh] w-[min(90vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25), transparent 65%)',
          animation: 'signup-blob-3 20s ease-in-out infinite',
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="signup-card relative z-10 w-full max-w-[440px]">
        <Link to="/" className="group mb-8 flex flex-col items-center gap-5 sm:mb-9">
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
              Join the store — free to sign up.
            </p>
          </div>
        </Link>

        <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-400/30 via-fuchsia-500/25 to-cyan-400/30 p-[1px] shadow-[0_0_60px_-12px_rgba(251,191,36,0.35)]">
          <div className="rounded-[calc(1.5rem-1px)] bg-zinc-950/90 px-6 py-7 shadow-inner backdrop-blur-2xl sm:px-8 sm:py-9">
            <div className="mb-5 flex items-center gap-2 sm:mb-6">
              <Zap className="h-5 w-5 text-fuchsia-400" fill="currentColor" fillOpacity={0.2} />
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Sign up</h2>
            </div>

            {error ? (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-200 backdrop-blur-sm"
              >
                {error}
              </div>
            ) : null}

            <form noValidate onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div className="space-y-1.5">
                <label htmlFor="su-name" className="text-xs font-semibold text-zinc-400">
                  Full name <span className="text-amber-400/90">*</span>
                </label>
                <div
                  className={fieldWrap(
                    'focus-within:border-amber-400/40',
                    'focus-within:shadow-[0_0_24px_-4px_rgba(251,191,36,0.25)]'
                  )}
                >
                  <User className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-focus-within:text-amber-400/90" />
                  <input
                    id="su-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={trimBlur('name')}
                    className="min-h-[2.5rem] min-w-0 flex-1 border-0 bg-transparent py-1 pl-3 pr-2 text-[15px] leading-normal text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="su-email" className="text-xs font-semibold text-zinc-400">
                  Email <span className="text-amber-400/90">*</span>
                </label>
                <div
                  className={fieldWrap(
                    'focus-within:border-cyan-400/40',
                    'focus-within:shadow-[0_0_24px_-4px_rgba(34,211,238,0.2)]'
                  )}
                >
                  <Mail className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-focus-within:text-cyan-300/90" />
                  <input
                    id="su-email"
                    type="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={trimBlur('email')}
                    className="min-h-[2.5rem] min-w-0 flex-1 border-0 bg-transparent py-1 pl-3 pr-2 text-[15px] leading-normal text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="su-phone" className="text-xs font-semibold text-zinc-400">
                  Phone <span className="text-zinc-600">(optional)</span>
                </label>
                <div
                  className={fieldWrap(
                    'focus-within:border-violet-400/35',
                    'focus-within:shadow-[0_0_24px_-4px_rgba(167,139,250,0.18)]'
                  )}
                >
                  <Phone className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-focus-within:text-violet-300/90" />
                  <input
                    id="su-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={trimBlur('phone')}
                    className="min-h-[2.5rem] min-w-0 flex-1 border-0 bg-transparent py-1 pl-3 pr-2 text-[15px] leading-normal text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="su-password" className="text-xs font-semibold text-zinc-400">
                  Password <span className="text-amber-400/90">*</span>
                </label>
                <div
                  className={fieldWrap(
                    'focus-within:border-fuchsia-400/40',
                    'focus-within:shadow-[0_0_24px_-4px_rgba(192,132,252,0.2)]'
                  )}
                >
                  <Lock className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-focus-within:text-fuchsia-300/90" />
                  <input
                    id="su-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="min-h-[2.5rem] min-w-0 flex-1 border-0 bg-transparent py-1 pl-3 pr-1 text-[15px] leading-normal text-white outline-none"
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

              <div className="space-y-1.5">
                <label htmlFor="su-confirm" className="text-xs font-semibold text-zinc-400">
                  Confirm password <span className="text-amber-400/90">*</span>
                </label>
                <div
                  className={fieldWrap(
                    'focus-within:border-emerald-400/35',
                    'focus-within:shadow-[0_0_24px_-4px_rgba(52,211,153,0.18)]'
                  )}
                >
                  <Lock className="h-5 w-5 shrink-0 text-zinc-500 transition-colors group-focus-within:text-emerald-300/90" />
                  <input
                    id="su-confirm"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="min-h-[2.5rem] min-w-0 flex-1 border-0 bg-transparent py-1 pl-3 pr-2 text-[15px] leading-normal text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative mt-5 h-14 w-full overflow-hidden rounded-xl font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400"
                  style={{
                    backgroundSize: '200% auto',
                    animation: isLoading ? 'none' : 'signup-shimmer 3s linear infinite',
                  }}
                />
                <span className="relative flex items-center justify-center gap-2 text-[15px] tracking-wide">
                  {isLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" strokeWidth={2.25} />
                      Create account
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">or</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <Link
              to="/login"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-cyan-400/35 hover:bg-cyan-500/10 hover:text-cyan-100"
            >
              Already have an account? Sign in
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

export default SignupPage;
