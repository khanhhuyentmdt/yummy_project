from rest_framework import serializers
from api.models import Location, LocationHistory


class LocationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = LocationHistory
        fields = ['id', 'timestamp', 'actor_name', 'action']


class LocationSerializer(serializers.ModelSerializer):
    manager_id   = serializers.IntegerField(source='manager.id', read_only=True, allow_null=True)
    manager_name = serializers.SerializerMethodField()
    location_types_list = serializers.SerializerMethodField()
    history = LocationHistorySerializer(many=True, read_only=True)

    def get_manager_name(self, obj):
        if obj.manager:
            return obj.manager.full_name or obj.manager.phone_number
        return ''

    def get_location_types_list(self, obj):
        if not obj.location_types:
            return []
        return [t for t in obj.location_types.split(',') if t]

    class Meta:
        model  = Location
        fields = [
            'id', 'code', 'name',
            'manager_id', 'manager_name',
            'phone', 'email',
            'address', 'province', 'district', 'ward',
            'location_types', 'location_types_list',
            'manage_nvl', 'manage_btp', 'manage_thanh_pham', 'allow_delivery',
            'status', 'created_by_name', 'created_at', 'updated_at',
            'history',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LocationWriteSerializer(serializers.Serializer):
    code              = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    name              = serializers.CharField(max_length=200)
    manager_id        = serializers.IntegerField(required=False, allow_null=True)
    phone             = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    email             = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')
    address           = serializers.CharField(required=False, allow_blank=True, default='')
    province          = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    district          = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    ward              = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    location_types    = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    manage_nvl        = serializers.BooleanField(required=False, default=False)
    manage_btp        = serializers.BooleanField(required=False, default=False)
    manage_thanh_pham = serializers.BooleanField(required=False, default=False)
    allow_delivery    = serializers.BooleanField(required=False, default=False)
    status            = serializers.ChoiceField(
        choices=['active', 'inactive'], required=False, default='active'
    )

    def validate_name(self, value):
        name = value.strip()
        qs = Location.objects.filter(name__iexact=name)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Tên địa điểm này đã được sử dụng.')
        return value

    def _get_manager(self, manager_id):
        if not manager_id:
            return None
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            return User.objects.get(pk=manager_id)
        except User.DoesNotExist:
            return None

    def _auto_code(self):
        """Generate sequential code MDD001, MDD002, etc."""
        # Get the latest location code
        latest = Location.objects.order_by('-code').first()
        if not latest or not latest.code.startswith('MDD'):
            return 'MDD001'
        
        try:
            # Extract number from code like 'MDD004'
            last_num = int(latest.code[3:])
            new_num = last_num + 1
            return f'MDD{new_num:03d}'
        except (ValueError, IndexError):
            return 'MDD001'

    def create(self, validated_data):
        location_types_list = validated_data.pop('location_types', [])
        manager_id          = validated_data.pop('manager_id', None)
        code                = validated_data.pop('code', '').strip()

        return Location.objects.create(
            code=code or self._auto_code(),
            manager=self._get_manager(manager_id),
            location_types=','.join(location_types_list),
            **validated_data,
        )

    def update(self, instance, validated_data):
        location_types_list = validated_data.pop('location_types', None)
        manager_id          = validated_data.pop('manager_id', -1)

        if location_types_list is not None:
            instance.location_types = ','.join(location_types_list)
        if manager_id != -1:
            instance.manager = self._get_manager(manager_id)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
