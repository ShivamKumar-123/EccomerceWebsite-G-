/** Shoe type slugs — must match backend SHOE_CATEGORY_SLUGS / Category.slug */
export const SHOE_TYPE_OPTIONS = [
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'sports-shoes', label: 'Sports Shoes' },
  { id: 'casual-shoes', label: 'Casual Shoes' },
  { id: 'formal-shoes', label: 'Formal Shoes' },
  { id: 'boots', label: 'Boots' },
  { id: 'sandals', label: 'Sandals' },
];

export const SHOE_GENDER_OPTIONS = [
  { id: 'boys', label: 'Boys (Kids)' },
  { id: 'girls', label: 'Girls (Kids)' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'unisex', label: 'Unisex' },
];

/** API age_group tokens (includes aliases expanded server-side). */
export const SHOE_AGE_OPTIONS = [
  { id: 'kids', label: 'Kids (0–12)' },
  { id: 'teens', label: 'Teens (13–19)' },
  { id: 'adults_20_40', label: 'Adults (20–40)' },
  { id: 'adults_40_plus', label: '40+ Adults' },
];

export const UK_SIZE_PRESETS = ['3', '4', '5', '6', '7', '8', '9', '10', '11'].map((n) => `UK ${n}`);

export const SHOE_COLOR_OPTIONS = [
  { id: 'black', label: 'Black' },
  { id: 'white', label: 'White' },
  { id: 'blue', label: 'Blue' },
  { id: 'red', label: 'Red' },
  { id: 'brown', label: 'Brown' },
];

export const DISCOUNT_TIER_OPTIONS = [
  { id: '10', label: '10%+ off', value: 10 },
  { id: '25', label: '25%+ off', value: 25 },
  { id: '50', label: '50%+ off', value: 50 },
];

export const SORT_OPTIONS = [
  { id: '', label: 'Relevance (name)' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Popularity' },
  { id: 'new_arrivals', label: 'New Arrivals' },
  { id: 'top_rated', label: 'Top Rated' },
];

export const RATING_FILTER_OPTIONS = [
  { id: '', label: 'Any rating' },
  { id: '4', label: '4★ & above', value: 4 },
  { id: '3', label: '3★ & above', value: 3 },
];

export function labelShoeType(id) {
  return SHOE_TYPE_OPTIONS.find((o) => o.id === id)?.label || id;
}

export function labelShoeAge(id) {
  return SHOE_AGE_OPTIONS.find((o) => o.id === id)?.label || id;
}

export function labelShoeGender(id) {
  return SHOE_GENDER_OPTIONS.find((o) => o.id === id)?.label || id;
}

export function labelShoeColor(id) {
  return SHOE_COLOR_OPTIONS.find((o) => o.id === id)?.label || id.replace(/_/g, ' ');
}
