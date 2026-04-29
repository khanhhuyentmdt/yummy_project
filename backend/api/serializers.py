from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Customer, Location, Material, Order, Product, RawMaterial, ProductBOM, Supplier, PurchaseOrder


# ─── Auth ─────────────────────────────────────────────────────────────────────

class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    password     = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            username=data['phone_number'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError(
                'So dien thoai hoac mat khau khong dung.'
            )
        if not user.is_active:
            raise serializers.ValidationError('Tai khoan da bi vo hieu hoa.')
        data['user'] = user
        return data


# ─── RawMaterial ──────────────────────────────────────────────────────────────

class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RawMaterial
        fields = ['id', 'code', 'name', 'unit']


# ─── ProductBOM ───────────────────────────────────────────────────────────────

class ProductBOMReadSerializer(serializers.ModelSerializer):
    raw_material_id   = serializers.IntegerField(source='raw_material.id')
    raw_material_name = serializers.CharField(source='raw_material.name')

    class Meta:
        model  = ProductBOM
        fields = ['id', 'raw_material_id', 'raw_material_name', 'quantity', 'unit']


class ProductBOMWriteSerializer(serializers.Serializer):
    raw_material_id = serializers.IntegerField()
    quantity        = serializers.DecimalField(max_digits=10, decimal_places=3)
    unit            = serializers.CharField(max_length=50, allow_blank=True, default='')


# ─── Product ──────────────────────────────────────────────────────────────────

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

        # Auto-generate unique code when not provided
        if not validated_data.get('code'):
            import time
            suffix = int(time.time() * 1000) % 1000000
            validated_data['code'] = f'SP{suffix:06d}'
            while Product.objects.filter(code=validated_data['code']).exists():
                suffix = (suffix + 1) % 1000000
                validated_data['code'] = f'SP{suffix:06d}'

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


# ─── Material ─────────────────────────────────────────────────────────────────

class MaterialSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return ''

    class Meta:
        model  = Material
        fields = [
            'id', 'code', 'name', 'group', 'unit', 'image',
            'notes', 'batch_management', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'image', 'created_at', 'updated_at']


class MaterialWriteSerializer(serializers.ModelSerializer):
    code  = serializers.CharField(max_length=20, required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)

    class Meta:
        model  = Material
        fields = [
            'id', 'code', 'name', 'group', 'unit', 'image',
            'notes', 'batch_management', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        if not validated_data.get('code'):
            import time
            suffix = int(time.time() * 1000) % 1000000
            validated_data['code'] = f'NVL{suffix:06d}'
            while Material.objects.filter(code=validated_data['code']).exists():
                suffix = (suffix + 1) % 1000000
                validated_data['code'] = f'NVL{suffix:06d}'
        return Material.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ─── Customer ─────────────────────────────────────────────────────────────────

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Customer
        fields = ['id', 'name', 'phone', 'email', 'address', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─── Order ────────────────────────────────────────────────────────────────────

class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'code', 'customer', 'customer_name',
            'total', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ─── Supplier ─────────────────────────────────────────────────────────────────

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Supplier
        fields = ['id', 'name', 'phone', 'address', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─── PurchaseOrder ────────────────────────────────────────────────────────────

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


# ─── Location ─────────────────────────────────────────────────────────────────

class LocationSerializer(serializers.ModelSerializer):
    manager_id   = serializers.IntegerField(source='manager.id', read_only=True, allow_null=True)
    manager_name = serializers.SerializerMethodField()
    location_types_list = serializers.SerializerMethodField()

    def get_manager_name(self, obj):
        if obj.manager:
            return obj.manager.full_name or obj.manager.phone_number
        return ''

    def get_location_types_list(self, obj):
        if not obj.location_types:
            return []
        return [t for t in obj.location_types.split(',') if t]

    class Meta:
        model  = Location
        fields = [
            'id', 'code', 'name',
            'manager_id', 'manager_name',
            'phone', 'email',
            'address', 'province', 'district', 'ward',
            'location_types', 'location_types_list',
            'manage_nvl', 'manage_btp', 'manage_thanh_pham', 'allow_delivery',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LocationWriteSerializer(serializers.Serializer):
    code              = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    name              = serializers.CharField(max_length=200)
    manager_id        = serializers.IntegerField(required=False, allow_null=True)
    phone             = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    email             = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')
    address           = serializers.CharField(required=False, allow_blank=True, default='')
    province          = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    district          = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    ward              = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    location_types    = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    manage_nvl        = serializers.BooleanField(required=False, default=False)
    manage_btp        = serializers.BooleanField(required=False, default=False)
    manage_thanh_pham = serializers.BooleanField(required=False, default=False)
    allow_delivery    = serializers.BooleanField(required=False, default=False)
    status            = serializers.ChoiceField(
        choices=['active', 'inactive'], required=False, default='active'
    )

    def _get_manager(self, manager_id):
        if not manager_id:
            return None
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            return User.objects.get(pk=manager_id)
        except User.DoesNotExist:
            return None

    def _auto_code(self):
        import time
        suffix = int(time.time() * 1000) % 1000000
        code = f'MDD{suffix:06d}'
        while Location.objects.filter(code=code).exists():
            suffix = (suffix + 1) % 1000000
            code = f'MDD{suffix:06d}'
        return code

    def create(self, validated_data):
        location_types_list = validated_data.pop('location_types', [])
        manager_id          = validated_data.pop('manager_id', None)
        code                = validated_data.pop('code', '').strip()

        return Location.objects.create(
            code=code or self._auto_code(),
            manager=self._get_manager(manager_id),
            location_types=','.join(location_types_list),
            **validated_data,
        )

    def update(self, instance, validated_data):
        location_types_list = validated_data.pop('location_types', None)
        manager_id          = validated_data.pop('manager_id', -1)

        if location_types_list is not None:
            instance.location_types = ','.join(location_types_list)
        if manager_id != -1:
            instance.manager = self._get_manager(manager_id)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
