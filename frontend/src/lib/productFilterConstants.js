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
  return PRESET_COLORS.find((o) => o.id === id)?.label || id.replace(/_/g, ' ');
}
