from rest_framework import serializers
from api.models import Material


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
