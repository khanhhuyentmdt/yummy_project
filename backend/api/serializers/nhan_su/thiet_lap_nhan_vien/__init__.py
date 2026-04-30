from rest_framework import serializers
from api.models import (
    Employee, EmployeeHistory,
    SalaryType, BenefitsPolicy,
    Province, District, Ward,
)


# ─── Vietnam Location Serializers ────────────────────────────────────────────

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ['code', 'name', 'full_name', 'code_name']


class DistrictSerializer(serializers.ModelSerializer):
    province_code = serializers.CharField(source='province.code', read_only=True)
    province_name = serializers.CharField(source='province.name', read_only=True)
    
    class Meta:
        model = District
        fields = ['code', 'name', 'full_name', 'code_name', 'province_code', 'province_name']


class WardSerializer(serializers.ModelSerializer):
    district_code = serializers.CharField(source='district.code', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    province_code = serializers.CharField(source='district.province.code', read_only=True)
    
    class Meta:
        model = Ward
        fields = ['code', 'name', 'full_name', 'code_name', 'district_code', 'district_name', 'province_code']


# ─── Salary & Benefits Serializers ───────────────────────────────────────────

class SalaryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryType
        fields = ['id', 'code', 'name', 'description', 'is_active']


class BenefitsPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = BenefitsPolicy
        fields = ['id', 'code', 'name', 'description', 'is_active']


# ─── Employee Serializers ────────────────────────────────────────────────────

class EmployeeHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = EmployeeHistory
        fields = ['id', 'timestamp', 'actor_name', 'action', 'field_name', 'old_value', 'new_value']


class EmployeeSerializer(serializers.ModelSerializer):
    work_area_id   = serializers.IntegerField(source='work_area.id', read_only=True, allow_null=True)
    work_area_name = serializers.SerializerMethodField()
    avatar_url     = serializers.SerializerMethodField()
    contract_image_url = serializers.SerializerMethodField()
    history        = EmployeeHistorySerializer(many=True, read_only=True)
    
    # Salary & Benefits
    salary_type_id = serializers.IntegerField(source='salary_type.id', read_only=True, allow_null=True)
    salary_type_name = serializers.CharField(source='salary_type.name', read_only=True, allow_null=True)
    benefits_list  = BenefitsPolicySerializer(source='benefits', many=True, read_only=True)
    
    # Vietnam Location Names
    province_name = serializers.SerializerMethodField()
    district_name = serializers.SerializerMethodField()
    ward_name = serializers.SerializerMethodField()

    def get_work_area_name(self, obj):
        return obj.work_area.name if obj.work_area else ''

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return ''

    def get_contract_image_url(self, obj):
        request = self.context.get('request')
        if obj.contract_image:
            if request:
                return request.build_absolute_uri(obj.contract_image.url)
            return obj.contract_image.url
        return ''
    
    def get_province_name(self, obj):
        if obj.province_code:
            try:
                province = Province.objects.get(code=obj.province_code)
                return province.name
            except Province.DoesNotExist:
                pass
        return obj.province  # Fallback to old field
    
    def get_district_name(self, obj):
        if obj.district_code:
            try:
                district = District.objects.get(code=obj.district_code)
                return district.name
            except District.DoesNotExist:
                pass
        return obj.district  # Fallback to old field
    
    def get_ward_name(self, obj):
        if obj.ward_code:
            try:
                ward = Ward.objects.get(code=obj.ward_code)
                return ward.name
            except Ward.DoesNotExist:
                pass
        return obj.ward  # Fallback to old field

    class Meta:
        model  = Employee
        fields = [
            'id', 'code', 'full_name', 'phone',
            'work_area_id', 'work_area_name',
            'role', 'shift', 'start_date',
            'date_of_birth', 'gender',
            'id_number', 'email',
            'address',
            'province_code', 'district_code', 'ward_code',
            'province', 'district', 'ward',
            'province_name', 'district_name', 'ward_name',
            'avatar_url', 'contract_image_url',
            'notes',
            'has_salary_info', 'salary_type_id', 'salary_type_name', 'salary_amount',
            'salary_base', 'salary_allowance',
            'benefits_list',
            'status', 'created_by_name', 'created_at', 'updated_at',
            'history',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeWriteSerializer(serializers.Serializer):
    code             = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    full_name        = serializers.CharField(max_length=200)
    phone            = serializers.CharField(max_length=20)
    work_area_id     = serializers.IntegerField(required=False, allow_null=True)
    role             = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')
    shift            = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    start_date       = serializers.DateField(required=False, allow_null=True)
    date_of_birth    = serializers.DateField(required=False, allow_null=True)
    gender           = serializers.ChoiceField(
        choices=['male', 'female', 'other', ''], required=False, allow_blank=True, default=''
    )
    id_number        = serializers.CharField(max_length=30, required=False, allow_blank=True, default='')
    email            = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')
    address          = serializers.CharField(required=False, allow_blank=True, default='')
    
    # Vietnam Location codes
    province_code    = serializers.CharField(max_length=10, required=False, allow_blank=True, default='')
    district_code    = serializers.CharField(max_length=10, required=False, allow_blank=True, default='')
    ward_code        = serializers.CharField(max_length=10, required=False, allow_blank=True, default='')
    
    # Keep old fields for compatibility
    province         = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    district         = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    ward             = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    
    notes            = serializers.CharField(required=False, allow_blank=True, default='')
    
    # Salary & Benefits
    has_salary_info  = serializers.BooleanField(required=False, default=False, allow_null=True)
    salary_type_id   = serializers.IntegerField(required=False, allow_null=True)
    salary_amount    = serializers.DecimalField(max_digits=15, decimal_places=0, required=False, default=0, allow_null=True)
    benefits_ids     = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
        allow_empty=True,
    )
    
    # Keep old salary fields for compatibility
    salary_base      = serializers.DecimalField(max_digits=15, decimal_places=0, required=False, default=0)
    salary_allowance = serializers.DecimalField(max_digits=15, decimal_places=0, required=False, default=0)
    
    status           = serializers.ChoiceField(choices=['working', 'stopped'], required=False, default='working')
    avatar           = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)
    contract_image   = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)

    def validate_phone(self, value):
        qs = Employee.objects.filter(phone=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('So dien thoai nay da duoc su dung.')
        return value

    def validate_email(self, value):
        if not value:
            return value
        qs = Employee.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Email nay da duoc su dung.')
        return value

    def _get_work_area(self, work_area_id):
        if not work_area_id:
            return None
        from api.models import Location
        try:
            return Location.objects.get(pk=work_area_id)
        except Location.DoesNotExist:
            return None
    
    def _get_salary_type(self, salary_type_id):
        if not salary_type_id:
            return None
        try:
            return SalaryType.objects.get(pk=salary_type_id)
        except SalaryType.DoesNotExist:
            return None

    def _auto_code(self):
        """Generate sequential code MNV001, MNV002, etc."""
        from django.db.models import Max
        from django.db.models.functions import Cast, Substr
        from django.db.models import IntegerField
        
        # Get all codes that start with 'MNV' and extract the numeric part
        latest = Employee.objects.filter(
            code__startswith='MNV',
            code__regex=r'^MNV\d{3}$'
        ).order_by('-code').first()
        
        if not latest:
            return 'MNV001'
        
        try:
            # Extract number from code like 'MNV004'
            last_num = int(latest.code[3:])
            new_num = last_num + 1
            return f'MNV{new_num:03d}'
        except (ValueError, IndexError):
            # Fallback: count all employees and add 1
            count = Employee.objects.filter(code__startswith='MNV').count()
            return f'MNV{count + 1:03d}'
    
    def _track_changes(self, instance, old_data, new_data, actor_name):
        """Track field changes for audit trail"""
        changes = []
        field_labels = {
            'full_name': 'Họ và tên',
            'phone': 'Số điện thoại',
            'role': 'Vai trò',
            'shift': 'Ca làm việc',
            'salary_amount': 'Mức lương',
            'province_code': 'Tỉnh/Thành phố',
            'district_code': 'Quận/Huyện',
            'ward_code': 'Phường/Xã',
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
            EmployeeHistory.objects.create(
                employee=instance,
                actor_name=actor_name,
                action=f'Cập nhật {change["field_label"]}',
                field_name=change['field_name'],
                old_value=change['old_value'],
                new_value=change['new_value'],
            )

    def create(self, validated_data):
        work_area_id = validated_data.pop('work_area_id', None)
        salary_type_id = validated_data.pop('salary_type_id', None)
        benefits_ids = validated_data.pop('benefits_ids', [])
        code = validated_data.pop('code', '').strip()
        
        employee = Employee.objects.create(
            code=code or self._auto_code(),
            work_area=self._get_work_area(work_area_id),
            salary_type=self._get_salary_type(salary_type_id),
            **validated_data,
        )
        
        # Set benefits
        if benefits_ids:
            benefits = BenefitsPolicy.objects.filter(id__in=benefits_ids)
            employee.benefits.set(benefits)
        
        # Create history entry
        EmployeeHistory.objects.create(
            employee=employee,
            actor_name=validated_data.get('created_by_name', ''),
            action='Tạo mới hồ sơ nhân viên',
        )
        
        return employee

    def update(self, instance, validated_data):
        # Capture old data for audit trail
        old_data = {
            'full_name': instance.full_name,
            'phone': instance.phone,
            'role': instance.role,
            'shift': instance.shift,
            'salary_amount': instance.salary_amount,
            'province_code': instance.province_code,
            'district_code': instance.district_code,
            'ward_code': instance.ward_code,
        }
        
        work_area_id = validated_data.pop('work_area_id', -1)
        salary_type_id = validated_data.pop('salary_type_id', -1)
        benefits_ids = validated_data.pop('benefits_ids', None)
        
        if work_area_id != -1:
            instance.work_area = self._get_work_area(work_area_id)
        
        if salary_type_id != -1:
            instance.salary_type = self._get_salary_type(salary_type_id)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update benefits
        if benefits_ids is not None:
            benefits = BenefitsPolicy.objects.filter(id__in=benefits_ids)
            instance.benefits.set(benefits)
        
        # Track changes
        new_data = {
            'full_name': instance.full_name,
            'phone': instance.phone,
            'role': instance.role,
            'shift': instance.shift,
            'salary_amount': instance.salary_amount,
            'province_code': instance.province_code,
            'district_code': instance.district_code,
            'ward_code': instance.ward_code,
        }
        
        actor_name = validated_data.get('created_by_name', '')
        self._track_changes(instance, old_data, new_data, actor_name)
        
        return instance


__all__ = [
    'ProvinceSerializer',
    'DistrictSerializer',
    'WardSerializer',
    'SalaryTypeSerializer',
    'BenefitsPolicySerializer',
    'EmployeeSerializer',
    'EmployeeWriteSerializer',
    'EmployeeHistorySerializer',
]
