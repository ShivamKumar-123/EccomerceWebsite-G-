import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ShoppingBag } from 'lucide-react';

const STORE = 'GoldyMart';

const LoadingScreen = ({ onLoadingComplete }) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            if (onLoadingComplete) onLoadingComplete();
          }, 450);
          return 100;
        }
        return prev + Math.random() * 14 + 6;
      });
    }, 140);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  const shell = isDark
    ? 'bg-gradient-to-br from-[#0c0a14] via-violet-950/40 to-[#0c0a14]'
    : 'bg-gradient-to-br from-slate-50 via-violet-50/80 to-fuchsia-50';

  const gridColor = isDark ? 'rgba(167, 139, 250, 0.12)' : 'rgba(139, 92, 246, 0.15)';
  const particleClass = isDark ? 'bg-fuchsia-400/35' : 'bg-violet-500/40';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${shell} ${
        progress >= 100 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className={`absolute h-1.5 w-1.5 rounded-full ${particleClass}`}
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animation: `gmFloat ${3 + (i % 5) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(i % 8) * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 text-center">
        <div className="relative mx-auto mb-8 flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-violet-500/20 dark:border-violet-400/20"
            aria-hidden
          />
          <svg viewBox="0 0 120 120" className="absolute h-full w-full -rotate-90" aria-hidden>
            <defs>
              <linearGradient id="gmLoadRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#gmLoadRing)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(Math.min(progress, 100) / 100) * 339.3} 339.3`}
              className="transition-all duration-300"
            />
          </svg>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/90 to-fuchsia-600/90 shadow-lg shadow-violet-900/40 ring-2 ring-white/20 dark:ring-white/10">
            <ShoppingBag className="h-10 w-10 text-white" strokeWidth={1.75} />
          </div>
        </div>

        <h1
          className={`mb-1 text-3xl font-black tracking-tight sm:text-4xl ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
            {STORE}
          </span>
        </h1>
        <p className={`mb-8 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Your marketplace — loading catalogue &amp; deals
        </p>

        <div className="mx-auto w-52 sm:w-64">
          <div
            className={`h-2 overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-violet-100'}`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-violet-600 dark:text-fuchsia-300">
            {Math.min(Math.round(progress), 100)}%
          </p>
        </div>

        <p
          className={`mt-4 text-xs sm:text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'} animate-pulse`}
        >
          Preparing your shopping experience…
        </p>
      </div>

      <style>{`
        @keyframes gmFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.35; }
          33% { transform: translate(8px, -14px); opacity: 0.6; }
          66% { transform: translate(-6px, -8px); opacity: 0.45; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
