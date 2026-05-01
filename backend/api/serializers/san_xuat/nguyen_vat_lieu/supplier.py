import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db.models import Sum
from rest_framework import serializers
from api.models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    code = serializers.SerializerMethodField()
    total_purchase = serializers.SerializerMethodField()
    attachment = serializers.FileField(required=False, allow_null=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'id',
            'code',
            'name',
            'tax_code',
            'contact_name',
            'position',
            'phone',
            'email',
            'social_link',
            'address',
            'province_code',
            'province_name',
            'district_code',
            'district_name',
            'ward_code',
            'ward_name',
            'debt_limit',
            'bank_account',
            'bank_name',
            'notes',
            'attachment',
            'attachment_url',
            'status',
            'total_purchase',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'code', 'total_purchase', 'created_at', 'updated_at']

    def get_code(self, obj):
        return f'NCC{obj.id:03d}' if obj.id else ''

    def get_total_purchase(self, obj):
        total = obj.purchase_orders.aggregate(value=Sum('total_value')).get('value') or 0
        return int(total)

    def get_attachment_url(self, obj):
        request = self.context.get('request')
        if not obj.attachment:
            return ''
        url = obj.attachment.url
        return request.build_absolute_uri(url) if request else url

    def validate_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Tên nhà cung cấp là bắt buộc.')
        instance_id = self.instance.id if self.instance else None
        existing = Supplier.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên nhà cung cấp "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def validate_phone(self, value):
        value = (value or '').strip()
        if not value:
            return value
        normalized = re.sub(r'[\s.\-()]', '', value)
        pattern = re.compile(r'^(?:\+84|84|0)(?:2\d{8,9}|[35789]\d{8})$')
        if not pattern.match(normalized):
            raise serializers.ValidationError(
                'Số điện thoại không đúng định dạng Việt Nam.'
            )
        return normalized

    def validate_email(self, value):
        value = (value or '').strip()
        if not value:
            return ''
        try:
            validate_email(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError('Email không đúng định dạng.') from exc
        return value.lower()

    def validate_tax_code(self, value):
        value = (value or '').strip()
        if not value:
            return ''
        if not re.fullmatch(r'^\d{10}(?:-\d{3})?$', value):
            raise serializers.ValidationError(
                'Mã số thuế phải có 10 chữ số hoặc 10 chữ số kèm hậu tố -XXX.'
            )
        return value

    def validate(self, attrs):
        if not (attrs.get('contact_name') or getattr(self.instance, 'contact_name', '')).strip():
            raise serializers.ValidationError({'contact_name': 'Tên người liên hệ là bắt buộc.'})
        if not (attrs.get('phone') or getattr(self.instance, 'phone', '')).strip():
            raise serializers.ValidationError({'phone': 'Số điện thoại là bắt buộc.'})
        return attrs
