"""
Auto-assign a delivery partner to an order using customer address vs partner application location.

Multiple partners can cover the same city/district/state. Each partner may hold at most
PARTNER_ACTIVE_ORDER_CAP orders that are not yet delivered or rejected ("in flight").
When a partner completes deliveries and drops below the cap, they become eligible for
new assignments again. Among eligible partners we pick the lowest in-flight count, then
fewest assignments today (fair rotation), then strongest location match.
"""

from __future__ import annotations

from django.db.models import Count
from django.utils import timezone

from delivery_partners.models import DeliveryPartnerApplication

# Orders still "on the partner" — not finished. When this many are open, they wait for
# completions before taking more (next batch of up to this many).
PARTNER_ACTIVE_ORDER_CAP = 10

# Statuses that count toward the active cap (must complete / deliver to free a slot)
_ACTIVE_STATUSES = ("pending", "approved", "shipped")


def _norm(s) -> str:
    if s is None:
        return ""
    t = str(s).strip().lower()
    return " ".join(t.split()) if t else ""


def _customer_location_triple(customer_info: dict) -> tuple[str, str, str]:
    if not isinstance(customer_info, dict):
        return "", "", ""
    c = customer_info.get("city") or customer_info.get("City") or ""
    d = customer_info.get("district") or customer_info.get("District") or ""
    st = customer_info.get("state") or customer_info.get("State") or ""
    return _norm(c), _norm(d), _norm(st)


def _location_score(oc: str, od: str, os_: str, app: DeliveryPartnerApplication) -> int:
    ac = _norm(app.city)
    ad = _norm(app.district)
    ast = _norm(app.state)
    score = 0
    if oc and ac and oc == ac:
        score += 4
    if od and ad and od == ad:
        score += 2
    if os_ and ast and os_ == ast:
        score += 1
    return score


def _load_maps(user_ids: list[int], today):
    from orders.models import Order

    if not user_ids:
        return {}, {}

    base = Order.objects.filter(delivery_partner_id__in=user_ids)

    in_flight_rows = (
        base.filter(status__in=_ACTIVE_STATUSES)
        .values("delivery_partner_id")
        .annotate(c=Count("id"))
    )
    in_flight_map = {row["delivery_partner_id"]: row["c"] for row in in_flight_rows}

    today_rows = (
        base.filter(created_at__date=today)
        .values("delivery_partner_id")
        .annotate(c=Count("id"))
    )
    today_map = {row["delivery_partner_id"]: row["c"] for row in today_rows}

    return in_flight_map, today_map


def auto_assign_delivery_partner_user(customer_info: dict):
    """
    Return a User to set as order.delivery_partner, or None if no approved partner matches.

    Among location-matched approved partners:
    - Prefer partners with fewer than PARTNER_ACTIVE_ORDER_CAP active (non-delivered,
      non-rejected) orders. If everyone is at/over cap, pick the one with the smallest
      in-flight count (overflow).
    - Tie-break: lowest in-flight count, then fewest orders assigned today, then higher
      location score, then stable user pk.
    """
    from django.contrib.auth import get_user_model

    oc, od, os_ = _customer_location_triple(customer_info)
    if not (oc or od or os_):
        return None

    apps = list(
        DeliveryPartnerApplication.objects.filter(
            status=DeliveryPartnerApplication.Status.APPROVED,
            linked_user__isnull=False,
        ).select_related("linked_user")
    )
    if not apps:
        return None

    candidates = []
    for app in apps:
        score = _location_score(oc, od, os_, app)
        if score <= 0:
            continue
        candidates.append((app.linked_user, score))

    if not candidates:
        return None

    user_ids = list({u.id for u, _ in candidates})
    today = timezone.localdate()
    in_flight_map, today_map = _load_maps(user_ids, today)

    def in_flight(uid: int) -> int:
        return int(in_flight_map.get(uid, 0))

    def assigned_today(uid: int) -> int:
        return int(today_map.get(uid, 0))

    # Sort: under cap first; then least busy; then fair daily rotation; then location; then pk
    def sort_key(item: tuple):
        u, score = item
        ifl = in_flight(u.id)
        today_n = assigned_today(u.id)
        under_cap = 1 if ifl < PARTNER_ACTIVE_ORDER_CAP else 0
        return (
            -under_cap,
            ifl,
            today_n,
            -score,
            u.pk,
        )

    candidates.sort(key=sort_key)
    return candidates[0][0]
