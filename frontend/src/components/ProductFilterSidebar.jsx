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
    <div className="mb-4 border-b border-white/10 pb-4 last:mb-0 last:border-0 last:pb-0">
      <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-secondary-500">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxRow({ checked, onChange, label, id }) {
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
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-primary-900/95 shadow-modern backdrop-blur-xl">
      {showHeader && (
        <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-r from-primary-950 to-primary-900 px-4 py-3.5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <SlidersHorizontal size={18} className="text-secondary-500" />
            Filters
          </div>
          <div className="flex items-center gap-2">
            {hasSelection && (
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
              <p className="text-xs text-primary-400">No brands in this result set</p>
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
              <p className="text-xs text-primary-400">No sizes for current category</p>
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
              <p className="text-xs text-primary-400">No colors in this result set</p>
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
              <label className="text-[10px] font-semibold uppercase text-primary-400">Min</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={minPrice}
                onChange={(e) => onPriceChange('min', e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-white/10 bg-primary-950 px-2.5 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase text-primary-400">Max</label>
              <input
                type="number"
                min={0}
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => onPriceChange('max', e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-white/10 bg-primary-950 px-2.5 py-2 text-sm text-white"
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
