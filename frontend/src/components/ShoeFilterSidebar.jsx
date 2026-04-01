import { SlidersHorizontal, X } from 'lucide-react';
import {
  SHOE_TYPE_OPTIONS,
  SHOE_GENDER_OPTIONS,
  SHOE_AGE_OPTIONS,
  UK_SIZE_PRESETS,
  SHOE_COLOR_OPTIONS,
  DISCOUNT_TIER_OPTIONS,
  RATING_FILTER_OPTIONS,
  SORT_OPTIONS,
} from '../lib/shoeConstants';

function Section({ title, children }) {
  return (
    <div className="border-b border-stone-200 dark:border-white/10 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <h3 className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer text-sm text-stone-800 dark:text-stone-200"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-500/50 dark:border-stone-600 dark:bg-stone-800"
      />
      <span>{label}</span>
    </label>
  );
}

/**
 * @param {{
 *   facets: { brands: string[], sizes: string[], colors: string[] },
 *   bounds: { min: number, max: number },
 *   types: string[],
 *   genders: string[],
 *   ages: string[],
 *   brands: string[],
 *   colors: string[],
 *   sizes: string[],
 *   discounts: string[],
 *   minPrice: string,
 *   maxPrice: string,
 *   minRating: string,
 *   ordering: string,
 *   priceSliderMin: number,
 *   priceSliderMax: number,
 *   onToggleType: (id: string, on: boolean) => void,
 *   onToggleGender: (id: string, on: boolean) => void,
 *   onToggleAge: (id: string, on: boolean) => void,
 *   onToggleBrand: (id: string, on: boolean) => void,
 *   onToggleColor: (id: string, on: boolean) => void,
 *   onToggleSize: (id: string, on: boolean) => void,
 *   onToggleDiscount: (id: string, on: boolean) => void,
 *   onPriceSlider: (min: number, max: number) => void,
 *   onRatingChange: (value: string) => void,
 *   onSortChange: (value: string) => void,
 *   onClear: () => void,
 *   onCloseMobile?: () => void,
 *   showHeader?: boolean,
 * }} props
 */
export default function ShoeFilterSidebar({
  facets,
  bounds,
  types,
  genders,
  ages,
  brands,
  colors,
  sizes,
  discounts,
  minRating,
  ordering,
  priceSliderMin,
  priceSliderMax,
  onToggleType,
  onToggleGender,
  onToggleAge,
  onToggleBrand,
  onToggleColor,
  onToggleSize,
  onToggleDiscount,
  onPriceSlider,
  onRatingChange,
  onSortChange,
  onClear,
  onCloseMobile,
  showHeader = true,
}) {
  const bmin = Number.isFinite(bounds.min) ? Math.floor(bounds.min) : 0;
  const bmax = Number.isFinite(bounds.max) ? Math.ceil(bounds.max) : 20000;

  const sizeOptions = [...new Set([...UK_SIZE_PRESETS, ...(facets.sizes || [])])].sort((a, b) => {
    const na = parseInt(String(a).replace(/\D/g, ''), 10) || 0;
    const nb = parseInt(String(b).replace(/\D/g, ''), 10) || 0;
    return na - nb || a.localeCompare(b);
  });

  const colorIds = [...new Set([...SHOE_COLOR_OPTIONS.map((c) => c.id), ...(facets.colors || [])])].sort();

  const hasSel =
    types.length > 0 ||
    genders.length > 0 ||
    ages.length > 0 ||
    brands.length > 0 ||
    colors.length > 0 ||
    sizes.length > 0 ||
    discounts.length > 0 ||
    minRating ||
    ordering;

  return (
    <div className="bg-white dark:bg-stone-900/95 border border-stone-200/90 dark:border-white/10 rounded-2xl shadow-soft overflow-hidden">
      {showHeader && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-stone-200 dark:border-white/10 bg-stone-50/80 dark:bg-stone-800/50">
          <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white text-sm">
            <SlidersHorizontal size={18} className="text-emerald-700 dark:text-emerald-400" />
            Shoe filters
          </div>
          <div className="flex items-center gap-2">
            {hasSel && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                Clear all
              </button>
            )}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-white/10 lg:hidden"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <Section title="Category">
          <div className="space-y-0.5">
            {SHOE_TYPE_OPTIONS.map((o) => (
              <Row
                key={o.id}
                id={`stype-${o.id}`}
                label={o.label}
                checked={types.includes(o.id)}
                onChange={(on) => onToggleType(o.id, on)}
              />
            ))}
          </div>
        </Section>

        <Section title="Sort by">
          <select
            value={ordering}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 dark:bg-stone-800 dark:border-white/10 dark:text-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id || 'default'} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Section>

        <Section title="Brand">
          <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {(facets.brands || []).length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400">No brands in catalogue</p>
            ) : (
              facets.brands.map((b) => (
                <Row
                  key={b}
                  id={`brand-${b}`}
                  label={b}
                  checked={brands.includes(b)}
                  onChange={(on) => onToggleBrand(b, on)}
                />
              ))
            )}
          </div>
        </Section>

        <Section title="Gender">
          <div className="space-y-0.5">
            {SHOE_GENDER_OPTIONS.map((o) => (
              <Row
                key={o.id}
                id={`gen-${o.id}`}
                label={o.label}
                checked={genders.includes(o.id)}
                onChange={(on) => onToggleGender(o.id, on)}
              />
            ))}
          </div>
        </Section>

        <Section title="Age group">
          <div className="space-y-0.5">
            {SHOE_AGE_OPTIONS.map((o) => (
              <Row
                key={o.id}
                id={`age-${o.id}`}
                label={o.label}
                checked={ages.includes(o.id)}
                onChange={(on) => onToggleAge(o.id, on)}
              />
            ))}
          </div>
        </Section>

        <Section title="UK size">
          <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {sizeOptions.map((s) => (
              <Row
                key={s}
                id={`sz-${s}`}
                label={s}
                checked={sizes.includes(s)}
                onChange={(on) => onToggleSize(s, on)}
              />
            ))}
          </div>
        </Section>

        <Section title={`Price (₹) — ${bmin.toLocaleString('en-IN')} – ${bmax.toLocaleString('en-IN')}`}>
          <div className="space-y-3">
            <div className="flex gap-3 items-center">
              <label className="flex-1 text-[10px] font-semibold text-stone-500 uppercase">
                Min
                <input
                  type="range"
                  min={bmin}
                  max={bmax}
                  step={50}
                  value={Math.min(Math.max(priceSliderMin, bmin), bmax)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const hi = Math.max(priceSliderMax, v);
                    onPriceSlider(v, hi >= v ? hi : v);
                  }}
                  className="w-full mt-1 accent-emerald-700"
                />
              </label>
              <label className="flex-1 text-[10px] font-semibold text-stone-500 uppercase">
                Max
                <input
                  type="range"
                  min={bmin}
                  max={bmax}
                  step={50}
                  value={Math.min(Math.max(priceSliderMax, bmin), bmax)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const lo = Math.min(priceSliderMin, v);
                    onPriceSlider(lo <= v ? lo : v, v);
                  }}
                  className="w-full mt-1 accent-emerald-700"
                />
              </label>
            </div>
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 text-center tabular-nums">
              ₹{Math.min(priceSliderMin, priceSliderMax).toLocaleString('en-IN')} – ₹
              {Math.max(priceSliderMin, priceSliderMax).toLocaleString('en-IN')}
            </p>
          </div>
        </Section>

        <Section title="Color">
          <div className="space-y-0.5">
            {colorIds.map((cid) => (
              <Row
                key={cid}
                id={`col-${cid}`}
                label={SHOE_COLOR_OPTIONS.find((c) => c.id === cid)?.label || cid}
                checked={colors.includes(cid)}
                onChange={(on) => onToggleColor(cid, on)}
              />
            ))}
          </div>
        </Section>

        <Section title="Discount">
          <div className="space-y-0.5">
            {DISCOUNT_TIER_OPTIONS.map((o) => (
              <Row
                key={o.id}
                id={`disc-${o.id}`}
                label={o.label}
                checked={discounts.includes(o.id)}
                onChange={(on) => onToggleDiscount(o.id, on)}
              />
            ))}
          </div>
        </Section>

        <Section title="Rating">
          <div className="space-y-2">
            {RATING_FILTER_OPTIONS.map((o) => (
              <label
                key={o.id || 'any'}
                htmlFor={`rate-${o.id || 'any'}`}
                className="flex items-center gap-2.5 py-1 px-1 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer text-sm text-stone-800 dark:text-stone-200"
              >
                <input
                  id={`rate-${o.id || 'any'}`}
                  type="radio"
                  name="shoe-min-rating"
                  checked={o.id === '' ? !minRating : minRating === String(o.value)}
                  onChange={() => onRatingChange(o.id === '' ? '' : String(o.value))}
                  className="h-4 w-4 border-stone-300 text-emerald-700 focus:ring-emerald-500/50 dark:border-stone-600"
                />
                {o.label}
              </label>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
