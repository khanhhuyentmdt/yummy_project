from rest_framework import serializers

from api.models import MaterialInventory


STATUS_LABEL_MAP = {
    MaterialInventory.STATUS_HET_HAN:      'Hết hạn',
    MaterialInventory.STATUS_CAN_DATE:     'Cận date',
    MaterialInventory.STATUS_HET_HANG:     'Hết hàng',
    MaterialInventory.STATUS_SAP_HET_HANG: 'Sắp hết hàng',
    MaterialInventory.STATUS_CON_HANG:     'Còn hàng',
}


class MaterialInventorySerializer(serializers.ModelSerializer):
    # Material fields
    material_id    = serializers.IntegerField(source='material.id', read_only=True)
    material_code  = serializers.CharField(source='material.code', read_only=True)
    material_name  = serializers.CharField(source='material.name', read_only=True)
    material_group = serializers.CharField(source='material.group', read_only=True)
    material_unit  = serializers.CharField(source='material.unit', read_only=True)
    material_image = serializers.SerializerMethodField()
    material_status = serializers.CharField(source='material.status', read_only=True)

    # Computed inventory status
    inventory_status       = serializers.SerializerMethodField()
    inventory_status_label = serializers.SerializerMethodField()
    total_value            = serializers.SerializerMethodField()

    class Meta:
        model = MaterialInventory
        fields = [
            'id',
            'material_id',
            'material_code',
            'material_name',
            'material_group',
            'material_unit',
            'material_image',
            'material_status',
            'quantity',
            'min_quantity',
            'near_expiry_days',
            'expiry_date',
            'unit_cost',
            'inventory_status',
            'inventory_status_label',
            'total_value',
            'last_updated',
        ]

    def get_material_image(self, obj):
        request = self.context.get('request')
        image = obj.material.image
        if not image:
            return ''
        if request:
            return request.build_absolute_uri(image.url)
        return image.url

    def get_inventory_status(self, obj):
        return obj.get_inventory_status()

    def get_inventory_status_label(self, obj):
        return STATUS_LABEL_MAP.get(obj.get_inventory_status(), 'Còn hàng')

    def get_total_value(self, obj):
        return int(obj.get_total_value())
