from decimal import Decimal

from django.core.management.base import BaseCommand

from products.catalog_constants import SHOE_CATEGORY_SLUGS
from products.models import Banner, Category, Product
from products.services.product_service import normalize_size_variants

# Default stock when product has no size breakdown
DEFAULT_STOCK = 25

# Typical apparel sizes (inventory per size)
APPAREL_SIZES = [
    {"size": "S", "stock": 10},
    {"size": "M", "stock": 20},
    {"size": "L", "stock": 18},
    {"size": "XL", "stock": 14},
    {"size": "XXL", "stock": 8},
]

KIDS_SIZES = [
    {"size": "2-3Y", "stock": 12},
    {"size": "4-5Y", "stock": 15},
    {"size": "6-7Y", "stock": 14},
    {"size": "8-9Y", "stock": 10},
    {"size": "10-11Y", "stock": 8},
]

SHOE_SIZES = [
    {"size": "UK 7", "stock": 6},
    {"size": "UK 8", "stock": 10},
    {"size": "UK 9", "stock": 12},
    {"size": "UK 10", "stock": 10},
    {"size": "UK 11", "stock": 5},
]

UK_SIZES_FULL = [{"size": f"UK {n}", "stock": 5 + (n % 6)} for n in range(3, 12)]

# Dedicated footwear catalogue (slug must be in SHOE_CATEGORY_SLUGS)
SHOE_SEED = [
    {
        "slug": "sneakers",
        "name": "Nike Revolution 6 Running Sneaker",
        "price": 4299,
        "image": "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400",
        "badge": "Sale",
        "rating": 4.7,
        "brand": "Nike",
        "discount_percent": 25,
        "genders": ["men"],
        "age_groups": ["young_adults", "adults"],
        "colors": ["black"],
    },
    {
        "slug": "sneakers",
        "name": "Adidas Lite Racer Casual Sneaker",
        "price": 3199,
        "image": "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&w=400",
        "badge": "New",
        "rating": 4.5,
        "brand": "Adidas",
        "discount_percent": 10,
        "genders": ["women", "unisex"],
        "age_groups": ["teens", "young_adults"],
        "colors": ["white"],
    },
    {
        "slug": "sports-shoes",
        "name": "Puma Softride Pro Training Shoe",
        "price": 3799,
        "image": "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&w=400",
        "badge": "Best Seller",
        "rating": 4.6,
        "brand": "Puma",
        "discount_percent": 15,
        "genders": ["men"],
        "age_groups": ["young_adults", "adults"],
        "colors": ["blue"],
    },
    {
        "slug": "sports-shoes",
        "name": "Reebok Zig Dynamica Athletic",
        "price": 2899,
        "image": "https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&w=400",
        "badge": "",
        "rating": 4.3,
        "brand": "Reebok",
        "discount_percent": 0,
        "genders": ["women"],
        "age_groups": ["adults"],
        "colors": ["red"],
    },
    {
        "slug": "casual-shoes",
        "name": "Woodland Leather Casual Loafer",
        "price": 3499,
        "image": "https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&w=400",
        "badge": "",
        "rating": 4.5,
        "brand": "Woodland",
        "discount_percent": 20,
        "genders": ["men"],
        "age_groups": ["adults", "mature_adults"],
        "colors": ["brown"],
    },
    {
        "slug": "casual-shoes",
        "name": "Bata Comfit Walk Casual",
        "price": 1299,
        "image": "https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&w=400",
        "badge": "Popular",
        "rating": 4.2,
        "brand": "Bata",
        "discount_percent": 5,
        "genders": ["unisex"],
        "age_groups": ["teens", "young_adults", "adults"],
        "colors": ["black"],
    },
    {
        "slug": "formal-shoes",
        "name": "Bata Black Formal Oxford",
        "price": 2199,
        "image": "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&w=400",
        "badge": "Office",
        "rating": 4.4,
        "brand": "Bata",
        "discount_percent": 0,
        "genders": ["men"],
        "age_groups": ["adults", "mature_adults"],
        "colors": ["black"],
    },
    {
        "slug": "formal-shoes",
        "name": "Woodland Premium Tan Brogue",
        "price": 4599,
        "image": "https://images.pexels.com/photos/267294/pexels-photo-267294.jpeg?auto=compress&w=400",
        "badge": "",
        "rating": 4.6,
        "brand": "Woodland",
        "discount_percent": 30,
        "genders": ["men"],
        "age_groups": ["young_adults", "adults"],
        "colors": ["brown"],
    },
    {
        "slug": "boots",
        "name": "Woodland High Ankle Trek Boot",
        "price": 5299,
        "image": "https://images.pexels.com/photos/755992/pexels-photo-755992.jpeg?auto=compress&w=400",
        "badge": "Trending",
        "rating": 4.7,
        "brand": "Woodland",
        "discount_percent": 12,
        "genders": ["men", "unisex"],
        "age_groups": ["adults", "mature_adults"],
        "colors": ["brown"],
    },
    {
        "slug": "boots",
        "name": "Nike Manoa Leather Boot",
        "price": 6899,
        "image": "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&w=400",
        "badge": "New",
        "rating": 4.5,
        "brand": "Nike",
        "discount_percent": 50,
        "genders": ["men"],
        "age_groups": ["young_adults", "adults"],
        "colors": ["black"],
    },
    {
        "slug": "sandals",
        "name": "Bata Comfort Floaters",
        "price": 899,
        "image": "https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&w=400",
        "badge": "Summer",
        "rating": 4.1,
        "brand": "Bata",
        "discount_percent": 10,
        "genders": ["men", "unisex"],
        "age_groups": ["kids", "teens", "adults"],
        "colors": ["brown"],
    },
    {
        "slug": "sandals",
        "name": "Adidas Adilette Comfort Slide",
        "price": 1499,
        "image": "https://images.pexels.com/photos/1319516/pexels-photo-1319516.jpeg?auto=compress&w=400",
        "badge": "",
        "rating": 4.4,
        "brand": "Adidas",
        "discount_percent": 0,
        "genders": ["women", "unisex"],
        "age_groups": ["teens", "young_adults"],
        "colors": ["white"],
    },
]

# Each product row: (title, price, image, badge, rating) or + (size_variants list)
SEED = [
    (
        "electronics",
        "Electronics",
        [
            ("Noise-cancel Bluetooth Headphones Pro", 4999, "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&w=400", "Trending", 4.6),
            ("Smart Fitness Band OLED", 2499, "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&w=400", "New", 4.4),
            ("USB-C Fast Charger 65W", 1299, "https://images.pexels.com/photos/163117/keyboard-full-clean-workspace-163117.jpeg?auto=compress&w=400", "", 4.5),
            ("Wireless Mouse Ergonomic", 799, "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&w=400", "Sale", 4.3),
            ("Portable Bluetooth Speaker 20W", 2199, "https://images.pexels.com/photos/1646704/pexels-photo-1646704.jpeg?auto=compress&w=400", "", 4.5),
        ],
    ),
    (
        "fashion",
        "Fashion",
        [
            ("Cotton Slim Fit Casual Shirt", 899, "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&w=400", "Sale", 4.3, APPAREL_SIZES),
            ("Denim Jacket Classic Blue", 2199, "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&w=400", "", 4.5, APPAREL_SIZES),
            ("Running Shoes Air Lite", 3499, "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400", "Best Seller", 4.7, SHOE_SIZES),
            ("Women's Floral Summer Top", 699, "https://images.pexels.com/photos/985384/pexels-photo-985384.jpeg?auto=compress&w=400", "New", 4.4, APPAREL_SIZES),
        ],
    ),
    (
        "clothes",
        "Clothing & Apparel",
        [
            (
                "Men's Formal Shirt — Premium Cotton",
                1499,
                "https://images.pexels.com/photos/2968681/pexels-photo-2968681.jpeg?auto=compress&w=400",
                "Office",
                4.6,
                APPAREL_SIZES,
            ),
            (
                "Women's Embroidered Kurti",
                1299,
                "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&w=400",
                "Ethnic",
                4.7,
                APPAREL_SIZES,
            ),
            (
                "Kids Cotton T-Shirt (Pack of 2)",
                499,
                "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&w=400",
                "Kids",
                4.5,
                KIDS_SIZES,
            ),
            (
                "Men's Slim Fit Jeans — Dark Blue",
                1899,
                "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&w=400",
                "",
                4.4,
                APPAREL_SIZES,
            ),
            (
                "Hooded Sweatshirt Unisex",
                1599,
                "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&w=400",
                "Winter",
                4.6,
                APPAREL_SIZES,
            ),
            (
                "Sports Track Pants",
                999,
                "https://images.pexels.com/photos/7679729/pexels-photo-7679729.jpeg?auto=compress&w=400",
                "Gym",
                4.3,
                APPAREL_SIZES,
            ),
        ],
    ),
    (
        "home-kitchen",
        "Home & Kitchen",
        [
            ("Non-stick Cookware Set 5pc", 3299, "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&w=400", "", 4.5),
            ("LED Table Lamp Dimmable", 1499, "https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&w=400", "New", 4.4),
            ("Stainless Steel Dinner Set 24pc", 2499, "https://images.pexels.com/photos/6220889/pexels-photo-6220889.jpeg?auto=compress&w=400", "", 4.5),
        ],
    ),
    (
        "beauty",
        "Beauty & Care",
        [
            ("Vitamin C Face Serum 30ml", 599, "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&w=400", "Popular", 4.6),
            ("Herbal Shampoo 400ml", 349, "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&w=400", "", 4.4),
        ],
    ),
    (
        "sports",
        "Sports & Fitness",
        [
            ("Yoga Mat Premium 6mm", 999, "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&w=400", "", 4.5),
            ("Steel Water Bottle 1L", 449, "https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&w=400", "", 4.3),
            ("Adjustable Dumbbells 10kg Pair", 2999, "https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400", "New", 4.6),
        ],
    ),
    (
        "books",
        "Books",
        [
            ("The India Story — Hardcover", 699, "https://images.pexels.com/photos/762686/pexels-photo-762686.jpeg?auto=compress&w=400", "", 4.8),
            ("Python Programming Guide", 499, "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&w=400", "", 4.7),
        ],
    ),
]

BANNER_SEED = [
    (
        "Mega deals on electronics",
        "Headphones, chargers & more — limited time offers.",
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
        "/products?category=electronics",
        "from-fuchsia-600 to-purple-800",
        0,
    ),
    (
        "Fashion & lifestyle",
        "Fresh styles for every season. Easy returns.",
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
        "/products?category=fashion",
        "from-rose-600 to-orange-600",
        1,
    ),
    (
        "Clothing — sizes for everyone",
        "Shirts, kurtis, jeans & kids wear with size-wise stock.",
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80",
        "/products?category=clothes",
        "from-violet-600 to-indigo-800",
        2,
    ),
]


def _unpack_product_row(row):
    if len(row) == 6:
        return row[0], row[1], row[2], row[3], row[4], row[5]
    return row[0], row[1], row[2], row[3], row[4], []


def demographics_for(category_slug, title):
    """Match migration 0006 logic for storefront filters."""
    name_l = (title or "").lower()
    age, gen, col, brand = [], [], [], ""

    if category_slug in ("fashion", "clothes"):
        if "kids" in name_l or name_l.startswith("kid "):
            age = ["kids"]
            gen = ["boys", "girls"]
        elif any(
            x in name_l
            for x in ("women", "ladies", "kurti", "floral", "summer top", "embroidered")
        ):
            age = ["teens", "young_adults", "adults"]
            gen = ["women"]
        elif any(x in name_l for x in ("men's", "men ", "shirt", "jeans", "formal")):
            age = ["young_adults", "adults", "mature_adults"]
            gen = ["men"]
        elif "unisex" in name_l or "hooded" in name_l:
            age = ["teens", "young_adults", "adults"]
            gen = ["unisex"]
        else:
            age = ["young_adults", "adults"]
            gen = ["men", "women"]
        col = ["navy"] if any(x in name_l for x in ("blue", "denim", "dark")) else ["black"]
        brand = "UrbanFit"
    elif category_slug == "beauty":
        age = ["teens", "young_adults", "adults", "mature_adults"]
        gen = ["women", "men", "unisex"]
        col = ["white"]
        brand = "GlowCare"
    elif category_slug == "electronics":
        gen = ["unisex"]
        col = ["black"]
        brand = "TechLine"
    elif category_slug in SHOE_CATEGORY_SLUGS:
        age = ["young_adults", "adults"]
        gen = ["men", "women", "unisex"]
        col = ["black"]
        brand = "Stride"
    else:
        gen = ["unisex"]
        col = ["beige"]
        brand = "GoldyMart"

    return {
        "age_groups": age,
        "genders": gen,
        "brand": brand,
        "colors": col,
    }


class Command(BaseCommand):
    help = "Create categories and sample products (idempotent; updates size variants on re-run)."

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for slug, name, items in SEED:
            cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
            for row in items:
                title, amount, image, badge, rating, raw_variants = _unpack_product_row(row)
                variants = normalize_size_variants(raw_variants)
                stock = sum(v["stock"] for v in variants) if variants else DEFAULT_STOCK
                demo = demographics_for(slug, title)
                obj, was_created = Product.objects.update_or_create(
                    category=cat,
                    name=title,
                    defaults={
                        "price": Decimal(str(amount)),
                        "stock": stock,
                        "image": image,
                        "badge": badge,
                        "rating": Decimal(str(rating)),
                        "size_variants": variants,
                        **demo,
                    },
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

        for slug in SHOE_CATEGORY_SLUGS:
            Category.objects.get_or_create(
                slug=slug,
                defaults={"name": slug.replace("-", " ").title()},
            )

        shoe_created = 0
        shoe_updated = 0
        for row in SHOE_SEED:
            cat = Category.objects.get(slug=row["slug"])
            variants = normalize_size_variants(UK_SIZES_FULL)
            stock = sum(v["stock"] for v in variants)
            obj, was_created = Product.objects.update_or_create(
                category=cat,
                name=row["name"],
                defaults={
                    "price": Decimal(str(row["price"])),
                    "stock": stock,
                    "image": row["image"],
                    "badge": row.get("badge") or "",
                    "rating": Decimal(str(row["rating"])),
                    "size_variants": variants,
                    "age_groups": row.get("age_groups") or [],
                    "genders": row.get("genders") or [],
                    "brand": row.get("brand") or "",
                    "colors": row.get("colors") or [],
                    "discount_percent": int(row.get("discount_percent") or 0),
                },
            )
            if was_created:
                shoe_created += 1
            else:
                shoe_updated += 1

        banners_created = 0
        for title, desc, image, link, grad, order in BANNER_SEED:
            _, was_b = Banner.objects.get_or_create(
                title=title,
                defaults={
                    "description": desc,
                    "image": image,
                    "link": link,
                    "bg_gradient": grad,
                    "sort_order": order,
                    "is_active": True,
                },
            )
            if was_b:
                banners_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. New products: {created}, updated: {updated}; "
                f"footwear new: {shoe_created}, updated: {shoe_updated}; "
                f"new banners: {banners_created}"
            )
        )
