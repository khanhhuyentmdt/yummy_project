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
            # Generate sequential code PDH001, PDH002, etc.
            latest = PurchaseOrder.objects.order_by('-code').first()
            if not latest or not latest.code.startswith('PDH'):
                validated_data['code'] = 'PDH001'
            else:
                try:
                    last_num = int(latest.code[3:])
                    new_num = last_num + 1
                    validated_data['code'] = f'PDH{new_num:03d}'
                except (ValueError, IndexError):
                    validated_data['code'] = 'PDH001'
        return PurchaseOrder.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
