from django.db import models


class Material(models.Model):
    STATUS_ACTIVE   = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES  = [
        (STATUS_ACTIVE,   'Đang hoạt động'),
        (STATUS_INACTIVE, 'Tạm ngưng'),
    ]

    code   = models.CharField(max_length=20, unique=True, verbose_name='Mã NVL')
    name   = models.CharField(max_length=200, verbose_name='Tên NVL')
    group  = models.CharField(max_length=100, verbose_name='Nhóm NVL')
    unit   = models.CharField(max_length=50,  verbose_name='Đơn vị tính')
    image            = models.ImageField(upload_to='materials/', blank=True, verbose_name='Hình ảnh')
    notes            = models.TextField(blank=True, verbose_name='Ghi chu')
    batch_management = models.BooleanField(default=False, verbose_name='Quan ly theo lo HSD')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name='Trạng thái',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['-id']
        verbose_name = 'Material'

    def __str__(self):
        return f'{self.code} — {self.name}'
