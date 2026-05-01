from rest_framework import serializers

from api.models import (
    OrderRequest,
    ProductionOrder,
    ProductionOrderItem,
    ProductionPlan,
    SemiFinishedProduct,
)


class ProductionOrderItemReadSerializer(serializers.ModelSerializer):
    semi_finished_product_id = serializers.IntegerField(source='semi_finished_product.id')
    code = serializers.CharField(source='semi_finished_product.code')
    name = serializers.CharField(source='semi_finished_product.name')
    unit = serializers.CharField(source='semi_finished_product.unit')

    class Meta:
        model = ProductionOrderItem
        fields = [
            'id',
            'semi_finished_product_id',
            'code',
            'name',
            'unit',
            'quantity',
            'completed_quantity',
            'duration_minutes',
            'notes',
        ]


class ProductionOrderItemWriteSerializer(serializers.Serializer):
    semi_finished_product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    completed_quantity = serializers.DecimalField(max_digits=12, decimal_places=3, required=False, default=0)
    duration_minutes = serializers.IntegerField(min_value=0, required=False, default=0)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class ProductionOrderSerializer(serializers.ModelSerializer):
    items = ProductionOrderItemReadSerializer(many=True, read_only=True)
    order_request_id = serializers.IntegerField(source='order_request.id', read_only=True)
    order_request_code = serializers.CharField(source='order_request.code', read_only=True)
    order_request_name = serializers.CharField(source='order_request.name', read_only=True)
    production_plan_id = serializers.IntegerField(source='production_plan.id', read_only=True)
    production_plan_code = serializers.CharField(source='production_plan.code', read_only=True)
    production_plan_name = serializers.CharField(source='production_plan.name', read_only=True)
    total_products = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()

    class Meta:
        model = ProductionOrder
        fields = [
            'id',
            'code',
            'name',
            'order_request_id',
            'order_request_code',
            'order_request_name',
            'production_plan_id',
            'production_plan_code',
            'production_plan_name',
            'start_date',
            'end_date',
            'notes',
            'status',
            'items',
            'total_products',
            'total_quantity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'items',
            'total_products',
            'total_quantity',
            'created_at',
            'updated_at',
        ]

    def get_total_products(self, obj):
        return obj.items.count()

    def get_total_quantity(self, obj):
        return sum(float(item.quantity or 0) for item in obj.items.all())


class ProductionOrderWriteSerializer(serializers.ModelSerializer):
    items = ProductionOrderItemWriteSerializer(many=True, required=False, default=list)
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    order_request_id = serializers.IntegerField(required=False, allow_null=True)
    production_plan_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProductionOrder
        fields = [
            'id',
            'code',
            'name',
            'order_request_id',
            'production_plan_id',
            'start_date',
            'end_date',
            'notes',
            'status',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        value = (value or '').strip()
        status_value = self.initial_data.get('status') or getattr(self.instance, 'status', ProductionOrder.STATUS_DRAFT)
        if not value and status_value == ProductionOrder.STATUS_DRAFT:
            return value
        if not value:
            raise serializers.ValidationError('Tên lệnh sản xuất không được để trống.')
        instance_id = self.instance.id if self.instance else None
        existing = ProductionOrder.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên lệnh sản xuất "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def validate(self, attrs):
        status_value = attrs.get('status') or getattr(self.instance, 'status', ProductionOrder.STATUS_DRAFT)
        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', None)
        end_date = attrs.get('end_date') or getattr(self.instance, 'end_date', None)
        order_request_id = attrs.get('order_request_id', None)
        production_plan_id = attrs.get('production_plan_id', None)

        if order_request_id is not None:
            try:
                attrs['order_request'] = OrderRequest.objects.get(id=order_request_id)
            except OrderRequest.DoesNotExist:
                raise serializers.ValidationError({'order_request_id': 'Không tìm thấy yêu cầu đặt hàng.'})
        if production_plan_id is not None:
            try:
                attrs['production_plan'] = ProductionPlan.objects.get(id=production_plan_id)
            except ProductionPlan.DoesNotExist:
                raise serializers.ValidationError({'production_plan_id': 'Không tìm thấy kế hoạch sản xuất.'})
        if not attrs.get('order_request') and attrs.get('production_plan') and attrs['production_plan'].order_request_id:
            attrs['order_request'] = attrs['production_plan'].order_request
        if status_value != ProductionOrder.STATUS_DRAFT:
            if not start_date:
                raise serializers.ValidationError({'start_date': 'Ngày bắt đầu là bắt buộc.'})
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'})
        return attrs

    def _generate_next_code(self):
        orders = ProductionOrder.objects.filter(code__regex=r'^LSX\d+$').order_by('-code')
        if not orders.exists():
            return 'LSX001'
        highest_code = orders.first().code
        try:
            number = int(highest_code[3:])
            return f'LSX{number + 1:03d}'
        except (ValueError, IndexError):
            return 'LSX001'

    def _replace_items(self, production_order, items_data):
        production_order.items.all().delete()
        for item in items_data:
            try:
                semi_finished_product = SemiFinishedProduct.objects.get(id=item['semi_finished_product_id'])
            except SemiFinishedProduct.DoesNotExist:
                continue
            ProductionOrderItem.objects.create(
                production_order=production_order,
                semi_finished_product=semi_finished_product,
                quantity=item['quantity'],
                completed_quantity=item.get('completed_quantity', 0),
                duration_minutes=item.get('duration_minutes', 0),
                notes=item.get('notes', ''),
            )

    def _clone_items_from_plan(self, production_order, production_plan):
        items_data = [
            {
                'semi_finished_product_id': item.semi_finished_product_id,
                'quantity': item.quantity,
                'completed_quantity': 0,
                'duration_minutes': item.duration_minutes,
                'notes': '',
            }
            for item in production_plan.items.all()
        ]
        self._replace_items(production_order, items_data)

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data.pop('order_request_id', None)
        validated_data.pop('production_plan_id', None)
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_code()
        production_order = ProductionOrder.objects.create(**validated_data)
        if items_data:
            self._replace_items(production_order, items_data)
        elif production_order.production_plan_id:
            self._clone_items_from_plan(production_order, production_order.production_plan)
        return production_order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        validated_data.pop('order_request_id', None)
        validated_data.pop('production_plan_id', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._replace_items(instance, items_data)
        elif instance.production_plan_id:
            self._clone_items_from_plan(instance, instance.production_plan)
        return instance
