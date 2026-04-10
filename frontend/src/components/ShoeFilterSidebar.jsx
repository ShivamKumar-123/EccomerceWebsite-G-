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
    <div className="mb-4 border-b border-white/10 pb-4 last:mb-0 last:border-0 last:pb-0">
      <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-secondary-500">{title}</h3>
      {children}
    </div>
  );
}

function Row({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-1 py-2 text-sm text-white/90 transition-colors hover:bg-white/8"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-primary-900 text-secondary-600 focus:ring-secondary-500/50"
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
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-primary-900/95 shadow-modern backdrop-blur-xl">
      {showHeader && (
        <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-r from-primary-950 to-primary-900 px-4 py-3.5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <SlidersHorizontal size={18} className="text-secondary-500" />
            Shoe filters
          </div>
          <div className="flex items-center gap-2">
            {hasSel && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold text-secondary-400 hover:text-secondary-300"
              >
                Clear all
              </button>
            )}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
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
            className="w-full rounded-xl border border-white/10 bg-primary-950 px-3 py-2.5 text-sm text-white"
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
              <p className="text-xs text-primary-400">No brands in catalogue</p>
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
              <label className="flex-1 text-[10px] font-semibold uppercase text-primary-400">
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
                  className="mt-1 w-full accent-secondary-500"
                />
              </label>
              <label className="flex-1 text-[10px] font-semibold uppercase text-primary-400">
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
                  className="mt-1 w-full accent-secondary-500"
                />
              </label>
            </div>
            <p className="text-center text-xs font-semibold tabular-nums text-primary-400">
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
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-white/90 hover:bg-white/8"
              >
                <input
                  id={`rate-${o.id || 'any'}`}
                  type="radio"
                  name="shoe-min-rating"
                  checked={o.id === '' ? !minRating : minRating === String(o.value)}
                  onChange={() => onRatingChange(o.id === '' ? '' : String(o.value))}
                  className="h-4 w-4 border-white/20 text-secondary-600 focus:ring-secondary-500/50"
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
