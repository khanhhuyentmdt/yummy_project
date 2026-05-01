from rest_framework import serializers

from api.models import (
    ProductionAcceptance,
    ProductionAcceptanceItem,
    ProductionOrder,
    SemiFinishedProduct,
)


class ProductionAcceptanceItemReadSerializer(serializers.ModelSerializer):
    semi_finished_product_id = serializers.IntegerField(source='semi_finished_product.id')
    code = serializers.CharField(source='semi_finished_product.code')
    name = serializers.CharField(source='semi_finished_product.name')
    unit = serializers.CharField(source='semi_finished_product.unit')

    class Meta:
        model = ProductionAcceptanceItem
        fields = [
            'id',
            'semi_finished_product_id',
            'code',
            'name',
            'unit',
            'planned_quantity',
            'accepted_quantity',
            'notes',
        ]


class ProductionAcceptanceItemWriteSerializer(serializers.Serializer):
    semi_finished_product_id = serializers.IntegerField()
    planned_quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    accepted_quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class ProductionAcceptanceSerializer(serializers.ModelSerializer):
    items = ProductionAcceptanceItemReadSerializer(many=True, read_only=True)
    production_order_id = serializers.IntegerField(source='production_order.id', read_only=True)
    production_order_code = serializers.CharField(source='production_order.code', read_only=True)
    production_order_name = serializers.CharField(source='production_order.name', read_only=True)
    total_products = serializers.SerializerMethodField()
    total_accepted_quantity = serializers.SerializerMethodField()

    class Meta:
        model = ProductionAcceptance
        fields = [
            'id',
            'code',
            'name',
            'production_order_id',
            'production_order_code',
            'production_order_name',
            'accepted_date',
            'notes',
            'status',
            'items',
            'total_products',
            'total_accepted_quantity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'items',
            'total_products',
            'total_accepted_quantity',
            'created_at',
            'updated_at',
        ]

    def get_total_products(self, obj):
        return obj.items.count()

    def get_total_accepted_quantity(self, obj):
        return sum(float(item.accepted_quantity or 0) for item in obj.items.all())


class ProductionAcceptanceWriteSerializer(serializers.ModelSerializer):
    items = ProductionAcceptanceItemWriteSerializer(many=True, required=False, default=list)
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    production_order_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProductionAcceptance
        fields = [
            'id',
            'code',
            'name',
            'production_order_id',
            'accepted_date',
            'notes',
            'status',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        value = (value or '').strip()
        status_value = self.initial_data.get('status') or getattr(self.instance, 'status', ProductionAcceptance.STATUS_DRAFT)
        if not value and status_value == ProductionAcceptance.STATUS_DRAFT:
            return value
        if not value:
            raise serializers.ValidationError('Tên phiếu nghiệm thu không được để trống.')
        instance_id = self.instance.id if self.instance else None
        existing = ProductionAcceptance.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên phiếu nghiệm thu "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def validate(self, attrs):
        production_order_id = attrs.get('production_order_id', None)
        status_value = attrs.get('status') or getattr(self.instance, 'status', ProductionAcceptance.STATUS_DRAFT)
        accepted_date = attrs.get('accepted_date') or getattr(self.instance, 'accepted_date', None)
        if production_order_id is not None:
            try:
                attrs['production_order'] = ProductionOrder.objects.get(id=production_order_id)
            except ProductionOrder.DoesNotExist:
                raise serializers.ValidationError({'production_order_id': 'Không tìm thấy lệnh sản xuất.'})
        if status_value != ProductionAcceptance.STATUS_DRAFT and not accepted_date:
            raise serializers.ValidationError({'accepted_date': 'Ngày nghiệm thu là bắt buộc.'})
        return attrs

    def _generate_next_code(self):
        acceptances = ProductionAcceptance.objects.filter(code__regex=r'^NTSX\d+$').order_by('-code')
        if not acceptances.exists():
            return 'NTSX001'
        highest_code = acceptances.first().code
        try:
            number = int(highest_code[4:])
            return f'NTSX{number + 1:03d}'
        except (ValueError, IndexError):
            return 'NTSX001'

    def _replace_items(self, production_acceptance, items_data):
        production_acceptance.items.all().delete()
        for item in items_data:
            try:
                semi_finished_product = SemiFinishedProduct.objects.get(id=item['semi_finished_product_id'])
            except SemiFinishedProduct.DoesNotExist:
                continue
            ProductionAcceptanceItem.objects.create(
                production_acceptance=production_acceptance,
                semi_finished_product=semi_finished_product,
                planned_quantity=item['planned_quantity'],
                accepted_quantity=item['accepted_quantity'],
                notes=item.get('notes', ''),
            )

    def _clone_items_from_order(self, production_acceptance, production_order):
        items_data = [
            {
                'semi_finished_product_id': item.semi_finished_product_id,
                'planned_quantity': item.quantity,
                'accepted_quantity': item.completed_quantity or item.quantity,
                'notes': item.notes or '',
            }
            for item in production_order.items.all()
        ]
        self._replace_items(production_acceptance, items_data)

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data.pop('production_order_id', None)
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_code()
        production_acceptance = ProductionAcceptance.objects.create(**validated_data)
        if items_data:
            self._replace_items(production_acceptance, items_data)
        elif production_acceptance.production_order_id:
            self._clone_items_from_order(production_acceptance, production_acceptance.production_order)
        return production_acceptance

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        validated_data.pop('production_order_id', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._replace_items(instance, items_data)
        elif instance.production_order_id:
            self._clone_items_from_order(instance, instance.production_order)
        return instance
