from rest_framework import serializers
from api.models import Bonus, BonusHistory, Employee, Benefit, BenefitHistory, Payroll, PayrollEmployee, PayrollHistory


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



# ─── Benefit History Serializer ──────────────────────────────────────────────

class BenefitHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BenefitHistory
        fields = ['id', 'timestamp', 'actor_name', 'action', 'field_name', 'old_value', 'new_value']


# ─── Benefit Read Serializer ─────────────────────────────────────────────────

class BenefitSerializer(serializers.ModelSerializer):
    history = BenefitHistorySerializer(many=True, read_only=True)
    attachment_url = serializers.SerializerMethodField()

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.attachment.url)
        return obj.attachment.url

    class Meta:
        model = Benefit
        fields = [
            'id', 'code', 'name', 'benefit_type', 'scope', 'cycle',
            'effective_from', 'effective_to', 'value', 'value_unit',
            'attachment', 'attachment_url', 'notes', 'status',
            'created_by_name', 'created_at', 'updated_at',
            'history',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Benefit Write Serializer ────────────────────────────────────────────────

class BenefitWriteSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    name = serializers.CharField(max_length=500)
    benefit_type = serializers.ChoiceField(
        choices=['phu_cap', 'chinh_sach', 'van_hoa', 'khac'], default='phu_cap'
    )
    scope = serializers.ChoiceField(
        choices=['toan_cong_ty', 'theo_vai_tro', 'ca_nhan'], default='toan_cong_ty'
    )
    cycle = serializers.ChoiceField(
        choices=['hang_ngay', 'hang_thang', 'hang_quy', 'hang_nam', 'ngay_le_tet', 'su_kien'],
        default='hang_thang',
    )
    effective_from = serializers.DateField(required=False, allow_null=True)
    effective_to = serializers.DateField(required=False, allow_null=True)
    value = serializers.DecimalField(max_digits=15, decimal_places=0, default=0)
    value_unit = serializers.ChoiceField(choices=['dong', 'phan_tram'], default='dong')
    attachment = serializers.FileField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    status = serializers.ChoiceField(
        choices=['active', 'inactive'], required=False, default='active'
    )

    def validate_name(self, value):
        """Kiem tra ten phucloi khong duoc trung."""
        qs = Benefit.objects.filter(name__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Tên phúc lợi này đã được sử dụng.')
        return value.strip()

    def _auto_code(self):
        """Sinh ma MPL001, MPL002, ..."""
        latest = Benefit.objects.filter(
            code__startswith='MPL',
            code__regex=r'^MPL\d{3,}$',
        ).order_by('-code').first()

        if not latest:
            return 'MPL001'
        try:
            last_num = int(latest.code[3:])
            return f'MPL{last_num + 1:03d}'
        except (ValueError, IndexError):
            count = Benefit.objects.filter(code__startswith='MPL').count()
            return f'MPL{count + 1:03d}'

    def _track_changes(self, instance, old_data, new_data, actor_name):
        field_labels = {
            'name': 'Tên phúc lợi',
            'benefit_type': 'Loại phúc lợi',
            'scope': 'Phạm vi áp dụng',
            'cycle': 'Chu kỳ áp dụng',
            'effective_from': 'Hiệu lực từ',
            'effective_to': 'Hiệu lực đến',
            'value': 'Giá trị phúc lợi',
            'value_unit': 'Đơn vị',
            'status': 'Trạng thái',
        }
        for field, label in field_labels.items():
            old_val = str(old_data.get(field, ''))
            new_val = str(new_data.get(field, ''))
            if old_val != new_val:
                BenefitHistory.objects.create(
                    benefit=instance,
                    actor_name=actor_name,
                    action=f'Cập nhật {label}',
                    field_name=field,
                    old_value=old_val,
                    new_value=new_val,
                )

    def create(self, validated_data):
        code = validated_data.pop('code', '').strip()
        actor_name = validated_data.pop('created_by_name', '')

        benefit = Benefit.objects.create(
            code=code or self._auto_code(),
            created_by_name=actor_name,
            **validated_data,
        )

        BenefitHistory.objects.create(
            benefit=benefit,
            actor_name=actor_name,
            action=f'Thêm mới phúc lợi {benefit.code}',
        )

        return benefit

    def update(self, instance, validated_data):
        old_data = {
            'name': instance.name,
            'benefit_type': instance.benefit_type,
            'scope': instance.scope,
            'cycle': instance.cycle,
            'effective_from': str(instance.effective_from) if instance.effective_from else '',
            'effective_to': str(instance.effective_to) if instance.effective_to else '',
            'value': str(instance.value),
            'value_unit': instance.value_unit,
            'status': instance.status,
        }

        actor_name = validated_data.pop('created_by_name', '')
        validated_data.pop('code', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        new_data = {
            'name': instance.name,
            'benefit_type': instance.benefit_type,
            'scope': instance.scope,
            'cycle': instance.cycle,
            'effective_from': str(instance.effective_from) if instance.effective_from else '',
            'effective_to': str(instance.effective_to) if instance.effective_to else '',
            'value': str(instance.value),
            'value_unit': instance.value_unit,
            'status': instance.status,
        }

        self._track_changes(instance, old_data, new_data, actor_name)
        return instance


# ─── Payroll History Serializer ──────────────────────────────────────────────

class PayrollHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollHistory
        fields = ['id', 'timestamp', 'actor_name', 'action', 'field_name', 'old_value', 'new_value']


# ─── PayrollEmployee Read Serializer ─────────────────────────────────────────

class PayrollEmployeeSerializer(serializers.ModelSerializer):
    employee_id = serializers.IntegerField(source='employee.id', read_only=True)
    employee_code = serializers.CharField(source='employee.code', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_phone = serializers.CharField(source='employee.phone', read_only=True)
    employee_role = serializers.CharField(source='employee.role', read_only=True)
    employee_work_area = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    def get_employee_work_area(self, obj):
        return obj.employee.work_area.name if obj.employee.work_area else ''

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.employee.avatar:
            if request:
                return request.build_absolute_uri(obj.employee.avatar.url)
            return obj.employee.avatar.url
        return ''

    class Meta:
        model = PayrollEmployee
        fields = [
            'id', 'employee_id', 'employee_code', 'employee_name',
            'employee_phone', 'employee_role', 'employee_work_area', 'avatar_url',
            'base_salary', 'work_days', 'bonus_amount', 'benefit_amount',
            'net_salary', 'payment_status',
        ]


# ─── Payroll Read Serializer ──────────────────────────────────────────────────

class PayrollSerializer(serializers.ModelSerializer):
    employee_entries = PayrollEmployeeSerializer(many=True, read_only=True)
    history = PayrollHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Payroll
        fields = [
            'id', 'code', 'name', 'period', 'scope', 'notes', 'status',
            'total_amount', 'paid_amount',
            'employee_entries', 'history',
            'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Payroll Write Serializer ─────────────────────────────────────────────────

class PayrollWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=500)
    period = serializers.CharField(max_length=7)
    scope = serializers.ChoiceField(choices=['all', 'selected'], default='selected')
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    status = serializers.ChoiceField(
        choices=['draft', 'paying', 'paid', 'cancelled'], required=False, default='draft'
    )
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, default=list, allow_empty=True,
    )
    employee_data = serializers.ListField(
        child=serializers.DictField(), required=False, default=list, allow_empty=True,
    )

    def validate_name(self, value):
        qs = Payroll.objects.filter(name__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ten bang luong nay da duoc su dung.')
        return value.strip()

    def _auto_code(self):
        latest = Payroll.objects.filter(
            code__startswith='MBL', code__regex=r'^MBL\d{3,}$'
        ).order_by('-code').first()
        if not latest:
            return 'MBL001'
        try:
            last_num = int(latest.code[3:])
            return f'MBL{last_num + 1:03d}'
        except (ValueError, IndexError):
            count = Payroll.objects.filter(code__startswith='MBL').count()
            return f'MBL{count + 1:03d}'

    def _get_employees(self, scope, employee_ids):
        if scope == 'all':
            return list(Employee.objects.filter(status='working').order_by('id'))
        return list(Employee.objects.filter(id__in=employee_ids).order_by('id'))

    def _build_emp_data_map(self, employee_data_list):
        return {int(item.get('employee_id', 0)): item for item in employee_data_list if item.get('employee_id')}

    def create(self, validated_data):
        employee_ids = validated_data.pop('employee_ids', [])
        employee_data_list = validated_data.pop('employee_data', [])
        actor_name = validated_data.pop('created_by_name', '')

        payroll = Payroll.objects.create(
            code=self._auto_code(),
            created_by_name=actor_name,
            **validated_data,
        )

        employees = self._get_employees(payroll.scope, employee_ids)
        emp_data_map = self._build_emp_data_map(employee_data_list)

        total = 0
        for emp in employees:
            edata = emp_data_map.get(emp.id, {})
            base_salary = int(edata.get('base_salary', emp.salary_amount or 0))
            work_days = int(edata.get('work_days', 26))
            bonus_amount = int(edata.get('bonus_amount', 0))
            benefit_amount = int(edata.get('benefit_amount', emp.salary_allowance or 0))
            net_salary = base_salary + bonus_amount + benefit_amount

            PayrollEmployee.objects.create(
                payroll=payroll,
                employee=emp,
                base_salary=base_salary,
                work_days=work_days,
                bonus_amount=bonus_amount,
                benefit_amount=benefit_amount,
                net_salary=net_salary,
                payment_status='unpaid',
            )
            total += net_salary

        payroll.total_amount = total
        payroll.save()

        PayrollHistory.objects.create(
            payroll=payroll,
            actor_name=actor_name,
            action=f'Tao moi bang luong {payroll.code}',
        )

        return payroll

    def update(self, instance, validated_data):
        employee_ids = validated_data.pop('employee_ids', None)
        employee_data_list = validated_data.pop('employee_data', [])
        actor_name = validated_data.pop('created_by_name', '')

        old_status = instance.status

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if employee_ids is not None:
            scope = validated_data.get('scope', instance.scope)
            if scope == 'all':
                employees = self._get_employees('all', [])
                new_emp_ids = {e.id for e in employees}
            else:
                employees = self._get_employees('selected', employee_ids)
                new_emp_ids = {e.id for e in employees}

            existing = {pe.employee_id: pe for pe in instance.employee_entries.all()}

            # Remove employees no longer in the list
            for emp_id, pe in existing.items():
                if emp_id not in new_emp_ids:
                    pe.delete()

            # Add new employees
            for emp in employees:
                if emp.id not in existing:
                    PayrollEmployee.objects.create(
                        payroll=instance,
                        employee=emp,
                        base_salary=int(emp.salary_amount or 0),
                        work_days=26,
                        bonus_amount=0,
                        benefit_amount=int(emp.salary_allowance or 0),
                        net_salary=int(emp.salary_amount or 0) + int(emp.salary_allowance or 0),
                        payment_status='unpaid',
                    )

        # Update individual employee data (payment_status, salary overrides)
        if employee_data_list:
            emp_data_map = self._build_emp_data_map(employee_data_list)
            for pe in instance.employee_entries.all():
                edata = emp_data_map.get(pe.employee_id, {})
                if not edata:
                    continue
                if 'payment_status' in edata:
                    pe.payment_status = edata['payment_status']
                if 'base_salary' in edata:
                    pe.base_salary = int(edata['base_salary'])
                if 'bonus_amount' in edata:
                    pe.bonus_amount = int(edata['bonus_amount'])
                if 'benefit_amount' in edata:
                    pe.benefit_amount = int(edata['benefit_amount'])
                pe.net_salary = int(pe.base_salary) + int(pe.bonus_amount) + int(pe.benefit_amount)
                pe.save()

        # Recalculate totals
        all_entries = list(instance.employee_entries.all())
        instance.total_amount = sum(pe.net_salary for pe in all_entries)
        instance.paid_amount = sum(pe.net_salary for pe in all_entries if pe.payment_status == 'paid')
        instance.save()

        # Audit trail
        if old_status != instance.status:
            PayrollHistory.objects.create(
                payroll=instance,
                actor_name=actor_name,
                action=f'Cap nhat trang thai thanh {instance.get_status_display()}',
                field_name='status',
                old_value=old_status,
                new_value=instance.status,
            )
        else:
            PayrollHistory.objects.create(
                payroll=instance,
                actor_name=actor_name,
                action='Cap nhat thong tin bang luong',
            )

        return instance


__all__ = [
    'BonusSerializer',
    'BonusWriteSerializer',
    'BonusHistorySerializer',
    'BenefitSerializer',
    'BenefitWriteSerializer',
    'BenefitHistorySerializer',
    'PayrollSerializer',
    'PayrollWriteSerializer',
    'PayrollHistorySerializer',
    'PayrollEmployeeSerializer',
]
