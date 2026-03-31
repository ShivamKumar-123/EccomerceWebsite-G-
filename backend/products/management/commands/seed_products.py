from decimal import Decimal

from django.core.management.base import BaseCommand

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

# Each product row: (title, price, image, badge, rating) or + (size_variants list)
SEED = [
    ("rice-mills", "Rice Mills", [
        ("3 HP Mini Rice Mill (Model: 6N-4DSV)", 34999, "https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=400", "Best Seller", 4.8),
        ("3 HP Mini Rice Mill (Model: 6W50)", 32999, "https://images.pexels.com/photos/4483774/pexels-photo-4483774.jpeg?auto=compress&cs=tinysrgb&w=400", "Popular", 4.7),
        ("7 HP Petrol Engine Mini Rice Mill", 45999, "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=400", "Premium", 4.9),
        ("3 HP Mini Rice Mill (Model: 6N-4V)", 29999, "https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=400", "", 4.6),
        ("3 HP Mini Rice Mill (Model: 6N40)", 27999, "https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=400", "New", 4.8),
    ]),
    ("food-processing", "Food Processing", [
        ("2 HP Sugarcane Juicer Machine", 38999, "https://images.pexels.com/photos/5945848/pexels-photo-5945848.jpeg?auto=compress&cs=tinysrgb&w=400", "Popular", 4.5),
        ("HEAVYTECH Oil Machine S10", 52999, "https://images.pexels.com/photos/4483608/pexels-photo-4483608.jpeg?auto=compress&cs=tinysrgb&w=400", "", 4.7),
        ("HEAVYTECH Oil Machine K38", 48999, "https://images.pexels.com/photos/3735149/pexels-photo-3735149.jpeg?auto=compress&cs=tinysrgb&w=400", "Best Seller", 4.8),
        ("HEAVYTECH Oil Machine S9S", 42999, "https://images.pexels.com/photos/4483775/pexels-photo-4483775.jpeg?auto=compress&cs=tinysrgb&w=400", "", 4.6),
        ("HEAVYTECH Oil Machine K28S", 39999, "https://images.pexels.com/photos/2933244/pexels-photo-2933244.jpeg?auto=compress&cs=tinysrgb&w=400", "", 4.5),
        ("HEAVYTECH Oil Machine K18", 35999, "https://images.pexels.com/photos/4483609/pexels-photo-4483609.jpeg?auto=compress&cs=tinysrgb&w=400", "", 4.7),
        ("HEAVYTECH Oil Machine T6", 28999, "https://images.pexels.com/photos/3735157/pexels-photo-3735157.jpeg?auto=compress&cs=tinysrgb&w=400", "Premium", 4.9),
    ]),
    ("agriculture", "Agriculture", []),
    ("water-pumps", "Water Pumps", []),
    ("industrial", "Industrial", []),
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
    ("spare-parts", "Spare Parts", []),
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
                    },
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

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
                f"Done. New products: {created}, updated: {updated}, new banners: {banners_created}"
            )
        )
