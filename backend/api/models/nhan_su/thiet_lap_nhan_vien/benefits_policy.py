from django.db import models


class BenefitsPolicy(models.Model):
    """Chính sách phúc lợi"""
    code = models.CharField(max_length=20, unique=True, verbose_name='Mã chính sách')
    name = models.CharField(max_length=200, verbose_name='Tên chính sách')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']
        verbose_name = 'BenefitsPolicy'

    def __str__(self):
        return f'{self.code} — {self.name}'


__all__ = ['BenefitsPolicy']
