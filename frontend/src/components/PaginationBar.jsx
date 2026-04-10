import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @param {{
 *   currentPage: number,
 *   totalPages: number,
 *   onPageChange: (page: number) => void,
 *   totalCount?: number,
 *   pageSize?: number,
 *   className?: string,
 *   labels?: { prev?: string, next?: string },
 * }} props
 */
export default function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
  className = '',
  labels = {},
}) {
  if (totalPages <= 1) return null;

  const prev = labels.prev ?? 'Previous';
  const next = labels.next ?? 'Next';
  const safe = Math.min(Math.max(1, Math.floor(currentPage) || 1), totalPages);
  const start = totalCount != null && pageSize != null ? (safe - 1) * pageSize + 1 : null;
  const end =
    totalCount != null && pageSize != null ? Math.min(safe * pageSize, totalCount) : null;

  const windowSize = 5;
  let from = Math.max(1, safe - Math.floor(windowSize / 2));
  let to = Math.min(totalPages, from + windowSize - 1);
  if (to - from + 1 < windowSize) from = Math.max(1, to - windowSize + 1);
  const numbers = [];
  for (let i = from; i <= to; i += 1) numbers.push(i);

  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 border-t border-stone-200/70 pt-6 dark:border-white/10 sm:flex-row ${className}`}
    >
      <p className="text-center text-xs text-stone-500 dark:text-stone-400 sm:text-left">
        Page <span className="font-bold text-stone-800 dark:text-stone-200">{safe}</span> of{' '}
        <span className="font-bold text-stone-800 dark:text-stone-200">{totalPages}</span>
        {start != null && end != null && totalCount != null ? (
          <span className="text-stone-400">
            {' '}
            · {start}–{end} of {totalCount}
          </span>
        ) : null}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={safe <= 1}
          onClick={() => onPageChange(safe - 1)}
          className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition-all hover:border-primary-400 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-stone-800 dark:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {prev}
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {numbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 text-xs font-bold transition-colors ${
                n === safe
                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={safe >= totalPages}
          onClick={() => onPageChange(safe + 1)}
          className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition-all hover:border-primary-400 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-stone-800 dark:text-white"
        >
          {next}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
