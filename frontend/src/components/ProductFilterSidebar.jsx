import { SlidersHorizontal, X } from 'lucide-react';
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  PRESET_COLORS,
  RATING_OPTIONS,
  labelForColor,
} from '../lib/productFilterConstants';

function Section({ title, children }) {
  return (
    <div className="border-b border-stone-200 dark:border-white/10 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <h3 className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxRow({ checked, onChange, label, id }) {
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
 *   ages: string[],
 *   genders: string[],
 *   brands: string[],
 *   colors: string[],
 *   sizes: string[],
 *   minPrice: string,
 *   maxPrice: string,
 *   minRating: string,
 *   onToggleAge: (id: string, on: boolean) => void,
 *   onToggleGender: (id: string, on: boolean) => void,
 *   onToggleBrand: (id: string, on: boolean) => void,
 *   onToggleColor: (id: string, on: boolean) => void,
 *   onToggleSize: (id: string, on: boolean) => void,
 *   onPriceChange: (field: 'min'|'max', value: string) => void,
 *   onRatingChange: (value: string) => void,
 *   onClear: () => void,
 *   onCloseMobile?: () => void,
 *   showHeader?: boolean,
 * }} props
 */
export default function ProductFilterSidebar({
  facets,
  ages,
  genders,
  brands,
  colors,
  sizes,
  minPrice,
  maxPrice,
  minRating,
  onToggleAge,
  onToggleGender,
  onToggleBrand,
  onToggleColor,
  onToggleSize,
  onPriceChange,
  onRatingChange,
  onClear,
  onCloseMobile,
  showHeader = true,
}) {
  const colorOptionsMap = new Map(PRESET_COLORS.map((c) => [c.id, c.label]));
  (facets.colors || []).forEach((c) => {
    if (!colorOptionsMap.has(c)) colorOptionsMap.set(c, labelForColor(c));
  });
  const colorIds = [...colorOptionsMap.keys()].sort((a, b) => a.localeCompare(b));

  const hasSelection =
    ages.length > 0 ||
    genders.length > 0 ||
    brands.length > 0 ||
    colors.length > 0 ||
    sizes.length > 0 ||
    String(minPrice || '').trim() !== '' ||
    String(maxPrice || '').trim() !== '' ||
    String(minRating || '').trim() !== '';

  return (
    <div className="bg-white dark:bg-stone-900/95 border border-stone-200/90 dark:border-white/10 rounded-2xl shadow-soft overflow-hidden">
      {showHeader && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-stone-200 dark:border-white/10 bg-stone-50/80 dark:bg-stone-800/50">
          <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white text-sm">
            <SlidersHorizontal size={18} className="text-emerald-700 dark:text-emerald-400" />
            Filters
          </div>
          <div className="flex items-center gap-2">
            {hasSelection && (
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
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <Section title="Age group">
          <div className="space-y-0.5">
            {AGE_GROUP_OPTIONS.map((o) => (
              <CheckboxRow
                key={o.id}
                id={`age-${o.id}`}
                label={o.label}
                checked={ages.includes(o.id)}
                onChange={(on) => onToggleAge(o.id, on)}
              />
            ))}
          </div>
        </Section>

        <Section title="Gender">
          <div className="space-y-0.5">
            {GENDER_OPTIONS.map((o) => (
              <CheckboxRow
                key={o.id}
                id={`gender-${o.id}`}
                label={o.label}
                checked={genders.includes(o.id)}
                onChange={(on) => onToggleGender(o.id, on)}
              />
            ))}
          </div>
        </Section>

        <Section title="Brand">
          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {(facets.brands || []).length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400">No brands in this result set</p>
            ) : (
              facets.brands.map((b) => (
                <CheckboxRow
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

        <Section title="Size">
          <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
            {(facets.sizes || []).length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400">No sizes for current category</p>
            ) : (
              facets.sizes.map((s) => (
                <CheckboxRow
                  key={s}
                  id={`size-${s}`}
                  label={s}
                  checked={sizes.includes(s)}
                  onChange={(on) => onToggleSize(s, on)}
                />
              ))
            )}
          </div>
        </Section>

        <Section title="Color">
          <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
            {colorIds.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400">No colors in this result set</p>
            ) : (
              colorIds.map((cid) => (
                <CheckboxRow
                  key={cid}
                  id={`color-${cid}`}
                  label={colorOptionsMap.get(cid) || cid}
                  checked={colors.includes(cid)}
                  onChange={(on) => onToggleColor(cid, on)}
                />
              ))
            )}
          </div>
        </Section>

        <Section title="Price (₹)">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Min</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={minPrice}
                onChange={(e) => onPriceChange('min', e.target.value)}
                className="mt-0.5 w-full px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm dark:bg-stone-800 dark:border-white/10 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Max</label>
              <input
                type="number"
                min={0}
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => onPriceChange('max', e.target.value)}
                className="mt-0.5 w-full px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm dark:bg-stone-800 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>
        </Section>

        <Section title="Customer ratings">
          <div className="space-y-0.5">
            <CheckboxRow
              id="rating-any"
              label="Any rating"
              checked={!minRating}
              onChange={(on) => {
                if (on) onRatingChange('');
              }}
            />
            {RATING_OPTIONS.map((o) => (
              <CheckboxRow
                key={o.id}
                id={`rating-${o.id}`}
                label={o.label}
                checked={minRating === String(o.value)}
                onChange={(on) => {
                  if (on) onRatingChange(String(o.value));
                  else if (minRating === String(o.value)) onRatingChange('');
                }}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
