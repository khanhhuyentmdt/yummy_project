from django.db import models


class Employee(models.Model):
    STATUS_WORKING = 'working'
    STATUS_STOPPED = 'stopped'
    STATUS_CHOICES = [
        (STATUS_WORKING, 'Dang lam viec'),
        (STATUS_STOPPED, 'Ngung lam viec'),
    ]

    GENDER_MALE   = 'male'
    GENDER_FEMALE = 'female'
    GENDER_OTHER  = 'other'
    GENDER_CHOICES = [
        (GENDER_MALE,   'Nam'),
        (GENDER_FEMALE, 'Nu'),
        (GENDER_OTHER,  'Khac'),
    ]

    code          = models.CharField(max_length=20, unique=True, verbose_name='Ma nhan vien')
    full_name     = models.CharField(max_length=200, verbose_name='Ho va ten')
    phone         = models.CharField(max_length=20, unique=True, verbose_name='So dien thoai')
    work_area     = models.ForeignKey(
        'Location',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='employees',
        verbose_name='Khu vuc lam viec',
    )
    role          = models.CharField(max_length=200, blank=True, verbose_name='Vai tro')
    shift         = models.CharField(max_length=100, blank=True, verbose_name='Ca lam viec')
    start_date    = models.DateField(null=True, blank=True, verbose_name='Ngay vao lam')
    date_of_birth = models.DateField(null=True, blank=True, verbose_name='Ngay sinh')
    gender        = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, verbose_name='Gioi tinh')
    id_number     = models.CharField(max_length=30, blank=True, verbose_name='So CMND/CCCD')
    email         = models.CharField(max_length=200, blank=True, verbose_name='Email')
    address       = models.TextField(blank=True, verbose_name='Dia chi')
    
    # Địa lý Việt Nam - sẽ lưu code của tỉnh/quận/phường
    province_code = models.CharField(max_length=10, blank=True, verbose_name='Ma tinh thanh pho')
    district_code = models.CharField(max_length=10, blank=True, verbose_name='Ma quan huyen')
    ward_code     = models.CharField(max_length=10, blank=True, verbose_name='Ma phuong xa')
    
    # Giữ lại các trường cũ để tương thích
    province      = models.CharField(max_length=100, blank=True, verbose_name='Tinh thanh pho')
    district      = models.CharField(max_length=100, blank=True, verbose_name='Quan huyen')
    ward          = models.CharField(max_length=100, blank=True, verbose_name='Phuong xa')
    
    avatar        = models.ImageField(upload_to='employees/avatars/', null=True, blank=True)
    contract_image = models.ImageField(upload_to='employees/contracts/', null=True, blank=True)
    notes         = models.TextField(blank=True, verbose_name='Ghi chu')
    
    # Lương thưởng
    has_salary_info = models.BooleanField(default=False, verbose_name='Co thong tin luong')
    salary_type   = models.ForeignKey(
        'SalaryType',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='employees',
        verbose_name='Loai luong',
    )
    salary_amount = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, 
        verbose_name='Muc luong'
    )
    
    # Giữ lại các trường cũ để tương thích
    salary_base   = models.DecimalField(max_digits=15, decimal_places=0, default=0, verbose_name='Luong co ban')
    salary_allowance = models.DecimalField(max_digits=15, decimal_places=0, default=0, verbose_name='Phu cap')
    
    # Phúc lợi (Many-to-Many)
    benefits      = models.ManyToManyField(
        'BenefitsPolicy',
        blank=True,
        related_name='employees',
        verbose_name='Phuc loi',
    )
    
    status        = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_WORKING,
        verbose_name='Trang thai',
    )
    created_by_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi tao')
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'Employee'

    def __str__(self):
        return f'{self.code} — {self.full_name}'


class EmployeeHistory(models.Model):
    employee   = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='history',
        verbose_name='Nhan vien',
    )
    timestamp  = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi thuc hien')
    action     = models.CharField(max_length=300, verbose_name='Hanh dong')
    field_name = models.CharField(max_length=100, blank=True, verbose_name='Ten truong')
    old_value  = models.TextField(blank=True, verbose_name='Gia tri cu')
    new_value  = models.TextField(blank=True, verbose_name='Gia tri moi')

    class Meta:
        ordering     = ['-timestamp']
        verbose_name = 'EmployeeHistory'

    def __str__(self):
        return f'{self.employee.code} — {self.action}'


__all__ = ['Employee', 'EmployeeHistory']
