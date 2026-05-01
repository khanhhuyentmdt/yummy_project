from rest_framework import serializers
from api.models import ProductGroup


class ProductGroupSerializer(serializers.ModelSerializer):
    """Serializer cho đọc ProductGroup"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductGroup
        fields = [
            'id', 'code', 'name', 'description', 'status',
            'product_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_product_count(self, obj):
        return obj.products.count()


class ProductGroupCreateSerializer(serializers.ModelSerializer):
    """Serializer cho tạo/cập nhật ProductGroup"""
    
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    class Meta:
        model = ProductGroup
        fields = [
            'id', 'code', 'name', 'description', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_code(self, value):
        """Validate mã nhóm không trùng (không phân biệt hoa thường)"""
        if not value:
            return value
        
        # Kiểm tra trùng mã (không phân biệt hoa thường)
        instance_id = self.instance.id if self.instance else None
        existing = ProductGroup.objects.filter(code__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        
        if existing.exists():
            raise serializers.ValidationError(
                f'Mã nhóm sản phẩm "{value}" đã tồn tại. Vui lòng chọn mã khác.'
            )
        return value
    
    def validate_name(self, value):
        """Validate tên nhóm không trùng (không phân biệt hoa thường)"""
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Tên nhóm sản phẩm không được để trống.')
        
        # Kiểm tra trùng tên (không phân biệt hoa thường)
        instance_id = self.instance.id if self.instance else None
        existing = ProductGroup.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên nhóm sản phẩm "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value
    
    def _generate_next_code(self):
        """Tự động tạo mã nhóm tiếp theo dựa trên mã cao nhất"""
        # Lấy tất cả mã nhóm có format NSPxxx
        groups = ProductGroup.objects.filter(code__regex=r'^NSP\d+$').order_by('-code')
        
        if not groups.exists():
            return 'NSP001'
        
        # Lấy mã cao nhất
        highest_code = groups.first().code
        try:
            # Lấy số từ mã (bỏ "NSP")
            number = int(highest_code[3:])
            next_number = number + 1
            return f'NSP{next_number:03d}'
        except (ValueError, IndexError):
            # Nếu không parse được, bắt đầu từ NSP001
            return 'NSP001'
    
    def create(self, validated_data):
        # Auto-generate mã nhóm theo format NSP001, NSP002,... nếu không có
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_code()
        
        return ProductGroup.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
