from rest_framework import serializers
from api.models import PurchaseOrder


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model  = PurchaseOrder
        fields = [
            'id', 'code', 'supplier', 'supplier_name',
            'total_value', 'status', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PurchaseOrderWriteSerializer(serializers.ModelSerializer):
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)

    class Meta:
        model  = PurchaseOrder
        fields = ['id', 'code', 'supplier', 'total_value', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        if not validated_data.get('code'):
            import time
            suffix = int(time.time() * 1000) % 1000000
            validated_data['code'] = f'PDH{suffix:06d}'
            while PurchaseOrder.objects.filter(code=validated_data['code']).exists():
                suffix = (suffix + 1) % 1000000
                validated_data['code'] = f'PDH{suffix:06d}'
        return PurchaseOrder.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
