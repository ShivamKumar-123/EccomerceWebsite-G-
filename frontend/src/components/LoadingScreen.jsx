import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ShoppingBag } from 'lucide-react';

const STORE = 'Goldy Mart';

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
    ? 'bg-gradient-to-br from-dark via-primary-950/50 to-dark'
    : 'bg-gradient-to-br from-stone-50 via-primary-50/60 to-amber-50/70';

  const gridColor = isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(22, 101, 52, 0.12)';
  const particleClass = isDark ? 'bg-primary-400/35' : 'bg-primary-600/30';

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
            className="absolute inset-0 rounded-full border-2 border-primary-500/20 dark:border-primary-400/20"
            aria-hidden
          />
          <svg viewBox="0 0 120 120" className="absolute h-full w-full -rotate-90" aria-hidden>
            <defs>
              <linearGradient id="gmLoadRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4338ca" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#d97706" />
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
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-700/95 to-primary-600/95 shadow-lg shadow-primary-900/35 ring-2 ring-amber-400/25 dark:ring-white/10">
            <ShoppingBag className="h-10 w-10 text-white" strokeWidth={1.75} />
          </div>
        </div>

        <h1
          className={`mb-1 text-3xl font-extrabold tracking-tight sm:text-4xl ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}
        >
          <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-amber-600 bg-clip-text text-transparent">
            {STORE}
          </span>
        </h1>
        <p className={`mb-8 text-sm sm:text-base ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
          Your marketplace — loading catalogue &amp; deals
        </p>

        <div className="mx-auto w-52 sm:w-64">
          <div
            className={`h-2 overflow-hidden rounded-full ${isDark ? 'bg-stone-800' : 'bg-primary-100'}`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-amber-500 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-primary-700 dark:text-primary-300">
            {Math.min(Math.round(progress), 100)}%
          </p>
        </div>

        <p
          className={`mt-4 text-xs sm:text-sm ${isDark ? 'text-stone-500' : 'text-stone-500'} animate-pulse`}
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
