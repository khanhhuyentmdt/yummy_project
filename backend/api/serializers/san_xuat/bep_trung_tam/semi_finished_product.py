from rest_framework import serializers
from api.models import RawMaterial, SemiFinishedProduct, SemiFinishedProductBOM
from .semi_finished_product_bom import (
    SemiFinishedProductBOMReadSerializer,
    SemiFinishedProductBOMWriteSerializer,
)


class SemiFinishedProductSerializer(serializers.ModelSerializer):
    bom_items = SemiFinishedProductBOMReadSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return ''

    class Meta:
        model = SemiFinishedProduct
        fields = [
            'id', 'code', 'name', 'group', 'unit', 'quantity', 'price',
            'cost_price', 'compare_price', 'description',
            'production_notes', 'notes', 'image', 'status',
            'bom_items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'image', 'bom_items', 'created_at', 'updated_at']


class SemiFinishedProductWriteSerializer(serializers.ModelSerializer):
    bom_items = SemiFinishedProductBOMWriteSerializer(many=True, required=False, default=list)
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)

    class Meta:
        model = SemiFinishedProduct
        fields = [
            'id', 'code', 'name', 'group', 'unit', 'quantity', 'price',
            'cost_price', 'compare_price', 'description',
            'production_notes', 'notes', 'image', 'status',
            'bom_items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_code(self, value):
        if not value:
            return value
        instance_id = self.instance.id if self.instance else None
        existing = SemiFinishedProduct.objects.filter(code__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Mã bán thành phẩm "{value}" đã tồn tại. Vui lòng chọn mã khác.'
            )
        return value

    def validate_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Tên bán thành phẩm không được để trống.')
        instance_id = self.instance.id if self.instance else None
        existing = SemiFinishedProduct.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên bán thành phẩm "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def _generate_next_code(self):
        products = SemiFinishedProduct.objects.filter(code__regex=r'^BTP\d+$').order_by('-code')
        if not products.exists():
            return 'BTP001'

        highest_code = products.first().code
        try:
            number = int(highest_code[3:])
            return f'BTP{number + 1:03d}'
        except (ValueError, IndexError):
            return 'BTP001'

    def create(self, validated_data):
        bom_data = validated_data.pop('bom_items', [])
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_code()

        product = SemiFinishedProduct.objects.create(**validated_data)

        for item in bom_data:
            try:
                rm = RawMaterial.objects.get(id=item['raw_material_id'])
                SemiFinishedProductBOM.objects.get_or_create(
                    semi_finished_product=product,
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

        if bom_data is not None:
            instance.bom_items.all().delete()
            for item in bom_data:
                try:
                    rm = RawMaterial.objects.get(id=item['raw_material_id'])
                    SemiFinishedProductBOM.objects.create(
                        semi_finished_product=instance,
                        raw_material=rm,
                        quantity=item['quantity'],
                        unit=item.get('unit', '') or rm.unit,
                    )
                except RawMaterial.DoesNotExist:
                    pass

        return instance
