from rest_framework import serializers
from api.models import Product, Material, ProductBOM, ProductGroup
from .product_bom import ProductBOMReadSerializer, ProductBOMWriteSerializer


class ProductSerializer(serializers.ModelSerializer):
    bom_items = ProductBOMReadSerializer(many=True, read_only=True)
    image     = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    group_id = serializers.SerializerMethodField()
    group_code = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return ''

    def get_group(self, obj):
        return obj.group.name if obj.group else ''

    def get_group_id(self, obj):
        return obj.group.id if obj.group else None

    def get_group_code(self, obj):
        return obj.group.code if obj.group else ''

    class Meta:
        model  = Product
        fields = [
            'id', 'code', 'name', 'group', 'unit', 'quantity', 'price',
            'cost_price', 'compare_price', 'description',
            'production_notes', 'notes', 'image', 'status',
            'group_id', 'group_code', 'bom_items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'image', 'bom_items', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    bom_items = ProductBOMWriteSerializer(many=True, required=False, default=list)
    code      = serializers.CharField(max_length=20, required=False, allow_blank=True)
    image     = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)
    group = serializers.CharField(required=False, allow_blank=True, write_only=True)
    group_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'code', 'name', 'group', 'group_id', 'unit', 'quantity', 'price',
            'cost_price', 'compare_price', 'description',
            'production_notes', 'notes', 'image', 'status',
            'bom_items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_code(self, value):
        """Validate mã sản phẩm không trùng (không phân biệt hoa thường)"""
        if not value:
            return value
        
        # Kiểm tra trùng mã (không phân biệt hoa thường)
        instance_id = self.instance.id if self.instance else None
        existing = Product.objects.filter(code__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        
        if existing.exists():
            raise serializers.ValidationError(
                f'Mã sản phẩm "{value}" đã tồn tại. Vui lòng chọn mã khác.'
            )
        return value

    def validate_name(self, value):
        """Validate tên sản phẩm không trùng (không phân biệt hoa thường)"""
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Tên sản phẩm không được để trống.')
        
        # Kiểm tra trùng tên (không phân biệt hoa thường)
        instance_id = self.instance.id if self.instance else None
        existing = Product.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên sản phẩm "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def _resolve_group(self, attrs):
        group_id = attrs.pop('group_id', serializers.empty)
        group_name = attrs.pop('group', serializers.empty)

        if group_id is serializers.empty and group_name is serializers.empty:
            return attrs

        group_obj = None
        if group_id is not serializers.empty and group_id is not None:
            group_obj = ProductGroup.objects.filter(id=group_id).first()
            if not group_obj:
                raise serializers.ValidationError({'group_id': 'Nhóm sản phẩm không tồn tại.'})
        elif group_name is not serializers.empty:
            group_name = (group_name or '').strip()
            if not group_name:
                raise serializers.ValidationError({'group': 'Nhóm sản phẩm không được để trống.'})
            group_obj = ProductGroup.objects.filter(name__iexact=group_name).first()
            if not group_obj:
                raise serializers.ValidationError({'group': 'Nhóm sản phẩm không tồn tại.'})

        attrs['group'] = group_obj
        return attrs

    def validate_bom_items(self, value):
        if value is None:
            return value
        seen = set()
        cleaned = []
        for item in value:
            raw_material_id = item.get('raw_material_id')
            quantity = item.get('quantity')
            if not raw_material_id or not quantity:
                continue
            if not Material.objects.filter(id=raw_material_id).exists():
                raise serializers.ValidationError(f'Nguyên vật liệu #{raw_material_id} không tồn tại.')
            if raw_material_id in seen:
                raise serializers.ValidationError('Nguyên vật liệu trong BOM không được trùng nhau.')
            seen.add(raw_material_id)
            cleaned.append(item)
        return cleaned

    def validate(self, attrs):
        attrs = self._resolve_group(attrs)
        attrs = super().validate(attrs)
        bom_items = attrs.get('bom_items', None)
        if not attrs.get('group') and not self.instance:
            raise serializers.ValidationError({'group': 'Nhóm sản phẩm không được để trống.'})
        if bom_items is not None and len(bom_items) == 0:
            raise serializers.ValidationError({'bom_items': 'Sản phẩm phải có ít nhất 1 nguyên vật liệu.'})
        return attrs

    def _generate_next_product_code(self):
        """Tự động tạo mã sản phẩm tiếp theo dựa trên mã cao nhất"""
        # Lấy tất cả mã sản phẩm có format SPxxx
        products = Product.objects.filter(code__regex=r'^SP\d+$').order_by('-code')
        
        if not products.exists():
            return 'SP001'
        
        # Lấy mã cao nhất
        highest_code = products.first().code
        try:
            # Lấy số từ mã (bỏ "SP")
            number = int(highest_code[2:])
            next_number = number + 1
            return f'SP{next_number:03d}'
        except (ValueError, IndexError):
            # Nếu không parse được, bắt đầu từ SP001
            return 'SP001'

    def create(self, validated_data):
        bom_data = validated_data.pop('bom_items', [])

        # Auto-generate mã sản phẩm theo format SP001, SP002,... nếu không có
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_product_code()

        product = Product.objects.create(**validated_data)

        for item in bom_data:
            try:
                rm = Material.objects.get(id=item['raw_material_id'])
                ProductBOM.objects.get_or_create(
                    product=product,
                    raw_material=rm,
                    defaults={
                        'quantity': item['quantity'],
                        'unit': item.get('unit', '') or rm.unit,
                    },
                )
            except Material.DoesNotExist:
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
                    rm = Material.objects.get(id=item['raw_material_id'])
                    ProductBOM.objects.create(
                        product=instance,
                        raw_material=rm,
                        quantity=item['quantity'],
                        unit=item.get('unit', '') or rm.unit,
                    )
                except Material.DoesNotExist:
                    pass

        return instance
