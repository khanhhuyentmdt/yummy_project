from django.db import transaction
from rest_framework import serializers

from api.models import WorkShift, WorkShiftBreak, WorkShiftHistory


class WorkShiftBreakSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkShiftBreak
        fields = ['id', 'break_start', 'break_end']


class WorkShiftHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkShiftHistory
        fields = ['id', 'timestamp', 'actor_name', 'action', 'field_name', 'old_value', 'new_value']


class WorkShiftSerializer(serializers.ModelSerializer):
    breaks      = WorkShiftBreakSerializer(many=True, read_only=True)
    history     = WorkShiftHistorySerializer(many=True, read_only=True)
    total_hours = serializers.SerializerMethodField()
    total_hours_display = serializers.SerializerMethodField()

    def get_total_hours(self, obj):
        return obj.total_hours
    
    def get_total_hours_display(self, obj):
        return obj.total_hours_display

    class Meta:
        model  = WorkShift
        fields = [
            'id', 'code', 'name',
            'start_time', 'end_time', 'total_hours', 'total_hours_display',
            'status', 'created_by_name', 'created_at', 'updated_at',
            'breaks', 'history',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkShiftWriteSerializer(serializers.Serializer):
    code       = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    name       = serializers.CharField(max_length=200)
    start_time = serializers.TimeField()
    end_time   = serializers.TimeField()
    status     = serializers.ChoiceField(
        choices=['active', 'inactive'], required=False, default='active'
    )
    breaks = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        required=False,
        default=list,
    )

    def validate_name(self, value):
        qs = WorkShift.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ten ca lam viec nay da duoc su dung.')
        return value

    def _auto_code(self):
        """Generate sequential code CLV001, CLV002, etc."""
        # Get the latest shift code
        latest = WorkShift.objects.order_by('-code').first()
        if not latest or not latest.code.startswith('CLV'):
            return 'CLV001'
        
        try:
            # Extract number from code like 'CLV004'
            last_num = int(latest.code[3:])
            new_num = last_num + 1
            return f'CLV{new_num:03d}'
        except (ValueError, IndexError):
            return 'CLV001'

    def _parse_breaks(self, breaks_data):
        result = []
        for item in breaks_data:
            bs = item.get('break_start', '')
            be = item.get('break_end', '')
            if bs and be:
                result.append({'break_start': bs, 'break_end': be})
        return result

    def _track_changes(self, instance, old_data, new_data, actor_name):
        """Track field changes for audit trail"""
        field_labels = {
            'name': 'Tên ca làm việc',
            'start_time': 'Giờ bắt đầu',
            'end_time': 'Giờ kết thúc',
            'status': 'Trạng thái',
        }
        
        for field, label in field_labels.items():
            old_val = str(old_data.get(field, ''))
            new_val = str(new_data.get(field, ''))
            if old_val != new_val:
                WorkShiftHistory.objects.create(
                    shift=instance,
                    actor_name=actor_name,
                    action=f'Cập nhật {label}',
                    field_name=field,
                    old_value=old_val,
                    new_value=new_val,
                )

    def create(self, validated_data):
        breaks_data = validated_data.pop('breaks', [])
        code        = validated_data.pop('code', '').strip()
        actor_name  = validated_data.pop('actor_name', '')

        with transaction.atomic():
            shift = WorkShift.objects.create(
                code=code or self._auto_code(),
                created_by_name=actor_name,
                **validated_data,
            )
            for brk in self._parse_breaks(breaks_data):
                WorkShiftBreak.objects.create(shift=shift, **brk)
            WorkShiftHistory.objects.create(
                shift=shift,
                actor_name=actor_name,
                action=f'Tạo mới ca làm việc {shift.code}',
            )
        return shift

    def update(self, instance, validated_data):
        breaks_data = validated_data.pop('breaks', None)
        actor_name  = validated_data.pop('actor_name', '')
        validated_data.pop('code', None)

        # Capture old data for audit trail
        old_data = {
            'name': instance.name,
            'start_time': instance.start_time,
            'end_time': instance.end_time,
            'status': instance.status,
        }

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if breaks_data is not None:
                instance.breaks.all().delete()
                for brk in self._parse_breaks(breaks_data):
                    WorkShiftBreak.objects.create(shift=instance, **brk)

            # Track changes
            new_data = {
                'name': instance.name,
                'start_time': instance.start_time,
                'end_time': instance.end_time,
                'status': instance.status,
            }
            self._track_changes(instance, old_data, new_data, actor_name)
            
        return instance


__all__ = [
    'WorkShiftBreakSerializer',
    'WorkShiftHistorySerializer',
    'WorkShiftSerializer',
    'WorkShiftWriteSerializer',
]
