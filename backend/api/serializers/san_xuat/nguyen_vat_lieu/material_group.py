from rest_framework import serializers
from api.models import Material, MaterialGroup


class MaterialGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialGroup
        fields = [
            'id', 'code', 'name', 'description', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MaterialGroupWriteSerializer(serializers.ModelSerializer):
    code = serializers.CharField(max_length=20, required=False, allow_blank=True)

    class Meta:
        model = MaterialGroup
        fields = [
            'id', 'code', 'name', 'description', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_code(self, value):
        if not value:
            return value

        instance_id = self.instance.id if self.instance else None
        existing = MaterialGroup.objects.filter(code__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Mã nhóm nguyên vật liệu "{value}" đã tồn tại. Vui lòng chọn mã khác.'
            )
        return value

    def validate_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Tên nhóm nguyên vật liệu không được để trống.')

        instance_id = self.instance.id if self.instance else None
        existing = MaterialGroup.objects.filter(name__iexact=value)
        if instance_id:
            existing = existing.exclude(id=instance_id)
        if existing.exists():
            raise serializers.ValidationError(
                f'Tên nhóm nguyên vật liệu "{value}" đã tồn tại. Vui lòng chọn tên khác.'
            )
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not self.instance:
            return attrs

        next_name = attrs.get('name', self.instance.name).strip()
        current_name = self.instance.name
        if next_name != current_name and Material.objects.filter(group=current_name).exists():
            raise serializers.ValidationError({
                'name': 'Không thể đổi tên nhóm khi đang có nguyên vật liệu thuộc nhóm này.'
            })
        return attrs

    def _generate_next_code(self):
        groups = MaterialGroup.objects.filter(code__regex=r'^MNH\d+$').order_by('-code')
        if not groups.exists():
            return 'MNH001'

        highest_code = groups.first().code
        try:
            number = int(highest_code[3:])
            return f'MNH{number + 1:03d}'
        except (ValueError, IndexError):
            return 'MNH001'

    def create(self, validated_data):
        if not validated_data.get('code'):
            validated_data['code'] = self._generate_next_code()
        return MaterialGroup.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
