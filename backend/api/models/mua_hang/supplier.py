from django.db import models


class Supplier(models.Model):
    name    = models.CharField(max_length=200, verbose_name='Ten nha cung cap')
    phone   = models.CharField(max_length=20,  blank=True, verbose_name='So dien thoai')
    address = models.TextField(blank=True, verbose_name='Dia chi')
    status  = models.CharField(
        max_length=20,
        choices=[('active', 'Dang hoat dong'), ('inactive', 'Tam ngung')],
        default='active',
        verbose_name='Trang thai',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['name']
        verbose_name = 'Supplier'

    def __str__(self):
        return self.name
