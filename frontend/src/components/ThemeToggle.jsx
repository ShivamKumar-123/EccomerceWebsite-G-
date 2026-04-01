import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/** @param {{ className?: string, scrolled?: boolean }} props */
export default function ThemeToggle({ className = '', scrolled = true }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const base =
    'p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ' +
    (scrolled
      ? 'text-stone-700 hover:bg-stone-200/90 dark:text-stone-200 dark:hover:bg-white/10'
      : 'text-white hover:bg-white/15 dark:text-white dark:hover:bg-white/10');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${base} ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
