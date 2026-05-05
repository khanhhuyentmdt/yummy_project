from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers

from api.models import Material, PurchaseOrder, PurchaseOrderItem


ZERO = Decimal('0')


def _to_decimal(value):
    if value in (None, ''):
        return ZERO
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _round_money(value):
    return _to_decimal(value).quantize(Decimal('1'), rounding=ROUND_HALF_UP)


def _next_purchase_order_code():
    rows = PurchaseOrder.objects.filter(code__regex=r'^PDH\d+$').order_by('-code')
    if not rows.exists():
        return 'PDH001'
    highest_code = rows.first().code
    try:
        number = int(highest_code[3:])
        return f'PDH{number + 1:03d}'
    except (ValueError, IndexError):
        return 'PDH001'


class PurchaseOrderItemReadSerializer(serializers.ModelSerializer):
    material_id = serializers.IntegerField(source='material.id', read_only=True)
    material_code = serializers.CharField(source='material.code', read_only=True)
    material_name = serializers.CharField(source='material.name', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id',
            'material_id',
            'material_code',
            'material_name',
            'quantity',
            'unit',
            'unit_price',
            'line_total',
            'notes',
        ]


class PurchaseOrderItemWriteSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    material_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    unit = serializers.CharField(max_length=50, required=False, allow_blank=True)
    unit_price = serializers.DecimalField(max_digits=14, decimal_places=0)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_material_id(self, value):
        if not Material.objects.filter(id=value).exists():
            raise serializers.ValidationError('Nguyên vật liệu không tồn tại.')
        return value

    def validate(self, attrs):
        if _to_decimal(attrs.get('quantity')) <= ZERO:
            raise serializers.ValidationError({'quantity': 'Số lượng phải lớn hơn 0.'})
        if _to_decimal(attrs.get('unit_price')) < ZERO:
            raise serializers.ValidationError({'unit_price': 'Đơn giá không được âm.'})
        return attrs


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    items = PurchaseOrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'code',
            'supplier',
            'supplier_name',
            'responsible_name',
            'order_date',
            'expected_delivery_date',
            'total_goods_value',
            'discount_type',
            'discount_value',
            'discount_amount',
            'shipping_fee',
            'vat_percent',
            'vat_amount',
            'other_fee_label',
            'other_fee',
            'total_value',
            'status',
            'notes',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PurchaseOrderWriteSerializer(serializers.ModelSerializer):
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    items = PurchaseOrderItemWriteSerializer(many=True, required=False, default=list)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'code',
            'supplier',
            'responsible_name',
            'order_date',
            'expected_delivery_date',
            'discount_type',
            'discount_value',
            'shipping_fee',
            'vat_percent',
            'vat_amount',
            'other_fee_label',
            'other_fee',
            'total_value',
            'status',
            'notes',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_value']

    def validate(self, attrs):
        items = attrs.get('items', serializers.empty)
        status_value = attrs.get('status') or getattr(self.instance, 'status', PurchaseOrder.STATUS_DRAFT)
        supplier = attrs.get('supplier', getattr(self.instance, 'supplier', None))
        responsible_name = attrs.get('responsible_name', getattr(self.instance, 'responsible_name', ''))
        order_date = attrs.get('order_date', getattr(self.instance, 'order_date', None))
        expected_delivery_date = attrs.get('expected_delivery_date', getattr(self.instance, 'expected_delivery_date', None))
        discount_type = attrs.get('discount_type', getattr(self.instance, 'discount_type', PurchaseOrder.DISCOUNT_PERCENT))
        discount_value = _to_decimal(attrs.get('discount_value', getattr(self.instance, 'discount_value', ZERO)))
        shipping_fee = _to_decimal(attrs.get('shipping_fee', getattr(self.instance, 'shipping_fee', ZERO)))
        vat_percent = _to_decimal(attrs.get('vat_percent', getattr(self.instance, 'vat_percent', ZERO)))
        vat_amount = _to_decimal(attrs.get('vat_amount', getattr(self.instance, 'vat_amount', ZERO)))
        other_fee = _to_decimal(attrs.get('other_fee', getattr(self.instance, 'other_fee', ZERO)))
        other_fee_label = attrs.get('other_fee_label', getattr(self.instance, 'other_fee_label', ''))

        if order_date and expected_delivery_date and expected_delivery_date < order_date:
            raise serializers.ValidationError({
                'expected_delivery_date': 'Ngày về kho dự kiến phải từ ngày đặt hàng trở đi.',
            })

        if discount_value < ZERO:
            raise serializers.ValidationError({'discount_value': 'Giá trị chiết khấu không được âm.'})
        if shipping_fee < ZERO:
            raise serializers.ValidationError({'shipping_fee': 'Phí vận chuyển không được âm.'})
        if vat_percent < ZERO:
            raise serializers.ValidationError({'vat_percent': 'VAT phần trăm không được âm.'})
        if vat_percent > Decimal('100'):
            raise serializers.ValidationError({'vat_percent': 'VAT phần trăm không được vượt quá 100%.'})
        if vat_amount < ZERO:
            raise serializers.ValidationError({'vat_amount': 'VAT không được âm.'})
        if other_fee < ZERO:
            raise serializers.ValidationError({'other_fee': 'Chi phí khác không được âm.'})
        if other_fee > ZERO and not str(other_fee_label or '').strip():
            raise serializers.ValidationError({'other_fee_label': 'Nội dung chi phí khác là bắt buộc.'})

        if discount_type == PurchaseOrder.DISCOUNT_PERCENT and discount_value > Decimal('100'):
            raise serializers.ValidationError({'discount_value': 'Chiết khấu phần trăm không được vượt quá 100%.'})

        if status_value != PurchaseOrder.STATUS_DRAFT:
            next_errors = {}
            if supplier is None:
                next_errors['supplier'] = 'Nhà cung cấp là bắt buộc.'
            if not str(responsible_name or '').strip():
                next_errors['responsible_name'] = 'Người phụ trách là bắt buộc.'
            if not order_date:
                next_errors['order_date'] = 'Ngày đặt hàng là bắt buộc.'
            if not expected_delivery_date:
                next_errors['expected_delivery_date'] = 'Ngày về kho dự kiến là bắt buộc.'
            if items is not serializers.empty and len(items) == 0:
                next_errors['items'] = 'Phiếu đặt hàng phải có ít nhất 1 nguyên vật liệu.'
            elif items is serializers.empty and self.instance and not self.instance.items.exists():
                next_errors['items'] = 'Phiếu đặt hàng phải có ít nhất 1 nguyên vật liệu.'
            if next_errors:
                raise serializers.ValidationError(next_errors)

        if items is not serializers.empty:
            material_ids = [item['material_id'] for item in items]
            if len(material_ids) != len(set(material_ids)):
                raise serializers.ValidationError({'items': 'Nguyên vật liệu trong phiếu không được trùng nhau.'})

        return attrs

    def _calculate_totals(self, items_data, attrs, instance=None):
        line_items = items_data
        if line_items is serializers.empty:
            line_items = [
                {
                    'material_id': item.material_id,
                    'quantity': item.quantity,
                    'unit': item.unit,
                    'unit_price': item.unit_price,
                    'notes': item.notes,
                }
                for item in instance.items.all()
            ] if instance else []

        total_goods = ZERO
        prepared_items = []
        material_map = {
            material.id: material
            for material in Material.objects.filter(id__in=[item['material_id'] for item in line_items])
        }

        for item in line_items:
            material = material_map[item['material_id']]
            quantity = _to_decimal(item['quantity'])
            unit_price = _to_decimal(item['unit_price'])
            line_total = _round_money(quantity * unit_price)
            total_goods += line_total
            prepared_items.append({
                'material': material,
                'quantity': quantity,
                'unit': item.get('unit') or material.unit or '',
                'unit_price': unit_price,
                'line_total': line_total,
                'notes': item.get('notes', ''),
            })

        discount_type = attrs.get('discount_type', getattr(instance, 'discount_type', PurchaseOrder.DISCOUNT_PERCENT) if instance else PurchaseOrder.DISCOUNT_PERCENT)
        discount_value = _to_decimal(attrs.get('discount_value', getattr(instance, 'discount_value', ZERO) if instance else ZERO))
        shipping_fee = _round_money(attrs.get('shipping_fee', getattr(instance, 'shipping_fee', ZERO) if instance else ZERO))
        vat_percent = _to_decimal(attrs.get('vat_percent', getattr(instance, 'vat_percent', ZERO) if instance else ZERO))
        other_fee = _round_money(attrs.get('other_fee', getattr(instance, 'other_fee', ZERO) if instance else ZERO))

        if discount_type == PurchaseOrder.DISCOUNT_PERCENT:
            discount_amount = _round_money(total_goods * discount_value / Decimal('100'))
        else:
            discount_amount = _round_money(discount_value)
        if discount_amount > total_goods:
            discount_amount = total_goods

        vat_amount = attrs.get('vat_amount', serializers.empty)
        if vat_amount is serializers.empty:
            vat_amount = _round_money((total_goods - discount_amount) * vat_percent / Decimal('100'))
        else:
            vat_amount = _round_money(vat_amount)

        total_value = _round_money(total_goods - discount_amount + shipping_fee + vat_amount + other_fee)
        return prepared_items, {
            'total_goods_value': _round_money(total_goods),
            'discount_amount': discount_amount,
            'shipping_fee': shipping_fee,
            'vat_percent': vat_percent,
            'vat_amount': vat_amount,
            'other_fee_label': attrs.get('other_fee_label', getattr(instance, 'other_fee_label', '') if instance else ''),
            'other_fee': other_fee,
            'total_value': total_value,
        }

    def _save_items(self, purchase_order, prepared_items):
        purchase_order.items.all().delete()
        PurchaseOrderItem.objects.bulk_create([
            PurchaseOrderItem(
                purchase_order=purchase_order,
                material=item['material'],
                quantity=item['quantity'],
                unit=item['unit'],
                unit_price=item['unit_price'],
                line_total=item['line_total'],
                notes=item['notes'],
            )
            for item in prepared_items
        ])

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        if not validated_data.get('code'):
            validated_data['code'] = _next_purchase_order_code()
        prepared_items, totals = self._calculate_totals(items_data, validated_data)
        payload = {**validated_data, **totals}
        purchase_order = PurchaseOrder.objects.create(**payload)
        self._save_items(purchase_order, prepared_items)
        return purchase_order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', serializers.empty)
        prepared_items, totals = self._calculate_totals(items_data, validated_data, instance=instance)
        for attr, value in {**validated_data, **totals}.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not serializers.empty:
            self._save_items(instance, prepared_items)
        else:
            # Keep line_total in sync even if only financial fields changed.
            for item in instance.items.all():
                line_total = _round_money(item.quantity * item.unit_price)
                if item.line_total != line_total:
                    item.line_total = line_total
                    item.save(update_fields=['line_total', 'updated_at'])
        return instance
