from django.db import models


class Benefit(models.Model):
    """Model quan ly chinh sach phuc loi nhan vien"""

    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Đang hoạt động'),
        (STATUS_INACTIVE, 'Ngưng hoạt động'),
    ]

    BENEFIT_TYPE_CHOICES = [
        ('phu_cap', 'Phụ cấp'),
        ('chinh_sach', 'Chính sách'),
        ('van_hoa', 'Văn hoá'),
        ('khac', 'Khác'),
    ]

    SCOPE_CHOICES = [
        ('toan_cong_ty', 'Toàn công ty'),
        ('theo_vai_tro', 'Theo vai trò'),
        ('ca_nhan', 'Cá nhân'),
    ]

    CYCLE_CHOICES = [
        ('hang_ngay', 'Hàng ngày'),
        ('hang_thang', 'Hàng tháng'),
        ('hang_quy', 'Hàng quý'),
        ('hang_nam', 'Hàng năm'),
        ('ngay_le_tet', 'Ngày lễ, tết'),
        ('su_kien', 'Sự kiện'),
    ]

    VALUE_UNIT_CHOICES = [
        ('dong', 'đồng'),
        ('phan_tram', '%'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Mã phúc lợi')
    name = models.CharField(max_length=500, unique=True, verbose_name='Tên chính sách phúc lợi')
    benefit_type = models.CharField(
        max_length=30, choices=BENEFIT_TYPE_CHOICES, default='phu_cap',
        verbose_name='Loại phúc lợi',
    )
    scope = models.CharField(
        max_length=30, choices=SCOPE_CHOICES, default='toan_cong_ty',
        verbose_name='Phạm vi áp dụng',
    )
    cycle = models.CharField(
        max_length=30, choices=CYCLE_CHOICES, default='hang_thang',
        verbose_name='Chu kỳ áp dụng',
    )
    effective_from = models.DateField(null=True, blank=True, verbose_name='Hiệu lực từ')
    effective_to = models.DateField(null=True, blank=True, verbose_name='Hiệu lực đến')
    value = models.DecimalField(
        max_digits=15, decimal_places=0, default=0, verbose_name='Giá trị phúc lợi',
    )
    value_unit = models.CharField(
        max_length=20, choices=VALUE_UNIT_CHOICES, default='dong', verbose_name='Đơn vị',
    )
    attachment = models.FileField(
        upload_to='benefits/attachments/', null=True, blank=True,
        verbose_name='Đính kèm quyết định',
    )
    notes = models.TextField(blank=True, verbose_name='Ghi chú')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE,
        verbose_name='Trạng thái',
    )
    created_by_name = models.CharField(max_length=200, blank=True, verbose_name='Người tạo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Benefit'
        verbose_name_plural = 'Benefits'

    def __str__(self):
        return f'{self.code} — {self.name}'


class BenefitHistory(models.Model):
    """Lich su thay doi thong tin phuc loi"""

    benefit = models.ForeignKey(
        Benefit, on_delete=models.CASCADE, related_name='history',
        verbose_name='Phúc lợi',
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    actor_name = models.CharField(max_length=200, blank=True, verbose_name='Người thực hiện')
    action = models.CharField(max_length=300, verbose_name='Hành động')
    field_name = models.CharField(max_length=100, blank=True, verbose_name='Tên trường')
    old_value = models.TextField(blank=True, verbose_name='Giá trị cũ')
    new_value = models.TextField(blank=True, verbose_name='Giá trị mới')

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'BenefitHistory'
        verbose_name_plural = 'BenefitHistories'

    def __str__(self):
        return f'{self.benefit.code} — {self.action}'


__all__ = ['Benefit', 'BenefitHistory']
