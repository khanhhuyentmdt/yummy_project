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
        last = ShippingUnit.objects.order_by('-id').first()
        next_id = (last.id + 1) if last else 1
        code = f'MDT{next_id:04d}'
        return ShippingUnit.objects.create(code=code, **validated_data)

    def update(self, instance, validated_data):
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
