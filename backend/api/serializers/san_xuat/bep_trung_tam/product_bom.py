from rest_framework import serializers
from api.models import ProductBOM


class ProductBOMReadSerializer(serializers.ModelSerializer):
    raw_material_id   = serializers.IntegerField(source='raw_material.id')
    raw_material_code = serializers.CharField(source='raw_material.code')
    raw_material_name = serializers.CharField(source='raw_material.name')

    class Meta:
        model  = ProductBOM
        fields = ['id', 'raw_material_id', 'raw_material_code', 'raw_material_name', 'quantity', 'unit']


class ProductBOMWriteSerializer(serializers.Serializer):
    raw_material_id = serializers.IntegerField()
    quantity        = serializers.DecimalField(max_digits=10, decimal_places=3)
    unit            = serializers.CharField(max_length=50, allow_blank=True, default='')
