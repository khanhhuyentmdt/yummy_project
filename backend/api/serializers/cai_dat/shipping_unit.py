from rest_framework import serializers
from api.models import ShippingUnit, ShippingUnitHistory


class ShippingUnitHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ShippingUnitHistory
        fields = ['id', 'timestamp', 'actor_name', 'action']


class ShippingUnitSerializer(serializers.ModelSerializer):
    history = ShippingUnitHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = ShippingUnit
        fields = [
            'id', 'code', 'name', 'phone', 'email', 'address', 'city', 'district', 
            'ward', 'notes', 'status', 'created_by_name', 'created_at', 'updated_at', 'history'
        ]


class ShippingUnitWriteSerializer(serializers.Serializer):
    name     = serializers.CharField(max_length=200)
    phone    = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email    = serializers.EmailField(max_length=200, required=False, allow_blank=True)
    address  = serializers.CharField(max_length=500, required=False, allow_blank=True)
    city     = serializers.CharField(max_length=100, required=False, allow_blank=True)
    district = serializers.CharField(max_length=100, required=False, allow_blank=True)
    ward     = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes    = serializers.CharField(required=False, allow_blank=True)
    status   = serializers.ChoiceField(choices=['active', 'inactive'], default='active')

    def validate_name(self, value):
        qs = ShippingUnit.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Tên đối tác này đã được sử dụng.')
        return value

    def create(self, validated_data):
        # Generate sequential code MDT001, MDT002, etc.
        latest = ShippingUnit.objects.order_by('-code').first()
        if not latest or not latest.code.startswith('MDT'):
            code = 'MDT001'
        else:
            try:
                last_num = int(latest.code[3:])
                new_num = last_num + 1
                code = f'MDT{new_num:03d}'
            except (ValueError, IndexError):
                code = 'MDT001'
        return ShippingUnit.objects.create(code=code, **validated_data)

    def update(self, instance, validated_data):
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
