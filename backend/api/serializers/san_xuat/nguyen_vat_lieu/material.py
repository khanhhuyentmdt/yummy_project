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
            import time
            suffix = int(time.time() * 1000) % 1000000
            validated_data['code'] = f'NVL{suffix:06d}'
            while Material.objects.filter(code=validated_data['code']).exists():
                suffix = (suffix + 1) % 1000000
                validated_data['code'] = f'NVL{suffix:06d}'
        return Material.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
