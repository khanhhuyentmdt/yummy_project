from rest_framework import serializers
from api.models import Material, MaterialGroup


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

    def validate_group(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Nhóm nguyên vật liệu không được để trống.')
        if not MaterialGroup.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError('Nhóm nguyên vật liệu không tồn tại.')
        return value

    def validate_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Tên nguyên vật liệu không được để trống.')

        instance_id = self.instance.id if self.instance else None
        existing = Material.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)

        if existing.exists():
            raise serializers.ValidationError(
                f'Tên nguyên vật liệu "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def _generate_next_code(self):
        materials = Material.objects.filter(code__regex=r'^NVL\d+$').order_by('-code')
        if not materials.exists():
            return 'NVL001'

        highest_code = materials.first().code
        try:
            number = int(highest_code[3:])
            return f'NVL{number + 1:03d}'
        except (ValueError, IndexError):
            return 'NVL001'

    def create(self, validated_data):
        if not validated_data.get('code'):
            # Generate sequential code NVL001, NVL002, etc.
            latest = Material.objects.order_by('-code').first()
            if not latest or not latest.code.startswith('NVL'):
                validated_data['code'] = 'NVL001'
            else:
                try:
                    last_num = int(latest.code[3:])
                    new_num = last_num + 1
                    validated_data['code'] = f'NVL{new_num:03d}'
                except (ValueError, IndexError):
                    validated_data['code'] = 'NVL001'
        return Material.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
