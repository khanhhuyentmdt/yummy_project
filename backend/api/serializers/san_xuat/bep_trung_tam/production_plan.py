from rest_framework import serializers

from api.models import (
    OrderRequest,
    ProductionPlan,
    ProductionPlanItem,
    SemiFinishedProduct,
)


class ProductionPlanItemReadSerializer(serializers.ModelSerializer):
    semi_finished_product_id = serializers.IntegerField(source='semi_finished_product.id')
    code = serializers.CharField(source='semi_finished_product.code')
    name = serializers.CharField(source='semi_finished_product.name')
    unit = serializers.CharField(source='semi_finished_product.unit')

    class Meta:
        model = ProductionPlanItem
        fields = [
            'id',
            'semi_finished_product_id',
            'code',
            'name',
            'unit',
            'quantity',
            'duration_minutes',
        ]


class ProductionPlanItemWriteSerializer(serializers.Serializer):
    semi_finished_product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    duration_minutes = serializers.IntegerField(min_value=1)


class ProductionPlanSerializer(serializers.ModelSerializer):
    items = ProductionPlanItemReadSerializer(many=True, read_only=True)
    order_request_id = serializers.IntegerField(source='order_request.id', read_only=True)
    order_request_code = serializers.CharField(source='order_request.code', read_only=True)
    order_request_name = serializers.CharField(source='order_request.name', read_only=True)
    total_products = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = ProductionPlan
        fields = [
            'id',
            'code',
            'name',
            'order_request_id',
            'order_request_code',
            'order_request_name',
            'start_date',
            'end_date',
            'notes',
            'status',
            'items',
            'total_products',
            'total_quantity',
            'total_duration_minutes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'items',
            'total_products',
            'total_quantity',
            'total_duration_minutes',
            'created_at',
            'updated_at',
        ]

    def get_total_products(self, obj):
        return obj.items.count()

    def get_total_quantity(self, obj):
        return sum(float(item.quantity or 0) for item in obj.items.all())

    def get_total_duration_minutes(self, obj):
        return sum(int(item.duration_minutes or 0) for item in obj.items.all())


class ProductionPlanWriteSerializer(serializers.ModelSerializer):
    items = ProductionPlanItemWriteSerializer(many=True, required=False, default=list)
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    order_request_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProductionPlan
        fields = [
            'id',
            'code',
            'name',
            'order_request_id',
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
        status_value = self.initial_data.get('status') or getattr(self.instance, 'status', ProductionPlan.STATUS_DRAFT)
        if not value and status_value == ProductionPlan.STATUS_DRAFT:
            return value
        if not value:
            raise serializers.ValidationError('Tên kế hoạch sản xuất không được để trống.')
        instance_id = self.instance.id if self.instance else None
        existing = ProductionPlan.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên kế hoạch sản xuất "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def validate(self, attrs):
        status_value = attrs.get('status') or getattr(self.instance, 'status', ProductionPlan.STATUS_DRAFT)
        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', None)
        end_date = attrs.get('end_date') or getattr(self.instance, 'end_date', None)
        order_request_id = attrs.get('order_request_id', None)
        if order_request_id is not None:
            try:
                attrs['order_request'] = OrderRequest.objects.get(id=order_request_id)
            except OrderRequest.DoesNotExist:
                raise serializers.ValidationError({'order_request_id': 'Không tìm thấy yêu cầu đặt hàng.'})
        if status_value != ProductionPlan.STATUS_DRAFT:
            if not start_date:
                raise serializers.ValidationError({'start_date': 'Ngày bắt đầu là bắt buộc.'})
            if not end_date:
                raise serializers.ValidationError({'end_date': 'Ngày kết thúc là bắt buộc.'})
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'
            })
        return attrs

    def _generate_next_code(self):
        plans = ProductionPlan.objects.filter(code__regex=r'^KHSX\d+$').order_by('-code')
        if not plans.exists():
            return 'KHSX001'
        highest_code = plans.first().code
        try:
            number = int(highest_code[4:])
            return f'KHSX{number + 1:03d}'
        except (ValueError, IndexError):
            return 'KHSX001'

    def _replace_items(self, plan, items_data):
        plan.items.all().delete()
        for item in items_data:
            try:
                semi_finished_product = SemiFinishedProduct.objects.get(id=item['semi_finished_product_id'])
            except SemiFinishedProduct.DoesNotExist:
                continue
            ProductionPlanItem.objects.create(
                production_plan=plan,
                semi_finished_product=semi_finished_product,
                quantity=item['quantity'],
                duration_minutes=item['duration_minutes'],
            )

    def _clone_items_from_order_request(self, plan, order_request):
        items_data = [
            {
                'semi_finished_product_id': item.semi_finished_product_id,
                'quantity': item.quantity,
                'duration_minutes': 60,
            }
            for item in order_request.items.all()
        ]
        self._replace_items(plan, items_data)

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data.pop('order_request_id', None)
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_code()
        plan = ProductionPlan.objects.create(**validated_data)
        if items_data:
            self._replace_items(plan, items_data)
        elif plan.order_request_id:
            self._clone_items_from_order_request(plan, plan.order_request)
        return plan

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        validated_data.pop('order_request_id', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._replace_items(instance, items_data)
        elif instance.order_request_id:
            self._clone_items_from_order_request(instance, instance.order_request)
        return instance
