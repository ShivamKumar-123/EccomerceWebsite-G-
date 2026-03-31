/**
 * Size / variant picker for products with `sizeVariants: [{ size, stock }]`.
 */
export default function ProductSizeSelect({ product, value, onChange, className = '' }) {
  const variants = product?.sizeVariants;
  if (!Array.isArray(variants) || variants.length === 0) return null;
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ||
        'w-full text-xs rounded-lg border border-slate-300 bg-white text-slate-900 px-2 py-2 outline-none focus:ring-2 focus:ring-violet-500 dark:border-white/15 dark:bg-slate-800/90 dark:text-white'
      }
    >
      <option value="">Select size</option>
      {variants.map((v) => (
        <option key={String(v.size)} value={String(v.size)}>
          {v.size}
          {Number.isFinite(Number(v.stock)) ? ` · ${v.stock} left` : ''}
        </option>
      ))}
    </select>
  );
}
