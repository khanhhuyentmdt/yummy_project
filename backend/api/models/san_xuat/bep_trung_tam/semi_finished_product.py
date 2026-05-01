from django.db import models


class SemiFinishedProduct(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Đang hoạt động'),
        (STATUS_INACTIVE, 'Tạm ngưng'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Mã BTP')
    name = models.CharField(max_length=200, verbose_name='Tên bán thành phẩm')
    group = models.CharField(max_length=100, blank=True, default='', verbose_name='Nhóm BTP')
    unit = models.CharField(max_length=50, verbose_name='ĐVT')
    quantity = models.IntegerField(default=0, verbose_name='Số lượng tồn kho')
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Giá điều chuyển')
    cost_price = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name='Giá vốn')
    compare_price = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name='Giá so sánh')
    description = models.TextField(blank=True, verbose_name='Mô tả bán thành phẩm')
    production_notes = models.TextField(blank=True, verbose_name='Ghi chú sản xuất')
    notes = models.TextField(blank=True, verbose_name='Ghi chú')
    image = models.ImageField(upload_to='semi_finished_products/', blank=True, verbose_name='Ảnh bán thành phẩm')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name='Trạng thái',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Semi Finished Product'
        verbose_name_plural = 'Semi Finished Products'

    def __str__(self):
        return f'{self.code} — {self.name}'
