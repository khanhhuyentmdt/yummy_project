from rest_framework import serializers

from api.models import (
    OrderRequest,
    OrderRequestItem,
    SemiFinishedProduct,
)


class OrderRequestItemReadSerializer(serializers.ModelSerializer):
    semi_finished_product_id = serializers.IntegerField(source='semi_finished_product.id')
    code = serializers.CharField(source='semi_finished_product.code')
    name = serializers.CharField(source='semi_finished_product.name')
    unit = serializers.CharField(source='semi_finished_product.unit')

    class Meta:
        model = OrderRequestItem
        fields = [
            'id',
            'semi_finished_product_id',
            'code',
            'name',
            'unit',
            'quantity',
            'notes',
        ]


class OrderRequestItemWriteSerializer(serializers.Serializer):
    semi_finished_product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class OrderRequestSerializer(serializers.ModelSerializer):
    items = OrderRequestItemReadSerializer(many=True, read_only=True)
    total_products = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()

    class Meta:
        model = OrderRequest
        fields = [
            'id',
            'code',
            'name',
            'request_date',
            'expected_date',
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


class OrderRequestWriteSerializer(serializers.ModelSerializer):
    items = OrderRequestItemWriteSerializer(many=True, required=False, default=list)
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)

    class Meta:
        model = OrderRequest
        fields = [
            'id',
            'code',
            'name',
            'request_date',
            'expected_date',
            'notes',
            'status',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        value = (value or '').strip()
        status_value = self.initial_data.get('status') or getattr(self.instance, 'status', OrderRequest.STATUS_DRAFT)
        if not value and status_value == OrderRequest.STATUS_DRAFT:
            return value
        if not value:
            raise serializers.ValidationError('Tên yêu cầu đặt hàng không được để trống.')
        instance_id = self.instance.id if self.instance else None
        existing = OrderRequest.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên yêu cầu đặt hàng "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def validate(self, attrs):
        status_value = attrs.get('status') or getattr(self.instance, 'status', OrderRequest.STATUS_DRAFT)
        request_date = attrs.get('request_date') or getattr(self.instance, 'request_date', None)
        expected_date = attrs.get('expected_date') or getattr(self.instance, 'expected_date', None)
        if status_value != OrderRequest.STATUS_DRAFT and not request_date:
            raise serializers.ValidationError({'request_date': 'Ngày yêu cầu là bắt buộc.'})
        if request_date and expected_date and expected_date < request_date:
            raise serializers.ValidationError({
                'expected_date': 'Ngày mong muốn phải sau hoặc bằng ngày yêu cầu.'
            })
        return attrs

    def _generate_next_code(self):
        requests = OrderRequest.objects.filter(code__regex=r'^YCDH\d+$').order_by('-code')
        if not requests.exists():
            return 'YCDH001'
        highest_code = requests.first().code
        try:
            number = int(highest_code[4:])
            return f'YCDH{number + 1:03d}'
        except (ValueError, IndexError):
            return 'YCDH001'

    def _replace_items(self, order_request, items_data):
        order_request.items.all().delete()
        for item in items_data:
            try:
                semi_finished_product = SemiFinishedProduct.objects.get(id=item['semi_finished_product_id'])
            except SemiFinishedProduct.DoesNotExist:
                continue
            OrderRequestItem.objects.create(
                order_request=order_request,
                semi_finished_product=semi_finished_product,
                quantity=item['quantity'],
                notes=item.get('notes', ''),
            )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_code()
        order_request = OrderRequest.objects.create(**validated_data)
        self._replace_items(order_request, items_data)
        return order_request

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            self._replace_items(instance, items_data)
        return instance
