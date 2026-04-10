from django.contrib.auth import get_user_model
from rest_framework import serializers

from delivery_partners.models import DeliveryPartnerApplication

User = get_user_model()


class DeliveryPartnerApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPartnerApplication
        fields = (
            "full_name",
            "age",
            "email",
            "phone",
            "license_number",
            "license_image_front",
            "license_image_back",
            "aadhar_number",
            "aadhar_image_front",
            "aadhar_image_back",
            "pan_number",
            "pan_image_front",
            "pan_image_back",
            "city",
            "district",
            "state",
        )

    def validate_age(self, value):
        if value < 18 or value > 80:
            raise serializers.ValidationError("Age must be between 18 and 80.")
        return value

    def validate_email(self, value):
        email = (value or "").strip().lower()
        if DeliveryPartnerApplication.objects.filter(
            email__iexact=email, status=DeliveryPartnerApplication.Status.PENDING
        ).exists():
            raise serializers.ValidationError(
                "You already have a pending application with this email."
            )
        return email

    def validate_phone(self, value):
        digits = "".join(c for c in str(value) if c.isdigit())
        if len(digits) < 10:
            raise serializers.ValidationError("Enter a valid phone number (at least 10 digits).")
        return str(value).strip()[:20]


class DeliveryPartnerApplicationAdminSerializer(serializers.ModelSerializer):
    license_image_front_url = serializers.SerializerMethodField()
    license_image_back_url = serializers.SerializerMethodField()
    aadhar_image_front_url = serializers.SerializerMethodField()
    aadhar_image_back_url = serializers.SerializerMethodField()
    pan_image_front_url = serializers.SerializerMethodField()
    pan_image_back_url = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryPartnerApplication
        fields = (
            "id",
            "full_name",
            "age",
            "email",
            "phone",
            "license_number",
            "license_image_front_url",
            "license_image_back_url",
            "aadhar_number",
            "aadhar_image_front_url",
            "aadhar_image_back_url",
            "pan_number",
            "pan_image_front_url",
            "pan_image_back_url",
            "city",
            "district",
            "state",
            "status",
            "admin_note",
            "reviewed_at",
            "password_sent_at",
            "linked_user_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def _abs_url(self, request, image_field):
        if not image_field:
            return None
        url = image_field.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_license_image_front_url(self, obj):
        return self._abs_url(self.context.get("request"), obj.license_image_front)

    def get_license_image_back_url(self, obj):
        return self._abs_url(self.context.get("request"), obj.license_image_back)

    def get_aadhar_image_front_url(self, obj):
        return self._abs_url(self.context.get("request"), obj.aadhar_image_front)

    def get_aadhar_image_back_url(self, obj):
        return self._abs_url(self.context.get("request"), obj.aadhar_image_back)

    def get_pan_image_front_url(self, obj):
        return self._abs_url(self.context.get("request"), obj.pan_image_front)

    def get_pan_image_back_url(self, obj):
        return self._abs_url(self.context.get("request"), obj.pan_image_back)


class ApproveDeliveryPartnerSerializer(serializers.Serializer):
    password = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=128,
        help_text="Optional. If omitted, a secure random password is generated and emailed.",
    )

    def validate_password(self, value):
        v = (value or "").strip()
        if v and len(v) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters or leave empty for auto-generated.")
        return v


class RejectDeliveryPartnerSerializer(serializers.Serializer):
    admin_note = serializers.CharField(required=False, allow_blank=True, max_length=2000)
