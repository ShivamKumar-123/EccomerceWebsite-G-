"""Query param parsing and Product queryset filters for storefront listing."""

from decimal import Decimal, InvalidOperation

from django.db.models import Max, Min, Q

from products.catalog_constants import SHOE_AGE_GROUP_ALIASES, SHOE_CATEGORY_SLUGS


def split_multi_params(request, key: str, *, alt_key: str | None = None) -> list[str]:
    raw = request.query_params.getlist(key)
    if not raw and alt_key:
        v = request.query_params.get(alt_key)
        if v:
            raw = [v]
    out: list[str] = []
    for part in raw:
        for x in str(part).split(","):
            s = x.strip()
            if s:
                out.append(s)
    seen: set[str] = set()
    deduped: list[str] = []
    for s in out:
        k = s.lower()
        if k not in seen:
            seen.add(k)
            deduped.append(s.strip())
    return deduped


def truthy_param(request, key: str) -> bool:
    v = (request.query_params.get(key) or "").strip().lower()
    return v in ("1", "true", "yes", "on")


def apply_category_filters(qs, request):
    """Single `category` slug, multi `categories`, or footwear=1 (all shoe slugs)."""
    footwear = truthy_param(request, "footwear")
    multi = split_multi_params(request, "categories", alt_key="category_slugs")
    single = (request.query_params.get("category") or "").strip()

    if footwear:
        shoe_set = set(SHOE_CATEGORY_SLUGS)
        if multi:
            wanted = [s.strip() for s in multi if s.strip() in shoe_set]
            if wanted:
                return qs.filter(category__slug__in=wanted)
        return qs.filter(category__slug__in=list(shoe_set))

    if multi:
        return qs.filter(category__slug__in=[s.strip() for s in multi if s.strip()])

    if single:
        return qs.filter(category__slug=single)

    return qs


def apply_discount_filters(qs, request):
    """discounts=10,25 → product matches if discount_percent meets any threshold (OR)."""
    raw = split_multi_params(request, "discount", alt_key="discounts")
    thresholds: list[int] = []
    for x in raw:
        try:
            n = int(float(str(x).strip()))
            if 1 <= n <= 100:
                thresholds.append(n)
        except (TypeError, ValueError):
            continue
    if not thresholds:
        return qs
    q = Q()
    for t in thresholds:
        q |= Q(discount_percent__gte=t)
    return qs.filter(q)


def apply_demographic_filters(qs, request):
    ages = [a.strip().lower().replace(" ", "_").replace("-", "_") for a in split_multi_params(request, "age_group", alt_key="age_groups")]
    expanded: list[str] = []
    for a in ages:
        if a in SHOE_AGE_GROUP_ALIASES:
            expanded.extend(SHOE_AGE_GROUP_ALIASES[a])
        else:
            expanded.append(a)
    seen: set[str] = set()
    ages = []
    for a in expanded:
        if a not in seen:
            seen.add(a)
            ages.append(a)

    if ages:
        q = Q(age_slugs="") | Q(age_slugs__isnull=True)
        for a in ages:
            q |= Q(age_slugs__contains=f"|{a}|")
        qs = qs.filter(q)

    genders = [g.strip().lower() for g in split_multi_params(request, "gender", alt_key="genders")]
    if genders:
        q = Q(gender_slugs="") | Q(gender_slugs__isnull=True)
        for g in genders:
            q |= Q(gender_slugs__contains=f"|{g}|")
        qs = qs.filter(q)

    brands = [b.strip() for b in split_multi_params(request, "brand", alt_key="brands")]
    if brands:
        q = Q()
        for b in brands:
            if b:
                q |= Q(brand__iexact=b)
        qs = qs.filter(q)

    colors = [c.strip().lower().replace(" ", "_") for c in split_multi_params(request, "color", alt_key="colors")]
    if colors:
        q = Q(color_slugs="") | Q(color_slugs__isnull=True)
        for c in colors:
            q |= Q(color_slugs__contains=f"|{c}|")
        qs = qs.filter(q)

    sizes = [s.strip() for s in split_multi_params(request, "size", alt_key="sizes")]
    if sizes:
        q = Q(size_slugs="") | Q(size_slugs__isnull=True)
        for s in sizes:
            if not s:
                continue
            safe = s.replace("|", "")
            q |= Q(size_slugs__contains=f"|{safe}|")
        qs = qs.filter(q)

    min_p = request.query_params.get("min_price")
    max_p = request.query_params.get("max_price")
    if min_p is not None and str(min_p).strip() != "":
        try:
            qs = qs.filter(price__gte=Decimal(str(min_p).strip()))
        except (InvalidOperation, ValueError):
            pass
    if max_p is not None and str(max_p).strip() != "":
        try:
            qs = qs.filter(price__lte=Decimal(str(max_p).strip()))
        except (InvalidOperation, ValueError):
            pass

    min_r = request.query_params.get("min_rating")
    if min_r is not None and str(min_r).strip() != "":
        try:
            qs = qs.filter(rating__gte=Decimal(str(min_r).strip()))
        except (InvalidOperation, ValueError):
            pass

    return qs


def apply_product_ordering(qs, request):
    o = (request.query_params.get("ordering") or "").strip().lower().replace("-", "_")
    order_map = {
        "price_asc": ["price", "id"],
        "price_low": ["price", "id"],
        "price_desc": ["-price", "id"],
        "price_high": ["-price", "id"],
        "rating_desc": ["-rating", "-id"],
        "top_rated": ["-rating", "-id"],
        "new": ["-created_at", "name"],
        "new_arrivals": ["-created_at", "name"],
        "popularity": ["-rating", "-stock", "name"],
    }
    fields = order_map.get(o, ["name", "id"])
    return qs.order_by(*fields)


def aggregate_price_range(qs):
    row = qs.aggregate(pmin=Min("price"), pmax=Max("price"))
    return row.get("pmin"), row.get("pmax")
