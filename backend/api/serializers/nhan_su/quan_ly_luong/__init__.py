from rest_framework import serializers
from api.models import Bonus, BonusHistory, Employee


# ─── Bonus History Serializer ────────────────────────────────────────────────

class BonusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BonusHistory
        fields = ['id', 'timestamp', 'actor_name', 'action', 'field_name', 'old_value', 'new_value']


# ─── Bonus Read Serializer ───────────────────────────────────────────────────

class BonusSerializer(serializers.ModelSerializer):
    employees_list = serializers.SerializerMethodField()
    history = BonusHistorySerializer(many=True, read_only=True)
    
    def get_employees_list(self, obj):
        return [
            {
                'id': emp.id,
                'code': emp.code,
                'full_name': emp.full_name,
                'role': emp.role,
            }
            for emp in obj.employees.all()
        ]
    
    class Meta:
        model = Bonus
        fields = [
            'id', 'code', 'reason', 'bonus_date',
            'recipient_type', 'bonus_type',
            'amount_per_person', 'employee_count', 'total_amount',
            'employees_list', 'notes', 'status',
            'created_by_name', 'created_at', 'updated_at',
            'history',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Bonus Write Serializer ──────────────────────────────────────────────────

class BonusWriteSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    reason = serializers.CharField(max_length=500)
    bonus_date = serializers.DateField(required=False, allow_null=True)
    recipient_type = serializers.ChoiceField(choices=['all', 'selected'], default='selected')
    bonus_type = serializers.ChoiceField(choices=['direct', 'salary'], default='direct')
    amount_per_person = serializers.DecimalField(max_digits=15, decimal_places=0, default=0)
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
        allow_empty=True,
    )
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    status = serializers.ChoiceField(choices=['pending', 'paid', 'cancelled'], required=False, default='pending')
    
    def validate_employee_ids(self, value):
        """Validate employees exist"""
        if value:
            existing_ids = set(Employee.objects.filter(id__in=value).values_list('id', flat=True))
            invalid_ids = set(value) - existing_ids
            if invalid_ids:
                raise serializers.ValidationError(f'Nhân viên với ID {invalid_ids} không tồn tại.')
        return value
    
    def _auto_code(self):
        """Generate sequential code MTH001, MTH002, etc."""
        latest = Bonus.objects.filter(
            code__startswith='MTH',
            code__regex=r'^MTH\d{3}$'
        ).order_by('-code').first()
        
        if not latest:
            return 'MTH001'
        
        try:
            last_num = int(latest.code[3:])
            new_num = last_num + 1
            return f'MTH{new_num:03d}'
        except (ValueError, IndexError):
            count = Bonus.objects.filter(code__startswith='MTH').count()
            return f'MTH{count + 1:03d}'
    
    def _track_changes(self, instance, old_data, new_data, actor_name):
        """Track field changes for audit trail"""
        changes = []
        field_labels = {
            'reason': 'Lý do thưởng',
            'bonus_date': 'Ngày thưởng',
            'amount_per_person': 'Mức thưởng từng',
            'employee_count': 'Số lượng NV',
            'total_amount': 'Tổng tiền',
            'status': 'Trạng thái',
            'recipient_type': 'Loại người nhận',
            'bonus_type': 'Hình thức thưởng',
        }
        
        for field, label in field_labels.items():
            old_val = str(old_data.get(field, ''))
            new_val = str(new_data.get(field, ''))
            if old_val != new_val:
                changes.append({
                    'field_name': field,
                    'field_label': label,
                    'old_value': old_val,
                    'new_value': new_val,
                })
        
        for change in changes:
            BonusHistory.objects.create(
                bonus=instance,
                actor_name=actor_name,
                action=f'Cập nhật {change["field_label"]}',
                field_name=change['field_name'],
                old_value=change['old_value'],
                new_value=change['new_value'],
            )
    
    def create(self, validated_data):
        employee_ids = validated_data.pop('employee_ids', [])
        code = validated_data.pop('code', '').strip()
        
        # Calculate employee_count and total_amount
        if validated_data['recipient_type'] == 'all':
            employee_count = Employee.objects.filter(status='working').count()
        else:
            employee_count = len(employee_ids)
        
        validated_data['employee_count'] = employee_count
        validated_data['total_amount'] = validated_data['amount_per_person'] * employee_count
        
        bonus = Bonus.objects.create(
            code=code or self._auto_code(),
            **validated_data,
        )
        
        # Set employees
        if validated_data['recipient_type'] == 'all':
            employees = Employee.objects.filter(status='working')
            bonus.employees.set(employees)
        elif employee_ids:
            employees = Employee.objects.filter(id__in=employee_ids)
            bonus.employees.set(employees)
        
        # Create history entry
        BonusHistory.objects.create(
            bonus=bonus,
            actor_name=validated_data.get('created_by_name', ''),
            action='Tạo mới thưởng',
        )
        
        return bonus
    
    def update(self, instance, validated_data):
        # Capture old data for audit trail
        old_data = {
            'reason': instance.reason,
            'bonus_date': str(instance.bonus_date) if instance.bonus_date else '',
            'amount_per_person': str(instance.amount_per_person),
            'employee_count': str(instance.employee_count),
            'total_amount': str(instance.total_amount),
            'status': instance.status,
            'recipient_type': instance.recipient_type,
            'bonus_type': instance.bonus_type,
        }
        
        employee_ids = validated_data.pop('employee_ids', None)
        # Remove code from validated_data to prevent overwriting
        validated_data.pop('code', None)
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Recalculate employee_count and total_amount
        if 'recipient_type' in validated_data:
            if validated_data['recipient_type'] == 'all':
                instance.employee_count = Employee.objects.filter(status='working').count()
            elif employee_ids is not None:
                instance.employee_count = len(employee_ids)
        elif employee_ids is not None:
            instance.employee_count = len(employee_ids)
        
        if 'amount_per_person' in validated_data or employee_ids is not None:
            instance.total_amount = instance.amount_per_person * instance.employee_count
        
        instance.save()
        
        # Update employees
        if employee_ids is not None:
            if instance.recipient_type == 'all':
                employees = Employee.objects.filter(status='working')
                instance.employees.set(employees)
            else:
                employees = Employee.objects.filter(id__in=employee_ids)
                instance.employees.set(employees)
        
        # Track changes
        new_data = {
            'reason': instance.reason,
            'bonus_date': str(instance.bonus_date) if instance.bonus_date else '',
            'amount_per_person': str(instance.amount_per_person),
            'employee_count': str(instance.employee_count),
            'total_amount': str(instance.total_amount),
            'status': instance.status,
            'recipient_type': instance.recipient_type,
            'bonus_type': instance.bonus_type,
        }
        
        actor_name = validated_data.get('created_by_name', '')
        self._track_changes(instance, old_data, new_data, actor_name)
        
        return instance


__all__ = [
    'BonusSerializer',
    'BonusWriteSerializer',
    'BonusHistorySerializer',
]
