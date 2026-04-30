from django.db import models


class SalaryType(models.Model):
    """Loại lương (Cố định, Theo giờ, Theo sản phẩm, v.v.)"""
    code = models.CharField(max_length=20, unique=True, verbose_name='Mã loại lương')
    name = models.CharField(max_length=200, verbose_name='Tên loại lương')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'SalaryType'

    def __str__(self):
        return f'{self.code} — {self.name}'


__all__ = ['SalaryType']
