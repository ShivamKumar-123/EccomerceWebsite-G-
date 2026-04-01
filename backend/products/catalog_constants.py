"""Storefront catalogue constants (footwear, etc.)."""

from __future__ import annotations

# Slugs for shoe-type categories — must match Category.slug in DB / seed.
SHOE_CATEGORY_SLUGS = (
    "sneakers",
    "sports-shoes",
    "casual-shoes",
    "formal-shoes",
    "boots",
    "sandals",
)

# Request param aliases → real age_groups stored on products (OR match per alias bucket).
SHOE_AGE_GROUP_ALIASES = {
    "adults_20_40": ("young_adults", "adults"),
    "adults_40_plus": ("adults", "mature_adults"),
}
