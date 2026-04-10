"""Save partner-uploaded delivery proof images to default storage."""

import uuid as uuid_mod
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

_ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
_MAX_BYTES = 5 * 1024 * 1024  # 5 MB per file


def save_order_delivery_proof_files(order, files) -> list[str]:
    """
    Persist uploaded images under orders/delivery_proofs/<order_uuid>/.
    Returns list of storage-relative paths (for JSONField + MEDIA_URL).
    """
    saved: list[str] = []
    folder = f"orders/delivery_proofs/{order.id}"
    for f in files:
        raw = f.read()
        if len(raw) > _MAX_BYTES:
            raise ValueError("Each image must be 5MB or smaller.")
        ct = (getattr(f, "content_type", None) or "").lower()
        if ct and not ct.startswith("image/"):
            raise ValueError("Only image uploads are allowed.")
        ext = Path(getattr(f, "name", "") or "").suffix.lower()
        if ext not in _ALLOWED_EXT:
            ext = ".jpg"
        name = f"{uuid_mod.uuid4().hex}{ext}"
        path = f"{folder}/{name}"
        default_storage.save(path, ContentFile(raw))
        saved.append(path)
    return saved
