from rest_framework import serializers
from api.models import Product, RawMaterial, ProductBOM
from .product_bom import ProductBOMReadSerializer, ProductBOMWriteSerializer


class ProductSerializer(serializers.ModelSerializer):
    bom_items = ProductBOMReadSerializer(many=True, read_only=True)
    image     = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return ''

    class Meta:
        model  = Product
        fields = [
            'id', 'code', 'name', 'group', 'unit', 'quantity', 'price',
            'cost_price', 'compare_price', 'description',
            'production_notes', 'notes', 'image', 'status',
            'bom_items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'image', 'bom_items', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    bom_items = ProductBOMWriteSerializer(many=True, required=False, default=list)
    code      = serializers.CharField(max_length=20, required=False, allow_blank=True)
    image     = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'code', 'name', 'group', 'unit', 'quantity', 'price',
            'cost_price', 'compare_price', 'description',
            'production_notes', 'notes', 'image', 'status',
            'bom_items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        bom_data = validated_data.pop('bom_items', [])

        # Auto-generate sequential code SP001, SP002, etc.
        if not validated_data.get('code'):
            latest = Product.objects.order_by('-code').first()
            if not latest or not latest.code.startswith('SP'):
                validated_data['code'] = 'SP001'
            else:
                try:
                    last_num = int(latest.code[2:])
                    new_num = last_num + 1
                    validated_data['code'] = f'SP{new_num:03d}'
                except (ValueError, IndexError):
                    validated_data['code'] = 'SP001'

        product = Product.objects.create(**validated_data)

        for item in bom_data:
            try:
                rm = RawMaterial.objects.get(id=item['raw_material_id'])
                ProductBOM.objects.get_or_create(
                    product=product,
                    raw_material=rm,
                    defaults={
                        'quantity': item['quantity'],
                        'unit': item.get('unit', '') or rm.unit,
                    },
                )
            except RawMaterial.DoesNotExist:
                pass

        return product

    def update(self, instance, validated_data):
        bom_data = validated_data.pop('bom_items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace BOM entirely when bom_items is provided
        if bom_data is not None:
            instance.bom_items.all().delete()
            for item in bom_data:
                try:
                    rm = RawMaterial.objects.get(id=item['raw_material_id'])
                    ProductBOM.objects.create(
                        product=instance,
                        raw_material=rm,
                        quantity=item['quantity'],
                        unit=item.get('unit', '') or rm.unit,
                    )
                except RawMaterial.DoesNotExist:
                    pass

        return instance
