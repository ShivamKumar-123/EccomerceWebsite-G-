from django.conf import settings
from django.db import models


class DeliveryPartnerApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    full_name = models.CharField(max_length=200)
    age = models.PositiveSmallIntegerField()
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=20)

    license_number = models.CharField(max_length=64)
    license_image_front = models.ImageField(upload_to="delivery_partners/licenses/%Y/%m/")
    license_image_back = models.ImageField(upload_to="delivery_partners/licenses/%Y/%m/")

    aadhar_number = models.CharField(max_length=20)
    aadhar_image_front = models.ImageField(upload_to="delivery_partners/aadhar/%Y/%m/")
    aadhar_image_back = models.ImageField(upload_to="delivery_partners/aadhar/%Y/%m/")

    pan_number = models.CharField(max_length=20)
    pan_image_front = models.ImageField(upload_to="delivery_partners/pan/%Y/%m/")
    pan_image_back = models.ImageField(upload_to="delivery_partners/pan/%Y/%m/")

    city = models.CharField(max_length=128)
    district = models.CharField(max_length=128)
    state = models.CharField(max_length=128)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    admin_note = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    password_sent_at = models.DateTimeField(null=True, blank=True)

    linked_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="delivery_partner_applications",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at", "status"]),
        ]

    def __str__(self):
        return f"{self.full_name} <{self.email}> ({self.status})"
