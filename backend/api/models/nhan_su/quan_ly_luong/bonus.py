from django.db import models


class Bonus(models.Model):
    """Model quản lý thưởng nhân viên - hỗ trợ thưởng nhiều nhân viên"""
    
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Chưa thanh toán'),
        (STATUS_PAID, 'Đã thanh toán'),
        (STATUS_CANCELLED, 'Đã hủy'),
    ]
    
    RECIPIENT_ALL = 'all'
    RECIPIENT_SELECTED = 'selected'
    RECIPIENT_CHOICES = [
        (RECIPIENT_ALL, 'Tất cả nhân viên'),
        (RECIPIENT_SELECTED, 'Tùy chọn'),
    ]
    
    BONUS_TYPE_DIRECT = 'direct'
    BONUS_TYPE_SALARY = 'salary'
    BONUS_TYPE_CHOICES = [
        (BONUS_TYPE_DIRECT, 'Thưởng trực tiếp'),
        (BONUS_TYPE_SALARY, 'Thưởng vào lương'),
    ]
    
    code = models.CharField(
        max_length=20, 
        unique=True, 
        verbose_name='Mã thưởng'
    )
    reason = models.CharField(
        max_length=500,
        verbose_name='Lý do thưởng'
    )
    bonus_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Ngày thưởng'
    )
    
    # Loại người nhận
    recipient_type = models.CharField(
        max_length=20,
        choices=RECIPIENT_CHOICES,
        default=RECIPIENT_SELECTED,
        verbose_name='Loại người nhận'
    )
    
    # Hình thức thưởng
    bonus_type = models.CharField(
        max_length=20,
        choices=BONUS_TYPE_CHOICES,
        default=BONUS_TYPE_DIRECT,
        verbose_name='Hình thức thưởng'
    )
    
    # Mức thưởng từng người
    amount_per_person = models.DecimalField(
        max_digits=15,
        decimal_places=0,
        default=0,
        verbose_name='Mức thưởng từng'
    )
    
    # Số lượng nhân viên được thưởng
    employee_count = models.IntegerField(
        default=0,
        verbose_name='Số lượng NV được thưởng'
    )
    
    # Tổng tiền thưởng
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=0,
        default=0,
        verbose_name='Tổng tiền thưởng'
    )
    
    # Danh sách nhân viên được thưởng (Many-to-Many)
    employees = models.ManyToManyField(
        'Employee',
        blank=True,
        related_name='bonuses',
        verbose_name='Nhân viên được thưởng'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Ghi chú'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        verbose_name='Trạng thái'
    )
    created_by_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Người tạo'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-id']
        verbose_name = 'Bonus'
        verbose_name_plural = 'Bonuses'
    
    def __str__(self):
        return f'{self.code} — {self.reason} — {self.employee_count} NV — {self.total_amount:,.0f}đ'
    
    def save(self, *args, **kwargs):
        # Auto calculate total_amount
        if self.amount_per_person and self.employee_count:
            self.total_amount = self.amount_per_person * self.employee_count
        super().save(*args, **kwargs)


class BonusHistory(models.Model):
    """Lịch sử thay đổi thông tin thưởng"""
    
    bonus = models.ForeignKey(
        Bonus,
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name='Thưởng'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Người thực hiện'
    )
    action = models.CharField(
        max_length=300,
        verbose_name='Hành động'
    )
    field_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Tên trường'
    )
    old_value = models.TextField(
        blank=True,
        verbose_name='Giá trị cũ'
    )
    new_value = models.TextField(
        blank=True,
        verbose_name='Giá trị mới'
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'BonusHistory'
        verbose_name_plural = 'BonusHistories'
    
    def __str__(self):
        return f'{self.bonus.code} — {self.action}'


__all__ = ['Bonus', 'BonusHistory']
