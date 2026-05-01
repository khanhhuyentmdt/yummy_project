from django.db import transaction
from rest_framework import serializers

from api.models import (
    WorkShift, WorkShiftBreak, WorkShiftHistory,
    WorkSchedule, WorkScheduleHistory,
    Attendance, AttendanceHistory,
    Employee,
)


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


# ─── WorkSchedule Serializers ────────────────────────────────────────────────

class WorkScheduleHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkScheduleHistory
        fields = ['id', 'timestamp', 'actor_name', 'action', 'field_name', 'old_value', 'new_value']


class WorkScheduleSerializer(serializers.ModelSerializer):
    employee_name  = serializers.SerializerMethodField()
    employee_code  = serializers.SerializerMethodField()
    shift_name     = serializers.SerializerMethodField()
    shift_code     = serializers.SerializerMethodField()
    history        = WorkScheduleHistorySerializer(many=True, read_only=True)

    def get_employee_name(self, obj):
        return obj.employee.full_name if obj.employee_id else ''

    def get_employee_code(self, obj):
        return obj.employee.code if obj.employee_id else ''

    def get_shift_name(self, obj):
        return obj.work_shift.name if obj.work_shift_id else ''

    def get_shift_code(self, obj):
        return obj.work_shift.code if obj.work_shift_id else ''

    class Meta:
        model  = WorkSchedule
        fields = [
            'id', 'code', 'employee', 'employee_name', 'employee_code',
            'work_shift', 'shift_name', 'shift_code',
            'start_date', 'end_date', 'repeat_type', 'days_of_week',
            'notes', 'status', 'created_by_name', 'created_at', 'updated_at',
            'history',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkScheduleWriteSerializer(serializers.Serializer):
    code        = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    employee    = serializers.IntegerField()
    work_shift  = serializers.IntegerField(required=False, allow_null=True, default=None)
    start_date  = serializers.DateField()
    end_date    = serializers.DateField(required=False, allow_null=True, default=None)
    repeat_type = serializers.ChoiceField(choices=['once', 'weekly', 'monthly'], default='once')
    days_of_week = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    notes       = serializers.CharField(required=False, allow_blank=True, default='')
    status      = serializers.ChoiceField(choices=['active', 'inactive'], default='active')

    def _auto_code(self):
        latest = WorkSchedule.objects.filter(code__startswith='LLV').order_by('-code').first()
        if not latest:
            return 'LLV001'
        try:
            return f'LLV{int(latest.code[3:]) + 1:03d}'
        except (ValueError, IndexError):
            return 'LLV001'

    def _track_changes(self, instance, old_data, new_data, actor_name):
        labels = {
            'employee':    'Nhân viên',
            'work_shift':  'Ca làm việc',
            'start_date':  'Ngày bắt đầu',
            'end_date':    'Ngày kết thúc',
            'repeat_type': 'Kiểu lặp',
            'days_of_week':'Ngày trong tuần',
            'status':      'Trạng thái',
        }
        for field, label in labels.items():
            old_val = str(old_data.get(field, ''))
            new_val = str(new_data.get(field, ''))
            if old_val != new_val:
                WorkScheduleHistory.objects.create(
                    schedule=instance, actor_name=actor_name,
                    action=f'Cập nhật {label}', field_name=field,
                    old_value=old_val, new_value=new_val,
                )

    def create(self, validated_data):
        code       = validated_data.pop('code', '').strip()
        actor_name = validated_data.pop('actor_name', '')
        emp_id     = validated_data.pop('employee')
        shift_id   = validated_data.pop('work_shift', None)

        employee   = Employee.objects.get(pk=emp_id)
        work_shift = WorkShift.objects.get(pk=shift_id) if shift_id else None

        schedule = WorkSchedule.objects.create(
            code=code or self._auto_code(),
            employee=employee,
            work_shift=work_shift,
            created_by_name=actor_name,
            **validated_data,
        )
        WorkScheduleHistory.objects.create(
            schedule=schedule, actor_name=actor_name,
            action=f'Tạo mới lịch làm việc {schedule.code}',
        )
        return schedule

    def update(self, instance, validated_data):
        actor_name = validated_data.pop('actor_name', '')
        validated_data.pop('code', None)
        emp_id   = validated_data.pop('employee', None)
        shift_id = validated_data.pop('work_shift', None)

        old_data = {
            'employee':    str(instance.employee_id),
            'work_shift':  str(instance.work_shift_id),
            'start_date':  str(instance.start_date),
            'end_date':    str(instance.end_date),
            'repeat_type': instance.repeat_type,
            'days_of_week':instance.days_of_week,
            'status':      instance.status,
        }

        if emp_id is not None:
            instance.employee = Employee.objects.get(pk=emp_id)
        if shift_id is not None:
            instance.work_shift = WorkShift.objects.get(pk=shift_id)
        elif 'work_shift' in self.initial_data and self.initial_data['work_shift'] in (None, '', 'null'):
            instance.work_shift = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        new_data = {
            'employee':    str(instance.employee_id),
            'work_shift':  str(instance.work_shift_id),
            'start_date':  str(instance.start_date),
            'end_date':    str(instance.end_date),
            'repeat_type': instance.repeat_type,
            'days_of_week':instance.days_of_week,
            'status':      instance.status,
        }
        self._track_changes(instance, old_data, new_data, actor_name)
        return instance


# ─── Attendance Serializers ───────────────────────────────────────────────────

class AttendanceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = AttendanceHistory
        fields = ['id', 'timestamp', 'actor_name', 'action', 'field_name', 'old_value', 'new_value']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.SerializerMethodField()
    shift_name    = serializers.SerializerMethodField()
    shift_code    = serializers.SerializerMethodField()
    history       = AttendanceHistorySerializer(many=True, read_only=True)

    def get_employee_name(self, obj):
        return obj.employee.full_name if obj.employee_id else ''

    def get_employee_code(self, obj):
        return obj.employee.code if obj.employee_id else ''

    def get_shift_name(self, obj):
        return obj.work_shift.name if obj.work_shift_id else ''

    def get_shift_code(self, obj):
        return obj.work_shift.code if obj.work_shift_id else ''

    class Meta:
        model  = Attendance
        fields = [
            'id', 'code', 'employee', 'employee_name', 'employee_code',
            'work_shift', 'shift_name', 'shift_code',
            'attendance_date', 'check_in_time', 'check_out_time',
            'status', 'overtime_minutes', 'notes',
            'created_by_name', 'created_at', 'updated_at',
            'history',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceWriteSerializer(serializers.Serializer):
    code             = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    employee         = serializers.IntegerField()
    work_shift       = serializers.IntegerField(required=False, allow_null=True, default=None)
    attendance_date  = serializers.DateField()
    check_in_time    = serializers.TimeField(required=False, allow_null=True, default=None)
    check_out_time   = serializers.TimeField(required=False, allow_null=True, default=None)
    status           = serializers.ChoiceField(
        choices=['present', 'absent', 'late', 'early_leave', 'leave'], default='present',
    )
    overtime_minutes = serializers.IntegerField(required=False, default=0, min_value=0)
    notes            = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, data):
        emp_id = data.get('employee')
        date   = data.get('attendance_date')
        if emp_id and date:
            qs = Attendance.objects.filter(employee_id=emp_id, attendance_date=date)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {'attendance_date': 'Nhân viên này đã có bản ghi chấm công cho ngày đó.'}
                )
        return data

    def _auto_code(self):
        latest = Attendance.objects.filter(code__startswith='CC').order_by('-code').first()
        if not latest:
            return 'CC001'
        try:
            return f'CC{int(latest.code[2:]) + 1:03d}'
        except (ValueError, IndexError):
            return 'CC001'

    def _track_changes(self, instance, old_data, new_data, actor_name):
        labels = {
            'employee':        'Nhân viên',
            'work_shift':      'Ca làm việc',
            'attendance_date': 'Ngày chấm công',
            'check_in_time':   'Giờ vào',
            'check_out_time':  'Giờ ra',
            'status':          'Trạng thái',
            'overtime_minutes':'Tăng ca (phút)',
        }
        for field, label in labels.items():
            old_val = str(old_data.get(field, ''))
            new_val = str(new_data.get(field, ''))
            if old_val != new_val:
                AttendanceHistory.objects.create(
                    attendance=instance, actor_name=actor_name,
                    action=f'Cập nhật {label}', field_name=field,
                    old_value=old_val, new_value=new_val,
                )

    def create(self, validated_data):
        code       = validated_data.pop('code', '').strip()
        actor_name = validated_data.pop('actor_name', '')
        emp_id     = validated_data.pop('employee')
        shift_id   = validated_data.pop('work_shift', None)

        employee   = Employee.objects.get(pk=emp_id)
        work_shift = WorkShift.objects.get(pk=shift_id) if shift_id else None

        attendance = Attendance.objects.create(
            code=code or self._auto_code(),
            employee=employee,
            work_shift=work_shift,
            created_by_name=actor_name,
            **validated_data,
        )
        AttendanceHistory.objects.create(
            attendance=attendance, actor_name=actor_name,
            action=f'Tạo mới bản ghi chấm công {attendance.code}',
        )
        return attendance

    def update(self, instance, validated_data):
        actor_name = validated_data.pop('actor_name', '')
        validated_data.pop('code', None)
        emp_id   = validated_data.pop('employee', None)
        shift_id = validated_data.pop('work_shift', None)

        old_data = {
            'employee':        str(instance.employee_id),
            'work_shift':      str(instance.work_shift_id),
            'attendance_date': str(instance.attendance_date),
            'check_in_time':   str(instance.check_in_time),
            'check_out_time':  str(instance.check_out_time),
            'status':          instance.status,
            'overtime_minutes':str(instance.overtime_minutes),
        }

        if emp_id is not None:
            instance.employee = Employee.objects.get(pk=emp_id)
        if shift_id is not None:
            instance.work_shift = WorkShift.objects.get(pk=shift_id)
        elif 'work_shift' in self.initial_data and self.initial_data['work_shift'] in (None, '', 'null'):
            instance.work_shift = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        new_data = {
            'employee':        str(instance.employee_id),
            'work_shift':      str(instance.work_shift_id),
            'attendance_date': str(instance.attendance_date),
            'check_in_time':   str(instance.check_in_time),
            'check_out_time':  str(instance.check_out_time),
            'status':          instance.status,
            'overtime_minutes':str(instance.overtime_minutes),
        }
        self._track_changes(instance, old_data, new_data, actor_name)
        return instance


__all__ = [
    'WorkShiftBreakSerializer',
    'WorkShiftHistorySerializer',
    'WorkShiftSerializer',
    'WorkShiftWriteSerializer',
    'WorkScheduleHistorySerializer',
    'WorkScheduleSerializer',
    'WorkScheduleWriteSerializer',
    'AttendanceHistorySerializer',
    'AttendanceSerializer',
    'AttendanceWriteSerializer',
]
