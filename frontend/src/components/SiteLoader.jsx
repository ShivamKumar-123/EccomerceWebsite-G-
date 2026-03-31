/**
 * Inline loading state aligned with GoldyMart (violet / fuchsia / amber).
 */
export default function SiteLoader({ message = 'Loading storefront…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-5 py-16 sm:py-24 ${className}`} role="status" aria-live="polite">
      <div className="relative h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]">
        <div
          className="absolute inset-0 rounded-full border-[3px] border-violet-200 dark:border-violet-500/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-fuchsia-500 border-r-violet-500 animate-spin"
          style={{ animationDuration: '0.9s' }}
          aria-hidden
        />
        <div
          className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-amber-400 border-l-violet-400 animate-spin"
          style={{ animationDuration: '1.25s', animationDirection: 'reverse' }}
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="text-lg font-black bg-gradient-to-br from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            G
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
    </div>
  );
}
