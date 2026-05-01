from django.db import models


class Product(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Đang hoạt động'),
        (STATUS_INACTIVE, 'Tạm ngưng'),
    ]

    code             = models.CharField(max_length=20, unique=True, verbose_name='Mã SP')
    name             = models.CharField(max_length=200, verbose_name='Tên sản phẩm')
    group            = models.ForeignKey(
        'ProductGroup',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name='Nhóm SP',
    )
    unit             = models.CharField(max_length=50,  verbose_name='ĐVT')
    quantity         = models.IntegerField(default=0, verbose_name='Số lượng tồn kho')
    price            = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='Giá bán')
    cost_price       = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name='Giá vốn')
    compare_price    = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name='Giá so sánh')
    description      = models.TextField(blank=True, verbose_name='Mô tả sản phẩm')
    production_notes = models.TextField(blank=True, verbose_name='Ghi chú sản xuất')
    notes            = models.TextField(blank=True, verbose_name='Ghi chú')
    image            = models.ImageField(upload_to='products/', blank=True, verbose_name='Ảnh sản phẩm')
    status           = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name='Trạng thái',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'Product'

    def __str__(self):
        return f'{self.code} — {self.name}'
