import { effectiveSizeVariantsForProduct } from '../lib/productSizeDefaults';

/**
 * Size / variant picker for products with `sizeVariants: [{ size, stock }]`.
 * Uses effective sizes (defaults for fashion/footwear when API has none).
 * When `reserveSpace` is true (default), keeps a fixed min-height when there is no size row.
 */
export default function ProductSizeSelect({
  product,
  value,
  onChange,
  className = '',
  reserveSpace = true,
}) {
  const variants = effectiveSizeVariantsForProduct(product);
  const hasVariants = variants.length > 0;

  const selectClass =
    className ||
    'w-full rounded-lg border border-white/15 bg-primary-950 px-2 py-1.5 text-[11px] text-white outline-none focus:ring-2 focus:ring-secondary-500/40';

  const control = hasVariants ? (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={selectClass}>
      <option value="">Select size</option>
      {variants.map((v) => (
        <option key={String(v.size)} value={String(v.size)}>
          {v.size}
          {Number.isFinite(Number(v.stock)) ? ` · ${v.stock} left` : ''}
        </option>
      ))}
    </select>
  ) : null;

  if (!reserveSpace) return control;

  return (
    <div
      className="flex min-h-[2.25rem] shrink-0 flex-col justify-end"
      aria-hidden={!hasVariants ? true : undefined}
    >
      {control}
    </div>
  );
}
