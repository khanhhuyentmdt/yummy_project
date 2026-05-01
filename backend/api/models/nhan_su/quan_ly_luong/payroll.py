from django.db import models


class Payroll(models.Model):
    """Bang luong thang"""

    STATUS_DRAFT = 'draft'
    STATUS_PAYING = 'paying'
    STATUS_PAID = 'paid'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Luu nhap'),
        (STATUS_PAYING, 'Dang thanh toan'),
        (STATUS_PAID, 'Da thanh toan'),
        (STATUS_CANCELLED, 'Da huy'),
    ]

    SCOPE_ALL = 'all'
    SCOPE_SELECTED = 'selected'
    SCOPE_CHOICES = [
        (SCOPE_ALL, 'Tat ca nhan vien'),
        (SCOPE_SELECTED, 'Tuy chon'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Ma bang luong')
    name = models.CharField(max_length=500, unique=True, verbose_name='Ten bang luong')
    period = models.CharField(max_length=7, verbose_name='Ky tinh luong')  # MM/YYYY
    scope = models.CharField(
        max_length=20, choices=SCOPE_CHOICES, default=SCOPE_SELECTED,
        verbose_name='Pham vi ap dung',
    )
    notes = models.TextField(blank=True, verbose_name='Ghi chu')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT,
        verbose_name='Trang thai',
    )
    total_amount = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, verbose_name='Tong luong',
    )
    paid_amount = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, verbose_name='Da tra',
    )
    created_by_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi tao')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Payroll'
        verbose_name_plural = 'Payrolls'

    def __str__(self):
        return f'{self.code} - {self.name}'


class PayrollEmployee(models.Model):
    """Chi tiet nhan vien trong bang luong"""

    PAYMENT_UNPAID = 'unpaid'
    PAYMENT_PAID = 'paid'
    PAYMENT_CHOICES = [
        (PAYMENT_UNPAID, 'Chua thanh toan'),
        (PAYMENT_PAID, 'Da thanh toan'),
    ]

    payroll = models.ForeignKey(
        Payroll, on_delete=models.CASCADE, related_name='employee_entries',
        verbose_name='Bang luong',
    )
    employee = models.ForeignKey(
        'Employee', on_delete=models.CASCADE, related_name='payroll_entries',
        verbose_name='Nhan vien',
    )
    base_salary = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, verbose_name='Luong co ban',
    )
    work_days = models.IntegerField(default=26, verbose_name='Ngay cong')
    bonus_amount = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, verbose_name='Thuong',
    )
    benefit_amount = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, verbose_name='Phuc loi',
    )
    net_salary = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, verbose_name='Luong thuc nhan',
    )
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_CHOICES, default=PAYMENT_UNPAID,
        verbose_name='Trang thai thanh toan',
    )

    class Meta:
        ordering = ['id']
        verbose_name = 'PayrollEmployee'
        verbose_name_plural = 'PayrollEmployees'
        unique_together = [('payroll', 'employee')]

    def __str__(self):
        return f'{self.payroll.code} - {self.employee.full_name}'


class PayrollHistory(models.Model):
    """Lich su thay doi bang luong"""

    payroll = models.ForeignKey(
        Payroll, on_delete=models.CASCADE, related_name='history',
        verbose_name='Bang luong',
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(max_length=200, blank=True, verbose_name='Nguoi thuc hien')
    action = models.CharField(max_length=300, verbose_name='Hanh dong')
    field_name = models.CharField(max_length=100, blank=True, verbose_name='Ten truong')
    old_value = models.TextField(blank=True, verbose_name='Gia tri cu')
    new_value = models.TextField(blank=True, verbose_name='Gia tri moi')

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'PayrollHistory'
        verbose_name_plural = 'PayrollHistories'

    def __str__(self):
        return f'{self.payroll.code} - {self.action}'


__all__ = ['Payroll', 'PayrollEmployee', 'PayrollHistory']
