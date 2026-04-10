/** Age group slugs — must match backend ALLOWED_AGE_SLUGS */
export const AGE_GROUP_OPTIONS = [
  { id: 'kids', label: 'Kids (0–12 years)' },
  { id: 'teens', label: 'Teens (13–19 years)' },
  { id: 'young_adults', label: 'Young Adults (20–30 years)' },
  { id: 'adults', label: 'Adults (31–45 years)' },
  { id: 'mature_adults', label: 'Mature Adults (46+ years)' },
];

/** Gender slugs — must match backend ALLOWED_GENDER_SLUGS */
export const GENDER_OPTIONS = [
  { id: 'boys', label: 'Boys' },
  { id: 'girls', label: 'Girls' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'unisex', label: 'Unisex' },
];

/** Suggested colors (merged with API facets on Products page) */
export const PRESET_COLORS = [
  { id: 'black', label: 'Black' },
  { id: 'white', label: 'White' },
  { id: 'red', label: 'Red' },
  { id: 'blue', label: 'Blue' },
  { id: 'navy', label: 'Navy' },
  { id: 'green', label: 'Green' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'pink', label: 'Pink' },
  { id: 'purple', label: 'Purple' },
  { id: 'brown', label: 'Brown' },
  { id: 'grey', label: 'Grey' },
  { id: 'beige', label: 'Beige' },
  { id: 'orange', label: 'Orange' },
  { id: 'multicolor', label: 'Multicolor' },
];

export const RATING_OPTIONS = [
  { id: '4', label: '4★ & above', value: 4 },
  { id: '3', label: '3★ & above', value: 3 },
  { id: '2', label: '2★ & above', value: 2 },
];

export function labelForAge(id) {
  return AGE_GROUP_OPTIONS.find((o) => o.id === id)?.label || id;
}

export function labelForGender(id) {
  return GENDER_OPTIONS.find((o) => o.id === id)?.label || id;
}

export function labelForColor(id) {
  const slug = String(id || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return PRESET_COLORS.find((o) => o.id === slug)?.label || slug.replace(/_/g, ' ');
}

/** Hex / CSS for circular swatches on product detail (unknown slugs → neutral grey). */
const COLOR_HEX = {
  black: '#1c1917',
  white: '#fafaf9',
  red: '#dc2626',
  blue: '#2563eb',
  navy: '#1e3a5f',
  green: '#16a34a',
  yellow: '#eab308',
  pink: '#ec4899',
  purple: '#9333ea',
  brown: '#78350f',
  grey: '#78716c',
  gray: '#78716c',
  beige: '#d6d3cd',
  orange: '#ea580c',
  multicolor: null,
  silver: '#9ca3af',
  gold: '#ca8a04',
  tan: '#b45309',
  cream: '#f5f5dc',
  maroon: '#7f1d1d',
  teal: '#0d9488',
  coral: '#fb7185',
  olive: '#4d7c0f',
};

/** @param {string} slug */
export function swatchStyleForColor(slug) {
  const id = String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (id === 'multicolor') {
    return {
      background: 'linear-gradient(135deg,#ef4444 0%,#eab308 33%,#22c55e 66%,#3b82f6 100%)',
    };
  }
  const hex = COLOR_HEX[id];
  if (hex) return { backgroundColor: hex };
  return { backgroundColor: '#a8a29e' };
}
