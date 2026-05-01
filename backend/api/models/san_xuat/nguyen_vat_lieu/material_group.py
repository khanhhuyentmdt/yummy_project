from django.db import models


class MaterialGroup(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Đang hoạt động'),
        (STATUS_INACTIVE, 'Tạm ngưng'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Mã nhóm')
    name = models.CharField(max_length=200, verbose_name='Tên nhóm nguyên vật liệu')
    description = models.TextField(blank=True, verbose_name='Mô tả')
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
        verbose_name = 'Material Group'
        verbose_name_plural = 'Material Groups'

    def __str__(self):
        return f'{self.code} — {self.name}'
