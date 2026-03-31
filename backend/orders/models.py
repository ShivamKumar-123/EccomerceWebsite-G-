import uuid

from django.db import models


class DeliveryOption(models.Model):
    id = models.SlugField(primary_key=True, max_length=64)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    fee = models.PositiveIntegerField(default=0)
    eta_days = models.PositiveSmallIntegerField(default=7)
    active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name


class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=128, blank=True, null=True)
    status = models.CharField(max_length=32, default="pending")
    payment_status = models.CharField(max_length=32, default="not_uploaded")
    total = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_option_id = models.CharField(max_length=64, blank=True)
    delivery_label = models.CharField(max_length=200, blank=True)
    delivery_description = models.TextField(blank=True)
    delivery_eta_days = models.PositiveSmallIntegerField(default=7)
    tracking_number = models.CharField(max_length=200, blank=True)
    carrier = models.CharField(max_length=200, blank=True)
    items = models.JSONField(default=list)
    customer_info = models.JSONField(default=dict)
    payment_screenshot = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return str(self.id)
